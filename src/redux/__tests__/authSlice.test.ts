import authReducer, { login, logout } from "../authSlice.tsx";
import type { User, AuthState } from "../../types/index";

// Mock the localStorage methods
const mockSetItem = jest.fn();
const mockGetItem = jest.fn();
const mockRemoveItem = jest.fn();

// Save original localStorage
const originalLocalStorage = window.localStorage;

// Setup mocks before tests
beforeEach(() => {
  // Create a mock implementation of localStorage
  const localStorageMock = {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: mockRemoveItem,
  };

  // Replace the global localStorage with our mock
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
});

// Restore original after tests
afterAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: originalLocalStorage,
    writable: true,
  });
});

describe("Auth Slice", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    createdAt: "2023-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock loadAuthState to return a default state
    mockGetItem.mockReturnValue(
      JSON.stringify({
        isAuthenticated: false,
        user: null,
      })
    );
  });

  it("should handle initial state", () => {
    const initialState = authReducer(undefined, { type: "unknown" });
    expect(initialState).toEqual({
      isAuthenticated: false,
      user: null,
    });
  });

  describe("login action", () => {
    it("should handle login", () => {
      const initialState: AuthState = {
        isAuthenticated: false,
        user: null,
      };

      const action = login(mockUser);
      const state = authReducer(initialState, action);

      expect(state).toEqual({
        isAuthenticated: true,
        user: mockUser,
      });

      // Verify localStorage was updated
      expect(mockSetItem).toHaveBeenCalledWith(
        "authState",
        JSON.stringify({
          isAuthenticated: true,
          user: mockUser,
        })
      );
    });

    it("should handle localStorage errors during login", () => {
      // Mock localStorage.setItem to throw an error
      mockSetItem.mockImplementation(() => {
        throw new Error("Mock error");
      });

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const initialState: AuthState = {
        isAuthenticated: false,
        user: null,
      };

      const action = login(mockUser);
      const state = authReducer(initialState, action);

      // State should still be updated even if localStorage fails
      expect(state).toEqual({
        isAuthenticated: true,
        user: mockUser,
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("logout action", () => {
    it("should handle logout", () => {
      const initialState: AuthState = {
        isAuthenticated: true,
        user: mockUser,
      };

      const action = logout();
      const state = authReducer(initialState, action);

      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
      });

      // Verify localStorage was updated
      expect(mockRemoveItem).toHaveBeenCalledWith("authState");
    });

    it("should handle localStorage errors during logout", () => {
      // Mock localStorage.removeItem to throw an error
      mockRemoveItem.mockImplementation(() => {
        throw new Error("Mock error");
      });

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const initialState: AuthState = {
        isAuthenticated: true,
        user: mockUser,
      };

      const action = logout();
      const state = authReducer(initialState, action);

      // State should still be updated even if localStorage fails
      expect(state).toEqual({
        isAuthenticated: false,
        user: null,
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
