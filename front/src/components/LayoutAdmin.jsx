// src/components/LayoutAdmin.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from './SidebarAdmin';
import NavbarAdmin from './NavbarAdmin';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

const LayoutContent = () => {
  const { isSidebarOpen, isCollapsed } = useSidebar();
  
  // Calculer la marge en fonction de l'état de la sidebar
  const getMarginLeft = () => {
    if (window.innerWidth < 768) return 'ml-0';
    if (isCollapsed) return 'ml-20';
    return 'ml-64';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className={`transition-all duration-300 ease-in-out ${getMarginLeft()}`}>
        <NavbarAdmin />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const LayoutAdmin = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default LayoutAdmin;