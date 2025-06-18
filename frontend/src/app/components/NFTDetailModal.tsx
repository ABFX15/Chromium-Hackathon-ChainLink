import { useState } from 'react'
import { PropertyNFT } from '@/types/contracts'
import { X, ExternalLink, Shield, MapPin, Calendar, DollarSign, Zap, CreditCard, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CompleteWorkflowModal } from './CompleteWorkflowModal'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, MOCK_USDC_ABI } from '@/lib/contracts'
import { parseUnits } from 'viem'

interface NFTDetailModalProps {
  nft: PropertyNFT | null
  isOpen: boolean
  onClose: () => void
}

export function NFTDetailModal({ nft, isOpen, onClose }: NFTDetailModalProps) {
  const { isConnected } = useAccount()
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false)
  const [workflowMode, setWorkflowMode] = useState<'borrow' | 'lend'>('borrow')

  const handleWorkflowStart = (mode: 'borrow' | 'lend') => {
    setWorkflowMode(mode)
    setWorkflowModalOpen(true)
  }

  if (!isOpen || !nft) return null

  const getRarity = () => {
    if (nft.propertyValue > 800000) return { name: 'LEGENDARY', color: 'text-yellow-400 bg-yellow-400/20' }
    if (nft.propertyValue > 650000) return { name: 'EPIC', color: 'text-purple-400 bg-purple-400/20' }
    if (nft.propertyValue > 500000) return { name: 'RARE', color: 'text-blue-400 bg-blue-400/20' }
    return { name: 'COMMON', color: 'text-gray-400 bg-gray-400/20' }
  }

  const rarity = getRarity()

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-2xl border border-cyan-500/30 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{nft.name}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${rarity.color} border`}>
                {rarity.name}
              </span>
              <span className="text-gray-400 text-sm">Token ID #{nft.tokenId}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Top Section - Image and Basic Info */}
          <div className="flex gap-6 mb-6">
            {/* Property Image */}
            <div className="relative flex-shrink-0">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-48 h-48 object-cover rounded-xl border-2 border-gray-700"
              />
              <div className="absolute top-2 left-2">
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${rarity.color} border backdrop-blur-sm`}>
                  {rarity.name}
                </div>
              </div>
              {nft.isCollateral && (
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 rounded-full text-xs font-bold text-red-400 bg-red-400/20 border border-red-400/50 backdrop-blur-sm">
                    LOCKED
                  </div>
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="flex-1">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 h-full">
                <p className="text-gray-300 leading-relaxed mb-4">{nft.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">Downtown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400">Built:</span>
                    <span className="text-white">2020</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Token ID:</span>
                    <span className="text-white ml-2">#{nft.tokenId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Loan:</span>
                    <span className="text-white ml-2">{formatCurrency(nft.maxLoan)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="space-y-4">
            {/* Price and Stats */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Current Price</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatCurrency(nft.propertyValue)}</div>
                  <div className="text-sm text-gray-400">~{(nft.propertyValue / 2000).toFixed(1)} ETH</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Max LTV</span>
                  <div className="text-white font-semibold">70%</div>
                </div>
                <div>
                  <span className="text-gray-400">Max Loan</span>
                  <div className="text-white font-semibold">{formatCurrency(nft.maxLoan)}</div>
                </div>
              </div>
            </div>

            {/* Simple Action Buttons */}
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Buy This Property
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Purchase this property NFT directly with USDC. You'll own the full asset immediately.
                </p>
                {!isConnected ? (
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-3">Connect your wallet to access DeFi lending</p>
                    <button disabled className="w-full bg-gray-600 text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed">
                      Connect Wallet First
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleWorkflowStart('borrow')}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Borrow
                    </button>
                    <button 
                      onClick={() => handleWorkflowStart('lend')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Lend
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI-Powered Lending
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  AWS Bedrock analyzes property data and market conditions to optimize interest rates and loan terms.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Max LTV:</span>
                    <span className="text-white ml-2">70%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">AI Risk Score:</span>
                    <span className="text-purple-400 ml-2">Dynamic</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Loan:</span>
                    <span className="text-white ml-2">{formatCurrency(Math.floor(nft.propertyValue * 0.7))}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cross-Chain:</span>
                    <span className="text-blue-400 ml-2">CCIP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">Protected Transaction</span>
              </div>
              <p className="text-gray-400 text-sm">
                All transactions are secured by smart contracts and backed by Chainlink oracles for price feeds.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Details
              </button>
              <button 
                onClick={() => handleWorkflowStart('borrow')}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Start Lending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Workflow Modal */}
      <CompleteWorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        nft={nft}
        mode={workflowMode}
      />
    </div>
  )
}