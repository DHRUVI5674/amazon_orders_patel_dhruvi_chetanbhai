import React, { useMemo } from "react";
import {
  useGetTotalOrdersQuery,
  useGetTotalRevenueQuery,
  useGetProductCountQuery,
  useGetCustomerCountQuery,
  useGetCategoryCountQuery,
  useGetRefundCountQuery,
  useGetCancellationCountQuery,
  useGetMonthlyRevenueQuery,
  useGetDailyOrdersQuery,
  useGetAverageShippingTimeQuery,
  useGetSystemPerformanceQuery,
} from "../features/dashboard/dashboardApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fmt = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtCur = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const fmtPercent = (value) => `${Number(value || 0).toFixed(1)}%`;
const arr = (value) => (Array.isArray(value) ? value : value?.data && Array.isArray(value.data) ? value.data : []);

function StatCard({ title, value, note, loading }) {
  return (
    <div className="dash-card statistics-stat-card">
      <div>
        <div className="statistics-card-title">{title}</div>
        <div className="statistics-card-value">{loading ? "Loading..." : value}</div>
      </div>
      {note && <div className="statistics-card-note">{note}</div>}
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="statistics-section-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function metricLabel(label, value) {
  return (
    <div className="statistics-metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function Statistics() {
  const { data: ordersData, isLoading: ordersLoading } = useGetTotalOrdersQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetTotalRevenueQuery();
  const { data: productData, isLoading: productLoading } = useGetProductCountQuery();
  const { data: customerData, isLoading: customerLoading } = useGetCustomerCountQuery();
  const { data: categoryData, isLoading: categoryLoading } = useGetCategoryCountQuery();
  const { data: refundData, isLoading: refundLoading } = useGetRefundCountQuery();
  const { data: cancellationData, isLoading: cancellationLoading } = useGetCancellationCountQuery();
  const { data: monthlyRevenueData, isLoading: monthlyRevenueLoading } = useGetMonthlyRevenueQuery();
  const { data: dailyOrdersData, isLoading: dailyOrdersLoading } = useGetDailyOrdersQuery();
  const { data: shippingData, isLoading: shippingLoading } = useGetAverageShippingTimeQuery();
  const { data: systemData, isLoading: systemLoading } = useGetSystemPerformanceQuery();

  const totalOrders = ordersData?.totalOrders ?? ordersData?.total ?? ordersData?.count ?? 0;
  const totalRevenue = revenueData?.totalRevenue ?? revenueData?.revenue ?? revenueData?.total ?? 0;
  const totalProducts = productData?.productCount ?? productData?.count ?? productData?.total ?? 0;
  const totalCustomers = customerData?.customerCount ?? customerData?.count ?? customerData?.total ?? 0;
  const totalCategories = categoryData?.count ?? categoryData?.total ?? 0;
  const totalRefunds = refundData?.refundCount ?? refundData?.count ?? refundData?.total ?? 0;
  const totalCancellations = cancellationData?.cancellationCount ?? cancellationData?.count ?? cancellationData?.total ?? 0;
  const avgShippingDays = shippingData?.avgShippingDays ?? shippingData?.averageShippingDays ?? 0;

  const monthlyRevenue = useMemo(() => {
    const raw = monthlyRevenueData?.monthlyRevenue ?? monthlyRevenueData?.data ?? [];
    return arr(raw).map((item) => ({
      x: item.month || item._id || item.label || "",
      revenue: item.revenue ?? item.total ?? item.value ?? 0,
    }));
  }, [monthlyRevenueData]);

  const dailyOrders = useMemo(() => {
    const raw = dailyOrdersData?.data ?? dailyOrdersData;
    return arr(raw).map((item) => {
      const id = item._id;
      const label = typeof id === "object"
        ? [id.year, id.month, id.day].filter(Boolean).join("-")
        : String(id ?? item.day ?? item.date ?? item.label ?? "");
      return {
        x: label,
        count: item.count ?? item.total ?? item.value ?? 0,
      };
    });
  }, [dailyOrdersData]);

  const systemPerformance = systemData?.performance || systemData || {};
  const uptimeSeconds = Number(systemPerformance?.uptime?.seconds ?? systemPerformance?.uptime ?? 0);
  const uptimeLabel = uptimeSeconds >= 3600
    ? `${(uptimeSeconds / 3600).toFixed(2)} hrs`
    : uptimeSeconds >= 60
      ? `${(uptimeSeconds / 60).toFixed(1)} mins`
      : `${Math.round(uptimeSeconds)} sec`;
  const memoryLabel = typeof systemPerformance?.memory === "string"
    ? systemPerformance.memory
    : systemPerformance?.memory?.rss || systemPerformance?.memory?.heapUsed || "Unknown";
  const cpuUsage = systemPerformance?.cpuUsage ?? {};
  const cpuLabel = cpuUsage.user || cpuUsage.system
    ? `usr ${Math.round(cpuUsage.user || 0)} µs · sys ${Math.round(cpuUsage.system || 0)} µs`
    : "Not available";

  return (
    <div className="page-body fade-in">
      <SectionHeading
        title="📈 Statistics"
        subtitle="Live business metrics sourced directly from your backend statistics API."
      />

      <div className="statistics-grid">
        <StatCard title="Total Revenue" value={fmtCur(totalRevenue)} loading={revenueLoading} note="Sales captured from payments." />
        <StatCard title="Total Orders" value={fmt(totalOrders)} loading={ordersLoading} note="Orders processed by the store." />
        <StatCard title="Total Customers" value={fmt(totalCustomers)} loading={customerLoading} note="Customer accounts registered." />
        <StatCard title="Total Products" value={fmt(totalProducts)} loading={productLoading} note="Catalog product count." />
        <StatCard title="Product Categories" value={fmt(totalCategories)} loading={categoryLoading} note="Distinct inventory categories." />
        <StatCard title="Refunds" value={fmt(totalRefunds)} loading={refundLoading} note="Refunded payment records." />
        <StatCard title="Cancellations" value={fmt(totalCancellations)} loading={cancellationLoading} note="Orders cancelled by customers." />
        <StatCard title="Avg Shipping Time" value={`${Number(avgShippingDays).toFixed(1)} days`} loading={shippingLoading} note="Average shipment delivery time." />
      </div>

      <div className="statistics-chart-row">
        <div className="dash-card statistics-chart-card">
          <div className="statistics-chart-header">
            <div>
              <h2>Monthly Revenue</h2>
              <p>Revenue aggregated by month from backend payments.</p>
            </div>
          </div>
          {monthlyRevenueLoading ? (
            <div className="statistics-chart-placeholder">Loading chart…</div>
          ) : monthlyRevenue.length === 0 ? (
            <div className="statistics-empty-state">No revenue data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue} margin={{ top: 12, right: 10, left: -8, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="x" tick={{ fontSize: 12, fill: "#374151" }} />
                <YAxis tick={{ fontSize: 12, fill: "#374151" }} tickFormatter={(value) => `₹${Number(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => fmtCur(value)} />
                <Bar dataKey="revenue" fill="#147EB3" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-card statistics-chart-card">
          <div className="statistics-chart-header">
            <div>
              <h2>Daily Orders</h2>
              <p>Order volume by day from the backend statistics endpoint.</p>
            </div>
          </div>
          {dailyOrdersLoading ? (
            <div className="statistics-chart-placeholder">Loading chart…</div>
          ) : dailyOrders.length === 0 ? (
            <div className="statistics-empty-state">No order activity found.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyOrders} margin={{ top: 12, right: 10, left: -8, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="x" tick={{ fontSize: 12, fill: "#374151" }} />
                <YAxis tick={{ fontSize: 12, fill: "#374151" }} />
                <Tooltip formatter={(value) => fmt(value)} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="statistics-bottom-row">
        <div className="dash-card statistics-health-card">
          <div className="statistics-chart-header">
            <div>
              <h2>System Performance</h2>
              <p>Server runtime and memory metrics from the backend container.</p>
            </div>
          </div>
          <div className="statistics-health-list">
            {metricLabel("Uptime", systemLoading ? "Loading…" : uptimeLabel)}
            {metricLabel("Memory (RSS)", systemLoading ? "Loading…" : memoryLabel)}
            {metricLabel("CPU Usage", systemLoading ? "Loading…" : cpuLabel)}
            {metricLabel("Platform", systemLoading ? "Loading…" : systemPerformance?.platform ?? "Unknown")}
            {metricLabel("Node version", systemLoading ? "Loading…" : systemPerformance?.nodeVersion ?? "Unknown")}
            {metricLabel("Server timestamp", systemLoading ? "Loading…" : systemPerformance?.timestamp ?? "Unknown")}
          </div>
        </div>
      </div>
    </div>
  );
}
