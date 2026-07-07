// src/pages/Orders.jsx
import React, { useState, useMemo } from "react";
import {
  useGetPagedOrdersQuery,
  useFilterByStatusQuery,
  useGetCancelledOrdersQuery,
  useGetRefundedOrdersQuery,
} from "../features/dashboard/dashboardApi";

const fmtCur = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const arr = (d) => (Array.isArray(d) ? d : d?.data && Array.isArray(d.data) ? d.data : d?.orders && Array.isArray(d.orders) ? d.orders : []);

const STATUS_CLS = {
  Delivered:"status-delivered", Pending:"status-pending", Cancelled:"status-cancelled",
  Shipped:"status-shipped", Processing:"status-processing", Packed:"status-packed", Refunded:"status-refunded",
};

const TABS = ["All", "Cancelled", "Refunded"];

function LoadRow() {
  return <div className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />;
}

export default function Orders() {
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const limit = 15;

  const { data: allData, isLoading: allL } = useGetPagedOrdersQuery({ page, limit, status: status || undefined });
  const { data: cancelledData, isLoading: canL } = useGetCancelledOrdersQuery({ page, limit });
  const { data: refundedData, isLoading: refL } = useGetRefundedOrdersQuery({ page, limit });

  const rawData = tab === "Cancelled" ? cancelledData : tab === "Refunded" ? refundedData : allData;
  const isLoading = tab === "Cancelled" ? canL : tab === "Refunded" ? refL : allL;

  const orders = useMemo(() => arr(rawData), [rawData]);
  const total = rawData?.total || rawData?.totalOrders || rawData?.count || orders.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="page-body fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>📦 Orders</h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 13.5 }}>Manage and track all customer orders</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} style={{
            padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13.5, fontWeight:600,
            background: tab===t ? "#147EB3" : "#fff",
            color: tab===t ? "#fff" : "#374151",
            boxShadow: tab===t ? "0 4px 12px rgba(20,126,179,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
            transition:"all 0.15s",
          }}>{t}</button>
        ))}

        {tab === "All" && (
          <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} style={{
            marginLeft:"auto", padding:"8px 14px", borderRadius:8, border:"1px solid #e5e7eb",
            fontSize:13, color:"#374151", background:"#fff", cursor:"pointer",
          }}>
            <option value="">All Status</option>
            {["Pending","Processing","Packed","Shipped","Delivered","Cancelled","Refunded"].map(s=>(
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="dash-card" style={{ padding: 20 }}>
        {isLoading ? (
          [1,2,3,4,5,6].map(i=><LoadRow key={i}/>)
        ) : orders.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#9ca3af" }}>
            <div style={{ fontSize:40 }}>📭</div>
            <div style={{ marginTop:8, fontSize:14 }}>No orders found</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:12, fontSize:13, color:"#6b7280" }}>
              Showing {orders.length} of {total} orders
            </div>
            <div style={{ overflowX:"auto" }}>
              <table className="sf-table">
                <thead><tr>
                  <th>Order ID</th><th>Customer</th><th>Product</th>
                  <th>Amount</th><th>Payment</th><th>Status</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o._id || i}>
                      <td style={{ fontFamily:"monospace", fontSize:11, color:"#9ca3af" }}>
                        #{String(o._id||o.orderId||i).slice(-8).toUpperCase()}
                      </td>
                      <td style={{ fontWeight:600 }}>{o.customerName||o.customer?.name||o.userId?.name||"—"}</td>
                      <td style={{ fontSize:12 }}>{o.productName||o.product?.name||o.items?.[0]?.name||"—"}</td>
                      <td style={{ fontWeight:700, color:"#147EB3" }}>{fmtCur(o.totalAmount||o.amount||0)}</td>
                      <td style={{ fontSize:12 }}>{o.paymentMethod||"—"}</td>
                      <td>
                        <span className={`status-badge ${STATUS_CLS[o.status]||"status-pending"}`}>
                          {o.status||"Pending"}
                        </span>
                      </td>
                      <td style={{ fontSize:11, color:"#9ca3af" }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}
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
                cursor: page===1 ? "not-allowed" : "pointer", color: page===1 ? "#d1d5db" : "#374151", fontSize:13,
              }}>← Prev</button>
              {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{
                  width:34, height:34, borderRadius:8, border:"none", cursor:"pointer", fontSize:13,
                  background: page===p ? "#147EB3" : "#f9fafb", color: page===p ? "#fff" : "#374151",
                  fontWeight: page===p ? 700 : 400,
                }}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{
                padding:"6px 14px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff",
                cursor: page===totalPages ? "not-allowed" : "pointer", color: page===totalPages ? "#d1d5db" : "#374151", fontSize:13,
              }}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
