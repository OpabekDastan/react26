import { lazy } from "react";
import { Routes, Route } from "react-router";
import RootLayout from "./components/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import ItemsList from "./pages/ItemsList.jsx";
import "./styles/App.css";

/**
 * App.jsx contains ONLY the routing of the application.
 *
 * React.lazy() turns a page into a separate file (chunk).
 * Vite builds About / Login / Dashboard / ItemDetails / NotFound into their own
 * .js files and the browser downloads a page only when the user opens it.
 * While the chunk is loading, the <Suspense> inside RootLayout shows a loader.
 */
const About = lazy(() => import("./pages/About.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const ItemDetails = lazy(() => import("./pages/ItemDetails.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function App() {
  return (
    <Routes>
      {/* NESTED ROUTES: RootLayout is the parent, it draws NavBar + <Outlet />,
          and all the routes below are rendered inside that Outlet. */}
      <Route path="/" element={<RootLayout />}>
        {/* index = the route of the parent itself, here it is "/" */}
        <Route index element={<Home />} />

        <Route path="about" element={<About />} />
        <Route path="login" element={<Login />} />

        {/* second level of nesting: /items and /items/:id */}
        <Route path="items">
          <Route index element={<ItemsList />} />
          <Route path=":id" element={<ItemDetails />} />
        </Route>

        <Route path="dashboard" element={<Dashboard />} />

        {/* "*" catches every unknown address -> custom 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
