'use client'

import { Button } from '@/components/ui/button'
import { formatCurrency, getHealthFactorColor, getHealthFactorWidth } from '@/lib/utils'
import { Loan } from '@/types/contracts'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI } from '@/lib/contracts'
import { useToast } from '@/hooks/use-toast'
import { AILoanDetails } from "./AILoanDetails";
import { Brain } from "lucide-react";

interface LoanCardProps {
  loan: Loan
}

export function LoanCard({ loan }: LoanCardProps) {
  const { writeContract } = useWriteContract()
  const { toast } = useToast()

  const handleRepayLoan = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LOAN_MANAGER_ABI,
        functionName: 'repayLoan',
        args: [BigInt(loan.loanId)],
      })

      toast({
        title: "Loan Repayment Initiated",
        description: "Your loan repayment transaction has been submitted",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Repayment Failed",
        description: "There was an error processing your loan repayment",
        variant: "destructive",
      })
    }
  }

  const isLowHealthFactor = loan.healthFactor < 1.5

  return (
    <div className={`bg-gradient-to-br from-black/90 to-cyan-950/20 border p-4 font-mono text-sm rounded-lg backdrop-blur-sm ${
      isLowHealthFactor ? 'border-red-500/50' : 'border-cyan-500/30'
    }`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
          <span className="text-cyan-400">loan_id: {loan.loanId}</span>
        </div>
        <span className={`text-xs px-3 py-1 border rounded-lg transition-colors duration-200 ${
          loan.isActive 
            ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 text-cyan-300' 
            : 'border-red-500/50 bg-gradient-to-r from-red-500/20 to-red-400/20 text-red-300'
        }`}>
          {loan.isActive ? 'active' : 'inactive'}
        </span>
      </div>

      {/* Loan Details */}
      <div className="space-y-3 text-xs">
        <div className="text-cyan-300 font-bold text-sm">{loan.propertyName}</div>
        <div className="text-cyan-500/70">token_id: {loan.tokenId}</div>
        <div className="text-sm text-gray-400">
          {loan.propertyName} Value: ${loan.propertyValue?.toLocaleString() || 'Unknown'}
        </div>

        <div className="space-y-2 pt-3 border-t border-cyan-500/20 bg-gradient-to-r from-cyan-900/10 to-blue-900/10 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-cyan-500/70">borrowed:</span>
            <span className="text-cyan-300 font-semibold">{formatCurrency(loan.debt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyan-500/70">total_due:</span>
            <span className="text-yellow-300 font-semibold">{formatCurrency(loan.totalDue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyan-500/70">interest_rate:</span>
            <span className="text-cyan-300">{loan.interest}% APR</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyan-500/70">health_factor:</span>
            <span className={`font-semibold ${isLowHealthFactor ? 'text-red-300' : 'text-cyan-300'}`}>
              {loan.healthFactor.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Health Factor Bar */}
        <div className="pt-3">
          <div className="text-cyan-500/70 text-xs mb-1">health status:</div>
          <div className="w-full bg-cyan-900/30 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-2 transition-all duration-500 rounded-full ${
                isLowHealthFactor 
                  ? 'bg-gradient-to-r from-red-500 to-red-400' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-400'
              }`}
              style={{ width: `${Math.min(getHealthFactorWidth(loan.healthFactor), 100)}%` }}
            />
          </div>
        </div>

        {loan.isActive && (
          <div className="pt-4">
            <Button 
              onClick={handleRepayLoan}
              className="w-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 
                         hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 font-mono text-xs py-2 rounded-lg
                         transition-all duration-200 hover:shadow-lg hover:shadow-cyan-400/20"
            >
              ./repay_loan
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}