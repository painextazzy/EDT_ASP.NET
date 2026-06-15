// src/components/DeleguePage.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

// Composant Modal optimisé avec memo
const DelegueModal = React.memo(({ 
  title, 
  formData, 
  errors, 
  niveauOptions, 
  parcoursOptions, 
  submitting,
  emailExistsError,
  onInputChange, 
  onNiveauChange, 
  onParcoursChange,
  onEmailBlur,
  onConfirm, 
  onClose, 
  confirmLabel, 
  confirmingLabel 
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
      style={{ 
        background: 'rgba(0,0,0,0.4)', 
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.18s ease'
      }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-md p-7 bg-white"
        style={{
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          animation: 'scaleIn 0.2s cubic-bezier(.34,1.56,.64,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nom complet</label>
            <input
              type="text"
              name="nomDelegue"
              value={formData.nomDelegue || ''}
              onChange={onInputChange}
              placeholder="Jean Dupont"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-sky-400 border ${
                errors.nomDelegue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
              autoComplete="off"
            />
            {errors.nomDelegue && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.nomDelegue}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              name="emailDelegue"
              value={formData.emailDelegue || ''}
              onChange={onInputChange}
              onBlur={onEmailBlur}
              placeholder="j.dupont@ecole.edu"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-sky-400 border ${
                errors.emailDelegue || emailExistsError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
              autoComplete="off"
            />
            {(errors.emailDelegue || emailExistsError) && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.emailDelegue || emailExistsError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Niveau</label>
            <select
              value={formData.idNiveau || ''}
              onChange={onNiveauChange}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-sky-400 border border-gray-200 bg-white"
            >
              <option value="">Sélectionner un niveau</option>
              {niveauOptions}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Parcours</label>
            <select
              value={formData.idParcours || ''}
              onChange={onParcoursChange}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-sky-400 border border-gray-200 bg-white"
            >
              <option value="">Sélectionner un parcours</option>
              {parcoursOptions}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || !!emailExistsError}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-sky-600 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
          >
            {submitting ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

DelegueModal.displayName = 'DelegueModal';

// Composant pour le menu contextuel avec Portal
const ContextMenu = ({ isOpen, onClose, position, children }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div
      className="fixed inset-0 z-[9998]"
      onClick={onClose}
    >
      <div
        className="absolute menu-dropdown rounded-xl py-1.5 min-w-[160px] bg-white shadow-xl border border-gray-100"
        style={{
          top: position.y,
          left: position.x,
          transformOrigin: 'top left',
          animation: 'scaleIn 0.15s cubic-bezier(.34,1.56,.64,1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const DeleguePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
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
  const [emailExistsError, setEmailExistsError] = useState('');
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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterNiveau, filterParcours]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowEditModal(false);
        setOpenMenuId(null);
        setEmailExistsError('');
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Optimisation des options des selects avec useMemo
  const niveauOptions = useMemo(() => {
    if (!Array.isArray(niveaux)) return [];
    return niveaux.map((item) => (
      <option key={item.id} value={item.id}>
        {item.libelle || item.nom || String(item)}
      </option>
    ));
  }, [niveaux]);

  const parcoursOptions = useMemo(() => {
    if (!Array.isArray(parcours)) return [];
    return parcours.map((item) => (
      <option key={item.id} value={item.id}>
        {item.libelle || item.nom || String(item)}
      </option>
    ));
  }, [parcours]);

  // Vérification d'unicité de l'email
  const checkEmailUniqueness = useCallback(async (email, excludeId = null) => {
    if (!email) {
      setEmailExistsError('');
      return true;
    }
    
    const exists = delegues.some(delegue => 
      delegue.emailDelegue && delegue.emailDelegue.toLowerCase() === email.toLowerCase() && 
      delegue.id !== excludeId
    );
    
    if (exists) {
      setEmailExistsError('Cet email est déjà utilisé par un autre délégué');
      return false;
    } else {
      setEmailExistsError('');
      return true;
    }
  }, [delegues]);

  const handleInputChange = useCallback((e) => {
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
      
      if (emailExistsError) setEmailExistsError('');
    }
    
    setFormData(prev => ({ ...prev, [name]: filteredValue }));
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  }, [emailExistsError]);

  const handleNiveauChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, idNiveau: e.target.value }));
  }, []);

  const handleParcoursChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, idParcours: e.target.value }));
  }, []);

  const handleEmailBlur = useCallback(async (e) => {
    const email = e.target.value;
    const excludeId = editingDelegue?.id || null;
    if (email && !errors.emailDelegue) {
      await checkEmailUniqueness(email, excludeId);
    }
  }, [editingDelegue, errors.emailDelegue, checkEmailUniqueness]);

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
      
      if (mentionsData && mentionsData.length > 0) {
        if (typeof mentionsData[0] === 'string') {
          setParcours(mentionsData.map((m, i) => ({ id: i + 1, libelle: m })));
        } else {
          setParcours(mentionsData);
        }
      } else {
        setParcours([]);
      }
      
      if (niveauxData && niveauxData.length > 0) {
        if (typeof niveauxData[0] === 'string') {
          setNiveaux(niveauxData.map((n, i) => ({ id: i + 1, libelle: n })));
        } else {
          setNiveaux(niveauxData);
        }
      } else {
        setNiveaux([]);
      }
      
    } catch (error) {
      console.error('Erreur chargement:', error);
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
      (delegue.nomDelegue && delegue.nomDelegue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delegue.emailDelegue && delegue.emailDelegue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delegue.parcoursLibelle && delegue.parcoursLibelle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchNiveau = filterNiveau ? delegue.niveauLibelle === filterNiveau : true;
    const matchParcours = filterParcours ? delegue.parcoursLibelle === filterParcours : true;
    return matchSearch && matchNiveau && matchParcours;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDelegues.length / ITEMS_PER_PAGE));
  const paginatedDelegues = filteredDelegues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    event.preventDefault();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.right - 160, // Largeur du menu ~160px
      y: rect.bottom + 5
    };
    
    setMenuPosition(position);
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleOpenAddModal = () => {
    setFormData({ nomDelegue: '', emailDelegue: '', idNiveau: '', idParcours: '' });
    setErrors({ nomDelegue: '', emailDelegue: '' });
    setEmailExistsError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (delegue) => {
    setEditingDelegue(delegue);
    setFormData({ 
      nomDelegue: delegue.nomDelegue || '', 
      emailDelegue: delegue.emailDelegue || '', 
      idNiveau: delegue.idNiveau || '', 
      idParcours: delegue.idParcours || '' 
    });
    setErrors({ nomDelegue: '', emailDelegue: '' });
    setEmailExistsError('');
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleAddDelegue = async () => {
    if (!formData.nomDelegue || !formData.emailDelegue || !formData.idNiveau || !formData.idParcours) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    if (errors.nomDelegue || errors.emailDelegue) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }
    
    if (emailExistsError) {
      showNotification('Cet email est déjà utilisé par un autre délégué', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.delegue.create({
        nomDelegue: formData.nomDelegue,
        emailDelegue: formData.emailDelegue,
        idNiveau: parseInt(formData.idNiveau),
        idParcours: parseInt(formData.idParcours)
      });
      await loadData();
      setShowAddModal(false);
      showNotification('Délégué ajouté avec succès', 'success');
    } catch (error) {
      if (error.response?.status === 409) {
        showNotification(error.response?.data?.message || 'Cet email est déjà utilisé par un autre délégué', 'error');
        setEmailExistsError('Cet email est déjà utilisé par un autre délégué');
      } else if (error.response?.status === 400) {
        showNotification(error.response?.data?.message || 'Données invalides', 'error');
      } else {
        showNotification(error.response?.data?.message || "Erreur lors de l'ajout", 'error');
      }
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleEditDelegue = async () => {
    if (!formData.nomDelegue || !formData.emailDelegue || !formData.idNiveau || !formData.idParcours) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    if (errors.nomDelegue || errors.emailDelegue) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }
    
    if (emailExistsError) {
      showNotification('Cet email est déjà utilisé par un autre délégué', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.delegue.update(editingDelegue.id, {
        nomDelegue: formData.nomDelegue,
        emailDelegue: formData.emailDelegue,
        idNiveau: parseInt(formData.idNiveau),
        idParcours: parseInt(formData.idParcours)
      });
      await loadData();
      setShowEditModal(false);
      showNotification('Délégué modifié avec succès', 'success');
    } catch (error) {
      if (error.response?.status === 409) {
        showNotification(error.response?.data?.message || 'Cet email est déjà utilisé par un autre délégué', 'error');
        setEmailExistsError('Cet email est déjà utilisé par un autre délégué');
      } else if (error.response?.status === 400) {
        showNotification(error.response?.data?.message || 'Données invalides', 'error');
      } else {
        showNotification(error.response?.data?.message || "Erreur lors de la modification", 'error');
      }
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDeleteDelegue = async (id, nom) => {
    setOpenMenuId(null);
    if (window.confirm(`Supprimer le délégué "${nom}" ?`)) {
      try {
        await api.delegue.delete(id);
        await loadData();
        showNotification('Délégué supprimé avec succès', 'success');
      } catch (error) { 
        showNotification('Erreur lors de la suppression', 'error'); 
      }
    }
  };

  const uniqueNiveaux = [...new Set(delegues.map(d => d.niveauLibelle).filter(Boolean))];
  const uniqueParcours = [...new Set(delegues.map(d => d.parcoursLibelle).filter(Boolean))];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.95) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes rowIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        
        .row-item { 
          animation: rowIn 0.24s ease both; 
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .row-item:hover { 
          background: linear-gradient(90deg,rgba(56,189,248,0.04),rgba(14,165,233,0.03)) !important; 
          box-shadow: inset 3px 0 0 #38bdf8; 
        }
        .row-item:hover .row-actions { opacity: 1; }
        .row-actions { opacity: 0; transition: opacity 0.15s ease; }
        
        .filter-panel { 
          animation: scaleIn 0.16s cubic-bezier(.34,1.56,.64,1); 
          transform-origin: top right; 
        }
        
        .page-btn { transition: all 0.15s ease; }
        .page-btn:hover:not(.active) { background: rgba(56,189,248,0.08); color: #38bdf8; }
        .page-btn.active { background: linear-gradient(135deg,#38bdf8,#0ea5e9); color:#fff; box-shadow: 0 3px 10px rgba(56,189,248,0.40); }
        
        .action-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .action-btn:hover {
          background: rgba(56,189,248,0.1);
          transform: scale(1.05);
        }
        .action-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[2000]" style={{ animation: 'slideDown 0.22s ease' }}>
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl min-w-[300px] ${
                notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
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
          <div className="relative flex-grow max-w-sm">
            <Search size={16} className="absolute inset-y-0 left-3.5 my-auto text-sky-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none text-sm rounded-xl border border-gray-200 bg-white"
              placeholder="Rechercher un délégué..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1" />

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 rounded-xl text-sm font-medium hover:text-sky-600 transition-all duration-200 border border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50"
          >
            <Upload size={15} />
            Exporter
          </button>

          <div className="relative" ref={filterRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowFilterPanel(p => !p); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                activeFilterCount > 0
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:text-sky-600 hover:border-sky-200'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtrer
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-white text-sky-500 rounded-full text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterPanel && (
              <div className="filter-panel absolute top-12 right-0 rounded-2xl p-5 z-30 w-72 bg-white shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Filtres</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={handleResetFilters} className="text-xs text-sky-600 hover:text-sky-800 font-medium">
                      Réinitialiser
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Niveau</label>
                    <select
                      value={filterNiveau}
                      onChange={(e) => setFilterNiveau(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 border border-gray-200 bg-white"
                    >
                      <option value="">Tous les niveaux</option>
                      {uniqueNiveaux.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Parcours</label>
                    <select
                      value={filterParcours}
                      onChange={(e) => setFilterParcours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 border border-gray-200 bg-white"
                    >
                      <option value="">Tous les parcours</option>
                      {uniqueParcours.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                  {filteredDelegues.length} résultat{filteredDelegues.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} type="avatar" className="p-5" />)}
            </div>
          ) : filteredDelegues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <UserRound size={44} strokeWidth={1.2} className="mb-3 text-gray-300" />
              <p className="text-sm">Aucun délégué trouvé</p>
              {activeFilterCount > 0 && (
                <button onClick={handleResetFilters} className="mt-3 text-xs text-sky-500 hover:underline font-medium">
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedDelegues.map((delegue, idx) => (
                <div
                  key={delegue.id}
                  className="row-item flex items-center px-6 py-4 gap-6"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="w-48 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-800">{delegue.nomDelegue}</span>
                  </div>

                  <div className="w-28 flex-shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600">
                      {delegue.niveauLibelle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GraduationCap size={15} className="text-sky-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{delegue.parcoursLibelle}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-500 truncate">{delegue.emailDelegue}</span>
                  </div>

                  {/* Actions - Avec menu contextuel utilisant Portal */}
                  <div className="relative flex-shrink-0 row-actions">
                    <button
                      onClick={(e) => toggleMenu(delegue.id, e)}
                      className="action-btn p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.8)',
                        minWidth: '36px',
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label="Options"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredDelegues.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Affichage de <span className="font-semibold text-gray-700">{paginatedDelegues.length}</span> sur{' '}
                <span className="font-semibold text-gray-700">{filteredDelegues.length}</span> délégués
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-btn w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-sky-50"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`page-btn w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === pageNum ? 'active bg-sky-500 text-white' : 'text-gray-600 hover:bg-sky-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-1 text-gray-400">...</span>}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="page-btn w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-gray-600 hover:bg-sky-50"
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-sky-50"
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
        className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
          boxShadow: '0 8px 28px rgba(56,189,248,0.4)',
        }}
      >
        <Plus size={24} />
      </button>

      {/* Menu Contextuel avec Portal */}
      <ContextMenu 
        isOpen={openMenuId !== null} 
        onClose={() => setOpenMenuId(null)}
        position={menuPosition}
      >
        <button
          onClick={() => {
            const delegue = delegues.find(d => d.id === openMenuId);
            if (delegue) handleOpenEditModal(delegue);
          }}
          className="action-btn w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2.5 transition-colors rounded-t-xl"
        >
          <Pencil size={14} className="text-sky-500" />
          Modifier
        </button>
        <button
          onClick={() => {
            const delegue = delegues.find(d => d.id === openMenuId);
            if (delegue) handleDeleteDelegue(delegue.id, delegue.nomDelegue);
          }}
          className="action-btn w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors rounded-b-xl"
        >
          <Trash2 size={14} />
          Supprimer
        </button>
      </ContextMenu>

      {/* Modals */}
      {showAddModal && (
        <DelegueModal
          title="Ajouter un délégué"
          formData={formData}
          errors={errors}
          niveauOptions={niveauOptions}
          parcoursOptions={parcoursOptions}
          submitting={submitting}
          emailExistsError={emailExistsError}
          onInputChange={handleInputChange}
          onNiveauChange={handleNiveauChange}
          onParcoursChange={handleParcoursChange}
          onEmailBlur={handleEmailBlur}
          onConfirm={handleAddDelegue}
          onClose={() => {
            setShowAddModal(false);
            setEmailExistsError('');
          }}
          confirmLabel="Ajouter"
          confirmingLabel="Ajout..."
        />
      )}

      {showEditModal && (
        <DelegueModal
          title="Modifier le délégué"
          formData={formData}
          errors={errors}
          niveauOptions={niveauOptions}
          parcoursOptions={parcoursOptions}
          submitting={submitting}
          emailExistsError={emailExistsError}
          onInputChange={handleInputChange}
          onNiveauChange={handleNiveauChange}
          onParcoursChange={handleParcoursChange}
          onEmailBlur={handleEmailBlur}
          onConfirm={handleEditDelegue}
          onClose={() => {
            setShowEditModal(false);
            setEmailExistsError('');
          }}
          confirmLabel="Modifier"
          confirmingLabel="Modification..."
        />
      )}
    </>
  );
};

export default DeleguePage;