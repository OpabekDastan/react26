import { Link } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle.js";

function About() {
  usePageTitle("About");

  return (
    <section className="page about">
      <h1>About</h1>

      <div className="about-grid">
        <article className="panel">
          <h2>About me</h2>
          <p>
            My name is Dastan. I am a student and I am learning front-end
            development: HTML, CSS, JavaScript and now React. This project is
            the fifth homework of the React course, every homework is built on
            top of the previous one.
          </p>
          <ul className="list">
            <li>Languages: JavaScript, Python</li>
            <li>Tools: React, Vite, Git, GitHub Pages</li>
            <li>Contact: github.com/OpabekDastan</li>
          </ul>
        </article>

        <article className="panel">
          <h2>About the project</h2>
          <p>
            Task Manager is a single page application for managing tasks. Data
            is stored in <code>localStorage</code> and is served by a fake API
            that imitates a real server: a random delay from 300 to 1200 ms and
            a small chance of an error for every request.
          </p>

          <h3>What was added in this homework</h3>
          <ul className="list">
            <li>React Router with nested routes and a shared layout</li>
            <li>
              Dynamic route <code>/items/:id</code> with <code>useParams</code>
            </li>
            <li>
              Search, filters, sorting and pagination synchronized with the URL
              through <code>useSearchParams</code>
            </li>
            <li>
              Lazy loading of five pages with <code>React.lazy</code> and{" "}
              <code>Suspense</code>
            </li>
            <li>
              Cancelling of outdated requests with <code>AbortController</code>
            </li>
            <li>A dashboard with statistics calculated from the API data</li>
          </ul>

          <h3>Structure</h3>
          <ul className="list">
            <li>
              <code>pages/</code> — one file per route
            </li>
            <li>
              <code>components/</code> — reusable UI (Card, Filters, Pagination)
            </li>
            <li>
              <code>services/service.js</code> — all requests to the API
            </li>
            <li>
              <code>hooks/</code> — custom hooks
            </li>
            <li>
              <code>styles/</code> — CSS files
            </li>
          </ul>
        </article>
      </div>

      <p className="center">
        <Link className="btn btn-primary" to="/items">
          Go to the tasks
        </Link>
      </p>
    </section>
  );
}

export default About;
