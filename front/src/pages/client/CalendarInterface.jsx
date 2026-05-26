// src/pages/client/CalendarInterface.jsx
import React, { useState } from 'react';
import Navbar from '../../components/calendar/Navbar';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import SettingsModal from '../../components/calendar/SettingsModal';
import CancelModal from '../../components/calendar/CancelModal';

// Événements simulés avec différentes couleurs
const initialEvents = [
  {
    id: 1,
    title: "Algorithmique Avancée",
    start: new Date(2026, 4, 25, 8, 0),
    end: new Date(2026, 4, 25, 10, 0),
    type: 'course',
    status: 'active',
    color: '#4BB8FA'
  },
  {
    id: 2,
    title: "Programmation Web",
    start: new Date(2026, 4, 25, 10, 30),
    end: new Date(2026, 4, 25, 12, 30),
    type: 'course',
    status: 'active',
    color: '#10B981'
  },
  {
    id: 3,
    title: "Bases de Données",
    start: new Date(2026, 4, 26, 8, 0),
    end: new Date(2026, 4, 26, 10, 0),
    type: 'course',
    status: 'active',
    color: '#8B5CF6'
  },
  {
    id: 4,
    title: "Design UI/UX",
    start: new Date(2026, 4, 27, 14, 0),
    end: new Date(2026, 4, 27, 16, 0),
    type: 'course',
    status: 'active',
    color: '#F59E0B'
  },
  {
    id: 5,
    title: "Marketing Digital",
    start: new Date(2026, 4, 28, 9, 0),
    end: new Date(2026, 4, 28, 11, 0),
    type: 'course',
    status: 'active',
    color: '#EF4444'
  },
  {
    id: 6,
    title: "Gestion de Projet",
    start: new Date(2026, 4, 29, 13, 0),
    end: new Date(2026, 4, 29, 15, 0),
    type: 'course',
    status: 'active',
    color: '#EC4899'
  },
];

const CalendarInterface = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 25));
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState('week');
  
  // État utilisateur
  const [userSettings, setUserSettings] = useState({
    nom: 'Jean Dupont',
    email: 'jean.dupont@calendar.fr',
    password: '********'
  });
  const [tempUserSettings, setTempUserSettings] = useState({ ...userSettings });
  
  // État pour les modales
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cancellationMotif, setCancellationMotif] = useState('');

  const handleCancelEvent = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setCancellationMotif('');
    setShowCancelModal(true);
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
      setShowCancelModal(false);
      setSelectedEvent(null);
      setCancellationMotif('');
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedEvent(null);
    setCancellationMotif('');
  };

  const openSettingsModal = () => {
    setTempUserSettings({ ...userSettings });
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    setUserSettings({ ...tempUserSettings });
    setShowSettingsModal(false);
    alert('Paramètres sauvegardés avec succès !');
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <Navbar 
        userSettings={userSettings}
        onOpenSettings={openSettingsModal}
        onLogout={handleLogout}
      />

      {/* Calendar Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center border border-gray-300 rounded overflow-hidden">
            <span className="bg-gray-800 text-white text-[8px] font-bold px-2 py-0.5 w-full text-center uppercase">
              {currentDate.toLocaleString('fr', { month: 'short' })}
            </span>
            <span className="text-base font-bold px-2 py-0.5 bg-white">
              {currentDate.getDate()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-semibold">
              {currentDate.toLocaleString('fr', { month: 'long', year: 'numeric' })}{' '}
              <span className="ml-1 text-[10px] font-normal bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                {events.filter(e => e.status === 'active').length} cours
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <CalendarGrid 
        events={events}
        setEvents={setEvents}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
        onCancelEvent={handleCancelEvent}
      />

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userSettings={userSettings}
        tempUserSettings={tempUserSettings}
        setTempUserSettings={setTempUserSettings}
        onSave={handleSaveSettings}
      />

      <CancelModal 
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        selectedEvent={selectedEvent}
        cancellationMotif={cancellationMotif}
        setCancellationMotif={setCancellationMotif}
        onConfirm={handleConfirmCancel}
      />

      <style>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 20px;
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
          font-size: 11px;
        }
        
        .rbc-header {
          padding: 8px 6px;
          font-weight: 500;
          font-size: 11px;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rbc-header span {
          color: #374151;
          font-weight: 600;
          margin-left: 3px;
          font-size: 11px;
        }
        
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .rbc-today {
          background-color: #eff6ff;
        }
        
        .rbc-event {
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .rbc-event:hover {
          transform: scale(1.01);
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        
        .rbc-toolbar {
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rbc-toolbar button {
          border-radius: 6px;
          font-size: 11px;
          padding: 4px 10px;
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
          font-size: 13px;
        }
        
        .rbc-time-view .rbc-row {
          min-height: 50px;
        }
        
        .rbc-time-content {
          border-top: 1px solid #e5e7eb;
        }
        
        .rbc-timeslot-group {
          border-bottom: 1px dashed #f3f4f6;
          min-height: 50px;
        }
        
        .rbc-time-slot {
          min-height: 50px;
        }
        
        .rbc-time-gutter .rbc-timeslot-group .rbc-label {
          font-size: 10px;
          padding-top: 4px;
        }
        
        /* Scrollbar */
        .rbc-time-content::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        
        .rbc-time-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .rbc-time-content::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default CalendarInterface;