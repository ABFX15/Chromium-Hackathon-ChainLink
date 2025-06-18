import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { AlertTriangle, Shield, Clock, TrendingDown, Zap, Target } from 'lucide-react'
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI, LIQUIDATION_THRESHOLD } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'

interface LiquidationRisk {
  loanId: number
  tokenId: number
  borrower: string
  currentLTV: number
  healthFactor: number
  timeToLiquidation: string
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical'
  propertyValue: number
  debtAmount: number
}

export function LiquidationDashboard() {
  const { isConnected } = useAccount()
  const [liquidationRisks, setLiquidationRisks] = useState<LiquidationRisk[]>([])
  const [automationStats, setAutomationStats] = useState({
    totalMonitored: 0,
    atRisk: 0,
    automated: 0,
    gasOptimized: true
  })

  // Mock data for demonstration - in production would read from contracts
  useEffect(() => {
    if (isConnected) {
      const mockRisks: LiquidationRisk[] = [
        {
          loanId: 1,
          tokenId: 101,
          borrower: '0x742d35Cc6635C0532925a3b8D0c4E5C2',
          currentLTV: 65,
          healthFactor: 1.23,
          timeToLiquidation: '2.3 hours',
          riskLevel: 'warning',
          propertyValue: 750000,
          debtAmount: 487500
        },
        {
          loanId: 2,
          tokenId: 102,
          borrower: '0x8ba1f109551bD432803012645Hac136c',
          currentLTV: 82,
          healthFactor: 0.98,
          timeToLiquidation: '45 minutes',
          riskLevel: 'critical',
          propertyValue: 650000,
          debtAmount: 533000
        },
        {
          loanId: 3,
          tokenId: 103,
          borrower: '0x9f8C123456789abcdef1234567890abc',
          currentLTV: 45,
          healthFactor: 1.78,
          timeToLiquidation: '> 1 week',
          riskLevel: 'safe',
          propertyValue: 850000,
          debtAmount: 382500
        }
      ]
      
      setLiquidationRisks(mockRisks)
      setAutomationStats({
        totalMonitored: mockRisks.length,
        atRisk: mockRisks.filter(r => r.riskLevel === 'warning' || r.riskLevel === 'critical').length,
        automated: mockRisks.length,
        gasOptimized: true
      })
    }
  }, [isConnected])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400 bg-green-400/20'
      case 'warning': return 'text-yellow-400 bg-yellow-400/20'
      case 'danger': return 'text-orange-400 bg-orange-400/20'
      case 'critical': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getHealthFactorColor = (factor: number) => {
    if (factor >= 1.5) return 'text-green-400'
    if (factor >= 1.2) return 'text-yellow-400'
    if (factor >= 1.0) return 'text-orange-400'
    return 'text-red-400'
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 text-center">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Liquidation Monitoring</h2>
        <p className="text-gray-400">Connect your wallet to view liquidation risks and automation status</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Liquidation Dashboard
          </h2>
          <div className="flex items-center gap-2 text-green-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Chainlink Automation Active</span>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Monitored</p>
                <p className="text-white text-2xl font-bold">{automationStats.totalMonitored}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">At Risk</p>
                <p className="text-white text-2xl font-bold">{automationStats.atRisk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Automated</p>
                <p className="text-white text-2xl font-bold">{automationStats.automated}</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Liquidation Threshold</p>
                <p className="text-white text-2xl font-bold">{LIQUIDATION_THRESHOLD / 100}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>



      {/* Risk Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Active Loan Monitoring</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 py-3 px-4">Loan ID</th>
                <th className="text-left text-gray-400 py-3 px-4">Borrower</th>
                <th className="text-left text-gray-400 py-3 px-4">Property Value</th>
                <th className="text-left text-gray-400 py-3 px-4">Debt</th>
                <th className="text-left text-gray-400 py-3 px-4">LTV</th>
                <th className="text-left text-gray-400 py-3 px-4">Health Factor</th>
                <th className="text-left text-gray-400 py-3 px-4">Risk Level</th>
                <th className="text-left text-gray-400 py-3 px-4">Time to Liquidation</th>
              </tr>
            </thead>
            <tbody>
              {liquidationRisks.map((risk) => (
                <tr key={risk.loanId} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-4 px-4 text-white font-medium">#{risk.loanId}</td>
                  <td className="py-4 px-4 text-gray-300 font-mono text-sm">
                    {risk.borrower.slice(0, 6)}...{risk.borrower.slice(-4)}
                  </td>
                  <td className="py-4 px-4 text-white">{formatCurrency(risk.propertyValue)}</td>
                  <td className="py-4 px-4 text-white">{formatCurrency(risk.debtAmount)}</td>
                  <td className="py-4 px-4">
                    <span className={`${risk.currentLTV > 75 ? 'text-red-400' : risk.currentLTV > 65 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {risk.currentLTV}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={getHealthFactorColor(risk.healthFactor)}>
                      {risk.healthFactor.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.riskLevel)}`}>
                      {risk.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{risk.timeToLiquidation}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Automation Performance</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-green-400 text-2xl font-bold">99.9%</p>
            <p className="text-gray-400 text-sm">Uptime</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-blue-400 text-2xl font-bold">0.002</p>
            <p className="text-gray-400 text-sm">ETH Gas Used</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-purple-400 text-2xl font-bold">12</p>
            <p className="text-gray-400 text-sm">Seconds Avg Response</p>
          </div>
        </div>
      </div>
    </div>
  )
}