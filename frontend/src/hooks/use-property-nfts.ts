import { useEffect, useState } from 'react';
import { useContracts } from './use-contracts';
import { propertyService } from '../services/propertyService';
import { Property } from '../types/property';

export function usePropertyNfts() {
    const [propertyNfts, setPropertyNfts] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userNFTs } = useContracts();

    useEffect(() => {
        async function loadProperties() {
            try {
                const { properties } = await propertyService.getProperties();
                // Filter only owned properties
                setPropertyNfts(properties);
            } catch (error) {
                console.error('Error loading properties:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (userNFTs > 0) {
            loadProperties();
        } else {
            setPropertyNfts([]);
            setIsLoading(false);
        }
    }, [userNFTs]);

    return { propertyNfts, isLoading };
} 