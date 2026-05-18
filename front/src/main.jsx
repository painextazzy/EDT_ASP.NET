import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Import AOS CSS
import 'aos/dist/aos.css';
import AOS from 'aos';

// Initialiser AOS
AOS.init({
  duration: 800, // durée de l'animation en ms
  once: false, // si true, l'animation ne se joue qu'une fois
  offset: 100, // offset (en px) depuis le déclenchement original
  delay: 0, // délai avant le début de l'animation
  easing: 'ease', // fonction d'animation
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);