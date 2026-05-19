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

export default App