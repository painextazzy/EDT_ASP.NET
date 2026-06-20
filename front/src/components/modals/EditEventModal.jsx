// src/components/modals/EditEventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const EditEventModal = ({ 
  isOpen, 
  onClose, 
  editingEvent, 
  setEditingEvent, 
  onEditEvent,
  titresOptions,
  classesOptions,
  heuresOptions,
  sallesOptions
}) => {
  const [conflictError, setConflictError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Réinitialiser les erreurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setConflictError('');
      setConflictWarning('');
      setShowConflictModal(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !editingEvent) return null;

  // Vérifier les conflits
  const checkConflicts = async () => {
    setConflictError('');
    setConflictWarning('');
    setShowConflictModal(false);

    // Validation des champs requis
    if (!editingEvent.type) {
      setConflictError('Veuillez sélectionner un type d\'événement');
      return false;
    }

    if (!editingEvent.title) {
      setConflictError('Veuillez sélectionner un titre');
      return false;
    }

    if (!editingEvent.startDate || !editingEvent.startTime) {
      setConflictError('Veuillez sélectionner une date et heure de début');
      return false;
    }

    if (!editingEvent.endTime) {
      setConflictError('Veuillez sélectionner une heure de fin');
      return false;
    }

    // Vérifier les salles
    const salleIds = editingEvent.type === 'Examen' || editingEvent.type === 'Soutenance'
      ? editingEvent.salles || []
      : editingEvent.salle ? [editingEvent.salle] : [];

    if (salleIds.length === 0) {
      setConflictError('Veuillez sélectionner au moins une salle');
      return false;
    }

    // Construire les datetime
    const dateStart = new Date(`${editingEvent.startDate}T${editingEvent.startTime}`);
    const dateEnd = new Date(`${editingEvent.startDate}T${editingEvent.endTime}`);

    if (dateStart >= dateEnd) {
      setConflictError('L\'heure de début doit être avant l\'heure de fin');
      return false;
    }

    setIsChecking(true);
    const conflicts = [];

    try {
      // 1. Vérifier la disponibilité du professeur (si disponible)
      if (editingEvent.professeurId) {
        try {
          const profResponse = await api.planning.checkProfesseurDisponibilite(
            editingEvent.professeurId,
            dateStart.toISOString(),
            dateEnd.toISOString(),
            editingEvent.id // Exclure l'événement actuel
          );
          
          if (profResponse && profResponse.disponible === false) {
            conflicts.push({
              type: 'professeur',
              message: 'Le professeur a déjà un cours sur cette tranche horaire'
            });
          }
        } catch (profError) {
          console.warn("Vérification professeur ignorée:", profError.message);
        }
      }

      // 2. Vérifier la disponibilité des salles
      for (const salleId of salleIds) {
        try {
          const salleResponse = await api.planning.checkSalleDisponibiliteById(
            salleId,
            dateStart.toISOString(),
            dateEnd.toISOString(),
            editingEvent.id // Exclure l'événement actuel
          );
          
          if (salleResponse && salleResponse.disponible === false) {
            const salleNom = salleResponse.salle?.nom || `Salle ${salleId}`;
            conflicts.push({
              type: 'salle',
              salle: salleNom,
              message: `La salle "${salleNom}" est déjà occupée sur cette tranche horaire`
            });
          }
        } catch (salleError) {
          console.warn("Vérification salle ignorée:", salleError.message);
        }
      }

      setIsChecking(false);

      // Si des conflits sont trouvés
      if (conflicts.length > 0) {
        setConflictEvents(conflicts);
        
        // Pour les cours : blocage strict
        if (editingEvent.type === 'Cours') {
          const errorMessages = conflicts.map(c => c.message).join('\n');
          setConflictError(`❌ Impossible de modifier ce cours :\n${errorMessages}`);
          return false;
        }
        
        // Pour Examen et Soutenance : afficher un avertissement avec option d'écrasement
        if (editingEvent.type === 'Examen' || editingEvent.type === 'Soutenance') {
          const warningMessages = conflicts.map(c => c.message).join('\n');
          setConflictWarning(`⚠️ Conflit détecté :\n${warningMessages}\n\nVoulez-vous quand même modifier cet événement ? (Il écrasera le créneau existant)`);
          setShowConflictModal(true);
          return 'warning';
        }
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      setIsChecking(false);
      setConflictError("Erreur lors de la vérification des disponibilités");
      return false;
    }
  };

  // Confirmer l'écrasement
  const confirmOverwrite = async () => {
    setShowConflictModal(false);
    setConflictWarning('');
    await handleSubmit();
  };

  // Annuler l'écrasement
  const cancelOverwrite = () => {
    setShowConflictModal(false);
    setConflictWarning('');
    setConflictEvents([]);
  };

  const handleSubmit = async () => {
    // Si on est en mode écrasement, on ne vérifie plus les conflits
    if (!showConflictModal) {
      const isValid = await checkConflicts();
      if (!isValid || isValid === 'warning') return;
    }

    setIsSubmitting(true);
    try {
      // Préparer les données pour l'API
      const data = {
        id: editingEvent.id,
        title: editingEvent.title,
        type: editingEvent.type,
        classe: editingEvent.classe,
        startDate: editingEvent.startDate,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        salles: editingEvent.type === 'Examen' || editingEvent.type === 'Soutenance'
          ? editingEvent.salles || []
          : editingEvent.salle ? [editingEvent.salle] : []
      };

      await onEditEvent(data);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setConflictError(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-eight shadow-soft overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Edit className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Modifier l'événement</h2>
            {(isChecking || isSubmitting) && (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin ml-2" />
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Message d'erreur (blocage) */}
        {conflictError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 whitespace-pre-line">{conflictError}</p>
          </div>
        )}

        {/* Message d'avertissement */}
        {conflictWarning && !showConflictModal && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 whitespace-pre-line">{conflictWarning}</p>
          </div>
        )}

        {/* Modal de confirmation d'écrasement */}
        {showConflictModal && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">⚠️ Conflit détecté</h3>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {conflictWarning}
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Type:</span> {editingEvent.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Salle(s):</span> {editingEvent.type === 'Examen' || editingEvent.type === 'Soutenance' 
                        ? (editingEvent.salles || []).join(', ') 
                        : editingEvent.salle}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Horaire:</span> {editingEvent.startTime} - {editingEvent.endTime}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelOverwrite}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmOverwrite}
                  className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg shadow-amber-500/20 transition-all"
                >
                  Écraser et modifier
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Titre <span className="text-red-600">*</span>
              </label>
              <select 
                value={editingEvent.title}
                onChange={(e) => {
                  setEditingEvent({ ...editingEvent, title: e.target.value });
                  setConflictError('');
                  setConflictWarning('');
                }}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                {titresOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Horaire <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select 
                  value={editingEvent.startTime}
                  onChange={(e) => {
                    setEditingEvent({ ...editingEvent, startTime: e.target.value });
                    setConflictError('');
                    setConflictWarning('');
                  }}
                  className="flex-1 border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  {heuresOptions.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400">—</span>
                <select 
                  value={editingEvent.endTime}
                  onChange={(e) => {
                    setEditingEvent({ ...editingEvent, endTime: e.target.value });
                    setConflictError('');
                    setConflictWarning('');
                  }}
                  className="flex-1 border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  {heuresOptions.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Classe
              </label>
              <select 
                value={editingEvent.classe}
                onChange={(e) => setEditingEvent({ ...editingEvent, classe: e.target.value })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                {classesOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type <span className="text-red-600">*</span>
              </label>
              <select 
                value={editingEvent.type}
                onChange={(e) => {
                  setEditingEvent({ 
                    ...editingEvent, 
                    type: e.target.value, 
                    salles: [],
                    salle: ''
                  });
                  setConflictError('');
                  setConflictWarning('');
                }}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                <option value="Cours">Cours</option>
                <option value="Examen">Examen</option>
                <option value="Soutenance">Soutenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Salle <span className="text-red-600">*</span>
              </label>
              {(editingEvent.type === 'Examen' || editingEvent.type === 'Soutenance') ? (
                <div>
                  <select 
                    value={editingEvent.salles?.[editingEvent.salles.length - 1] || ''}
                    onChange={(e) => {
                      if (e.target.value && !editingEvent.salles?.includes(e.target.value)) {
                        setEditingEvent({ 
                          ...editingEvent, 
                          salles: [...(editingEvent.salles || []), parseInt(e.target.value)] 
                        });
                        setConflictError('');
                        setConflictWarning('');
                      }
                    }}
                    className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                  >
                    <option value="">Ajouter une salle</option>
                    {sallesOptions
                      .filter(s => !editingEvent.salles?.includes(s.id))
                      .map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                  {editingEvent.salles && editingEvent.salles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editingEvent.salles.map((salleId, idx) => {
                        const salle = sallesOptions.find(s => s.id === salleId);
                        return (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                            {salle?.nom || `Salle ${salleId}`}
                            <button
                              type="button"
                              onClick={() => setEditingEvent({
                                ...editingEvent,
                                salles: editingEvent.salles.filter((_, i) => i !== idx)
                              })}
                              className="ml-1 hover:text-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <select 
                  value={editingEvent.salle || ''}
                  onChange={(e) => {
                    setEditingEvent({ ...editingEvent, salle: parseInt(e.target.value) });
                    setConflictError('');
                    setConflictWarning('');
                  }}
                  className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  <option value="">Sélectionner une salle</option>
                  {sallesOptions.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Date <span className="text-red-600">*</span>
              </label>
              <input 
                type="date"
                value={editingEvent.startDate}
                onChange={(e) => {
                  setEditingEvent({ ...editingEvent, startDate: e.target.value });
                  setConflictError('');
                  setConflictWarning('');
                }}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              />
            </div>
          </div>
        </form>

        <div className="bg-gray-50 px-8 py-5 flex items-center border-t border-gray-100 justify-end">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-eight transition-all duration-200"
            >
              Annuler
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isChecking || isSubmitting || showConflictModal}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg rounded-eight transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;