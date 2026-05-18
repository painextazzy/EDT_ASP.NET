import { Routes, Route } from "react-router-dom";

import Accueil from "./pages/Accueil";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;