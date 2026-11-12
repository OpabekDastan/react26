import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  subscribeToAuth,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logOut,
  getAuthErrorMessage,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true until Firebase tells us if there is a saved session
  const [loading, setLoading] = useState(true);
  // true while login / signup / logout request is running
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // cleanup: stop listening
  }, []);

  // runs one auth action, saves the error text, returns true on success
  const run = useCallback(async (action) => {
    setPending(true);
    setError("");

    try {
      await action();
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  const signup = useCallback(
    (email, password) => run(() => signUpWithEmail(email, password)),
    [run],
  );

  const login = useCallback(
    (email, password) => run(() => signInWithEmail(email, password)),
    [run],
  );

  const loginWithGoogle = useCallback(() => run(signInWithGoogle), [run]);

  const logout = useCallback(() => run(logOut), [run]);

  const clearError = useCallback(() => setError(""), []);

  const value = {
    user,
    loading,
    pending,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}
