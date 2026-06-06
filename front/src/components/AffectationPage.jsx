// src/components/AffectationPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Edit, Trash2, Plus, X, User, BookOpen, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import SkeletonCard from './ui/SkeletonCard';

const AffectationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMention, setSelectedMention] = useState('Toutes les Mentions');
  const [selectedNiveau, setSelectedNiveau] = useState('Tous les Niveaux');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingMention, setEditingMention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [coursList, setCoursList] = useState([]);
  const [professeursList, setProfesseursList] = useState([]);
  const [mentionsList, setMentionsList] = useState([]);
  const [niveauxList, setNiveauxList] = useState([]);
  
  const [affectations, setAffectations] = useState({
    Informatique: [],
    Management: [],
    Multimedia: []
  });

  const [newAffectation, setNewAffectation] = useState({
    coursId: '',
    professeurId: '',
    mention: 'Informatique',
    niveau: 'L3'
  });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [cours, professeurs, mentions, niveaux, affectationsData] = await Promise.all([
        api.cours.getAll(),
        api.affectation.getProfesseurs(),
        api.affectation.getMentions(),
        api.affectation.getNiveaux(),
        api.affectation.getAll()
      ]);
      
      setCoursList(Array.isArray(cours) ? cours : []);
      setProfesseursList(Array.isArray(professeurs) ? professeurs : []);
      setMentionsList(Array.isArray(mentions) ? mentions : []);
      setNiveauxList(Array.isArray(niveaux) ? niveaux : []);
      
      const grouped = {
        Informatique: [],
        Management: [],
        Multimedia: []
      };
      
      if (Array.isArray(affectationsData)) {
        affectationsData.forEach(item => {
          const mention = item.mention;
          if (mention === 'Informatique') {
            grouped.Informatique.push({
              id: item.id,
              code: item.code,
              name: item.name,
              professor: item.professor,
              mention: item.mention,
              niveau: item.niveau
            });
          } else if (mention === 'Management') {
            grouped.Management.push({
              id: item.id,
              code: item.code,
              name: item.name,
              professor: item.professor,
              mention: item.mention,
              niveau: item.niveau
            });
          } else if (mention === 'Multimedia') {
            grouped.Multimedia.push({
              id: item.id,
              code: item.code,
              name: item.name,
              professor: item.professor,
              mention: item.mention,
              niveau: item.niveau
            });
          }
        });
      }
      
      setAffectations(grouped);
    } catch (error) {
      console.error('Erreur chargement:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleMenuToggle = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleOpenEditModal = (mention, course) => {
    setEditingMention(mention);
    setEditingCourse({ ...course });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCourse.name || !editingCourse.professor) {
      showNotification("Veuillez remplir tous les champs", 'error');
      return;
    }

    try {
      const result = await api.affectation.update(editingCourse.id, {
        name: editingCourse.name,
        professor: editingCourse.professor,
        mention: editingMention,
        niveau: editingCourse.niveau
      });
      
      if (result.message) {
        await loadAllData();
        setShowEditModal(false);
        setEditingCourse(null);
        setEditingMention(null);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      showNotification("Erreur lors de la modification", 'error');
    }
  };

  const handleDelete = async (mention, courseId, courseName) => {
    if (window.confirm(`Supprimer l'affectation "${courseName}" ?`)) {
      try {
        const result = await api.affectation.delete(courseId);
        if (result.message) {
          await loadAllData();
          showNotification(result.message, 'success');
        }
      } catch (error) {
        showNotification("Erreur lors de la suppression", 'error');
      }
    }
    setOpenMenuId(null);
  };

  const handleAddAffectation = async () => {
    if (!newAffectation.coursId || !newAffectation.professeurId) {
      showNotification("Veuillez sélectionner un cours et un professeur", 'error');
      return;
    }

    const selectedCours = coursList.find(c => c.id === parseInt(newAffectation.coursId));
    const selectedProfesseur = professeursList.find(p => p.id === parseInt(newAffectation.professeurId));

    if (!selectedCours || !selectedProfesseur) {
      showNotification("Erreur lors de la sélection", 'error');
      return;
    }

    try {
      const result = await api.affectation.create({
        code: selectedCours.code,
        name: selectedCours.nom,
        professor: selectedProfesseur.nom,
        mention: newAffectation.mention,
        niveau: newAffectation.niveau
      });
      
      if (result.message) {
        await loadAllData();
        setNewAffectation({
          coursId: '',
          professeurId: '',
          mention: 'Informatique',
          niveau: 'L3'
        });
        setShowAddModal(false);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      showNotification("Erreur lors de l'ajout", 'error');
    }
  };

  const filterAffectations = () => {
    const filtered = {};
    Object.keys(affectations).forEach(mention => {
      const filteredCourses = affectations[mention].filter(course => {
        const matchSearch = searchTerm === '' || 
          course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.professor?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchMention = selectedMention === 'Toutes les Mentions' || mention === selectedMention;
        const matchNiveau = selectedNiveau === 'Tous les Niveaux' || course.niveau === selectedNiveau;
        
        return matchSearch && matchMention && matchNiveau;
      });
      if (filteredCourses.length > 0) {
        filtered[mention] = filteredCourses;
      }
    });
    return filtered;
  };

  const filteredAffectations = filterAffectations();
  const mentionsOrder = ['Informatique', 'Management', 'Multimedia'];

  if (loading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-32 animate-pulse"></div>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="w-full md:w-[40%] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
            placeholder="Rechercher un cours..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            value={selectedMention}
            onChange={(e) => setSelectedMention(e.target.value)}
          >
            <option>Toutes les Mentions</option>
            {mentionsList.map(mention => (
              <option key={mention.id || mention} value={mention.libelle || mention}>
                {mention.libelle || mention}
              </option>
            ))}
          </select>
          <select 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
          >
            <option>Tous les Niveaux</option>
            {niveauxList.map(niveau => (
              <option key={niveau.id || niveau} value={niveau.libelle || niveau}>
                {niveau.libelle || niveau}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sections by Mention */}
      <div className="space-y-12">
        {mentionsOrder.map((mention, idx) => {
          const courses = filteredAffectations[mention] || [];
          
          return (
            <section key={mention}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">{mention}</h2>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Cardbox Ajouter - TOUJOURS dans la première section */}
                {idx === 0 && (
                  <div 
                    className="bg-white p-5 border-2 border-dashed border-gray-300 relative group transition-all rounded-2xl hover:shadow-md flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[280px]"
                    onClick={() => setShowAddModal(true)}
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-gray-400 uppercase tracking-widest text-xs">Ajouter une affectation</span>
                  </div>
                )}

                {/* Cartes des affectations */}
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-white p-5 border border-gray-100 relative group transition-all rounded-2xl shadow-sm hover:shadow-md"
                  >
                    <div className="mb-4">
                      <span className="font-mono text-xs font-bold tracking-wider text-blue-500">{course.code}</span>
                      <h3 className="text-lg font-semibold text-gray-800 mt-1">{course.name}</h3>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Assigné à</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{course.professor}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold border border-gray-200 rounded-full text-gray-600">{course.mention}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold border border-gray-200 rounded-full text-gray-600">{course.niveau}</span>
                    </div>
                    
                    {/* Bouton paramètre avec menu contextuel */}
                    <div className="absolute bottom-4 right-4">
                      <button 
                        onClick={() => handleMenuToggle(course.id)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Menu contextuel - Modifier / Supprimer */}
                      {openMenuId === course.id && (
                        <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                          <button 
                            onClick={() => handleOpenEditModal(mention, course)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDelete(mention, course.id, course.name)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Message si aucun résultat */}
      {Object.keys(filteredAffectations).length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="mt-2 text-gray-500">Aucune affectation trouvée</p>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && editingCourse && (
        <div 
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Modifier l'affectation</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={editingCourse.code || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingCourse.name || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professeur</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingCourse.professor || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, professor: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mention</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingMention || ''}
                    onChange={(e) => setEditingMention(e.target.value)}
                  >
                    <option>Informatique</option>
                    <option>Management</option>
                    <option>Multimedia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingCourse.niveau || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, niveau: e.target.value })}
                  >
                    {niveauxList.map(niveau => (
                      <option key={niveau.id || niveau} value={niveau.libelle || niveau}>
                        {niveau.libelle || niveau}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout avec dropdowns */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Ajouter une affectation</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cours *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAffectation.coursId}
                  onChange={(e) => setNewAffectation({ ...newAffectation, coursId: e.target.value })}
                >
                  <option value="">-- Sélectionner un cours --</option>
                  {coursList.map(cours => (
                    <option key={cours.id} value={cours.id}>
                      {cours.code} - {cours.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professeur *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAffectation.professeurId}
                  onChange={(e) => setNewAffectation({ ...newAffectation, professeurId: e.target.value })}
                >
                  <option value="">-- Sélectionner un professeur --</option>
                  {professeursList.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mention *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAffectation.mention}
                  onChange={(e) => setNewAffectation({ ...newAffectation, mention: e.target.value })}
                >
                  {mentionsList.map(mention => (
                    <option key={mention.id || mention} value={mention.libelle || mention}>
                      {mention.libelle || mention}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAffectation.niveau}
                  onChange={(e) => setNewAffectation({ ...newAffectation, niveau: e.target.value })}
                >
                  {niveauxList.map(niveau => (
                    <option key={niveau.id || niveau} value={niveau.libelle || niveau}>
                      {niveau.libelle || niveau}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddAffectation}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffectationPage;