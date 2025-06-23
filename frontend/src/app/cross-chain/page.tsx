"use client";

import { CrossChainLending } from "@/app/components/CrossChainLending";
import { Globe, Network } from "lucide-react";

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

        {/* CrossChainLending Component */}
        <CrossChainLending />
      </div>
    </div>
  );
}
