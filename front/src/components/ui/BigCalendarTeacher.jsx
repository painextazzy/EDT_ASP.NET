import React, { useState, useRef, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, isValid } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Building, Loader2, X, Check } from 'lucide-react';
import api from '../../services/api';
import { authApi } from '../../services/auth';
import { startConnection, onPlanningNotification } from '../../services/signalRService';

// ----- MODAL DE CONFIRMATION DE FIN -----
const CompleteModal = ({ isOpen, event, onConfirm, onClose }) => {
  if (!isOpen || !event) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-outline-variant p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Terminer le cours</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-1">Vous allez marquer comme terminé : <span className="font-semibold text-slate-800">{event.title}</span></p>
          <p className="text-xs text-slate-500">
            {formatInTimeZone(event.start, 'UTC', 'EEEE d MMMM yyyy à HH:mm', { locale: fr })} - {formatInTimeZone(event.end, 'UTC', 'HH:mm', { locale: fr })}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">Retour</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition shadow-sm">Confirmer</button>
        </div>
      </div>
    </div>
  );
};

// ----- MODAL D'ANNULATION AVEC MOTIF -----
const CancelModal = ({ isOpen, event, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  useEffect(() => { if (isOpen) setReason(''); }, [isOpen]);
  if (!isOpen || !event) return null;
  const handleConfirm = () => {
    if (!reason.trim()) { alert('Veuillez saisir un motif.'); return; }
    onConfirm(event, reason);
  };
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-outline-variant p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Annulation de cours</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-1">Vous allez annuler : <span className="font-semibold text-slate-800">{event.title}</span></p>
          <p className="text-xs text-slate-500">
            {formatInTimeZone(event.start, 'UTC', 'EEEE d MMMM yyyy à HH:mm', { locale: fr })} - {formatInTimeZone(event.end, 'UTC', 'HH:mm', { locale: fr })}
          </p>
        </div>
        <div className="mb-4">
          <label htmlFor="cancelReason" className="block text-sm font-medium text-slate-700 mb-1">Motif d'annulation <span className="text-red-500">*</span></label>
          <textarea id="cancelReason" rows="3" className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Veuillez indiquer la raison..." value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">Retour</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm">Confirmer</button>
        </div>
      </div>
    </div>
  );
};

// ----- MODAL D'ACTIONS -----
const ActionModal = ({ isOpen, event, onClose, onComplete, onCancel }) => {
  if (!isOpen || !event) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-outline-variant p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Actions</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-600 mb-4">Que souhaitez-vous faire pour <span className="font-semibold">{event.title}</span> ?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onComplete} className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition shadow-sm flex items-center gap-1"><Check className="w-4 h-4" /> Terminer</button>
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm flex items-center gap-1"><X className="w-4 h-4" /> Annuler</button>
        </div>
      </div>
    </div>
  );
};

// ----- COMPOSANT PRINCIPAL -----
const BigCalendarTeacher = ({
  currentDate: externalDate,
  view: externalView,
  onDateChange,
  onViewChange,
  onPlanningChange,
}) => {
  // ---- Sécurité date ----
  const safeDate = (date) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isValid(d) ? d : new Date();
  };

  const [internalDate, setInternalDate] = useState(safeDate(externalDate));

  useEffect(() => {
    if (externalDate && isValid(new Date(externalDate))) {
      setInternalDate(new Date(externalDate));
    }
  }, [externalDate]);

  // ---- États ----
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enseignantId, setEnseignantId] = useState(null);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const notificationTimeoutRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ---- Couleurs ----
  const eventColors = {
    Cours: { bg: 'bg-[#fcd34d]/20', border: 'border-[#fcd34d]', text: 'text-[#b45309]', timeText: 'text-[#b45309]', dot: 'bg-[#fbbf24]', lightBg: 'bg-[#fcd34d]/30' },
    Examen: { bg: 'bg-[#a855f7]/20', border: 'border-[#a855f7]', text: 'text-[#6b21a8]', timeText: 'text-[#6b21a8]', dot: 'bg-[#8b5cf6]', lightBg: 'bg-[#a855f7]/30' },
    Soutenance: { bg: 'bg-[#4ade80]/20', border: 'border-[#4ade80]', text: 'text-[#15803d]', timeText: 'text-[#15803d]', dot: 'bg-[#22c55e]', lightBg: 'bg-[#4ade80]/30' },
  };
  const getEventColors = (type) => eventColors[type] || eventColors.Cours;
  const getEventTypeLabel = (type) => (type === 'Soutenance' ? 'Présentation' : type || 'Cours');

  // ---- Format UTC ----
  const formatUTC = (date, pattern, options = {}) => {
    if (!date || !isValid(new Date(date))) return '';
    return formatInTimeZone(new Date(date), 'UTC', pattern, options);
  };

  // ---- Chargement initial ----
  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        setLoading(true);
        const userData = authApi.getUser();
        if (!userData || !userData.id) {
          setError('Utilisateur non connecté');
          setLoading(false);
          return;
        }
        setUser(userData);

        const enseignantsResponse = await api.enseignant.getValides();
        let enseignants = [];
        if (Array.isArray(enseignantsResponse)) {
          enseignants = enseignantsResponse;
        } else if (enseignantsResponse?.success) {
          enseignants = enseignantsResponse.data || [];
        }
        const enseignant = enseignants.find(e => e.id_utilisateur === userData.id || e.email === userData.email);
        if (!enseignant) {
          setError('Aucun enseignant associé');
          setLoading(false);
          return;
        }
        setEnseignantId(enseignant.id);
        await loadEvents(enseignant.id);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erreur');
      } finally {
        setLoading(false);
      }
    };
    loadUserAndData();
  }, []);

  // ---- Chargement des événements (UTC) avec recherche du délégué ----
  const loadEvents = async (enseignantIdParam) => {
    const id = enseignantIdParam || enseignantId;
    if (!id) return;
    try {
      const response = await api.planning.getByEnseignant(id);
      let plannings = [];
      if (response?.success && Array.isArray(response.data)) {
        plannings = response.data;
      } else if (Array.isArray(response)) {
        plannings = response;
      }

      // ---- LOG pour voir la structure (à supprimer en production) ----
      if (plannings.length > 0) {
        console.log('🔍 Structure du premier planning :', JSON.stringify(plannings[0], null, 2));
      }

      const formatted = plannings
        .filter(p => p.dateDebut && p.dateFin && p.statut === 'Actif')
        .map(p => {
          const start = new Date(p.dateDebut + 'Z');
          const end = new Date(p.dateFin + 'Z');

          // ---- RECHERCHE DU DÉLÉGUÉ (multi‑chemins) ----
          let delegue = null;
          if (p.delegue) {
            delegue = p.delegue;
          } else if (p.enseignement?.niveau?.delegue) {
            delegue = p.enseignement.niveau.delegue;
          } else if (p.enseignement?.delegue) {
            delegue = p.enseignement.delegue;
          } else if (p.enseignement?.niveau?.email_delegue) {
            delegue = { email: p.enseignement.niveau.email_delegue };
          } else if (p.enseignement?.niveau?.delegueEmail) {
            delegue = { email: p.enseignement.niveau.delegueEmail };
          }

          // Normalisation : si delegue est un objet sans email, on le nullifie
          if (delegue && typeof delegue === 'object' && !delegue.email) {
            delegue = null;
          }

          return {
            id: p.id,
            title: p.enseignement?.cours?.nom || p.coursNom || 'Cours',
            start,
            end,
            type: p.typeEvenement || 'Cours',
            niveau: p.enseignement?.niveau?.libelle || '',
            salles: p.salles || [],
            location: p.salles?.map(s => s.nom).join(', ') || '',
            enseignementId: p.idEnseignement,
            motifAnnulation: p.motifAnnulation,
            statut: p.statut,
            delegue: delegue, // ← on stocke le délégué trouvé
          };
        });
      setEvents(formatted);
      setError(null);
    } catch (err) {
      console.error(err);
      setEvents([]);
      setError(err.message || 'Erreur');
    }
  };

  const refreshEvents = () => { if (enseignantId) loadEvents(enseignantId); };

  const showNotification = (message, type) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ show: true, message, type });
    notificationTimeoutRef.current = setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const notifyParent = (payload) => {
    if (onPlanningChange) onPlanningChange(payload);
  };

  // ---- SignalR ----
  useEffect(() => {
    startConnection().catch(err => console.warn('⚠️ SignalR déjà en cours', err));
    const unsubscribe = onPlanningNotification((data) => {
      const currentUser = authApi.getUser();
      if (data?.userId && currentUser?.id && String(data.userId) !== String(currentUser.id)) return;
      if (data?.action === 'cancel') {
        setEvents(prev => prev.filter(e => String(e.id) !== String(data.planningId)));
        notifyParent({ action: 'cancel', planningId: data.planningId });
        showNotification(data.message || 'Cours annulé', 'success');
      } else if (data?.action === 'complete') {
        setEvents(prev => prev.map(e => String(e.id) === String(data.planningId) ? { ...e, statut: 'Termine' } : e));
        notifyParent({ action: 'complete', planningId: data.planningId });
        showNotification(data.message || 'Cours marqué comme terminé', 'success');
      } else if (data?.action === 'create' || data?.action === 'update') {
        if (enseignantId) loadEvents(enseignantId);
        notifyParent({ action: 'refresh' });
        showNotification(data.message || 'Mise à jour de votre planning', 'success');
      }
    });
    return () => unsubscribe();
  }, [enseignantId]);

  // ---- Navigation ----
  const handlePrevious = () => {
    const newDate = externalView === 'day' ? addDays(internalDate, -1) : subWeeks(internalDate, 1);
    setInternalDate(newDate);
    onDateChange(newDate);
  };
  const handleNext = () => {
    const newDate = externalView === 'day' ? addDays(internalDate, 1) : addWeeks(internalDate, 1);
    setInternalDate(newDate);
    onDateChange(newDate);
  };

  const getDisplayDays = () => {
    if (externalView === 'day') return [internalDate];
    const start = startOfWeek(internalDate, { weekStartsOn: 1 });
    const end = endOfWeek(internalDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).slice(0, 5);
  };

  const weekDays = getDisplayDays();
  const monthYear = format(internalDate, 'MMMM yyyy', { locale: fr });
  const dateRange = externalView === 'day'
    ? format(internalDate, 'dd MMM yyyy', { locale: fr })
    : `${format(weekDays[0], 'dd MMM', { locale: fr })} - ${format(weekDays[weekDays.length - 1], 'dd MMM yyyy', { locale: fr })}`;

  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const displayHours = hours;

  const filteredEvents = events.filter(e => e.statut !== 'Annule' && e.statut !== 'Termine');

  const getEventsForDay = (day) =>
    filteredEvents.filter(e => e.start && isSameDay(new Date(e.start), day));

  const getEventTop = (startDate) => {
    if (!startDate) return 0;
    const d = new Date(startDate);
    if (!isValid(d)) return 0;
    const hour = d.getUTCHours();
    const minute = d.getUTCMinutes();
    return (hour - 7) * 60 + (minute / 60) * 60;
  };

  const getEventHeight = (startDate, endDate) => {
    if (!startDate || !endDate) return 60;
    const s = new Date(startDate);
    let e = new Date(endDate);
    if (!isValid(s) || !isValid(e)) return 60;
    const maxEnd = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 18, 0, 0, 0));
    if (e > maxEnd) e = maxEnd;
    const diff = (e - s) / (1000 * 60);
    return Math.max(diff, 40);
  };

  // ---- Gestion des actions ----
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowActionModal(true);
  };

  const handleCompleteAction = () => {
    setShowActionModal(false);
    setShowCompleteModal(true);
  };

  const handleCancelAction = () => {
    setShowActionModal(false);
    setShowCancelModal(true);
  };

  const handleQuickComplete = (event) => {
    setSelectedEvent(event);
    setShowCompleteModal(true);
  };

  const handleQuickCancel = (event) => {
    setSelectedEvent(event);
    setShowCancelModal(true);
  };

  // ----- CONFIRMATION DE FIN (avec email au délégué) -----
  const confirmComplete = async () => {
    if (!selectedEvent) return;
    try {
      setUpdating(true);
      await api.planning.terminer(selectedEvent.id);
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, statut: 'Termine' } : e));

      const delegueEmail = selectedEvent.delegue?.email || null;

      if (delegueEmail) {
        const subject = `✅ Cours terminé : ${selectedEvent.title}`;
        const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
              .header { background-color: #2e7d32; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { padding: 20px; background-color: white; border-radius: 0 0 8px 8px; }
              .detail { margin: 8px 0; }
              .label { font-weight: bold; color: #555; }
              .footer { margin-top: 20px; font-size: 0.9em; color: #777; border-top: 1px solid #ddd; padding-top: 15px; text-align: center; }
              .mention { font-style: italic; color: #888; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin:0;">Cours terminé</h2>
              </div>
              <div class="content">
                <p>Bonjour,</p>
                <p>Nous vous informons que le cours suivant a été <strong>marqué comme terminé</strong> par l'enseignant :</p>
                <div class="detail"><span class="label">📚 Cours :</span> ${selectedEvent.title}</div>
                <div class="detail"><span class="label">📅 Date et heure (UTC) :</span> ${formatUTC(selectedEvent.start, 'EEEE d MMMM yyyy à HH:mm', { locale: fr })} - ${formatUTC(selectedEvent.end, 'HH:mm', { locale: fr })}</div>
                <div class="detail"><span class="label">📍 Salle(s) :</span> ${selectedEvent.salles?.map(s => s.nom || s).join(', ') || 'Non spécifiée'}</div>
                <p>Ce cours est désormais considéré comme achevé.</p>
                <div class="footer">
                  <p class="mention">Ceci est un message automatique. Merci de ne pas répondre à cet email.</p>
                  <p>© ${new Date().getFullYear()} - Service de gestion des emplois du temps</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        `;

        try {
          await api.email.sendTestEmail(delegueEmail, subject, htmlContent);
          console.log(`✅ Email de terminaison envoyé à ${delegueEmail}`);
          showNotification(`Cours terminé et email envoyé au délégué (${delegueEmail})`, 'success');
        } catch (emailErr) {
          console.error('❌ Erreur envoi email de terminaison:', emailErr);
          showNotification('Cours terminé, mais l\'email au délégué n\'a pas pu être envoyé.', 'error');
        }
      } else {
        console.log('ℹ️ Aucun délégué trouvé pour ce cours.');
        showNotification('Cours marqué comme terminé (aucun délégué trouvé).', 'success');
      }

      setShowCompleteModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // ----- CONFIRMATION D'ANNULATION (avec email au délégué) -----
  const confirmCancel = async (event, reason) => {
    if (!event) return;
    try {
      setUpdating(true);
      await api.planning.cancel(event.id, reason);
      setEvents(prev => prev.filter(e => e.id !== event.id));

      const delegueEmail = event.delegue?.email || null;

      if (delegueEmail) {
        const subject = `📢 Annulation du cours : ${event.title}`;
        const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }
              .header { background-color: #d32f2f; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { padding: 20px; background-color: white; border-radius: 0 0 8px 8px; }
              .detail { margin: 8px 0; }
              .label { font-weight: bold; color: #555; }
              .motif { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
              .footer { margin-top: 20px; font-size: 0.9em; color: #777; border-top: 1px solid #ddd; padding-top: 15px; text-align: center; }
              .mention { font-style: italic; color: #888; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin:0;">Annulation de cours</h2>
              </div>
              <div class="content">
                <p>Bonjour,</p>
                <p>Nous vous informons que le cours suivant a été <strong>annulé</strong> par l'enseignant :</p>
                <div class="detail"><span class="label">📚 Cours :</span> ${event.title}</div>
                <div class="detail"><span class="label">📅 Date et heure (UTC) :</span> ${formatUTC(event.start, 'EEEE d MMMM yyyy à HH:mm', { locale: fr })} - ${formatUTC(event.end, 'HH:mm', { locale: fr })}</div>
                <div class="detail"><span class="label">📍 Salle(s) :</span> ${event.salles?.map(s => s.nom || s).join(', ') || 'Non spécifiée'}</div>
                <div class="motif"><strong>📝 Motif d'annulation :</strong><br />${reason}</div>
                <p>Nous vous remercions de votre compréhension.</p>
                <div class="footer">
                  <p class="mention">Ceci est un message automatique. Merci de ne pas répondre à cet email.</p>
                  <p>© ${new Date().getFullYear()} - Service de gestion des emplois du temps</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        `;

        try {
          await api.email.sendTestEmail(delegueEmail, subject, htmlContent);
          console.log(`✅ Email envoyé à ${delegueEmail}`);
          showNotification(`Cours annulé et email envoyé au délégué (${delegueEmail})`, 'success');
        } catch (emailErr) {
          console.error('❌ Erreur envoi email:', emailErr);
          showNotification('Cours annulé, mais l\'email au délégué n\'a pas pu être envoyé.', 'error');
        }
      } else {
        console.log('ℹ️ Aucun délégué trouvé pour ce cours.');
        showNotification('Cours annulé (aucun délégué trouvé pour cette classe).', 'warning');
      }

      setShowCancelModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de l\'annulation', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedEvent(null);
  };

  // ---- Rendu ----
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-2xl">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Erreur</p>
          <p>{error}</p>
          <button onClick={refreshEvents} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          } min-w-[300px] max-w-md`}>
            <span className="text-lg">{notification.type === 'success' ? '✓' : '✗'}</span>
            <p className="text-sm font-medium">{notification.message}</p>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-[70px]">
              <span className="bg-gray-800 text-white text-[10px] font-semibold px-3 py-0.5 w-full text-center uppercase">
                {format(internalDate, 'MMM', { locale: fr })}
              </span>
              <span className="text-2xl font-bold text-gray-800 px-3 py-1">{format(internalDate, 'dd')}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                <span className="ml-2 text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button onClick={handlePrevious} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                  <span className="text-xs text-gray-500 px-2">{dateRange}</span>
                  <button onClick={handleNext} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => onViewChange('day')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${externalView === 'day' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Jours</button>
              <button onClick={() => onViewChange('week')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${externalView === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Semaine</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className={`grid ${externalView === 'day' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(5,1fr)]'} border-b border-gray-200 bg-gray-50/30`}>
          <div className="py-3"></div>
          {weekDays.map((day, idx) => (
            <div key={idx} className="py-3 text-center">
              <div className="text-sm font-medium text-gray-500">{format(day, 'EEE', { locale: fr }).charAt(0).toUpperCase() + format(day, 'EEE', { locale: fr }).slice(1)}</div>
              <div className="text-xl font-bold text-gray-800">{format(day, 'dd')}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="relative min-h-[720px]">
            <div className={`absolute inset-0 grid ${externalView === 'day' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(5,1fr)]'}`}>
              <div className="border-r border-gray-100 bg-white z-10"></div>
              {weekDays.map((_, idx) => <div key={idx} className="border-r border-gray-100" />)}
            </div>
            <div className="absolute inset-0 pointer-events-none">
              {hours.map((_, i) => <div key={i} className="calendar-grid-line" style={{ top: `${i * 60}px` }} />)}
            </div>
            <div className="absolute left-0 top-0 w-20 flex flex-col z-20 pointer-events-none">
              {displayHours.map((hour, idx) => (
                <div key={idx} className="h-[60px] flex justify-center items-start pt-2">
                  <span className="text-[11px] text-gray-400 font-medium">{hour}</span>
                </div>
              ))}
            </div>
            <div className={`grid ${externalView === 'day' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(5,1fr)]'} h-full relative z-10`}>
              <div className="col-start-1"></div>
              {weekDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={dayIdx} className="relative min-h-[720px]">
                    {dayEvents.map((event) => {
                      const colors = getEventColors(event.type);
                      const top = getEventTop(event.start);
                      const height = getEventHeight(event.start, event.end);
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 rounded-xl p-2.5 flex flex-col shadow-sm hover:shadow-md transition-all z-20 group cursor-pointer ${colors.bg} border ${colors.border}`}
                          style={{ top: `${top}px`, height: `${height}px`, minHeight: '55px' }}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex-1 flex flex-col pl-4 relative">
                            <div className="flex justify-between items-start gap-1">
                              <span className={`${colors.text} text-[11px] font-semibold truncate flex-1`}>
                                {event.title}
                              </span>
                              <span className={`${colors.timeText} text-[9px] flex-shrink-0`}>
                                {formatUTC(event.start, 'HH:mm')}
                                <span className="mx-0.5">-</span>
                                {formatUTC(event.end, 'HH:mm')}
                              </span>
                            </div>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-md self-start mt-0.5 ${colors.lightBg} ${colors.text} font-medium`}>
                              {getEventTypeLabel(event.type)}
                            </span>
                            {event.niveau && <span className="text-[9px] text-gray-600 mt-0.5">{event.niveau}</span>}
                            {event.salles && event.salles.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Building className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span className="text-[10px] font-medium text-blue-600 truncate">
                                  {event.salles.map(s => s.nom || s).join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Boutons d'action au survol */}
                            <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickComplete(event);
                                }}
                                className="p-1 bg-green-500 hover:bg-green-600 rounded-full text-white shadow-md transition-colors"
                                title="Terminer le cours"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickCancel(event);
                                }}
                                className="p-1 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-md transition-colors"
                                title="Annuler le cours"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* MODAUX D'ACTION */}
      <ActionModal isOpen={showActionModal} event={selectedEvent} onClose={closeActionModal} onComplete={handleCompleteAction} onCancel={handleCancelAction} />
      <CompleteModal isOpen={showCompleteModal} event={selectedEvent} onConfirm={confirmComplete} onClose={() => setShowCompleteModal(false)} />
      <CancelModal isOpen={showCancelModal} event={selectedEvent} onConfirm={confirmCancel} onClose={() => setShowCancelModal(false)} />

      <style>{`
        .calendar-grid-line { border-bottom: 1px dashed #e5e7eb; position: absolute; left: 0; right: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -100%); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default BigCalendarTeacher;