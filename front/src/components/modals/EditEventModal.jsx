// src/components/modals/EditEventModal.jsx
import React from 'react';
import { X, Edit } from 'lucide-react';

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
  if (!isOpen || !editingEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-eight shadow-soft overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Edit className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Modifier l'événement</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onEditEvent(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Titre <span className="text-red-600">*</span>
              </label>
              <select 
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                {titresOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Horaire
              </label>
              <div className="flex items-center gap-2">
                <select 
                  value={editingEvent.startTime}
                  onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  {heuresOptions.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400">—</span>
                <select 
                  value={editingEvent.endTime}
                  onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
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
                Type
              </label>
              <select 
                value={editingEvent.type}
                onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value, salles: [] })}
                className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
              >
                <option value="Cours">Cours</option>
                <option value="Conférence">Conférence</option>
                <option value="Atelier">Atelier</option>
                <option value="Soutenance">Soutenance</option>
                <option value="Examen">Examen</option>
                <option value="Réunion">Réunion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Salle
              </label>
              {(editingEvent.type === 'Examen' || editingEvent.type === 'Soutenance') ? (
                <div>
                  <select 
                    value={editingEvent.salles?.[editingEvent.salles.length - 1] || ''}
                    onChange={(e) => {
                      if (e.target.value && !editingEvent.salles?.includes(e.target.value)) {
                        setEditingEvent({ 
                          ...editingEvent, 
                          salles: [...(editingEvent.salles || []), e.target.value] 
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                  >
                    <option value="">Ajouter une salle</option>
                    {sallesOptions.filter(s => !editingEvent.salles?.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {editingEvent.salles && editingEvent.salles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editingEvent.salles.map((salle, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                          {salle}
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
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <select 
                  value={editingEvent.salle || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, salle: e.target.value })}
                  className="w-full border border-gray-300 rounded-eight focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm py-2.5 px-3 bg-white"
                >
                  <option value="">Sélectionner une salle</option>
                  {sallesOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Date
              </label>
              <input 
                type="date"
                value={editingEvent.startDate}
                onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
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
              onClick={onEditEvent}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg rounded-eight transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
              </svg>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;