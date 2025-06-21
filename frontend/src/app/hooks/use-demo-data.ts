import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { PropertyNFT, Loan } from '@/types/contracts'
import { getPropertyData, DEMO_PROPERTIES } from '@/lib/rentcast'

export function useDemoData() {
  const { address } = useAccount()
  const [demoNFTs, setDemoNFTs] = useState<PropertyNFT[]>([])
  const [demoLoans, setDemoLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)

  const generateDemoData = async () => {
    if (!address) return

    setLoading(true)

    try {
      // Generate demo NFTs with real RentCast data
      const nfts: PropertyNFT[] = []

      for (let i = 0; i < 4; i++) {
        const propertyAddress = DEMO_PROPERTIES[i % DEMO_PROPERTIES.length]

        // Fetch real property data from RentCast
        const rentCastData = await getPropertyData(propertyAddress)

        const baseValue = rentCastData?.valueEstimate || (200000 + i * 75000)
        const nft: PropertyNFT = {
          tokenId: i + 1,
          owner: address,
          tokenURI: `https://propertyfi.demo/metadata/${i + 1}`,
          name: rentCastData?.description || `Property #${i + 1}`,
          image: `https://images.unsplash.com/photo-${1545324418 + i * 100000}-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`,
          description: rentCastData?.description || `Real estate property in ${rentCastData?.city || 'Downtown'}, ${rentCastData?.state || 'NY'}`,
          propertyValue: baseValue,
          maxLoan: Math.floor(baseValue * 0.7), // 70% LTV
          isCollateral: i === 1, // One property is being used as collateral
        }

        nfts.push(nft)
      }

      setDemoNFTs(nfts)

      // Generate demo loans
      interface Loan {
        loanId: number;
        tokenId: number;
        debt: number;
        startTimestamp: number;
        borrower: string;
        isActive: boolean;
        interest: number;
        totalDue: number;
        healthFactor: number;
        propertyName: string;
        propertyValue: number; // Add property value field
        riskScore: number;
        riskCategory: 'low' | 'medium' | 'high';
        aiAssessed: boolean;
      }
      const loans: Loan[] = [
        {
          loanId: 1,
          tokenId: 2, // Second NFT is collateral
          debt: 140000, // 70% of $200k property
          startTimestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
          borrower: address,
          isActive: true,
          interest: 7000, // $7k interest accrued
          totalDue: 147000,
          healthFactor: 1.85, // Good health factor
          propertyName: nfts[1]?.name || 'Property #2',
          propertyValue: nfts[1]?.propertyValue || 200000,
          riskScore: 32,
          riskCategory: 'low',
          aiAssessed: true
        },
        {
          loanId: 2,
          tokenId: 3, // Third NFT is collateral
          debt: 180000, // 70% of $250k property
          startTimestamp: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
          borrower: address,
          isActive: true,
          interest: 9000, // $9k interest accrued
          totalDue: 189000,
          healthFactor: 1.50, // Medium health factor
          propertyName: nfts[2]?.name || 'Property #3',
          propertyValue: nfts[2]?.propertyValue || 250000,
          riskScore: 58,
          riskCategory: 'medium',
          aiAssessed: true
        },
        {
          loanId: 3,
          tokenId: 4, // Fourth NFT is collateral
          debt: 350000, // 70% of $500k property
          startTimestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
          borrower: address,
          isActive: true,
          interest: 2500, // $2.5k interest accrued
          totalDue: 352500,
          healthFactor: 1.25, // Lower health factor
          propertyName: nfts[3]?.name || 'Property #4',
          propertyValue: nfts[3]?.propertyValue || 500000, // Add explicit property value
          riskScore: 78,
          riskCategory: 'high',
          aiAssessed: true
        }
      ]

      setDemoLoans(loans)

    } catch (error) {
      console.error('Error generating demo data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address && demoNFTs.length === 0) {
      generateDemoData()
    }
  }, [address])

  return {
    demoNFTs,
    demoLoans,
    loading,
    refetch: generateDemoData
  }
}