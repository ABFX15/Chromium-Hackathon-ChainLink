"use client";

import { useState } from "react";
import { AIAnalytics } from "@/app/components/AIAnalytics";

export default function RiskAnalysisPage() {
  const [selectedProperty, setSelectedProperty] = useState({
    tokenId: 1,
    propertyValue: 750000,
    propertyType: "Residential",
    location: "Miami Beach, FL",
    yearBuilt: 2021,
    squareFootage: 6500,
  });

  const [loanAmount, setLoanAmount] = useState(500000);

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
        <h1 style={{ fontSize: "24px", color: "#0ff" }}>AI Risk Analysis</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Powered by AWS Bedrock + Chainlink
        </p>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Property Selection */}
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h2 style={{ color: "#0ff", marginBottom: "20px" }}>
            Property Details
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Property Value
              </p>
              <p style={{ fontSize: "24px", color: "#0ff" }}>
                ${selectedProperty.propertyValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Location</p>
              <p style={{ fontSize: "24px", color: "#0ff" }}>
                {selectedProperty.location}
              </p>
            </div>
            <div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Year Built</p>
              <p style={{ fontSize: "24px", color: "#0ff" }}>
                {selectedProperty.yearBuilt}
              </p>
            </div>
          </div>
        </div>

        {/* Loan Amount Input */}
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h2 style={{ color: "#0ff", marginBottom: "20px" }}>Loan Details</h2>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                marginBottom: "10px",
                display: "block",
              }}
            >
              Requested Loan Amount
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              style={{
                backgroundColor: "rgba(0, 255, 255, 0.1)",
                border: "1px solid rgba(0, 255, 255, 0.2)",
                padding: "10px",
                color: "#0ff",
                width: "100%",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            />
          </div>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            LTV:{" "}
            {((loanAmount / selectedProperty.propertyValue) * 100).toFixed(2)}%
          </p>
        </div>

        {/* AI Risk Assessment */}
        <AIAnalytics />
      </div>
    </div>
  );
}
