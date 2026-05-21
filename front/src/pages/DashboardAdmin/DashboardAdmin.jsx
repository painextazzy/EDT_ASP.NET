// src/pages/DashboardAdmin/DashboardAdmin.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import AffectationPage from "../../components/AffectationPage";
import CoursAffectationsInterface from "../../components/CoursAffectationsInterface";
import Salle from "../../components/Salle";

const DashboardAdmin = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fd' }}>
      <SidebarAdmin />
      <div className="ml-60">
        <NavbarAdmin />
        <main className="p-8">
          <Routes>
            <Route path="/" element={<CoursAffectationsInterface />} />
            <Route path="/cours" element={<CoursAffectationsInterface />} />
            <Route path="/affectation" element={<AffectationPage />} />
            <Route path="/salles" element={<Salle />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;