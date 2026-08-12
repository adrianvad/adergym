import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Service worker registration is handled automatically by vite-plugin-pwa
// (see vite.config.js) — no manual registration needed here, and having
// both was causing two service workers to fight over the cache.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
