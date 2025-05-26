import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hook.ts";
import { logout } from "../redux/authSlice.tsx";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header role="banner">
      <nav aria-label="Main navigation">
        <Link to="/" aria-label="Home page">
          Home
        </Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" aria-label="Dashboard page">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Logout from your account"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" aria-label="Login page">
              Login
            </Link>
            <Link to="/signup" aria-label="Sign up page">
              Signup
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
