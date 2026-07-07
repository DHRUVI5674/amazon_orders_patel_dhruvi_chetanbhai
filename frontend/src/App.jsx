// src/App.jsx  (fallback 404 – no imports from non-existent files)
export default function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "15vh", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 48, color: "#147EB3" }}>404</h1>
      <p style={{ color: "#6b7280" }}>Page not found</p>
      <a href="/dashboard" style={{ color: "#147EB3", textDecoration: "none" }}>← Back to Dashboard</a>
    </div>
  );
}
