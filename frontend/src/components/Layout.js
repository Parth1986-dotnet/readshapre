import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';


function Layout() {
  return (
    <>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <main className="p-4" style={{ flex: 1 }}>
          <Outlet /> {/* This renders the matched child route component */}
        </main>
      </div>
    </>
  );
}

export default Layout;
