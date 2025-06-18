import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { PropertyNFT } from '@/types/contracts'

export function usePropertyNFTs() {
  const { address, isConnected } = useAccount()
  const [nfts, setNfts] = useState<PropertyNFT[]>([])
  const [loading, setLoading] = useState(false)
  let mintCount = 0

  // Check localStorage for minted NFTs count
  if (typeof window !== 'undefined' && address) {
    const stored = localStorage.getItem(`mintedNFTs_${address}`)
    mintCount = stored ? parseInt(stored) : 0
  }

  useEffect(() => {
    if (!address || !isConnected) {
      setNfts([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Create demo NFTs for testing (minimum 4 NFTs to showcase the 3D cards)
    const demoCount = Math.max(mintCount, 4)
    const userNFTs: PropertyNFT[] = []
    
    for (let i = 0; i < demoCount; i++) {
      const tokenId = 1000 + i
      const metadata = getMockNFTMetadata(tokenId)

      const nft: PropertyNFT = {
        tokenId,
        owner: address,
        tokenURI: `https://propertyfi.demo/metadata/${tokenId}`,
        name: metadata.name,
        image: metadata.image,
        description: metadata.description,
        propertyValue: 500000 + (i * 100000), // Varying values
        maxLoan: 350000 + (i * 70000), // 70% LTV
        isCollateral: i === 1, // Second NFT is collateral
      }

      userNFTs.push(nft)
    }
    
    setNfts(userNFTs)
    setLoading(false)
  }, [address, isConnected, mintCount])

  const refetch = () => {
    if (!address) return
    
    const stored = localStorage.getItem(`mintedNFTs_${address}`)
    const currentCount = stored ? parseInt(stored) : 0
    
    const userNFTs: PropertyNFT[] = []
    
    for (let i = 0; i < currentCount; i++) {
      const tokenId = 1000 + i
      const metadata = getMockNFTMetadata(tokenId)

      const nft: PropertyNFT = {
        tokenId,
        owner: address,
        tokenURI: `https://propertyfi.demo/metadata/${tokenId}`,
        name: metadata.name,
        image: metadata.image,
        description: metadata.description,
        propertyValue: 500000,
        maxLoan: 350000,
        isCollateral: false,
      }

      userNFTs.push(nft)
    }
    
    setNfts(userNFTs)
  }

  return { nfts, loading, refetch }
}

// Mock NFT metadata for demo purposes
function getMockNFTMetadata(tokenId: number) {
  const properties = [
    {
      name: "Downtown Apartment #1",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Modern luxury apartment in downtown financial district"
    },
    {
      name: "Family House #2", 
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Elegant suburban house with beautiful landscaping"
    },
    {
      name: "Office Building #3",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", 
      description: "Contemporary office building in business district"
    },
    {
      name: "Waterfront Villa #4",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Luxury waterfront villa with panoramic views"
    }
  ]

  return properties[(tokenId - 1) % properties.length]
}