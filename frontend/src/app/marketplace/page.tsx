
"use client";

import { useProperties } from "@/hooks/use-properties";

export default function MarketplacePage() {
  const { properties, isLoading } = useProperties();

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
        minHeight: "100vh"
      }}>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1 style={{ fontSize: "24px", color: "#0ff" }}>Loading Properties...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "black",
      color: "#0ff",
      fontFamily: "monospace",
      padding: "20px",
      minHeight: "100vh"
    }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", color: "#0ff", marginBottom: "10px" }}>Property Marketplace</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Browse and invest in tokenized real estate properties
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px"
      }}>
        {properties.map((property) => (
          <div
            key={property.id}
            style={{
              border: "1px solid rgba(0, 255, 255, 0.2)",
              borderRadius: "8px",
              padding: "20px",
              backgroundColor: "rgba(0, 255, 255, 0.05)"
            }}
          >
            <img
              src={property.image}
              alt={property.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "4px",
                marginBottom: "15px"
              }}
            />
            <h3 style={{ color: "#0ff", fontSize: "18px", marginBottom: "10px" }}>
              {property.name}
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: "10px" }}>
              {property.location}
            </p>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "15px", fontSize: "14px" }}>
              {property.description}
            </p>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <span style={{ color: "#0ff", fontSize: "20px", fontWeight: "bold" }}>
                ${property.price.toLocaleString()}
              </span>
              <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px" }}>
                {property.sqft} sqft
              </span>
            </div>
            <div style={{
              display: "flex",
              gap: "15px",
              marginBottom: "15px",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.7)"
            }}>
              {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
              <span>{property.bathrooms} bath</span>
              <span>{property.type}</span>
            </div>
            <button
              style={{
                width: "100%",
                backgroundColor: "rgba(0, 255, 255, 0.1)",
                border: "1px solid #0ff",
                color: "#0ff",
                padding: "10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "14px"
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
