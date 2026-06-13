// src/components/modals/AddAffectationModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AddAffectationModal = ({ isOpen, onClose, onSave, coursList, professeursList, mentionsList, niveauxList }) => {
  const [formData, setFormData] = useState({
    coursId: '',
    coursNom: '',
    coursCode: '',
    professeurId: '',
    professeurNom: '',
    mention: '',
    niveau: ''
  });
  const [searchCours, setSearchCours] = useState('');
  const [searchProfesseur, setSearchProfesseur] = useState('');
  const [searchMention, setSearchMention] = useState('');
  const [searchNiveau, setSearchNiveau] = useState('');
  const [isCoursDropdownOpen, setIsCoursDropdownOpen] = useState(false);
  const [isProfesseurDropdownOpen, setIsProfesseurDropdownOpen] = useState(false);
  const [isMentionDropdownOpen, setIsMentionDropdownOpen] = useState(false);
  const [isNiveauDropdownOpen, setIsNiveauDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  
  const coursDropdownRef = useRef(null);
  const professeurDropdownRef = useRef(null);
  const mentionDropdownRef = useRef(null);
  const niveauDropdownRef = useRef(null);
  const coursInputRef = useRef(null);
  const professeurInputRef = useRef(null);
  const mentionInputRef = useRef(null);
  const niveauInputRef = useRef(null);

  // Vérifier l'existence via le backend
  const checkDuplicateOnBackend = async (coursId, professeurId, mention, niveau) => {
    if (!coursId || !professeurId || !mention || !niveau) return false;
    
    setChecking(true);
    try {
      const response = await api.affectation.checkExists({
        coursId: parseInt(coursId),
        professeurId: parseInt(professeurId),
        mention: mention,
        niveau: niveau
      });
      return response.exists;
    } catch (error) {
      console.error("Erreur vérification:", error);
      return false;
    } finally {
      setChecking(false);
    }
  };

  // Vérifier quand les données changent
  useEffect(() => {
    const verifyDuplicate = async () => {
      if (formData.coursId && formData.professeurId && formData.mention && formData.niveau) {
        const isDuplicate = await checkDuplicateOnBackend(
          formData.coursId, 
          formData.professeurId, 
          formData.mention, 
          formData.niveau
        );
        if (isDuplicate) {
          setDuplicateError(`Le cours "${formData.coursNom}" est déjà assigné à "${formData.professeurNom}" pour la mention "${formData.mention}" niveau "${formData.niveau}"`);
        } else {
          setDuplicateError('');
        }
      } else {
        setDuplicateError('');
      }
    };
    
    verifyDuplicate();
  }, [formData.coursId, formData.professeurId, formData.mention, formData.niveau]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        coursId: '',
        coursNom: '',
        coursCode: '',
        professeurId: '',
        professeurNom: '',
        mention: '',
        niveau: ''
      });
      setSearchCours('');
      setSearchProfesseur('');
      setSearchMention('');
      setSearchNiveau('');
      setDuplicateError('');
      setIsCoursDropdownOpen(false);
      setIsProfesseurDropdownOpen(false);
      setIsMentionDropdownOpen(false);
      setIsNiveauDropdownOpen(false);
    }
  }, [isOpen]);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursDropdownRef.current && !coursDropdownRef.current.contains(event.target) && 
          coursInputRef.current && !coursInputRef.current.contains(event.target)) {
        setIsCoursDropdownOpen(false);
      }
      if (professeurDropdownRef.current && !professeurDropdownRef.current.contains(event.target) &&
          professeurInputRef.current && !professeurInputRef.current.contains(event.target)) {
        setIsProfesseurDropdownOpen(false);
      }
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target) &&
          mentionInputRef.current && !mentionInputRef.current.contains(event.target)) {
        setIsMentionDropdownOpen(false);
      }
      if (niveauDropdownRef.current && !niveauDropdownRef.current.contains(event.target) &&
          niveauInputRef.current && !niveauInputRef.current.contains(event.target)) {
        setIsNiveauDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les cours
  const filteredCours = coursList.filter(c => 
    c.nom?.toLowerCase().includes(searchCours.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchCours.toLowerCase())
  );

  // Filtrer les professeurs
  const filteredProfesseurs = professeursList.filter(p => 
    p.nom?.toLowerCase().includes(searchProfesseur.toLowerCase())
  );

  // Filtrer les mentions
  const filteredMentions = mentionsList.filter(m => 
    (m.libelle || m)?.toLowerCase().includes(searchMention.toLowerCase())
  );

  // Filtrer les niveaux
  const filteredNiveaux = niveauxList.filter(n => 
    (n.libelle || n)?.toLowerCase().includes(searchNiveau.toLowerCase())
  );

  // Sélectionner un cours
  const selectCours = (cours) => {
    setFormData(prev => ({
      ...prev,
      coursId: cours.id.toString(),
      coursNom: cours.nom,
      coursCode: cours.code
    }));
    setSearchCours(`${cours.code} - ${cours.nom}`);
    setIsCoursDropdownOpen(false);
  };

  // Sélectionner un professeur
  const selectProfesseur = (prof) => {
    setFormData(prev => ({
      ...prev,
      professeurId: prof.id.toString(),
      professeurNom: prof.nom
    }));
    setSearchProfesseur(prof.nom);
    setIsProfesseurDropdownOpen(false);
  };

  // Sélectionner une mention
  const selectMention = (mention) => {
    const mentionValue = mention.libelle || mention;
    setFormData(prev => ({ ...prev, mention: mentionValue }));
    setSearchMention(mentionValue);
    setIsMentionDropdownOpen(false);
  };

  // Sélectionner un niveau
  const selectNiveau = (niveau) => {
    const niveauValue = niveau.libelle || niveau;
    setFormData(prev => ({ ...prev, niveau: niveauValue }));
    setSearchNiveau(niveauValue);
    setIsNiveauDropdownOpen(false);
  };

  // Effacer un champ
  const clearCours = () => {
    setFormData(prev => ({ ...prev, coursId: '', coursNom: '', coursCode: '' }));
    setSearchCours('');
    setIsCoursDropdownOpen(true);
  };

  const clearProfesseur = () => {
    setFormData(prev => ({ ...prev, professeurId: '', professeurNom: '' }));
    setSearchProfesseur('');
    setIsProfesseurDropdownOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.coursId || !formData.professeurId || !formData.mention || !formData.niveau) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (duplicateError) {
      alert(duplicateError);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        coursId: formData.coursId,
        professeurId: formData.professeurId,
        mention: formData.mention,
        niveau: formData.niveau,
        coursCode: formData.coursCode,
        coursNom: formData.coursNom,
        professeurNom: formData.professeurNom
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCours = coursList.find(c => c.id.toString() === formData.coursId);

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Ajouter une affectation</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Cours avec recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cours *</label>
            <div className="relative" ref={coursInputRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cours..."
                  value={searchCours}
                  onChange={(e) => {
                    setSearchCours(e.target.value);
                    setIsCoursDropdownOpen(true);
                    if (e.target.value === '') {
                      setFormData(prev => ({ ...prev, coursId: '', coursNom: '', coursCode: '' }));
                    }
                  }}
                  onFocus={() => setIsCoursDropdownOpen(true)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsCoursDropdownOpen(!isCoursDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCoursDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isCoursDropdownOpen && filteredCours.length > 0 && (
                <div 
                  ref={coursDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredCours.map(cours => (
                    <div
                      key={cours.id}
                      onClick={() => selectCours(cours)}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between ${
                        formData.coursId === cours.id.toString() ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div>
                        <span className="font-mono text-sm text-blue-600">{cours.code}</span>
                        <span className="ml-2 text-sm text-gray-700">{cours.nom}</span>
                      </div>
                      {formData.coursId === cours.id.toString() && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isCoursDropdownOpen && filteredCours.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Aucun cours trouvé
                </div>
              )}
            </div>
            {selectedCours && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-green-600">
                  ✓ Sélectionné: {selectedCours.code} - {selectedCours.nom}
                </p>
                <button
                  type="button"
                  onClick={clearCours}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Professeur avec recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professeur *</label>
            <div className="relative" ref={professeurInputRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un professeur..."
                  value={searchProfesseur}
                  onChange={(e) => {
                    setSearchProfesseur(e.target.value);
                    setIsProfesseurDropdownOpen(true);
                    if (e.target.value === '') {
                      setFormData(prev => ({ ...prev, professeurId: '', professeurNom: '' }));
                    }
                  }}
                  onFocus={() => setIsProfesseurDropdownOpen(true)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsProfesseurDropdownOpen(!isProfesseurDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfesseurDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isProfesseurDropdownOpen && filteredProfesseurs.length > 0 && (
                <div 
                  ref={professeurDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredProfesseurs.map(prof => (
                    <div
                      key={prof.id}
                      onClick={() => selectProfesseur(prof)}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between ${
                        formData.professeurId === prof.id.toString() ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="text-sm text-gray-700">{prof.nom}</span>
                      {formData.professeurId === prof.id.toString() && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isProfesseurDropdownOpen && filteredProfesseurs.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Aucun professeur trouvé
                </div>
              )}
            </div>
            {formData.professeurNom && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-green-600">
                  ✓ Sélectionné: {formData.professeurNom}
                </p>
                <button
                  type="button"
                  onClick={clearProfesseur}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Mention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mention *</label>
            <div className="relative" ref={mentionInputRef}>
              <input
                type="text"
                placeholder="Sélectionner une mention..."
                value={searchMention}
                onChange={(e) => {
                  setSearchMention(e.target.value);
                  setIsMentionDropdownOpen(true);
                  if (e.target.value === '') {
                    setFormData(prev => ({ ...prev, mention: '' }));
                  }
                }}
                onFocus={() => setIsMentionDropdownOpen(true)}
                className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pl-3"
              />
              <button
                type="button"
                onClick={() => setIsMentionDropdownOpen(!isMentionDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMentionDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMentionDropdownOpen && filteredMentions.length > 0 && (
                <div 
                  ref={mentionDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                >
                  {filteredMentions.map(mention => {
                    const mentionValue = mention.libelle || mention;
                    return (
                      <div
                        key={mentionValue}
                        onClick={() => selectMention(mention)}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between ${
                          formData.mention === mentionValue ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className="text-sm text-gray-700">{mentionValue}</span>
                        {formData.mention === mentionValue && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {isMentionDropdownOpen && filteredMentions.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Aucune mention trouvée
                </div>
              )}
            </div>
            {formData.mention && (
              <p className="mt-1 text-xs text-green-600">✓ Sélectionné: {formData.mention}</p>
            )}
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
            <div className="relative" ref={niveauInputRef}>
              <input
                type="text"
                placeholder="Sélectionner un niveau..."
                value={searchNiveau}
                onChange={(e) => {
                  setSearchNiveau(e.target.value);
                  setIsNiveauDropdownOpen(true);
                  if (e.target.value === '') {
                    setFormData(prev => ({ ...prev, niveau: '' }));
                  }
                }}
                onFocus={() => setIsNiveauDropdownOpen(true)}
                className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pl-3"
              />
              <button
                type="button"
                onClick={() => setIsNiveauDropdownOpen(!isNiveauDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isNiveauDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isNiveauDropdownOpen && filteredNiveaux.length > 0 && (
                <div 
                  ref={niveauDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                >
                  {filteredNiveaux.map(niveau => {
                    const niveauValue = niveau.libelle || niveau;
                    return (
                      <div
                        key={niveauValue}
                        onClick={() => selectNiveau(niveau)}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between ${
                          formData.niveau === niveauValue ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className="text-sm text-gray-700">{niveauValue}</span>
                        {formData.niveau === niveauValue && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {isNiveauDropdownOpen && filteredNiveaux.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Aucun niveau trouvé
                </div>
              )}
            </div>
            {formData.niveau && (
              <p className="mt-1 text-xs text-green-600">✓ Sélectionné: {formData.niveau}</p>
            )}
          </div>

          {/* Indicateur de vérification */}
          {checking && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Vérification en cours...</span>
            </div>
          )}

          {/* Message d'erreur duplicate */}
          {duplicateError && !checking && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{duplicateError}</span>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || checking || !!duplicateError}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAffectationModal;