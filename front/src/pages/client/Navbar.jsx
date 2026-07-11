// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { UserRoundCog, LogOut, ChevronDown, Menu, Bell } from 'lucide-react';
import { authApi } from '../../services/auth';
import { API_URL } from '../../services/api';
import SettingsModal from '../../components/modals/SettingsModal';

const Navbar = ({ toggleSidebar, onOpenSettings }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoKey, setPhotoKey] = useState(Date.now());
  const [imageError, setImageError] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);

  const getFullPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    if (photoUrl.startsWith('/')) {
      return `${API_URL}${photoUrl}`;
    }
    return `${API_URL}/${photoUrl}`;
  };

  const loadUserFromStorage = () => {
    const currentUser = authApi.getUser();
    if (currentUser) {
      setUser(currentUser);
      setPhotoKey(Date.now());
      setImageError(false);
      return true;
    }
    return false;
  };

  const loadUserFromAPI = async () => {
    try {
      const data = await authApi.getProfile();
      if (data.success) {
        const currentUser = authApi.getUser();
        setUser(currentUser);
        setPhotoKey(Date.now());
        setImageError(false);
        return true;
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    }
    return false;
  };

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      if (!loadUserFromStorage()) {
        await loadUserFromAPI();
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user_data') {
        const currentUser = authApi.getUser();
        if (currentUser) {
          setUser(currentUser);
          setPhotoKey(Date.now());
          setImageError(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleUserUpdate = () => {
      const currentUser = authApi.getUser();
      if (currentUser) {
        setUser(currentUser);
        setPhotoKey(Date.now());
        setImageError(false);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    // Écouter les nouvelles notifications (ex: nouvel emploi du temps)
    const handleNewPlanning = () => {
      setNotificationCount((prev) => prev + 1);
    };
    window.addEventListener('newPlanning', handleNewPlanning);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('newPlanning', handleNewPlanning);
    };
  }, []);

  // Gestion des clics en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOpenSettings = () => {
    setShowDropdown(false);
    setShowSettingsModal(true);
    if (onOpenSettings) onOpenSettings();
  };

  const handleSaveSettings = async (updatedData) => {
    try {
      const newNom = updatedData.nom || user?.nom || 'Utilisateur';
      const newPhoto = updatedData.photoUrl || user?.photoUrl || null;

      const updatedUser = { ...user, nom: newNom, photoUrl: newPhoto };
      setUser(updatedUser);
      setPhotoKey(Date.now());
      setImageError(false);

      const currentUser = authApi.getUser();
      if (currentUser) {
        authApi.setUser({ ...currentUser, nom: newNom, photoUrl: newPhoto });
      }

      window.dispatchEvent(new Event('userUpdated'));
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/login';
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    const fallback = document.createElement('div');
    fallback.className = `w-full h-full flex items-center justify-center text-white text-sm font-bold ${avatarColor}`;
    fallback.textContent = initials;
    parent.appendChild(fallback);
  };

  // Réinitialiser les notifications au clic sur la cloche (optionnel)
  const handleNotificationClick = () => {
    setNotificationCount(0);
    // Ici vous pouvez ouvrir un panneau de notifications si souhaité
  };

  const userEmail = user?.email || 'utilisateur@example.com';
  const userNom = user?.nom || userEmail?.split('@')[0] || 'Utilisateur';
  const userPhoto = user?.photoUrl || null;
  const displayName = userNom;
  const fullPhotoUrl = getFullPhotoUrl(userPhoto);

  const getInitials = () => {
    if (userNom) {
      return userNom.substring(0, 2).toUpperCase();
    }
    return 'UT';
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-red-500', 'bg-cyan-500'
    ];
    const index = (userNom?.length || 0) % colors.length;
    return colors[index] || 'bg-blue-500';
  };

  const initials = getInitials();
  const avatarColor = getAvatarColor();

  if (loading) {
    return (
      <nav className="border-b border-outline-variant px-3 md:px-6 py-2 md:py-3 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="border-b border-outline-variant px-3 md:px-6 py-2 md:py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm bg-white shadow-md">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleSidebar}
            className="p-1.5 md:hidden text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span
            className="text-xl md:text-2xl font-bold text-sky-500"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Calendar.
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Icône de notification avec badge */}
          <button
            onClick={handleNotificationClick}
            className="relative p-1.5 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 md:w-5 md:h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Menu profil */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-1 md:gap-2 p-1 hover:bg-slate-50 rounded-full transition-colors"
              onClick={toggleDropdown}
              aria-label="Menu profil"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center shadow-sm flex-shrink-0 bg-slate-100">
                {userPhoto && !imageError ? (
                  <img
                    key={`avatar-${photoKey}`}
                    src={fullPhotoUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${avatarColor}`}>
                    {initials}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Menu déroulant profil */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-outline-variant py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center shadow-sm flex-shrink-0 bg-slate-100">
                    {userPhoto && !imageError ? (
                      <img
                        key={`dropdown-${photoKey}`}
                        src={fullPhotoUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${avatarColor}`}>
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenSettings}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-outline-variant"
                >
                  <UserRoundCog className="w-4 h-4 text-slate-500" />
                  <span>Mon Profil</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modal Paramètres */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userData={{
          nom: userNom,
          email: userEmail,
          photoUrl: userPhoto
        }}
        onUpdate={handleSaveSettings}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .border-outline-variant { border-color: #e2e8f0; }
      `}</style>
    </>
  );
};

export default Navbar;