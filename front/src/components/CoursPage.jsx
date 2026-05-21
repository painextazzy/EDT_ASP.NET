import React, { useState } from 'react';

const CoursPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState([
    { id: 1, code: "INFO-402", name: "Algorithmique Avancée" },
    { id: 2, code: "INFO-305", name: "Architecture Réseaux" },
    { id: 3, code: "INFO-501", name: "Intelligence Artificielle" },
    { id: 4, code: "MGMT-204", name: "Gestion de Projet Agile" },
    { id: 5, code: "MGMT-410", name: "Marketing Digital" },
    { id: 6, code: "MULT-301", name: "Design UI/UX" },
    { id: 7, code: "NET-101", name: "Réseaux et Télécoms" },
    { id: 8, code: "DATA-202", name: "Analyse de Données" },
    { id: 9, code: "SOFT-303", name: "Génie Logiciel" },
    { id: 10, code: "MATH-105", name: "Probabilités et Statistiques" },
    { id: 11, code: "CYB-404", name: "Cybersécurité" }
  ]);

  const [newCourse, setNewCourse] = useState({ code: '', name: '' });

  // Filtrer les cours
  const filterCourses = () => {
    if (searchTerm === '') return courses;
    return courses.filter(course => 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Ajouter un cours
  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      setCourses([...courses, { 
        id: Date.now(), 
        code: newCourse.code, 
        name: newCourse.name 
      }]);
      setNewCourse({ code: '', name: '' });
      setShowAddModal(false);
    }
  };

  const filteredCourses = filterCourses();

  return (
    <div>
      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative w-full max-w-lg">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher un cours par code ou libellé..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 transition-all focus:ring-sky-500/20 focus:border-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderColor: '#c3c7c8' }}
          />
        </div>
      </div>

      {/* Liste des cours en puces */}
      <div className="flex flex-wrap gap-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border border-outline-variant shadow-sm px-4 py-2 flex items-center justify-center hover:shadow-md transition-all"
            style={{ backgroundColor: '#ffffff', borderColor: '#c3c7c8' }}
          >
            <span className="font-mono font-bold tracking-wider mr-3 text-sky-500 text-sm">
              {course.code}
            </span>
            <span className="text-sm text-on-surface-variant font-medium">
              {course.name}
            </span>
          </div>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1' }}>search_off</span>
          <p className="mt-2 text-on-surface-variant">Aucun cours trouvé</p>
        </div>
      )}

      {/* Bouton FAB flottant */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

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
            <div className="p-5 border-b border-outline-variant" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-on-surface">Ajouter un cours</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Code du cours
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  placeholder="Ex: INFO-999"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  style={{ borderColor: '#c3c7c8' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Nom du cours
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  placeholder="Ex: Nouveau cours"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  style={{ borderColor: '#c3c7c8' }}
                />
              </div>
            </div>

            <div className="p-5 border-t border-outline-variant flex justify-end gap-3" style={{ borderColor: '#e2e8f0' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddCourse}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
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

export default CoursPage;