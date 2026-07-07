// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "./TopNavbar";

const MainLayout = React.memo(function MainLayout() {
  return (
    <div style={{ display:"flex", minHeight:"100vh", width:"100%" }}>
      <Sidebar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TopNavbar />
        <main className="page-content" style={{ flex:1, overflowY:"auto", background:"#F5F7FB" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
});

export default MainLayout;
