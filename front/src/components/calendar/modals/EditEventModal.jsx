// src/components/calendar/modals/EditEventModal.jsx
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const EditEventModal = ({ isOpen, onClose, onSave, editingEvent, setEditingEvent, salles, hours }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  if (!isOpen || !editingEvent) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleSubmit = () => {
    onSave();
    setCurrentStep(1);
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Modifier l'événement</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Roadmap Navigation - CLICKABLE */}
        <nav className="w-full bg-gray-50 p-6 border-b border-gray-200">
          <ol className="flex items-center justify-between max-w-lg mx-auto">
            {/* Step 1 - Cliquable */}
            <li 
              className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group"
              onClick={() => handleStepClick(1)}
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

            {/* Step 2 - Cliquable */}
            <li 
              className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group"
              onClick={() => handleStepClick(2)}
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

            {/* Step 3 - Cliquable */}
            <li 
              className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer group"
              onClick={() => handleStepClick(3)}
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
                  {/* Type d'événement */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">
                      Type d'événement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingEvent.type || 'Cours'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Cours">Cours</option>
                      <option value="Examen">Examen</option>
                      <option value="Soutenance">Presentation</option>
                    </select>
                  </div>

                  {/* Cours */}
                  {editingEvent.type === 'Cours' && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-600">
                        Cours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingEvent.title || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Nom du cours"
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
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">Date</label>
                    <input
                      type="date"
                      value={editingEvent.date || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Heure début */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">Horaire début</label>
                    <select
                      value={editingEvent.heureDebut || '09:00'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, heureDebut: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  {/* Heure fin */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-600">Horaire fin</label>
                    <select
                      value={editingEvent.heureFin || '10:00'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, heureFin: e.target.value })}
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
                    <label className="block text-sm font-semibold text-gray-600">Salle</label>
                    <select
                      value={editingEvent.salles?.[0]?.id || ''}
                      onChange={(e) => {
                        const salle = salles.find(s => s.id === parseInt(e.target.value));
                        setEditingEvent({ ...editingEvent, salles: salle ? [salle] : [] });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Sélectionner une salle</option>
                      {salles.map(salle => (
                        <option key={salle.id} value={salle.id}>{salle.numero}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="p-6 border-t border-gray-200 flex items-center justify-between gap-4 bg-gray-50">
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                Enregistrer
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

export default EditEventModal;