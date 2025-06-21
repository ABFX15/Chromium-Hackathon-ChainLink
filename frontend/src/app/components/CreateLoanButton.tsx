import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI, PROPERTY_NFT_ABI } from '@/lib/contracts'
import { CreditCard, Loader2 } from 'lucide-react'
import { usePropertyNFTs } from '@/hooks/use-property-nfts'

export function CreateLoanButton({ tokenId }: { tokenId?: number }) {
  const { address } = useAccount()
  const [isCreating, setIsCreating] = useState(false)
  const [createdLoans, setCreatedLoans] = useState<number[]>([])
  const { nfts } = usePropertyNFTs()

  const { writeContract } = useWriteContract()

  // Use first available NFT if no tokenId provided
  const availableTokenId = tokenId || (nfts.length > 0 ? nfts[0].tokenId : null)

  const createLoan = async () => {
    if (!address || !availableTokenId) return

    setIsCreating(true)
    try {
      // First approve the loan manager to use the NFT as collateral
      const approveHash = await writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_NFT,
        abi: PROPERTY_NFT_ABI,
        functionName: 'approve',
        args: [
          CONTRACT_ADDRESSES.LOAN_MANAGER,
          BigInt(availableTokenId)
        ],
      })

      console.log(`Approved NFT ${availableTokenId} for loan manager: ${approveHash}`)

      // Create loan for 70% of property value ($350K for $500K property)
      const loanHash = await writeContract({
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LOAN_MANAGER_ABI,
        functionName: 'createLoan',
        args: [
          BigInt(availableTokenId),
          BigInt(350000 * 1e6) // $350K in 6 decimal format
        ],
      })

      console.log(`Created loan for token ${availableTokenId}: ${loanHash}`)

      // Track created loans in localStorage
      const currentLoans = localStorage.getItem(`createdLoans_${address}`)
      const newLoanCount = currentLoans ? parseInt(currentLoans) + 1 : 1
      localStorage.setItem(`createdLoans_${address}`, newLoanCount.toString())

      setCreatedLoans(prev => [...prev, availableTokenId])

      // Trigger refresh of loan data
      window.dispatchEvent(new Event('loanCreated'))

    } catch (error) {
      console.error('Error creating loan:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-6 gradient-border glow-effect">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-border">
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <CreditCard className="text-white pulse-animation" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient">Create Loan</h3>
          <p className="text-xs text-muted-foreground">Borrow against your property NFT</p>
        </div>
      </div>

      <Button 
        onClick={createLoan}
        disabled={!address || !availableTokenId || isCreating}
        className="w-full gradient-border glow-effect"
      >
        {isCreating ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating Loan...</span>
          </div>
        ) : (
          `Create $350K Loan ${availableTokenId ? `(NFT #${availableTokenId})` : ''}`
        )}
      </Button>

      {!availableTokenId && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Mint a property NFT first to create a loan
        </p>
      )}

      {createdLoans.length > 0 && (
        <div className="mt-4 p-3 stats-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Active Loans:</p>
          <div className="space-y-1">
            {createdLoans.map((loanTokenId) => (
              <div key={loanTokenId} className="text-xs text-white">
                Loan for NFT #{loanTokenId} - $350,000 borrowed
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}