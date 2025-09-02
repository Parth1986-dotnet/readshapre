// src/routes/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  if (!token) return <Navigate to="/login" />;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    const exp = payload.exp * 1000;
    if (Date.now() > exp) {
      localStorage.removeItem('accessToken');
      return <Navigate to="/login" />;
    }

    return children;
  } catch (e) {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
