// src/components/AffectationPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Edit, Trash2, Plus, User, X, AlertCircle, CheckCircle } from 'lucide-react';
import api, { API_URL } from '../services/api';
import SkeletonCard from './ui/SkeletonCard';
import AddAffectationModal from './modals/AddAffectationModal';
import EditAffectationModal from './modals/EditAffectationModal';

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
  const [imageErrors, setImageErrors] = useState({});
  
  const [coursList, setCoursList] = useState([]);
  const [professeursList, setProfesseursList] = useState([]);
  const [mentionsList, setMentionsList] = useState([]);
  const [niveauxList, setNiveauxList] = useState([]);
  
  const [allAffectations, setAllAffectations] = useState([]);
  const [groupedAffectations, setGroupedAffectations] = useState({});

  // ✅ Fonction pour construire l'URL complète de la photo
  const getFullPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    if (photoUrl.startsWith('/')) {
      return `${API_URL}${photoUrl}`;
    }
    return `${API_URL}/${photoUrl}`;
  };

  // ✅ Fonction pour normaliser un nom
  const normalizeName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [cours, professeursAvecPhotos, mentions, niveaux, affectationsData] = await Promise.all([
        api.cours.getAll(),
        api.enseignant.getValides(),
        api.affectation.getMentions(),
        api.affectation.getNiveaux(),
        api.affectation.getAll()
      ]);
      
      setCoursList(Array.isArray(cours) ? cours : []);
      
      // ✅ Créer une carte des professeurs avec les photos
      const professeursMap = {};
      if (Array.isArray(professeursAvecPhotos)) {
        professeursAvecPhotos.forEach(prof => {
          const nom = prof.nom || '';
          const nomNormalized = normalizeName(nom);
          const photoUrl = prof.photoUrl || prof.photo || null;
          
          professeursMap[nomNormalized] = {
            id: prof.id,
            nom: prof.nom,
            photoUrl: photoUrl
          };
          
          professeursMap[`id_${prof.id}`] = {
            id: prof.id,
            nom: prof.nom,
            photoUrl: photoUrl
          };
          
          professeursMap[nom] = {
            id: prof.id,
            nom: prof.nom,
            photoUrl: photoUrl
          };
          
          const sansPrefix = nom.replace(/^(pr|dr|mme|m|prof|professeur)\s+/i, '').trim();
          if (sansPrefix && sansPrefix !== nom) {
            const sansPrefixNormalized = normalizeName(sansPrefix);
            professeursMap[sansPrefixNormalized] = {
              id: prof.id,
              nom: prof.nom,
              photoUrl: photoUrl
            };
            professeursMap[sansPrefix] = {
              id: prof.id,
              nom: prof.nom,
              photoUrl: photoUrl
            };
          }
        });
      }
      
      setProfesseursList(Array.isArray(professeursAvecPhotos) ? professeursAvecPhotos : []);
      setMentionsList(Array.isArray(mentions) ? mentions : []);
      setNiveauxList(Array.isArray(niveaux) ? niveaux : []);
      
      const formattedAffectations = Array.isArray(affectationsData) ? affectationsData.map(item => {
        const professorName = item.professor || item.professeurNom || '';
        const professorId = item.professeurId || item.professorId || null;
        
        const normalizedProfessorName = normalizeName(professorName);
        const professorNameWithoutPrefix = professorName
          .replace(/^(pr|dr|mme|m|prof|professeur)\s+/i, '')
          .trim();
        const normalizedWithoutPrefix = normalizeName(professorNameWithoutPrefix);
        
        let professorPhoto = null;
        
        if (professeursMap[normalizedProfessorName]) {
          professorPhoto = professeursMap[normalizedProfessorName].photoUrl;
        } else if (professeursMap[normalizedWithoutPrefix]) {
          professorPhoto = professeursMap[normalizedWithoutPrefix].photoUrl;
        } else if (professeursMap[professorName]) {
          professorPhoto = professeursMap[professorName].photoUrl;
        } else if (professeursMap[professorNameWithoutPrefix]) {
          professorPhoto = professeursMap[professorNameWithoutPrefix].photoUrl;
        } else if (professorId && professeursMap[`id_${professorId}`]) {
          professorPhoto = professeursMap[`id_${professorId}`].photoUrl;
        } else {
          const matchingKeys = Object.keys(professeursMap).filter(key => {
            if (key.startsWith('id_')) return false;
            return key.includes(normalizedProfessorName) || 
                   normalizedProfessorName.includes(key) ||
                   key.includes(normalizedWithoutPrefix) ||
                   normalizedWithoutPrefix.includes(key);
          });
          
          if (matchingKeys.length > 0) {
            const bestMatch = matchingKeys.sort((a, b) => a.length - b.length)[0];
            professorPhoto = professeursMap[bestMatch].photoUrl;
          }
        }
        
        return {
          id: item.id,
          code: item.code || '',
          name: item.name || '',
          professor: professorName,
          professorPhoto: professorPhoto,
          mention: item.mention || '',
          niveau: item.niveau || '',
          coursId: item.coursId || item.id,
          professeurId: professorId || item.professeurId || ''
        };
      }) : [];
      
      setAllAffectations(formattedAffectations);
      
      const grouped = {};
      formattedAffectations.forEach(item => {
        const mention = item.mention || 'Sans mention';
        if (!grouped[mention]) {
          grouped[mention] = [];
        }
        grouped[mention].push(item);
      });
      
      setGroupedAffectations(grouped);
      
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleOpenEditModal = (course, event) => {
    event.stopPropagation();
    setEditingMention(course.mention);
    setEditingCourse({ ...course });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (formData) => {
    try {
      const result = await api.affectation.update(editingCourse.id, {
        coursId: Number(formData.coursId),
        name: formData.name,
        professor: formData.professor,
        mention: formData.mention,
        niveau: formData.niveau
      });
      
      if (result.message) {
        await loadAllData();
        setShowEditModal(false);
        setEditingCourse(null);
        setEditingMention(null);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      console.error('Erreur modification:', error);
      
      let errorMessage = "Erreur lors de la modification";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorsObj = error.response.data.errors;
        const firstError = Object.values(errorsObj)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = firstError || "Erreur de validation";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleDelete = async (courseId, courseName, event) => {
    event.stopPropagation();
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

  const handleAddAffectation = async (formData) => {
    try {
      const result = await api.affectation.create({
        code: formData.code,
        name: formData.name,
        professor: formData.professor,
        mention: formData.mention,
        niveau: formData.niveau,
        coursId: formData.coursId,
        professeurId: formData.professeurId
      });
      
      if (result.message) {
        await loadAllData();
        setShowAddModal(false);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleImageError = (courseId) => {
    setImageErrors(prev => ({ ...prev, [courseId]: true }));
  };

  const getFilteredAffectations = () => {
    let filtered = [...allAffectations];
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.professor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMention !== 'Toutes les Mentions') {
      filtered = filtered.filter(item => item.mention === selectedMention);
    }
    
    if (selectedNiveau !== 'Tous les Niveaux') {
      filtered = filtered.filter(item => item.niveau === selectedNiveau);
    }
    
    const grouped = {};
    filtered.forEach(item => {
      const mention = item.mention || 'Sans mention';
      if (!grouped[mention]) {
        grouped[mention] = [];
      }
      grouped[mention].push(item);
    });
    
    return grouped;
  };

  const filteredGroupedAffectations = getFilteredAffectations();
  const totalAffectations = allAffectations.length;

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
    <div className="relative">
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
        <div className="w-full md:w-[50%] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm" 
            placeholder="Rechercher un cours, professeur ou code..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[180px]"
            value={selectedMention}
            onChange={(e) => setSelectedMention(e.target.value)}
          >
            <option value="Toutes les Mentions">Toutes les Mentions</option>
            {mentionsList.map(mention => (
              <option key={mention.id || mention} value={mention.libelle || mention}>
                {mention.libelle || mention}
              </option>
            ))}
          </select>
          <select 
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[160px]"
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
          >
            <option value="Tous les Niveaux">Tous les Niveaux</option>
            {niveauxList.map(niveau => (
              <option key={niveau.id || niveau} value={niveau.libelle || niveau}>
                {niveau.libelle || niveau}
              </option>
            ))}
          </select>
          <span className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            {totalAffectations} affectation{totalAffectations > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Sections by Mention */}
      {Object.keys(filteredGroupedAffectations).length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="mt-2 text-gray-500">Aucune affectation trouvée</p>
          <p className="text-sm text-gray-400">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.keys(filteredGroupedAffectations).sort().map((mention) => {
            const courses = filteredGroupedAffectations[mention];
            
            return (
              <section key={mention}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">{mention}</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-sm text-gray-500">{courses.length} cours</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course) => {
                    const fullPhotoUrl = getFullPhotoUrl(course.professorPhoto);
                    const hasImage = course.professorPhoto && !imageErrors[course.id];
                    
                    return (
                      <div 
                        key={course.id} 
                        className="bg-white p-5 border border-gray-100 relative group transition-all rounded-2xl shadow-sm hover:shadow-md flex flex-col"
                      >
                        {/* Photo de profil en haut */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {hasImage ? (
                              <img 
                                alt={course.professor} 
                                className="w-full h-full object-cover" 
                                src={fullPhotoUrl}
                                onError={() => handleImageError(course.id)}
                              />
                            ) : (
                              <span>{course.professor?.charAt(0)?.toUpperCase() || 'P'}</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {course.professor || 'Professeur'}
                          </span>
                        </div>

                        {/* Cours en gras (sans couleur spécifique) */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                          {course.name}
                        </h3>

                        {/* Code du cours (sans couleur spécifique) */}
                        <span className="font-mono text-xs text-gray-500 mb-3">
                          {course.code || 'N/A'}
                        </span>

                        {/* Mention et Niveau */}
                        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-200">
                          <span className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-full text-gray-600">
                            {course.mention || 'Sans mention'}
                          </span>
                          <span className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-full text-gray-600">
                            {course.niveau || 'Sans niveau'}
                          </span>
                        </div>
                        
                        {/* Bouton paramètre (3 points) */}
                        <div className="absolute bottom-4 right-4">
                          <button 
                            onClick={(e) => handleMenuToggle(course.id, e)}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openMenuId === course.id && (
                            <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                              <button 
                                onClick={(e) => handleOpenEditModal(course, e)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </button>
                              <button 
                                onClick={(e) => handleDelete(course.id, course.name, e)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Bouton "+" flottant */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 hover:bg-sky-700 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AddAffectationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAffectation}
        affectationsExistantes={allAffectations}
      />

      <EditAffectationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCourse(null);
          setEditingMention(null);
        }}
        onSave={handleSaveEdit}
        editingCourse={editingCourse}
        affectationsExistantes={allAffectations}
      />

      <style>{`
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AffectationPage;