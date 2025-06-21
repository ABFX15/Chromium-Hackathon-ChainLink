
import { useState, useEffect } from 'react';

interface PropertyNFT {
  id: string;
  name: string;
  image: string;
  tokenId: number;
  owner: string;
}

export function usePropertyNFTs() {
  const [propertyNFTs, setPropertyNFTs] = useState<PropertyNFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockNFTs: PropertyNFT[] = [
      {
        id: '1',
        name: 'Luxury Downtown Apartment',
        image: '/properties/apartment-2.jpg',
        tokenId: 1,
        owner: '0x1234567890123456789012345678901234567890'
      },
      {
        id: '2',
        name: 'Beachfront Villa',
        image: '/properties/villa-4.jpg',
        tokenId: 2,
        owner: '0x1234567890123456789012345678901234567890'
      }
    ];

    setTimeout(() => {
      setPropertyNFTs(mockNFTs);
      setLoading(false);
    }, 1000);
  }, []);

  return { propertyNFTs, loading };
}
