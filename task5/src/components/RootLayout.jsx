import { Suspense } from "react";
import { Outlet } from "react-router";
import NavBar from "./NavBar.jsx";
import Loader from "./Loader.jsx";

/**
 * RootLayout is the parent route of the whole app.
 * Everything that must be on every page (NavBar, footer) is written once here.
 *
 * <Outlet /> is the "hole" where React Router renders the child route:
 *   /          -> Home
 *   /items     -> TasksList
 *   /items/3   -> TaskDetails
 *
 * <Suspense> is needed because some pages are lazy (React.lazy).
 * While the chunk of the page is downloading, the fallback is shown,
 * and the NavBar stays visible because it is outside of Suspense.
 */
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
