"use client";

import { CrossChainLending } from "@/app/components/CrossChainLending";

export default function CrossChainPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-white mb-8 font-mono">
        [cross_chain_dashboard]
      </h1>
      <CrossChainLending />
    </div>
  );
}
