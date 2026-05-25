// src/components/NavbarAdmin.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';

const NavbarAdmin = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userSettings, setUserSettings] = useState({
    nom: 'Admin User',
    email: 'admin@calendar.fr',
    password: '********'
  });
  const [tempUserSettings, setTempUserSettings] = useState({ ...userSettings });
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const openSettingsModal = () => {
    setTempUserSettings({ ...userSettings });
    setShowSettingsModal(true);
    setShowDropdown(false);
  };

  const handleSaveSettings = () => {
    setUserSettings({ ...tempUserSettings });
    setShowSettingsModal(false);
    alert('Paramètres sauvegardés avec succès !');
  };

  const notifications = [
    { id: 1, title: "Nouveau cours ajouté", message: "Algorithmique avancée", time: "Il y a 5 min", read: false },
    { id: 2, title: "Affectation modifiée", message: "Salle A-102 → Cours INF401", time: "Il y a 1 heure", read: false },
    { id: 3, title: "Professeur assigné", message: "Jean Dupont → Cours MGT501", time: "Il y a 3 heures", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Récupérer les initiales du nom
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 px-4 md:px-6 py-2 flex justify-end items-center bg-gray-100 border-b border-gray-200 shadow-sm">
      {/* Right section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Bouton Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all duration-200 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Dropdown Notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  <button className="text-xs text-blue-500 hover:text-blue-600">Tout marquer</button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${!notif.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="w-full text-center text-xs text-gray-500 hover:text-gray-700">
                  Voir toutes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Profil utilisateur */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1.5 rounded-lg transition-all duration-200"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-semibold">{getInitials(userSettings.nom)}</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-gray-800">{userSettings.nom}</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
            <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
              <button 
                onClick={openSettingsModal}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Paramètres */}
      {showSettingsModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 animate-fadeIn"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-scaleIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-sky-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Paramètres du compte</h2>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                      value={tempUserSettings.nom}
                      onChange={(e) => setTempUserSettings({ ...tempUserSettings, nom: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                      value={tempUserSettings.email}
                      onChange={(e) => setTempUserSettings({ ...tempUserSettings, email: e.target.value })}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                      value={tempUserSettings.password}
                      onChange={(e) => setTempUserSettings({ ...tempUserSettings, password: e.target.value })}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Laissez vide pour conserver le mot de passe actuel</p>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowSettingsModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-sm font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default NavbarAdmin;