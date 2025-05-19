import { isAuthenticated, getCurrentUser, clearAuth } from '../auth';

describe('Auth Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('returns false when no auth state exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when auth state exists with isAuthenticated=true', () => {
      localStorage.setItem(
        'authState',
        JSON.stringify({ isAuthenticated: true, user: { id: 1, email: 'test@example.com' } })
      );
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when auth state exists with isAuthenticated=false', () => {
      localStorage.setItem(
        'authState',
        JSON.stringify({ isAuthenticated: false, user: null })
      );
      expect(isAuthenticated()).toBe(false);
    });

    it('handles JSON parse errors gracefully', () => {
      localStorage.setItem('authState', 'invalid-json');
      
      // Spy on console.error to verify it's called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(isAuthenticated()).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no auth state exists', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('returns user object when auth state exists', () => {
      const user = { id: 1, email: 'test@example.com', createdAt: '2023-01-01' };
      localStorage.setItem(
        'authState',
        JSON.stringify({ isAuthenticated: true, user })
      );
      expect(getCurrentUser()).toEqual(user);
    });

    it('returns null when auth state exists but user is null', () => {
      localStorage.setItem(
        'authState',
        JSON.stringify({ isAuthenticated: false, user: null })
      );
      expect(getCurrentUser()).toBeNull();
    });

    it('handles JSON parse errors gracefully', () => {
      localStorage.setItem('authState', 'invalid-json');
      
      // Spy on console.error to verify it's called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(getCurrentUser()).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearAuth', () => {
    it('removes auth state from localStorage', () => {
      // Set up initial state
      localStorage.setItem(
        'authState',
        JSON.stringify({ isAuthenticated: true, user: { id: 1 } })
      );
      
      // Verify it exists
      expect(localStorage.getItem('authState')).not.toBeNull();
      
      // Clear auth
      clearAuth();
      
      // Verify it's removed
      expect(localStorage.getItem('authState')).toBeNull();
    });

    it('handles errors gracefully', () => {
      // Mock localStorage.removeItem to throw an error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Mock error');
      });
      
      // Spy on console.error to verify it's called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Should not throw
      expect(() => clearAuth()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore mocks
      localStorage.removeItem = originalRemoveItem;
      consoleSpy.mockRestore();
    });
  });
});
