import { useState, useEffect } from 'react'
import { useContractEvents } from '@/hooks/use-contract-events'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight, Zap, TrendingUp } from 'lucide-react'

interface TransactionMonitorProps {
  compact?: boolean
}

export function TransactionMonitor({ compact = false }: TransactionMonitorProps) {
  const { transactions } = useContractEvents()
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle
      case 'pending': return Clock  
      case 'failed': return XCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'loan_created': return TrendingUp
      case 'loan_repaid': return ArrowDownRight
      case 'value_updated': return Zap
      case 'interest_payment': return ArrowUpRight
      default: return Zap
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'loan_created': return 'Loan Created'
      case 'loan_repaid': return 'Loan Repaid'
      case 'value_updated': return 'Value Updated'
      case 'interest_payment': return 'Interest Payment'
      default: return 'Transaction'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  if (compact) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {filteredTransactions.slice(0, 3).map((tx) => {
            const StatusIcon = getStatusIcon(tx.status)
            const TypeIcon = getTypeIcon(tx.type)
            const statusColor = getStatusColor(tx.status)
            
            return (
              <div key={tx.hash} className="flex items-center justify-between p-2 bg-gray-900/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-white text-sm">{getTypeLabel(tx.type)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">{formatCurrency(tx.amount)}</span>
                  <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                </div>
              </div>
            )
          })}
        </div>
        {filteredTransactions.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No recent transactions</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Transaction Monitor
          </h3>
          
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'confirmed', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === status
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const StatusIcon = getStatusIcon(tx.status)
              const TypeIcon = getTypeIcon(tx.type)
              const statusColor = getStatusColor(tx.status)
              
              return (
                <div
                  key={tx.hash}
                  className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-5 h-5 text-cyan-400" />
                      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium">{getTypeLabel(tx.type)}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{tx.property}</span>
                        <span>•</span>
                        <span>{formatTime(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(tx.amount)}</p>
                    <p className={`text-xs ${statusColor}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}