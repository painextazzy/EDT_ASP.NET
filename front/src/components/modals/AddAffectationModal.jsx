// src/components/modals/AddAffectationModal.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const AddAffectationModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  affectationsExistantes = []
}) => {
  const [formData, setFormData] = useState({
    coursId: '',
    professeurId: '',
    mention: '',
    niveau: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [coursList, setCoursList] = useState([]);
  const [professeursList, setProfesseursList] = useState([]);
  const [mentionsList, setMentionsList] = useState([]);
  const [niveauxList, setNiveauxList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [coursSearch, setCoursSearch] = useState('');
  const [professeurSearch, setProfesseurSearch] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [niveauSearch, setNiveauSearch] = useState('');

  const [isCoursOpen, setIsCoursOpen] = useState(false);
  const [isProfesseurOpen, setIsProfesseurOpen] = useState(false);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [isNiveauOpen, setIsNiveauOpen] = useState(false);

  const coursRef = useRef(null);
  const professeurRef = useRef(null);
  const mentionRef = useRef(null);
  const niveauRef = useRef(null);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [cours, enseignantsValides, mentions, niveaux] = await Promise.all([
        api.cours.getAll(),
        api.enseignant.getValides(),
        api.affectation.getMentions(),
        api.affectation.getNiveaux()
      ]);
      
      setCoursList(Array.isArray(cours) ? cours : []);
      
      // ✅ Filtrer : uniquement les enseignants validés, avec un nom non vide, et exclure les admins
      const profsValides = Array.isArray(enseignantsValides) 
        ? enseignantsValides
            .filter(p => p && p.nom && p.nom.trim() !== '')
            .filter(p => {
              // Exclure les administrateurs si le champ 'role' ou 'estAdmin' est présent
              if (p.role && p.role.toUpperCase() === 'ADMIN') return false;
              if (p.estAdmin === true) return false;
              if (p.isAdmin === true) return false;
              // Fallback : exclure par email ou nom (au cas où)
              if (p.email && p.email.toLowerCase().includes('admin')) return false;
              if (p.nom && p.nom.toLowerCase().includes('admin')) return false;
              return true;
            })
        : [];
      setProfesseursList(profsValides);
      
      const mentionsValides = Array.isArray(mentions) 
        ? mentions.filter(m => m && (m.libelle || m))
        : [];
      setMentionsList(mentionsValides);
      
      const niveauxValides = Array.isArray(niveaux) 
        ? niveaux.filter(n => n && (n.libelle || n))
        : [];
      setNiveauxList(niveauxValides);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ coursId: '', professeurId: '', mention: '', niveau: '' });
      setCoursSearch('');
      setProfesseurSearch('');
      setMentionSearch('');
      setNiveauSearch('');
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursRef.current && !coursRef.current.contains(event.target)) setIsCoursOpen(false);
      if (professeurRef.current && !professeurRef.current.contains(event.target)) setIsProfesseurOpen(false);
      if (mentionRef.current && !mentionRef.current.contains(event.target)) setIsMentionOpen(false);
      if (niveauRef.current && !niveauRef.current.contains(event.target)) setIsNiveauOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCours = useMemo(() => {
    if (!Array.isArray(coursList) || coursList.length === 0) return [];
    return coursList.filter(c => 
      c.nom?.toLowerCase().includes(coursSearch.toLowerCase()) ||
      c.code?.toLowerCase().includes(coursSearch.toLowerCase())
    );
  }, [coursList, coursSearch]);

  const filteredProfesseurs = useMemo(() => {
    if (!Array.isArray(professeursList) || professeursList.length === 0) return [];
    return professeursList
      .filter(p => p && p.nom && p.nom.trim() !== '')
      .filter(p => 
        p.nom?.toLowerCase().includes(professeurSearch.toLowerCase()) ||
        (p.im && p.im.toLowerCase().includes(professeurSearch.toLowerCase()))
      );
  }, [professeursList, professeurSearch]);

  const filteredMentions = useMemo(() => {
    if (!Array.isArray(mentionsList) || mentionsList.length === 0) return [];
    return mentionsList.filter(m => {
      const libelle = m.libelle || m;
      return libelle && libelle.toLowerCase().includes(mentionSearch.toLowerCase());
    });
  }, [mentionsList, mentionSearch]);

  const filteredNiveaux = useMemo(() => {
    if (!Array.isArray(niveauxList) || niveauxList.length === 0) return [];
    return niveauxList.filter(n => {
      const libelle = n.libelle || n;
      return libelle && libelle.toLowerCase().includes(niveauSearch.toLowerCase());
    });
  }, [niveauxList, niveauSearch]);

  const checkIfExists = (coursId, mention, niveau) => {
    return affectationsExistantes.some(a => 
      a.coursId === parseInt(coursId) &&
      a.mention === mention &&
      a.niveau === niveau
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.coursId) {
      newErrors.coursId = 'Veuillez sélectionner un cours';
    }
    if (!formData.professeurId) {
      newErrors.professeurId = 'Veuillez sélectionner un professeur';
    }
    if (!formData.mention) {
      newErrors.mention = 'Veuillez sélectionner une mention';
    }
    if (!formData.niveau) {
      newErrors.niveau = 'Veuillez sélectionner un niveau';
    }

    if (formData.coursId && formData.mention && formData.niveau) {
      const coursNom = coursList.find(c => c.id === parseInt(formData.coursId))?.nom || '';
      if (checkIfExists(formData.coursId, formData.mention, formData.niveau)) {
        newErrors.coursId = `Ce cours est déjà assigné à ${formData.mention} - ${formData.niveau}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectCours = (cours) => {
    setFormData(prev => ({ ...prev, coursId: cours.id }));
    setCoursSearch(cours.nom);
    setIsCoursOpen(false);
    if (errors.coursId) setErrors(prev => ({ ...prev, coursId: '' }));
    setSubmitError('');
  };

  const handleSelectProfesseur = (professeur) => {
    setFormData(prev => ({ ...prev, professeurId: professeur.id }));
    setProfesseurSearch(professeur.nom);
    setIsProfesseurOpen(false);
    if (errors.professeurId) setErrors(prev => ({ ...prev, professeurId: '' }));
    setSubmitError('');
  };

  const handleSelectMention = (mention) => {
    const libelle = mention.libelle || mention;
    setFormData(prev => ({ ...prev, mention: libelle }));
    setMentionSearch(libelle);
    setIsMentionOpen(false);
    if (errors.mention) setErrors(prev => ({ ...prev, mention: '' }));
    setSubmitError('');
  };

  const handleSelectNiveau = (niveau) => {
    const libelle = niveau.libelle || niveau;
    setFormData(prev => ({ ...prev, niveau: libelle }));
    setNiveauSearch(libelle);
    setIsNiveauOpen(false);
    if (errors.niveau) setErrors(prev => ({ ...prev, niveau: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) return;

    const selectedCours = coursList.find(c => c.id === parseInt(formData.coursId));
    const selectedProfesseur = professeursList.find(p => p.id === parseInt(formData.professeurId));

    const dataToSave = {
      code: selectedCours?.code || '',
      name: selectedCours?.nom || '',
      professor: selectedProfesseur?.nom || '',
      mention: formData.mention,
      niveau: formData.niveau,
      coursId: formData.coursId,
      professeurId: formData.professeurId
    };

    setIsSubmitting(true);
    try {
      await onSave(dataToSave);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      
      let errorMessage = "Erreur lors de l'ajout";
      
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
      
      if (errorMessage.includes('already') || errorMessage.includes('existe') || errorMessage.includes('unique') || errorMessage.includes('déjà')) {
        const coursNom = selectedCours?.nom || '';
        errorMessage = `Le cours "${coursNom}" est déjà assigné à ${formData.mention} - ${formData.niveau}`;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasData = !loadingData && (coursList.length > 0 || professeursList.length > 0 || mentionsList.length > 0 || niveauxList.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Ajouter une affectation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loadingData && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-sky-400">Chargement des données...</p>
            </div>
          )}

          {!loadingData && !hasData && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Aucune donnée disponible.</p>
            </div>
          )}

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Erreur</p>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* Cours */}
          <div className="space-y-1" ref={coursRef}>
            <label className="block text-sm font-semibold text-gray-700">Cours <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={coursSearch}
                onChange={(e) => {
                  setCoursSearch(e.target.value);
                  setIsCoursOpen(true);
                  if (!e.target.value) setFormData(prev => ({ ...prev, coursId: '' }));
                }}
                onFocus={() => setIsCoursOpen(true)}
                placeholder="Rechercher un cours..."
                className={`w-full border ${errors.coursId ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white`}
                disabled={loadingData || !hasData}
              />
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isCoursOpen ? 'rotate-180' : ''}`} />
            </div>
            {isCoursOpen && filteredCours.length > 0 && (
              <div className="absolute z-50 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {filteredCours.map((cours) => (
                    <div
                      key={cours.id}
                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-sky-50 transition-colors ${
                        formData.coursId === cours.id ? 'bg-sky-100 text-sky-700' : 'text-gray-700'
                      }`}
                      onClick={() => handleSelectCours(cours)}
                    >
                      {cours.nom} <span className="text-xs text-gray-400">({cours.code})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.coursId && <p className="text-red-500 text-xs">{errors.coursId}</p>}
          </div>

          {/* Professeur - uniquement enseignants validés, exclus les admins */}
          <div className="space-y-1" ref={professeurRef}>
            <label className="block text-sm font-semibold text-gray-700">Professeur <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={professeurSearch}
                onChange={(e) => {
                  setProfesseurSearch(e.target.value);
                  setIsProfesseurOpen(true);
                  if (!e.target.value) setFormData(prev => ({ ...prev, professeurId: '' }));
                }}
                onFocus={() => setIsProfesseurOpen(true)}
                placeholder="Rechercher un professeur..."
                className={`w-full border ${errors.professeurId ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white`}
                disabled={loadingData || !hasData}
              />
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isProfesseurOpen ? 'rotate-180' : ''}`} />
            </div>
            {isProfesseurOpen && filteredProfesseurs.length > 0 && (
              <div className="absolute z-50 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {filteredProfesseurs.map((professeur) => (
                    <div
                      key={professeur.id}
                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-sky-50 transition-colors ${
                        formData.professeurId === professeur.id ? 'bg-sky-100 text-sky-400' : 'text-gray-700'
                      }`}
                      onClick={() => handleSelectProfesseur(professeur)}
                    >
                      {professeur.nom} 
                      {professeur.im && <span className="text-xs text-gray-400 ml-2">({professeur.im})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.professeurId && <p className="text-red-500 text-xs">{errors.professeurId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mention */}
            <div className="space-y-1" ref={mentionRef}>
              <label className="block text-sm font-semibold text-gray-700">Mention <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={mentionSearch}
                  onChange={(e) => {
                    setMentionSearch(e.target.value);
                    setIsMentionOpen(true);
                    if (!e.target.value) setFormData(prev => ({ ...prev, mention: '' }));
                  }}
                  onFocus={() => setIsMentionOpen(true)}
                  placeholder="Rechercher une mention..."
                  className={`w-full border ${errors.mention ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white`}
                  disabled={loadingData || !hasData}
                />
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isMentionOpen ? 'rotate-180' : ''}`} />
              </div>
              {isMentionOpen && filteredMentions.length > 0 && (
                <div className="absolute z-50 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMentions.map((mention) => {
                      const libelle = mention.libelle || mention;
                      return (
                        <div
                          key={mention.id || libelle}
                          className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-sky-50 transition-colors ${
                            formData.mention === libelle ? 'bg-sky-100 text-sky-700' : 'text-gray-700'
                          }`}
                          onClick={() => handleSelectMention(mention)}
                        >
                          {libelle}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {errors.mention && <p className="text-red-500 text-xs">{errors.mention}</p>}
            </div>

            {/* Niveau */}
            <div className="space-y-1" ref={niveauRef}>
              <label className="block text-sm font-semibold text-gray-700">Niveau <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={niveauSearch}
                  onChange={(e) => {
                    setNiveauSearch(e.target.value);
                    setIsNiveauOpen(true);
                    if (!e.target.value) setFormData(prev => ({ ...prev, niveau: '' }));
                  }}
                  onFocus={() => setIsNiveauOpen(true)}
                  placeholder="Rechercher un niveau..."
                  className={`w-full border ${errors.niveau ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white`}
                  disabled={loadingData || !hasData}
                />
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isNiveauOpen ? 'rotate-180' : ''}`} />
              </div>
              {isNiveauOpen && filteredNiveaux.length > 0 && (
                <div className="absolute z-50 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredNiveaux.map((niveau) => {
                      const libelle = niveau.libelle || niveau;
                      return (
                        <div
                          key={niveau.id || libelle}
                          className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-sky-50 transition-colors ${
                            formData.niveau === libelle ? 'bg-sky-100 text-sky-700' : 'text-gray-700'
                          }`}
                          onClick={() => handleSelectNiveau(niveau)}
                        >
                          {libelle}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {errors.niveau && <p className="text-red-500 text-xs">{errors.niveau}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingData || !hasData}
              className="px-6 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            background-color: rgba(11, 28, 48, 0.4);
            backdrop-filter: blur(4px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddAffectationModal;