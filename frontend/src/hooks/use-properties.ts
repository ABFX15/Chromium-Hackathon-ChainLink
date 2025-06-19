import { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { propertyService } from '../services/propertyService';
import { useQuery } from '@tanstack/react-query';

export function useProperties() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const {
        data,
        isLoading,
        error,
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

    const properties = data?.properties || [];
    const totalCount = data?.totalCount || 0;

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