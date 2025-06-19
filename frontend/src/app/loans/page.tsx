"use client";

import { useState } from "react";
import { useContracts } from "../../hooks/use-contracts";
import { useLoanHealth, type LoanHealth } from "../../hooks/use-loan-health";
import { useRiskAssessment } from "../../hooks/use-risk-assessment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Loan {
  loanId: number;
  tokenId: number;
  principalAmount: bigint;
  interestRate: number;
  startTimestamp: number;
  borrower: string;
  lender: string;
  isActive: boolean;
  isFunded: boolean;
  assetType: number;
}

export default function LoansPage() {
  const { userLoans, createLoan, repayLoanWithInterest } = useContracts();
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const { health } = useLoanHealth(selectedLoanId || 0);
  const { assessPropertyRisk } = useRiskAssessment();

  const loans = Array.isArray(userLoans) ? userLoans : [];
  const healthFactor = health?.healthFactor;
  const currentLTV = health?.currentLTV;
  const riskLevel = health?.riskLevel;

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>💰</span>
          <span>Loan Management Terminal</span>
        </div>
        <div style={{ color: "#00ff00" }}>⚡AI Risk Assessment Active</div>
      </div>

      {/* Quick Stats */}
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
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>Active Loans</div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>{loans.length}</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Total Borrowed
          </div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>$750,000</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Average Health Factor
          </div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>
            {healthFactor ? healthFactor.toFixed(2) : "N/A"}
          </div>
        </div>
      </div>

      {/* Active Loans Table */}
      <div
        style={{
          border: "1px solid rgba(0, 255, 255, 0.2)",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>Active Loans</div>
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
              <th>Property</th>
              <th>Principal</th>
              <th>Interest Rate</th>
              <th>LTV</th>
              <th>Health Factor</th>
              <th>Risk Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan: Loan) => (
              <tr
                key={loan.loanId}
                style={{ borderBottom: "1px solid rgba(0, 255, 255, 0.1)" }}
              >
                <td style={{ color: "#0ff" }}>#{loan.loanId}</td>
                <td>Token #{loan.tokenId}</td>
                <td style={{ color: "#0ff" }}>
                  ${Number(loan.principalAmount).toLocaleString()}
                </td>
                <td>{(loan.interestRate / 100).toFixed(2)}%</td>
                <td
                  style={{
                    color:
                      currentLTV && currentLTV >= 80
                        ? "#ff4444"
                        : currentLTV && currentLTV >= 75
                        ? "#ffd700"
                        : "#00ff00",
                  }}
                >
                  {currentLTV?.toFixed(2)}%
                </td>
                <td
                  style={{
                    color:
                      healthFactor && healthFactor < 1
                        ? "#ff4444"
                        : healthFactor && healthFactor < 1.2
                        ? "#ffd700"
                        : "#00ff00",
                  }}
                >
                  {healthFactor?.toFixed(2)}
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
                  {riskLevel || "LOADING"}
                </td>
                <td>
                  <button
                    onClick={() => setSelectedLoanId(loan.loanId)}
                    style={{
                      background: "transparent",
                      border: "1px solid #0ff",
                      color: "#0ff",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div
        style={{ border: "1px solid rgba(0, 255, 255, 0.2)", padding: "20px" }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>Quick Actions</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          <Dialog>
            <DialogTrigger asChild>
              <button
                style={{
                  background: "transparent",
                  border: "1px solid #0ff",
                  color: "#0ff",
                  padding: "15px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Create New Loan
              </button>
            </DialogTrigger>
            <DialogContent
              style={{
                background: "black",
                border: "1px solid #0ff",
                color: "#0ff",
              }}
            >
              <DialogHeader>
                <DialogTitle>Create New Loan</DialogTitle>
              </DialogHeader>
              {/* Add loan creation form here */}
            </DialogContent>
          </Dialog>

          <button
            style={{
              background: "transparent",
              border: "1px solid #0ff",
              color: "#0ff",
              padding: "15px",
              cursor: "pointer",
            }}
          >
            Make Payment
          </button>

          <button
            style={{
              background: "transparent",
              border: "1px solid #0ff",
              color: "#0ff",
              padding: "15px",
              cursor: "pointer",
            }}
          >
            View AI Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
