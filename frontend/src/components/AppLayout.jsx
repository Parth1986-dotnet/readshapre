// src/components/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function isAuthed() {
  const token = localStorage.getItem("accessToken");
  return token && token !== "null" && token !== "undefined";
}

export default function AppLayout() {
  const authed = isAuthed();

  return (
    <>
      <Navbar />
      <div className="d-flex">
        {authed && <Sidebar />} {/* ✅ Show sidebar for BOTH user and admin */}
        <main className="p-4" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
