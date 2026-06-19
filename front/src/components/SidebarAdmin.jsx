// src/components/SidebarAdmin.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  School, 
  Users, 
  DoorOpen, 
  CloudUpload,
  Layers,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  History,
  UserCheck
} from 'lucide-react';

const SidebarAdmin = () => {
  const { isSidebarOpen, closeSidebar, isCollapsed, toggleCollapse } = useSidebar();
  const location = useLocation();

  const menuItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin' },
    { label: 'Planning', icon: CalendarDays, path: '/admin/planning' },
    { label: 'Cours & Affectation', icon: School, path: '/admin/cours' },
    { label: 'Professeurs', icon: Users, path: '/admin/professeurs' },
    { label: 'Salles', icon: DoorOpen, path: '/admin/salles' },
    { label: 'Niveau & Parcours', icon: Layers, path: '/admin/niveaux-parcours' },

    { label: 'Délégués', icon: UserCheck, path: '/admin/delegues' },
    { label: 'Historiques cours annulés', icon: History, path: '/admin/cours-annules' },
    { label: 'Sauvegarde', icon: CloudUpload, path: '/admin/sauvegarde' }

  ];

  return (
    <div className="relative">
      {/* Backdrop mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30 backdrop-blur-sm animate-fadeIn"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Fond gris avec sélection bleue */}
      <aside className={`
        h-screen flex flex-col fixed left-0 top-0 z-50
        bg-gray-100 border-r border-gray-200
        shadow-lg transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header avec logo */}
        <div className={`
          px-4 py-6 border-b border-gray-200
          flex items-center justify-between
          ${isCollapsed ? 'flex-col gap-4' : ''}
        `}>
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <div>
                <div className="text-sky-500 text-2xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Calendar.
                </div>
              </div>
            )}
          </div>
          
          {/* Bouton toggle collapse */}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all duration-200"
            aria-label="Toggle sidebar"
            title={isCollapsed ? "Agrandir" : "Réduire"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group
                    ${isCollapsed ? 'justify-center' : ''}
                    ${isActive 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-white' : 'group-hover:text-gray-800'}`} />
                  {!isCollapsed && (
                    <span className={`text-sm font-medium transition-all duration-200 ${isActive ? 'text-white' : 'group-hover:text-gray-900'}`}>
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-8 bg-white/50 rounded-full" />
                  )}
                  {isActive && isCollapsed && (
                    <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Version info en bas */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Version 2.0.0</p>
              <p className="text-[9px] text-gray-300 mt-0.5">© 2026 EMIT - Tous droits réservés</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-[8px] text-gray-400">v2.0</p>
            </div>
          </div>
        )}
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SidebarAdmin;