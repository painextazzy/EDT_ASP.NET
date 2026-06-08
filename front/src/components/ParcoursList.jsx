// src/components/NiveauxParcours.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Code, Folder, Palette, MoreVertical, Plus, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const NiveauxParcours = () => {
  const [parcours, setParcours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [newParcours, setNewParcours] = useState({ libelle: '' });
  const menuRef = useRef(null);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Charger les parcours depuis l'API
  const loadParcours = async () => {
    try {
      setLoading(true);
      const data = await api.parcours.getAll();
      setParcours(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      showNotification("Erreur lors du chargement des parcours", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcours();
  }, []);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Récupérer l'icône et la couleur en fonction du libellé
  const getItemStyle = (libelle) => {
    const lower = libelle.toLowerCase();
    if (lower.includes('informatique')) {
      return { color: '#00CED1', icon: 'code' };
    }
    if (lower.includes('management')) {
      return { color: '#FFD700', icon: 'folder' };
    }
    if (lower.includes('multimedia') || lower.includes('multimédia')) {
      return { color: '#8A4CFC', icon: 'palette' };
    }
    return { color: '#8A4CFC', icon: 'folder' };
  };

  // Récupérer l'icône correcte
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'code':
        return <Code className="w-7 h-7 text-white" />;
      case 'folder':
        return <Folder className="w-7 h-7 text-white" />;
      case 'palette':
        return <Palette className="w-7 h-7 text-white" />;
      default:
        return <Folder className="w-7 h-7 text-white" />;
    }
  };

  // Ajouter un parcours
  const handleAdd = async () => {
    if (!newParcours.libelle.trim()) {
      showNotification("Veuillez saisir un libellé", 'error');
      return;
    }

    try {
      const result = await api.parcours.create({ libelle: newParcours.libelle });
      if (result && result.message) {
        await loadParcours();
        setShowAddModal(false);
        setNewParcours({ libelle: '' });
        showNotification(result.message, 'success');
      }
    } catch (error) {
      console.error("Erreur ajout:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout";
      showNotification(errorMessage, 'error');
    }
  };

  // Supprimer un parcours
  const handleDelete = async (id, libelle) => {
    if (window.confirm(`Supprimer "${libelle}" ? Cette action est irréversible.`)) {
      try {
        const result = await api.parcours.delete(id);
        if (result && result.message) {
          await loadParcours();
          showNotification(result.message, 'success');
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
        const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
        showNotification(errorMessage, 'error');
      }
      setOpenMenuId(null);
    }
  };

  // Ouvrir le modal de modification
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  // Modifier un parcours
  const handleEdit = async () => {
    if (!editingItem.libelle.trim()) {
      showNotification("Veuillez saisir un libellé", 'error');
      return;
    }

    try {
      const result = await api.parcours.update(editingItem.id, { libelle: editingItem.libelle });
      if (result && result.message) {
        await loadParcours();
        setShowEditModal(false);
        setEditingItem(null);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      console.error("Erreur modification:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la modification";
      showNotification(errorMessage, 'error');
    }
  };

  // Ordre des parcours
  const orderParcours = (items) => {
    const order = ['Informatique', 'Management', 'Multimédia'];
    return [...items].sort((a, b) => {
      const indexA = order.findIndex(o => a.libelle?.toLowerCase().includes(o.toLowerCase()));
      const indexB = order.findIndex(o => b.libelle?.toLowerCase().includes(o.toLowerCase()));
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  };

  const orderedParcours = orderParcours(parcours);

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-gray-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          } min-w-[300px] max-w-md`}>
            {notification.type === 'success' 
              ? <CheckCircle className="w-5 h-5" /> 
              : <AlertCircle className="w-5 h-5" />
            }
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto pb-24 w-full max-w-7xl">
          {orderedParcours.map((item) => {
            const style = getItemStyle(item.libelle);
            return (
              <article 
                key={item.id} 
                className="bg-white rounded-3xl flex flex-col overflow-hidden group card-shadow transition-all duration-500 hover:-translate-y-2 p-6 min-h-[180px] relative"
              >
                {/* Menu à trois points */}
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={(e) => toggleMenu(item.id, e)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 opacity-60 hover:opacity-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {openMenuId === item.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                    >
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.libelle)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-6"
                    style={{ backgroundColor: style.color }}
                  >
                    {getIconComponent(style.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 leading-tight transition-colors">
                    {item.libelle}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bouton FAB pour ajouter */}
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
              <h3 className="text-lg font-bold text-gray-800">Ajouter un parcours</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ex: Informatique"
                  value={newParcours.libelle}
                  onChange={(e) => setNewParcours({ ...newParcours, libelle: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Modifier le parcours</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingItem.libelle}
                  onChange={(e) => setEditingItem({ ...editingItem, libelle: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card-shadow {
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
        }
        .card-shadow:hover {
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.12);
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NiveauxParcours;