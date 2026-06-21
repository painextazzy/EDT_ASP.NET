// src/components/CoursAnnulesPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { startCoursAnnuleConnection, onCoursAnnuleEvent, offCoursAnnuleEvent } from '../services/coursAnnuleSocket';
import {
  Search,
  CalendarDays,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  ArrowUpDown,
  History,
  Wifi,
  ChevronDown,
  Check,
  User,
} from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'date',        label: 'Date (plus récent)' },
  { key: 'date_asc',    label: 'Date (plus ancien)' },
  { key: 'nom',         label: 'Nom du cours (A-Z)' },
  { key: 'salle',       label: 'Salle (A-Z)' },
  { key: 'professeur',  label: 'Professeur (A-Z)' },
];

const CoursAnnulesPage = () => {
  const [coursAnnules, setCoursAnnules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const sortRef = useRef(null);

  // ── Fermer le menu de tri au clic extérieur ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ── Formatters ──────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  };

  const formatHeure = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const getIcone = (nom) => {
    const n = nom?.toLowerCase() ?? '';
    if (n.includes('math'))                          return '\u03A3';
    if (n.includes('algo') || n.includes('info'))    return '\u2328';
    if (n.includes('phys') || n.includes('chimie'))  return '\u2697';
    if (n.includes('design'))                        return '\u039B';
    if (n.includes('anglais') || n.includes('lang')) return '\u2295';
    return '\u25C8';
  };

  // ── Normalisation des données venant de l'API CoursAnnule ────────────────────
  const normalize = (raw) =>
    raw.map(c => ({
      id: c.id,
      nomMatiere: c.nomMatiere ?? 'Cours',
      descriptionMatiere: c.codeMatiere ?? '',
      dateDebut: c.dateDebut,
      dateFin: c.dateFin,
      motifAnnulation: c.motifAnnulation || 'Motif non précisé',
      nomSalle: c.nomSalle || 'Salle non définie',
      batiment: c.batiment || '',
      nomEnseignant: c.nomEnseignant || 'Enseignant non précisé',
    }));

  // ── Chargement des données ───────────────────────────────────────────────────
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);
    try {
      const raw = await api.coursAnnule.getAll();
      const formatted = normalize(raw);
      setCoursAnnules(formatted);
      setLastUpdate(new Date());
      localStorage.setItem('coursAnnules_lastSeenCount', String(formatted.length));
    } catch (error) {
      console.error('Erreur chargement cours annulés', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);

    let active = true;

    const setupSocket = async () => {
      await startCoursAnnuleConnection();
      if (!active) return;
      onCoursAnnuleEvent('coursAnnulesUpdated', () => loadData(true));
    };

    setupSocket();

    return () => {
      active = false;
      offCoursAnnuleEvent('coursAnnulesUpdated');
    };
  }, [loadData]);

  // ── Recherche + tri (locaux, instantanés) ────────────────────────────────────
  const filtered = coursAnnules
    .filter(c =>
      c.nomMatiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.motifAnnulation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nomSalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nomEnseignant.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.dateDebut) - new Date(a.dateDebut);
        case 'date_asc':
          return new Date(a.dateDebut) - new Date(b.dateDebut);
        case 'nom':
          return a.nomMatiere.localeCompare(b.nomMatiere);
        case 'salle':
          return a.nomSalle.localeCompare(b.nomSalle);
        case 'professeur':
          return a.nomEnseignant.localeCompare(b.nomEnseignant);
        default:
          return 0;
      }
    });

  const heureMaj = lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Trier';

  return (
    <>
      <style>{`
        @keyframes rowIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes pingDot { 0%{transform:scale(1);opacity:1} 70%{transform:scale(2.2);opacity:0} 100%{opacity:0} }
        @keyframes scaleIn { from { opacity:0; transform:scale(.96) translateY(-4px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .cours-row { animation: rowIn 0.24s ease both; transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .cours-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(99,102,241,0.11), 0 2px 8px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,1) !important;
        }
        .skeleton { animation: pulse 1.5s ease infinite; }
        .sync-dot { position: relative; width: 7px; height: 7px; border-radius: 999px; background: #34d399; flex-shrink: 0; }
        .sync-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 999px; background: #34d399;
          animation: pingDot 1.4s ease-out infinite;
        }
        .sort-menu { animation: scaleIn 0.15s cubic-bezier(.34,1.56,.64,1); transform-origin: top right; }
        .sort-option:hover { background: rgba(99,102,241,0.07); }
      `}</style>

      {/* Fond dégradé page */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% -5%, rgba(99,102,241,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 110%, rgba(239,68,68,0.04) 0%, transparent 55%)
          `,
        }}
      />

      <div className="max-w-4xl mx-auto space-y-5 pb-20">

        {/* ── Header ── */}
        <header className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-grow max-w-xs">
            <Search size={15} className="absolute inset-y-0 left-3.5 my-auto text-indigo-300 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un cours..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none rounded-xl transition-all focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.65)',
                boxShadow: '0 2px 12px rgba(99,102,241,0.08), 0 1px 4px rgba(15,23,42,0.05)',
              }}
            />
          </div>

          {/* Menu déroulant de tri */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setSortMenuOpen(o => !o); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={sortMenuOpen ? {
                background: 'rgba(99,102,241,0.10)',
                border: '1px solid rgba(99,102,241,0.22)',
                color: '#6366f1',
                boxShadow: '0 2px 12px rgba(99,102,241,0.14)',
              } : {
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.65)',
                color: '#6b7280',
                boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
              }}
            >
              <ArrowUpDown size={14} />
              {currentSortLabel}
              <ChevronDown size={14} className={`transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortMenuOpen && (
              <div
                className="sort-menu absolute top-12 right-0 rounded-2xl py-2 z-30 w-56"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255,255,255,0.65)',
                  boxShadow: '0 16px 48px rgba(99,102,241,0.14), 0 2px 8px rgba(15,23,42,0.07)',
                }}
              >
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.key}
                    onClick={() => { setSortBy(option.key); setSortMenuOpen(false); }}
                    className="sort-option w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors"
                  >
                    <span>{option.label}</span>
                    {sortBy === option.key && <Check size={14} className="text-indigo-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Indicateur de synchro */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400"
            style={{
              background: 'rgba(255,255,255,0.60)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.50)',
            }}
            title="Synchronisation temps réel"
          >
            {isSyncing ? (
              <Wifi size={13} className="text-indigo-400 animate-pulse" />
            ) : (
              <span className="sync-dot" />
            )}
            <span>Live</span>
          </div>
        </header>

        {/* ── Liste cours annulés ── */}
        <section className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="skeleton rounded-2xl"
                style={{
                  height: 90,
                  background: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.50)',
                }}
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <XCircle size={44} strokeWidth={1.2} className="mb-3 text-indigo-200" />
              <p className="text-sm">
                {searchTerm ? 'Aucun résultat pour cette recherche' : 'Aucun cours annulé pour le moment'}
              </p>
            </div>
          ) : (
            filtered.map((cours, idx) => (
              <div
                key={cours.id}
                className="cours-row flex items-center gap-5 px-6 py-5 rounded-2xl"
                style={{
                  animationDelay: `${idx * 0.06}s`,
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255,255,255,0.58)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.07), 0 1px 6px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,0.90)',
                }}
              >
                {/* Icône matière */}
                <div
                  className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center text-base font-bold select-none"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.13)',
                    color: '#6366f1',
                  }}
                >
                  {getIcone(cours.nomMatiere)}
                </div>

                {/* Nom + prof */}
                <div className="w-48 flex-shrink-0 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug truncate">
                    {cours.nomMatiere}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User size={11} className="text-gray-300 flex-shrink-0" />
                    <p className="text-xs text-gray-400 truncate">{cours.nomEnseignant}</p>
                  </div>
                </div>

                {/* Date + Heure */}
                <div className="w-48 flex-shrink-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={13} className="text-gray-400 flex-shrink-0" />
                    <span>{formatDate(cours.dateDebut)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={13} className="flex-shrink-0" />
                    <span>{formatHeure(cours.dateDebut)} — {formatHeure(cours.dateFin)}</span>
                  </div>
                </div>

                {/* Salle + Motif */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {cours.nomSalle}{cours.batiment ? ` (${cours.batiment})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle size={13} className="flex-shrink-0" />
                    <span className="truncate">{cours.motifAnnulation}</span>
                  </div>
                </div>

                {/* Badge ANNULÉ */}
                <div className="flex-shrink-0">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.18)',
                      color: '#ef4444',
                      boxShadow: '0 2px 8px rgba(239,68,68,0.10)',
                    }}
                  >
                    <XCircle size={12} />
                    ANNULÉ
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ── Footer ── */}
        {!loading && (
          <footer className="flex flex-col items-center gap-2 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <History size={15} className="text-gray-300" />
              <span>Dernière mise à jour : Aujourd'hui à {heureMaj}</span>
            </div>
            <p className="text-xs text-gray-300 text-center leading-relaxed max-w-sm">
              Les cours annulés sont automatiquement retirés de votre emploi du temps interactif.<br />
              Une notification est envoyée à tous les étudiants inscrits.
            </p>
          </footer>
        )}

      </div>
    </>
  );
};

export default CoursAnnulesPage;