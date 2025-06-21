
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';

export function useContracts() {
  const { address } = useAccount();
  const [userNFTs, setUserNFTs] = useState(0);
  const [userUSDCBalance, setUserUSDCBalance] = useState(0);

  // Mock data for demo purposes
  useEffect(() => {
    if (address) {
      setUserNFTs(3); // Mock NFT count
      setUserUSDCBalance(25000); // Mock USDC balance
    } else {
      setUserNFTs(0);
      setUserUSDCBalance(0);
    }
  }, [address]);

  return {
    userNFTs,
    userUSDCBalance
  };
}
