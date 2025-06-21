import { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useContracts } from '../hooks/useContracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ArrowRight, Network, Globe, Zap, DollarSign, AlertCircle } from 'lucide-react'
import { supportedChains, getDestinationChains, estimateCCIPFee, SupportedChainKey } from '@/lib/chains'
import { formatCurrency } from '@/lib/utils'

export function CrossChainLending() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { addCCIPLiquidity, estimateCCIPFee, executeCCIPLoan, addingLiquidity } = useContracts()
  
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [loanAmount, setLoanAmount] = useState('')
  const [estimatedFee, setEstimatedFee] = useState<bigint>(BigInt(0))
  const [isEstimating, setIsEstimating] = useState(false)

  const currentChain = Object.values(supportedChains).find(chain => chain.id === chainId)
  const destinationChains = getDestinationChains(chainId)

  useEffect(() => {
    if (selectedDestination && loanAmount && currentChain) {
      estimateFee()
    }
  }, [selectedDestination, loanAmount, currentChain])

  const estimateFee = async () => {
    if (!currentChain || !selectedDestination || !loanAmount) return
    
    setIsEstimating(true)
    try {
      const sourceChain = Object.keys(supportedChains).find(
        key => supportedChains[key as SupportedChainKey].id === currentChain.id
      ) as SupportedChainKey
      
      const fee = await estimateCCIPFee(sourceChain, selectedDestination as SupportedChainKey)
      setEstimatedFee(fee)
    } catch (error) {
      console.error('Fee estimation error:', error)
    } finally {
      setIsEstimating(false)
    }
  }

  const handleChainSwitch = async (chainId: number) => {
    try {
      await switchChain({ chainId })
    } catch (error) {
      console.error('Chain switch error:', error)
    }
  }

  const getChainIcon = (chainName: string) => {
    switch (chainName.toLowerCase()) {
      case 'sepolia':
        return '◇'
      case 'avalanche fuji':
        return '▲'
      case 'polygon mumbai':
        return '⬟'
      case 'arbitrum sepolia':
        return '◐'
      default:
        return '○'
    }
  }

  const getChainColor = (chainName: string) => {
    switch (chainName.toLowerCase()) {
      case 'sepolia':
        return 'text-blue-400'
      case 'avalanche fuji':
        return 'text-red-400'
      case 'polygon mumbai':
        return 'text-purple-400'
      case 'arbitrum sepolia':
        return 'text-blue-300'
      default:
        return 'text-cyan-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Chain Status */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Network className="w-5 h-5" />
            [ccip_chain_status]
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentChain ? (
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${getChainColor(currentChain.name)}`}>
                {getChainIcon(currentChain.name)}
              </span>
              <div className="flex-1">
                <div className="text-cyan-300 font-mono">{currentChain.name}</div>
                <div className="text-cyan-500/70 font-mono text-sm">
                  chain_id: {currentChain.id}
                </div>
              </div>
              <div className="text-green-400 font-mono text-sm flex items-center gap-1">
                <span className="animate-pulse">●</span>
                connected
              </div>
            </div>
          ) : (
            <div className="text-red-400 font-mono text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              unsupported_chain
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Chains */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Globe className="w-5 h-5" />
            [supported_chains]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(supportedChains).map((chain) => (
              <div
                key={chain.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  chainId === chain.id
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-gray-600/30 hover:border-cyan-500/30 hover:bg-gray-800/50'
                }`}
                onClick={() => handleChainSwitch(chain.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xl ${getChainColor(chain.name)}`}>
                    {getChainIcon(chain.name)}
                  </span>
                  <span className="text-cyan-300 font-mono text-sm">
                    {chain.name}
                  </span>
                </div>
                <div className="text-cyan-500/70 font-mono text-xs">
                  {chain.nativeCurrency.symbol}
                </div>
                {chainId === chain.id && (
                  <div className="text-green-400 font-mono text-xs mt-1">
                    current
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Chain Lending Interface */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Zap className="w-5 h-5" />
            [ccip_cross_chain_lending]
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentChain?.name === 'Sepolia' ? (
            <>
              {/* Source Chain (Collateral) */}
              <div className="space-y-2">
                <label className="text-cyan-500 font-mono text-sm">collateral_chain</label>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                  <span className={`text-xl ${getChainColor(currentChain.name)}`}>
                    {getChainIcon(currentChain.name)}
                  </span>
                  <div className="flex-1">
                    <div className="text-cyan-300 font-mono">{currentChain.name}</div>
                    <div className="text-cyan-500/70 font-mono text-xs">
                      nft_collateral_deposits
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </div>

              {/* Destination Chain (Lending Pool) */}
              <div className="space-y-2">
                <label className="text-cyan-500 font-mono text-sm">lending_pool_chain</label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono">
                    <SelectValue placeholder="select_destination_chain" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-cyan-500/30">
                    {destinationChains.map((chain) => (
                      <SelectItem key={chain.id} value={Object.keys(supportedChains).find(
                        key => supportedChains[key as SupportedChainKey].id === chain.id
                      ) || ''}>
                        <div className="flex items-center gap-2">
                          <span className={getChainColor(chain.name)}>
                            {getChainIcon(chain.name)}
                          </span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loan Amount */}
              <div className="space-y-2">
                <label className="text-cyan-500 font-mono text-sm">loan_amount_usdc</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>

              {/* CCIP Fee Estimation */}
              {selectedDestination && loanAmount && (
                <div className="space-y-2">
                  <label className="text-cyan-500 font-mono text-sm">estimated_ccip_fee</label>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                    {isEstimating ? (
                      <div className="text-cyan-300 font-mono text-sm">calculating...</div>
                    ) : (
                      <div className="text-cyan-300 font-mono">
                        {(Number(estimatedFee) / 1e18).toFixed(4)} ETH
                      </div>
                    )}
                    <div className="text-cyan-500/70 font-mono text-xs">
                      cross_chain_message_fee
                    </div>
                  </div>
                </div>
              )}

              {/* Execute Cross-Chain Loan */}
              <Button
                disabled={!selectedDestination || !loanAmount || !address || addingLiquidity}
                onClick={async () => {
                  if (selectedDestination && loanAmount) {
                    try {
                      // Convert chain name to selector (simplified)
                      const chainSelector = BigInt(selectedDestination === 'avalancheFuji' ? 14767482510784806043 : 16015286601757825753)
                      await addCCIPLiquidity(chainSelector, BigInt(loanAmount) * BigInt(10**6)) // USDC has 6 decimals
                    } catch (error) {
                      console.error('CCIP loan failed:', error)
                    }
                  }
                }}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono"
              >
                <Zap className="w-4 h-4 mr-2" />
                {addingLiquidity ? '[executing...]' : '[execute_ccip_loan]'}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-cyan-500/70 font-mono text-sm mb-4">
                switch_to_sepolia_for_collateral_deposits
              </div>
              <Button
                onClick={() => handleChainSwitch(supportedChains.sepolia.id)}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 font-mono"
              >
                <Network className="w-4 h-4 mr-2" />
                [switch_to_sepolia]
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Chain Protocol Stats */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            [ccip_protocol_stats]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">total_tvl</div>
              <div className="text-cyan-300 font-mono text-lg">$2.4M</div>
            </div>
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">active_chains</div>
              <div className="text-cyan-300 font-mono text-lg">4</div>
            </div>
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">ccip_messages</div>
              <div className="text-cyan-300 font-mono text-lg">127</div>
            </div>
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">cross_chain_loans</div>
              <div className="text-cyan-300 font-mono text-lg">23</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}