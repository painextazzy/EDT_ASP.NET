<<<<<<< HEAD
import GestionSalles from "./pages/GestionSalles";
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Classe from "./pages/classes";

function App() {
  return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Classe />} />
       
      </Routes>
    </BrowserRouter>
  )
}
>>>>>>> 6b50ed5f1563aad8b96079c2cd9dae76a7f28a53

export default function App() {
  return <GestionSalles />;
}