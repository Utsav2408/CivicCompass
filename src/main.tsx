import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/tokens.css";
import "./index.css";
import "./i18n/i18n";
import { App } from "./App.tsx";

// Connect to emulators in development before anything else
if (import.meta.env["VITE_USE_EMULATORS"] === "true") {
  const { connectToEmulators } = await import("./lib/emulators");
  connectToEmulators();
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
