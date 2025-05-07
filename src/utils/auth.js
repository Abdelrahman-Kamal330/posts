/**
 * Utility functions for authentication
 */

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const authState = localStorage.getItem('authState');
    if (!authState) return false;
    
    const { isAuthenticated } = JSON.parse(authState);
    return isAuthenticated === true;
  } catch (err) {
    console.error('Error checking authentication status:', err);
    return false;
  }
};

/**
 * Get the current user from localStorage
 * @returns {Object|null} The user object or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const authState = localStorage.getItem('authState');
    if (!authState) return null;
    
    const { user } = JSON.parse(authState);
    return user;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};

/**
 * Clear authentication data (for logout)
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem('authState');
  } catch (err) {
    console.error('Error clearing authentication data:', err);
  }
};
