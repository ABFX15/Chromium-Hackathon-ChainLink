import { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { propertyService } from '../services/propertyService';
import { useQuery } from '@tanstack/react-query';

export function useProperties() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        data,
        refetch
    } = useQuery({
        queryKey: ['properties', page, pageSize],
        queryFn: () => propertyService.getProperties(page, pageSize),
        // Use mock data in development
        initialData: {
            properties: propertyService.getMockProperties(),
            totalCount: 4,
            page: 1,
            pageSize: 10
        }
    });

    const totalCount = data?.totalCount || 0;

    useEffect(() => {
        async function fetchProperties() {
            try {
                const response = await propertyService.getProperties();
                setProperties(response.properties);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setError('Error fetching properties. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProperties();
    }, []);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const refresh = () => {
        refetch();
    };

    return {
        properties,
        totalCount,
        isLoading,
        error,
        loadMore,
        refresh,
        page,
        pageSize
    };
} 