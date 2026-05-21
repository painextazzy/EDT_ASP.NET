// src/components/NavbarAdmin.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarAdmin = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 px-6 py-1 flex justify-between items-center w-full bg-[#edeef2] shadow-sm">
      {/* Left section - vide */}
      <div className="flex items-center gap-4 flex-1"></div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Bouton Notifications */}
        <button className="p-2 text-[#434749] hover:bg-[#e1e2e6]/50 hover:text-[#181f21] rounded-full transition-colors active:scale-95 duration-150 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profil utilisateur */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-[#e1e2e6]/30 p-1.5 rounded-full transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-8 w-8 rounded-full bg-white overflow-hidden border border-[#c3c7c8]/20">
              <img 
                alt="Administrator Profile" 
                className="h-full w-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJrqcc6bTJj1lQrq7bujWOkjpyo9l1GgLgi8p_FtS7gafnk_X8io2ycVtkJcp9_UQGPKE4WCSMS5U94FTykY4YD0HhalpK4NlIJ9g1Kfp4BJuTNsmcwhdQAkemDlD2AbS2dGImUYw0Rlt1g8voXf0E_qIYnb7I-P4RXvgbq5YzVjTgewauxVhnnuB2f8s4xQfU6Zjj2Sv5wfMx_VOviwa7zGy6ckXEXgRHrnd5FnzdVsIi4PdqN1BM__sQiOq58fuhV98A8vd7"
              />
            </div>
            <span className="material-symbols-outlined text-[#434749] text-[20px]">keyboard_arrow_down</span>
          </div>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#c3c7c8]/10 py-2 z-50">
              <div className="px-4 py-3 border-b border-[#c3c7c8]/10">
                <p className="text-sm font-semibold text-[#191c1f]">Admin User</p>
                <p className="text-xs text-[#434749]">admin@calendar.com</p>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full text-left px-4 py-2 text-sm text-[#434749] hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Mon profil
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2 text-sm text-[#434749] hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                Paramètres
              </button>
              <hr className="my-1 border-gray-100" />
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavbarAdmin;