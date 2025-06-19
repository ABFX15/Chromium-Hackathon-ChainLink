"use client";

import { useState } from "react";
import { useContracts } from "@/hooks/use-contracts";
import { CreateLoanModal } from "@/app/components/CreateLoanModal";
import { LoanCard } from "@/app/components/LoanCard";
import { usePropertyNFTs } from "@/hooks/use-property-nfts";

export default function LoansPage() {
  const { userLoans, loading } = useContracts();
  const { nfts = [] } = usePropertyNFTs();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter out any NFTs that are already used as collateral
  const availableNFTs = nfts.filter((nft) => !nft.isCollateral);

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
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", color: "#0ff" }}>Loan Center</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Manage your loans and create new ones
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            backgroundColor: "rgba(0, 255, 255, 0.1)",
            border: "1px solid #0ff",
            color: "#0ff",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          + New Loan
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#0ff" }}>Loading loans...</div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {userLoans?.map((loan) => (
            <LoanCard key={loan.loanId} loan={loan} />
          ))}
          {(!userLoans || userLoans.length === 0) && (
            <div
              style={{
                border: "1px solid rgba(0, 255, 255, 0.2)",
                padding: "20px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              No active loans found. Create a new loan to get started.
            </div>
          )}
        </div>
      )}

      <CreateLoanModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        availableNFTs={availableNFTs || []}
      />
    </div>
  );
}
