import { useEffect, useState } from 'react';
import { useContracts } from './use-contracts';
import { propertyService } from '../services/propertyService';
import { Property } from '../types/property';

export function usePropertyNFTs() {
    const [nfts, setNfts] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userNFTs } = useContracts();

    useEffect(() => {
        async function loadProperties() {
            try {
                const { properties } = await propertyService.getProperties();
                setNfts(properties);
            } catch (error) {
                console.error('Error loading properties:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (userNFTs > 0) {
            loadProperties();
        } else {
            setNfts([]);
            setIsLoading(false);
        }
    }, [userNFTs]);

    return { nfts, isLoading };
}