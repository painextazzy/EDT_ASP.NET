// src/components/NiveauxPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Edit, Trash2, X, CheckCircle, AlertCircle, GraduationCap, Award, Trophy, Star, Search } from 'lucide-react';
import api from '../services/api';

const NiveauxPage = () => {
  const [niveaux, setNiveaux] = useState([]);
  const [filteredNiveaux, setFilteredNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [newNiveau, setNewNiveau] = useState({ libelle: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const menuRef = useRef(null);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const loadNiveaux = async () => {
    try {
      setLoading(true);
      const data = await api.niveau.getAll();
      setNiveaux(Array.isArray(data) ? data : []);
      setFilteredNiveaux(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      showNotification("Erreur lors du chargement des niveaux", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNiveaux();
  }, []);

  useEffect(() => {
    let result = [...niveaux];
    
    if (searchTerm) {
      result = result.filter(item => 
        item.libelle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType === 'licence') {
      result = result.filter(item => 
        item.libelle.toLowerCase().includes('licence') || 
        item.libelle.toLowerCase().includes('l1') ||
        item.libelle.toLowerCase().includes('l2') ||
        item.libelle.toLowerCase().includes('l3')
      );
    } else if (filterType === 'master') {
      result = result.filter(item => 
        item.libelle.toLowerCase().includes('master') || 
        item.libelle.toLowerCase().includes('m1') ||
        item.libelle.toLowerCase().includes('m2')
      );
    }
    
    setFilteredNiveaux(result);
  }, [searchTerm, filterType, niveaux]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getItemStyle = (libelle) => {
    const lower = libelle.toLowerCase();
    if (lower.includes('licence 1') || lower.includes('l1')) return { color: '#FFD700', icon: 'GraduationCap' };
    if (lower.includes('licence 2') || lower.includes('l2')) return { color: '#FF4B4B', icon: 'GraduationCap' };
    if (lower.includes('licence 3') || lower.includes('l3')) return { color: '#1447dd', icon: 'Award' };
    if (lower.includes('master 1') || lower.includes('m1')) return { color: '#FFD700', icon: 'Trophy' };
    if (lower.includes('master 2') || lower.includes('m2')) return { color: '#FF4B4B', icon: 'Star' };
    return { color: '#8A4CFC', icon: 'GraduationCap' };
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-white" />;
      case 'Award': return <Award className="w-5 h-5 text-white" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-white" />;
      case 'Star': return <Star className="w-5 h-5 text-white" />;
      default: return <GraduationCap className="w-5 h-5 text-white" />;
    }
  };

  const handleAdd = async () => {
    if (!newNiveau.libelle.trim()) {
      showNotification("Veuillez saisir un libellé", 'error');
      return;
    }
    try {
      const result = await api.niveau.create({ libelle: newNiveau.libelle });
      if (result && result.message) {
        await loadNiveaux();
        setShowAddModal(false);
        setNewNiveau({ libelle: '' });
        showNotification(result.message, 'success');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout";
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async (id, libelle) => {
    if (window.confirm(`Supprimer "${libelle}" ?`)) {
      try {
        const result = await api.niveau.delete(id);
        if (result && result.message) {
          await loadNiveaux();
          showNotification(result.message, 'success');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
        showNotification(errorMessage, 'error');
      }
      setOpenMenuId(null);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem({ id: item.id, libelle: item.libelle });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleEdit = async () => {
    if (!editingItem.libelle || !editingItem.libelle.trim()) {
      showNotification("Veuillez saisir un libellé", 'error');
      return;
    }
    try {
      const result = await api.niveau.update(editingItem.id, { libelle: editingItem.libelle.trim() });
      if (result && result.message) {
        await loadNiveaux();
        setShowEditModal(false);
        setEditingItem(null);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la modification";
      showNotification(errorMessage, 'error');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          } min-w-[300px] max-w-md`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{notification.message}</p>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header avec titre et recherche */}
      <div className="mb-6">
     
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un niveau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="all">Tous les niveaux</option>
            <option value="licence">Licence (L1, L2, L3)</option>
            <option value="master">Master (M1, M2)</option>
          </select>
          
          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          {filteredNiveaux.length} niveau(x) trouvé(s)
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {filteredNiveaux.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">Aucun niveau trouvé</div>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                + Ajouter un niveau
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredNiveaux.map((item) => {
                const style = getItemStyle(item.libelle);
                return (
                  <div key={item.id} className="relative">
                    {/* Cardbox style horizontal - comme dans l'HTML */}
                    <article className="bg-white rounded-2xl flex items-center overflow-hidden group card-shadow transition-all duration-500 hover:-translate-y-1 relative p-4 border border-gray-200">
                      {/* Contenu horizontal avec icône à gauche */}
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-6 shadow-md shrink-0"
                          style={{ backgroundColor: style.color }}
                        >
                          {getIconComponent(style.icon)}
                        </div>
                        <h3 className="font-bold text-gray-800 leading-tight group-hover:text-[#FFD700] transition-colors text-sm">
                          {item.libelle}
                        </h3>
                      </div>
                      
                      {/* Bouton trois points en haut à droite */}
                      <div className="absolute top-2 right-2 z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(item.id, e);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                          aria-label="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </article>

                    {/* Menu déroulant */}
                    {openMenuId === item.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 top-0 z-50 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 transform translate-x-full -translate-y-1"
                      >
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.libelle)}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bouton FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-blue-500 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Ajouter un niveau</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Licence 1"
                  value={newNiveau.libelle}
                  onChange={(e) => setNewNiveau({ ...newNiveau, libelle: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Annuler</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Modifier le niveau</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  value={editingItem.libelle || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, libelle: e.target.value })}
                  placeholder="Nom du niveau"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Annuler</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card-shadow { box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08); }
        .card-shadow:hover { box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.12); }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -100%); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default NiveauxPage;