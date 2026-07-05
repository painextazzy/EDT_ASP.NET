// src/components/NavbarAdmin.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from '../context/SidebarContext';
import { Settings, LogOut, Bell, User, ChevronDown } from 'lucide-react';
import SettingsModal from '../components/modals/SettingsModal';
import { authApi } from '../services/auth';
import { API_URL } from '../services/api'; // ✅ Importer API_URL

const NavbarAdmin = ({
  userSettings = {},
  onLogout,
  onSaveSettings,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoKey, setPhotoKey] = useState(Date.now());
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const { toggleSidebar, isSidebarOpen } = useSidebar();

  // ✅ Fonction pour construire l'URL complète de la photo avec API_URL
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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOpenSettings = () => {
    setShowDropdown(false);
    setShowSettingsModal(true);
  };

  const userEmail = user?.email || userSettings?.email || "Utilisateur";
  const userNom = user?.nom || userSettings?.nom || userEmail?.split('@')[0] || "Utilisateur";
  const userPhoto = user?.photoUrl || userSettings?.photoUrl || null;
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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authApi.logout();
    }
  };

  const handleSaveSettings = async (updatedData) => {
    try {
      const newNom = updatedData.nom || userNom;
      const newPhoto = updatedData.photoUrl || userPhoto;
      
      const updatedUser = { ...user, nom: newNom, photoUrl: newPhoto };
      setUser(updatedUser);
      setPhotoKey(Date.now());
      setImageError(false);

      const currentUser = authApi.getUser();
      if (currentUser) {
        authApi.setUser({ ...currentUser, nom: newNom, photoUrl: newPhoto });
      }

      window.dispatchEvent(new Event('userUpdated'));

      if (onSaveSettings) {
        onSaveSettings(updatedData);
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
    }
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    const fallback = document.createElement('div');
    fallback.className = `w-full h-full flex items-center justify-center text-white text-xs font-bold ${avatarColor}`;
    fallback.textContent = initials;
    parent.appendChild(fallback);
  };

  if (loading) {
    return (
      <nav className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-end px-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-end px-4 shrink-0">
        <div className="absolute left-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 pl-3 border-l border-gray-300 cursor-pointer hover:bg-gray-200 p-1 rounded-lg transition-colors"
              onClick={toggleDropdown}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm overflow-hidden bg-gray-200">
                {userPhoto && !imageError ? (
                  <img 
                    key={`avatar-${photoKey}`}
                    src={fullPhotoUrl}
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${avatarColor}`}>
                    {initials}
                  </div>
                )}
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 bg-gray-200">
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
                    <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Paramètres</span>
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
      `}</style>
    </>
  );
};

export default NavbarAdmin;