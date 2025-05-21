import React, { useState } from "react";
import { useAppDispatch } from "../redux/hook.ts";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../redux/authSlice.tsx";
import api from "../utils/api.tsx";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

    return true;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.get(`/users?email=${email}`);

      if (res.data.length === 0) {
        setError("No account found with this email");
        setIsLoading(false);
        return;
      }

      const user = res.data[0];
      if (user.password === password) {
        const { ...secureUserData } = user;
        dispatch(login(secureUserData));
        navigate("/dashboard");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      {error && (
        <div className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} aria-label="Login form">
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={error && error.includes("email") ? "true" : "false"}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-required="true"
            aria-invalid={
              error && error.includes("password") ? "true" : "false"
            }
          />
        </div>
        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <Link to="/signup" aria-label="Go to signup page">
          Signup
        </Link>
      </p>
    </div>
  );
};

export default Login;
