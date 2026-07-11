// src/components/ui/BigCalendar.jsx
import React, { useState, useEffect } from 'react';
import {
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Calendar, MapPin } from 'lucide-react';
import api from '../../services/api';
import { authApi } from '../../services/auth';

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
            {format(event.start, 'EEEE d MMMM yyyy à HH:mm', { locale: fr })} - {format(event.end, 'HH:mm', { locale: fr })}
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
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

const BigCalendar = ({
  events: externalEvents = [],
  currentDate: externalDate,
  view: externalView = 'week',
  selectedDate: externalSelectedDate,
  loading = false,
  onEventUpdate,
}) => {
  const currentDate = externalDate || new Date();
  const view = externalView || 'week';
  const selectedDate = externalSelectedDate || currentDate;

  const [events, setEvents] = useState([]);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, event: null });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, event: null });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (externalEvents && externalEvents.length > 0) {
      setEvents(externalEvents);
    } else {
      setEvents([]);
    }
  }, [externalEvents]);

  const getDisplayDays = () => {
    if (view === 'day') {
      return [selectedDate];
    } else {
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      }).slice(0, 5);
    }
  };

  const weekDays = getDisplayDays();
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  const getEventsForDay = (day) => {
    return events.filter((e) => isSameDay(new Date(e.start), day));
  };

  const getEventTop = (startDate) => {
    const d = new Date(startDate);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const hourOffset = hours - 7;
    return hourOffset * 60 + (minutes / 60) * 60;
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

  const handleComplete = async (event, comment) => {
    try {
      setUpdating(true);
      const user = authApi.getUser();
      if (user && user.id) {
        await api.planning.update(event.id, {
          statut: 'TERMINE',
          commentaire: comment || '',
        });
      }
      alert(`Cours "${event.title}" marqué comme terminé !`);
      setCompleteModal({ isOpen: false, event: null });
      setHoveredEventId(null);
      if (onEventUpdate) onEventUpdate();
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour du cours');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async (event, reason) => {
    try {
      setUpdating(true);
      const user = authApi.getUser();
      if (user && user.id) {
        await api.planning.cancel(event.id, reason);
      }
      setEvents(events.filter((e) => e.id !== event.id));
      setCancelModal({ isOpen: false, event: null });
      setHoveredEventId(null);
      if (onEventUpdate) onEventUpdate();
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      alert('Erreur lors de l\'annulation du cours');
    } finally {
      setUpdating(false);
    }
  };

  const openCancelModal = (event) => setCancelModal({ isOpen: true, event });
  const openCompleteModal = (event) => setCompleteModal({ isOpen: true, event });
  const closeCancelModal = () => setCancelModal({ isOpen: false, event: null });
  const closeCompleteModal = () => setCompleteModal({ isOpen: false, event: null });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Aucun cours programmé</p>
          <p className="text-slate-400 text-xs mt-1">Votre emploi du temps est vide</p>
        </div>
      </div>
    );
  }

  const gridColsClass = view === 'day'
    ? 'grid-cols-[50px_1fr] sm:grid-cols-[80px_1fr]'
    : 'grid-cols-[50px_repeat(5,1fr)] sm:grid-cols-[80px_repeat(5,1fr)]';

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {updating && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Mise à jour...</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto no-scrollbar relative">
        <div className={`grid ${gridColsClass} border-b border-outline-variant bg-slate-50/30 sticky top-0 z-10 min-w-[600px] sm:min-w-0`}>
          <div className="p-2 sm:p-3 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase border-r border-outline-variant">
            <span className="hidden sm:inline">heures</span>
            <span className="sm:hidden">GMT</span>
          </div>
          {weekDays.map((day, idx) => {
            const today = isToday(day);
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

        <div className="overflow-x-auto">
          <div className="relative min-w-[600px] sm:min-w-0">
            <div className={`grid ${gridColsClass}`}>
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
                              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                            </span>
                            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 flex-wrap">
                              <span className="text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 bg-white/50 rounded text-gray-500 truncate max-w-[40px] sm:max-w-none">
                                {event.classe || 'N/A'}
                              </span>
                              {(event.type === 'Examen' || event.type === 'Soutenance') && (
                                <span className="text-[6px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 bg-red-100 text-red-600 rounded truncate">
                                  {event.type}
                                </span>
                              )}
                            </div>
                            {event.salle && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                                <span className="text-[7px] sm:text-[8px] text-gray-500 truncate">
                                  {event.salle}
                                </span>
                              </div>
                            )}
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