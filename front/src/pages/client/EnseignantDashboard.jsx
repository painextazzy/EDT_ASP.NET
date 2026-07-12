// src/components/EnseignantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Check,
  ChevronDown,
  Loader2,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import Navbar from './Navbar';
import BigCalendarTeacher from '../../components/ui/BigCalendarTeacher';
import MiniCalendar from '../../components/ui/MiniCalendar';
import api from '../../services/api';
import { authApi } from '../../services/auth';
const EnseignantDashboard = () => {
  // États partagés pour le contrôle du BigCalendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // États pour les données
  const [events, setEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getColorForType = (type) => {
    const colorMap = {
      'Cours': 'emerald',
      'Examen': 'red',
      'Soutenance': 'red',
      'TD': 'blue',
      'TP': 'purple',
      'Conférence': 'purple',
      'Atelier': 'yellow',
      'Réunion': 'blue',
    };
    return colorMap[type] || 'gray';
  };

  // Chargement des événements
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authApi.getUser();
      if (!user || !user.id) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      const enseignantsResponse = await api.enseignant.getValides();
      let enseignants = [];
      if (Array.isArray(enseignantsResponse)) {
        enseignants = enseignantsResponse;
      } else if (enseignantsResponse?.success) {
        enseignants = enseignantsResponse.data || [];
      }

      const enseignant = enseignants.find(e => e.id_utilisateur === user.id || e.email === user.email);
      if (!enseignant) {
        setError('Aucun enseignant associé à cet utilisateur');
        setLoading(false);
        return;
      }

      const enseignantId = enseignant.id;
      const response = await api.planning.getByEnseignant(enseignantId);

      let plannings = [];
      if (response?.success && Array.isArray(response.data)) {
        plannings = response.data;
      } else if (Array.isArray(response)) {
        plannings = response;
      }

      const formattedEvents = plannings
        .filter(p => p.dateDebut && p.dateFin)
        .map(p => {
          const start = new Date(p.dateDebut + 'Z');
          const end = new Date(p.dateFin + 'Z');
          if (isNaN(start) || isNaN(end)) return null;

          const coursNom = p.enseignement?.cours?.nom || p.coursNom || 'Cours';
          const salles = p.salles?.map(s => s.nom).join(', ') || '';

          return {
            id: p.id,
            title: coursNom,
            start,
            end,
            salle: salles,
            type: p.typeEvenement || 'Cours',
            color: getColorForType(p.typeEvenement || 'Cours'),
            statut: p.statut,
            professeur: p.enseignement?.enseignant?.nom || '',
          };
        })
        .filter(e => e !== null);

      setEvents(formattedEvents);

      const today = new Date();
      const todayEventsFiltered = formattedEvents.filter(e => {
        const eventDate = new Date(e.start);
        return eventDate.getFullYear() === today.getFullYear() &&
               eventDate.getMonth() === today.getMonth() &&
               eventDate.getDate() === today.getDate() &&
               e.statut === 'Actif';
      });
      setTodayEvents(todayEventsFiltered);

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur de chargement');
      setEvents([]);
      setTodayEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Callbacks
  const handleDateChange = (date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const formatTodayCourses = () => {
    if (todayEvents.length === 0) {
      return [{ time: 'Aucun cours', title: "Aucun cours prévu aujourd'hui", room: '' }];
    }
    return todayEvents.map((event) => ({
      time: `${format(event.start, 'HH:mm', { timeZone: 'UTC' })} - ${format(event.end, 'HH:mm', { timeZone: 'UTC' })}`,
      title: event.title,
      room: event.salle || 'Salle non définie',
    }));
  };

  const todayCourses = formatTodayCourses();

  const completedCourses = events
    .filter(event => event.statut && (event.statut.toLowerCase() === 'termine' || event.statut === 'TERMINE'))
    .map(event => event.title);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handlePlanningChange = (change) => {
    if (!change) return;

    if (change.action === 'refresh' || change.action === 'create' || change.action === 'update') {
      fetchData();
      return;
    }

    setEvents(prevEvents => {
      let updatedEvents = prevEvents;

      if (change.action === 'cancel') {
        updatedEvents = prevEvents.filter(event => String(event.id) !== String(change.planningId));
      } else if (change.action === 'complete') {
        updatedEvents = prevEvents.map(event => String(event.id) === String(change.planningId) ? { ...event, statut: 'Termine' } : event);
      }

      const today = new Date();
      const todayEventsFiltered = updatedEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getFullYear() === today.getFullYear() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getDate() === today.getDate() &&
          event.statut === 'Actif';
      });

      setTodayEvents(todayEventsFiltered);
      return updatedEvents;
    });
  };

  const SidebarContent = () => (
    <>
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        <MiniCalendar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          markedDates={events.map(e => new Date(e.start))}
          compact={true}
        />
      </div>

      <div className="bg-sky-50 rounded-2xl p-4 md:p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-3 md:mb-4 text-slate-800">
            Votre cours d'aujourd'hui
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({todayEvents.length})
            </span>
          </h3>
          {todayEvents.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucun cours aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {todayCourses.map((course, idx) => (
                <div key={idx} className={idx < todayCourses.length - 1 ? 'border-b border-white/20 pb-2 md:pb-3' : 'pb-1'}>
                  <p className="text-[10px] opacity-80 mb-0.5 text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.time}
                  </p>
                  <h4 className="font-semibold text-sm text-slate-800">{course.title}</h4>
                  {course.room && <p className="text-[10px] opacity-70 text-slate-600 flex items-center gap-1"><MapPin className="w-3 h-3" /> {course.room}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">
            Cours terminés
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({completedCourses.length})
            </span>
          </h3>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        {completedCourses.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-sm text-slate-500">Aucun cours terminé</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {completedCourses.map((course, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                  {course}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-body flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
          <p className="text-slate-500 text-sm">Chargement de votre emploi du temps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-body flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Erreur de chargement</h3>
            <p className="text-slate-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />

      <main className="flex-1 flex gap-4 md:gap-8 p-3 md:p-8 overflow-hidden bg-white relative">
        <aside
          className={`
            fixed inset-0 z-40 w-72 md:w-[300px] bg-white p-4 md:p-0 md:static md:bg-transparent
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            flex flex-col gap-4 md:gap-6 overflow-y-auto no-scrollbar shrink-0
          `}
        >
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-[-1]" onClick={toggleSidebar} />
          )}
          <SidebarContent />
        </aside>

        <section className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden min-w-0">
          <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-outline-variant overflow-hidden min-h-[500px]">
            <BigCalendarTeacher
              currentDate={currentDate}
              view={view}
              onDateChange={handleDateChange}
              onViewChange={handleViewChange}
              onPlanningChange={handlePlanningChange}
            />
          </div>
        </section>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .border-outline-variant { border-color: #e2e8f0; }
        .bg-sky-50 { background-color: #f0f9ff; }
      `}</style>
    </div>
  );
};

export default EnseignantDashboard;