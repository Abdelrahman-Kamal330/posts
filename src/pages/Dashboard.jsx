import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { Link } from "react-router-dom";
import { fetchPosts } from "../redux/postSlice";
import api from "../utils/api";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const posts = useSelector((state) => state.posts.posts);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Fetch posts if not already loaded
    if (posts.length === 0) {
      dispatch(fetchPosts());
    }

    // Get user count
    const getUserCount = async () => {
      try {
        const response = await api.get("/users");
        setUserCount(response.data.length);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    getUserCount();
  }, [dispatch, posts.length]);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Get the date for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          {getGreeting()}, {user ? user.email.split("@")[0] : "Guest"}
        </h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Posts</h3>
          <p className="stat-number">{posts.length}</p>
          <div className="stat-icon posts-icon">📝</div>
        </div>

        <div className="stat-card">
          <h3>Users</h3>
          <p className="stat-number">{userCount}</p>
          <div className="stat-icon users-icon">👥</div>
        </div>

        <div className="stat-card">
          <h3>Your Account</h3>
          <p className="stat-detail">{user ? user.email : "Not logged in"}</p>
          <div className="stat-icon account-icon">👤</div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/posts" className="action-card">
          <div className="action-icon">📋</div>
          <div className="action-text">
            <h3>View Posts</h3>
            <p>Browse and manage all blog posts</p>
          </div>
        </Link>

        <Link to="/new-post" className="action-card">
          <div className="action-icon">✏️</div>
          <div className="action-text">
            <h3>Create New Post</h3>
            <p>Write and publish a new blog post</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
