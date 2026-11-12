import { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import Loader from "../components/Loader.jsx";

function Login() {
  usePageTitle("Login");

  const { user, loading, pending, error, login, loginWithGoogle, clearError } =
    useAuth();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [validationError, setValidationError] = useState("");

  // error from the signup page should not appear here
  useEffect(() => {
    clearError();
  }, [clearError]);

  // page the user tried to open before ProtectedRoute sent them here
  const from = location.state?.from?.pathname || "/profile";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.includes("@")) {
      setValidationError("Please enter a valid email");
      return;
    }

    if (form.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    setValidationError("");
    login(form.email.trim(), form.password);
  }

  if (loading) {
    return <Loader text="Checking session..." />;
  }

  // logged in (now or before) -> go where the user wanted
  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <section className="page login">
      <div className="panel login-panel">
        <h1>Sign in</h1>
        <p className="muted">Log in with your email or Google account.</p>

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
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
            />
          </label>

          {validationError && <p className="message error">{validationError}</p>}
          {error && <p className="message error">{error}</p>}

          <button
            className="btn btn-primary full-width"
            type="submit"
            disabled={pending}
          >
            {pending ? "Signing in..." : "Sign in"}
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
          Do not have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
