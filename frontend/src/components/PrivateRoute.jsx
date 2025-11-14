// src/routes/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosConfig from "../axiosConfig";

const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosConfig.get("/api/users/profile", { withCredentials: true });
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" />;
  return children;
};

export default PrivateRoute;
