import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CONTRACT_ADDRESSES, PROPERTY_NFT_ABI } from '@/lib/contracts'

const PROPERTY_ORACLE_ABI = [
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}, {"name": "value", "type": "uint256"}],
    "name": "setPropertyValue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const
import { Plus, Loader2 } from 'lucide-react'

export function MintNFTButton() {
  const { address } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  const [mintedTokens, setMintedTokens] = useState<number[]>([])

  const { writeContract } = useWriteContract()

  const mintPropertyNFT = async () => {
    if (!address) return

    setIsMinting(true)
    try {
      const tokenId = Date.now() % 10000 // Simple token ID generation
      
      // Mint NFT with property metadata
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_NFT,
        abi: PROPERTY_NFT_ABI,
        functionName: 'safeMint',
        args: [
          address,
          BigInt(tokenId),
          `https://propertyfi.demo/metadata/${tokenId}`
        ],
      })

      console.log(`Minting NFT ${tokenId} with transaction: ${hash}`)
      
      // Set property value in oracle (simulate $500K property)
      const valueHash = await writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_ORACLE,
        abi: PROPERTY_ORACLE_ABI,
        functionName: 'setPropertyValue',
        args: [
          BigInt(tokenId),
          BigInt(500000 * 1e6) // $500K in 6 decimal format
        ],
      })

      console.log(`Set property value for token ${tokenId} with transaction: ${valueHash}`)
      
      // Track minted NFTs in localStorage
      const currentCount = localStorage.getItem(`mintedNFTs_${address}`)
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1
      localStorage.setItem(`mintedNFTs_${address}`, newCount.toString())
      
      setMintedTokens(prev => [...prev, tokenId])
      
      // Trigger a page refresh to update portfolio
      window.dispatchEvent(new Event('nftMinted'))
      
    } catch (error) {
      console.error('Error minting NFT:', error)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-6 gradient-border glow-effect">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-border">
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Plus className="text-white pulse-animation" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient">Mint Demo NFT</h3>
          <p className="text-xs text-muted-foreground">Create property NFT for testing</p>
        </div>
      </div>

      <Button 
        onClick={mintPropertyNFT}
        disabled={!address || isMinting}
        className="w-full gradient-border glow-effect"
      >
        {isMinting ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Minting NFT...</span>
          </div>
        ) : (
          'Mint Property NFT'
        )}
      </Button>

      {mintedTokens.length > 0 && (
        <div className="mt-4 p-3 stats-card rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Recently Minted:</p>
          <div className="space-y-1">
            {mintedTokens.map((tokenId) => (
              <div key={tokenId} className="text-xs text-white">
                Property NFT #{tokenId} - $500,000 value
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}