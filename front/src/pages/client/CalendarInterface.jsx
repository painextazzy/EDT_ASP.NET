// src/pages/client/CalendarInterface.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/calendar/Navbar';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import SettingsModal from '../../components/calendar/SettingsModal';
import CancelModal from '../../components/calendar/CancelModal';
import { CardGridSkeleton } from '../../components/SkeletonLoader';

// Couleurs par défaut pour les cours
const defaultColors = [
  '#4BB8FA', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
];

const CalendarInterface = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [loading, setLoading] = useState(true);
  
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

  // Charger les événements depuis l'API
  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.planning.getAll();
      
      // Transformer les données de l'API vers le format attendu par CalendarGrid
      const formattedEvents = data.map((item, index) => ({
        id: item.id,
        title: item.titre || item.matiere?.nom || 'Cours',
        start: new Date(item.dateDebut),
        end: new Date(item.dateFin),
        type: item.typeEvenement?.toLowerCase() === 'examen' ? 'exam' : 
               item.typeEvenement?.toLowerCase() === 'soutenance' ? 'defense' : 'course',
        status: item.statut === 'Annule' ? 'cancelled' : 'active',
        color: defaultColors[index % defaultColors.length],
        cancellationMotif: item.motifAnnulation,
        niveau: item.niveau,
        enseignant: item.enseignant?.nom
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erreur chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données utilisateur
  const loadUserData = async () => {
    try {
      // Récupérer l'utilisateur connecté depuis le localStorage ou l'API
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserSettings({
          nom: user.nom || userSettings.nom,
          email: user.email || userSettings.email,
          password: '********'
        });
        setTempUserSettings({
          nom: user.nom || userSettings.nom,
          email: user.email || userSettings.email,
          password: '********'
        });
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadUserData();
  }, []);

  const handleCancelEvent = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setCancellationMotif('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (cancellationMotif.trim() && selectedEvent) {
      try {
        // Appel API pour annuler le cours
        await api.planning.cancel(selectedEvent.id, cancellationMotif);
        
        // Mettre à jour l'état local
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
      } catch (error) {
        alert('Erreur lors de l\'annulation du cours');
      }
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

  const handleSaveSettings = async () => {
    try {
      // Mettre à jour les informations utilisateur
      const updatedUser = {
        nom: tempUserSettings.nom,
        email: tempUserSettings.email
      };
      
      if (tempUserSettings.password !== '********' && tempUserSettings.password) {
        updatedUser.password = tempUserSettings.password;
      }
      
      // Sauvegarder dans le localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const newUser = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      
      setUserSettings({ ...tempUserSettings });
      setShowSettingsModal(false);
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-white h-20 shadow-sm border border-gray-100 animate-pulse"></div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <CardGridSkeleton cards={6} cols={3} />
          </div>
        </div>
      </div>
    );
  }

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
      `}</style>
    </div>
  );
};

export default CalendarInterface;