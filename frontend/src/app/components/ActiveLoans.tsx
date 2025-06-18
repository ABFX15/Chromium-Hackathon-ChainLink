'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoanCard } from './LoanCard'
import { LoanHealthDashboard } from './LoanHealthDashboard'
import { useLoans } from '@/hooks/use-loans'

export function ActiveLoans() {
  const { isConnected } = useAccount()
  const { loans, loading, refetch } = useLoans()

  // Listen for loan creation events
  useEffect(() => {
    const handleLoanCreated = () => {
      refetch()
    }

    window.addEventListener('loanCreated', handleLoanCreated)
    return () => window.removeEventListener('loanCreated', handleLoanCreated)
  }, [refetch])

  if (!isConnected) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">Connect wallet to view loans</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="loan-card rounded-lg p-4 border border-primary-500/20">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeLoans = loans.filter(loan => loan.isActive)

  return (
    <div className="space-y-6">
      {/* Loan Health Dashboard */}
      <LoanHealthDashboard />
      
      {/* Active Loans List */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Active Loans</CardTitle>
            <span className="text-sm text-dark-400">{activeLoans.length} active</span>
          </div>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground text-sm">No active loans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <LoanCard key={loan.loanId} loan={loan} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
