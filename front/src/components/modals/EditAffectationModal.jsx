// src/components/modals/EditAffectationModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Edit } from 'lucide-react';
import api from '../../services/api';

const EditAffectationModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingCourse,
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

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [cours, professeurs, mentions, niveaux] = await Promise.all([
        api.cours.getAll(),
        api.affectation.getProfesseurs(),
        api.affectation.getMentions(),
        api.affectation.getNiveaux()
      ]);
      
      setCoursList(Array.isArray(cours) ? cours : []);
      
      const profsValides = Array.isArray(professeurs) 
        ? professeurs.filter(p => p && p.nom && p.nom.trim() !== '')
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
      console.error('Erreur chargement donnees:', error);
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
    if (isOpen && editingCourse && coursList.length > 0 && professeursList.length > 0) {
      setFormData({
        coursId: editingCourse.coursId?.toString() || '',
        professeurId: editingCourse.professeurId?.toString() || '',
        mention: editingCourse.mention || '',
        niveau: editingCourse.niveau || ''
      });
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
    }
  }, [isOpen, editingCourse, coursList, professeursList]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    let hasConflict = false;
    
    console.log('🔍 Validation du formulaire');
    console.log('📝 Données du formulaire:', formData);
    console.log('📚 Affectations existantes:', affectationsExistantes);
    console.log('✏️ Cours en cours d\'edition:', editingCourse);
    
    if (!formData.coursId) {
      newErrors.coursId = 'Veuillez selectionner un cours';
      hasConflict = true;
    }
    if (!formData.professeurId) {
      newErrors.professeurId = 'Veuillez selectionner un professeur';
      hasConflict = true;
    }
    if (!formData.mention) {
      newErrors.mention = 'Veuillez selectionner une mention';
      hasConflict = true;
    }
    if (!formData.niveau) {
      newErrors.niveau = 'Veuillez selectionner un niveau';
      hasConflict = true;
    }

    // Verifier si le cours selectionne est deja affecte dans la meme mention ET niveau
    if (formData.coursId && formData.mention && formData.niveau) {
      const coursId = parseInt(formData.coursId);
      const mention = formData.mention;
      const niveau = formData.niveau;
      const currentId = editingCourse?.id;
      
      console.log(`🔍 Recherche d'une affectation avec coursId=${coursId}, mention="${mention}", niveau="${niveau}", id!=${currentId}`);
      
      const existingAffectation = affectationsExistantes.find(a => {
        const aCoursId = parseInt(a.coursId);
        const match = aCoursId === coursId && 
                     a.mention === mention && 
                     a.niveau === niveau && 
                     a.id !== currentId;
        
        console.log(`  - Affectation ${a.id}: coursId=${aCoursId}, mention="${a.mention}", niveau="${a.niveau}", match=${match}`);
        return match;
      });

      if (existingAffectation) {
        console.log('❌ Conflit trouve:', existingAffectation);
        newErrors.coursId = `Ce cours est deja affecte dans ${mention} - ${niveau}`;
        hasConflict = true;
      } else {
        console.log('✅ Aucun conflit trouve');
      }
    }

    setErrors(newErrors);
    console.log('📝 Erreurs:', newErrors);
    console.log('✅ Formulaire valide:', !hasConflict && Object.keys(newErrors).length === 0);
    
    return !hasConflict && Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    const selectedCours = coursList.find(c => c.id === parseInt(formData.coursId));
    const selectedProfesseur = professeursList.find(p => p.id === parseInt(formData.professeurId));

    const dataToSave = {
      name: selectedCours?.nom || '',
      professor: selectedProfesseur?.nom || '',
      mention: formData.mention,
      niveau: formData.niveau
    };

    setIsSubmitting(true);
    try {
      await onSave(dataToSave);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Modifier une affectation</h2>
              <p className="text-sm text-gray-500">Modifiez les informations du cours</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loadingData && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-blue-600">Chargement des donnees...</p>
            </div>
          )}

          {!loadingData && !hasData && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Aucune donnee disponible.</p>
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

          {/* Code du cours - Lecture seule */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Code du cours</label>
            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700">
              {editingCourse?.code || 'N/A'}
            </div>
          </div>

          {/* Cours - Select */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Cours <span className="text-red-500">*</span>
            </label>
            <select
              name="coursId"
              value={formData.coursId}
              onChange={handleChange}
              className={`w-full border ${errors.coursId ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white`}
              disabled={loadingData || !hasData}
            >
              <option value="">Selectionner un cours</option>
              {coursList.map((cours) => (
                <option key={cours.id} value={cours.id.toString()}>
                  {cours.code} - {cours.nom}
                </option>
              ))}
            </select>
            {errors.coursId && <p className="text-red-500 text-xs">{errors.coursId}</p>}
          </div>

          {/* Professeur - Select */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Professeur <span className="text-red-500">*</span></label>
            <select
              name="professeurId"
              value={formData.professeurId}
              onChange={handleChange}
              className={`w-full border ${errors.professeurId ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white`}
              disabled={loadingData || !hasData}
            >
              <option value="">Selectionner un professeur</option>
              {professeursList.map((professeur) => (
                <option key={professeur.id} value={professeur.id.toString()}>
                  {professeur.nom} {professeur.im && `(${professeur.im})`}
                </option>
              ))}
            </select>
            {errors.professeurId && <p className="text-red-500 text-xs">{errors.professeurId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mention - Select */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Mention <span className="text-red-500">*</span></label>
              <select
                name="mention"
                value={formData.mention}
                onChange={handleChange}
                className={`w-full border ${errors.mention ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white`}
                disabled={loadingData || !hasData}
              >
                <option value="">Selectionner une mention</option>
                {mentionsList.map((mention) => {
                  const libelle = mention.libelle || mention;
                  return (
                    <option key={mention.id || libelle} value={libelle}>
                      {libelle}
                    </option>
                  );
                })}
              </select>
              {errors.mention && <p className="text-red-500 text-xs">{errors.mention}</p>}
            </div>

            {/* Niveau - Select */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Niveau <span className="text-red-500">*</span></label>
              <select
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                className={`w-full border ${errors.niveau ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-4 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white`}
                disabled={loadingData || !hasData}
              >
                <option value="">Selectionner un niveau</option>
                {niveauxList.map((niveau) => {
                  const libelle = niveau.libelle || niveau;
                  return (
                    <option key={niveau.id || libelle} value={libelle}>
                      {libelle}
                    </option>
                  );
                })}
              </select>
              {errors.niveau && <p className="text-red-500 text-xs">{errors.niveau}</p>}
            </div>
          </div>

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
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Modification...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Modifier
                </>
              )}
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

export default EditAffectationModal;