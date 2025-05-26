/**
 * Utility functions for authentication
 */
import type { User } from "../types";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    const authState = localStorage.getItem("authState");
    if (!authState) return false;

    const { isAuthenticated } = JSON.parse(authState) as AuthState;
    return isAuthenticated === true;
  } catch (err) {
    console.error("Error checking authentication status:", err);
    return false;
  }
};

/**
 * Get the current user from localStorage
 * @returns {User|null} The user object or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  try {
    const authState = localStorage.getItem("authState");
    if (!authState) return null;

    const { user } = JSON.parse(authState) as AuthState;
    return user;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
};

/**
 * Clear authentication data (for logout)
 */
export const clearAuth = (): void => {
  try {
    localStorage.removeItem("authState");
  } catch (err) {
    console.error("Error clearing authentication data:", err);
  }
};
