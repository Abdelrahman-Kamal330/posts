import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import Header from "./components/Header";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import NewPost from "./pages/NewPost";
import { login } from "./redux/authSlice";
import { isAuthenticated as checkAuth, getCurrentUser } from "./utils/auth";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Check authentication status on app load
  useEffect(() => {
    // If Redux state says not authenticated but localStorage says authenticated,
    // restore the authentication state
    if (!isAuthenticated && checkAuth()) {
      const user = getCurrentUser();
      if (user) {
        dispatch(login(user));
      }
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/posts"
          element={isAuthenticated ? <Posts /> : <Navigate to="/" />}
        />
        <Route
          path="/new-post"
          element={isAuthenticated ? <NewPost /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
