import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

// ALL Firebase auth calls of the app live here, components use useAuth()

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback); // returns the unsubscribe function
}

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logOut() {
  return signOut(auth);
}

// Firebase error code -> text that we can show to the user
const ERROR_MESSAGES = {
  "auth/invalid-email": "Email address is not valid",
  "auth/missing-password": "Please enter the password",
  "auth/invalid-credential": "Wrong email or password",
  "auth/wrong-password": "Wrong email or password",
  "auth/user-not-found": "There is no account with this email",
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/too-many-requests": "Too many attempts, please try again later",
  "auth/network-request-failed": "Network error, check your connection",
  "auth/popup-closed-by-user": "Google sign-in window was closed",
  "auth/cancelled-popup-request": "Google sign-in was cancelled",
  "auth/popup-blocked": "The browser blocked the Google sign-in window",
  "auth/unauthorized-domain": "This domain is not allowed in Firebase settings",
  "auth/invalid-api-key": "Firebase is not configured (check .env.local)",
};

export function getAuthErrorMessage(error) {
  return ERROR_MESSAGES[error?.code] || error?.message || "Authentication error";
}
