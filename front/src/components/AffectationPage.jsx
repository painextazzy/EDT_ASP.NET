import React, { useState, useRef, useEffect } from 'react';

// Composant SearchableSelect
const SearchableSelect = ({ options, value, onChange, placeholder, label, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-on-surface-variant mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white rounded-lg text-left flex justify-between items-center hover:shadow-md transition-shadow"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <span className={!selectedOption ? 'text-gray-400' : 'text-gray-900'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`material-symbols-outlined text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}>
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    value === option.value ? 'bg-sky-50 text-sky-600' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal de modification
const EditAffectationModal = ({ affectation, onClose, onSave, coursOptions, enseignantOptions, niveauOptions, parcoursOptions }) => {
  const [formData, setFormData] = useState({
    coursId: affectation.coursId,
    enseignantId: affectation.enseignant.id,
    niveau: affectation.niveau,
    parcours: affectation.parcours
  });

  const handleSubmit = () => {
    if (!formData.coursId || !formData.enseignantId || !formData.niveau || !formData.parcours) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-on-surface">Modifier l'affectation</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <SearchableSelect
            options={coursOptions}
            value={formData.coursId}
            onChange={(val) => setFormData({ ...formData, coursId: val })}
            placeholder="-- Sélectionner un cours --"
            label="Cours"
            required={true}
          />
          <SearchableSelect
            options={enseignantOptions}
            value={formData.enseignantId}
            onChange={(val) => setFormData({ ...formData, enseignantId: val })}
            placeholder="-- Sélectionner un enseignant --"
            label="Enseignant"
            required={true}
          />
          <SearchableSelect
            options={niveauOptions}
            value={formData.niveau}
            onChange={(val) => setFormData({ ...formData, niveau: val })}
            placeholder="-- Sélectionner un niveau --"
            label="Niveau"
            required={true}
          />
          <SearchableSelect
            options={parcoursOptions}
            value={formData.parcours}
            onChange={(val) => setFormData({ ...formData, parcours: val })}
            placeholder="-- Sélectionner un parcours --"
            label="Parcours"
            required={true}
          />
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

const AffectationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMention, setSelectedMention] = useState('Toutes les Mentions');
  const [selectedNiveau, setSelectedNiveau] = useState('Tous les Niveaux');
  const [showMenu, setShowMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAffectation, setEditingAffectation] = useState(null);
  const [newAffectation, setNewAffectation] = useState({
    coursId: '',
    enseignantId: '',
    niveau: '',
    parcours: ''
  });

  // Données des cours
  const coursList = [
    { id: 1, code: "INF401", name: "Développement Web Avancé", mention: "Informatique", niveau: "L3", parcours: "Informatique" },
    { id: 2, code: "INF202", name: "Algorithmique", mention: "Informatique", niveau: "L1", parcours: "Informatique" },
    { id: 3, code: "INF303", name: "Base de Données", mention: "Informatique", niveau: "L2", parcours: "Informatique" },
    { id: 4, code: "INF404", name: "Intelligence Artificielle", mention: "Informatique", niveau: "M1", parcours: "Informatique" },
    { id: 5, code: "MGT501", name: "Stratégie d'Entreprise", mention: "Management", niveau: "M1", parcours: "Management" },
    { id: 6, code: "MGT202", name: "Marketing Digital", mention: "Management", niveau: "L2", parcours: "Management" },
    { id: 7, code: "MGT303", name: "Gestion de Projet", mention: "Management", niveau: "L3", parcours: "Management" },
    { id: 8, code: "MMD305", name: "Design UI/UX", mention: "Multimedia", niveau: "L3", parcours: "Multimedia" },
    { id: 9, code: "MMD202", name: "Animation 3D", mention: "Multimedia", niveau: "L2", parcours: "Multimedia" },
    { id: 10, code: "MMD401", name: "Réalité Virtuelle", mention: "Multimedia", niveau: "M1", parcours: "Multimedia" }
  ];

  // Données des enseignants
  const enseignantsList = [
    { id: 1, name: "Jean Dupont", specialite: "Informatique" },
    { id: 2, name: "Marie Curie", specialite: "Informatique" },
    { id: 3, name: "Luc Martin", specialite: "Management" },
    { id: 4, name: "Sophie Bernard", specialite: "Multimedia" },
    { id: 5, name: "Pierre Durand", specialite: "Informatique" },
    { id: 6, name: "Isabelle Moreau", specialite: "Management" },
    { id: 7, name: "Thomas Petit", specialite: "Multimedia" }
  ];

  // Niveaux disponibles
  const niveauxList = [
    { value: "L1", label: "Licence 1" },
    { value: "L2", label: "Licence 2" },
    { value: "L3", label: "Licence 3" },
    { value: "M1", label: "Master 1" },
    { value: "M2", label: "Master 2" }
  ];

  // Parcours disponibles
  const parcoursList = [
    { value: "Informatique", label: "Informatique" },
    { value: "Management", label: "Management" },
    { value: "Multimedia", label: "Multimédia" },
    { value: "Cybersécurité", label: "Cybersécurité" },
    { value: "Data Science", label: "Data Science" },
    { value: "Cloud Computing", label: "Cloud Computing" }
  ];

  // Options pour les selects
  const coursOptions = coursList.map(c => ({
    value: c.id,
    label: `${c.code} - ${c.name} (${c.mention} - ${c.niveau})`
  }));

  const enseignantOptions = enseignantsList.map(e => ({
    value: e.id,
    label: `${e.name} (${e.specialite})`
  }));

  const niveauOptions = niveauxList;
  const parcoursOptions = parcoursList;

  // Données des affectations existantes
  const [affectations, setAffectations] = useState([
    {
      id: 1,
      coursId: 1,
      cours: { code: "INF401", name: "Développement Web Avancé" },
      enseignant: { id: 1, name: "Jean Dupont", avatar: "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Jean+Dupont" },
      mention: "Informatique",
      niveau: "L3",
      parcours: "Informatique"
    },
    {
      id: 2,
      coursId: 2,
      cours: { code: "INF202", name: "Algorithmique" },
      enseignant: { id: 2, name: "Marie Curie", avatar: "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Marie+Curie" },
      mention: "Informatique",
      niveau: "L1",
      parcours: "Informatique"
    },
    {
      id: 3,
      coursId: 5,
      cours: { code: "MGT501", name: "Stratégie d'Entreprise" },
      enseignant: { id: 3, name: "Luc Martin", avatar: "https://ui-avatars.com/api/?background=22c55e&color=fff&name=Luc+Martin" },
      mention: "Management",
      niveau: "M1",
      parcours: "Management"
    },
    {
      id: 4,
      coursId: 8,
      cours: { code: "MMD305", name: "Design UI/UX" },
      enseignant: { id: 4, name: "Sophie Bernard", avatar: "https://ui-avatars.com/api/?background=ec4899&color=fff&name=Sophie+Bernard" },
      mention: "Multimedia",
      niveau: "L3",
      parcours: "Multimedia"
    }
  ]);

  // Filtrer les affectations
  const filterAffectations = () => {
    return affectations.filter(aff => {
      const matchSearch = searchTerm === '' || 
        aff.cours.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aff.cours.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aff.enseignant.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMention = selectedMention === 'Toutes les Mentions' || aff.mention === selectedMention;
      const matchNiveau = selectedNiveau === 'Tous les Niveaux' || aff.niveau === selectedNiveau;
      
      return matchSearch && matchMention && matchNiveau;
    });
  };

  // Obtenir les détails du cours sélectionné
  const getSelectedCours = () => {
    return coursList.find(c => c.id === parseInt(newAffectation.coursId));
  };

  // Ajouter une affectation
  const handleAddAffectation = () => {
    if (!newAffectation.coursId || !newAffectation.enseignantId || !newAffectation.niveau || !newAffectation.parcours) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const selectedCours = coursList.find(c => c.id === parseInt(newAffectation.coursId));
    const selectedEnseignant = enseignantsList.find(e => e.id === parseInt(newAffectation.enseignantId));
    
    if (!selectedCours || !selectedEnseignant) {
      alert('Cours ou enseignant non trouvé');
      return;
    }

    const newId = Math.max(...affectations.map(a => a.id), 0) + 1;
    
    setAffectations([...affectations, {
      id: newId,
      coursId: selectedCours.id,
      cours: { code: selectedCours.code, name: selectedCours.name },
      enseignant: { 
        id: selectedEnseignant.id, 
        name: selectedEnseignant.name, 
        avatar: `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(selectedEnseignant.name)}`
      },
      mention: selectedCours.mention,
      niveau: newAffectation.niveau,
      parcours: newAffectation.parcours
    }]);
    
    setNewAffectation({
      coursId: '',
      enseignantId: '',
      niveau: '',
      parcours: ''
    });
    setShowAddModal(false);
  };

  // Modifier une affectation
  const handleEditAffectation = (updatedData) => {
    const selectedCours = coursList.find(c => c.id === parseInt(updatedData.coursId));
    const selectedEnseignant = enseignantsList.find(e => e.id === parseInt(updatedData.enseignantId));
    
    if (!selectedCours || !selectedEnseignant) return;

    setAffectations(affectations.map(aff => 
      aff.id === editingAffectation.id ? {
        ...aff,
        coursId: selectedCours.id,
        cours: { code: selectedCours.code, name: selectedCours.name },
        enseignant: { 
          id: selectedEnseignant.id, 
          name: selectedEnseignant.name, 
          avatar: `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(selectedEnseignant.name)}`
        },
        mention: selectedCours.mention,
        niveau: updatedData.niveau,
        parcours: updatedData.parcours
      } : aff
    ));
    setShowEditModal(false);
    setEditingAffectation(null);
  };

  // Supprimer une affectation
  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette affectation ?')) {
      setAffectations(affectations.filter(aff => aff.id !== id));
      setShowMenu(null);
    }
  };

  // Ouvrir le modal de modification
  const openEditModal = (affectation) => {
    setEditingAffectation(affectation);
    setShowEditModal(true);
    setShowMenu(null);
  };

  // Grouper par mention
  const groupByMention = (filtered) => {
    const groups = {};
    filtered.forEach(aff => {
      if (!groups[aff.mention]) {
        groups[aff.mention] = [];
      }
      groups[aff.mention].push(aff);
    });
    return groups;
  };

  const filteredAffectations = filterAffectations();
  const groupedAffectations = groupByMention(filteredAffectations);
  const mentionsOrder = ['Informatique', 'Management', 'Multimedia'];
  const selectedCoursInfo = getSelectedCours();

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="w-full md:w-[40%] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            placeholder="Rechercher un cours..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 bg-white rounded-lg text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            value={selectedMention}
            onChange={(e) => setSelectedMention(e.target.value)}
          >
            <option>Toutes les Mentions</option>
            <option>Informatique</option>
            <option>Management</option>
            <option>Multimedia</option>
          </select>
          <select
            className="px-4 py-2 bg-white rounded-lg text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
          >
            <option>Tous les Niveaux</option>
            <option>L1</option>
            <option>L2</option>
            <option>L3</option>
            <option>M1</option>
            <option>M2</option>
          </select>
        </div>
      </div>

      {/* Sections by Mention */}
      <div className="space-y-12">
        {mentionsOrder.map(mention => {
          const courses = groupedAffectations[mention] || [];
          if (courses.length === 0) return null;
          
          return (
            <section key={mention}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-primary">{mention}</h2>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((aff) => (
                  <div
                    key={aff.id}
                    className="bg-white p-5 rounded-xl relative group hover:shadow-lg transition-shadow"
                    style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    <div className="mb-4">
                      <span className="font-bold font-mono text-xs tracking-wider text-sky-600">
                        {aff.cours.code}
                      </span>
                      <h3 className="text-lg font-semibold text-on-surface mt-1">
                        {aff.cours.name}
                      </h3>
                    </div>
                    <div className="mb-6">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-2">
                        Assigné à
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            alt="Prof"
                            className="w-full h-full object-cover"
                            src={aff.enseignant.avatar}
                          />
                        </div>
                        <span className="text-sm font-medium">{aff.enseignant.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-bold border border-gray-200 rounded-full text-on-surface-variant">
                        {aff.parcours}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold border border-gray-200 rounded-full text-on-surface-variant">
                        {aff.niveau}
                      </span>
                    </div>
                    
                    {/* Bouton settings avec menu */}
                    <div className="absolute bottom-4 right-4">
                      <button
                        className="text-gray-400 hover:text-sky-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                        onClick={() => setShowMenu(showMenu === aff.id ? null : aff.id)}
                      >
                        <span className="material-symbols-outlined text-xl">settings</span>
                      </button>
                      
                      {showMenu === aff.id && (
                        <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[140px]" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}>
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => openEditModal(aff)}
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Modifier
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={() => handleDelete(aff.id)}
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
      {filteredAffectations.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1' }}>search_off</span>
          <p className="mt-2 text-on-surface-variant">Aucune affectation trouvée</p>
        </div>
      )}

      {/* Bouton FAB flottant pour ajouter */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
        style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* Modal d'ajout avec scroll */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-on-surface">Nouvelle affectation</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              <SearchableSelect
                options={coursOptions}
                value={newAffectation.coursId}
                onChange={(val) => setNewAffectation({ ...newAffectation, coursId: val })}
                placeholder="-- Sélectionner un cours --"
                label="Cours"
                required={true}
              />
              {selectedCoursInfo && (
                <p className="text-xs text-green-600 -mt-2">
                  ✓ {selectedCoursInfo.mention} - {selectedCoursInfo.niveau}
                </p>
              )}

              <SearchableSelect
                options={enseignantOptions}
                value={newAffectation.enseignantId}
                onChange={(val) => setNewAffectation({ ...newAffectation, enseignantId: val })}
                placeholder="-- Sélectionner un enseignant --"
                label="Enseignant"
                required={true}
              />

              <SearchableSelect
                options={niveauOptions}
                value={newAffectation.niveau}
                onChange={(val) => setNewAffectation({ ...newAffectation, niveau: val })}
                placeholder="-- Sélectionner un niveau --"
                label="Niveau"
                required={true}
              />

              <SearchableSelect
                options={parcoursOptions}
                value={newAffectation.parcours}
                onChange={(val) => setNewAffectation({ ...newAffectation, parcours: val })}
                placeholder="-- Sélectionner un parcours --"
                label="Parcours"
                required={true}
              />
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
              >
                Affecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && editingAffectation && (
        <EditAffectationModal
          affectation={editingAffectation}
          onClose={() => {
            setShowEditModal(false);
            setEditingAffectation(null);
          }}
          onSave={handleEditAffectation}
          coursOptions={coursOptions}
          enseignantOptions={enseignantOptions}
          niveauOptions={niveauOptions}
          parcoursOptions={parcoursOptions}
        />
      )}
    </div>
  );
};

export default AffectationPage;