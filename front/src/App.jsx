import { Routes, Route } from "react-router-dom";

import Accueil from "./pages/Accueil";
import Login from "./pages/Login";
import InscriptionProfesseur from "./pages/InscriptionProfesseur";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<InscriptionProfesseur />} />
    </Routes>
  );
}

export default App;