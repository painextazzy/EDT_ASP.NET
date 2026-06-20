// src/components/calendar/modals/AddEventModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, LayoutGrid, AlertCircle, Loader2, Search, ChevronDown } from 'lucide-react';
import api from '../../../services/api';

const AddEventModal = ({ isOpen, onClose, onSave, newEvent, setNewEvent, coursFiltres = [], salles = [], sallesDisponibles = [], hours = [], isMultiSalleType, toggleSalleSelection, events = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [conflictError, setConflictError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;

  // États pour l'autocomplétion du cours
  const [coursSearch, setCoursSearch] = useState('');
  const [isCoursOpen, setIsCoursOpen] = useState(false);
  const coursRef = useRef(null);

  // Réinitialiser les erreurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setConflictError('');
      setCurrentStep(1);
      setIsSubmitting(false);
      // Initialiser la recherche avec le titre du cours si présent
      if (newEvent.titre) {
        setCoursSearch(newEvent.titre);
      } else {
        setCoursSearch('');
      }
    }
  }, [isOpen]);

  // Mettre à jour la recherche quand le titre change
  useEffect(() => {
    if (newEvent.titre) {
      setCoursSearch(newEvent.titre);
    }
  }, [newEvent.titre]);

  // Fermer le dropdown en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursRef.current && !coursRef.current.contains(event.target)) {
        setIsCoursOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const safeSalles = newEvent.salles || [];
  const allowMultiSalle = typeof isMultiSalleType === 'function' && isMultiSalleType() && newEvent.type !== 'Soutenance';
  const sallesToShow = allowMultiSalle ? (sallesDisponibles || []) : (salles || []);

  const parseDateTime = (date, time) => {
    if (!date || !time) return null;
    const parsed = new Date(`${date}T${time}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatHour = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOverlapping = (startA, endA, startB, endB) => {
    return startA < endB && startB < endA;
  };

  const sameDay = (dateA, dateB) => {
    return dateA.toDateString() === dateB.toDateString();
  };

  const getConflictMessage = ({ checkRoom = true, checkProf = true } = {}) => {
    const currentStart = parseDateTime(newEvent.date, newEvent.heureDebut);
    const currentEnd = parseDateTime(newEvent.date, newEvent.heureFin);
    if (!currentStart || !currentEnd) return '';

    const selectedRoomIds = safeSalles.map(s => s?.id).filter(Boolean);
    const selectedProfId = newEvent.professeurId;
    let roomConflict = null;
    let profConflict = null;

    const desiredDay = new Date(newEvent.date);

    for (const event of events) {
      const eventStart = event.start ? new Date(event.start) : null;
      const eventEnd = event.end ? new Date(event.end) : null;
      if (!eventStart || !eventEnd) continue;
      if (!sameDay(eventStart, desiredDay)) continue;

      if (checkRoom && selectedRoomIds.length > 0 && event.salles) {
        const eventRoomIds = event.salles.map(s => s?.id).filter(Boolean);
        const intersection = selectedRoomIds.some(id => eventRoomIds.includes(id));
        if (intersection && isOverlapping(currentStart, currentEnd, eventStart, eventEnd)) {
          const roomId = selectedRoomIds.find(id => eventRoomIds.includes(id));
          const roomLabel = (salles || []).find(s => s.id === roomId)?.numero || 'cette salle';
          roomConflict = `La salle ${roomLabel} est occupée de ${formatHour(eventStart)} à ${formatHour(eventEnd)}.`;
        }
      }

      if (checkProf && selectedProfId && event.professeurId && Number(event.professeurId) === Number(selectedProfId) && isOverlapping(currentStart, currentEnd, eventStart, eventEnd)) {
        const profName = event.professeur || 'Ce professeur';
        profConflict = `Le professeur ${profName} a déjà un cours sur cette tranche horaire de ${formatHour(eventStart)} à ${formatHour(eventEnd)}.`;
      }

      if (roomConflict && profConflict) break;
    }

    if (roomConflict && profConflict) {
      return `${roomConflict} ${profConflict}`;
    }
    return roomConflict || profConflict || '';
  };

  // Filtrer les cours selon la recherche
  const filteredCours = coursFiltres.filter(c => 
    c.nom?.toLowerCase().includes(coursSearch.toLowerCase()) ||
    c.code?.toLowerCase().includes(coursSearch.toLowerCase())
  );

  // Validation locale par étape
  const validateCurrentStep = () => {
    setConflictError('');

    if (currentStep === 1) {
      if (!newEvent.type) {
        setConflictError("Veuillez sélectionner un type d'événement");
        return false;
      }
      if ((newEvent.type === 'Cours' || newEvent.type === 'Examen' || newEvent.type === 'Soutenance') && !newEvent.titre) {
        setConflictError('Veuillez sélectionner un cours');
        return false;
      }
    }

    if (currentStep === 2) {
      if ((newEvent.type === 'Cours' || newEvent.type === 'Examen' || newEvent.type === 'Soutenance') && !newEvent.date) {
        setConflictError('Veuillez sélectionner une date');
        return false;
      }
      if (!newEvent.heureDebut || !newEvent.heureFin) {
        setConflictError('Veuillez sélectionner les horaires');
        return false;
      }
      
      if (newEvent.heureDebut >= newEvent.heureFin) {
        setConflictError("L'heure de début doit être antérieure à l'heure de fin");
        return false;
      }

      const conflictMessage = getConflictMessage({ checkRoom: false, checkProf: Boolean(newEvent.professeurId) });
      if (conflictMessage) {
        setConflictError(conflictMessage);
        return false;
      }
    }

    if (currentStep === 3) {
      if (safeSalles.length === 0) {
        setConflictError('Veuillez sélectionner au moins une salle');
        return false;
      }

      const conflictMessage = getConflictMessage({ checkRoom: true, checkProf: Boolean(newEvent.professeurId) });
      if (conflictMessage) {
        setConflictError(conflictMessage);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

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

  const handleSelectCours = (cours) => {
    setNewEvent({ 
      ...newEvent, 
      titre: cours.nom,
      enseignementId: cours.id || null,
      professeurId: cours.idEnseignant || cours.professeurId || null
    });
    setCoursSearch(cours.nom);
    setIsCoursOpen(false);
    if (conflictError) setConflictError('');
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    
    try {
      const dateStart = new Date(`${newEvent.date}T${newEvent.heureDebut}`);
      const dateEnd = new Date(`${newEvent.date}T${newEvent.heureFin}`);

      const currentCourse = coursFiltres.find(c => c.nom === newEvent.titre);
      const enseignementId = newEvent.enseignementId || currentCourse?.id || 1;

      const data = {
        idEnseignement: enseignementId,
        typeEvenement: newEvent.type,
        dateDebut: dateStart.toISOString(),
        dateFin: dateEnd.toISOString(),
        idSalles: safeSalles.map(s => s.id),
        motifAnnulation: null
      };

      console.log("📤 Envoi payload au serveur:", data);

      const response = await api.planning.create(data);
      console.log("✅ Réponse serveur reçue:", response);

      onSave(response);
      handleClose();
      
    } catch (error) {
      console.error("❌ Erreur lors de la création du planning:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la création de l'événement";
      setConflictError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setConflictError('');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Ajouter un événement</h2>
            {isSubmitting && (
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
            <li className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer" onClick={() => { if(validateCurrentStep()) setCurrentStep(1); }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tight ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Étape 1</p>
                <p className={`text-xs font-semibold ${currentStep >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>Cours & Type</p>
              </div>
              {currentStep > 1 && <div className="absolute top-4 left-1/2 w-full h-0.5 bg-blue-600 -z-0"></div>}
            </li>

            <li className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer" onClick={() => { if(validateCurrentStep()) setCurrentStep(2); }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tight ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Étape 2</p>
                <p className={`text-xs font-semibold ${currentStep >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>Date & Heure</p>
              </div>
              {currentStep > 2 && <div className="absolute top-4 left-1/2 w-full h-0.5 bg-blue-600 -z-0"></div>}
            </li>

            <li className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer" onClick={() => { if(validateCurrentStep()) setCurrentStep(3); }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tight ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Étape 3</p>
                <p className={`text-xs font-semibold ${currentStep >= 3 ? 'text-gray-800' : 'text-gray-400'}`}>Salle</p>
              </div>
            </li>
          </ol>
        </nav>

        {/* Feedback d'erreur */}
        {conflictError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{conflictError}</p>
          </div>
        )}

        {/* Contenu dynamique */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Cours et type d'événement</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-600">Type d'événement <span className="text-red-500">*</span></label>
                  <select
                    value={newEvent.type || 'Cours'}
                    onChange={(e) => {
                      setNewEvent({ ...newEvent, type: e.target.value, titre: '', salles: [], enseignementId: null, professeurId: null });
                      setCoursSearch('');
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="Cours">Cours</option>
                    <option value="Examen">Examen</option>
                    <option value="Soutenance">Presentation</option>
                  </select>
                </div>

                {(newEvent.type === 'Cours' || newEvent.type === 'Examen' || newEvent.type === 'Soutenance') && (
                  <div className="space-y-1.5" ref={coursRef}>
                    <label className="block text-sm font-semibold text-gray-600">{newEvent.type === 'Soutenance' ? 'Cours à présenter' : 'Cours'} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={coursSearch}
                        onChange={(e) => {
                          setCoursSearch(e.target.value);
                          setIsCoursOpen(true);
                          if (!e.target.value) {
                            setNewEvent({ ...newEvent, titre: '', enseignementId: null, professeurId: null });
                          }
                        }}
                        onFocus={() => setIsCoursOpen(true)}
                        placeholder="Rechercher un cours..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                      />
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isCoursOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isCoursOpen && filteredCours.length > 0 && (
                      <div className="absolute z-50 w-full max-w-md mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCours.map((cours) => (
                            <div
                              key={cours.id}
                              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                                newEvent.titre === cours.nom ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                              }`}
                              onClick={() => handleSelectCours(cours)}
                            >
                              {cours.nom} <span className="text-xs text-gray-400">({cours.code})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {coursFiltres.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">Aucun cours trouvé</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Date et heure</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pl-4">
                {(newEvent.type === 'Cours' || newEvent.type === 'Examen' || newEvent.type === 'Soutenance') && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">Date</label>
                    <input
                      type="date"
                      value={newEvent.date || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-600">Horaire début</label>
                  <select
                    value={newEvent.heureDebut || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, heureDebut: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">--:--</option>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-600">Horaire fin</label>
                  <select
                    value={newEvent.heureFin || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, heureFin: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">--:--</option>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Configuration de la salle</h3>
              </div>
              <div className="pl-4">
                <div className="space-y-1.5 max-w-md">
                  <label className="block text-sm font-semibold text-gray-600">
                    Salle {typeof isMultiSalleType === 'function' && isMultiSalleType() && <span className="text-xs text-gray-500">(Sélection multiple)</span>}
                  </label>
                  
                  {allowMultiSalle ? (
                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                      {sallesToShow.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Aucune salle disponible</p>
                      ) : (
                        sallesToShow.map(salle => (
                          <label key={salle.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={safeSalles.some(s => s.id === salle.id)}
                              onChange={() => toggleSalleSelection(salle)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{salle.numero}</span>
                          </label>
                        ))
                      )}
                      {safeSalles.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">{safeSalles.length} salle(s) sélectionnée(s)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      value={safeSalles[0]?.id || ''}
                      onChange={(e) => {
                        const salle = (salles || []).find(s => s.id === parseInt(e.target.value));
                        setNewEvent({ ...newEvent, salles: salle ? [salle] : [] });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Sélectionner une salle</option>
                      {(salles || []).map(salle => (
                        <option key={salle.id} value={salle.id}>{salle.numero}</option>
                      ))}
                    </select>
                  )}
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
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-all"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
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