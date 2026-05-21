import { Routes, Route } from "react-router-dom";

import Accueil from "./pages/Accueil";
import Login from "./pages/Login";
import InscriptionProfesseur from "./pages/InscriptionProfesseur";


import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<InscriptionProfesseur />} />
     
     
      <Route path="/admin/*" element={<DashboardAdmin />} />
      
      
    </Routes>
  );
}

export default App;