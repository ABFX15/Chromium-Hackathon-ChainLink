
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export interface LoanHealth {
  currentLTV: number
  healthFactor: number
  riskLevel: 'HEALTHY' | 'WARNING' | 'SOFT_LIQUIDATION' | 'HARD_LIQUIDATION' | 'LOADING'
  timeToLiquidation?: number
  propertyValue: number
  totalDebt: number
}

const WARNING_THRESHOLD = 8500 // 85%
const SOFT_LIQUIDATION_THRESHOLD = 8000 // 80%
const HARD_LIQUIDATION_THRESHOLD = 7500 // 75%

export function useLoanHealth(loanId: number) {
  const { address, isConnected } = useAccount()
  const [health, setHealth] = useState<LoanHealth | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address || !isConnected || !loanId) {
      setHealth(null)
      return
    }

    setLoading(true)

    // Mock loan health calculation
    const calculateLoanHealth = () => {
      // Mock property values and debt amounts
      const propertyValue = 500000 + (loanId * 100000) // $500K-$800K range
      const principalAmount = 350000 // $350K borrowed
      const daysElapsed = loanId // Each loan is older
      const annualRate = 0.05 // 5% APR
      const dailyRate = annualRate / 365
      const accruedInterest = principalAmount * dailyRate * daysElapsed
      const totalDebt = principalAmount + accruedInterest

      // Calculate LTV (Loan-to-Value ratio)
      const currentLTV = (totalDebt / propertyValue) * 10000 // Convert to basis points
      
      // Calculate health factor (inverse of LTV risk)
      const healthFactor = propertyValue / totalDebt

      // Determine risk level
      let riskLevel: LoanHealth['riskLevel'] = 'HEALTHY'
      let timeToLiquidation: number | undefined

      if (currentLTV >= HARD_LIQUIDATION_THRESHOLD) {
        riskLevel = 'HARD_LIQUIDATION'
        timeToLiquidation = 0.5 // 30 minutes
      } else if (currentLTV >= SOFT_LIQUIDATION_THRESHOLD) {
        riskLevel = 'SOFT_LIQUIDATION'
        timeToLiquidation = 2 // 2 hours
      } else if (currentLTV >= WARNING_THRESHOLD) {
        riskLevel = 'WARNING'
        timeToLiquidation = 24 // 24 hours
      } else {
        riskLevel = 'HEALTHY'
        timeToLiquidation = undefined
      }

      const loanHealth: LoanHealth = {
        currentLTV: currentLTV / 100, // Convert back to percentage
        healthFactor,
        riskLevel,
        timeToLiquidation,
        propertyValue,
        totalDebt
      }

      setHealth(loanHealth)
      setLoading(false)
    }

    // Simulate async operation
    const timeout = setTimeout(calculateLoanHealth, 500)
    
    return () => clearTimeout(timeout)
  }, [loanId, address, isConnected])

  return { health, loading }
}
