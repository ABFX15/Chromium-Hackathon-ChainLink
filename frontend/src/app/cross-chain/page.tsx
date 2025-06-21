
'use client'

import { CrossChainLending } from '@/components/CrossChainLending'

export default function CrossChainPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Cross-Chain Lending
        </h1>
        <p className="text-gray-400">
          Access liquidity across multiple blockchains using Chainlink CCIP
        </p>
      </div>
      
      <CrossChainLending />
    </div>
  )
}
