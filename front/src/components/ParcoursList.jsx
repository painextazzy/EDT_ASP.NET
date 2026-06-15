// src/components/NiveauxParcours.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Code, Folder, Palette, MoreVertical, Plus, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { CardGridSkeleton } from './SkeletonLoader';

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
    if (lower.includes('informatique')) {
      return { color: '#00CED1', icon: 'code' };
    }
    if (lower.includes('management')) {
      return { color: '#8A4CFC', icon: 'folder' };
    }
    if (lower.includes('multimedia') || lower.includes('multimédia')) {
      return { color: '#8A4CFC', icon: 'palette' };
    }
    return { color: '#8A4CFC', icon: 'folder' };
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'code':
        return <Code className="w-5 h-5 text-white" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-white" />;
      case 'palette':
        return <Palette className="w-5 h-5 text-white" />;
      default:
        return <Folder className="w-5 h-5 text-white" />;
    }
  };

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
      const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout";
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async (id, libelle) => {
    if (window.confirm(`Supprimer "${libelle}" ? Cette action est irréversible.`)) {
      try {
        const result = await api.parcours.delete(id);
        if (result && result.message) {
          await loadParcours();
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
      const result = await api.parcours.update(editingItem.id, { libelle: editingItem.libelle.trim() });
      if (result && result.message) {
        await loadParcours();
        setShowEditModal(false);
        setEditingItem(null);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la modification";
      showNotification(errorMessage, 'error');
    }
  };

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
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
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

      {loading ? (
        <div className="max-w-7xl mx-auto">
          <CardGridSkeleton cards={4} cols={4} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-start items-center">
            {orderedParcours.map((item) => {
              const style = getItemStyle(item.libelle);
              return (
                <div key={item.id} className="relative">
                  {/* Cardbox avec le bouton à l'intérieur */}
                  <article 
                    className="bg-white flex items-center overflow-hidden group card-shadow transition-all duration-500 hover:-translate-y-1 px-4 py-2 border border-gray-200 rounded-xl flex-shrink-0 relative"
                  >
                    {/* Bouton trois points - À l'INTÉRIEUR de la cardbox (en haut à droite) */}
                    <div className="absolute top-1 right-1 z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(item.id, e);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        aria-label="Options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Contenu */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-6 flex-shrink-0"
                        style={{ backgroundColor: style.color }}
                      >
                        {getIconComponent(style.icon)}
                      </div>
                      <h3 className="font-medium text-gray-800 leading-tight group-hover:text-[#00CED1] transition-colors text-sm pr-6">
                        {item.libelle}
                      </h3>
                    </div>
                  </article>

                  {/* Menu déroulant - Positionné en dehors de la cardbox */}
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
                  value={editingItem.libelle || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, libelle: e.target.value })}
                  placeholder="Nom du parcours"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button 
                onClick={handleEdit} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
              >
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