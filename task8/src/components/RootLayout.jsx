import { Suspense } from "react";
import { Outlet } from "react-router";
import NavBar from "./NavBar.jsx";
import Loader from "./Loader.jsx";
import UpdateBanner from "./UpdateBanner.jsx";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

function RootLayout() {
  const online = useOnlineStatus();

  return (
    <div className="app">
      <NavBar />

      {!online && (
        <p className="offline-banner" role="status">
          You are offline. Pages you opened before and saved data are still available.
        </p>
      )}

      <main className="main">
        <Suspense fallback={<Loader text="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="footer">
        <p>Task Manager · React PWA homework · 2026</p>
      </footer>

      <UpdateBanner />
    </div>
  );
}

export default RootLayout;
