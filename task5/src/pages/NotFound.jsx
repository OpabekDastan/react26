import { Link, useLocation } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle.js";

// This page is rendered by the route <Route path="*" />,
// which matches every address that no other route matched.
function NotFound() {
  usePageTitle("Page not found");

  const location = useLocation();

  return (
    <section className="page not-found">
      <p className="code-404">404</p>
      <h1>Page not found</h1>

      <p className="lead">
        There is no page with the address <code>{location.pathname}</code>.
      </p>

      <div className="hero-buttons center">
        <Link className="btn btn-primary" to="/">
          Go home
        </Link>
        <Link className="btn" to="/items">
          All tasks
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
