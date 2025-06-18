'use client'

import { PropertyNFTCard } from './PropertyNFTCard'
import { TransactionMonitor } from './TransactionMonitor'
import { usePropertyNFTs } from '@/hooks/use-property-nfts'

export function PropertyPortfolio() {
  const { nfts, loading } = usePropertyNFTs()

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black/90 to-cyan-950/20 border border-cyan-500/30 p-5 font-mono text-sm rounded-lg backdrop-blur-sm">
        <div className="text-cyan-400 mb-4 flex items-center space-x-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          <span>loading portfolio...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 h-6 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-black/90 to-cyan-950/20 border border-cyan-500/30 p-5 font-mono text-sm rounded-lg backdrop-blur-sm">
      <div className="border-b border-cyan-500/20 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          <span className="text-cyan-300 font-semibold">Property Portfolio</span>
        </div>
        <div className="text-cyan-400 text-xs mt-2">
          {nfts.length} property nft{nfts.length !== 1 ? 's' : ''} in wallet
        </div>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-8 bg-gradient-to-r from-cyan-900/10 to-blue-900/10 rounded-lg">
          <div className="text-red-400 text-xs">✗ no property nfts found</div>
          <div className="text-cyan-500/70 text-xs mt-2">
            hint: mint some property nfts first
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="min-h-[320px]">
              <PropertyNFTCard nft={nft} />
            </div>
          ))}
        </div>
      )}

      {/* Transaction Monitor */}
      <TransactionMonitor compact={true} />
    </div>
  )
}