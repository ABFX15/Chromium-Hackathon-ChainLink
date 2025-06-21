import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Loan } from '@/types/contracts'
import { calculateHealthFactor } from '@/lib/utils'

export function useLoans() {
  const { address, isConnected } = useAccount()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)

  const loadLoans = () => {
    if (!address || !isConnected) {
      setLoans([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Check localStorage for created loans
    const storedLoans = localStorage.getItem(`createdLoans_${address}`)
    const loanCount = storedLoans ? parseInt(storedLoans) : 0

    console.log('Loading loans for address:', address, 'loan count:', loanCount)

    const userLoans: Loan[] = []

    for (let i = 0; i < loanCount; i++) {
      const loanId = i + 1
      const tokenId = 1000 + i // Match with minted NFT token IDs
      const debt = 350000 // $350K borrowed
      const daysElapsed = i + 1 // Each loan is 1 day older
      const annualRate = 0.05 // 5% APR
      const dailyRate = annualRate / 365
      const accruedInterest = debt * dailyRate * daysElapsed
      const totalDue = debt + accruedInterest
      const propertyValue = getMockPropertyValue(tokenId)
      const healthFactor = calculateHealthFactor(propertyValue, totalDue)

      const loan: Loan = {
        loanId,
        tokenId,
        debt,
        startTimestamp: Date.now() / 1000 - (daysElapsed * 86400), // Each loan 1 day apart
        borrower: address,
        isActive: true,
        interest: accruedInterest,
        totalDue,
        healthFactor,
        propertyName: getMockPropertyName(tokenId),
      }

      userLoans.push(loan)
    }

    setLoans(userLoans)
    setLoading(false)
  }

  useEffect(() => {
    loadLoans()
  }, [address, isConnected])

  const refetch = () => {
    loadLoans()
  }

  return { loans, loading, refetch }
}

// Mock helper functions
function getMockPropertyValue(tokenId: number): number {
  const values = [850000, 1200000, 2800000, 3500000]
  return values[(tokenId - 1) % values.length]
}

function getMockPropertyName(tokenId: number): string {
  const names = ["Downtown Apartment #1", "Family House #2", "Office Building #3", "Waterfront Villa #4"]
  return names[(tokenId - 1) % names.length]
}

// Helper function to read contract data
async function readContract(params: any) {
  // This would be implemented using viem's readContract
  // For now, return mock data for demonstration
  if (params.functionName === 'loans') {
    // Mock loan data structure
    return [
      BigInt(1), // loanId
      BigInt(2), // tokenId  
      BigInt(450000 * 1e6), // debt
      BigInt(Date.now() / 1000 - 86400), // startTimestamp (1 day ago)
      '0x1234567890123456789012345678901234567890', // borrower
      true // isActive
    ]
  }
  if (params.functionName === 'calculateInterest') {
    // Mock interest calculation - 5% APR for 1 day
    const principal = 450000
    const dailyRate = 0.05 / 365
    const interest = principal * dailyRate
    return BigInt(Math.floor(interest * 1e6))
  }
  return null
}
