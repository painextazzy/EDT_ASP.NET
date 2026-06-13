// src/components/calendar/modals/EventDetailsModal.jsx
import React from 'react';
import { X, Calendar, Clock, MapPin, Tag, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EventDetailsModal = ({ isOpen, onClose, onEdit, onDelete, event }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{event.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>{event.start && format(new Date(event.start), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{event.start && format(new Date(event.start), 'HH:mm')} - {event.end && format(new Date(event.end), 'HH:mm')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-600">
            <Tag className="w-5 h-5" />
            <span>{event.type}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="w-5 h-5" />
            <span>{event.niveau}</span>
          </div>
          {event.professeur && (
            <div className="flex items-center gap-3 text-gray-600 pt-2 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {event.professeur.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Professeur</p>
                <p className="text-sm font-medium text-gray-800">{event.professeur}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onEdit} className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button onClick={onDelete} className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          background-color: rgba(11, 28, 48, 0.4);
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default EventDetailsModal;