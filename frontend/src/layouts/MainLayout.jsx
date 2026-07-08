// src/layouts/MainLayout.jsx
import React, { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopNavbar from "./TopNavbar";
import { fetchUserProfile } from "../features/auth/authSlice";

const MainLayout = React.memo(function MainLayout() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [token, user, dispatch]);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

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
