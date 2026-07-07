// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import {
  useGetTotalOrdersQuery,
  useGetTotalRevenueQuery,
  useGetCustomerCountQuery,
  useGetProductCountQuery,
  useGetRefundCountQuery,
  useGetCancellationCountQuery,
  useGetMonthlyRevenueQuery,
  useGetPaymentDistributionQuery,
  useGetRecentOrdersQuery,
  useGetTopSellingProductsQuery,
  useGetSystemHealthQuery,
  useGetTopCustomersQuery,
  useGetTopCategoriesQuery,
  useGetOrderCountQuery,
} from "../features/dashboard/dashboardApi";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────
const fmtCur = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const arr = (d) => (Array.isArray(d) ? d : d?.data && Array.isArray(d.data) ? d.data : []);
const val = (d, ...keys) => { for (const k of keys) if (d?.[k] !== undefined) return d[k]; return 0; };

const PIE_COLORS = ["#147EB3","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

const STATUS_CLS = {
  Delivered: "status-delivered", Pending: "status-pending",
  Cancelled: "status-cancelled", Shipped: "status-shipped",
  Processing: "status-processing", Packed: "status-packed",
  Refunded: "status-refunded",
};

const KPI_GRADIENTS = [
  "linear-gradient(135deg,#147EB3,#3b82f6)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#06b6d4,#0891b2)",
  "linear-gradient(135deg,#ec4899,#db2777)",
  "linear-gradient(135deg,#84cc16,#65a30d)",
];

// ─── Sub-components ─────────────────────────────────────────────
function KpiCard({ title, value, icon, idx, loading }) {
  return (
    <div className="kpi-card fade-in" style={{ background: KPI_GRADIENTS[idx % 8], animationDelay: `${idx * 0.07}s` }}>
      {loading ? (
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
      ) : (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize: 28, opacity: 0.9 }}>{icon}</span>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85, fontWeight: 500 }}>{title}</div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>{children}</h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#6b7280" }}>{sub}</p>}
    </div>
  );
}

function Empty({ msg = "No data available" }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"#9ca3af", fontSize: 14 }}>
      <div style={{ fontSize: 36 }}>📭</div>
      <div style={{ marginTop: 8 }}>{msg}</div>
    </div>
  );
}

function LoadRow() {
  return <div className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />;
}

// ─── Main Page ───────────────────────────────────────────────────
export default function Dashboard() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // Stats
  const { data: ordData, isLoading: ordL } = useGetTotalOrdersQuery();
  const { data: revData, isLoading: revL } = useGetTotalRevenueQuery();
  const { data: custData, isLoading: custL } = useGetCustomerCountQuery();
  const { data: prodData, isLoading: prodL } = useGetProductCountQuery();
  const { data: refData, isLoading: refL } = useGetRefundCountQuery();
  const { data: canData, isLoading: canL } = useGetCancellationCountQuery();
  const { data: ordCountData } = useGetOrderCountQuery();

  // Charts
  const { data: monthlyRevData, isLoading: mrL } = useGetMonthlyRevenueQuery();
  const { data: payData, isLoading: payL } = useGetPaymentDistributionQuery();
  const { data: catData, isLoading: catL } = useGetTopCategoriesQuery();

  // Tables
  const { data: recentData, isLoading: recentL } = useGetRecentOrdersQuery({ limit: 10 });
  const { data: prodListData, isLoading: tpL } = useGetTopSellingProductsQuery({ limit: 6 });
  const { data: topCustData, isLoading: tcL } = useGetTopCustomersQuery();
  const { data: sysData, isLoading: sysL } = useGetSystemHealthQuery();

  // Normalize data
  const revenueChart = useMemo(() => {
    const raw = arr(monthlyRevData?.monthlyRevenue ?? monthlyRevData);
    return raw.map((r) => ({
      month: r.month || r._id || r.label,
      revenue: r.revenue || r.total || r.value || 0,
    }));
  }, [monthlyRevData]);

  const paymentChart = useMemo(() => {
    const raw = arr(payData?.distribution ?? payData);
    return raw.map((r) => ({
      name: r.method || r._id || r.name || r.label,
      value: r.amount || r.count || r.total || r.value || 0,
    }));
  }, [payData]);

  const categoryChart = useMemo(() => {
    const raw = arr(catData?.categories ?? catData);
    return raw.map((r) => ({
      name: r.category || r._id || r.name,
      count: r.count || r.orders || r.value || 0,
    }));
  }, [catData]);

  const recentOrders = useMemo(() => arr(recentData?.orders ?? recentData), [recentData]);
  const topProducts = useMemo(() => arr(prodListData?.products ?? prodListData), [prodListData]);
  const topCustomers = useMemo(() => arr(topCustData?.customers ?? topCustData), [topCustData]);

  const kpis = [
    { title: "Total Revenue", value: fmtCur(val(revData, "totalRevenue", "revenue", "total")), icon: "💰", loading: revL },
    { title: "Total Orders", value: fmt(val(ordData, "totalOrders", "total", "count")), icon: "📦", loading: ordL },
    { title: "Total Customers", value: fmt(val(custData, "customerCount", "count", "total")), icon: "👥", loading: custL },
    { title: "Total Products", value: fmt(val(prodData, "productCount", "count", "total")), icon: "🛒", loading: prodL },
    { title: "Total Refunds", value: fmt(val(refData, "refundCount", "count", "total")), icon: "↩️", loading: refL },
    { title: "Cancellations", value: fmt(val(canData, "cancellationCount", "count", "total")), icon: "❌", loading: canL },
    { title: "Avg Order Value", value: fmtCur(val(ordCountData, "averageOrderValue", "avgValue", "avg")), icon: "📈", loading: false },
    { title: "Today's Orders", value: fmt(val(ordData, "dailyOrders", "today", "todayCount")), icon: "🗓️", loading: ordL },
  ];

  return (
    <div className="page-body fade-in">
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>
          🏠 Dashboard
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 13.5 }}>
          Welcome back! Here's what's happening today — <strong>{today}</strong>
        </p>
      </div>

      {/* ── KPI Row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}>
        {kpis.map((k, i) => <KpiCard key={k.title} {...k} idx={i} />)}
      </div>

      {/* ── Row: Revenue + Payment ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24 }}>

        {/* Revenue Line Chart */}
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Monthly revenue from analytics">Revenue Overview</SectionTitle>
          {mrL ? <div className="skeleton" style={{height:220}} /> :
           revenueChart.length === 0 ? <Empty msg="No revenue data" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v)=>fmtCur(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#147EB3" strokeWidth={3} dot={{r:4}} animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Distribution Donut */}
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Breakdown by payment method">Payment Distribution</SectionTitle>
          {payL ? <div className="skeleton" style={{height:220}} /> :
           paymentChart.length === 0 ? <Empty msg="No payment data" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentChart} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" animationDuration={700}>
                  {paymentChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v)=>fmtCur(v)} />
                <Legend iconSize={10} wrapperStyle={{fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row: Categories + Top Customers ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>

        {/* Top Categories Bar Chart */}
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Orders per category">Top Categories</SectionTitle>
          {catL ? <div className="skeleton" style={{height:200}} /> :
           categoryChart.length === 0 ? <Empty msg="No category data" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{fontSize:10}} />
                <YAxis dataKey="name" type="category" tick={{fontSize:10}} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#147EB3" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Customers */}
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Customers with highest spend">Top Customers</SectionTitle>
          {tcL ? [1,2,3,4].map(i=><LoadRow key={i}/>) :
           topCustomers.length === 0 ? <Empty msg="No customer data" /> : (
            <div style={{ overflowX:"auto" }}>
              <table className="sf-table">
                <thead><tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Orders</th><th>Spent</th>
                </tr></thead>
                <tbody>
                  {topCustomers.slice(0,6).map((c,i)=>(
                    <tr key={c._id||i}>
                      <td style={{color:"#9ca3af"}}>{i+1}</td>
                      <td style={{fontWeight:600}}>{c.name||c.customerName||"—"}</td>
                      <td style={{color:"#6b7280",fontSize:12}}>{c.email||"—"}</td>
                      <td>{fmt(c.orderCount||c.orders||0)}</td>
                      <td style={{fontWeight:600,color:"#147EB3"}}>{fmtCur(c.totalSpent||c.totalAmount||0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders Table ── */}
      <div className="dash-card" style={{ padding:20, marginBottom:24 }}>
        <SectionTitle sub="Last 10 orders from backend">Recent Orders</SectionTitle>
        {recentL ? [1,2,3,4,5].map(i=><LoadRow key={i}/>) :
         recentOrders.length === 0 ? <Empty msg="No orders found" /> : (
          <div style={{ overflowX:"auto" }}>
            <table className="sf-table">
              <thead><tr>
                <th>Order ID</th><th>Customer</th><th>Product</th>
                <th>Amount</th><th>Payment</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {recentOrders.map((o,i)=>(
                  <tr key={o._id||i}>
                    <td style={{fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>
                      #{String(o._id||o.orderId||i).slice(-8).toUpperCase()}
                    </td>
                    <td style={{fontWeight:600}}>{o.customerName||o.customer?.name||o.userId?.name||"—"}</td>
                    <td style={{fontSize:12,color:"#374151"}}>{o.productName||o.product?.name||o.items?.[0]?.name||"—"}</td>
                    <td style={{fontWeight:700,color:"#147EB3"}}>{fmtCur(o.totalAmount||o.amount||0)}</td>
                    <td style={{fontSize:12}}>{o.paymentMethod||"—"}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLS[o.status]||"status-pending"}`}>
                        {o.status||"Pending"}
                      </span>
                    </td>
                    <td style={{fontSize:11,color:"#9ca3af"}}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Row: Top Products + System Health ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24 }}>

        {/* Top Products */}
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Best selling products from analytics">Top Selling Products</SectionTitle>
          {tpL ? [1,2,3].map(i=><LoadRow key={i}/>) :
           topProducts.length === 0 ? <Empty msg="No product data" /> : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {topProducts.map((p,i)=>(
                <div key={p._id||i} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"12px",
                  borderRadius:10, border:"1px solid #f0f0f0",
                  transition:"border-color 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="#147EB3"; e.currentTarget.style.boxShadow="0 4px 16px rgba(20,126,179,0.12)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="#f0f0f0"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <div style={{
                    width:42, height:42, borderRadius:10, background:"#EBF5FF",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:20, flexShrink:0
                  }}>🛍️</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {p.name||p.productName||"—"}
                    </div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{p.category||"—"}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#147EB3"}}>{fmtCur(p.revenue||p.totalRevenue||0)}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{fmt(p.unitsSold||p.sold||0)} sold</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Live system status from backend">System Status</SectionTitle>
          {sysL ? <div className="skeleton" style={{height:180}} /> : (
            <div>
              {[
                { label:"Backend API", value: sysData?.status||sysData?.apiStatus||"OK", ok:true },
                { label:"Database", value: sysData?.database||sysData?.dbStatus||"Connected", ok:true },
                { label:"Memory Usage", value: sysData?.memory||sysData?.memoryUsage||"—", ok:true },
                { label:"Uptime", value: sysData?.uptime ? `${Math.floor(sysData.uptime/60)}m` : "—", ok:true },
                { label:"Version", value: sysData?.version||"1.0.0", ok:true },
              ].map((row)=>(
                <div key={row.label} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 0", borderBottom:"1px solid #f3f4f6"
                }}>
                  <span style={{fontSize:13,color:"#6b7280"}}>{row.label}</span>
                  <span className={`status-badge ${row.ok?"status-delivered":"status-cancelled"}`}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop:12, padding:"10px 12px", background:"#F8FAFC", borderRadius:10 }}>
                <div style={{fontSize:11,color:"#9ca3af"}}>Server Time</div>
                <div style={{fontSize:13,fontWeight:600}}>
                  {sysData?.serverTime
                    ? new Date(sysData.serverTime).toLocaleString("en-IN")
                    : new Date().toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="dash-card" style={{ padding:20 }}>
        <SectionTitle>Quick Actions</SectionTitle>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[
            { label:"📦 View Orders", href:"/orders", color:"#147EB3" },
            { label:"👥 Manage Users", href:"/users", color:"#10b981" },
            { label:"📊 Analytics", href:"/analytics", color:"#8b5cf6" },
            { label:"📋 Sales Report", href:"/analytics", color:"#f59e0b" },
          ].map(btn=>(
            <a key={btn.label} href={btn.href} style={{
              background:btn.color, color:"#fff", padding:"10px 20px",
              borderRadius:10, fontWeight:600, fontSize:13.5, textDecoration:"none",
              boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
              transition:"opacity 0.2s, transform 0.2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="none"; }}
            >
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
