import React from 'react';
import { NavLink } from 'react-router-dom';
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
  const token = localStorage.getItem('accessToken');

  // If not logged in, hide the sidebar entirely
  if (!token) return null;

  let role = null;
  try {
    const base64 = token.split('.')[1];
    const decoded = JSON.parse(atob(base64));
    // Support both "role" and "roles" (array) claims
    role = decoded.role || (Array.isArray(decoded.roles) ? decoded.roles[0] : null);
  } catch (err) {
    console.error('Failed to decode token', err);
  }

  return (
    <div className="bg-light border-end" style={{ width: '200px', minHeight: '100vh' }}>
      <div className="list-group list-group-flush">

        {/* Admin-only links (removed Order Management as requested) */}
        {role === 'ROLE_ADMIN' && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsGrid className="me-2" /> Dashboard
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsPeople className="me-2" /> Manage Users
            </NavLink>

            <NavLink
              to="/add"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsPlusCircle className="me-2" /> Add Book
            </NavLink>

            <NavLink
              to="/list"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsBook className="me-2" /> Book List
            </NavLink>

            {/* Removed this:
            <NavLink to="/admin/orders" ...>
              <BsClipboardData className="me-2" /> Order Management
            </NavLink>
            */}

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsClipboardData className="me-2" /> All Orders
            </NavLink>
          </>
        )}

        {/* User-only links */}
        {role === 'ROLE_USER' && (
          <>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsCart className="me-2" /> My Cart
            </NavLink>

            <NavLink
              to="/checkout"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsCartCheck className="me-2" /> Checkout
            </NavLink>

            <NavLink
              to="/my-orders"
              className={({ isActive }) =>
                "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
              }
            >
              <BsClipboardData className="me-2" /> My Orders
            </NavLink>
          </>
        )}

        {/* Home link (visible after login, per your request) */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
          }
        >
          <BsHouse className="me-2" /> Home
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;
