import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { checkConnection } from "../services/networkService.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

function Offline() {
  usePageTitle("Offline");

  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  // page the user tried to open (Recipes sends it here)
  const from = location.state?.from || "/";

  async function handleRetry() {
    setChecking(true);
    setMessage("");

    const connected = await checkConnection();
    setChecking(false);

    if (connected) {
      navigate(from, { replace: true }); // connection is back -> try the page again
    } else {
      setMessage("Still no connection. Check Wi-Fi or mobile data and try again.");
    }
  }

  return (
    <section className="page offline-page">
      <div className="panel offline-panel">
        <div className="offline-icon" aria-hidden="true">
          📡
        </div>
        <h1>You are offline</h1>
        <p className="lead">
          This page needs the internet and there is no saved copy of it yet.
        </p>
        <p className="muted">
          Pages and recipes you opened before, your tasks and the dashboard still
          work without the internet.
        </p>

        {message && <p className="message error">{message}</p>}

        <div className="hero-buttons offline-buttons">
          <button className="btn btn-primary" onClick={handleRetry} disabled={checking}>
            {checking ? "Checking..." : "Retry Connection"}
          </button>
          <Link className="btn" to="/">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Offline;
