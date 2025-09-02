// src/components/ShopLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function ShopLayout() {
  return (
    <>
      <Navbar />
      <main className="p-4" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </>
  );
}
