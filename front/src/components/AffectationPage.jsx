// src/components/AffectationPage.jsx
import React, { useState } from 'react';

const AffectationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMention, setSelectedMention] = useState('Toutes les Mentions');
  const [selectedNiveau, setSelectedNiveau] = useState('Tous les Niveaux');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingMention, setEditingMention] = useState(null);
  
  const [affectations, setAffectations] = useState({
    Informatique: [
      {
        id: 1,
        code: "INF401",
        name: "Développement Web Avancé",
        professor: "Jean Dupont",
        professorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4U7yEadfbt4gC2hddNoThU9Oi0zcPZ1Hv3dgUyblBTdJMHeu9_JYOTo_sy73gXjG4T1MTp3yyw-CSmSx795ZQj_yNJnMfLJUP8FwAPgVXQuf5JZRg6_y0Rv6EYFsaMoiAfEAG72CDmK9xpC0y-HBnl5wtBivE3DuhdS7gibAvNSX6Jg2rR23nQPEJtP13JWiuMqbWPUFZc75w-viIr46IlpN8d1DzydC8JxgX36SruPQ635duUHIJZbjRDAe2J2o73Q24p8aJ",
        mention: "INFO",
        niveau: "L3"
      },
      {
        id: 2,
        code: "INF202",
        name: "Algorithmique",
        professor: "Marie Curie",
        professorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdYPZU4oNrukQaVXf1xYtDz_Qp2ELS-zvoSCR-OyRtRunxYhqm2yOxgwP1Hpso3_Z6sUKApWoIk9CnuWmQG4NSLIE0bskTwRo4w89bCs7-EEc3BBOtVQN0sKsQOntaCPOg0v-6b64TdKcGXqyKdNRJ6GkZxKaeVzBm0w-9d8M9tVUYO1YrGp9bzw4s2CJRMcjIq9-76rb34Y5tdzOcApfCe6zS2Amq2sPS-cY936GXIi_4otK7D1OQOYEP3RN3VwZfL3NyeDoO",
        mention: "INFO",
        niveau: "L1"
      }
    ],
    Management: [
      {
        id: 3,
        code: "MGT501",
        name: "Stratégie d'Entreprise",
        professor: "Luc Martin",
        professorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC38BD2qGzYvokhxt7h2Yow76YhtKSAX5y-JgeSGZOLtXAd6SymKf5cPtkN_xOOcVfJMXX4--itBpleo-EZcNFGo12uJe5ZNQtldfeBj5Erl7vdB_03Bq9BRCWx2Kip3ROcNt8JO4mSOAmVXrR4RAJR5CPgpPjLMvPVrf3e93rALlEvd-hmH9nomciJhLb_4ngjuoZWg13b8fS0geVNTQa4inbvce9XqC0LhSlib84S498R86jwsLNeOyNpNwbjMnvPKrrL7OHo",
        mention: "MGT",
        niveau: "M1"
      }
    ],
    Multimedia: [
      {
        id: 4,
        code: "MMD305",
        name: "Design UI/UX",
        professor: "Sophie Bernard",
        professorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTtKDvXw42K-4dsxKiDO798bK0FHxZzg4d5-5mFyoGX-oowXx6uxtNnITA8uUAjmqTJ5NxegeisrrK8ASTSU4xL2lZWIS7aYbaVV5ga5PD1KVQ8dpjZJfZJWTlfwaJonvy3Y4RNDYe4Zj3W9Px6jzY3M3XsmQO7aZ6czgY6WwRjAsLSvGz262LjJaqYGP2o2mt8Rb_LpFMDLg6RBsJQkLj1eBVMw9sS5Hg7yl6Z03ekM2HEQG4cDd8jLwyLh53f-DShXW2dZrA",
        mention: "MMD",
        niveau: "L2"
      }
    ]
  });

  const [newAffectation, setNewAffectation] = useState({
    code: '',
    name: '',
    professor: '',
    mention: 'Informatique',
    niveau: 'L3'
  });

  // Ouvrir le menu contextuel
  const handleMenuToggle = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Ouvrir le modal de modification
  const handleOpenEditModal = (mention, course) => {
    setEditingMention(mention);
    setEditingCourse({ ...course });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  // Sauvegarder la modification
  const handleSaveEdit = () => {
    if (!editingCourse.name || !editingCourse.professor) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setAffectations(prev => ({
      ...prev,
      [editingMention]: prev[editingMention].map(c => 
        c.id === editingCourse.id ? editingCourse : c
      )
    }));
    setShowEditModal(false);
    setEditingCourse(null);
    setEditingMention(null);
  };

  // Supprimer une affectation
  const handleDelete = (mention, courseId, courseName) => {
    if (window.confirm(`Supprimer l'affectation "${courseName}" ?`)) {
      setAffectations(prev => ({
        ...prev,
        [mention]: prev[mention].filter(c => c.id !== courseId)
      }));
    }
    setOpenMenuId(null);
  };

  // Ajouter une affectation
  const handleAddAffectation = () => {
    if (!newAffectation.code || !newAffectation.name || !newAffectation.professor) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const newId = Math.max(...Object.values(affectations).flat().map(c => c.id), 0) + 1;
    const avatarUrl = `https://ui-avatars.com/api/?background=0EA5E9&color=fff&name=${encodeURIComponent(newAffectation.professor)}`;

    setAffectations(prev => ({
      ...prev,
      [newAffectation.mention]: [
        ...(prev[newAffectation.mention] || []),
        {
          id: newId,
          code: newAffectation.code,
          name: newAffectation.name,
          professor: newAffectation.professor,
          professorAvatar: avatarUrl,
          mention: newAffectation.mention === 'Informatique' ? 'INFO' : 
                   newAffectation.mention === 'Management' ? 'MGT' : 'MMD',
          niveau: newAffectation.niveau
        }
      ]
    }));

    setNewAffectation({
      code: '',
      name: '',
      professor: '',
      mention: 'Informatique',
      niveau: 'L3'
    });
    setShowAddModal(false);
  };

  const filterAffectations = () => {
    const filtered = {};
    Object.keys(affectations).forEach(mention => {
      const filteredCourses = affectations[mention].filter(course => {
        const matchSearch = searchTerm === '' || 
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.professor.toLowerCase().includes(searchTerm.toLowerCase());
        
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

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="w-full md:w-[40%] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent outline-none transition-all" 
            placeholder="Rechercher un cours..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#252A34] outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all cursor-pointer"
            value={selectedMention}
            onChange={(e) => setSelectedMention(e.target.value)}
          >
            <option>Toutes les Mentions</option>
            <option>Informatique</option>
            <option>Management</option>
            <option>Multimedia</option>
          </select>
          <select 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#252A34] outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all cursor-pointer"
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
          >
            <option>Tous les Niveaux</option>
            <option>L1</option>
            <option>L2</option>
            <option>L3</option>
            <option>M1</option>
          </select>
        </div>
      </div>

      {/* Sections by Mention */}
      <div className="space-y-12">
        {mentionsOrder.map((mention, idx) => {
          const courses = filteredAffectations[mention];
          if (!courses || courses.length === 0 && idx !== 0) return null;
          
          return (
            <section key={mention}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-[#252A34]">{mention}</h2>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Cardbox Ajouter */}
                {idx === 0 && (
                  <div 
                    className="bg-white p-5 border-2 border-dashed border-gray-300 relative group transition-all rounded-2xl hover:shadow-md flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[280px]"
                    onClick={() => setShowAddModal(true)}
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-gray-400">add</span>
                    </div>
                    <span className="text-gray-400 uppercase tracking-widest text-xs">Ajouter une affectation</span>
                  </div>
                )}

                {/* Cartes des affectations */}
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-white p-5 border border-transparent relative group transition-all rounded-2xl shadow-sm hover:shadow-md"
                  >
                    <div className="mb-4">
                      <span className="font-bold font-label text-xs tracking-wider text-[#0EA5E9]">{course.code}</span>
                      <h3 className="text-lg font-semibold text-[#252A34] mt-1">{course.name}</h3>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Assigné à</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img alt="Prof" className="w-full h-full object-cover" src={course.professorAvatar} />
                        </div>
                        <span className="text-sm font-medium">{course.professor}</span>
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
                        className="text-gray-400 hover:text-[#0EA5E9] transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">more_vert</span>
                      </button>

                      {/* Menu contextuel - Modifier / Supprimer */}
                      {openMenuId === course.id && (
                        <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                          <button 
                            onClick={() => handleOpenEditModal(mention, course)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDelete(mention, course.id, course.name)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
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
          <span className="material-symbols-outlined text-5xl text-gray-400">search_off</span>
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
                <h3 className="text-lg font-bold text-[#252A34]">Modifier l'affectation</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-gray-50"
                  value={editingCourse.code}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professeur</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  value={editingCourse.professor}
                  onChange={(e) => setEditingCourse({ ...editingCourse, professor: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mention</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    value={editingCourse.mention === 'INFO' ? 'Informatique' : 
                            editingCourse.mention === 'MGT' ? 'Management' : 'Multimedia'}
                    onChange={(e) => {
                      const newMention = e.target.value;
                      setEditingCourse({ 
                        ...editingCourse, 
                        mention: newMention === 'Informatique' ? 'INFO' : 
                                 newMention === 'Management' ? 'MGT' : 'MMD'
                      });
                    }}
                  >
                    <option>Informatique</option>
                    <option>Management</option>
                    <option>Multimedia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    value={editingCourse.niveau}
                    onChange={(e) => setEditingCourse({ ...editingCourse, niveau: e.target.value })}
                  >
                    <option>L1</option>
                    <option>L2</option>
                    <option>L3</option>
                    <option>M1</option>
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
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
                <h3 className="text-lg font-bold text-[#252A34]">Ajouter une affectation</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  placeholder="Ex: INF999"
                  value={newAffectation.code}
                  onChange={(e) => setNewAffectation({ ...newAffectation, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du cours</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  placeholder="Ex: Nouveau cours"
                  value={newAffectation.name}
                  onChange={(e) => setNewAffectation({ ...newAffectation, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professeur</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  placeholder="Ex: Jean Dupont"
                  value={newAffectation.professor}
                  onChange={(e) => setNewAffectation({ ...newAffectation, professor: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mention</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    value={newAffectation.mention}
                    onChange={(e) => setNewAffectation({ ...newAffectation, mention: e.target.value })}
                  >
                    <option>Informatique</option>
                    <option>Management</option>
                    <option>Multimedia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    value={newAffectation.niveau}
                    onChange={(e) => setNewAffectation({ ...newAffectation, niveau: e.target.value })}
                  >
                    <option>L1</option>
                    <option>L2</option>
                    <option>L3</option>
                    <option>M1</option>
                  </select>
                </div>
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 transition-colors"
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