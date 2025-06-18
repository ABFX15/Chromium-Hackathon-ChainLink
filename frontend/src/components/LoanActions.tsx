"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { LOAN_MANAGER_ADDRESS } from "../constants";
import loanManagerArtifact from "../../../artifacts/contracts/LoanManager.sol/LoanManager.json";
import { useWriteContract } from "wagmi";

const LOAN_MANAGER_ABI = loanManagerArtifact.abi;

export default function LoanActions({ tokenId }: { tokenId: number }) {
  const [loading, setLoading] = useState(false);
  const [apr, setApr] = useState<number | null>(null);
  const [txStatus, setTxStatus] = useState<string>("");
  const [debt, setDebt] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  async function handleCreateLoan() {
    setLoading(true);
    setTxStatus("");
    setApr(null);
    // 1. Get APR from API
    const res = await fetch("/api/risk-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftData: { tokenId }, borrowerData: { address } }),
    });
    const data = await res.json();
    setApr(data.apr);
    // 2. Call contract
    try {
      const tx = await writeContractAsync({
        address: LOAN_MANAGER_ADDRESS,
        abi: LOAN_MANAGER_ABI,
        functionName: "createLoan",
        args: [BigInt(tokenId), BigInt(debt), BigInt(data.apr)],
      });
      setTxStatus(`Loan created! Tx: ${tx}`);
    } catch (err) {
      setTxStatus("Error creating loan");
    }
    setLoading(false);
  }

  return (
    <div className="mt-2">
      <input
        type="number"
        placeholder="Loan amount"
        value={debt}
        onChange={(e) => setDebt(e.target.value)}
        className="border rounded px-2 py-1 mr-2"
        min={1}
        disabled={loading}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleCreateLoan}
        disabled={loading || !debt}
      >
        {loading ? "Scoring..." : "Create Loan"}
      </button>
      {apr !== null && (
        <div className="mt-1 text-blue-700 font-semibold">
          AI-Determined APR: {apr}%
        </div>
      )}
      {txStatus && <div className="mt-1 text-sm">{txStatus}</div>}
    </div>
  );
}
