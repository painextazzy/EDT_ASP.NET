// src/components/CoursPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Edit, Trash2, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import SkeletonTableRow from './ui/SkeletonTableRow';

const CoursPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  const [courses, setCourses] = useState([]);

  const [newCourse, setNewCourse] = useState({ code: '', name: '' });
  const [editCourse, setEditCourse] = useState({ code: '', name: '' });

  // Charger les cours depuis l'API
  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.cours.getAll();
      // Transformer les données pour correspondre au format attendu
      const formattedCourses = data.map(c => ({
        id: c.id,
        code: c.code,
        name: c.nom
      }));
      setCourses(formattedCourses);
    } catch (error) {
      showNotification('Erreur lors du chargement des cours', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours au démarrage
  useEffect(() => {
    loadCourses();
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

  // Nettoyer le timeout de notification
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const showNotification = (message, type) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ show: true, message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const filteredCourses = courses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Ajouter un cours
  const handleAddCourse = async () => {
    if (!newCourse.code || !newCourse.name) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    try {
      const result = await api.cours.create({ code: newCourse.code, nom: newCourse.name });
      if (result.message) {
        await loadCourses();
        setNewCourse({ code: '', name: '' });
        setShowAddModal(false);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout';
      showNotification(errorMessage, 'error');
    }
  };

  // Ouvrir le modal de modification
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setEditCourse({ code: course.code, name: course.name });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  // Modifier un cours
  const handleEditCourse = async () => {
    if (!editCourse.code || !editCourse.name) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    try {
      const result = await api.cours.update(editingCourse.id, { 
        code: editCourse.code, 
        nom: editCourse.name 
      });
      if (result.message) {
        await loadCourses();
        setShowEditModal(false);
        setEditingCourse(null);
        setEditCourse({ code: '', name: '' });
        showNotification(result.message, 'success');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la modification';
      showNotification(errorMessage, 'error');
    }
  };

  // Supprimer un cours
  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Supprimer le cours "${course.name}" ?`)) {
      try {
        const result = await api.cours.delete(course.id);
        if (result.message) {
          await loadCourses();
          showNotification(result.message, 'success');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
        showNotification(errorMessage, 'error');
      }
      setOpenMenuId(null);
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${getNotificationStyles(notification.type)} min-w-[300px] max-w-md`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un cours par code ou libellé..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom du cours</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={3} />)
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6">
                      <span className="text-sm font-mono font-semibold text-blue-600">{course.code}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-700">{course.name}</span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(course.id, e)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {openMenuId === course.id && (
                          <div 
                            ref={menuRef}
                            className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-fadeIn"
                          >
                            <button
                              onClick={() => handleOpenEditModal(course)}
                              className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course)}
                              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Message si aucun résultat */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="mt-2 text-gray-500">Aucun cours trouvé</p>
            <p className="text-sm text-gray-400">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Bouton FAB flottant pour ajouter */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 hover:bg-blue-700 active:scale-95 transition-all z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal d'ajout */}
      {showAddModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white/30 z-40 animate-fadeIn"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-scaleIn">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Ajouter un cours</h2>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ex: INFO-999"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cours *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ex: Nouveau cours"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de modification */}
      {showEditModal && editingCourse && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white/30 z-40 animate-fadeIn"
            onClick={() => setShowEditModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-scaleIn">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Modifier le cours</h2>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={editCourse.code}
                    onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cours *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={editCourse.name}
                    onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleEditCourse}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CoursPage;