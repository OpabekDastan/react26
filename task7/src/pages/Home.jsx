import { Link } from "react-router";
import heroImage from "../assets/hero.png";
import { usePageTitle } from "../hooks/usePageTitle.js";

function Home() {
  usePageTitle("Home");

  return (
    <section className="page home">
      <div className="hero">
        <div className="hero-text">
          <h1>Task Manager</h1>
          <p className="lead">
            A small single page application built with React and React Router.
            Tasks are loaded from a fake API with real delays, random errors,
            server side filtering, sorting and pagination.
          </p>

          <div className="hero-buttons">
            <Link className="btn btn-primary" to="/items">
              Browse tasks
            </Link>
            <Link className="btn" to="/dashboard">
              Open dashboard
            </Link>
            <Link className="btn" to="/about">
              About the project
            </Link>
          </div>
        </div>

        <img className="hero-image" src={heroImage} alt="Task manager preview" />
      </div>

      <div className="feature-grid">
        <div className="feature">
          <h3>Search &amp; filters</h3>
          <p>
            Search, three filters, sorting and pagination — all of them are kept
            in the URL, so any view can be shared as a link.
          </p>
          <Link to="/items?status=active&sort=deadline">
            Active tasks by deadline →
          </Link>
        </div>

        <div className="feature">
          <h3>Task details</h3>
          <p>
            Every task has its own address, for example <code>/items/1</code>,
            and ten fields loaded from the API by id.
          </p>
          <Link to="/items/1">Open task #1 →</Link>
        </div>

        <div className="feature">
          <h3>Statistics</h3>
          <p>
            The dashboard counts six metrics and three breakdowns from the API
            data and can be filtered by category.
          </p>
          <Link to="/dashboard">Go to dashboard →</Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
