import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { formatDate } from "../utils/format.js";

// "google.com" / "password" -> readable name of the sign-in method
function providerName(user) {
  const id = user.providerData[0]?.providerId;
  return id === "google.com" ? "Google" : "Email / Password";
}

function Profile() {
  usePageTitle("Profile");

  // ProtectedRoute guarantees that user is not null here
  const { user, pending, error, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const ok = await logout();

    if (ok) {
      navigate("/login", { replace: true });
    }
  }

  return (
    <section className="page profile">
      <div className="panel login-panel">
        <h1>Profile</h1>
        <p className="muted">You are signed in. This page is protected.</p>

        <dl className="details-grid profile-grid">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>UID</dt>
            <dd className="uid">{user.uid}</dd>
          </div>
          {user.displayName && (
            <div>
              <dt>Name</dt>
              <dd>{user.displayName}</dd>
            </div>
          )}
          <div>
            <dt>Sign-in method</dt>
            <dd>{providerName(user)}</dd>
          </div>
          <div>
            <dt>Account created</dt>
            <dd>{formatDate(user.metadata.creationTime)}</dd>
          </div>
        </dl>

        {error && <p className="message error">{error}</p>}

        <button
          className="btn btn-danger full-width"
          onClick={handleLogout}
          disabled={pending}
        >
          {pending ? "Logging out..." : "Log out"}
        </button>
      </div>
    </section>
  );
}

export default Profile;
