import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import App from "./App";
import "./index.css";

// Import AOS CSS
import "aos/dist/aos.css";
import AOS from "aos";

// Initialiser AOS
AOS.init({
  duration: 800,
  once: false,
  offset: 100,
  delay: 0,
  easing: "ease",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </BrowserRouter>
  </React.StrictMode>
);