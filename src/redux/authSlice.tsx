import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../types";

// Load authentication state from localStorage if available
const loadAuthState = (): AuthState => {
  try {
    const authState = localStorage.getItem("authState");
    if (authState === null) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }
    return JSON.parse(authState) as AuthState;
  } catch (err) {
    console.error("Failed to load authentication state:", err);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;

      // Save to localStorage
      try {
        localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: action.payload,
          })
        );
      } catch (err) {
        console.error("Failed to save authentication state:", err);
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;

      // Remove from localStorage
      try {
        localStorage.removeItem("authState");
      } catch (err) {
        console.error("Failed to remove authentication state:", err);
      }
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
