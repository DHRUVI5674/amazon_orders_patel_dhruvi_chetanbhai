// src/layouts/TopNavbar.jsx
import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/users": "Users",
  "/analytics": "Analytics",
};

export default React.memo(function TopNavbar() {
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = PAGE_TITLES[location.pathname] || "ShopFusion";

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
    setProfileOpen(false);
  }, [navigate]);

  return (
    <header style={{
      height: 60,
      background: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      {/* Page title */}
      <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap" }}>
        {currentPage}
      </span>

      {/* Search box */}
      <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#9ca3af" }}>
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search orders, customers, products..."
          style={{
            width: "100%", padding: "8px 12px 8px 36px",
            border: "1px solid #e5e7eb", borderRadius: 10,
            fontSize: 13, outline: "none", background: "#F8FAFC",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={e => { e.target.style.borderColor="#147EB3"; e.target.style.boxShadow="0 0 0 3px rgba(20,126,179,0.1)"; }}
          onBlur={e => { e.target.style.borderColor="#e5e7eb"; e.target.style.boxShadow="none"; }}
        />
      </div>

      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
        {/* Notification bell */}
        <button style={{
          background:"none", border:"none", cursor:"pointer", fontSize:20,
          position:"relative", padding:"6px", borderRadius:8,
          transition:"background 0.15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background="#F0F9FF"}
          onMouseLeave={e=>e.currentTarget.style.background="none"}
        >
          🔔
          <span style={{
            position:"absolute", top:2, right:2, width:16, height:16,
            background:"#ef4444", borderRadius:"50%", fontSize:10, color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700,
          }}>4</span>
        </button>

        {/* Profile menu */}
        <div style={{ position:"relative" }}>
          <button
            onClick={() => setProfileOpen(p=>!p)}
            style={{
              display:"flex", alignItems:"center", gap:8,
              background:"none", border:"1px solid #e5e7eb", borderRadius:10,
              padding:"6px 12px 6px 8px", cursor:"pointer",
              transition:"border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#F0F9FF"; e.currentTarget.style.borderColor="#147EB3"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="#e5e7eb"; }}
          >
            <div style={{
              width:30, height:30, borderRadius:"50%",
              background:"linear-gradient(135deg,#147EB3,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:700, fontSize:13, flexShrink:0,
            }}>A</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#1a1a2e" }}>Admin</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>Administrator</div>
            </div>
            <span style={{ fontSize:12, color:"#9ca3af" }}>▾</span>
          </button>

          {profileOpen && (
            <div style={{
              position:"absolute", top:"calc(100% + 8px)", right:0, width:180,
              background:"#fff", borderRadius:12, border:"1px solid #e5e7eb",
              boxShadow:"0 8px 32px rgba(0,0,0,0.12)", zIndex:100, overflow:"hidden",
            }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0" }}>
                <div style={{ fontSize:13.5, fontWeight:600, color:"#1a1a2e" }}>Admin User</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>admin@shopfusion.com</div>
              </div>
              <button onClick={handleLogout} style={{
                width:"100%", padding:"12px 16px", background:"none", border:"none",
                cursor:"pointer", textAlign:"left", fontSize:13.5, color:"#ef4444",
                fontWeight:600, display:"flex", alignItems:"center", gap:8,
                transition:"background 0.15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background="#FEF2F2"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
