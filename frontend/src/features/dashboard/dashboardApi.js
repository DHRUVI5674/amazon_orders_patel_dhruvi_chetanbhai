// src/features/dashboard/dashboardApi.js
// Maps ONLY to real backend routes found in app.js:
// /api/v1/orders      -> order.route.js (getAllOrders, getRecentOrders etc.)
// /api/v1/analytics   -> analytics.route.js
// /api/v1/stats       -> orderStats.route.js
// /api/v1/admin       -> orderAdmin.route.js

import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../api/axiosInstance";

const axiosBaseQuery = async ({ url, method = "get", params, data }) => {
  try {
    const result = await axiosInstance({ url, method, params, data });
    return { data: result.data };
  } catch (err) {
    return {
      error: {
        status: err.response?.status || 500,
        data: err.response?.data || err.message,
      },
    };
  }
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Orders", "Users", "Analytics", "Stats", "Admin"],
  endpoints: (builder) => ({
    // ─── STATS (prefix: /stats) ───────────────────────────────────────
    getTotalOrders: builder.query({ query: () => ({ url: "/stats/orders/total" }) }),
    getDailyOrders: builder.query({ query: () => ({ url: "/stats/orders/daily" }) }),
    getMonthlyOrders: builder.query({ query: () => ({ url: "/stats/orders/monthly" }) }),
    getTotalRevenue: builder.query({ query: () => ({ url: "/stats/revenue/total" }) }),
    getMonthlyRevenue: builder.query({ query: () => ({ url: "/stats/revenue/monthly" }) }),
    getDailyRevenue: builder.query({ query: () => ({ url: "/stats/revenue/daily" }) }),
    getProductCount: builder.query({ query: () => ({ url: "/stats/products/count" }) }),
    getCustomerCount: builder.query({ query: () => ({ url: "/stats/customers/count" }) }),
    getRefundCount: builder.query({ query: () => ({ url: "/stats/refunds/count" }) }),
    getCancellationCount: builder.query({ query: () => ({ url: "/stats/cancellations/count" }) }),
    getSystemPerformance: builder.query({ query: () => ({ url: "/stats/system/performance" }) }),

    // ─── ANALYTICS (prefix: /analytics) ──────────────────────────────
    getAnalyticsTotalRevenue: builder.query({ query: () => ({ url: "/analytics/revenue/total" }) }),
    getAnalyticsMonthlyRevenue: builder.query({ query: () => ({ url: "/analytics/revenue/monthly" }) }),
    getAnalyticsYearlyRevenue: builder.query({ query: () => ({ url: "/analytics/revenue/yearly" }) }),
    getAverageOrderValue: builder.query({ query: () => ({ url: "/analytics/orders/average-value" }) }),
    getOrderCount: builder.query({ query: () => ({ url: "/analytics/orders/count" }) }),
    getAnalyticsCancelledOrders: builder.query({ query: () => ({ url: "/analytics/orders/cancelled" }) }),
    getAnalyticsRefundedOrders: builder.query({ query: () => ({ url: "/analytics/orders/refunded" }) }),
    getTopCustomers: builder.query({ query: () => ({ url: "/analytics/customers/top" }) }),
    getTopSellingProducts: builder.query({ query: (params) => ({ url: "/analytics/products/top-selling", params }) }),
    getLowSellingProducts: builder.query({ query: () => ({ url: "/analytics/products/low-selling" }) }),
    getTopCategories: builder.query({ query: () => ({ url: "/analytics/categories/top" }) }),
    getPaymentDistribution: builder.query({ query: () => ({ url: "/analytics/payments/distribution" }) }),
    getTopCities: builder.query({ query: () => ({ url: "/analytics/locations/top-cities" }) }),
    getReturnRate: builder.query({ query: () => ({ url: "/analytics/returns/rate" }) }),
    getDiscountUsage: builder.query({ query: () => ({ url: "/analytics/discounts/usage" }) }),

    // ─── ORDERS (prefix: /orders) ────────────────────────────────────
    getAllOrders: builder.query({ query: (params) => ({ url: "/orders", params }) }),
    getRecentOrders: builder.query({ query: (params) => ({ url: "/orders/recent", params }) }),
    getPagedOrders: builder.query({ query: (params) => ({ url: "/orders/paged", params }) }),
    getOrderById: builder.query({ query: (id) => ({ url: `/orders/${id}` }) }),
    getCancelledOrders: builder.query({ query: (params) => ({ url: "/orders/cancelled", params }) }),
    getRefundedOrders: builder.query({ query: (params) => ({ url: "/orders/refunded", params }) }),
    filterByStatus: builder.query({ query: (params) => ({ url: "/orders/filter/status", params }) }),
    filterByPayment: builder.query({ query: (params) => ({ url: "/orders/filter/payment", params }) }),
    searchOrders: builder.query({ query: (params) => ({ url: "/orders/search", params }) }),

    // ─── ADMIN (prefix: /admin) ──────────────────────────────────────
    getAllUsers: builder.query({ query: (params) => ({ url: "/admin/users", params }) }),
    getUserById: builder.query({ query: (id) => ({ url: `/admin/users/${id}` }) }),
    getAdminOrders: builder.query({ query: (params) => ({ url: "/admin/orders", params }) }),
    getSalesReport: builder.query({ query: () => ({ url: "/admin/reports/sales" }) }),
    getRevenueReport: builder.query({ query: () => ({ url: "/admin/reports/revenue" }) }),
    getAdminTopCustomers: builder.query({ query: () => ({ url: "/admin/reports/top-customers" }) }),
    getAdminTopProducts: builder.query({ query: () => ({ url: "/admin/reports/top-products" }) }),
    getSystemHealth: builder.query({ query: () => ({ url: "/admin/system/health" }) }),
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
