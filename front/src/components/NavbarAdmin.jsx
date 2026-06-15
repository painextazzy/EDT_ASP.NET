// src/components/NavbarAdmin.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from './SidebarContext';
import { Settings, LogOut, Bell } from 'lucide-react';
import SettingsModal from './modals/SettingsModal';

const NavbarAdmin = ({
  userSettings = {},
  onLogout,
  onSaveSettings,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const dropdownRef = useRef(null);
  const { toggleSidebar, isSidebarOpen } = useSidebar();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getInitials = (name = "") => {
    if (!name) return "AD";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleOpenSettings = () => {
    setShowDropdown(false);
    setShowSettingsModal(true);
  };

  return (
    <>
      <nav className="h-12 bg-gray-100 border-b border-gray-200 shadow-md flex items-center justify-end px-4 shrink-0">
        {/* Menu hamburger pour mobile */}
        <div className="absolute left-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notification */}
          <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 pl-3 border-l border-gray-300 cursor-pointer hover:bg-gray-200 p-1 rounded-lg transition-colors"
              onClick={toggleDropdown}
            >
              {/* Avatar */}
              <div className="w-7 h-7 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {getInitials(userSettings?.nom || "Admin")}
              </div>

              {/* Nom */}
              <span className="text-sm text-gray-700 font-medium hidden sm:block">
                {userSettings?.nom || "Administrateur"}
              </span>

              {/* Chevron */}
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {userSettings?.nom || "Administrateur"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userSettings?.email || "admin@email.com"}
                  </p>
                </div>

                {/* Settings */}
                <button
                  onClick={handleOpenSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
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

      {/* Modal des paramètres */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userSettings={userSettings}
        onSave={onSaveSettings}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default NavbarAdmin;