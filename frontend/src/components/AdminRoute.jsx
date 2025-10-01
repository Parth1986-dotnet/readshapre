import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../axiosConfig";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/users/profile", { withCredentials: true });
        setIsAuthenticated(true);
        setIsAdmin(res.data.role === "ROLE_ADMIN");
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>; // Or a spinner

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/unauthorized" />;

  return children;
};

export default AdminRoute;
