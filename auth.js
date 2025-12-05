// Authentication Module
import { auth } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

/**
 * Login user with email and password
 */
export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Admin logged in:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
    console.log("Admin logged out");
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function checkAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}
