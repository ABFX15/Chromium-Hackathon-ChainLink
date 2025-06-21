import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PropertyNFT } from '../types/contracts';

// Mock property data for marketplace
const MOCK_PROPERTIES: PropertyNFT[] = [
  {
    tokenId: 1,
    name: "Downtown Luxury Apartment",
    description: "Modern apartment in the heart of downtown with stunning city views",
    image: "/properties/apartment-2.jpg",
    propertyValue: 850000,
    isCollateral: false,
    location: "New York, NY",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    propertyType: "Apartment",
    coordinates: { lat: 40.7831, lng: -73.9712 }
  },
  {
    tokenId: 2,
    name: "Suburban Family Home",
    description: "Spacious family home with large backyard in quiet neighborhood",
    image: "/properties/luxury-home-1.jpg",
    propertyValue: 650000,
    isCollateral: false,
    location: "Austin, TX",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2500,
    propertyType: "House",
    coordinates: { lat: 30.2672, lng: -97.7431 }
  },
  {
    tokenId: 3,
    name: "Commercial Office Building",
    description: "Modern office building in business district with high rental yield",
    image: "/properties/commercial-3.jpg",
    propertyValue: 2800000,
    isCollateral: false,
    location: "San Francisco, CA",
    bedrooms: 0,
    bathrooms: 10,
    sqft: 15000,
    propertyType: "Commercial",
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    tokenId: 4,
    name: "Waterfront Villa",
    description: "Luxury villa with private beach access and panoramic ocean views",
    image: "/properties/villa-4.jpg",
    propertyValue: 3500000,
    isCollateral: false,
    location: "Miami, FL",
    bedrooms: 6,
    bathrooms: 5,
    sqft: 4500,
    propertyType: "Villa",
    coordinates: { lat: 25.7617, lng: -80.1918 }
  }
];

export function usePropertyNFTs() {
    const [nfts, setNfts] = useState<PropertyNFT[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { address } = useAccount();

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            // Check for user's minted NFTs and mark them as collateral if they have loans
            const userMintedNFTs = address ? localStorage.getItem(`mintedNFTs_${address}`) : '0';
            const userCreatedLoans = address ? localStorage.getItem(`createdLoans_${address}`) : '0';
            const mintedCount = parseInt(userMintedNFTs || '0');
            const loanCount = parseInt(userCreatedLoans || '0');

            const updatedNFTs = MOCK_PROPERTIES.map((nft, index) => {
                // Mark user's minted NFTs as owned and potentially collateralized
                if (index < mintedCount) {
                    return {
                        ...nft,
                        tokenId: 1000 + index, // Use consistent token IDs
                        isCollateral: index < loanCount, // First few are used as collateral
                    };
                }
                return nft;
            });

            setNfts(updatedNFTs);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [address]);

    return { nfts, isLoading };
}