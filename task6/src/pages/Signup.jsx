import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import Loader from "../components/Loader.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// returns the text of the first problem or "" if the form is fine
function validate(form) {
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    return "Please enter a valid email";
  }

  if (form.password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (form.password !== form.confirmPassword) {
    return "Passwords do not match";
  }

  return "";
}

function Signup() {
  usePageTitle("Sign up");

  const { user, loading, pending, error, signup, loginWithGoogle, clearError } =
    useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");

  // error from the login page should not appear here
  useEffect(() => {
    clearError();
  }, [clearError]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const problem = validate(form);

    if (problem) {
      setValidationError(problem);
      return;
    }

    setValidationError("");
    signup(form.email.trim(), form.password);
  }

  if (loading) {
    return <Loader text="Checking session..." />;
  }

  // Firebase logs the new user in right after signup
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section className="page login">
      <div className="panel login-panel">
        <h1>Create account</h1>
        <p className="muted">Sign up with email and password.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              className="input"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat the password"
            />
          </label>

          {validationError && <p className="message error">{validationError}</p>}
          {error && <p className="message error">{error}</p>}

          <button
            className="btn btn-primary full-width"
            type="submit"
            disabled={pending}
          >
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="divider">or</p>

        <button
          className="btn full-width"
          type="button"
          onClick={loginWithGoogle}
          disabled={pending}
        >
          Continue with Google
        </button>

        <p className="muted center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;
