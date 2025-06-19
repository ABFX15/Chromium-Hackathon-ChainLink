"use client";

export default function EarningsPage() {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>💰</span>
          <span>Earnings Dashboard</span>
        </div>
      </div>
      <div
        style={{ border: "1px solid rgba(0, 255, 255, 0.2)", padding: "20px" }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>
          Loading earnings data...
        </div>
      </div>
    </div>
  );
}
