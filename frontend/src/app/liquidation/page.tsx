"use client";

import { useState } from "react";
import { useLoans } from "../hooks/use-loans";
import { useLoanHealth, type LoanHealth } from "../../hooks/use-loan-health";

const WARNING_THRESHOLD = 8500; // 85%
const SOFT_LIQUIDATION_THRESHOLD = 8000; // 80%
const HARD_LIQUIDATION_THRESHOLD = 7500; // 75%

export default function LiquidationPage() {
  const { loans: userLoans } = useLoans();
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const { health } = useLoanHealth(selectedLoanId || 0);

  const loans = Array.isArray(userLoans) ? userLoans : [];
  const atRiskLoans = loans.filter((loan) => {
    const loanHealth = useLoanHealth(loan.loanId);
    return (loanHealth.health?.currentLTV ?? 0) >= SOFT_LIQUIDATION_THRESHOLD;
  });

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      {/* Dashboard Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>⚡</span>
          <span>Liquidation Dashboard</span>
        </div>
        <div style={{ color: "#00ff00" }}>⚡Chainlink Automation Active</div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Total Monitored
          </div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>{loans.length}</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>At Risk</div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>
            {atRiskLoans.length}
          </div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>Automated</div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>{loans.length}</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Liquidation Threshold
          </div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>80%</div>
        </div>
      </div>

      {/* Active Loan Monitoring */}
      <div
        style={{
          border: "1px solid rgba(0, 255, 255, 0.2)",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>
          Active Loan Monitoring
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 10px",
          }}
        >
          <thead>
            <tr style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              <th>Loan ID</th>
              <th>Borrower</th>
              <th>Property Value</th>
              <th>Debt</th>
              <th>LTV</th>
              <th>Health Factor</th>
              <th>Risk Level</th>
              <th>Time to Liquidation</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const { health } = useLoanHealth(loan.loanId);
              const ltv = health?.currentLTV || 0;
              const healthFactor = health?.healthFactor || 0;
              const riskLevel = health?.riskLevel || "LOADING";
              const timeToLiquidation = health?.timeToLiquidation;

              return (
                <tr
                  key={loan.loanId}
                  style={{ borderBottom: "1px solid rgba(0, 255, 255, 0.1)" }}
                >
                  <td style={{ color: "#0ff" }}>#{loan.loanId}</td>
                  <td>
                    {loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}
                  </td>
                  <td style={{ color: "#0ff" }}>
                    ${Number(loan.principalAmount).toLocaleString()}
                  </td>
                  <td style={{ color: "#0ff" }}>
                    $
                    {(
                      Number(loan.principalAmount) *
                      (1 + loan.interestRate / 10000)
                    ).toLocaleString()}
                  </td>
                  <td
                    style={{
                      color:
                        ltv >= 80
                          ? "#ff4444"
                          : ltv >= 75
                          ? "#ffd700"
                          : "#00ff00",
                    }}
                  >
                    {ltv.toFixed(2)}%
                  </td>
                  <td
                    style={{
                      color:
                        healthFactor < 1
                          ? "#ff4444"
                          : healthFactor < 1.2
                          ? "#ffd700"
                          : "#00ff00",
                    }}
                  >
                    {healthFactor.toFixed(2)}
                  </td>
                  <td
                    style={{
                      color:
                        riskLevel === "HARD_LIQUIDATION"
                          ? "#ff4444"
                          : riskLevel === "SOFT_LIQUIDATION"
                          ? "#ffd700"
                          : riskLevel === "WARNING"
                          ? "#ffd700"
                          : "#00ff00",
                    }}
                  >
                    {riskLevel}
                  </td>
                  <td>
                    {timeToLiquidation
                      ? timeToLiquidation < 1
                        ? "⏲ < 1 hour"
                        : `⏲ ${timeToLiquidation.toFixed(1)} hours`
                      : "⏲ > 1 week"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Automation Performance */}
      <div
        style={{ border: "1px solid rgba(0, 255, 255, 0.2)", padding: "20px" }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>
          Automation Performance
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", color: "#00ff00" }}>⚡</div>
            <div style={{ fontSize: "36px", color: "#00ff00" }}>99.9%</div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>Uptime</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", color: "#0ff" }}>◎</div>
            <div style={{ fontSize: "36px", color: "#0ff" }}>0.002</div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              ETH Gas Used
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", color: "#0ff" }}>⏲</div>
            <div style={{ fontSize: "36px", color: "#0ff" }}>12</div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Liquidations Prevented
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
