import React, { useState, useEffect } from 'react';
import { planningApi } from '../services/api';

const HistoriqueCoursAnnuler = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnnules = async () => {
            try {
                setLoading(true);
                // On récupère les cours annulés depuis le backend
                let data = await planningApi.getAnnules();
                
                // --- AJOUT DE DONNÉES FACTICES POUR LE TEST SI LA BASE EST VIDE ---
                if (!data || data.length === 0) {
                    data = [
                        {
                            id: 991,
                            dateDebut: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
                            dateFin: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
                            motifAnnulation: "Absence du professeur (Maladie)",
                            enseignement: {
                                enseignant: { nom: "Rakoto Jean" },
                                cours: { nom: "Algorithmique et Programmation" },
                                niveau: { libelle: "L1" }
                            },
                            salles: [{ nom: "Salle 101" }]
                        },
                        {
                            id: 992,
                            dateDebut: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
                            dateFin: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
                            motifAnnulation: "Problème technique (Panne de projecteur)",
                            enseignement: {
                                enseignant: { nom: "Randria Marie" },
                                cours: { nom: "Base de données" },
                                niveau: { libelle: "L2" }
                            },
                            salles: [{ nom: "Labo Info 2" }]
                        },
                        {
                            id: 993,
                            dateDebut: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
                            dateFin: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
                            motifAnnulation: "Réunion d'urgence de l'administration",
                            enseignement: {
                                enseignant: { nom: "Andria Paul" },
                                cours: { nom: "Mathématiques Discrètes" },
                                niveau: { libelle: "L1" }
                            },
                            salles: [{ nom: "Amphi A" }]
                        }
                    ];
                }
                // -------------------------------------------------------------------

                // Mappage des données backend vers le format du frontend
                const mappedCourses = data.map((p) => {
                    const dateDebut = new Date(p.dateDebut);
                    const dateFin = new Date(p.dateFin);
                    
                    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                    const dayName = days[dateDebut.getDay()];
                    
                    return {
                        id: p.id,
                        professor: p.enseignement?.enseignant?.nom || 'Inconnu',
                        professorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQbPLSUAWBaildqyhHBqXYHYh1LobsNtFjf_6S-VOZZW8dSp9qcDm5bb7bRd1QCsbrKXq4Y5POWNV9Jm3QajyE1EaSsATvitIpTEm41sORdN1DFlfo19n1d7ae_pRlHqLECELlLcmgWqWRAS6HMArqTYe3MNevYPJWFsJVigvXPSZ7ttimHPIh3snHFcWogIcu8A5ZKTEchGt8F_aPgljcSoDg24qqwD7hxGfeZ113elRaTZ8AsRU', // Fallback image de base
                        course: p.enseignement?.cours?.nom || 'Inconnu',
                        room: p.salles?.map(s => s.nom).join(', ') || 'Non assigné',
                        level: p.enseignement?.niveau?.libelle || 'Inconnu',
                        reason: p.motifAnnulation || 'Motif non précisé',
                        date: `${dayName} ${dateDebut.getDate()} ${dateDebut.toLocaleString('default', { month: 'short' })}`,
                        time: `${dateDebut.getHours().toString().padStart(2, '0')}:${dateDebut.getMinutes().toString().padStart(2, '0')} - ${dateFin.getHours().toString().padStart(2, '0')}:${dateFin.getMinutes().toString().padStart(2, '0')}`,
                        status: 'annulé'
                    };
                });
                
                setCourses(mappedCourses);
                setError(null);
            } catch (err) {
                console.error("Erreur lors de la récupération des cours annulés:", err);
                setError("Impossible de charger les données.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnnules();
    }, []);

    return (
        <div className="bg-surface text-slate-900 font-body flex flex-col min-h-screen">
            {/* Top Navigation Bar / Container */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Main Dashboard Area */}
                <main className="flex-1 flex gap-8 p-8 overflow-hidden">
                    {/* Main Calendar Grid Content */}
                    <section className="flex-1 flex flex-col gap-6 overflow-hidden">
                        {/* Grid Controls */}
                        <div className="flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <button className="p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50">
                                    <span className="material-symbols-outlined text-slate-500">chevron_left</span>
                                </button>
                                <h2 className="text-2xl font-bold text-slate-800">Cours Annulés</h2>
                                <button className="p-2 bg-white rounded-xl shadow-sm border border-outline-variant hover:bg-slate-50">
                                    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                </button>
                            </div>
                            <div className="flex gap-4 flex-col">
                            </div>
                        </div>

                        {/* Scrollable Calendar Content */}
                        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-outline-variant bg-slate-50/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professeur</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cours</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Niveau</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motif</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Heure</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                    <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                                                    <p>Chargement des données...</p>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                                                    {error}
                                                </td>
                                            </tr>
                                        ) : courses.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                                    <span className="material-symbols-outlined text-3xl block mx-auto mb-2 text-slate-300">
                                                        search_off
                                                    </span>
                                                    Aucun cours annulé trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            courses.map((course) => (
                                                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                alt="Professeur" 
                                                                className="w-8 h-8 rounded-full border border-outline-variant" 
                                                                src={course.professorAvatar} 
                                                            />
                                                            <span className="text-sm font-semibold text-slate-800">{course.professor}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-800">{course.course}</div>
                                                        <div className="text-[10px] text-slate-500">{course.room}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{course.level}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{course.reason}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-slate-800">{course.date}</div>
                                                        <div className="text-[10px] text-slate-500">{course.time}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase">
                                                            Annulé
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HistoriqueCoursAnnuler;
