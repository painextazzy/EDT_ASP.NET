// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Login from "./pages/Login";
import InscriptionProfesseur from "./pages/InscriptionProfesseur";
import VerificationCode from './pages/VerificationCode';
import EnseignantDashboard from "./pages/client/EnseignantDashboard";
import Verification from "./pages/VerificationOTP";
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      {/* Routes publiques – redirigent vers dashboard si token existe */}
      <Route path="/" element={<PublicRoute><Accueil /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/inscription" element={<PublicRoute><InscriptionProfesseur /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerificationCode /></PublicRoute>} />
      <Route path="/verify-code" element={<PublicRoute><Verification /></PublicRoute>} />

      {/* Routes protégées : ADMIN */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin/*" element={<DashboardAdmin />} />
      </Route>

      {/* Routes protégées : ENSEIGNANT */}
      <Route element={<ProtectedRoute requiredRole="ENSEIGNANT" />}>
        <Route path="/enseignant/*" element={<EnseignantDashboard />} />
      </Route>

      {/* Fallback : route inconnue */}
      <Route path="*" element={<PublicRoute><Accueil /></PublicRoute>} />
    </Routes>
  );
}

export default App;