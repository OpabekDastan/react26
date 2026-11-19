import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/queryClient.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { registerServiceWorker } from "./services/swService.js";
import App from "./App.jsx";
import "./styles/index.css";

// PWA: offline cache + updates (only in the built app)
registerServiceWorker();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
