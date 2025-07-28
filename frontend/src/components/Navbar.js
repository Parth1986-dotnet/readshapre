import React from 'react';
import { BsBell, BsBoxArrowRight } from 'react-icons/bs';

function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand">📚 Book Store</span>
      <div className="ms-auto text-light d-flex align-items-center">
        <button className="btn btn-outline-light btn-sm me-2">
          <BsBell />
        </button>
        <button className="btn btn-outline-danger btn-sm">
          <BsBoxArrowRight className="me-1" /> Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
