export type PropertyType = 'residential' | 'commercial' | 'industrial';
export type PropertyStatus = 'available' | 'funded' | 'liquidated';

export interface PropertyMetrics {
    sqft: number;
    yearBuilt: number;
    lastValuation: string;
}

export interface Property {
    id: string;
    tokenId: string;
    name: string;
    description: string;
    value: number;
    location: string;
    imageUrl: string;
    type: PropertyType;
    status: PropertyStatus;
    metrics: PropertyMetrics;
}

export interface PropertyResponse {
    properties: Property[];
    totalCount: number;
    page: number;
    pageSize: number;
} 