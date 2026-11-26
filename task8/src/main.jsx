import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { registerServiceWorker } from "./services/swService.js";
import App from "./App.jsx";
import "./styles/index.css";

// PWA: offline cache + updates (only in the built app)
registerServiceWorker();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
