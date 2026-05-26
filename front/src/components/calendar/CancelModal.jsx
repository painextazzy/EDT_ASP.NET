// src/components/Calendar/CancelModal.jsx
import React from 'react';
import { format } from 'date-fns';
import frLocale from 'date-fns/locale/fr';

const CancelModal = ({ isOpen, onClose, selectedEvent, cancellationMotif, setCancellationMotif, onConfirm }) => {
  if (!isOpen || !selectedEvent) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-lg">event_busy</span>
            Annulation du cours
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-blue-700 flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-blue-500 text-sm">school</span>
              Cours à annuler
            </p>
            <p className="text-sm font-semibold text-gray-800">{selectedEvent.title}</p>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-gray-400 text-xs">schedule</span>
              {format(selectedEvent.start, 'EEEE d MMMM yyyy', { locale: frLocale })} • {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-gray-400 text-sm">edit_note</span>
              Motif d'annulation
            </label>
            <textarea
              value={cancellationMotif}
              onChange={(e) => setCancellationMotif(e.target.value)}
              placeholder="Veuillez saisir le motif de l'annulation..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none bg-gray-50 text-sm"
              rows="2"
            />
          </div>
        </div>
        
        <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-all flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;