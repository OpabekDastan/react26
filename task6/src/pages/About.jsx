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
