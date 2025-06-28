"use client";

import { CrossChainLending } from "@/app/components/CrossChainLending";
import { Globe, Network, DollarSign } from "lucide-react";

export default function CrossChainPage() {
  return (
    <div className="min-h-screen text-white p-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Network className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl lg:text-5xl font-bold font-heading bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Cross-Chain Operations
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Seamlessly move assets and manage liquidity across multiple
            blockchain networks using Chainlink's Cross-Chain Interoperability
            Protocol (CCIP).
          </p>
        </div>

        {/* How it works / Quick Guide */}
        <div className="bg-cyan-900/10 border border-cyan-700/20 rounded-xl p-6 mb-8 text-cyan-100">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" /> How Cross-Chain Lending
            Works
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-cyan-200">
            <li>Deposit liquidity on your source chain (e.g., Sepolia).</li>
            <li>Select a destination chain to provide cross-chain loans.</li>
            <li>Approve USDC and pay the CCIP fee to bridge liquidity.</li>
            <li>
              Monitor your cross-chain positions and recent activity below.
            </li>
          </ul>
        </div>

        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-cyan-200">
            Cross-Chain Lending
          </h2>
        </div>

        {/* CrossChainLending Component */}
        <CrossChainLending />

        {/* Recent Activity Placeholder */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-bold text-cyan-200">
              Recent Activity
            </span>
          </div>
          <div className="bg-cyan-900/10 border border-cyan-700/20 rounded-xl p-6 text-cyan-100 text-center">
            <span className="text-cyan-400">
              No recent cross-chain transactions yet.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
