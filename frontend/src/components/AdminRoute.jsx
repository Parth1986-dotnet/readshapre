import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  //const token = localStorage.getItem('token');
  const token = localStorage.getItem('accessToken');

  if (!token) return <Navigate to="/login" />;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    // 👇 Try logging to confirm
    console.log("Decoded payload:", payload);

    const role = payload.role || (payload.roles && payload.roles[0]);

    if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
      return children;
    }

    return <Navigate to="/unauthorized" />;
  } catch (error) {
    console.error("Token parsing error:", error);
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
