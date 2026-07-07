// src/features/dashboard/dashboardApi.js
// Maps ONLY to real backend routes found in app.js:
// /api/v1/orders      -> order.route.js (getAllOrders, getRecentOrders etc.)
// /api/v1/analytics   -> analytics.route.js
// /api/v1/stats       -> orderStats.route.js
// /api/v1/admin       -> orderAdmin.route.js

import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../api/axiosInstance";

const normalizeOrder = (o) => {
  if (!o || typeof o !== "object") return o;
  return {
    ...o,
    // Canonical fields used by the UI components
    orderId: o.orderId ?? o.OrderID ?? o._id,
    customerName: o.customerName ?? o.CustomerName,
    productName: o.productName ?? o.ProductName,
    category: o.category ?? o.Category,
    brand: o.brand ?? o.Brand,
    quantity: o.quantity ?? o.Quantity,
    unitPrice: o.unitPrice ?? o.UnitPrice,
    discount: o.discount ?? o.Discount,
    tax: o.tax ?? o.Tax,
    shippingCost: o.shippingCost ?? o.ShippingCost,
    totalAmount: o.totalAmount ?? o.TotalAmount,
    paymentMethod: o.paymentMethod ?? o.PaymentMethod,
    status: o.status ?? o.OrderStatus,
    createdAt: o.createdAt ?? o.OrderDate ?? o.updatedAt,
  };
};

const mapList = (payload, mapper) => {
  if (Array.isArray(payload)) return payload.map(mapper);
  if (payload && Array.isArray(payload.data)) return { ...payload, data: payload.data.map(mapper) };
  if (payload && Array.isArray(payload.orders)) return { ...payload, orders: payload.orders.map(mapper) };
  return payload;
};

const unwrapAnalyticsData = (res) => {
  if (res && Array.isArray(res.data)) return res.data;
  return res;
};

const monthLabel = (item) => {
  if (item?.month && item?.year) return `${item.year}-${String(item.month).padStart(2, "0")}`;
  if (item?.month) return String(item.month);
  if (item?._id?.month) return `${item._id.year ?? ""}-${String(item._id.month).padStart(2, "0")}`.replace(/^-/, "");
  return item?._id ?? item?.label ?? "";
};

const axiosBaseQuery = async ({ url, method = "get", params, data }) => {
  try {
    const result = await axiosInstance({ url, method, params, data });
    return { data: result.data };
  } catch (err) {
    return {
      error: {
        status: err.response?.status || (err.code === "ECONNABORTED" ? 408 : 500),
        data: err.response?.data || err.message,
      },
    };
  }
};

const withFallback = (fallback) => ({
  transformErrorResponse: () => fallback,
});

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Orders", "Users", "Analytics", "Stats", "Admin"],
  endpoints: (builder) => ({
    // ─── STATS (prefix: /stats) ───────────────────────────────────────
    getTotalOrders: builder.query({
      query: () => ({ url: "/stats/orders/total" }),
      transformResponse: (res) => ({
        totalOrders: res?.total ?? res?.count ?? 0,
        total: res?.total ?? res?.count ?? 0,
      }),
      ...withFallback({ totalOrders: 0, total: 0 }),
    }),
    getDailyOrders: builder.query({ query: () => ({ url: "/stats/orders/daily" }) }),
    getMonthlyOrders: builder.query({ query: () => ({ url: "/stats/orders/monthly" }) }),
    getTotalRevenue: builder.query({
      query: () => ({ url: "/stats/revenue/total" }),
      transformResponse: (res) => ({
        totalRevenue: res?.totalRevenue ?? res?.revenue ?? res?.total ?? 0,
      }),
      ...withFallback({ totalRevenue: 0 }),
    }),
    getMonthlyRevenue: builder.query({
      query: () => ({ url: "/stats/revenue/monthly" }),
      transformResponse: (res) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        return {
          monthlyRevenue: rows.map((r) => ({
            month: monthLabel(r),
            revenue: r.revenue ?? r.total ?? r.value ?? 0,
          })),
        };
      },
      ...withFallback({ monthlyRevenue: [] }),
    }),
    getDailyRevenue: builder.query({ query: () => ({ url: "/stats/revenue/daily" }) }),
    getProductCount: builder.query({
      query: () => ({ url: "/stats/products/count" }),
      transformResponse: (res) => ({
        productCount: res?.count ?? res?.total ?? 0,
        count: res?.count ?? res?.total ?? 0,
      }),
      ...withFallback({ productCount: 0, count: 0 }),
    }),
    getCustomerCount: builder.query({
      query: () => ({ url: "/stats/customers/count" }),
      transformResponse: (res) => ({
        customerCount: res?.count ?? res?.total ?? 0,
        count: res?.count ?? res?.total ?? 0,
      }),
      ...withFallback({ customerCount: 0, count: 0 }),
    }),
    getRefundCount: builder.query({
      query: () => ({ url: "/stats/refunds/count" }),
      transformResponse: (res) => ({
        refundCount: res?.count ?? res?.total ?? 0,
        count: res?.count ?? res?.total ?? 0,
      }),
      ...withFallback({ refundCount: 0, count: 0 }),
    }),
    getCancellationCount: builder.query({
      query: () => ({ url: "/stats/cancellations/count" }),
      transformResponse: (res) => ({
        cancellationCount: res?.count ?? res?.total ?? 0,
        count: res?.count ?? res?.total ?? 0,
      }),
      ...withFallback({ cancellationCount: 0, count: 0 }),
    }),
    getSystemPerformance: builder.query({ query: () => ({ url: "/stats/system/performance" }) }),

    // ─── ANALYTICS (prefix: /analytics) ──────────────────────────────
    getAnalyticsTotalRevenue: builder.query({ query: () => ({ url: "/analytics/revenue/total" }) }),
    getAnalyticsMonthlyRevenue: builder.query({
      query: () => ({ url: "/analytics/revenue/monthly" }),
      transformResponse: (res) => {
        const rows = unwrapAnalyticsData(res);
        if (!Array.isArray(rows)) return res;
        return {
          monthlyRevenue: rows.map((r) => ({
            month: monthLabel(r),
            revenue: r.revenue ?? r.total ?? r.value ?? 0,
          })),
        };
      },
    }),
    getAnalyticsYearlyRevenue: builder.query({
      query: () => ({ url: "/analytics/revenue/yearly" }),
      transformResponse: (res) => {
        const rows = unwrapAnalyticsData(res);
        if (!Array.isArray(rows)) return res;
        return {
          yearlyRevenue: rows.map((r) => ({
            year: r.year ?? r._id ?? r.label,
            revenue: r.revenue ?? r.total ?? r.value ?? 0,
          })),
        };
      },
    }),
    getAverageOrderValue: builder.query({
      query: () => ({ url: "/analytics/orders/average-value" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        // backend returns [{ avg: ... }]
        const avg = Array.isArray(data) ? data[0]?.avg : data?.avg;
        return { averageOrderValue: avg ?? 0 };
      },
    }),
    getOrderCount: builder.query({
      query: () => ({ url: "/analytics/orders/average-value" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        const avg = Array.isArray(data) ? data[0]?.avg : data?.avg;
        return { averageOrderValue: avg ?? 0, avgValue: avg ?? 0, avg: avg ?? 0 };
      },
      ...withFallback({ averageOrderValue: 0, avgValue: 0, avg: 0 }),
    }),
    getAnalyticsCancelledOrders: builder.query({ query: () => ({ url: "/analytics/orders/cancelled" }) }),
    getAnalyticsRefundedOrders: builder.query({ query: () => ({ url: "/analytics/orders/refunded" }) }),
    getTopCustomers: builder.query({
      query: () => ({ url: "/analytics/customers/top" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        if (!Array.isArray(data)) return res;
        return {
          customers: data.map((r) => ({
            name: r.customerName ?? r.name ?? r._id,
            customerName: r.customerName ?? r.name ?? r._id,
            totalSpent: r.totalSpent ?? r.spent ?? 0,
            orderCount: r.orderCount ?? r.orders ?? 0,
            email: r.email,
          })),
        };
      },
      ...withFallback({ customers: [] }),
    }),
    getTopSellingProducts: builder.query({
      query: (params) => ({ url: "/analytics/products/top-selling", params }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        if (!Array.isArray(data)) return res;
        return {
          products: data.map((r) => ({
            name: r.productName ?? r.name ?? r._id,
            productName: r.productName ?? r.name ?? r._id,
            unitsSold: r.unitsSold ?? r.sold ?? r.totalSold ?? 0,
            sold: r.unitsSold ?? r.sold ?? r.totalSold ?? 0,
            totalRevenue: r.totalRevenue ?? r.revenue ?? 0,
            revenue: r.totalRevenue ?? r.revenue ?? 0,
            category: r.category ?? r._id,
          })),
        };
      },
      ...withFallback({ products: [] }),
    }),
    getLowSellingProducts: builder.query({
      query: () => ({ url: "/analytics/products/low-selling" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        if (!Array.isArray(data)) return res;
        return {
          products: data.map((r) => ({
            name: r.productName ?? r.name ?? r._id,
            productName: r.productName ?? r.name ?? r._id,
            unitsSold: r.unitsSold ?? r.sold ?? r.totalSold ?? 0,
            sold: r.unitsSold ?? r.sold ?? r.totalSold ?? 0,
            totalRevenue: r.totalRevenue ?? r.revenue ?? 0,
            revenue: r.totalRevenue ?? r.revenue ?? 0,
            category: r.category ?? r._id,
          })),
        };
      },
      ...withFallback({ products: [] }),
    }),
    getTopCategories: builder.query({
      query: () => ({ url: "/analytics/categories/top" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        if (!Array.isArray(data)) return res;
        return { categories: data.map((r) => ({ category: r.category ?? r._id, count: r.count ?? 0 })) };
      },
      ...withFallback({ categories: [] }),
    }),
    getPaymentDistribution: builder.query({
      query: () => ({ url: "/analytics/payments/distribution" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        if (!Array.isArray(data)) return res;
        return {
          distribution: data.map((r) => ({
            method: r.method ?? r._id,
            amount: r.amount ?? r.totalAmount ?? 0,
            count: r.count ?? 0,
          })),
        };
      },
      ...withFallback({ distribution: [] }),
    }),
    getTopCities: builder.query({
      query: () => ({ url: "/analytics/locations/top-cities" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        if (!Array.isArray(data)) return res;
        return { cities: data.map((r) => ({ city: r.city ?? r._id, count: r.count ?? 0 })) };
      },
    }),
    getReturnRate: builder.query({ query: () => ({ url: "/analytics/returns/rate" }) }),
    getDiscountUsage: builder.query({
      query: () => ({ url: "/analytics/discounts/usage" }),
      transformResponse: (res) => {
        const data = unwrapAnalyticsData(res);
        const row = Array.isArray(data) ? data[0] : data;
        const usage = row?.orders ?? row?.usage ?? row?.rate ?? 0;
        return { discountUsage: usage, usage, rate: usage };
      },
    }),

    // ─── ORDERS (prefix: /orders) ────────────────────────────────────
    getAllOrders: builder.query({
      query: (params) => ({ url: "/orders", params }),
      transformResponse: (res) => mapList(res, normalizeOrder),
    }),
    getRecentOrders: builder.query({
      query: (params) => ({ url: "/orders/recent", params }),
      transformResponse: (res) => mapList(res, normalizeOrder),
      ...withFallback({ data: [] }),
    }),
    getPagedOrders: builder.query({
      query: (params) => {
        if (params?.status) {
          return {
            url: "/orders/filter/status",
            params: { type: params.status, page: params.page, limit: params.limit },
          };
        }
        return { url: "/orders/paged", params };
      },
      transformResponse: (res) => mapList(res, normalizeOrder),
    }),
    getOrderById: builder.query({
      query: (id) => ({ url: `/orders/${id}` }),
      transformResponse: (res) => {
        if (res?.data) return { ...res, data: normalizeOrder(res.data) };
        return normalizeOrder(res);
      },
    }),
    getCancelledOrders: builder.query({
      query: (params) => ({ url: "/orders/cancelled", params }),
      transformResponse: (res) => mapList(res, normalizeOrder),
    }),
    getRefundedOrders: builder.query({
      query: (params) => ({ url: "/orders/refunded", params }),
      transformResponse: (res) => mapList(res, normalizeOrder),
    }),
    filterByStatus: builder.query({ query: (params) => ({ url: "/orders/filter/status", params }) }),
    filterByPayment: builder.query({ query: (params) => ({ url: "/orders/filter/payment", params }) }),
    searchOrders: builder.query({ query: (params) => ({ url: "/orders/search", params }) }),

    // ─── ADMIN (prefix: /admin) ──────────────────────────────────────
    getAllUsers: builder.query({
      query: (params) => ({ url: "/admin/users", params }),
      transformResponse: (res) => ({
        ...res,
        users: Array.isArray(res?.data) ? res.data : res?.users ?? [],
        total: res?.count ?? res?.total ?? (Array.isArray(res?.data) ? res.data.length : 0),
      }),
    }),
    getUserById: builder.query({ query: (id) => ({ url: `/admin/users/${id}` }) }),
    getAdminOrders: builder.query({ query: (params) => ({ url: "/admin/orders", params }) }),
    getSalesReport: builder.query({ query: () => ({ url: "/admin/reports/sales" }) }),
    getRevenueReport: builder.query({ query: () => ({ url: "/admin/reports/revenue" }) }),
    getAdminTopCustomers: builder.query({ query: () => ({ url: "/admin/reports/top-customers" }) }),
    getAdminTopProducts: builder.query({ query: () => ({ url: "/admin/reports/top-products" }) }),
    getSystemHealth: builder.query({
      query: () => ({ url: "/admin/system/health" }),
      transformResponse: (res) => {
        // backend returns { success, status, data: { users, orders, payments, uptime, memoryUsage } }
        const d = res?.data;
        return {
          status: res?.status || "OK",
          database: "Connected",
          memory: d?.memoryUsage ? `${Math.round((d.memoryUsage.rss || 0) / 1024 / 1024)} MB` : undefined,
          uptime: d?.uptime,
          version: "1.0.0",
          serverTime: new Date().toISOString(),
        };
      },
      ...withFallback({
        status: "Offline",
        database: "Unavailable",
        memory: "—",
        uptime: 0,
        version: "1.0.0",
        serverTime: new Date().toISOString(),
      }),
    }),
  }),
});

export const {
  // Stats
  useGetTotalOrdersQuery,
  useGetDailyOrdersQuery,
  useGetMonthlyOrdersQuery,
  useGetTotalRevenueQuery,
  useGetMonthlyRevenueQuery,
  useGetDailyRevenueQuery,
  useGetProductCountQuery,
  useGetCustomerCountQuery,
  useGetRefundCountQuery,
  useGetCancellationCountQuery,
  useGetSystemPerformanceQuery,
  // Analytics
  useGetAnalyticsTotalRevenueQuery,
  useGetAnalyticsMonthlyRevenueQuery,
  useGetAnalyticsYearlyRevenueQuery,
  useGetAverageOrderValueQuery,
  useGetOrderCountQuery,
  useGetAnalyticsCancelledOrdersQuery,
  useGetAnalyticsRefundedOrdersQuery,
  useGetTopCustomersQuery,
  useGetTopSellingProductsQuery,
  useGetLowSellingProductsQuery,
  useGetTopCategoriesQuery,
  useGetPaymentDistributionQuery,
  useGetTopCitiesQuery,
  useGetReturnRateQuery,
  useGetDiscountUsageQuery,
  // Orders
  useGetAllOrdersQuery,
  useGetRecentOrdersQuery,
  useGetPagedOrdersQuery,
  useGetOrderByIdQuery,
  useGetCancelledOrdersQuery,
  useGetRefundedOrdersQuery,
  useFilterByStatusQuery,
  useFilterByPaymentQuery,
  useSearchOrdersQuery,
  // Admin
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetAdminOrdersQuery,
  useGetSalesReportQuery,
  useGetRevenueReportQuery,
  useGetAdminTopCustomersQuery,
  useGetAdminTopProductsQuery,
  useGetSystemHealthQuery,
} = dashboardApi;
