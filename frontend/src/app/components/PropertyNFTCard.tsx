
import { useState } from 'react'
import { PropertyNFT } from '@/types/contracts'
import { formatCurrency } from '@/lib/utils'
import { NFTDetailModal } from './NFTDetailModal'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  TrendingUp, 
  Shield, 
  Zap,
  Eye,
  ExternalLink,
  Star,
  Activity
} from 'lucide-react'

interface PropertyNFTCardProps {
  nft: PropertyNFT
  showBuyButton?: boolean
  onBuy?: (nft: PropertyNFT) => void
}

export function PropertyNFTCard({ nft, showBuyButton = false, onBuy }: PropertyNFTCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Guard clause to handle undefined nft
  if (!nft) {
    return (
      <div className="nft-card bg-gray-800/50 border border-gray-700 rounded-20 p-6">
        <div className="text-center text-gray-400">
          <div className="text-sm">NFT data not available</div>
        </div>
      </div>
    )
  }

  const riskScore = nft.riskScore || 50 // Default risk score if undefined
  const riskColor = riskScore <= 30 
    ? 'text-green-400 bg-green-400/10 border-green-400/30' 
    : riskScore <= 70 
    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    : 'text-red-400 bg-red-400/10 border-red-400/30'

  const riskLabel = riskScore <= 30 ? 'Low Risk' : riskScore <= 70 ? 'Medium Risk' : 'High Risk'

  return (
    <>
      <div 
        className="nft-card group cursor-pointer" 
        onClick={(e) => {
          // Only open modal if clicking on the card itself, not the button
          const clickedElement = e.target as HTMLElement
          const isButton = clickedElement.closest('button') || clickedElement.tagName === 'BUTTON'
          const isButtonArea = clickedElement.closest('[data-button-area]')
          
          console.log('Card clicked, target:', clickedElement.tagName, 'isButton:', isButton, 'isButtonArea:', isButtonArea)
          
          if (!isButton && !isButtonArea) {
            console.log('Opening modal for:', nft.name)
            setShowModal(true)
          } else {
            console.log('Click blocked - button area clicked')
          }
        }}
      >
        {/* Header Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <Badge className={`${riskColor} border font-semibold text-xs px-3 py-1`}>
            <Shield className="w-3 h-3 mr-1" />
            {riskLabel}
          </Badge>
          <div className="flex space-x-2">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
              <Star className="w-3 h-3 mr-1 text-yellow-400" />
              {nft.rating || '4.8'}
            </Badge>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative h-56 overflow-hidden rounded-t-20">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton"></div>
          )}
          <img
            src={nft.image}
            alt={nft.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Quick Actions */}
          <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Eye className="w-4 h-4 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Location */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-all duration-300">
              {nft.name}
            </h3>
            <div className="flex items-center text-white/60 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              {nft.location}
            </div>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Property Value</p>
              <p className="text-white font-bold text-lg">
                {formatCurrency(nft.price)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Token ID</p>
              <p className="text-white font-bold text-lg">#{nft.tokenId}</p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white/50 text-xs">APY</p>
                <p className="text-white font-semibold text-sm">8.5%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white/50 text-xs">Liquidity</p>
                <p className="text-white font-semibold text-sm">High</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {showBuyButton && (
            <div className="relative z-50 mt-6" data-button-area="true">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('BUTTON CLICK EVENT FIRED for:', nft.name)
                  console.log('onBuy function exists:', !!onBuy)
                  console.log('onBuy function type:', typeof onBuy)
                  if (onBuy) {
                    console.log('Calling onBuy function...')
                    onBuy(nft)
                    console.log('onBuy function called successfully')
                  } else {
                    console.error('onBuy function is not defined')
                  }
                }}
                onMouseDown={(e) => {
                  console.log('MOUSE DOWN on purchase button')
                }}
                onMouseUp={(e) => {
                  console.log('MOUSE UP on purchase button')
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center relative z-50"
                style={{ 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 9999
                }}
                type="button"
              >
                <Zap className="w-4 h-4 mr-2" />
                Purchase NFT
              </button>
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-20"></div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <NFTDetailModal
          nft={nft}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          showBuyButton={showBuyButton}
          onBuy={onBuy}
        />
      )}
    </>
  )
}
