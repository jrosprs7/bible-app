import "@fontsource/literata/400.css";
import "@fontsource/literata/400-italic.css";
import "@fontsource/literata/600.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles.css";

// Offline support for the web version. Skipped inside a frame (e.g. a preview), where service
// workers can't run, and in the desktop app, which already ships every file locally.
const isDesktopApp = "__TAURI_INTERNALS__" in window;
if ("serviceWorker" in navigator && window.top === window && !isDesktopApp) registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
