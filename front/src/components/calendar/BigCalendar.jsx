// src/components/calendar/BigCalendar.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, RefreshCw, Plus, X, Calendar as CalendarIcon, Clock, MapPin, Tag, BookOpen, Save, Users, DoorOpen } from 'lucide-react';
import api from '../../services/api';

const BigCalendar = ({ events: externalEvents = [], onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [cours, setCours] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [events, setEvents] = useState(externalEvents);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const notificationTimeoutRef = useRef(null);
  
  const [newEvent, setNewEvent] = useState({
    titre: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    heureDebut: '09:00',
    heureFin: '10:00',
    type: 'Cours',
    classeId: '',
    salles: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursData, classesData, sallesData] = await Promise.all([
        api.cours.getAll(),
        api.affectation.getNiveaux(),
        api.salle.getAll()
      ]);
      
      setCours(coursData);
      setClasses(classesData);
      setSalles(sallesData);
      
      if (classesData.length > 0 && !selectedClasse) {
        setSelectedClasse(classesData[0].id.toString());
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
      showNotification("Erreur lors du chargement des données", 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ show: true, message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const displayHours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });
    return allDays.slice(0, 5);
  };

  const weekDays = getWeekDays();
  const monthYear = format(currentDate, 'MMMM yyyy', { locale: fr });

  const filteredEvents = events.filter(event => {
    if (selectedClasse && event.classeId !== parseInt(selectedClasse)) return false;
    return true;
  });

  const handlePrevious = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1));

  const getDateRange = () => {
    if (weekDays.length > 0) {
      const firstDay = weekDays[0];
      const lastDay = weekDays[4];
      return `${format(firstDay, 'dd/MM')} - ${format(lastDay, 'dd/MM/yyyy')}`;
    }
    return '';
  };

  const getEventTop = (startDate) => {
    const date = new Date(startDate);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const hourOffset = hour - 7;
    return hourOffset * 60 + (minute / 60) * 60;
  };

  const getEventHeight = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationHours = (end - start) / (1000 * 60 * 60);
    return Math.max(durationHours * 60, 30);
  };

  const eventColors = {
    Cours: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', timeText: 'text-emerald-600' },
    TD: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', timeText: 'text-blue-600' },
    TP: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', timeText: 'text-purple-600' },
    Examen: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', timeText: 'text-red-600' },
    Soutenance: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', timeText: 'text-amber-600' }
  };

  const handleAddEvent = () => {
    if (!newEvent.titre || !newEvent.date || !newEvent.type) {
      showNotification("Veuillez remplir tous les champs obligatoires", 'error');
      return;
    }

    const startDateTime = new Date(newEvent.date);
    const [startHour, startMinute] = newEvent.heureDebut.split(':');
    const [endHour, endMinute] = newEvent.heureFin.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const endDateTime = new Date(newEvent.date);
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const newEventObj = {
      id: Date.now(),
      title: newEvent.titre,
      description: '',
      start: startDateTime,
      end: endDateTime,
      type: newEvent.type,
      classeId: parseInt(newEvent.classeId),
      classe: classes.find(c => c.id === parseInt(newEvent.classeId))?.libelle || '',
      salles: newEvent.salles,
      location: newEvent.salles?.map(s => s.numero).join(', ') || ''
    };

    setEvents([...events, newEventObj]);
    
    if (onAddEvent) onAddEvent(newEventObj);
    
    setIsAddModalOpen(false);
    setNewEvent({
      titre: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      heureDebut: '09:00',
      heureFin: '10:00',
      type: 'Cours',
      classeId: selectedClasse || '',
      salles: []
    });
    showNotification(`Événement ajouté avec succès`, 'success');
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setIsDetailsModalOpen(false);
      setSelectedEvent(null);
      showNotification(`Événement supprimé avec succès`, 'success');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const getEventsForDay = (day) => filteredEvents.filter(event => isSameDay(new Date(event.start), day));

  const handleSaveTimetable = () => {
    if (!selectedClasse) {
      showNotification("Veuillez sélectionner une classe", 'error');
      return;
    }
    
    const timetable = {
      classe: selectedClasse,
      date: new Date().toISOString(),
      events: filteredEvents
    };
    
    const dataStr = JSON.stringify(timetable, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `emploi_du_temps_${selectedClasse}_${format(new Date(), 'yyyy-MM-dd')}.json`);
    linkElement.click();
    
    showNotification(`Emploi du temps sauvegardé !`, 'success');
  };

  const toggleSalleSelection = (salle) => {
    setNewEvent(prev => {
      const isSelected = prev.salles.some(s => s.id === salle.id);
      if (isSelected) {
        return { ...prev, salles: prev.salles.filter(s => s.id !== salle.id) };
      } else {
        return { ...prev, salles: [...prev.salles, salle] };
      }
    });
  };

  const isMultiSalleType = () => {
    return newEvent.type === 'Examen' || newEvent.type === 'Soutenance';
  };

  // Modal d'ajout
  const AddEventModal = () => (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-eight shadow-soft overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Ajouter un événement</h2>
          </div>
          <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Row 1: Titre and Horaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Titre <span className="text-red-500">*</span>
              </label>
              <select
                value={newEvent.titre}
                onChange={(e) => setNewEvent({ ...newEvent, titre: e.target.value })}
                className="w-full border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-gray-50"
              >
                <option value="">Sélectionner un titre</option>
                {cours.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Horaire
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={newEvent.heureDebut}
                  onChange={(e) => setNewEvent({ ...newEvent, heureDebut: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-gray-50"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400">—</span>
                <select
                  value={newEvent.heureFin}
                  onChange={(e) => setNewEvent({ ...newEvent, heureFin: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-gray-50"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Classe and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Classe
              </label>
              <select
                value={newEvent.classeId}
                onChange={(e) => setNewEvent({ ...newEvent, classeId: e.target.value })}
                className="w-full border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-gray-50"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.libelle}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01M21 21H3V5a2 2 0 012-2h14a2 2 0 012 2v16z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Type
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 pl-10 bg-gray-50 appearance-none"
                >
                  <option value="Cours">Cours</option>
                  <option value="TD">TD</option>
                  <option value="TP">TP</option>
                  <option value="Examen">Examen</option>
                  <option value="Soutenance">Soutenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salle Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m0 0h6v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Salle
            </label>
            
            {isMultiSalleType() ? (
              <div className="border border-gray-200 rounded-eight p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                {salles.map(salle => (
                  <label key={salle.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={newEvent.salles.some(s => s.id === salle.id)}
                      onChange={() => toggleSalleSelection(salle)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{salle.numero}</span>
                  </label>
                ))}
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
                }}
                className="w-full border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 bg-gray-50"
              >
                <option value="">Sélectionner une salle</option>
                {salles.map(salle => (
                  <option key={salle.id} value={salle.id}>{salle.numero}</option>
                ))}
              </select>
            )}
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Date
            </label>
            <div className="relative w-full">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full border border-gray-200 rounded-eight focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 pr-10 bg-gray-50"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 flex items-center border-t border-gray-100 justify-end gap-3">
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-eight transition-all duration-200"
          >
            Annuler
          </button>
          <button
            onClick={handleAddEvent}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-500 hover:brightness-105 active:scale-95 shadow-lg shadow-blue-500/20 rounded-eight transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de détails
  const EventDetailsModal = () => (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-eight shadow-soft overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{selectedEvent?.title}</h2>
          <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <CalendarIcon className="h-5 w-5" />
            <span>{selectedEvent?.start && format(new Date(selectedEvent.start), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>{selectedEvent?.start && format(new Date(selectedEvent.start), 'HH:mm')} - {selectedEvent?.end && format(new Date(selectedEvent.end), 'HH:mm')}</span>
          </div>
          {selectedEvent?.location && (
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{selectedEvent.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-600">
            <Tag className="h-5 w-5" />
            <span>{selectedEvent?.type}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="h-5 w-5" />
            <span>{selectedEvent?.classe}</span>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-eight transition-colors">
            Fermer
          </button>
          <button onClick={handleDeleteEvent} className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-eight transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          } min-w-[300px] max-w-md`}>
            <span className="text-lg">{notification.type === 'success' ? '✓' : '✗'}</span>
            <p className="text-sm font-medium">{notification.message}</p>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-[70px]">
              <span className="bg-gray-800 text-white text-[10px] font-semibold px-3 py-0.5 w-full text-center uppercase">
                {format(currentDate, 'MMM', { locale: fr })}
              </span>
              <span className="text-2xl font-bold text-gray-800 px-3 py-1">{format(currentDate, 'dd')}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                <span className="ml-2 text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button onClick={handlePrevious} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-xs text-gray-500 px-2">{getDateRange()}</span>
                  <button onClick={handleNext} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="px-5 py-2 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer font-medium"
            >
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>{classe.libelle}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-gray-200 bg-gray-50/30">
          <div className="py-3"></div>
          {weekDays.map((day, idx) => (
            <div key={idx} className="py-3 text-center">
              <div className="text-sm font-medium text-gray-500">
                {format(day, 'EEE', { locale: fr }).charAt(0).toUpperCase() + format(day, 'EEE', { locale: fr }).slice(1)}
              </div>
              <div className="text-xl font-bold text-gray-800">{format(day, 'dd')}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="relative min-h-[720px]">
            <div className="absolute inset-0 grid grid-cols-[80px_repeat(5,1fr)]">
              <div className="border-r border-gray-100 bg-white z-10"></div>
              {weekDays.map((_, idx) => <div key={idx} className="border-r border-gray-100" />)}
            </div>
            <div className="absolute inset-0 pointer-events-none">
              {hours.map((_, i) => <div key={i} className="calendar-grid-line" style={{ top: `${i * 60}px` }} />)}
            </div>
            <div className="absolute left-0 top-0 w-20 flex flex-col z-20 pointer-events-none">
              {displayHours.map((hour, idx) => (
                <div key={idx} className="h-[60px] flex justify-center items-start pt-2">
                  <span className="text-[11px] text-gray-400 font-medium">{hour}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[80px_repeat(5,1fr)] h-full relative z-10">
              <div className="col-start-1"></div>
              {weekDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={dayIdx} className="relative min-h-[720px]">
                    {dayEvents.map((event) => {
                      const style = eventColors[event.type] || eventColors.Cours;
                      const top = getEventTop(event.start);
                      const height = getEventHeight(event.start, event.end);
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 rounded-xl p-2 flex flex-col shadow-sm hover:shadow-md transition-all z-20 group cursor-pointer ${style.bg} border ${style.border}`}
                          style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex-1">
                            <span className={`${style.text} text-[11px] font-semibold truncate block`}>{event.title}</span>
                            <span className={`${style.timeText} text-[9px]`}>
                              {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                            </span>
                            <div className="flex gap-1 mt-1">
                              <span className="text-[8px] px-1.5 py-0.5 bg-white/50 rounded-md text-gray-500">{event.classe}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="absolute top-[300px] left-[80px] right-0 h-px bg-red-400 z-30 pointer-events-none flex items-center">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-sm"></div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 px-6 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-3">
          <span>Dernière mise à jour: {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            <RefreshCw className="w-3 h-3" /> Actualiser
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-600 font-medium">Affichage: {classes.find(c => c.id === parseInt(selectedClasse))?.libelle || 'Chargement...'}</span>
        </div>
      </footer>

      {/* Boutons FAB */}
      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all z-40">
        <Plus className="w-6 h-6" />
      </button>
      <button onClick={handleSaveTimetable} className="fixed bottom-8 right-28 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all z-40">
        <Save className="w-5 h-5" />
      </button>

      {/* Modals */}
      {isAddModalOpen && <AddEventModal />}
      {isDetailsModalOpen && <EventDetailsModal />}

      <style>{`
        .calendar-grid-line { border-bottom: 1px dashed #e5e7eb; position: absolute; left: 0; right: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -100%); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .rounded-eight { border-radius: 8px; }
        .shadow-soft { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); }
      `}</style>
    </div>
  );
};

export default BigCalendar;