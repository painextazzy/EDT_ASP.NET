// src/components/modals/AddEventModal.jsx
import React from 'react';
import { X, Plus } from 'lucide-react';

const AddEventModal = ({ 
  isOpen, 
  onClose, 
  newEvent, 
  setNewEvent, 
  onAddEvent, 
  onClear,
  titresOptions,
  classesOptions,
  heuresOptions,
  sallesOptions
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-eight shadow-soft overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
           
            
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onAddEvent(); }}>
          {/* Row 1: Titre and Horaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                cours <span className="text-red-600">*</span>
              </label>
              <select 
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                <option value="">Sélectionner un titre</option>
                {titresOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Horaire Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Horaire
              </label>
              <div className="flex items-center gap-2">
                <select 
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  {heuresOptions.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400">—</span>
                <select 
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  {heuresOptions.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Classe and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classe Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Classe
              </label>
              <select 
                value={newEvent.classe}
                onChange={(e) => setNewEvent({ ...newEvent, classe: e.target.value })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                {classesOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Type Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type
              </label>
              <select 
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value, salles: [], salle: '' })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                <option value="Cours">Cours</option>
                <option value="Atelier">Atelier</option>
                <option value="Soutenance">Soutenance</option>
                <option value="Examen">Examen</option>
                
              </select>
            </div>
          </div>

          {/* Row 3: Salle and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salle Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Salle
              </label>
              {(newEvent.type === 'Examen' || newEvent.type === 'Soutenance') ? (
                <div>
                  <select 
                    value={newEvent.salles[newEvent.salles.length - 1] || ''}
                    onChange={(e) => {
                      if (e.target.value && !newEvent.salles.includes(e.target.value)) {
                        setNewEvent({ ...newEvent, salles: [...newEvent.salles, e.target.value] });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                  >
                    <option value="">Ajouter une salle</option>
                    {sallesOptions.filter(s => !newEvent.salles.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {newEvent.salles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {newEvent.salles.map((salle, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                          {salle}
                          <button
                            type="button"
                            onClick={() => setNewEvent({
                              ...newEvent,
                              salles: newEvent.salles.filter((_, i) => i !== idx)
                            })}
                            className="ml-1 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <select 
                  value={newEvent.salle}
                  onChange={(e) => setNewEvent({ ...newEvent, salle: e.target.value })}
                  className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  <option value="">Sélectionner une salle</option>
                  {sallesOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Date
              </label>
              <input 
                type="date"
                value={newEvent.startDate}
                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-8 py-5 flex items-center border-t border-gray-100 justify-end">
          <div className="flex items-center gap-3">
          
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-eight transition-all duration-200"
            >
              Annuler
            </button>
            <button 
              onClick={onAddEvent}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg rounded-eight transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
              </svg>
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;