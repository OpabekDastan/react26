import { useState } from "react";
import { Link } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle.js";

/**
 * Placeholder for future authentication.
 * There is no real login yet: the form only validates the fields
 * and shows a message. No request is sent.
 */
function Login() {
  usePageTitle("Login");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSent(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setSent(true);
  }

  return (
    <section className="page login">
      <div className="panel login-panel">
        <h1>Sign in</h1>
        <p className="muted">
          Authentication is not implemented yet. This page is a styled
          placeholder for the next homework.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
            />
          </label>

          {error && <p className="message error">{error}</p>}
          {sent && (
            <p className="message success">
              Form is valid. Real authentication will be added later.
            </p>
          )}

          <button className="btn btn-primary full-width" type="submit">
            Sign in
          </button>
        </form>

        <p className="muted center">
          Do not have an account? <Link to="/about">Read about the project</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
