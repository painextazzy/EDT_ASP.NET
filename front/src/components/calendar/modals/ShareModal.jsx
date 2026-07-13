// src/components/admin/ShareModal.jsx
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Mail, Loader2, Check, AlertCircle, Users, Eye } from 'lucide-react';
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

  // ✅ Extrait le contenu du <body> pour l'email
  const extractBodyContent = (html) => {
    if (!html) return null;
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : html;
  };

  // ✅ Génère le HTML de l'email avec le design A4 paysage (identique au template)
  const generateEmailHTML = (delegue, niveauLibelle, tableHtml, message, currentDate) => {
    // Calcul de la semaine
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekStr = `du ${format(weekStart, 'dd/MM')} au ${format(weekEnd, 'dd/MM/yyyy')}`;
    const anneeUniversitaire = `${format(currentDate, 'yyyy')}-${parseInt(format(currentDate, 'yyyy')) + 1}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emploi du Temps</title>
        <style>
          /* Reset et typographie */
          body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
            color: #111827;
          }
          .container {
            max-width: 297mm;
            margin: 0 auto;
            background: white;
            padding: 10mm;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            font-weight: 700;
            font-size: 14px;
          }
          .header .left, .header .center, .header .right {
            flex: 1;
          }
          .header .center { text-align: center; }
          .header .right { text-align: right; }
          .title {
            text-align: center;
            font-size: 24px;
            font-weight: 900;
            text-decoration: underline double;
            margin-bottom: 30px;
          }
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          .schedule-table th, .schedule-table td {
            border: 1px solid #d1d5db;
            height: 60px;
            vertical-align: middle;
            text-align: center;
            padding: 4px;
          }
          .time-col {
            width: 100px;
            background-color: #f9fafb;
            font-weight: 600;
          }
          .day-header {
            background-color: #f3f4f6;
            font-weight: 700;
            text-transform: uppercase;
          }
          .course-blue { background-color: #38bdf8; color: white; }
          .course-orange { background-color: #fbbf24; color: black; }
          .course-purple { background-color: #d8b4fe; color: black; }
          .course-green { background-color: #86efac; color: black; }
          .course-gray { background-color: #9ca3af; color: white; }
          .course-peach { background-color: #ffedd5; color: black; }
          .course-light-blue { background-color: #bae6fd; color: black; }
          .course-red { background-color: #f87171; color: white; }
          .stamp {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }
          .stamp .circle {
            width: 80px;
            height: 80px;
            border: 2px dashed #f87171;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-12deg);
            opacity: 0.6;
          }
          .stamp .circle span {
            font-size: 8px;
            font-weight: 700;
            color: #dc2626;
            text-align: center;
            line-height: 1.2;
          }
          .footer-mention {
            margin-top: 20px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          .footer-mention .italic { font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="left">ENSEIGNANT : ${delegue?.nomDelegue || 'Délégué'}</div>
            <div class="center">SEMAINE DU : ${weekStr}</div>
            <div class="right">ANNÉE UNIVERSITAIRE : ${anneeUniversitaire}</div>
          </div>
          <div class="title">EMPLOI DU TEMPS</div>
          <div>${tableHtml || '<p style="text-align:center; color:#94a3b8;">Aucun cours prévu cette semaine.</p>'}</div>
          <div class="stamp">
            <div class="circle">
              <span>UNIVERSITÉ<br/>ÉCOLE<br/>APPROUVÉ</span>
            </div>
          </div>
          <div class="footer-mention">
            <p class="italic">Ceci est un message automatique. Merci de ne pas répondre à cet email.</p>
            <p>© ${new Date().getFullYear()} - Service de gestion des emplois du temps</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const sendEmailsToDelegues = async (niveauxData) => {
    let successCount = 0, errorCount = 0;
    const today = new Date();

    for (const niveauData of niveauxData) {
      const { delegues, niveauLibelle, htmlContent } = niveauData;
      const tableHtml = extractBodyContent(htmlContent);

      for (const delegue of delegues) {
        const delegueEmail = delegue.emailDelegue || delegue.email;
        if (!delegueEmail) {
          console.warn('⚠️ Délégué sans email :', delegue);
          errorCount++;
          continue;
        }

        try {
          const emailBody = generateEmailHTML(
            delegue,
            niveauLibelle,
            tableHtml,
            emailContent.message,
            today
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

        const niveauEvents = allEvents.filter(e => e.niveau === niveau?.libelle);
        const htmlContent = generateTimetableHTML(
          niveauEvents,
          new Date(),
          `Délégués ${niveau?.libelle}`,
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
          }
        );

        niveauxData.push({
          niveauId,
          niveauLibelle: niveau?.libelle,
          delegues,
          htmlContent,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Partager l'emploi du temps
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-800">Emails envoyés !</p>
            <p className="text-sm text-slate-500">
              {totalDelegues} délégué(s) ont reçu leur planning.
            </p>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Chargement des données...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Niveaux ({selectedNiveaux.length} sélectionnés)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-lg p-2 bg-slate-50">
                    {allNiveaux.length === 0 ? (
                      <p className="text-sm text-slate-500">Aucun niveau trouvé</p>
                    ) : (
                      allNiveaux.map(niveau => {
                        const delegues = deleguesByNiveau[niveau.id] || [];
                        const isSelected = selectedNiveaux.includes(niveau.id);
                        return (
                          <label
                            key={niveau.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleNiveau(niveau.id)}
                              className="w-4 h-4 text-blue-600 rounded border-outline-variant focus:ring-blue-500"
                            />
                            <span className="flex-1 text-sm font-medium text-slate-700">
                              {niveau.libelle}
                            </span>
                            <span className="text-xs text-slate-500 mr-2">
                              {delegues.length} délégué{delegues.length > 1 ? 's' : ''}
                            </span>
                            <button
                              onClick={() => handlePreview(niveau.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Aperçu
                            </button>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                  <span className="font-semibold">{totalDelegues}</span> délégués recevront leur emploi du temps par email.
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objet</label>
                  <input
                    type="text"
                    value={emailContent.subject}
                    onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    value={emailContent.message}
                    onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                    rows="3"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Message personnalisé pour les délégués..."
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-outline-variant">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={sending || loading || selectedNiveaux.length === 0 || totalDelegues === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? 'Envoi...' : `Envoyer à ${totalDelegues} délégué${totalDelegues > 1 ? 's' : ''}`}
              </button>
            </div>
          </>
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
                enseignantNom={`Délégués ${previewData.niveauLibelle}`}
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
    </div>
  );
};

export default ShareModal;