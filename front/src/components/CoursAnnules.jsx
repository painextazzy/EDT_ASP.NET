// src/components/CoursAnnules.jsx
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  RefreshCw,
  Calendar,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api, { API_URL } from '../services/api';
import { authApi } from '../services/auth';
import { startConnection, onPlanningNotification } from '../services/signalRService';

// Fonction pour construire l'URL complète de la photo
const getFullPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  if (photoUrl.startsWith('/')) {
    return `${API_URL}${photoUrl}`;
  }
  return `${API_URL}/${photoUrl}`;
};

const CoursAnnules = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coursAnnules, setCoursAnnules] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Récupération des cours annulés de la semaine en cours
  const fetchCoursAnnules = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authApi.getUser();
      if (!user || !user.id) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      // Récupérer tous les plannings annulés (endpoint admin)
      const response = await api.planning.getAllAnnules();

      let allPlannings = [];
      if (response?.success && Array.isArray(response.data)) {
        allPlannings = response.data;
      } else if (Array.isArray(response)) {
        allPlannings = response;
      }

      console.log(`📊 ${allPlannings.length} plannings annulés reçus`);

      // Filtrer par semaine
      const weekStart = currentWeek;
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

      const annules = allPlannings
        .filter((p) => {
          const dateDebut = new Date(p.dateDebut + 'Z');
          return isWithinInterval(dateDebut, { start: weekStart, end: weekEnd });
        })
        .map((p) => {
          const dateDebut = new Date(p.dateDebut + 'Z');
          const dateFin = new Date(p.dateFin + 'Z');
          const coursNom = p.enseignement?.cours?.nom || p.coursNom || 'Cours';
          const professeur = p.enseignement?.enseignant?.nom || 'Inconnu';
          const photoUrl = p.enseignement?.enseignant?.photoUrl || null;
          const niveau = p.enseignement?.niveau?.libelle || '';
          let salles = p.salles || [];
          if (Array.isArray(salles) && salles.length > 0 && typeof salles[0] === 'object') {
            salles = salles.map((s) => s.nom || s.numero || s).filter(Boolean);
          }
          const salleStr = salles.join(', ') || '—';
          return {
            id: p.id,
            titre: coursNom,
            professeur,
            photoUrl,
            niveau,
            salle: salleStr,
            motif: p.motifAnnulation || 'Non spécifié',
            dateDebut,
            dateFin,
            statut: p.statut,
          };
        });

      annules.sort((a, b) => b.dateDebut - a.dateDebut);
      setCoursAnnules(annules);
    } catch (err) {
      console.error('❌ Erreur:', err);
      const status = err.response?.status || 'inconnu';
      const message = err.message || 'Erreur inconnue';
      setError(`Erreur ${status} : ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigation entre semaines
  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  // SignalR (écoute en temps réel)
  useEffect(() => {
    startConnection().catch((err) => console.warn('⚠️ SignalR déjà en cours', err));
    const unsubscribe = onPlanningNotification((data) => {
      if (data?.action === 'cancel' || data?.action === 'update' || data?.action === 'create') {
        console.log('📢 Mise à jour reçue, rechargement...');
        fetchCoursAnnules();
      }
    });
    return () => unsubscribe();
  }, []);

  // Recharger quand la semaine change
  useEffect(() => {
    fetchCoursAnnules();
  }, [currentWeek]);

  // Formatage des dates
  const formatDate = (date) => format(date, 'EEEE d MMM', { locale: fr });
  const formatTime = (date) => format(date, 'HH:mm');

  // Avatar avec initiales
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  };
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
    ];
    const index = (name?.length || 0) % colors.length;
    return colors[index] || 'bg-blue-500';
  };

  // Titre de la semaine
  const weekTitle = `Semaine du ${format(currentWeek, 'd MMMM', { locale: fr })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-slate-500">Chargement des cours annulés...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-surface">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-red-600 font-semibold">Erreur de chargement</p>
        <p className="text-slate-600 text-sm mt-1">{error}</p>
        <button
          onClick={fetchCoursAnnules}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <main className="flex-1 flex gap-8 p-8 overflow-hidden">
        <section className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* En-tête avec navigation */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousWeek}
                className="p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50 transition"
                aria-label="Semaine précédente"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </button>
              <h2 className="text-2xl font-bold text-slate-800">
                Cours Annulés — {weekTitle}
              </h2>
              <button
                onClick={goToNextWeek}
                className="p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50 transition"
                aria-label="Semaine suivante"
              >
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <button
              onClick={fetchCoursAnnules}
              className="p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50 transition"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Tableau - Colonnes réduites (sans Niveau ni Statut) */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
            {coursAnnules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <Calendar className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-600">Aucun cours annulé</h3>
                <p className="text-slate-500 text-sm mt-1">Aucun cours annulé cette semaine.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Professeur
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Cours
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Motif
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Date &amp; Heure
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {coursAnnules.map((cours) => {
                      const fullPhotoUrl = getFullPhotoUrl(cours.photoUrl);
                      return (
                        <tr key={cours.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {fullPhotoUrl ? (
                                <img
                                  src={fullPhotoUrl}
                                  alt={cours.professeur}
                                  className="w-8 h-8 rounded-full border border-outline-variant object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentElement;
                                    const fallback = document.createElement('div');
                                    fallback.className = `w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(cours.professeur)}`;
                                    fallback.textContent = getInitials(cours.professeur);
                                    parent.appendChild(fallback);
                                  }}
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(cours.professeur)}`}
                                >
                                  {getInitials(cours.professeur)}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-slate-800">{cours.professeur}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-800">{cours.titre}</div>
                            <div className="text-[10px] text-slate-500">{cours.salle}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{cours.motif}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-800">{formatDate(cours.dateDebut)}</div>
                            <div className="text-[10px] text-slate-500">
                              {formatTime(cours.dateDebut)} - {formatTime(cours.dateFin)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CoursAnnules;