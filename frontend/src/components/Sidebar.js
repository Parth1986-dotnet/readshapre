import React from 'react';
import { NavLink } from 'react-router-dom';
import { BsPlusCircle, BsBook, BsHouse } from 'react-icons/bs';

function Sidebar() {
  return (
    <div className="bg-light border-end" style={{ width: '200px', minHeight: '100vh' }}>
      <div className="list-group list-group-flush">
        {/* Home Link */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
          }
        >
          <BsHouse className="me-2" /> Home
        </NavLink>

        {/* Add Book Link */}
        <NavLink
          to="/add"
          className={({ isActive }) =>
            "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
          }
        >
          <BsPlusCircle className="me-2" /> Add Book
        </NavLink>

        {/* Book List Link */}
        <NavLink
          to="/list"
          className={({ isActive }) =>
            "list-group-item list-group-item-action" + (isActive ? " active fw-bold" : "")
          }
        >
          <BsBook className="me-2" /> Book List
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
