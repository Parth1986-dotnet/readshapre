import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../axiosConfig';
import {
  BsPlusCircle,
  BsBook,
  BsHouse,
  BsGrid,
  BsPeople,
  BsCartCheck,
  BsCart,
  BsClipboardData,
} from 'react-icons/bs';

function Sidebar() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile to get role (cookie is automatically sent)
    axios.get('/api/users/profile', { withCredentials: true })
      .then(res => {
        setRole(res.data.role); // e.g., "ROLE_ADMIN" or "ROLE_USER"
      })
      .catch(err => {
        console.error('Failed to fetch profile', err);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null; // or show a spinner

  // Hide sidebar if no role (user not logged in)
  if (!role) return null;

  return (
    <div className="bg-light border-end" style={{ width: '200px', minHeight: '100vh' }}>
      <div className="list-group list-group-flush">

        {/* Admin-only links */}
        {role === 'ROLE_ADMIN' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsGrid className="me-2" /> Dashboard
            </NavLink>

            <NavLink to="/admin/users" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsPeople className="me-2" /> Manage Users
            </NavLink>

            <NavLink to="/add" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsPlusCircle className="me-2" /> Add Book
            </NavLink>

            <NavLink to="/list" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsBook className="me-2" /> Book List
            </NavLink>

            <NavLink to="/orders" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsClipboardData className="me-2" /> All Orders
            </NavLink>
          </>
        )}

        {/* User-only links */}
        {role === 'ROLE_USER' && (
          <>
            <NavLink to="/cart" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsCart className="me-2" /> My Cart
            </NavLink>

            <NavLink to="/checkout" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsCartCheck className="me-2" /> Checkout
            </NavLink>

            <NavLink to="/my-orders" className={({ isActive }) =>
              "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
            }>
              <BsClipboardData className="me-2" /> My Orders
            </NavLink>
          </>
        )}

        {/* Home link */}
        <NavLink to="/" className={({ isActive }) =>
          "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
        }>
          <BsHouse className="me-2" /> Home
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
