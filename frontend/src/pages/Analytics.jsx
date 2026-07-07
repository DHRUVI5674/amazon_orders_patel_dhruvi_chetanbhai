// src/pages/Analytics.jsx
import React, { useMemo } from "react";
import {
  useGetAnalyticsMonthlyRevenueQuery,
  useGetAnalyticsYearlyRevenueQuery,
  useGetPaymentDistributionQuery,
  useGetTopCategoriesQuery,
  useGetTopCitiesQuery,
  useGetReturnRateQuery,
  useGetDiscountUsageQuery,
  useGetAverageOrderValueQuery,
  useGetTopSellingProductsQuery,
  useGetLowSellingProductsQuery,
} from "../features/dashboard/dashboardApi";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

const fmtCur = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const arr = (d) => (Array.isArray(d) ? d : d?.data && Array.isArray(d.data) ? d.data : []);

const PIE_COLORS = ["#147EB3","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

function StatBox({ label, value, color="#147EB3", loading }) {
  return (
    <div style={{
      background:"#fff", borderRadius:14, padding:"18px 20px",
      boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #f0f0f0",
    }}>
      {loading ? (
        <div className="skeleton" style={{height:60}} />
      ) : (
        <>
          <div style={{ fontSize:24, fontWeight:800, color }}>{value}</div>
          <div style={{ fontSize:12.5, color:"#6b7280", marginTop:4 }}>{label}</div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom:14 }}>
      <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#1a1a2e" }}>{children}</h2>
      {sub && <p style={{ margin:"3px 0 0", fontSize:12, color:"#6b7280" }}>{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { data: monthlyData, isLoading: mrL } = useGetAnalyticsMonthlyRevenueQuery();
  const { data: yearlyData, isLoading: yrL } = useGetAnalyticsYearlyRevenueQuery();
  const { data: payData, isLoading: payL } = useGetPaymentDistributionQuery();
  const { data: catData, isLoading: catL } = useGetTopCategoriesQuery();
  const { data: citiesData, isLoading: ciL } = useGetTopCitiesQuery();
  const { data: returnData, isLoading: retL } = useGetReturnRateQuery();
  const { data: discountData, isLoading: discL } = useGetDiscountUsageQuery();
  const { data: avgOrdData, isLoading: avgL } = useGetAverageOrderValueQuery();
  const { data: topProdData, isLoading: tpL } = useGetTopSellingProductsQuery({ limit:8 });
  const { data: lowProdData, isLoading: lpL } = useGetLowSellingProductsQuery();

  const monthlyChart = useMemo(() => {
    const raw = arr(monthlyData?.monthlyRevenue ?? monthlyData);
    return raw.map(r=>({ month: r.month||r._id||r.label, revenue: r.revenue||r.total||r.value||0 }));
  }, [monthlyData]);

  const yearlyChart = useMemo(() => {
    const raw = arr(yearlyData?.yearlyRevenue ?? yearlyData);
    return raw.map(r=>({ year: r.year||r._id||r.label, revenue: r.revenue||r.total||r.value||0 }));
  }, [yearlyData]);

  const payChart = useMemo(() => {
    const raw = arr(payData?.distribution ?? payData);
    return raw.map(r=>({ name: r.method||r._id||r.name, value: r.amount||r.count||r.total||0 }));
  }, [payData]);

  const catChart = useMemo(() => {
    const raw = arr(catData?.categories ?? catData);
    return raw.map(r=>({ name: r.category||r._id||r.name, count: r.count||r.orders||0 }));
  }, [catData]);

  const citiesChart = useMemo(() => {
    const raw = arr(citiesData?.cities ?? citiesData);
    return raw.slice(0,8).map(r=>({ city: r.city||r._id||r.name, orders: r.count||r.orders||0 }));
  }, [citiesData]);

  const topProducts = useMemo(() => arr(topProdData?.products ?? topProdData), [topProdData]);
  const lowProducts = useMemo(() => arr(lowProdData?.products ?? lowProdData), [lowProdData]);

  const avgOrdVal = avgOrdData?.averageOrderValue || avgOrdData?.avgValue || avgOrdData?.avg || 0;
  const returnRate = returnData?.returnRate || returnData?.rate || 0;
  const discountRate = discountData?.discountUsage || discountData?.usage || discountData?.rate || 0;

  return (
    <div className="page-body fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#1a1a2e" }}>📊 Analytics</h1>
        <p style={{ margin:"6px 0 0", color:"#6b7280", fontSize:13.5 }}>Business insights from your backend data</p>
      </div>

      {/* Stat boxes */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
        <StatBox label="Avg Order Value" value={fmtCur(avgOrdVal)} loading={avgL} />
        <StatBox label="Return Rate" value={`${Number(returnRate).toFixed(2)}%`} color="#ef4444" loading={retL} />
        <StatBox label="Discount Usage" value={`${Number(discountRate).toFixed(2)}%`} color="#f59e0b" loading={discL} />
        <StatBox label="Top Categories" value={catChart.length} color="#10b981" loading={catL} />
      </div>

      {/* Monthly Revenue Area */}
      <div className="dash-card" style={{ padding:20, marginBottom:20 }}>
        <SectionTitle sub="Month-by-month revenue trend">Monthly Revenue Trend</SectionTitle>
        {mrL ? <div className="skeleton" style={{height:240}} /> :
         monthlyChart.length===0 ? <div style={{textAlign:"center",padding:"40px 0",color:"#9ca3af"}}>No data</div> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyChart}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#147EB3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#147EB3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v=>fmtCur(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#147EB3" strokeWidth={3} fill="url(#revGrad)" animationDuration={700} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Yearly + Payment */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Yearly revenue comparison">Yearly Revenue</SectionTitle>
          {yrL ? <div className="skeleton" style={{height:220}} /> :
           yearlyChart.length===0 ? <div style={{textAlign:"center",padding:"40px 0",color:"#9ca3af"}}>No data</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>fmtCur(v)} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6,6,0,0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Payment method breakdown">Payment Distribution</SectionTitle>
          {payL ? <div className="skeleton" style={{height:220}} /> :
           payChart.length===0 ? <div style={{textAlign:"center",padding:"40px 0",color:"#9ca3af"}}>No data</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={payChart} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" animationDuration={700}>
                  {payChart.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v=>fmtCur(v)} />
                <Legend iconSize={9} wrapperStyle={{fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row: Categories + Cities */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Top product categories">Top Categories</SectionTitle>
          {catL ? <div className="skeleton" style={{height:220}} /> :
           catChart.length===0 ? <div style={{textAlign:"center",padding:"40px 0",color:"#9ca3af"}}>No data</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{fontSize:10}} />
                <YAxis dataKey="name" type="category" tick={{fontSize:10}} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-card" style={{ padding:20 }}>
          <SectionTitle sub="Cities with most orders">Top Cities</SectionTitle>
          {ciL ? <div className="skeleton" style={{height:220}} /> :
           citiesChart.length===0 ? <div style={{textAlign:"center",padding:"40px 0",color:"#9ca3af"}}>No data</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={citiesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="city" tick={{fontSize:10}} />
                <YAxis tick={{fontSize:10}} />
                <Tooltip />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row: Top + Low Products */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {[
          { title:"Top Selling Products", sub:"Highest revenue products", list:topProducts, loading:tpL },
          { title:"Low Selling Products", sub:"Products needing attention", list:lowProducts, loading:lpL },
        ].map(({ title, sub, list, loading }) => (
          <div key={title} className="dash-card" style={{ padding:20 }}>
            <SectionTitle sub={sub}>{title}</SectionTitle>
            {loading ? [1,2,3].map(i=><div key={i} className="skeleton" style={{height:48,marginBottom:8,borderRadius:8}} />) :
             list.length===0 ? <div style={{textAlign:"center",padding:"32px 0",color:"#9ca3af"}}>No data</div> : (
              <div style={{ overflowX:"auto" }}>
                <table className="sf-table">
                  <thead><tr><th>Product</th><th>Category</th><th>Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {list.slice(0,6).map((p,i)=>(
                      <tr key={p._id||i}>
                        <td style={{fontWeight:600,fontSize:13}}>{p.name||p.productName||"—"}</td>
                        <td style={{fontSize:12,color:"#6b7280"}}>{p.category||"—"}</td>
                        <td style={{fontSize:13}}>{fmt(p.unitsSold||p.sold||0)}</td>
                        <td style={{fontWeight:700,color:"#147EB3",fontSize:13}}>{fmtCur(p.revenue||p.totalRevenue||0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
