// src/components/admin/ShareModal.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Mail, Loader2, Check, AlertCircle, Users, Eye, Search, Send, ArrowLeft, Info } from 'lucide-react';
import api from '../../../services/api';
import { generateTimetableHTML } from '../../../utils/pdfGenerator';
import TimetablePreview from '../../../components/TimetablePreview';

const ShareModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [deleguesByNiveau, setDeleguesByNiveau] = useState({});
  const [selectedNiveaux, setSelectedNiveaux] = useState([]);
  const [allNiveaux, setAllNiveaux] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailContent, setEmailContent] = useState({
    subject: '📅 Votre emploi du temps',
    message: 'Voici votre emploi du temps pour cette semaine.',
  });

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Charger toutes les données à l'ouverture
  useEffect(() => {
    if (isOpen) loadAllData();
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const niveauxResponse = await api.niveau.getAll();
      let niveaux = niveauxResponse?.data || niveauxResponse || [];
      if (!Array.isArray(niveaux)) niveaux = [];
      setAllNiveaux(niveaux);

      const eventsResponse = await api.planning.getAll();
      let allEventsData = eventsResponse?.data || eventsResponse || [];
      if (!Array.isArray(allEventsData)) allEventsData = [];
      const formattedEvents = allEventsData.map(item => ({
        id: item.id,
        title: item.enseignement?.cours?.nom || item.typeEvenement || 'Cours',
        start: new Date(item.dateDebut),
        end: new Date(item.dateFin),
        type: item.typeEvenement,
        statut: item.statut,
        niveau: item.enseignement?.niveau?.libelle || '',
        salles: item.salles || [],
        location: item.salles?.map(s => s.nom).join(', ') || '',
        professeur: item.enseignement?.enseignant?.nom || '',
        enseignementId: item.idEnseignement,
      }));
      setAllEvents(formattedEvents);

      const deleguesResponse = await api.delegue.getAll();
      let allDelegues = deleguesResponse?.data || deleguesResponse || [];
      if (!Array.isArray(allDelegues)) allDelegues = [];
      const deleguesMap = {};
      for (const niveau of niveaux) {
        const deleguesDuNiveau = allDelegues.filter(d => d.idNiveau === niveau.id);
        if (deleguesDuNiveau.length > 0) deleguesMap[niveau.id] = deleguesDuNiveau;
      }
      setDeleguesByNiveau(deleguesMap);
      setSelectedNiveaux(Object.keys(deleguesMap).map(Number));
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const toggleNiveau = (niveauId) => {
    setSelectedNiveaux(prev =>
      prev.includes(niveauId) ? prev.filter(id => id !== niveauId) : [...prev, niveauId]
    );
  };

  const handleSelectAll = () => {
    const allIds = allNiveaux.map(n => n.id);
    if (selectedNiveaux.length === allIds.length) {
      setSelectedNiveaux([]);
    } else {
      setSelectedNiveaux(allIds);
    }
  };

  const getTotalDelegues = () => {
    let total = 0;
    selectedNiveaux.forEach(id => total += (deleguesByNiveau[id] || []).length);
    return total;
  };

  const handlePreview = (niveauId) => {
    const niveau = allNiveaux.find(n => n.id === niveauId);
    if (!niveau) return;
    const niveauEvents = allEvents.filter(e => e.niveau === niveau.libelle);
    setPreviewData({ niveauId, niveauLibelle: niveau.libelle, events: niveauEvents });
    setShowPreviewModal(true);
  };

  // Envoi des emails
  const sendEmailsToDelegues = async (niveauxData) => {
    let successCount = 0, errorCount = 0;
    const today = new Date();

    for (const niveauData of niveauxData) {
      const { delegues, niveauLibelle } = niveauData;

      for (const delegue of delegues) {
        const delegueEmail = delegue.emailDelegue || delegue.email;
        if (!delegueEmail) {
          console.warn('⚠️ Délégué sans email :', delegue);
          errorCount++;
          continue;
        }

        try {
          const niveauEvents = allEvents.filter(e => e.niveau === niveauLibelle);
          const fullHtml = generateTimetableHTML(
            niveauEvents,
            today,
            niveauLibelle,
            (type) => {
              const map = {
                Cours: 'emerald',
                Examen: 'red',
                Soutenance: 'red',
                TD: 'blue',
                TP: 'purple',
                Conférence: 'green',
                Atelier: 'yellow',
                Réunion: 'blue',
              };
              return map[type] || 'gray';
            },
            'CLASSE'
          );

          const emailBody = fullHtml.replace(
            '</body>',
            `
              <div class="mention">
                <p class="italic">Ceci est un message automatique. Merci de ne pas répondre à cet email.</p>
                <p>© ${new Date().getFullYear()} - Service de gestion des emplois du temps</p>
              </div>
            </body>
            `
          );

          await api.email.sendTestEmail(delegueEmail, emailContent.subject, emailBody);
          console.log(`✅ Email envoyé à ${delegueEmail} (${niveauLibelle})`);
          successCount++;
        } catch (err) {
          console.error(`❌ Erreur pour ${delegueEmail}:`, err);
          errorCount++;
        }
      }
    }

    return { successCount, errorCount };
  };

  const handleSend = async () => {
    if (selectedNiveaux.length === 0) {
      setError('Veuillez sélectionner au moins un niveau.');
      return;
    }

    const totalDelegues = getTotalDelegues();
    if (totalDelegues === 0) {
      setError('Aucun délégué trouvé pour les niveaux sélectionnés.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const niveauxData = [];
      for (const niveauId of selectedNiveaux) {
        const niveau = allNiveaux.find(n => n.id === niveauId);
        const delegues = deleguesByNiveau[niveauId] || [];
        if (delegues.length === 0) continue;
        niveauxData.push({
          niveauId,
          niveauLibelle: niveau?.libelle,
          delegues,
        });
      }

      const { successCount, errorCount } = await sendEmailsToDelegues(niveauxData);

      if (errorCount === 0) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          onClose();
        }, 3000);
        setError(null);
      } else {
        setError(`${successCount} envoyé(s), ${errorCount} échec(s)`);
      }
    } catch (err) {
      console.error('Erreur envoi:', err);
      setError(err.message || 'Erreur lors de l\'envoi des emails');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const totalDelegues = getTotalDelegues();
  const selectedCount = selectedNiveaux.length;
  const allCount = allNiveaux.length;
  const allSelected = selectedCount === allCount && allCount > 0;

  // Filtrer les niveaux selon la recherche
  const filteredNiveaux = allNiveaux.filter(n =>
    n.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-6 py-5 border-b border-outline-variant/20">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>
            <h1 className="font-poppins text-lg font-semibold text-slate-800">
              Partager l'emploi du temps
            </h1>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-slate-800" />
            </button>
          </div>
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un niveau..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-outline-variant rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
            />
          </div>
        </header>

        {/* Contenu */}
        <section className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-500">Chargement des données...</span>
            </div>
          ) : sent ? (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-800">Emails envoyés !</p>
              <p className="text-sm text-slate-500">
                {totalDelegues} délégué(s) ont reçu leur planning.
              </p>
            </div>
          ) : (
            <>
              {/* Liste des niveaux */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Niveaux ({selectedCount} sélectionné{selectedCount > 1 ? 's' : ''})
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredNiveaux.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Aucun niveau trouvé.</p>
                  ) : (
                    filteredNiveaux.map((niveau) => {
                      const delegues = deleguesByNiveau[niveau.id] || [];
                      const isSelected = selectedNiveaux.includes(niveau.id);
                      const hasDelegues = delegues.length > 0;
                      return (
                        <div
                          key={niveau.id}
                          className={`flex items-center justify-between p-4 bg-white border rounded-xl transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/50'
                              : 'border-outline-variant hover:border-blue-500/50'
                          } ${!hasDelegues ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => hasDelegues && toggleNiveau(niveau.id)}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => hasDelegues && toggleNiveau(niveau.id)}
                              disabled={!hasDelegues}
                              className="w-5 h-5 rounded border-outline-variant text-blue-600 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{niveau.libelle}</p>
                              <p className="text-sm text-slate-500">
                                {delegues.length} délégué{delegues.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(niveau.id);
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Aperçu</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Indicateur de statut */}
              <div className="bg-blue-50/80 border border-blue-200/60 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">
                  {totalDelegues > 0
                    ? `${totalDelegues} délégué${totalDelegues > 1 ? 's' : ''} recevront leur emploi du temps par email.`
                    : 'Aucun délégué sélectionné.'}
                </p>
              </div>

              {/* Champs email */}
              <div className="space-y-4 pb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Objet
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={emailContent.subject}
                      onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-outline-variant rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Message
                  </label>
                  <textarea
                    value={emailContent.message}
                    onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-outline-variant rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm resize-none"
                    placeholder="Écrivez votre message ici..."
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </section>

        {/* Bouton d'envoi fixe en bas */}
        {!sent && (
          <footer className="sticky bottom-0 bg-white/90 backdrop-blur-sm px-6 py-4 border-t border-outline-variant/20">
            <button
              onClick={handleSend}
              disabled={sending || loading || selectedNiveaux.length === 0 || totalDelegues === 0}
              className="w-full bg-blue-600 text-white py-3.5 rounded-full font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  Envoyer
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </footer>
        )}
      </div>

      {/* Modal d'aperçu (inchangé) */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Aperçu – {previewData.niveauLibelle}</h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[80vh] bg-white border border-outline-variant rounded-lg overflow-hidden">
              <TimetablePreview
                events={previewData.events}
                currentDate={new Date()}
                enseignantNom={`${previewData.niveauLibelle}`}
                getColorForType={(type) => {
                  const map = {
                    Cours: 'emerald',
                    Examen: 'red',
                    Soutenance: 'red',
                    TD: 'blue',
                    TP: 'purple',
                    Conférence: 'green',
                    Atelier: 'yellow',
                    Réunion: 'blue',
                  };
                  return map[type] || 'gray';
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
        .outline-variant {
          border-color: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default ShareModal;