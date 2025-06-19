export interface PropertyMetrics {
    sqft: number;
    yearBuilt: number;
    bedrooms?: number;
    bathrooms?: number;
    lotSize?: number;
    parkingSpaces?: number;
    floors?: number;
}

export interface Property {
    id: string;
    tokenId: string;
    name: string;
    description: string;
    value: number;
    location: string;
    imageUrl: string;
    type: string;
    status: string;
    metrics: PropertyMetrics;
    isCollateral?: boolean;
}

export interface PropertyResponse {
    properties: Property[];
    totalCount: number;
    page: number;
    pageSize: number;
}
