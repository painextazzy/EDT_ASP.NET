// src/components/NiveauxPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Edit, Trash2, X, CheckCircle, AlertCircle, GraduationCap, Award, Trophy, Star } from 'lucide-react';

const NiveauxPage = () => {
  const [niveaux, setNiveaux] = useState([
    { id: 1, libelle: 'Licence 1', color: '#FFD700', icon: 'GraduationCap' },
    { id: 2, libelle: 'Licence 2', color: '#FF4B4B', icon: 'GraduationCap' },
    { id: 3, libelle: 'Licence 3', color: '#1447dd', icon: 'Award' },
    { id: 4, libelle: 'Master 1', color: '#FFD700', icon: 'Trophy' },
    { id: 5, libelle: 'Master 2', color: '#FF4B4B', icon: 'Star' }
  ]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [newNiveau, setNewNiveau] = useState({ libelle: '' });
  const menuRef = useRef(null);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

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

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Récupérer l'icône correcte
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-8 h-8 text-white" />;
      case 'Award':
        return <Award className="w-8 h-8 text-white" />;
      case 'Trophy':
        return <Trophy className="w-8 h-8 text-white" />;
      case 'Star':
        return <Star className="w-8 h-8 text-white" />;
      default:
        return <GraduationCap className="w-8 h-8 text-white" />;
    }
  };

  // Déterminer la couleur et l'icône en fonction du libellé
  const getStyleFromLibelle = (libelle) => {
    const lower = libelle.toLowerCase();
    if (lower.includes('licence 1') || lower.includes('l1')) {
      return { color: '#FFD700', icon: 'GraduationCap' };
    }
    if (lower.includes('licence 2') || lower.includes('l2')) {
      return { color: '#FF4B4B', icon: 'GraduationCap' };
    }
    if (lower.includes('licence 3') || lower.includes('l3')) {
      return { color: '#1447dd', icon: 'Award' };
    }
    if (lower.includes('master 1') || lower.includes('m1')) {
      return { color: '#FFD700', icon: 'Trophy' };
    }
    if (lower.includes('master 2') || lower.includes('m2')) {
      return { color: '#FF4B4B', icon: 'Star' };
    }
    return { color: '#8A4CFC', icon: 'GraduationCap' };
  };

  // Ajouter un niveau
  const handleAdd = () => {
    if (!newNiveau.libelle.trim()) {
      showNotification("Veuillez saisir un libellé", 'error');
      return;
    }

    const newId = Math.max(...niveaux.map(n => n.id), 0) + 1;
    const style = getStyleFromLibelle(newNiveau.libelle);

    const newItem = {
      id: newId,
      libelle: newNiveau.libelle,
      color: style.color,
      icon: style.icon
    };

    setNiveaux([...niveaux, newItem]);
    setShowAddModal(false);
    setNewNiveau({ libelle: '' });
    showNotification("Niveau ajouté avec succès", 'success');
  };

  // Supprimer un niveau
  const handleDelete = (id, libelle) => {
    if (window.confirm(`Supprimer "${libelle}" ? Cette action est irréversible.`)) {
      setNiveaux(niveaux.filter(n => n.id !== id));
      showNotification(`Niveau "${libelle}" supprimé`, 'success');
      setOpenMenuId(null);
    }
  };

  // Ouvrir le modal de modification
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  // Modifier un niveau
  const handleEdit = () => {
    if (!editingItem.libelle.trim()) {
      showNotification("Veuillez saisir un libellé", 'error');
      return;
    }

    const style = getStyleFromLibelle(editingItem.libelle);

    setNiveaux(niveaux.map(n => 
      n.id === editingItem.id 
        ? { ...n, libelle: editingItem.libelle, color: style.color, icon: style.icon }
        : n
    ));
    
    setShowEditModal(false);
    setEditingItem(null);
    showNotification("Niveau modifié avec succès", 'success');
  };

  // Ordre des niveaux
  const orderNiveaux = (items) => {
    const order = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];
    return [...items].sort((a, b) => {
      const indexA = order.findIndex(o => a.libelle.toLowerCase().includes(o.toLowerCase()));
      const indexB = order.findIndex(o => b.libelle.toLowerCase().includes(o.toLowerCase()));
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  };

  const orderedNiveaux = orderNiveaux(niveaux);

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

      {/* Grid des niveaux - 5 cardbox par ligne, centrées */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mx-auto w-full max-w-7xl">
        {orderedNiveaux.map((item) => (
          <article 
            key={item.id} 
            className="bg-white rounded-3xl flex flex-col justify-center overflow-hidden group card-shadow transition-all duration-500 hover:-translate-y-2 p-6 min-h-[140px] relative"
          >
            {/* Bouton menu à trois points */}
            <button 
              onClick={(e) => toggleMenu(item.id, e)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-20"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Menu déroulant */}
            {openMenuId === item.id && (
              <div 
                ref={menuRef}
                className="absolute right-4 top-12 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30"
              >
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
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

            {/* Contenu centré verticalement et horizontalement */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-6 shadow-lg"
                style={{ backgroundColor: item.color }}
              >
                {getIconComponent(item.icon)}
              </div>
              <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-[#FFD700] transition-colors text-center">
                {item.libelle}
              </h3>
            </div>
          </article>
        ))}
      </div>

      {/* Bouton FAB pour ajouter */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-blue-500 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ex: Licence 1"
                  value={newNiveau.libelle}
                  onChange={(e) => setNewNiveau({ ...newNiveau, libelle: e.target.value })}
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

export default NiveauxPage;