import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuration du localizer pour react-big-calendar
const locales = {
  'fr': frLocale,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Événements simulés (emploi du temps)
const initialEvents = [
  {
    id: 1,
    title: "Algorithmique Avancée",
    start: new Date(2026, 4, 25, 8, 0),
    end: new Date(2026, 4, 25, 10, 0),
    type: 'course',
    status: 'active',
  },
  {
    id: 2,
    title: "Programmation Web",
    start: new Date(2026, 4, 25, 10, 30),
    end: new Date(2026, 4, 25, 12, 30),
    type: 'course',
    status: 'active',
  },
  {
    id: 3,
    title: "Bases de Données",
    start: new Date(2026, 4, 26, 8, 0),
    end: new Date(2026, 4, 26, 10, 0),
    type: 'course',
    status: 'active',
  },
  {
    id: 4,
    title: "Design UI/UX",
    start: new Date(2026, 4, 27, 14, 0),
    end: new Date(2026, 4, 27, 16, 0),
    type: 'course',
    status: 'active',
  },
  {
    id: 5,
    title: "Marketing Digital",
    start: new Date(2026, 4, 28, 9, 0),
    end: new Date(2026, 4, 28, 11, 0),
    type: 'course',
    status: 'active',
  },
  {
    id: 6,
    title: "Gestion de Projet",
    start: new Date(2026, 4, 29, 13, 0),
    end: new Date(2026, 4, 29, 15, 0),
    type: 'course',
    status: 'active',
  },
];

const CalendarInterface = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 25));
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState('week');
  
  // État pour la modale
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cancellationMotif, setCancellationMotif] = useState('');

  const handleCancelClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setCancellationMotif('');
    setShowModal(true);
  };

  const handleConfirmCancel = () => {
    if (cancellationMotif.trim()) {
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === selectedEvent.id
            ? { ...event, status: 'cancelled', cancellationMotif: cancellationMotif, cancelledAt: new Date() }
            : event
        )
      );
      setShowModal(false);
      setSelectedEvent(null);
      setCancellationMotif('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setCancellationMotif('');
  };

  // Composant personnalisé pour l'événement
  const EventComponent = ({ event }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getEventStyle = () => {
      if (event.status === 'cancelled') {
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          color: '#991b1b',
          textDecoration: 'line-through',
          opacity: 0.7,
        };
      }
      return {
        backgroundColor: '#4BB8FA20',
        borderColor: '#4BB8FA',
        color: '#1e40af',
      };
    };

    return (
      <div
        className="rbc-event-content"
        style={{ ...getEventStyle(), borderRadius: '8px', padding: '4px 8px', height: '100%' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{event.title}</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </div>
          </div>
          {event.status === 'active' && isHovered && (
            <button
              onClick={(e) => handleCancelClick(event, e)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#f87171',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                flexShrink: 0,
                marginLeft: '8px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f87171'}
            >
              ×
            </button>
          )}
          {event.status === 'cancelled' && (
            <span style={{ fontSize: '9px', color: '#f87171', fontWeight: 'bold', marginLeft: '8px', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  const eventPropGetter = (event) => {
    let style = {
      borderRadius: '8px',
      fontSize: '12px',
      padding: '0px',
      fontWeight: '500',
      transition: 'all 0.2s',
      cursor: 'pointer',
    };

    if (event.status === 'cancelled') {
      style = {
        ...style,
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        opacity: 0.7,
      };
    } else {
      style = {
        ...style,
        backgroundColor: '#4BB8FA20',
        border: `1px solid #4BB8FA`,
      };
    }

    return { style };
  };

  const components = {
    event: EventComponent,
  };

  const formats = {
    timeGutterFormat: (date, culture, localizer) => {
      return localizer.format(date, 'HH:mm', culture);
    },
    eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
      return `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`;
    },
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: '<',
    next: '>',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Cours',
    showMore: (total) => `+ ${total} autres`,
    noEventsInRange: 'Aucun cours sur cette période',
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center">
          <span className="text-gray-900 font-semibold tracking-tight text-lg">Calendar.</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center space-x-2 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
              JD
            </div>
            <span className="material-symbols-outlined text-gray-500">expand_more</span>
          </div>
        </div>
      </nav>

      {/* Calendar Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-6">
          {/* Date Display Box */}
          <div className="flex flex-col items-center border border-gray-300 rounded overflow-hidden">
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 w-full text-center uppercase">
              {format(currentDate, 'MMM', { locale: frLocale })}
            </span>
            <span className="text-xl font-bold px-3 py-1 bg-white">
              {format(currentDate, 'dd')}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: frLocale })}{' '}
              <span className="ml-2 text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                {events.filter(e => e.status === 'active').length} cours
              </span>
            </h1>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-gray-200 rounded-md px-3 py-1.5 space-x-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
              <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] font-bold text-blue-600">L</div>
                <div className="w-5 h-5 rounded-full bg-purple-100 border border-white flex items-center justify-center text-[8px] font-bold text-purple-600">M</div>
              </div>
              <span className="text-xs text-gray-500 font-medium">+2</span>
              <span className="text-sm text-gray-700">Tous</span>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            view={view}
            onView={setView}
            formats={formats}
            messages={messages}
            eventPropGetter={eventPropGetter}
            components={components}
            defaultView="week"
            views={['week', 'day']}
            step={30}
            timeslots={2}
            min={new Date(2026, 4, 25, 7, 0)}
            max={new Date(2026, 4, 25, 18, 0)}
            culture="fr"
            className="h-full"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white px-6 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center space-x-4">
          <span>© 2026 Calendar - Lundi au Vendredi, 7h - 18h</span>
        </div>
      </footer>

      {/* Modal d'annulation - version plus douce */}
      {showModal && selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">event_busy</span>
                Annulation du cours
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-700 flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-blue-500" style={{ fontSize: '18px' }}>school</span>
                  Cours à annuler
                </p>
                <p className="text-base font-semibold text-gray-800">{selectedEvent.title}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '14px' }}>schedule</span>
                  {format(selectedEvent.start, 'EEEE d MMMM yyyy', { locale: frLocale })} • {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '18px' }}>edit_note</span>
                  Motif d'annulation
                </label>
                <textarea
                  value={cancellationMotif}
                  onChange={(e) => setCancellationMotif(e.target.value)}
                  placeholder="Veuillez saisir le motif de l'annulation..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none bg-gray-50"
                  rows="3"
                />
              </div>
            </div>
            
            {/* Modal Footer - version plus douce */}
            <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 rounded-lg"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                Annuler
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        
        /* Personnalisation du calendrier */
        .rbc-calendar {
          font-family: 'Poppins', sans-serif;
        }
        
        .rbc-header {
          padding: 12px 8px;
          font-weight: 500;
          font-size: 13px;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rbc-header span {
          color: #374151;
          font-weight: 600;
          margin-left: 4px;
        }
        
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .rbc-today {
          background-color: #eff6ff;
        }
        
        .rbc-event {
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .rbc-event:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .rbc-toolbar {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rbc-toolbar button {
          border-radius: 8px;
          font-size: 13px;
          padding: 6px 12px;
          transition: all 0.2s;
          background: transparent;
          border: 1px solid #e5e7eb;
          cursor: pointer;
        }
        
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: #4BB8FA;
          color: white;
          border-color: #4BB8FA;
        }
        
        .rbc-toolbar-label {
          font-weight: 600;
          font-size: 16px;
        }
        
        .rbc-time-view .rbc-row {
          min-height: 60px;
        }
        
        .rbc-time-content {
          border-top: 1px solid #e5e7eb;
        }
        
        .rbc-timeslot-group {
          border-bottom: 1px dashed #f3f4f6;
          min-height: 60px;
        }
        
        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: none;
        }
        
        .rbc-time-slot {
          min-height: 60px;
        }
        
        .rbc-time-header-content {
          border-left: 1px solid #e5e7eb;
        }
        
        .rbc-time-header-gutter {
          border-right: 1px solid #e5e7eb;
        }
        
        .rbc-day-slot .rbc-event {
          min-height: 50px;
        }
        
        .rbc-time-column .rbc-timeslot-group:first-child {
          border-top: none;
        }
        
        /* Scrollbar */
        .rbc-time-content::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .rbc-time-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .rbc-time-content::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        
        /* Animation modale */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .fixed.inset-0.z-50 .bg-white {
          animation: modalFadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CalendarInterface;