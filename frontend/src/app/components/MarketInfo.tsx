'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export function MarketInfo() {
  // Mock market data - in a real app, this would come from an API or contract
  const marketData = {
    ethPrice: 2847.32,
    ethChange: 2.4,
    usdcPrice: 1.00,
    protocolTVL: 125700000,
    activeLoans: 1247,
    avgAPR: 5.2,
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <EthereumIcon className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">ETH</p>
                <p className="text-dark-400 text-xs">Ethereum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium text-sm">${marketData.ethPrice.toLocaleString()}</p>
              <p className="text-green-400 text-xs">+{marketData.ethChange}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">USDC</p>
                <p className="text-dark-400 text-xs">USD Coin</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium text-sm">${marketData.usdcPrice.toFixed(2)}</p>
              <p className="text-dark-400 text-xs">0.0%</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-dark-400">Protocol TVL</span>
              <span className="text-white font-medium">{formatCurrency(marketData.protocolTVL / 1000000)}M</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-dark-400">Active Loans</span>
              <span className="text-white font-medium">{marketData.activeLoans.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-dark-400">Avg APR</span>
              <span className="text-green-400 font-medium">{marketData.avgAPR}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom icons
function EthereumIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
    </svg>
  )
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}
