import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

function NavBar() {
  const { user, loading, logout } = useAuth();
  const online = useOnlineStatus();
  const navigate = useNavigate();

  // mobile menu (on wide screens the links are always visible)
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  async function handleLogout() {
    const ok = await logout();

    if (ok) {
      navigate("/");
    }
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        Task<span>Manager</span>
      </NavLink>

      <div className="navbar-right">
        {/* online / offline indicator */}
        <span className={online ? "net-status online" : "net-status offline"}>
          {online ? "Online" : "Offline"}
        </span>

        <button
          className="menu-button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* click on any link closes the mobile menu */}
      <nav
        className={menuOpen ? "nav-links open" : "nav-links"}
        onClick={() => setMenuOpen(false)}
      >
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>

        {/* tasks are private: only for logged in users */}
        {!loading && user && (
          <>
            <NavLink to="/items" className={linkClass}>
              Tasks
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </>
        )}

        <NavLink to="/recipes" className={linkClass}>
          Recipes
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>

        {/* auth links: hidden while Firebase restores the session */}
        {!loading && user && (
          <>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <button className="nav-link nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {!loading && !user && (
          <>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink to="/signup" className={linkClass}>
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
