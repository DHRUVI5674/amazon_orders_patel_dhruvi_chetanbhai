import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query/react";
import {
  useGetProductCountQuery,
  useGetTopSellingProductsQuery,
  useGetLowSellingProductsQuery,
  useGetTrendingProductsQuery,
  useGetRecommendedProductsQuery,
  useGetTopCategoriesQuery,
  useGetTrendingCategoriesQuery,
} from "../features/dashboard/dashboardApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtCur = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const arr = (d) => (Array.isArray(d) ? d : d?.data && Array.isArray(d.data) ? d.data : []);

function SectionTitle({ children, sub }) {
  return (
    <div className="products-section-title">
      <h2>{children}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function StatCard({ label, value, icon, loading }) {
  return (
    <div className="dash-card products-stat-card">
      <div className="products-stat-card-body">
        <div>
          <div>{label}</div>
          <div>{loading ? "..." : value}</div>
        </div>
        <div className="products-stat-icon">{icon}</div>
      </div>
    </div>
  );
}

function ProductList({ title, products, loading }) {
  return (
    <div className="dash-card products-list-card">
      <SectionTitle sub={loading ? "Loading products..." : `Showing ${products.length} products`}>
        {title}
      </SectionTitle>
      {loading ? (
        [1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton products-skeleton" />
        ))
      ) : products.length === 0 ? (
        <div className="products-empty-state">No products available</div>
      ) : (
        <>
          <div className="products-table-wrapper">
            <table className="sf-table products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 8).map((product, index) => (
                  <tr key={product._id || product.productName || index}>
                    <td className="products-name-cell">{product.productName || "—"}</td>
                    <td>{product.category || "—"}</td>
                    <td>{fmt(product.unitsSold || product.sold || product.totalOrders || 0)}</td>
                    <td className="products-revenue-cell">{fmtCur(product.revenue || product.totalRevenue || 0)}</td>
                    <td>{product.trend || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="products-mobile-list">
            {products.slice(0, 8).map((product, index) => (
              <div key={product._id || product.productName || index} className="products-mobile-card">
                <div className="products-mobile-card-header">
                  <div>
                    <div className="products-mobile-name">{product.productName || "—"}</div>
                    <div className="products-mobile-category">{product.category || "—"}</div>
                  </div>
                  <button className="products-mobile-button" type="button">View details</button>
                </div>
                <div className="products-mobile-card-body">
                  <div>
                    <span>Sold</span>
                    <strong>{fmt(product.unitsSold || product.sold || product.totalOrders || 0)}</strong>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <strong>{fmtCur(product.revenue || product.totalRevenue || 0)}</strong>
                  </div>
                  <div>
                    <span>Trend</span>
                    <strong>{product.trend || "—"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Products() {
  const user = useSelector((state) => state.auth.user);
  const customerId = user?.customerId || user?._id || user?.CustomerID;

  const { data: productCountData, isLoading: productCountLoading } = useGetProductCountQuery();
  const { data: topSellingData, isLoading: topSellingLoading } = useGetTopSellingProductsQuery({ limit: 8 });
  const { data: lowSellingData, isLoading: lowSellingLoading } = useGetLowSellingProductsQuery();
  const { data: trendingData, isLoading: trendingLoading } = useGetTrendingProductsQuery();
  const { data: trendingCategoriesData, isLoading: trendingCatLoading } = useGetTrendingCategoriesQuery();
  const { data: recommendedData, isLoading: recommendedLoading } = useGetRecommendedProductsQuery(
    customerId ?? skipToken,
    { skip: !customerId }
  );
  const { data: topCategoriesData, isLoading: topCategoriesLoading } = useGetTopCategoriesQuery();

  const topSelling = useMemo(() => arr(topSellingData?.products ?? topSellingData), [topSellingData]);
  const lowSelling = useMemo(() => arr(lowSellingData?.products ?? lowSellingData), [lowSellingData]);
  const trending = useMemo(() => arr(trendingData?.products ?? trendingData), [trendingData]);
  const recommended = useMemo(() => arr(recommendedData?.products ?? recommendedData), [recommendedData]);
  const topCategories = useMemo(() => arr(topCategoriesData?.categories ?? topCategoriesData), [topCategoriesData]);
  const trendingCategories = useMemo(() => arr(trendingCategoriesData?.categories ?? trendingCategoriesData), [trendingCategoriesData]);

  const productCount = productCountData?.productCount ?? productCountData?.count ?? productCountData?.total ?? 0;

  const categoryChart = topCategories.map((item) => ({ name: item.category || item._id || "—", value: item.count || item.orders || 0 }));
  const trendingCategoryChart = trendingCategories.map((item) => ({ name: item._id || item.category || "—", value: item.totalOrders || item.count || 0 }));

  return (
    <div className="page-body fade-in">
      <div className="products-hero">
        <div>
          <h1>🛍️ Products</h1>
          <p>Product insights, trends, selling performance, and curated recommendations for your catalog.</p>
        </div>
        <div className="products-hero-badge">Sales & inventory overview</div>
      </div>

      <div className="products-stat-grid">
        <StatCard label="Total Products" value={fmt(productCount)} icon="🛒" loading={productCountLoading} />
        <StatCard label="Top Categories" value={fmt(topCategories.length)} icon="🏷️" loading={topCategoriesLoading} />
        <StatCard label="Trending Categories" value={fmt(trendingCategories.length)} icon="📈" loading={trendingCatLoading} />
        <StatCard label="Recommended" value={fmt(recommended.length)} icon="🤖" loading={recommendedLoading} />
      </div>

      <div className="products-analytics-layout">
        <div className="products-card products-card-wide">
          <SectionTitle sub="Best-selling products across the catalog">Top Selling Products</SectionTitle>
          <ProductList title="Top Selling Products" products={topSelling} loading={topSellingLoading} />
        </div>

        <div className="products-card products-analytics-card">
          <SectionTitle sub="Trending product categories and inventory demand">Product Analytics</SectionTitle>
          <div className="products-analytics-grid">
            <div className="products-analytics-block">
              <div className="products-analytics-heading">
                <div>
                  <div>Top Categories</div>
                  <div>Products by category</div>
                </div>
              </div>
              {topCategoriesLoading ? (
                <div className="products-chart-skeleton" />
              ) : !categoryChart.length ? (
                <div className="products-empty-state">No category analytics</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryChart} layout="vertical" margin={{ left: -20, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={(value) => fmt(value)} />
                    <Bar dataKey="value" fill="#147EB3" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="products-analytics-block">
              <div className="products-analytics-heading">
                <div>
                  <div>Trending Categories</div>
                  <div>Recent category demand</div>
                </div>
              </div>
              {trendingCatLoading ? (
                <div className="products-chart-skeleton" />
              ) : !trendingCategoryChart.length ? (
                <div className="products-empty-state">No trending category data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendingCategoryChart} layout="vertical" margin={{ left: -20, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={(value) => fmt(value)} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="products-list-grid">
        <ProductList title="Low Selling Products" products={lowSelling} loading={lowSellingLoading} />
        <ProductList title="Trending Products" products={trending} loading={trendingLoading} />
      </div>

      <ProductList
        title={customerId ? "Recommended Products" : "Recommended Products (Login to see personalized suggestions)"}
        products={recommended}
        loading={recommendedLoading}
      />
    </div>
  );
}
