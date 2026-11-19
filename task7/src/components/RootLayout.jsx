import { Suspense } from "react";
import { Outlet } from "react-router";
import NavBar from "./NavBar.jsx";
import Loader from "./Loader.jsx";

function RootLayout() {
  return (
    <div className="app">
      <NavBar />

      <main className="main">
        <Suspense fallback={<Loader text="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="footer">
        <p>Task Manager · React Router homework · 2026</p>
      </footer>
    </div>
  );
}

export default RootLayout;
