import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { addWeeks, format, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import coursAnnulesApi from '../services/coursAnnulesApi';

const CoursAnnulesPage = () => {
  const [annules, setAnnules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadAnnules();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAnnules = async () => {
    setLoading(true);
    try {
      const data = await coursAnnulesApi.getAll();
      setAnnules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement annulés:', error);
      showToast("Erreur lors du chargement des cours annulés", 'error');
    } finally {
      setLoading(false);
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekLabel = `Semaine du ${format(weekStart, 'd MMMM', { locale: fr })}`;

  const previousWeek = () => setCurrentWeek((prev) => addWeeks(prev, -1));
  const nextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatSafe = (date, fmt) => {
    if (!date) return '—';
    try {
      return format(date, fmt, { locale: fr });
    } catch (error) {
      return '—';
    }
  };

  const renderProfileImage = (enseignant) => {
    const name = enseignant?.nom || enseignant?.prenom || 'Professeur';
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=edf2ff&color=1e40af&rounded=true&size=128`;
    return enseignant?.photoUrl ? enseignant.photoUrl : fallback;
  };

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 border px-4 py-2 rounded-xl ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={previousWeek}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-slate-500">chevron_left</span>
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Cours Annulés — {weekLabel}</h2>
          <button
            type="button"
            onClick={nextWeek}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-slate-500">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professeur</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cours</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motif</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date &amp; Heure</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Chargement...
                  </td>
                </tr>
              ) : annules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Aucun cours annulé trouvé.
                  </td>
                </tr>
              ) : (
                annules.map((item) => {
                  const enseignant = item.enseignement?.enseignant || item.enseignant || {};
                  const profNom = enseignant.nom || `${enseignant.prenom || ''}`.trim() || 'Professeur inconnu';
                  const cours = item.enseignement?.cours?.nom || item.typeEvenement || 'Cours';
                  const motif = item.motifAnnulation?.trim() || 'Aucun motif renseigné';
                  const debut = toDate(item.dateDebut);
                  const fin = toDate(item.dateFin);
                  const salle = item.salles && Array.isArray(item.salles) ? item.salles.map((s) => s.nom || s).join(', ') : item.salle || '—';
                  const rowKey = item.id || item.idCoursAnnule || item.idPlanning || `${cours}-${profNom}-${item.dateDebut}`;

                  return (
                    <tr key={rowKey} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            alt="Professeur"
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                            src={renderProfileImage(enseignant)}
                          />
                          <span className="text-sm font-semibold text-slate-800">{profNom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{cours}</div>
                        <div className="text-[10px] text-slate-500">{salle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{motif}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800">{formatSafe(debut, 'EEEE d MMM')}</div>
                        <div className="text-[10px] text-slate-500">{formatSafe(debut, 'HH:mm')} - {formatSafe(fin, 'HH:mm')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">
                          Annulé
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoursAnnulesPage;
