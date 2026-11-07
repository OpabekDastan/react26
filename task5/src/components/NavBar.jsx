import { NavLink } from "react-router";

function NavBar() {
  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

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
        <NavLink to="/login" className={linkClass}>
          Login
        </NavLink>
      </nav>
    </header>
  );
}

export default NavBar;
