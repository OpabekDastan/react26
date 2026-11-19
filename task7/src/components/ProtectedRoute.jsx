import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

// wrapper route: shows the child routes only to logged in users
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader text="Checking session..." />;
  }

  if (!user) {
    // remember where the user wanted to go, Login sends them back after sign in
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
