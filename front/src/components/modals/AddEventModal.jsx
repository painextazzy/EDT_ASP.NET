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
  const [conflictWarning, setConflictWarning] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictEvents, setConflictEvents] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [coursDetails, setCoursDetails] = useState(null); // Pour stocker les détails du cours sélectionné
  const totalSteps = 3;

  // Réinitialiser les erreurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setConflictError('');
      setConflictWarning('');
      setConflictEvents([]);
      setShowConflictModal(false);
      setCurrentStep(1);
      setIsSubmitting(false);
      setCoursDetails(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sallesToShow = isMultiSalleType() ? sallesDisponibles : salles;

  // Fonction pour récupérer les détails d'un cours
  const fetchCoursDetails = async (coursId) => {
    try {
      // Récupérer les détails du cours depuis l'API
      // Adaptez cette fonction selon votre API
      const response = await api.enseignement.getById(coursId);
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération du cours:", error);
      return null;
    }
  };

  // Fonction pour pré-remplir les champs avec les données du cours
  const handleCoursSelection = async (coursId) => {
    if (!coursId) {
      setCoursDetails(null);
      setNewEvent({
        ...newEvent,
        coursLie: null,
        enseignementId: null,
        dateDebut: '',
        dateFin: '',
        heureDebut: '',
        heureFin: '',
        salles: []
      });
      return;
    }

    const cours = coursFiltres.find(c => c.id === parseInt(coursId));
    if (!cours) return;

    // Récupérer les détails complets du cours (avec ses horaires et salles)
    const details = await fetchCoursDetails(coursId);
    
    if (details) {
      setCoursDetails(details);
      
      // Extraire les informations du cours
      const dateDebut = details.dateDebut ? details.dateDebut.split('T')[0] : '';
      const dateFin = details.dateFin ? details.dateFin.split('T')[0] : '';
      const heureDebut = details.dateDebut ? details.dateDebut.split('T')[1].substring(0, 5) : '';
      const heureFin = details.dateFin ? details.dateFin.split('T')[1].substring(0, 5) : '';
      
      // Récupérer les salles du cours
      const sallesCours = details.salles || [];
      
      setNewEvent({
        ...newEvent,
        coursLie: cours,
        enseignementId: cours.id,
        titre: `Présentation - ${cours.nom}`,
        dateDebut: dateDebut,
        dateFin: dateFin,
        heureDebut: heureDebut,
        heureFin: heureFin,
        salles: sallesCours
      });
    } else {
      // Fallback si les détails ne sont pas disponibles
      setNewEvent({
        ...newEvent,
        coursLie: cours,
        enseignementId: cours.id,
        titre: `Présentation - ${cours.nom}`
      });
    }
    
    setConflictError('');
    setConflictWarning('');
  };

  // Vérifier les conflits
  const checkConflicts = async () => {
    setConflictError('');
    setConflictWarning('');
    setConflictEvents([]);
    
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

    if (newEvent.type === 'Présentation') {
      if (!newEvent.titre) {
        setConflictError('Veuillez saisir un titre pour la présentation');
        return false;
      }
      if (!newEvent.coursLie) {
        setConflictError('Veuillez sélectionner le cours associé à la présentation');
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
    
    if (newEvent.type === 'Présentation') {
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
    const conflicts = [];

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
            conflicts.push({
              type: 'professeur',
              message: `Le professeur a déjà un cours sur cette tranche horaire`,
              details: profResponse.event
            });
          }
        } catch (profError) {
          console.warn("Vérification professeur ignorée:", profError.message);
        }
      }

      // 2. Vérifier la disponibilité des salles
      for (const salle of newEvent.salles) {
        try {
          const salleResponse = await api.planning.checkSalleDisponibiliteById(
            salle.id,
            dateStart.toISOString(),
            dateEnd.toISOString()
          );
          
          if (salleResponse && salleResponse.disponible === false) {
            conflicts.push({
              type: 'salle',
              salle: salle.numero || salle.nom || `Salle ${salle.id}`,
              message: `La salle "${salle.numero || salle.nom || salle.id}" est déjà occupée sur cette tranche horaire`,
              details: salleResponse.event
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
        if (newEvent.type === 'Cours') {
          const errorMessages = conflicts.map(c => c.message).join('\n');
          setConflictError(`❌ Impossible d'ajouter ce cours :\n${errorMessages}`);
          return false;
        }
        
        // Pour Examen et Présentation : afficher un avertissement avec option d'écrasement
        if (newEvent.type === 'Examen' || newEvent.type === 'Présentation') {
          const warningMessages = conflicts.map(c => c.message).join('\n');
          setConflictWarning(`⚠️ Conflit détecté :\n${warningMessages}\n\nVoulez-vous quand même ajouter cet événement ? (Il écrasera le créneau existant)`);
          setShowConflictModal(true);
          return 'warning';
        }
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      setIsChecking(false);
      return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      const result = await checkConflicts();
      if (result === 'warning') {
        return;
      }
      if (!result) return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setConflictError('');
      setConflictWarning('');
      setConflictEvents([]);
    }
  };

  // Confirmer l'écrasement pour Examen/Présentation
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
    if (!showConflictModal) {
      const isValid = await checkConflicts();
      if (!isValid || isValid === 'warning') return;
    }
    
    setIsSubmitting(true);
    
    try {
      let dateStart, dateEnd;
      
      if (newEvent.type === 'Présentation') {
        dateStart = new Date(`${newEvent.dateDebut}T${newEvent.heureDebut}`);
        dateEnd = new Date(`${newEvent.dateFin}T${newEvent.heureFin}`);
      } else {
        dateStart = new Date(`${newEvent.date}T${newEvent.heureDebut}`);
        dateEnd = new Date(`${newEvent.date}T${newEvent.heureFin}`);
      }

      const data = {
        idEnseignement: newEvent.enseignementId || 1,
        typeEvenement: newEvent.type,
        dateDebut: dateStart.toISOString(),
        dateFin: dateEnd.toISOString(),
        idSalles: newEvent.salles.map(s => s.id),
        motifAnnulation: null
      };

      console.log("📤 Données envoyées:", data);

      const response = await api.planning.create(data);
      console.log("✅ Réponse:", response);

      if (onSave) {
        onSave(response);
      }
      
      setCurrentStep(1);
      setConflictError('');
      setConflictWarning('');
      setConflictEvents([]);
      setShowConflictModal(false);
      setIsSubmitting(false);
      onClose();
      
    } catch (error) {
      console.error("❌ Erreur lors de la création:", error);
      
      if (error.response?.status === 409) {
        if (newEvent.type === 'Cours') {
          setConflictError(error.response?.data?.message || "❌ Conflit : cette salle ou ce professeur est déjà occupé.");
        } else {
          setConflictWarning(`⚠️ ${error.response?.data?.message || "Conflit détecté"}\n\nVoulez-vous quand même ajouter cet événement ?`);
          setShowConflictModal(true);
        }
      } else {
        setConflictError(error.response?.data?.message || "Erreur lors de la création de l'événement");
      }
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setConflictError('');
    setConflictWarning('');
    setConflictEvents([]);
    setShowConflictModal(false);
    setIsSubmitting(false);
    setCoursDetails(null);
  };

  const showCourseField = () => {
    return newEvent.type === 'Cours' || newEvent.type === 'Examen';
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    setConflictError('');
    setConflictWarning('');
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
            <p className="text-sm text-red-700 whitespace-pre-line">{conflictError}</p>
          </div>
        )}

        {/* Message d'avertissement */}
        {conflictWarning && !showConflictModal && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 flex-shrink-0">
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
                      <span className="font-semibold">Type:</span> {newEvent.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Salle(s):</span> {newEvent.salles.map(s => s.numero || s.nom || s.id).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Horaire:</span> {newEvent.heureDebut} - {newEvent.heureFin}
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
                  Écraser et ajouter
                </button>
              </div>
            </div>
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
                        setNewEvent({ 
                          ...newEvent, 
                          type: e.target.value, 
                          titre: '', 
                          coursLie: null,
                          dateDebut: '',
                          dateFin: '',
                          heureDebut: '',
                          heureFin: '',
                          salles: []
                        });
                        setCoursDetails(null);
                        setConflictError('');
                        setConflictWarning('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Cours">Cours</option>
                      <option value="Examen">Examen</option>
                      <option value="Présentation">Présentation</option>
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
                          setConflictWarning('');
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

                  {newEvent.type === 'Présentation' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-600">
                          Titre de la présentation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newEvent.titre}
                          onChange={(e) => {
                            setNewEvent({ ...newEvent, titre: e.target.value });
                            setConflictError('');
                            setConflictWarning('');
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Ex: Présentation Projet"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-600">
                          Cours associé <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newEvent.coursLie?.id || ''}
                          onChange={(e) => {
                            handleCoursSelection(e.target.value);
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="">Sélectionner un cours</option>
                          {coursFiltres.map(c => (
                            <option key={c.id} value={c.id}>{c.nom}</option>
                          ))}
                        </select>
                        {newEvent.coursLie && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 font-medium">
                              📚 Cours : {newEvent.coursLie.nom}
                            </p>
                            {coursDetails && (
                              <div className="mt-1 text-xs text-blue-600">
                                <p>📅 {newEvent.dateDebut} - {newEvent.dateFin}</p>
                                <p>⏰ {newEvent.heureDebut} - {newEvent.heureFin}</p>
                                <p>🏫 Salle(s): {newEvent.salles.map(s => s.numero || s.nom).join(', ')}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
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
                  {newEvent.type === 'Présentation' && newEvent.coursLie && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Pré-rempli depuis le cours
                    </span>
                  )}
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
                          setConflictWarning('');
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  )}

                  {newEvent.type === 'Présentation' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-600">Date début <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={newEvent.dateDebut}
                          onChange={(e) => {
                            setNewEvent({ ...newEvent, dateDebut: e.target.value });
                            setConflictError('');
                            setConflictWarning('');
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
                            setConflictWarning('');
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
                        setConflictWarning('');
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
                        setConflictWarning('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                {/* Afficher un résumé pour la présentation */}
                {newEvent.type === 'Présentation' && newEvent.coursLie && (
                  <div className="mt-4 pl-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Présentation pour le cours <strong>{newEvent.coursLie.nom}</strong>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        📅 Du {newEvent.dateDebut} au {newEvent.dateFin} • ⏰ {newEvent.heureDebut} - {newEvent.heureFin}
                      </p>
                    </div>
                  </div>
                )}
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
                  {newEvent.type === 'Présentation' && newEvent.coursLie && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Pré-remplie depuis le cours
                    </span>
                  )}
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
                                  setConflictWarning('');
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{salle.numero || salle.nom}</span>
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
                          setConflictWarning('');
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Sélectionner une salle</option>
                        {salles.map(salle => (
                          <option key={salle.id} value={salle.id}>{salle.numero || salle.nom}</option>
                        ))}
                      </select>
                    )}
                    
                    {newEvent.type === 'Présentation' && newEvent.coursLie && newEvent.salles.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          ℹ️ Salle(s) pré-remplie(s) depuis le cours : {newEvent.salles.map(s => s.numero || s.nom).join(', ')}
                        </p>
                      </div>
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
                onClick={handleNext}
                disabled={isChecking || isSubmitting || showConflictModal}
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