import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { propertyService } from '../services/propertyService';
import { Property } from '../types/property';

export function usePropertyNFTs() {
    const [nfts, setNfts] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isConnected } = useAccount();

    useEffect(() => {
        async function loadProperties() {
            try {
                const { properties } = await propertyService.getProperties();
                setNfts(properties);
            } catch (error) {
                console.error('Error loading properties:', error);
                // Fallback to empty array to ensure marketplace shows
                setNfts([]);
            } finally {
                setIsLoading(false);
            }
        }

        // Always load properties when component mounts, regardless of wallet connection
        loadProperties();
    }, [isConnected]);

    return { nfts, isLoading };
}