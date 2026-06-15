// src/components/modals/EventDetailsModal.jsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Calendar as CalendarIcon, Clock, DoorClosed, Tag, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const EventDetailsModal = ({ 
  isOpen, 
  onClose, 
  selectedEvent, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !selectedEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
 
        </div>
        
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</div>
              <div className="text-sm text-gray-800 font-medium">
                {selectedEvent?.start && format(new Date(selectedEvent.start), 'EEEE d MMMM yyyy', { locale: fr })}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Horaire</div>
              <div className="text-sm text-gray-800 font-medium">
                {selectedEvent?.start && format(new Date(selectedEvent.start), 'HH:mm')} - {selectedEvent?.end && format(new Date(selectedEvent.end), 'HH:mm')}
              </div>
            </div>
          </div>
          
          {selectedEvent?.salle && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <DoorClosed className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salle(s)</div>
                <div className="text-sm text-gray-800 font-medium">
                  {selectedEvent.salles && selectedEvent.salles.length > 0 
                    ? selectedEvent.salles.join(', ') 
                    : selectedEvent.salle}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Tag className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-500 uppercase">Type</div>
              <div className="text-sm font-semibold text-gray-800">{selectedEvent?.type}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Users className="h-4 w-4 text-gray-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-500 uppercase">Classe</div>
              <div className="text-sm font-semibold text-gray-800">{selectedEvent?.classe}</div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl"
          >
            <Edit className="h-4 w-4" /> Modifier
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="flex items-center gap-2 rounded-xl"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;