// src/components/calendar/modals/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AddEventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  newEvent, 
  setNewEvent, 
  coursFiltres, 
  salles, 
  sallesDisponibles, 
  hours, 
  isMultiSalleType, 
  toggleSalleSelection 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [conflictError, setConflictError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;

  // Réinitialiser les erreurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setConflictError('');
      setCurrentStep(1);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sallesToShow = isMultiSalleType() ? sallesDisponibles : salles;

  // Vérifier les conflits
  const checkConflicts = async () => {
    setConflictError('');
    
    // Valider les champs requis
    if (!newEvent.type) {
      setConflictError('Veuillez sélectionner un type d\'événement');
      return false;
    }

    if (newEvent.type === 'Cours' || newEvent.type === 'Examen') {
      if (!newEvent.titre) {
        setConflictError('Veuillez sélectionner un cours');
        return false;
      }
      if (!newEvent.date) {
        setConflictError('Veuillez sélectionner une date');
        return false;
      }
    }

    if (newEvent.type === 'Soutenance') {
      if (!newEvent.titre) {
        setConflictError('Veuillez saisir un titre pour la soutenance');
        return false;
      }
      if (!newEvent.dateDebut) {
        setConflictError('Veuillez sélectionner une date de début');
        return false;
      }
      if (!newEvent.dateFin) {
        setConflictError('Veuillez sélectionner une date de fin');
        return false;
      }
      
      // VÉRIFICATION : Date de fin doit être après date de début
      if (newEvent.dateDebut && newEvent.dateFin) {
        const dateDebut = new Date(newEvent.dateDebut);
        const dateFin = new Date(newEvent.dateFin);
        if (dateFin < dateDebut) {
          setConflictError('La date de fin doit être postérieure à la date de début');
          return false;
        }
      }
    }

    if (!newEvent.heureDebut || !newEvent.heureFin) {
      setConflictError('Veuillez sélectionner les horaires');
      return false;
    }

    if (newEvent.salles.length === 0) {
      setConflictError('Veuillez sélectionner au moins une salle');
      return false;
    }

    // Construire les datetime
    let dateStart, dateEnd;
    
    if (newEvent.type === 'Soutenance') {
      dateStart = new Date(`${newEvent.dateDebut}T${newEvent.heureDebut}`);
      dateEnd = new Date(`${newEvent.dateFin}T${newEvent.heureFin}`);
    } else {
      dateStart = new Date(`${newEvent.date}T${newEvent.heureDebut}`);
      dateEnd = new Date(`${newEvent.date}T${newEvent.heureFin}`);
    }

    if (dateStart >= dateEnd) {
      setConflictError('L\'heure de début doit être avant l\'heure de fin');
      return false;
    }

    setIsChecking(true);

    try {
      // 1. Vérifier la disponibilité du professeur
      if (newEvent.professeurId) {
        try {
          const profResponse = await api.planning.checkProfesseurDisponibilite(
            newEvent.professeurId,
            dateStart.toISOString(),
            dateEnd.toISOString()
          );
          
          if (profResponse && profResponse.disponible === false) {
            setConflictError(`Le professeur a déjà un cours sur cette tranche horaire`);
            setIsChecking(false);
            return false;
          }
        } catch (profError) {
          console.warn("Vérification professeur ignorée:", profError.message);
        }
      }

      // 2. Vérifier la disponibilité des salles
      for (const salle of newEvent.salles) {
        try {
          const salleResponse = await api.planning.checkSalleDisponibilite(
            salle.numero,
            dateStart.toISOString(),
            dateEnd.toISOString()
          );
          
          if (salleResponse && salleResponse.disponible === false) {
            setConflictError(`La salle "${salle.numero}" est déjà occupée sur cette tranche horaire`);
            setIsChecking(false);
            return false;
          }
        } catch (salleError) {
          console.warn("Vérification salle ignorée:", salleError.message);
        }
      }

      setIsChecking(false);
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      setIsChecking(false);
      return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      const isValid = await checkConflicts();
      if (!isValid) return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setConflictError('');
    }
  };

  const handleSubmit = async () => {
    // Vérifier les conflits avant de soumettre
    const isValid = await checkConflicts();
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      // Construire les datetime
      let dateStart, dateEnd;
      
      if (newEvent.type === 'Soutenance') {
        dateStart = new Date(`${newEvent.dateDebut}T${newEvent.heureDebut}`);
        dateEnd = new Date(`${newEvent.dateFin}T${newEvent.heureFin}`);
      } else {
        dateStart = new Date(`${newEvent.date}T${newEvent.heureDebut}`);
        dateEnd = new Date(`${newEvent.date}T${newEvent.heureFin}`);
      }

      // Préparer les données pour l'API
      const data = {
        idEnseignement: newEvent.enseignementId || 1, // À remplacer par la vraie valeur
        typeEvenement: newEvent.type,
        dateDebut: dateStart.toISOString(),
        dateFin: dateEnd.toISOString(),
        idSalles: newEvent.salles.map(s => s.id),
        motifAnnulation: null
      };

      console.log("Données envoyées au backend:", data);

      // Appel API pour créer l'événement
      const response = await api.planning.create(data);
      console.log("Réponse du backend:", response);

      // Appeler onSave pour mettre à jour le calendrier
      if (onSave) {
        onSave(response);
      }
      
      // Fermer le modal
      setCurrentStep(1);
      setConflictError('');
      setIsSubmitting(false);
      onClose();
      
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setConflictError(error.response?.data?.message || "Erreur lors de la création de l'événement");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setConflictError('');
    setIsSubmitting(false);
  };

  const showCourseField = () => {
    return newEvent.type === 'Cours' || newEvent.type === 'Examen';
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    setConflictError('');
  };

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Ajouter un événement</h2>
            {(isChecking || isSubmitting) && (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            )}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Roadmap Navigation */}
        <nav className="w-full bg-gray-50 p-6 border-b border-gray-200 flex-shrink-0">
          <ol className="flex items-center justify-between max-w-lg mx-auto">
            <li 
              className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group"
              onClick={() => goToStep(1)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                  currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Étape 1
                </p>
                <p className={`text-xs font-semibold transition-colors ${
                  currentStep >= 1 ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  Cours & Type
                </p>
              </div>
              {currentStep > 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-blue-600 -z-0"></div>
              )}
            </li>

            <li 
              className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group"
              onClick={() => goToStep(2)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                  currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Étape 2
                </p>
                <p className={`text-xs font-semibold transition-colors ${
                  currentStep >= 2 ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  Date & Heure
                </p>
              </div>
              {currentStep > 2 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-blue-600 -z-0"></div>
              )}
            </li>

            <li 
              className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group"
              onClick={() => goToStep(3)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                  currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Étape 3
                </p>
                <p className={`text-xs font-semibold transition-colors ${
                  currentStep >= 3 ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  Salle
                </p>
              </div>
            </li>
          </ol>
        </nav>

        {/* Message d'erreur */}
        {conflictError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{conflictError}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {/* Step 1: Cours et Type */}
          {currentStep === 1 && (
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Cours et type d'événement
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">
                      Type d'événement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, type: e.target.value, titre: '', salles: [] });
                        setConflictError('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Cours">Cours</option>
                      <option value="Examen">Examen</option>
                      <option value="Soutenance">Soutenance</option>
                    </select>
                  </div>

                  {showCourseField() && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-600">
                        Cours <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newEvent.titre}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, titre: e.target.value });
                          setConflictError('');
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Sélectionner un cours</option>
                        {coursFiltres.map(c => (
                          <option key={c.id} value={c.nom}>{c.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newEvent.type === 'Soutenance' && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-600">
                        Titre de la soutenance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newEvent.titre}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, titre: e.target.value });
                          setConflictError('');
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Ex: Soutenance Master 2"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date et Heure */}
          {currentStep === 2 && (
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Date et heure
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pl-4">
                  {(newEvent.type === 'Cours' || newEvent.type === 'Examen') && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-600">Date</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, date: e.target.value });
                          setConflictError('');
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  )}

                  {newEvent.type === 'Soutenance' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-600">Date début <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={newEvent.dateDebut}
                          onChange={(e) => {
                            setNewEvent({ ...newEvent, dateDebut: e.target.value });
                            setConflictError('');
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-600">Date fin <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={newEvent.dateFin}
                          onChange={(e) => {
                            setNewEvent({ ...newEvent, dateFin: e.target.value });
                            setConflictError('');
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">Horaire début</label>
                    <select
                      value={newEvent.heureDebut}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, heureDebut: e.target.value });
                        setConflictError('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">Horaire fin</label>
                    <select
                      value={newEvent.heureFin}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, heureFin: e.target.value });
                        setConflictError('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Salle */}
          {currentStep === 3 && (
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Salle
                  </h3>
                </div>
                <div className="pl-4">
                  <div className="space-y-1.5 max-w-md">
                    <label className="block text-sm font-semibold text-gray-600">
                      Salle {isMultiSalleType() && <span className="text-xs text-gray-500">(Sélection multiple)</span>}
                    </label>
                    
                    {isMultiSalleType() ? (
                      <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                        {sallesToShow.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Aucune salle disponible</p>
                        ) : (
                          sallesToShow.map(salle => (
                            <label key={salle.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={newEvent.salles.some(s => s.id === salle.id)}
                                onChange={() => {
                                  toggleSalleSelection(salle);
                                  setConflictError('');
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{salle.numero}</span>
                            </label>
                          ))
                        )}
                        {newEvent.salles.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">{newEvent.salles.length} salle(s) sélectionnée(s)</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <select
                        value={newEvent.salles[0]?.id || ''}
                        onChange={(e) => {
                          const salle = salles.find(s => s.id === parseInt(e.target.value));
                          setNewEvent({ ...newEvent, salles: salle ? [salle] : [] });
                          setConflictError('');
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Sélectionner une salle</option>
                        {salles.map(salle => (
                          <option key={salle.id} value={salle.id}>{salle.numero}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="p-6 border-t border-gray-200 flex items-center justify-between gap-4 bg-gray-50 flex-shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              Annuler
            </button>
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={isChecking || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isChecking || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <LayoutGrid className="w-4 h-4" />
                    Ajouter
                  </>
                )}
              </button>
            )}
          </div>
        </footer>

        <style>{`
          .modal-overlay {
            background-color: rgba(11, 28, 48, 0.4);
            backdrop-filter: blur(4px);
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddEventModal;