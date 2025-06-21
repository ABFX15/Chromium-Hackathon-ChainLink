
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            border: "2px solid #0ff",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            margin: "0 auto 20px",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite"
          }} />
          <h1 style={{ fontSize: "24px", color: "#0ff" }}>Loading Properties...</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "10px" }}>
            Fetching real estate data from RentCast API
          </p>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
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
        <h1 style={{ fontSize: "28px", color: "#0ff", marginBottom: "10px" }}>
          Property Marketplace
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Browse and invest in tokenized real estate properties powered by RentCast API
        </p>
        <div style={{ 
          color: "rgba(0, 255, 255, 0.8)", 
          fontSize: "14px", 
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ 
            display: "inline-block", 
            width: "8px", 
            height: "8px", 
            backgroundColor: "#0f0", 
            borderRadius: "50%",
            animation: "pulse 2s infinite"
          }} />
          Live property data • {properties.length} properties available
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </div>
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
              padding: "0",
              backgroundColor: "rgba(0, 255, 255, 0.05)",
              overflow: "hidden",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = "1px solid rgba(0, 255, 255, 0.6)";
              e.currentTarget.style.backgroundColor = "rgba(0, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = "1px solid rgba(0, 255, 255, 0.2)";
              e.currentTarget.style.backgroundColor = "rgba(0, 255, 255, 0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={property.image}
                alt={property.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#0ff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                border: "1px solid rgba(0, 255, 255, 0.3)"
              }}>
                {property.type}
              </div>
            </div>
            
            <div style={{ padding: "20px" }}>
              <h3 style={{ 
                color: "#0ff", 
                fontSize: "18px", 
                marginBottom: "8px",
                fontWeight: "bold"
              }}>
                {property.name}
              </h3>
              
              <p style={{ 
                color: "rgba(255, 255, 255, 0.7)", 
                marginBottom: "8px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}>
                📍 {property.location}
              </p>
              
              <p style={{ 
                color: "rgba(255, 255, 255, 0.6)", 
                marginBottom: "15px", 
                fontSize: "13px",
                lineHeight: "1.4"
              }}>
                {property.description}
              </p>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "15px"
              }}>
                <span style={{ 
                  color: "#0ff", 
                  fontSize: "24px", 
                  fontWeight: "bold"
                }}>
                  ${property.price.toLocaleString()}
                </span>
                <span style={{ 
                  color: "rgba(255, 255, 255, 0.6)", 
                  fontSize: "12px"
                }}>
                  {property.sqft.toLocaleString()} sqft
                </span>
              </div>
              
              <div style={{
                display: "flex",
                gap: "15px",
                marginBottom: "15px",
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.7)"
              }}>
                {property.bedrooms > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    🛏️ {property.bedrooms} bed
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  🚿 {property.bathrooms} bath
                </span>
                {property.yearBuilt && (
                  <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    📅 {property.yearBuilt}
                  </span>
                )}
              </div>
              
              <div style={{
                display: "flex",
                gap: "10px"
              }}>
                <button
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 255, 255, 0.1)",
                    border: "1px solid #0ff",
                    color: "#0ff",
                    padding: "12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 255, 255, 0.2)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  View Details
                </button>
                <button
                  style={{
                    backgroundColor: "rgba(0, 255, 0, 0.1)",
                    border: "1px solid #0f0",
                    color: "#0f0",
                    padding: "12px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  💎 Invest
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {properties.length === 0 && !isLoading && (
        <div style={{
          textAlign: "center",
          marginTop: "100px",
          color: "rgba(255, 255, 255, 0.6)"
        }}>
          <p>No properties available at the moment.</p>
        </div>
      )}
    </div>
  );
}
