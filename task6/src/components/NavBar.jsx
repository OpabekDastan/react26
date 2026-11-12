import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

function NavBar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

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

      <nav className="nav-links">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/items" className={linkClass}>
          Tasks
        </NavLink>
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
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
