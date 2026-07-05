// src/pages/DashboardAdmin/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { DemandesProvider } from "../../context/DemandesContext"; // ✅ Ajout
import AffectationPage from "../../components/AffectationPage";
import CoursAffectationsInterface from "../../components/CoursAffectationsInterface";
import Salle from "../../components/Salle";
import Demandes from "../../components/DemandesPage";
import ProfesseursDemandesToggle from "../../components/ProfesseursDemandesToggle";
import PlanningPage from "../../components/PlanningPage";
import DashboardHome from "../../components/DashboardHome";
import Sauvegarde from "../../components/SauvegardePage";
import NiveauxParcours from "../../components/NiveauxParcours";
import DeleguePage from "../../components/DeleguePage";

const DashboardContent = () => {
  const { isSidebarOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    const observer = new ResizeObserver(() => {
      const width = sidebar.offsetWidth;
      setSidebarWidth(width);
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  const getMarginLeft = () => {
    if (isMobile && !isSidebarOpen) return 'ml-0';
    return `ml-[${sidebarWidth}px]`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: isMobile && !isSidebarOpen ? 0 : sidebarWidth }}
      >
        <NavbarAdmin />
        <main className="p-4 md:p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/cours-affectations" element={<CoursAffectationsInterface />} />
            <Route path="/cours" element={<CoursAffectationsInterface />} />
            <Route path="/affectation" element={<AffectationPage />} />
            <Route path="/salles" element={<Salle />} />
           
            <Route path="/professeurs" element={<ProfesseursDemandesToggle />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/sauvegarde" element={<Sauvegarde />} />
            <Route path="/niveaux-parcours" element={<NiveauxParcours />} />
            <Route path="/delegues" element={<DeleguePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const DashboardAdmin = () => {
  return (
    <SidebarProvider>
      <DemandesProvider>   {/* ✅ Le provider englobe tout le dashboard admin */}
        <DashboardContent />
      </DemandesProvider>
    </SidebarProvider>
  );
};

export default DashboardAdmin;