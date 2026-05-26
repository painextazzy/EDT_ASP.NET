// src/components/calendar/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';

const Navbar = ({ userSettings, onOpenSettings, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getInitials = (name) => {
    if (!name) return "JD";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-end px-4 shrink-0">
      <div className="flex items-center space-x-3">
        <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
          <span className="material-symbols-outlined text-lg">notifications</span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-2 pl-3 border-l border-gray-300 cursor-pointer hover:bg-gray-200 p-1 rounded-lg transition-colors"
            onClick={toggleDropdown}
          >
            <div className="w-7 h-7 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {getInitials(userSettings?.nom)}
            </div>
            <span className="material-symbols-outlined text-gray-500 text-sm">expand_more</span>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
              <button
                onClick={onOpenSettings}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-base">settings</span>
                Paramètres
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;