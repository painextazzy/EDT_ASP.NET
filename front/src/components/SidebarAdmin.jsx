// src/components/SidebarAdmin.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarAdmin = () => {
  const menuItems = [
    { label: 'Tableau de bord', icon: 'dashboard', path: '/admin/dashboard' },
    { label: 'Planning et Events', icon: 'calendar_today', path: '/admin/planning' },
    { label: 'Cours & Affectation', icon: 'school', path: '/admin/cours' },
    { label: 'Professeurs', icon: 'person', path: '/admin/professeurs' },
    { label: 'Salles', icon: 'meeting_room', path: '/admin/salles' },
    { label: 'Paramètres', icon: 'settings', path: '/admin/parametres' }
  ];

  return (
    <aside className="h-screen w-60 flex flex-col fixed left-0 top-0 z-50 bg-[#edeef2] border-r border-[#c3c7c8]/10 shadow-xl py-8">
      <div className="px-6 mb-10">
        <div className="text-[#0ea5e9] text-2xl font-black tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Calendar.
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[#0ea5e9] text-white font-bold' 
                  : 'text-[#434749] hover:text-[#191c1f] hover:bg-[#e1e2e6]/50'
                }
              `}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span className="font-medium text-[15px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>


      
    </aside>
  );
};

export default SidebarAdmin;