// src/components/DeleguePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import Skeleton from './ui/Skeleton';
import {
  Search,
  Upload,
  SlidersHorizontal,
  GraduationCap,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserRound,
} from 'lucide-react';

const ITEMS_PER_PAGE = 4;

const DeleguePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [editingDelegue, setEditingDelegue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [errors, setErrors] = useState({ nomDelegue: '', emailDelegue: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterParcours, setFilterParcours] = useState('');
  const menuRef = useRef(null);
  const filterRef = useRef(null);

  const [delegues, setDelegues] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [parcours, setParcours] = useState([]);

  const [formData, setFormData] = useState({
    nomDelegue: '',
    emailDelegue: '',
    idNiveau: '',
    idParcours: ''
  });

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterPanel(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterNiveau, filterParcours]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    let errorMsg = '';
    if (name === 'nomDelegue') {
      filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
      if (filteredValue !== value) errorMsg = 'Caractère non autorisé (lettres uniquement)';
    } else if (name === 'emailDelegue') {
      filteredValue = value.replace(/\s/g, '');
      if (filteredValue !== value) errorMsg = 'Les espaces ne sont pas autorisés';
      else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Format d'email invalide";
    }
    setFormData(prev => ({ ...prev, [name]: name.includes('id') ? parseInt(filteredValue) : filteredValue }));
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [deleguesData, mentionsData, niveauxData] = await Promise.all([
        api.delegue.getAll(),
        api.affectation.getMentions(),
        api.affectation.getNiveaux()
      ]);
      setDelegues(deleguesData);
      setParcours(mentionsData.map((m, i) => ({ id: i + 1, libelle: m })));
      setNiveaux(niveauxData.map((n, i) => ({ id: i + 1, libelle: n })));
    } catch (error) {
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const rows = filteredDelegues;
    if (rows.length === 0) { showNotification('Aucune donnée à exporter', 'error'); return; }
    const headers = ['Nom', 'Email', 'Niveau', 'Parcours'];
    const csvContent = [
      headers.join(';'),
      ...rows.map(d =>
        [d.nomDelegue, d.emailDelegue, d.niveauLibelle, d.parcoursLibelle]
          .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
          .join(';')
      )
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delegues_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification(`${rows.length} délégué(s) exporté(s)`, 'success');
  };

  const activeFilterCount = [filterNiveau, filterParcours].filter(Boolean).length;
  const handleResetFilters = () => { setFilterNiveau(''); setFilterParcours(''); };

  const filteredDelegues = delegues.filter(delegue => {
    const matchSearch =
      delegue.nomDelegue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegue.emailDelegue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delegue.parcoursLibelle && delegue.parcoursLibelle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchNiveau = filterNiveau ? delegue.niveauLibelle === filterNiveau : true;
    const matchParcours = filterParcours ? delegue.parcoursLibelle === filterParcours : true;
    return matchSearch && matchNiveau && matchParcours;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDelegues.length / ITEMS_PER_PAGE));
  const paginatedDelegues = filteredDelegues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleOpenAddModal = () => {
    setFormData({ nomDelegue: '', emailDelegue: '', idNiveau: '', idParcours: '' });
    setErrors({ nomDelegue: '', emailDelegue: '' });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (delegue) => {
    setEditingDelegue(delegue);
    setFormData({ nomDelegue: delegue.nomDelegue, emailDelegue: delegue.emailDelegue, idNiveau: delegue.idNiveau, idParcours: delegue.idParcours });
    setErrors({ nomDelegue: '', emailDelegue: '' });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleAddDelegue = async () => {
    if (!formData.nomDelegue || !formData.emailDelegue || !formData.idNiveau || !formData.idParcours) { alert('Veuillez remplir tous les champs'); return; }
    setSubmitting(true);
    try {
      await api.delegue.create(formData);
      await loadData();
      setShowAddModal(false);
      showNotification('Délégué ajouté avec succès', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || "Erreur lors de l'ajout", 'error');
    } finally { setSubmitting(false); }
  };

  const handleEditDelegue = async () => {
    if (!formData.nomDelegue || !formData.emailDelegue || !formData.idNiveau || !formData.idParcours) { alert('Veuillez remplir tous les champs'); return; }
    setSubmitting(true);
    try {
      await api.delegue.update(editingDelegue.id, formData);
      await loadData();
      setShowEditModal(false);
      showNotification('Délégué mis à jour', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || "Erreur lors de la modification", 'error');
    } finally { setSubmitting(false); }
  };

  const handleDeleteDelegue = async (id, nom) => {
    if (window.confirm(`Supprimer le délégué "${nom}" ?`)) {
      try {
        await api.delegue.delete(id);
        await loadData();
        showNotification('Délégué supprimé avec succès', 'success');
      } catch (error) { showNotification('Erreur lors de la suppression', 'error'); }
    }
    setOpenMenuId(null);
  };

  const uniqueNiveaux = [...new Set(delegues.map(d => d.niveauLibelle).filter(Boolean))];
  const uniqueParcours = [...new Set(delegues.map(d => d.parcoursLibelle).filter(Boolean))];

  const ModalForm = ({ title, onConfirm, onClose, confirmLabel, confirmingLabel }) => (
    <div
      className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
      style={{ background: 'rgba(99,102,241,0.08)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.18s ease' }}
    >
      <div
        className="rounded-2xl w-full max-w-md p-7"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 32px 80px rgba(99,102,241,0.18), 0 8px 24px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
          animation: 'scaleIn 0.2s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Nom complet', name: 'nomDelegue', type: 'text', placeholder: 'Jean Dupont' },
            { label: 'Email', name: 'emailDelegue', type: 'email', placeholder: 'j.dupont@ecole.edu' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <input
                type={type} name={name} value={formData[name]} onChange={handleInputChange}
                placeholder={placeholder}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-400 ${
                  errors[name]
                    ? 'border border-red-300 bg-red-50/40'
                    : 'border border-white/70 bg-white/60'
                }`}
                style={{ backdropFilter: 'blur(8px)', boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.06)' }}
              />
              {errors[name] && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors[name]}</p>}
            </div>
          ))}
          {[
            { label: 'Niveau', key: 'idNiveau', list: niveaux },
            { label: 'Parcours', key: 'idParcours', list: parcours },
          ].map(({ label, key, list }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <select
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-400 border border-white/70 bg-white/60"
                style={{ backdropFilter: 'blur(8px)', boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.06)' }}
              >
                <option value="">Sélectionner {label.toLowerCase()}</option>
                {list.map(item => <option key={item.id} value={item.id}>{item.libelle}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.10)', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm} disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.40), 0 1px 4px rgba(99,102,241,0.20)' }}
          >
            {submitting ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.95) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes rowIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .row-item { animation: rowIn 0.24s ease both; transition: background 0.15s ease, box-shadow 0.15s ease; }
        .row-item:hover { background: linear-gradient(90deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03)) !important; box-shadow: inset 3px 0 0 #6366f1; }
        .row-item:hover .row-actions { opacity:1; }
        .row-actions { opacity:0; transition: opacity 0.15s ease; }
        .menu-dropdown { animation: scaleIn 0.15s cubic-bezier(.34,1.56,.64,1); transform-origin: top right; }
        .filter-panel { animation: scaleIn 0.16s cubic-bezier(.34,1.56,.64,1); transform-origin: top right; }
        .page-btn { transition: all 0.15s ease; }
        .page-btn:hover:not(.active) { background: rgba(99,102,241,0.08); color: #6366f1; }
        .page-btn.active { background: linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; box-shadow: 0 3px 10px rgba(99,102,241,0.40); }
        .glass-card { background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.55); }
        .glass-btn { background: rgba(255,255,255,0.80); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.60); }
      `}</style>

      {/* Fond dégradé subtil derrière la page */}
      <div className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,102,241,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(139,92,246,0.08) 0%, transparent 55%)' }}
      />

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Notification */}
        {notification.show && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000]" style={{ animation: 'slideDown 0.22s ease' }}>
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl min-w-[300px] ${
                notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
              }`}
              style={{
                background: notification.type === 'success' ? 'rgba(236,253,245,0.92)' : 'rgba(255,241,242,0.92)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${notification.type === 'success' ? 'rgba(110,231,183,0.5)' : 'rgba(253,164,175,0.5)'}`,
                boxShadow: notification.type === 'success'
                  ? '0 8px 32px rgba(16,185,129,0.18), 0 2px 8px rgba(16,185,129,0.10)'
                  : '0 8px 32px rgba(244,63,94,0.18), 0 2px 8px rgba(244,63,94,0.10)',
              }}
            >
              {notification.type === 'success'
                ? <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-500" />
                : <AlertCircle size={18} className="flex-shrink-0 text-rose-500" />}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-grow max-w-sm">
            <Search size={16} className="absolute inset-y-0 left-3.5 my-auto text-indigo-300 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm rounded-xl transition-all glass-btn"
              style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.10), 0 1px 4px rgba(15,23,42,0.06)' }}
              placeholder="Rechercher un délégué..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1" />

          {/* Exporter */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 rounded-xl text-sm font-medium hover:text-indigo-600 hover:-translate-y-0.5 transition-all duration-200 glass-btn"
            style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.10), 0 1px 4px rgba(15,23,42,0.06)' }}
          >
            <Upload size={15} />
            Exporter
          </button>

          {/* Filtrer */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowFilterPanel(p => !p); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 transition-all duration-200"
              style={activeFilterCount > 0
                ? { background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 4px 16px rgba(99,102,241,0.35), 0 1px 4px rgba(99,102,241,0.20)' }
                : { background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.60)', color: '#4b5563', boxShadow: '0 4px 16px rgba(99,102,241,0.10), 0 1px 4px rgba(15,23,42,0.06)' }
              }
            >
              <SlidersHorizontal size={15} />
              Filtrer
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-white text-indigo-600 rounded-full text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterPanel && (
              <div
                className="filter-panel absolute top-12 right-0 rounded-2xl p-5 z-30 w-72"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.60)',
                  boxShadow: '0 20px 60px rgba(99,102,241,0.16), 0 4px 16px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Filtres</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={handleResetFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      Réinitialiser
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Niveau', value: filterNiveau, setter: setFilterNiveau, list: uniqueNiveaux },
                    { label: 'Parcours', value: filterParcours, setter: setFilterParcours, list: uniqueParcours },
                  ].map(({ label, value, setter, list }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                      <select
                        value={value} onChange={(e) => setter(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-400 border border-white/70 bg-white/60"
                        style={{ backdropFilter: 'blur(8px)', boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.06)' }}
                      >
                        <option value="">Tous les {label.toLowerCase()}x</option>
                        {list.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-50 text-xs text-gray-400 text-center">
                  {filteredDelegues.length} résultat{filteredDelegues.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Table card — glass */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: '0 8px 40px rgba(99,102,241,0.12), 0 2px 12px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.85)',
          }}
        >
          {loading ? (
            <div className="divide-y divide-indigo-50/60">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} type="avatar" className="p-5" />)}
            </div>
          ) : filteredDelegues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <UserRound size={44} strokeWidth={1.2} className="mb-3 text-indigo-200" />
              <p className="text-sm">Aucun délégué trouvé</p>
              {activeFilterCount > 0 && (
                <button onClick={handleResetFilters} className="mt-3 text-xs text-indigo-500 hover:underline font-medium">
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-indigo-50/50">
              {paginatedDelegues.map((delegue, idx) => (
                <div
                  key={delegue.id}
                  className="row-item flex items-center px-6 py-4 gap-6 cursor-default"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Nom */}
                  <div className="w-48 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-800">{delegue.nomDelegue}</span>
                  </div>

                  {/* Niveau */}
                  <div className="w-28 flex-shrink-0">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
                    >
                      {delegue.niveauLibelle}
                    </span>
                  </div>

                  {/* Parcours */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GraduationCap size={15} className="text-indigo-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{delegue.parcoursLibelle}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Mail size={14} className="text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-400 truncate">{delegue.emailDelegue}</span>
                  </div>

                  {/* Actions */}
                  <div className="relative flex-shrink-0 row-actions">
                    <button
                      onClick={(e) => toggleMenu(delegue.id, e)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.6)' }}
                      aria-label="Options"
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenuId === delegue.id && (
                      <div
                        ref={menuRef}
                        className="menu-dropdown absolute top-9 right-0 rounded-xl py-1.5 z-20 min-w-[160px]"
                        style={{
                          background: 'rgba(255,255,255,0.88)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255,255,255,0.70)',
                          boxShadow: '0 12px 40px rgba(99,102,241,0.16), 0 2px 8px rgba(15,23,42,0.08)',
                        }}
                      >
                        <button
                          onClick={() => handleOpenEditModal(delegue)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50/60 flex items-center gap-2.5 transition-colors"
                        >
                          <Pencil size={13} className="text-indigo-400" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteDelegue(delegue.id, delegue.nomDelegue || 'ce délégué')}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50/60 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 size={13} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredDelegues.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}
            >
              <span className="text-sm text-gray-400">
                Affichage de <span className="font-semibold text-gray-600">{paginatedDelegues.length}</span> sur{' '}
                <span className="font-semibold text-gray-600">{filteredDelegues.length}</span> délégués
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-btn w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 disabled:opacity-25"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`page-btn w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${currentPage === page ? 'active' : 'text-gray-500'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 disabled:opacity-25"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAB Ajouter */}
      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full flex items-center justify-center hover:-translate-y-1 active:translate-y-0 transition-all duration-200 z-50"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          boxShadow: '0 8px 28px rgba(99,102,241,0.50), 0 2px 8px rgba(99,102,241,0.30), inset 0 1px 0 rgba(255,255,255,0.20)',
        }}
        aria-label="Ajouter un délégué"
      >
        <Plus size={24} />
      </button>

      {showAddModal && (
        <ModalForm
          title="Ajouter un délégué"
          onConfirm={handleAddDelegue}
          onClose={() => setShowAddModal(false)}
          confirmLabel="Ajouter"
          confirmingLabel="Ajout..."
        />
      )}

      {showEditModal && (
        <ModalForm
          title="Modifier le délégué"
          onConfirm={handleEditDelegue}
          onClose={() => setShowEditModal(false)}
          confirmLabel="Modifier"
          confirmingLabel="Modification..."
        />
      )}
    </>
  );
};

export default DeleguePage;