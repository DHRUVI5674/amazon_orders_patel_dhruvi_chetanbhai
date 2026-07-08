// src/components/Sidebar.jsx
import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", emoji: "🏠" },
  { name: "Products",  path: "/products",  emoji: "🛍️" },
  { name: "Statistics", path: "/statistics", emoji: "📈" },
  { name: "Orders",    path: "/orders",    emoji: "📦" },
  { name: "Users",     path: "/users",     emoji: "👥" },
  { name: "Analytics", path: "/analytics", emoji: "📊" },
];

export default React.memo(function Sidebar() {
  const [open, setOpen] = useState(true);
  const toggle = useCallback(() => setOpen((p) => !p), []);
  const navigate = useNavigate();

  return (
    <div style={{
      width: open ? 220 : 64,
      flexShrink: 0,
      background: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s ease",
      overflow: "hidden",
      minHeight: "100vh",
      boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
    }}>
      {/* Brand header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center",
        padding: "18px 14px", borderBottom: "1px solid #f0f0f0", minHeight: 64,
      }}>
        {open && (
          <span style={{ fontSize: 17, fontWeight: 800, color: "#147EB3", whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>
            ShopFusion
          </span>
        )}
        <button onClick={toggle} style={{
          background: "none", border: "1px solid #e5e7eb", borderRadius: 8,
          padding: "6px 8px", cursor: "pointer", fontSize: 16, lineHeight: 1,
          color: "#374151", flexShrink: 0,
        }}>
          {open ? "◀" : "▶"}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={!open ? item.name : ""}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: open ? "10px 12px" : "10px 0",
              justifyContent: open ? "flex-start" : "center",
              borderRadius: 10,
              marginBottom: 4,
              textDecoration: "none",
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              color: isActive ? "#147EB3" : "#374151",
              background: isActive ? "#EBF5FF" : "transparent",
              transition: "all 0.15s",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes("EBF5FF")) {
                e.currentTarget.style.background = "#F8FAFC";
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes("EBF5FF")) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.emoji}</span>
            {open && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid #f0f0f0" }}>
        <button
          onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: open ? "10px 12px" : "10px 0",
            justifyContent: open ? "flex-start" : "center",
            width: "100%", borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer",
            color: "#ef4444", fontWeight: 600, fontSize: 14,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background="#FEF2F2"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {open && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
});
