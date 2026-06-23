// src/components/calendar/BigCalendar.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, RefreshCw, Plus, X, Share2Icon, SlidersHorizontal, Building, User, Clock, Search } from 'lucide-react';
import api from '../../services/api';
import AddEventModal from './modals/AddEventModal';
import EventDetailsModal from './modals/EventDetailsModal';
import EditEventModal from './modals/EditEventModal';
import SkeletonLoader from '../SkeletonLoader';

const BigCalendar = ({ events: externalEvents = [], onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [cours, setCours] = useState([]);
  const [coursFiltres, setCoursFiltres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professeurs, setProfesseurs] = useState([]);
  const [showNiveauFilter, setShowNiveauFilter] = useState(false);
  const [searchNiveau, setSearchNiveau] = useState('');
  const filterRef = useRef(null);
  
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const notificationTimeoutRef = useRef(null);
  
  const [newEvent, setNewEvent] = useState({
    titre: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dateDebut: format(new Date(), 'yyyy-MM-dd'),
    dateFin: format(new Date(), 'yyyy-MM-dd'),
    heureDebut: '09:00',
    heureFin: '10:00',
    type: 'Cours',
    salles: [],
    enseignementId: null,
    professeurId: null
  });

  // Couleurs pour les 3 types d'événements
  const eventColors = {
    Cours: { 
      bg: 'bg-amber-50', 
      border: 'border-amber-300', 
      text: 'text-amber-800', 
      timeText: 'text-amber-600',
      dot: 'bg-amber-500',
      lightBg: 'bg-amber-100',
      hoverBg: 'hover:bg-amber-100'
    },
    Examen: { 
      bg: 'bg-purple-50', 
      border: 'border-purple-300', 
      text: 'text-purple-800', 
      timeText: 'text-purple-600',
      dot: 'bg-purple-500',
      lightBg: 'bg-purple-100',
      hoverBg: 'hover:bg-purple-100'
    },
    Soutenance: { 
      bg: 'bg-orange-50', 
      border: 'border-orange-300', 
      text: 'text-orange-800', 
      timeText: 'text-orange-600',
      dot: 'bg-orange-500',
      lightBg: 'bg-orange-100',
      hoverBg: 'hover:bg-orange-100'
    }
  };

  // Fonction pour obtenir les couleurs avec fallback
  const getEventColors = (type) => {
    return eventColors[type] || eventColors.Cours;
  };

  const getEventTypeLabel = (type) => {
    if (type === 'Soutenance') return 'Presentation';
    return type || 'Cours';
  };

  // Charger les événements depuis l'API
  const loadEvents = async () => {
    try {
      const data = await api.planning.getAll();
      console.log("📅 Événements chargés:", data);
      
      const formattedEvents = Array.isArray(data) ? data.map(item => {
        const dateDebut = new Date(item.dateDebut);
        const dateFin = new Date(item.dateFin);
        
        return {
          id: item.id,
          title: item.enseignement?.cours?.nom || item.typeEvenement || 'Cours',
          description: '',
          start: dateDebut,
          end: dateFin,
          type: item.typeEvenement,
          statut: item.statut,
          niveauId: item.enseignement?.niveau?.id || null,
          niveau: item.enseignement?.niveau?.libelle || '',
          salles: item.salles || [],
          location: item.salles?.map(s => s.nom).join(', ') || '',
          professeur: item.enseignement?.enseignant?.nom || '',
          professeurId: item.enseignement?.enseignant?.id || null,
          enseignementId: item.idEnseignement,
          motifAnnulation: item.motifAnnulation
        };
      }) : [];
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("❌ Erreur chargement événements:", error);
      showNotification("Erreur lors du chargement des événements", 'error');
      setEvents([]);
    }
  };

  useEffect(() => {
    loadData();
    loadEvents();
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedNiveau) {
      loadCoursByNiveau();
    }
  }, [selectedNiveau]);

  useEffect(() => {
    if (newEvent.date && (newEvent.type === 'Examen' || newEvent.type === 'Soutenance')) {
      loadSallesDisponibles();
    }
  }, [newEvent.date, newEvent.type]);

  // Gestion du clic en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowNiveauFilter(false);
        setSearchNiveau('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let coursData = [];
      let niveauxData = [];
      let sallesData = [];
      
      try {
        coursData = await api.cours.getAll();
        setCours(Array.isArray(coursData) ? coursData : []);
      } catch (error) {
        console.error("Erreur chargement cours:", error);
        setCours([]);
      }
      
      try {
        niveauxData = await api.affectation.getNiveaux();
        if (niveauxData && Array.isArray(niveauxData)) {
          setNiveaux(niveauxData);
          if (niveauxData.length > 0 && !selectedNiveau) {
            setSelectedNiveau(niveauxData[0]?.id?.toString() || '');
          }
        } else {
          setNiveaux([]);
        }
      } catch (error) {
        console.error("Erreur chargement niveaux:", error);
        setNiveaux([]);
      }
      
      try {
        sallesData = await api.salle.getAll();
        setSalles(Array.isArray(sallesData) ? sallesData : []);
      } catch (error) {
        console.error("Erreur chargement salles:", error);
        setSalles([]);
      }
      
      try {
        const professeursData = await api.affectation.getProfesseurs();
        setProfesseurs(Array.isArray(professeursData) ? professeursData : []);
      } catch (error) {
        console.error("Erreur chargement professeurs:", error);
        setProfesseurs([]);
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
      showNotification("Erreur lors du chargement des données", 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCoursByNiveau = async () => {
    try {
      const affectations = await api.affectation.getAll();
      const niveauLibelle = niveaux.find(n => n.id === parseInt(selectedNiveau))?.libelle;
      
      const coursDuNiveau = affectations
        .filter(a => a.niveau === niveauLibelle)
        .map(a => ({ id: a.id, nom: a.name, code: a.code, professeur: a.professor, enseignementId: a.id }));
      
      const coursUniques = [];
      const coursMap = new Map();
      
      for (const cours of coursDuNiveau) {
        if (!coursMap.has(cours.nom)) {
          coursMap.set(cours.nom, cours);
          coursUniques.push(cours);
        }
      }
      
      setCoursFiltres(coursUniques);
    } catch (error) {
      console.error("Erreur chargement cours par niveau:", error);
      setCoursFiltres([]);
    }
  };

  const loadSallesDisponibles = async () => {
    try {
      if (!events || !salles) {
        setSallesDisponibles(salles || []);
        return;
      }
      
      const eventsLeJour = events.filter(event => 
        event.type === newEvent.type &&
        event.start &&
        isSameDay(new Date(event.start), new Date(newEvent.date))
      );
      
      const sallesOccupees = eventsLeJour.flatMap(e => e.salles?.map(s => s.id) || []);
      const disponibles = (salles || []).filter(s => !sallesOccupees.includes(s.id));
      setSallesDisponibles(disponibles);
    } catch (error) {
      console.error("Erreur chargement salles disponibles:", error);
      setSallesDisponibles(salles || []);
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

  // Filtrer les événements par niveau
  const filteredEvents = (events || []).filter(event => {
    if (selectedNiveau && event.niveauId !== parseInt(selectedNiveau)) return false;
    if (event.statut === 'Annule') return false;
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
    if (!startDate) return 0;
    const date = new Date(startDate);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const hourOffset = hour - 7;
    return hourOffset * 60 + (minute / 60) * 60;
  };

  const getEventHeight = (startDate, endDate) => {
    if (!startDate || !endDate) return 60;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationHours = (end - start) / (1000 * 60 * 60);
    return Math.max(durationHours * 60, 30);
  };

  const handleAddEvent = async (newEventData) => {
    try {
      await loadEvents();
      showNotification(`Événement ajouté avec succès`, 'success');
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout:", error);
      showNotification("Erreur lors de l'ajout de l'événement", 'error');
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await api.planning.delete(selectedEvent.id);
        await loadEvents();
        setIsDetailsModalOpen(false);
        setSelectedEvent(null);
        showNotification(`Événement supprimé avec succès`, 'success');
      } catch (error) {
        console.error("❌ Erreur suppression:", error);
        showNotification("Erreur lors de la suppression", 'error');
      }
    }
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent({
      ...event,
      date: format(new Date(event.start), 'yyyy-MM-dd'),
      dateDebut: format(new Date(event.start), 'yyyy-MM-dd'),
      dateFin: format(new Date(event.end), 'yyyy-MM-dd'),
      heureDebut: format(new Date(event.start), 'HH:mm'),
      heureFin: format(new Date(event.end), 'HH:mm'),
      type: event.type,
      salles: event.salles || [],
      enseignementId: event.enseignementId
    });
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;

    try {
      let startDateTime, endDateTime;
      
      if (editingEvent.type === 'Soutenance' || editingEvent.type === 'Examen') {
        startDateTime = new Date(editingEvent.dateDebut);
        endDateTime = new Date(editingEvent.dateFin);
        const [startHour, startMinute] = editingEvent.heureDebut.split(':');
        const [endHour, endMinute] = editingEvent.heureFin.split(':');
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute));
      } else {
        startDateTime = new Date(editingEvent.date);
        endDateTime = new Date(editingEvent.date);
        const [startHour, startMinute] = editingEvent.heureDebut.split(':');
        const [endHour, endMinute] = editingEvent.heureFin.split(':');
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute));
      }

      const data = {
        idEnseignement: editingEvent.enseignementId,
        typeEvenement: editingEvent.type,
        dateDebut: startDateTime.toISOString(),
        dateFin: endDateTime.toISOString(),
        idSalles: editingEvent.salles.map(s => s.id),
        motifAnnulation: null
      };

      await api.planning.update(editingEvent.id, data);
      await loadEvents();
      setIsEditModalOpen(false);
      setEditingEvent(null);
      showNotification(`Événement modifié avec succès`, 'success');
    } catch (error) {
      console.error("❌ Erreur modification:", error);
      showNotification("Erreur lors de la modification", 'error');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const getEventsForDay = (day) => (filteredEvents || []).filter(event => event.start && isSameDay(new Date(event.start), day));

  const handleSaveTimetable = () => {
    if (!selectedNiveau) {
      showNotification("Veuillez sélectionner un niveau", 'error');
      return;
    }
    
    const timetable = {
      niveau: selectedNiveau,
      date: new Date().toISOString(),
      events: filteredEvents
    };
    
    const dataStr = JSON.stringify(timetable, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `emploi_du_temps_niveau_${selectedNiveau}_${format(new Date(), 'yyyy-MM-dd')}.json`);
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

  // Réinitialiser le filtre niveau
  const resetNiveauFilter = () => {
    if (niveaux.length > 0) {
      setSelectedNiveau(niveaux[0]?.id?.toString() || '');
    } else {
      setSelectedNiveau('');
    }
    setShowNiveauFilter(false);
    setSearchNiveau('');
  };

  // Récupérer le libellé du niveau sélectionné
  const getSelectedNiveauLabel = () => {
    const niveau = niveaux.find(n => n.id?.toString() === selectedNiveau);
    return niveau?.libelle || selectedNiveau;
  };

  // Filtrer les niveaux par recherche
  const filteredNiveaux = niveaux.filter(niveau =>
    niveau.libelle?.toLowerCase().includes(searchNiveau.toLowerCase())
  );

  if (loading) {
    return <SkeletonLoader />;
  }

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

          {/* Filtre Niveau - Style Select2 avec recherche */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowNiveauFilter(!showNiveauFilter)}
              className={`px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all flex items-center gap-2 min-w-[200px] justify-between ${
                selectedNiveau ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
              title="Filtrer par niveau"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {getSelectedNiveauLabel() || 'Sélectionner un niveau'}
                </span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showNiveauFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown avec recherche */}
            {showNiveauFilter && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 max-h-80 overflow-hidden">
                {/* Barre de recherche */}
                <div className="px-3 pb-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchNiveau}
                      onChange={(e) => setSearchNiveau(e.target.value)}
                      placeholder="Rechercher un niveau..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    {searchNiveau && (
                      <button
                        onClick={() => setSearchNiveau('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Liste des niveaux */}
                <div className="overflow-y-auto max-h-48 py-1">
                  {filteredNiveaux.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      {searchNiveau ? 'Aucun niveau trouvé' : 'Aucun niveau disponible'}
                    </div>
                  ) : (
                    filteredNiveaux.map((niveau) => (
                      <button
                        key={niveau.id}
                        onClick={() => {
                          setSelectedNiveau(niveau.id?.toString());
                          setShowNiveauFilter(false);
                          setSearchNiveau('');
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${
                          selectedNiveau === niveau.id?.toString()
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{niveau.libelle}</span>
                        {selectedNiveau === niveau.id?.toString() && (
                          <span className="text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
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
                      const colors = getEventColors(event.type);
                      const top = getEventTop(event.start);
                      const height = getEventHeight(event.start, event.end);
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 rounded-xl p-2.5 flex flex-col shadow-sm hover:shadow-md transition-all z-20 group cursor-pointer ${colors.bg} border ${colors.border}`}
                          style={{ top: `${top}px`, height: `${height}px`, minHeight: '55px' }}
                          onClick={() => handleEventClick(event)}
                        >
                          {/* ❌ SUPPRESSION DU PETIT POINT - La ligne suivante a été supprimée */}
                          {/* <div className={`absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full ${colors.dot}`} /> */}

                          <div className="flex-1 flex flex-col pl-4">
                            {/* Titre et horaire */}
                            <div className="flex justify-between items-start gap-1">
                              <span className={`${colors.text} text-[11px] font-semibold truncate flex-1`}>
                                {event.title}
                              </span>
                              <span className={`${colors.timeText} text-[9px] flex-shrink-0`}>
                                {event.start && format(new Date(event.start), 'HH:mm')}
                                <span className="mx-0.5">-</span>
                                {event.end && format(new Date(event.end), 'HH:mm')}
                              </span>
                            </div>

                            {/* Type d'événement - badge coloré */}
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-md self-start mt-0.5 ${colors.lightBg} ${colors.text} font-medium`}>
                              {getEventTypeLabel(event.type)}
                            </span>

                            {/* Niveau */}
                            {event.niveau && (
                              <span className="text-[9px] text-gray-600 mt-0.5">
                                {event.niveau}
                              </span>
                            )}

                            {/* Professeur - affiché en grand */}
                            {event.professeur && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0 ${colors.dot}`}>
                                  {event.professeur.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-medium text-gray-700 truncate">
                                  {event.professeur}
                                </span>
                              </div>
                            )}

                            {/* Salle - affichée en grand avec icône */}
                            {event.salles && event.salles.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Building className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span className="text-[10px] font-medium text-blue-600 truncate">
                                  {event.salles.map(s => s.nom || s).join(', ')}
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
      </main>

      <footer className="bg-gray-50 px-6 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-3">
          <span>Dernière mise à jour: {format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
          <button onClick={loadEvents} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            <RefreshCw className="w-3 h-3" /> Actualiser
          </button>
        </div>
        <div className="flex items-center gap-3">
          {selectedNiveau && (
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              {getSelectedNiveauLabel()}
            </span>
          )}
        </div>
      </footer>

      {/* Boutons FAB */}
      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all z-40">
        <Plus className="w-6 h-6" />
      </button>
      <button onClick={handleSaveTimetable} className="fixed bottom-8 right-28 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all z-40">
        <Share2Icon className="w-5 h-5" />
      </button>

      {/* Modals */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        coursFiltres={coursFiltres}
        salles={salles}
        sallesDisponibles={sallesDisponibles}
        hours={hours}
        isMultiSalleType={isMultiSalleType}
        toggleSalleSelection={toggleSalleSelection}
        events={events}
        selectedNiveau={selectedNiveau}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={() => handleOpenEditModal(selectedEvent)}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditEvent}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        salles={salles}
        hours={hours}
        events={events}
      />

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