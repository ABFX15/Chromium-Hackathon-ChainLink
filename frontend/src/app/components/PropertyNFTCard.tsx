import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { PropertyNFT } from '@/types/contracts'
import { Building2, Zap, Sparkles, Eye, Star, TrendingUp } from 'lucide-react'
import { RWAPurchaseModal } from './RWAPurchaseModal'

interface PropertyNFTCardProps {
  nft: PropertyNFT
}

export function PropertyNFTCard({ nft }: PropertyNFTCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseType, setPurchaseType] = useState<'buy' | 'loan'>('buy')

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleBuyRWA = () => {
    setPurchaseType('buy')
    setShowPurchaseModal(true)
  }

  const handleAILoan = () => {
    setPurchaseType('loan')
    setShowPurchaseModal(true)
  }

  const getRarityColor = () => {
    if (nft.propertyValue > 700000) return 'from-yellow-400 to-orange-500' // Legendary
    if (nft.propertyValue > 600000) return 'from-purple-400 to-pink-500' // Epic
    if (nft.propertyValue > 500000) return 'from-blue-400 to-cyan-500' // Rare
    return 'from-gray-400 to-gray-600' // Common
  }

  const getRarityText = () => {
    if (nft.propertyValue > 700000) return 'LEGENDARY'
    if (nft.propertyValue > 600000) return 'EPIC'
    if (nft.propertyValue > 500000) return 'RARE'
    return 'COMMON'
  }

  return (
    <div 
      className={`relative w-full max-w-sm mx-auto cursor-pointer transition-all duration-700 ease-out transform-gpu ${
        isHovered ? 'scale-105 -rotate-2 z-20' : 'scale-100 rotate-0 z-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        aspectRatio: '2.5/3.5', // Pokemon card proportions
        filter: isHovered ? 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))' : 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))'
      }}
    >
      {/* Front Side - Collectible Card Design */}
      <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
        isFlipped ? 'hidden' : 'block'
      }`}>
        
        {/* Pokemon Card Border with Rarity */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getRarityColor()} p-2 ${
          isHovered ? 'shadow-2xl shadow-yellow-500/40 scale-[1.02]' : 'shadow-xl scale-100'
        } transition-all duration-500 ease-out`}>
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden relative">
            
            {/* Holographic Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 transition-opacity duration-300 ${
              isHovered ? 'opacity-100 animate-pulse' : ''
            }`}></div>
            
            {/* Pokemon Card Header */}
            <div className="relative bg-white px-4 py-3 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-black font-bold text-lg leading-tight">{nft.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 font-mono text-sm">#{nft.tokenId}</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor()} text-white shadow-md mt-2`}>
                {getRarityText()}
              </div>
            </div>

            {/* Pokemon Card Main Artwork */}
            <div className="relative bg-white px-3 py-2">
              <div className="relative overflow-hidden rounded-xl border-4 border-gray-300 bg-gradient-to-br from-blue-50 to-indigo-100">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className={`w-full h-48 object-cover transition-all duration-700 ${
                    isHovered ? 'scale-115 brightness-110 saturate-130' : 'scale-100'
                  }`}
                />
                
                {/* Enhanced Holographic Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-yellow-200/40 via-cyan-200/30 to-purple-200/40 transition-all duration-500 ${
                  isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'
                }`}></div>
                
                {/* Pokemon-style Shimmer with Enhanced Movement */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-12 transition-transform duration-1200 ease-out ${
                  isHovered ? 'translate-x-full opacity-100' : '-translate-x-full opacity-0'
                }`}></div>
              </div>
              
              {/* Pokemon Card Type Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                  REAL ESTATE
                </div>
              </div>
            </div>

            {/* Pokemon Card Stats Section */}
            <div className="bg-white px-4 pt-4 pb-2">
              {/* Pokemon-style Stats Box */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-300 p-4 mb-3">
                <div className="text-center mb-3">
                  <div className="text-gray-700 text-xs font-bold uppercase tracking-wide">Property Stats</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-gray-600 text-xs font-bold uppercase mb-1">VALUE</div>
                    <div className="text-gray-900 font-bold text-lg">{formatCurrency(nft.propertyValue)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-xs font-bold uppercase mb-1">MAX LOAN</div>
                    <div className="text-gray-900 font-bold text-lg">{formatCurrency(nft.maxLoan)}</div>
                  </div>
                </div>

                {/* Status with Pokemon-style indicators */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    nft.isCollateral 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {nft.isCollateral ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>COLLATERALIZED</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3 h-3" />
                        <span>AVAILABLE</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Pokemon Card Action Buttons */}
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleBuyRWA}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-green-400"
                  >
                    BUY RWA
                  </button>
                  <button 
                    onClick={handleAILoan}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-blue-400"
                  >
                    AI LOAN
                  </button>
                </div>
                
                {/* Flip Button */}
                <div className="text-center">
                  <button
                    onClick={handleFlip}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100 text-xs font-medium"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Back Side - Technical Specs */}
      <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
        isFlipped ? 'block' : 'hidden'
      }`}>
        
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 p-1">
          <div className="w-full h-full bg-gray-900 rounded-xl overflow-hidden relative">
            
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 opacity-70 animate-pulse"></div>
            
            {/* Header */}
            <div className="relative z-10 p-4 border-b border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-mono text-sm">[tech_specs]</span>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="bg-gray-800/60 p-3 rounded border border-purple-500/20">
                  <div className="text-purple-400 font-mono text-xs mb-1">token_id</div>
                  <div className="text-purple-200 font-mono text-sm">#{nft.tokenId}</div>
                </div>
                
                <div className="bg-gray-800/60 p-3 rounded border border-purple-500/20">
                  <div className="text-purple-400 font-mono text-xs mb-1">owner_address</div>
                  <div className="text-purple-200 font-mono text-xs">
                    {nft.owner.slice(0, 8)}...{nft.owner.slice(-6)}
                  </div>
                </div>

                <div className="bg-gray-800/60 p-3 rounded border border-purple-500/20">
                  <div className="text-purple-400 font-mono text-xs mb-1">status</div>
                  <div className="text-purple-200 font-mono text-sm">
                    {nft.isCollateral ? 'LOCKED_AS_COLLATERAL' : 'AVAILABLE_FOR_LENDING'}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-800/60 p-3 rounded border border-purple-500/20">
                <div className="text-purple-400 font-mono text-xs mb-2">description</div>
                <div className="text-purple-200 font-mono text-xs leading-relaxed max-h-20 overflow-y-auto">
                  {nft.description}
                </div>
              </div>

              {/* Return Button */}
              <button
                onClick={handleFlip}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 px-3 py-2 rounded font-mono text-xs transition-all duration-300 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                [return_to_front]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RWA Purchase Modal */}
      <RWAPurchaseModal
        nft={nft}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        purchaseType={purchaseType}
      />
    </div>
  )
}