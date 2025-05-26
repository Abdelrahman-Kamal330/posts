import React, { useState } from "react";
import { useAppDispatch } from "../redux/hook.ts";
import { login } from "../redux/authSlice.tsx";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api.tsx";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const checkUser = await api.get(
        `/users?email=${encodeURIComponent(email)}`
      );

      if (checkUser.data.length > 0) {
        setError("User with this email already exists");
        return;
      }

      const newUser = {
        email,
        password,
        createdAt: new Date().toISOString(),
      };

      const response = await api.post("/users", newUser);

      // Remove password from user object before storing in state
      const { ...secureUserData } = response.data;

      dispatch(login(secureUserData));
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="form-container">
      <h1>Signup</h1>
      {error && (
        <div
          className="error-message"
          data-testid="error-message"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} aria-label="Signup form">
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            aria-required="true"
            aria-invalid={error && error.includes("email") ? "true" : "false"}
            aria-describedby={
              error && error.includes("email") ? "email-error" : undefined
            }
          />
          {error && error.includes("email") && (
            <div id="email-error" className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            aria-required="true"
            aria-invalid={
              error && error.includes("password") ? "true" : "false"
            }
            aria-describedby={
              error && error.includes("password") ? "password-error" : undefined
            }
          />
          {error && error.includes("password") && (
            <div id="password-error" className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>
        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Creating Account..." : "Signup"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <Link to="/" aria-label="Go to login page">
          Login
        </Link>
      </p>
    </main>
  );
};

export default Signup;
