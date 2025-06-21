
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface PropertyNFT {
  tokenId: number;
  name: string;
  image: string;
  location: string;
  price: number;
  description: string;
}

export function usePropertyNFTs() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<PropertyNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);
      
      // Mock data for demo purposes
      setTimeout(() => {
        setNfts([
          {
            tokenId: 1,
            name: "Downtown Apartment",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
            location: "Manhattan, NY",
            price: 450000,
            description: "Modern luxury apartment in the heart of Manhattan"
          },
          {
            tokenId: 2,
            name: "Suburban Villa",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
            location: "Beverly Hills, CA",
            price: 750000,
            description: "Stunning villa with pool and garden"
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } else {
      setNfts([]);
    }
  }, [isConnected, address]);

  return {
    nfts,
    isLoading
  };
}
