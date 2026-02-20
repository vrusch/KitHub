/**
 * Vstupní bod React aplikace.
 *
 * Inicializuje React DOM root a renderuje hlavní komponentu <App />
 * v přísném režimu (StrictMode).
 *
 * Importuje globální styly (index.css).
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
