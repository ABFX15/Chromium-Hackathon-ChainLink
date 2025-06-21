
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface UserNFT {
  tokenId: number;
  name: string;
  image: string;
  value: number;
}

export function useContracts() {
  const { address, isConnected } = useAccount();
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [userUSDCBalance, setUserUSDCBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);
      
      // Mock data for demo purposes
      setTimeout(() => {
        setUserNFTs([
          {
            tokenId: 1,
            name: "Downtown Apartment NFT",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
            value: 450000
          },
          {
            tokenId: 2,
            name: "Suburban Villa NFT", 
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
            value: 750000
          }
        ]);
        
        setUserUSDCBalance(25000);
        setIsLoading(false);
      }, 1000);
    } else {
      setUserNFTs([]);
      setUserUSDCBalance(0);
    }
  }, [isConnected, address]);

  return {
    userNFTs,
    userUSDCBalance,
    isLoading
  };
}
