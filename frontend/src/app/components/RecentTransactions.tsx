'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { ArrowRight, ArrowDown, ArrowUp, RefreshCw, ExternalLink } from 'lucide-react'
import { formatCurrency, formatAddress } from '@/lib/utils'
import { useContractEvents } from '@/hooks/use-contract-events'

export function RecentTransactions() {
  const { transactions } = useContractEvents()

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'loan_created':
        return <ArrowDown className="text-green-400 text-sm" />
      case 'loan_repaid':
        return <ArrowUp className="text-yellow-400 text-sm" />
      case 'value_updated':
        return <RefreshCw className="text-blue-400 text-sm" />
      case 'interest_payment':
        return <ArrowUp className="text-yellow-400 text-sm" />
      default:
        return <ArrowRight className="text-gray-400 text-sm" />
    }
  }

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'loan_created':
        return 'Loan Created'
      case 'loan_repaid':
        return 'Loan Repaid'
      case 'value_updated':
        return 'Value Updated'
      case 'interest_payment':
        return 'Interest Payment'
      default:
        return 'Transaction'
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <div className="mt-8">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">Recent Transactions</CardTitle>
            <Button variant="ghost" className="text-primary-400 hover:text-primary-300 text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-dark-400 font-medium text-sm py-3">Type</th>
                    <th className="text-left text-dark-400 font-medium text-sm py-3">Property</th>
                    <th className="text-left text-dark-400 font-medium text-sm py-3">Amount</th>
                    <th className="text-left text-dark-400 font-medium text-sm py-3">Status</th>
                    <th className="text-left text-dark-400 font-medium text-sm py-3">Date</th>
                    <th className="text-left text-dark-400 font-medium text-sm py-3">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <span className="text-white font-medium text-sm">
                            {getTransactionType(tx.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-dark-300 text-sm">{tx.property}</td>
                      <td className="py-4 text-white font-mono text-sm">{formatCurrency(tx.amount)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-dark-300 text-sm">{getTimeAgo(tx.timestamp)}</td>
                      <td className="py-4">
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm font-mono flex items-center"
                        >
                          {formatAddress(tx.hash)}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
