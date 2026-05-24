// src/components/calendar/BigCalendar.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, RefreshCw, Plus, X, Edit, Trash2, Calendar as CalendarIcon, Clock, MapPin, Tag, BookOpen, AlertCircle, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BigCalendar = ({ events: externalEvents = [], onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  
  const [selectedClasse, setSelectedClasse] = useState('L3 DA2I');
  
  const [events, setEvents] = useState(externalEvents.length > 0 ? externalEvents : [
    {
      id: 1,
      title: "Architecture des ordinateurs",
      description: "Cours sur l'architecture des processeurs et la mémoire",
      start: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(9, 0, 0, 0);
        return date;
      })(),
      end: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(11, 0, 0, 0);
        return date;
      })(),
      location: "Amphithéâtre A101",
      type: "Cours",
      color: "emerald",
      classe: "L3 DA2I"
    },
    {
      id: 2,
      title: "TD Algorithmique",
      description: "Travaux dirigés sur les algorithmes avancés",
      start: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        date.setHours(14, 0, 0, 0);
        return date;
      })(),
      end: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        date.setHours(16, 0, 0, 0);
        return date;
      })(),
      location: "Salle TD 203",
      type: "Cours",
      color: "blue",
      classe: "L2 ICM"
    },
    {
      id: 3,
      title: "Management des entreprises",
      description: "Cours sur les stratégies d'entreprise",
      start: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        date.setHours(10, 0, 0, 0);
        return date;
      })(),
      end: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        date.setHours(12, 0, 0, 0);
        return date;
      })(),
      location: "Salle de réunion B-110",
      type: "Cours",
      color: "purple",
      classe: "M1 Management"
    },
    {
      id: 4,
      title: "Droit des affaires",
      description: "Introduction au droit commercial",
      start: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        date.setHours(13, 0, 0, 0);
        return date;
      })(),
      end: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        date.setHours(15, 0, 0, 0);
        return date;
      })(),
      location: "Amphithéâtre principal",
      type: "Cours",
      color: "yellow",
      classe: "L1 AES"
    }
  ]);

  const classesOptions = ['L1 AES', 'L2 ICM', 'L3 DA2I', 'M1 Management', 'M2 Finance'];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    type: 'Cours',
    classe: 'L3 DA2I'
  });

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
    if (selectedClasse && event.classe !== selectedClasse) return false;
    return true;
  });

  const eventsCount = filteredEvents.length;

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

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
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', timeText: 'text-emerald-600' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', timeText: 'text-gray-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', timeText: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', timeText: 'text-purple-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', timeText: 'text-yellow-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', timeText: 'text-red-600' },
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      alert("Veuillez remplir le titre et la date");
      return;
    }

    const startDateTime = new Date(newEvent.startDate);
    const [startHour, startMinute] = (newEvent.startTime || '09:00').split(':');
    const [endHour, endMinute] = (newEvent.endTime || '10:00').split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const endDateTime = new Date(newEvent.startDate);
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const colorMap = {
      'Cours': 'emerald',
      'Conférence': 'purple',
      'Atelier': 'yellow',
      'Soutenance': 'red',
      'Réunion': 'blue'
    };

    const newEventObj = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      start: startDateTime,
      end: endDateTime,
      type: newEvent.type,
      color: colorMap[newEvent.type] || 'emerald',
      classe: newEvent.classe
    };

    setEvents([...events, newEventObj]);
    
    if (onAddEvent) {
      onAddEvent(newEventObj);
    }
    
    setIsAddModalOpen(false);
    setNewEvent({
      title: '',
      description: '',
      location: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      type: 'Cours',
      classe: 'L3 DA2I'
    });
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent({
      ...event,
      startDate: format(new Date(event.start), 'yyyy-MM-dd'),
      startTime: format(new Date(event.start), 'HH:mm'),
      endTime: format(new Date(event.end), 'HH:mm')
    });
    setIsEditModalOpen(true);
  };

  const handleEditEvent = () => {
    if (!editingEvent.title) {
      alert("Veuillez remplir le titre");
      return;
    }

    const startDateTime = new Date(editingEvent.startDate);
    const [startHour, startMinute] = editingEvent.startTime.split(':');
    const [endHour, endMinute] = editingEvent.endTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const endDateTime = new Date(editingEvent.startDate);
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const updatedEvent = {
      ...editingEvent,
      start: startDateTime,
      end: endDateTime
    };

    setEvents(events.map(event => 
      event.id === editingEvent.id ? updatedEvent : event
    ));
    
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = () => {
    if (window.confirm(`Supprimer l'événement "${selectedEvent?.title}" ?`)) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setSelectedEvent(null);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const getEventsForDay = (day) => {
    return filteredEvents.filter(event => isSameDay(new Date(event.start), day));
  };

  const handleSaveTimetable = () => {
    if (!selectedClasse) {
      alert("Veuillez sélectionner une classe d'abord");
      return;
    }
    
    const timetable = {
      classe: selectedClasse,
      date: new Date().toISOString(),
      events: filteredEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        type: event.type,
        classe: event.classe
      }))
    };
    
    localStorage.setItem(`timetable_${selectedClasse}`, JSON.stringify(timetable));
    
    const dataStr = JSON.stringify(timetable, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `emploi_du_temps_${selectedClasse}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert(`Emploi du temps pour ${selectedClasse} sauvegardé avec succès !`);
  };

  const handleRemoveCourse = (eventId, eventTitle) => {
    if (window.confirm(`Supprimer le cours "${eventTitle}" de l'emploi du temps ?`)) {
      setEvents(events.filter(e => e.id !== eventId));
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(null);
      }
    }
  };

  // Classes CSS pour le design amélioré avec boutons bien arrondis
  const headerClass = "bg-white border-b border-gray-100";
  const titleClass = "text-xl font-semibold text-gray-800";
  const badgeClass = "ml-2 text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full text-gray-500";
  const navButtonClass = "p-2 hover:bg-gray-100 rounded-xl transition-colors";
  const addButtonClass = "bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm";
  const saveButtonClass = "bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm";

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header amélioré */}
      <header className={`${headerClass} px-6 py-4`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left section - Date display */}
          <div className="flex items-center gap-4">
            {/* Date box */}
            <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-[70px]">
              <span className="bg-gray-800 text-white text-[10px] font-semibold px-3 py-0.5 w-full text-center uppercase tracking-wider">
                {format(currentDate, 'MMM', { locale: fr })}
              </span>
              <span className="text-2xl font-bold text-gray-800 px-3 py-1">
                {format(currentDate, 'dd')}
              </span>
            </div>
            
            {/* Title and count */}
            <div>
              <h1 className={titleClass}>
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                <span className={badgeClass}>{eventsCount} événement{eventsCount > 1 ? 's' : ''}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button onClick={handlePrevious} className={navButtonClass}>
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-xs text-gray-500 px-2">{getDateRange()}</span>
                  <button onClick={handleNext} className={navButtonClass}>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-3">
            {/* Classe Dropdown */}
            <div className="relative">
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="px-5 py-2 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer font-medium"
              >
                {classesOptions.map(classe => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Add button */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className={addButtonClass}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>

            {/* Save button */}
            <button 
              onClick={handleSaveTimetable}
              className={saveButtonClass}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Enregistrer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Day Headers */}
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

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="relative min-h-[720px]">
            {/* Background grid lines */}
            <div className="absolute inset-0 grid grid-cols-[80px_repeat(5,1fr)]">
              <div className="border-r border-gray-100 bg-white z-10"></div>
              {weekDays.map((_, idx) => (
                <div key={idx} className="border-r border-gray-100" />
              ))}
            </div>

            {/* Horizontal time lines */}
            <div className="absolute inset-0 pointer-events-none">
              {hours.map((_, i) => (
                <div key={i} className="calendar-grid-line" style={{ top: `${i * 60}px` }} />
              ))}
            </div>

            {/* Time labels */}
            <div className="absolute left-0 top-0 w-20 flex flex-col z-20 pointer-events-none">
              {displayHours.map((hour, idx) => (
                <div key={idx} className="h-[60px] flex justify-center items-start pt-2">
                  <span className="text-[11px] text-gray-400 font-medium">{hour}</span>
                </div>
              ))}
            </div>

            {/* Events container */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] h-full relative z-10">
              <div className="col-start-1"></div>
              {weekDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={dayIdx} className="relative min-h-[720px]">
                    {dayEvents.map((event) => {
                      const style = eventColors[event.color] || eventColors.emerald;
                      const top = getEventTop(event.start);
                      const height = getEventHeight(event.start, event.end);
                      return (
                        <div
                          key={event.id}
                          className={`
                            absolute left-1 right-1 rounded-xl p-2 flex flex-col 
                            shadow-sm hover:shadow-md transition-all z-20 group
                            ${style.bg} border ${style.border}
                          `}
                          style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
                        >
                          <div onClick={() => handleEventClick(event)} className="cursor-pointer flex-1">
                            <span className={`${style.text} text-[11px] font-semibold truncate block`}>{event.title}</span>
                            <span className={`${style.timeText} text-[9px]`}>
                              {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                            </span>
                            <div className="flex gap-1 mt-1">
                              <span className="text-[8px] px-1.5 py-0.5 bg-white/50 rounded-md text-gray-500">{event.classe}</span>
                            </div>
                          </div>
                          {/* Bouton X rouge pour supprimer */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCourse(event.id, event.title);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Current time indicator */}
            <div className="absolute top-[300px] left-[80px] right-0 h-px bg-red-400 z-30 pointer-events-none flex items-center">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-sm"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 px-6 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-3">
          <span>Dernière mise à jour: {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            <RefreshCw className="w-3 h-3" />
            <span>Actualiser</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-600 font-medium">Affichage: {selectedClasse}</span>
        </div>
      </footer>

      {/* Modal d'ajout */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              Ajouter un événement
            </DialogTitle>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
              <Input 
                placeholder="Ex: Architecture des ordinateurs" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classe</label>
              <Select value={newEvent.classe} onValueChange={(v) => setNewEvent({ ...newEvent, classe: v })}>
                <SelectTrigger className="border-gray-200 rounded-xl">
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classesOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
              <Input 
                type="date" 
                value={newEvent.startDate}
                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heure début</label>
                <Input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heure fin</label>
                <Input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}>
                <SelectTrigger className="border-gray-200 rounded-xl">
                  <SelectValue placeholder="Type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cours">Cours</SelectItem>
                  <SelectItem value="Conférence">Conférence</SelectItem>
                  <SelectItem value="Atelier">Atelier</SelectItem>
                  <SelectItem value="Soutenance">Soutenance</SelectItem>
                  <SelectItem value="Réunion">Réunion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lieu</label>
              <Input 
                placeholder="Lieu de l'événement" 
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Description de l'événement" 
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700 rounded-xl">Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedEvent?.type === 'Cours' ? 'bg-emerald-100' :
                selectedEvent?.type === 'Conférence' ? 'bg-purple-100' :
                selectedEvent?.type === 'Atelier' ? 'bg-yellow-100' :
                selectedEvent?.type === 'Soutenance' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <CalendarIcon className={`h-4 w-4 ${
                  selectedEvent?.type === 'Cours' ? 'text-emerald-600' :
                  selectedEvent?.type === 'Conférence' ? 'text-purple-600' :
                  selectedEvent?.type === 'Atelier' ? 'text-yellow-600' :
                  selectedEvent?.type === 'Soutenance' ? 'text-red-600' : 'text-blue-600'
                }`} />
              </div>
              {selectedEvent?.title}
            </DialogTitle>
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
            
            {selectedEvent?.location && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</div>
                  <div className="text-sm text-gray-800 font-medium">{selectedEvent.location}</div>
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
                <BookOpen className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <div className="text-[10px] text-gray-500 uppercase">Classe</div>
                <div className="text-sm font-semibold text-gray-800">{selectedEvent?.classe}</div>
              </div>
            </div>
            
            {selectedEvent?.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</div>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedEvent.description}</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                handleOpenEditModal(selectedEvent);
                setSelectedEvent(null);
              }}
              className="flex items-center gap-2 rounded-xl"
            >
              <Edit className="h-4 w-4" /> Modifier
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
              className="flex items-center gap-2 rounded-xl"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Edit className="h-4 w-4 text-amber-600" />
              </div>
              Modifier l'événement
            </DialogTitle>
          </div>
          
          {editingEvent && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
                <Input 
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classe</label>
                <Select value={editingEvent.classe} onValueChange={(v) => setEditingEvent({ ...editingEvent, classe: v })}>
                  <SelectTrigger className="border-gray-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classesOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                <Input 
                  type="date" 
                  value={editingEvent.startDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heure début</label>
                  <Input 
                    type="time" 
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Heure fin</label>
                  <Input 
                    type="time" 
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                <Select value={editingEvent.type} onValueChange={(v) => setEditingEvent({ ...editingEvent, type: v })}>
                  <SelectTrigger className="border-gray-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cours">Cours</SelectItem>
                    <SelectItem value="Conférence">Conférence</SelectItem>
                    <SelectItem value="Atelier">Atelier</SelectItem>
                    <SelectItem value="Soutenance">Soutenance</SelectItem>
                    <SelectItem value="Réunion">Réunion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lieu</label>
                <Input 
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleEditEvent} className="bg-blue-600 hover:bg-blue-700 rounded-xl">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .calendar-grid-line {
          border-bottom: 1px dashed #e5e7eb;
          position: absolute;
          left: 0;
          right: 0;
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
  );
};

export default BigCalendar;