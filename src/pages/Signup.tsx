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
    <div className="form-container">
      <h2>Signup</h2>
      {error && (
        <div className="error-message" data-testid="error-message">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Signup"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
