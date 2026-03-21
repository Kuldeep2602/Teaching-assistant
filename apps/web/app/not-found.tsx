export default function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f3f4f6",
        color: "#1f2937",
        fontFamily: "\"Segoe UI\", \"Helvetica Neue\", sans-serif"
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: 8 }}>Page not found</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          The page you requested does not exist.
        </p>
      </div>
    </main>
  );
}
