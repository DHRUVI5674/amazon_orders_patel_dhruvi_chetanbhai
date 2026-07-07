// src/pages/Users.jsx
import React, { useState, useMemo } from "react";
import { useGetAllUsersQuery } from "../features/dashboard/dashboardApi";

const arr = (d) => (Array.isArray(d) ? d : d?.data && Array.isArray(d.data) ? d.data : d?.users && Array.isArray(d.users) ? d.users : []);
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

function LoadRow() {
  return <div className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />;
}

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 15;

  const { data, isLoading, error } = useGetAllUsersQuery({ page, limit, search: search || undefined });
  const users = useMemo(() => arr(data), [data]);
  const total = data?.total || data?.totalUsers || data?.count || users.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="page-body fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>👥 Users</h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 13.5 }}>
          Manage customers and admin users
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, display:"flex", gap:12, alignItems:"center" }}>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            flex: 1, maxWidth: 380, padding:"9px 16px", borderRadius:10,
            border:"1px solid #e5e7eb", fontSize:13.5, outline:"none",
            boxShadow:"0 1px 4px rgba(0,0,0,0.06)", transition:"border-color 0.2s",
          }}
          onFocus={e=>e.target.style.borderColor="#147EB3"}
          onBlur={e=>e.target.style.borderColor="#e5e7eb"}
        />
        {search && (
          <button onClick={()=>setSearch("")} style={{
            padding:"9px 16px", borderRadius:10, border:"1px solid #e5e7eb",
            background:"#fff", cursor:"pointer", fontSize:13, color:"#6b7280",
          }}>Clear</button>
        )}
        <span style={{ marginLeft:"auto", fontSize:13, color:"#9ca3af" }}>
          {total} user{total !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Table */}
      <div className="dash-card" style={{ padding: 20 }}>
        {error ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:"#ef4444" }}>
            <div style={{ fontSize:36 }}>⚠️</div>
            <div style={{ marginTop:8, fontSize:14 }}>Failed to load users. Check backend /admin/users endpoint.</div>
          </div>
        ) : isLoading ? (
          [1,2,3,4,5,6].map(i=><LoadRow key={i}/>)
        ) : users.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#9ca3af" }}>
            <div style={{ fontSize:40 }}>👤</div>
            <div style={{ marginTop:8, fontSize:14 }}>No users found</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table className="sf-table">
                <thead><tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Role</th>
                  <th>Phone</th><th>Status</th><th>Joined</th>
                </tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id || i}>
                      <td style={{ color:"#9ca3af", fontSize:12 }}>{(page-1)*limit + i + 1}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{
                            width:34, height:34, borderRadius:"50%", flexShrink:0,
                            background:"linear-gradient(135deg,#147EB3,#8b5cf6)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            color:"#fff", fontWeight:700, fontSize:13,
                          }}>
                            {(u.name||u.fullName||"U")[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight:600 }}>{u.name||u.fullName||"—"}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13, color:"#6b7280" }}>{u.email||"—"}</td>
                      <td>
                        <span className={`status-badge ${u.role==="admin" ? "status-processing" : "status-delivered"}`}>
                          {u.role||"user"}
                        </span>
                      </td>
                      <td style={{ fontSize:12, color:"#6b7280" }}>{u.phone||u.phoneNumber||"—"}</td>
                      <td>
                        <span className={`status-badge ${u.isBanned ? "status-cancelled" : "status-delivered"}`}>
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td style={{ fontSize:11, color:"#9ca3af" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:20 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{
                padding:"6px 14px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff",
                cursor:page===1?"not-allowed":"pointer", color:page===1?"#d1d5db":"#374151", fontSize:13,
              }}>← Prev</button>
              {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{
                  width:34, height:34, borderRadius:8, border:"none", cursor:"pointer", fontSize:13,
                  background:page===p?"#147EB3":"#f9fafb", color:page===p?"#fff":"#374151",
                  fontWeight:page===p?700:400,
                }}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{
                padding:"6px 14px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff",
                cursor:page===totalPages?"not-allowed":"pointer", color:page===totalPages?"#d1d5db":"#374151", fontSize:13,
              }}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
