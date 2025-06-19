"use client";

import { useProperties } from "../../../src/hooks/use-properties";

export default function MarketplacePage() {
  const { properties, isLoading } = useProperties();

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", color: "#0ff" }}>NFT Marketplace</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Browse available real estate NFTs
        </p>
      </div>

      {isLoading ? (
        <div style={{ color: "#0ff" }}>Loading properties...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {properties?.map((property) => (
            <div
              key={property.id}
              style={{
                border: "1px solid rgba(0, 255, 255, 0.2)",
                padding: "20px",
                borderRadius: "4px",
              }}
            >
              <h3 style={{ color: "#0ff", marginBottom: "10px" }}>
                {property.name}
              </h3>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                {property.location}
              </p>
              <p style={{ color: "#0ff", fontSize: "20px", marginTop: "10px" }}>
                ${property.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
