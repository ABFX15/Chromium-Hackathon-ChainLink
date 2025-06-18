import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI, COLLATERAL_VAULT_ABI, MOCK_USDC_ABI } from '@/lib/contracts'
import { Vault, DollarSign, RefreshCw, Unlock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CollateralDeposit {
  tokenId: number
  loanId: number
  collateralValue: number
  timestamp: number
  borrower: string
  isActive: boolean
}

export function CollateralManagement() {
  const { address, isConnected } = useAccount()
  const [deposits, setDeposits] = useState<CollateralDeposit[]>([])
  const [loading, setLoading] = useState(false)

  const { writeContract } = useWriteContract()

  // Get user's active loans to find collateral
  const { data: nextLoanId } = useReadContract({
    address: CONTRACT_ADDRESSES.LOAN_MANAGER,
    abi: LOAN_MANAGER_ABI,
    functionName: 'nextLoanId',
  })

  // Mock data for demonstration
  useEffect(() => {
    if (!address || !isConnected) {
      setDeposits([])
      return
    }

    // Check localStorage for deposited collateral
    const storedLoans = localStorage.getItem(`createdLoans_${address}`)
    const loanCount = storedLoans ? parseInt(storedLoans) : 0

    const mockDeposits: CollateralDeposit[] = []

    for (let i = 0; i < loanCount; i++) {
      const deposit: CollateralDeposit = {
        tokenId: 1000 + i,
        loanId: i + 1,
        collateralValue: 500000, // $500K property value
        timestamp: Date.now() / 1000 - (i * 86400), // Each deposit 1 day apart
        borrower: address,
        isActive: true
      }
      mockDeposits.push(deposit)
    }

    setDeposits(mockDeposits)
  }, [address, isConnected])

  const repayLoanAndWithdraw = async (loanId: number, tokenId: number) => {
    if (!address) return

    setLoading(true)
    try {
      // First approve USDC for loan repayment
      const debtAmount = 350000 // $350K loan amount
      const interestAmount = debtAmount * 0.05 * (1/365) // Daily interest
      const totalRepayment = (debtAmount + interestAmount) * 1e6 // Convert to 6 decimals

      // Approve USDC
      await writeContract({
        address: CONTRACT_ADDRESSES.MOCK_USDC,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [
          CONTRACT_ADDRESSES.LOAN_MANAGER,
          BigInt(totalRepayment)
        ],
      })

      // Repay loan
      await writeContract({
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LOAN_MANAGER_ABI,
        functionName: 'repayLoan',
        args: [BigInt(loanId)],
      })

      console.log(`Repaid loan ${loanId} and withdrew NFT ${tokenId}`)

      // Update local state
      setDeposits(prev => prev.filter(d => d.loanId !== loanId))

      // Update loan tracking
      const currentLoans = localStorage.getItem(`createdLoans_${address}`)
      const newLoanCount = currentLoans ? Math.max(0, parseInt(currentLoans) - 1) : 0
      localStorage.setItem(`createdLoans_${address}`, newLoanCount.toString())

      // Trigger refresh events
      window.dispatchEvent(new Event('loanRepaid'))

    } catch (error) {
      console.error('Error repaying loan:', error)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    // Refresh collateral data
    if (!address) return
    
    const storedLoans = localStorage.getItem(`createdLoans_${address}`)
    const loanCount = storedLoans ? parseInt(storedLoans) : 0

    const mockDeposits: CollateralDeposit[] = []

    for (let i = 0; i < loanCount; i++) {
      const deposit: CollateralDeposit = {
        tokenId: 1000 + i,
        loanId: i + 1,
        collateralValue: 500000,
        timestamp: Date.now() / 1000 - (i * 86400),
        borrower: address,
        isActive: true
      }
      mockDeposits.push(deposit)
    }

    setDeposits(mockDeposits)
  }

  // Listen for loan events
  useEffect(() => {
    const handleLoanRepaid = () => refetch()
    const handleLoanCreated = () => refetch()

    window.addEventListener('loanRepaid', handleLoanRepaid)
    window.addEventListener('loanCreated', handleLoanCreated)
    
    return () => {
      window.removeEventListener('loanRepaid', handleLoanRepaid)
      window.removeEventListener('loanCreated', handleLoanCreated)
    }
  }, [])

  if (!isConnected) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Collateral Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">Connect wallet to view collateral</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Vault className="w-5 h-5" />
            Collateral Management
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="text-primary-400 hover:text-primary-300"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {deposits.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">No collateral deposits found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deposits.map((deposit) => (
              <div
                key={deposit.loanId}
                className="stats-card rounded-lg p-4 border border-primary-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">Property NFT #{deposit.tokenId}</h4>
                    <p className="text-xs text-muted-foreground">
                      Deposited {new Date(deposit.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Active Collateral
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Collateral Value</p>
                    <p className="text-white font-medium">
                      {formatCurrency(deposit.collateralValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loan ID</p>
                    <p className="text-white font-medium">#{deposit.loanId}</p>
                  </div>
                </div>

                <Button
                  onClick={() => repayLoanAndWithdraw(deposit.loanId, deposit.tokenId)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  size="sm"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Repay Loan & Withdraw NFT
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}