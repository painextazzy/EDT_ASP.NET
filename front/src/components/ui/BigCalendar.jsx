// src/components/ui/BigCalendar.jsx
import React, { useState, useEffect } from 'react';
import {
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addDays,
  setHours,
  setMinutes,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

// ----- Modals internes -----

const CancelModal = ({ isOpen, event, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Veuillez saisir un motif d\'annulation.');
      return;
    }
    onConfirm(event, reason);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-outline-variant p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Annulation de cours</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-1">
            Vous allez annuler : <span className="font-semibold text-slate-800">{event.title}</span>
          </p>
          <p className="text-xs text-slate-500">
            {format(new Date(event.start), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })} - {format(new Date(event.end), 'HH:mm', { locale: fr })}
          </p>
        </div>
        <div className="mb-4">
          <label htmlFor="cancelReason" className="block text-sm font-medium text-slate-700 mb-1">
            Motif d'annulation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancelReason"
            rows="3"
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Veuillez indiquer la raison de l'annulation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">
            Retour
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm">
            Confirmer l'annulation
          </button>
        </div>
      </div>
    </div>
  );
};

const CompleteModal = ({ isOpen, event, onConfirm, onClose }) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) setComment('');
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleConfirm = () => {
    onConfirm(event, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-outline-variant p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Terminer le cours</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-1">
            Vous allez marquer comme terminé : <span className="font-semibold text-slate-800">{event.title}</span>
          </p>
       
        </div>
     
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">
            Retour
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition shadow-sm">
            terminer le cours
          </button>
        </div>
      </div>
    </div>
  );
};

// ----- Données mockées -----

const createEventDate = (dayOffset, hours, minutes = 0, baseDate = new Date()) => {
  const startOfWeekDate = startOfWeek(baseDate, { weekStartsOn: 1 });
  const date = addDays(startOfWeekDate, dayOffset);
  return setMinutes(setHours(date, hours), minutes);
};

const generateMockEvents = (baseDate = new Date()) => [
  {
    id: 1,
    title: 'Machine Learning Fondamentaux',
    start: createEventDate(0, 9, 0, baseDate),
    end: createEventDate(0, 11, 0, baseDate),
    salle: 'Amphi Turing',
    type: 'Cours',
    color: 'emerald',
    classe: 'L3 DA2I',
  },
  {
    id: 2,
    title: 'TD Algorithmique',
    start: createEventDate(0, 14, 0, baseDate),
    end: createEventDate(0, 16, 0, baseDate),
    salle: 'Salle TD 203',
    type: 'Cours',
    color: 'blue',
    classe: 'L2 ICM',
  },
  {
    id: 3,
    title: 'Deep Learning & Architectures',
    start: createEventDate(1, 10, 0, baseDate),
    end: createEventDate(1, 13, 0, baseDate),
    salle: 'Lab 10B',
    type: 'Cours',
    color: 'purple',
    classe: 'M1 Management',
  },
  {
    id: 4,
    title: 'Éthique et IA',
    start: createEventDate(1, 15, 0, baseDate),
    end: createEventDate(1, 17, 0, baseDate),
    salle: 'Salle 402',
    type: 'Cours',
    color: 'red',
    classe: 'L3 DA2I',
  },
  {
    id: 5,
    title: 'Traitement du Langage Naturel',
    start: createEventDate(2, 8, 30, baseDate),
    end: createEventDate(2, 11, 30, baseDate),
    salle: 'Salle 205',
    type: 'Cours',
    color: 'yellow',
    classe: 'L1 AES',
  },
  {
    id: 6,
    title: 'Soutenance Projet',
    start: createEventDate(2, 14, 0, baseDate),
    end: createEventDate(2, 17, 0, baseDate),
    salle: 'Amphi Principal',
    type: 'Soutenance',
    color: 'red',
    classe: 'M2 Finance',
  },
  {
    id: 7,
    title: 'Robotique Cognitive',
    start: createEventDate(3, 14, 0, baseDate),
    end: createEventDate(3, 17, 0, baseDate),
    salle: 'Atelier Nord',
    type: 'Cours',
    color: 'teal',
    classe: 'L3 DA2I',
  },
  {
    id: 8,
    title: 'Examen Base de Données',
    start: createEventDate(3, 9, 0, baseDate),
    end: createEventDate(3, 12, 0, baseDate),
    salle: 'Amphi A101',
    type: 'Examen',
    color: 'red',
    classe: 'L2 ICM',
  },
  {
    id: 9,
    title: 'Infrastructures Big Data',
    start: createEventDate(4, 9, 0, baseDate),
    end: createEventDate(4, 12, 0, baseDate),
    salle: 'Cloud Center',
    type: 'Cours',
    color: 'gray',
    classe: 'M1 Management',
  },
  {
    id: 10,
    title: 'Séminaire IA & Société',
    start: createEventDate(4, 14, 0, baseDate),
    end: createEventDate(4, 17, 0, baseDate),
    salle: 'Auditorium Principal',
    type: 'Conférence',
    color: 'purple',
    classe: 'Toutes classes',
  },
];

// ----- Composant principal -----

const BigCalendar = ({ events: externalEvents = null, currentDate: externalDate }) => {
  const currentDate = externalDate || new Date();

  const [events, setEvents] = useState(() => {
    if (externalEvents && externalEvents.length > 0) return externalEvents;
    return generateMockEvents(currentDate);
  });

  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, event: null });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, event: null });

  useEffect(() => {
    if (externalEvents && externalEvents.length > 0) setEvents(externalEvents);
  }, [externalEvents]);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  }).slice(0, 5);

  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  const filteredEvents = events; // pas de filtre actif

  const getEventsForDay = (day) =>
    filteredEvents.filter((e) => isSameDay(new Date(e.start), day));

  const getEventTop = (startDate) => {
    const d = new Date(startDate);
    const minutes = d.getHours() * 60 + d.getMinutes() - 7 * 60;
    return Math.max(minutes, 0);
  };

  const getEventHeight = (startDate, endDate) => {
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60);
    return Math.max(diff, 40);
  };

  const eventColors = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', time: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', time: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', time: 'text-purple-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', time: 'text-yellow-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', time: 'text-red-600' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', time: 'text-gray-500' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', time: 'text-teal-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', time: 'text-indigo-600' },
  };

  const handleComplete = (event, comment) => {
    console.log(`Cours "${event.title}" terminé. Commentaire : ${comment || 'Aucun'}`);
    alert(`Cours "${event.title}" marqué comme terminé !`);
    setCompleteModal({ isOpen: false, event: null });
    setHoveredEventId(null);
  };

  const handleCancel = (event, reason) => {
    console.log(`Annulation de "${event.title}" : ${reason}`);
    setEvents(events.filter((e) => e.id !== event.id));
    setCancelModal({ isOpen: false, event: null });
    setHoveredEventId(null);
  };

  const openCancelModal = (event) => setCancelModal({ isOpen: true, event });
  const openCompleteModal = (event) => setCompleteModal({ isOpen: true, event });
  const closeCancelModal = () => setCancelModal({ isOpen: false, event: null });
  const closeCompleteModal = () => setCompleteModal({ isOpen: false, event: null });

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-auto no-scrollbar relative">
        {/* En-tête jours */}
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] sm:grid-cols-[80px_repeat(5,1fr)] border-b border-outline-variant bg-slate-50/30 sticky top-0 z-10 min-w-[600px] sm:min-w-0">
          <div className="p-2 sm:p-3 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase border-r border-outline-variant">
            <span className="hidden sm:inline">GMT+02</span>
            <span className="sm:hidden">GMT</span>
          </div>
          {weekDays.map((day, idx) => {
            const today = isSameDay(day, new Date());
            return (
              <div
                key={idx}
                className={`p-2 sm:p-3 text-center border-r border-outline-variant ${today ? 'bg-blue-50/50' : ''}`}
              >
                <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase mb-0.5 sm:mb-1">
                  {format(day, 'EEE', { locale: fr }).slice(0, 3)}
                </p>
                <span className={`text-base sm:text-2xl font-bold ${today ? 'text-blue-600' : 'text-slate-800'}`}>
                  {format(day, 'dd')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Corps */}
        <div className="overflow-x-auto">
          <div className="relative min-w-[600px] sm:min-w-0">
            <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] sm:grid-cols-[80px_repeat(5,1fr)]">
              <div className="border-r border-outline-variant bg-slate-50/20">
                {hours.map((h, i) => (
                  <div key={i} className="h-[50px] sm:h-[60px] flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-400">
                    {`${String(h).padStart(2, '0')}:00`}
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={dayIdx} className="relative border-r border-outline-variant min-h-[600px] sm:min-h-[720px] bg-white">
                    {hours.map((_, i) => (
                      <div key={i} className="h-[50px] sm:h-[60px] border-b border-slate-50" />
                    ))}
                    {dayEvents.map((event) => {
                      const style = eventColors[event.color] || eventColors.gray;
                      const top = getEventTop(event.start);
                      const height = getEventHeight(event.start, event.end);
                      const mobileHeight = Math.max(height * 0.8, 30);
                      const isHovered = hoveredEventId === event.id;

                      return (
                        <div
                          key={event.id}
                          className={`absolute left-0.5 sm:left-1 right-0.5 sm:right-1 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer ${style.bg} border ${style.border} group overflow-visible`}
                          style={{
                            top: `${top * 0.8}px`,
                            height: `${mobileHeight}px`,
                            minHeight: '30px',
                          }}
                          onMouseEnter={() => setHoveredEventId(event.id)}
                          onMouseLeave={() => setHoveredEventId(null)}
                        >
                          {isHovered && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-lg border border-outline-variant p-0.5 z-20 whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCompleteModal(event);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-green-50 transition-colors text-[10px] font-medium text-green-700"
                              >
                                <Check className="w-3 h-3" /> Terminer
                              </button>
                              <div className="w-px h-4 bg-outline-variant" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCancelModal(event);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-red-50 transition-colors text-[10px] font-medium text-red-700"
                              >
                                <X className="w-3 h-3" /> Annuler
                              </button>
                            </div>
                          )}
                          <div className="flex flex-col h-full overflow-hidden">
                            <span className={`${style.text} text-[9px] sm:text-xs font-semibold truncate`}>{event.title}</span>
                            <span className={`${style.time} text-[8px] sm:text-[10px]`}>
                              {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                            </span>
                            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 flex-wrap">
                              <span className="text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 bg-white/50 rounded text-gray-500 truncate max-w-[40px] sm:max-w-none">
                                {event.classe}
                              </span>
                              {(event.type === 'Examen' || event.type === 'Soutenance') && (
                                <span className="text-[6px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 bg-red-100 text-red-600 rounded truncate">
                                  {event.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CancelModal
        isOpen={cancelModal.isOpen}
        event={cancelModal.event}
        onConfirm={handleCancel}
        onClose={closeCancelModal}
      />

      <CompleteModal
        isOpen={completeModal.isOpen}
        event={completeModal.event}
        onConfirm={handleComplete}
        onClose={closeCompleteModal}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .border-outline-variant { border-color: #e2e8f0; }
      `}</style>
    </div>
  );
};

export default BigCalendar;