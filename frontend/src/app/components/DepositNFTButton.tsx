import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CONTRACT_ADDRESSES, COLLATERAL_VAULT_ABI, PROPERTY_NFT_ABI } from '@/lib/contracts'
import { Lock, Loader2 } from 'lucide-react'

export function DepositNFTButton() {
  const { address } = useAccount()
  const [isDepositing, setIsDepositing] = useState(false)
  const [tokenId, setTokenId] = useState('')
  const [loanId, setLoanId] = useState('')
  const [depositedNFTs, setDepositedNFTs] = useState<Array<{tokenId: number, loanId: number}>>([])

  const { writeContract } = useWriteContract()

  const depositNFT = async () => {
    if (!address || !tokenId || !loanId) return

    setIsDepositing(true)
    try {
      const tokenIdNum = parseInt(tokenId)
      const loanIdNum = parseInt(loanId)

      // First approve the CollateralVault to transfer the NFT
      const approveHash = await writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_NFT,
        abi: PROPERTY_NFT_ABI,
        functionName: 'approve',
        args: [
          CONTRACT_ADDRESSES.COLLATERAL_VAULT,
          BigInt(tokenIdNum)
        ],
      })

      console.log(`Approved NFT ${tokenIdNum} for CollateralVault: ${approveHash}`)

      // Then deposit the NFT as collateral
      const depositHash = await writeContract({
        address: CONTRACT_ADDRESSES.COLLATERAL_VAULT,
        abi: [
          {
            "inputs": [{"name": "tokenId", "type": "uint256"}, {"name": "loanId", "type": "uint256"}],
            "name": "depositNFT",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ] as const,
        functionName: 'depositNFT',
        args: [
          BigInt(tokenIdNum),
          BigInt(loanIdNum)
        ],
      })

      console.log(`Deposited NFT ${tokenIdNum} as collateral for loan ${loanIdNum}: ${depositHash}`)
      
      setDepositedNFTs(prev => [...prev, { tokenId: tokenIdNum, loanId: loanIdNum }])
      setTokenId('')
      setLoanId('')
      
      // Trigger refresh of collateral data
      window.dispatchEvent(new Event('nftDeposited'))
      
    } catch (error) {
      console.error('Error depositing NFT:', error)
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-6 gradient-border glow-effect">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-border">
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Lock className="text-white pulse-animation" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient">Deposit NFT</h3>
          <p className="text-xs text-muted-foreground">Lock NFT as collateral in vault</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">NFT Token ID</label>
          <Input
            type="number"
            placeholder="Enter NFT token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="bg-white/5 border-white/20 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Loan ID</label>
          <Input
            type="number"
            placeholder="Enter loan ID"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            className="bg-white/5 border-white/20 text-white"
          />
        </div>

        <Button 
          onClick={depositNFT}
          disabled={!address || !tokenId || !loanId || isDepositing}
          className="w-full gradient-border glow-effect"
        >
          {isDepositing ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Depositing NFT...</span>
            </div>
          ) : (
            'Deposit NFT as Collateral'
          )}
        </Button>

        {!address && (
          <p className="text-xs text-muted-foreground text-center">
            Connect wallet to deposit NFT
          </p>
        )}
      </div>

      {depositedNFTs.length > 0 && (
        <div className="mt-4 p-3 stats-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Recently Deposited:</p>
          <div className="space-y-1">
            {depositedNFTs.map((deposit, index) => (
              <div key={index} className="text-xs text-white">
                NFT #{deposit.tokenId} → Loan #{deposit.loanId}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}