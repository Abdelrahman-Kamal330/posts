import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hook.ts";
import { logout } from "../redux/authSlice.tsx";
import { Link } from "react-router-dom";
import { fetchPosts } from "../redux/postSlice.tsx";
import api from "../utils/api.tsx";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const posts = useAppSelector((state) => state.posts.posts);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    }

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <main className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          {getGreeting()}, {user ? user.email.split("@")[0] : "Guest"}
        </h1>
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout from your account"
        >
          Logout
        </button>
      </div>

      <section className="dashboard-stats" aria-label="Dashboard Statistics">
        <div className="stat-card" role="status">
          <h2>Total Posts</h2>
          <p className="stat-number" aria-label="Total number of posts">
            {posts.length}
          </p>
          <div className="stat-icon posts-icon" aria-hidden="true">
            📝
          </div>
        </div>

        <div className="stat-card" role="status">
          <h2>Users</h2>
          <p className="stat-number" aria-label="Total number of users">
            {userCount}
          </p>
          <div className="stat-icon users-icon" aria-hidden="true">
            👥
          </div>
        </div>

        <div className="stat-card" role="status">
          <h2>Your Account</h2>
          <p className="stat-detail" aria-label="Current user email">
            {user ? user.email : "Not logged in"}
          </p>
          <div className="stat-icon account-icon" aria-hidden="true">
            👤
          </div>
        </div>
      </section>

      <nav className="dashboard-actions" aria-label="Quick actions">
        <Link to="/posts" className="action-card" aria-label="View all posts">
          <div className="action-icon" aria-hidden="true">
            📋
          </div>
          <div className="action-text">
            <h2>View Posts</h2>
            <p>Browse and manage all blog posts</p>
          </div>
        </Link>

        <Link
          to="/new-post"
          className="action-card"
          aria-label="Create a new post"
        >
          <div className="action-icon" aria-hidden="true">
            ✏️
          </div>
          <div className="action-text">
            <h2>Create New Post</h2>
            <p>Write and publish a new blog post</p>
          </div>
        </Link>
      </nav>
    </main>
  );
};

export default Dashboard;
