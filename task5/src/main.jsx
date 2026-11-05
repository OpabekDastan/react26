import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./App.jsx";
import "./styles/index.css";

/**
 * The Router must wrap the whole application, that is why it is here
 * and not inside App.jsx (App.jsx keeps only the routes).
 *
 * Why HashRouter and not BrowserRouter?
 * The project is published on GitHub Pages, which is a static file server.
 * With BrowserRouter a refresh of /items/3 would ask GitHub for a file
 * "items/3" and give 404. HashRouter puts the route after "#"
 * (.../task5/#/items/3), the server always gets index.html, and direct links,
 * refresh and Back / Forward work everywhere.
 *
 * On a host with SPA fallback (Netlify, Vercel) you can simply replace
 * HashRouter with BrowserRouter — nothing else in the code changes.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
