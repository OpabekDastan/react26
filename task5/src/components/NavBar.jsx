import { NavLink } from "react-router";

/**
 * NavLink is the same as Link, but it knows if its route is active now.
 * className gets a function with { isActive } -> we highlight the current page.
 * `end` on "/" means: active only for the exact "/" path, not for "/items".
 */
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
