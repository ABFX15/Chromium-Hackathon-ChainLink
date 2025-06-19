import { Property, PropertyResponse } from '../types/property';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const mockProperties: Property[] = [
    {
        id: "1",
        tokenId: "1",
        name: "Luxury Waterfront Villa",
        description: "Stunning 5-bedroom waterfront villa with private dock, infinity pool, and panoramic ocean views. Features smart home technology and sustainable design.",
        value: 2500000,
        location: "Miami Beach, FL",
        imageUrl: "/properties/luxury-home-1.jpg",
        type: "residential",
        status: "available",
        metrics: {
            sqft: 6500,
            bedrooms: 5,
            bathrooms: 6,
            yearBuilt: 2021,
            lotSize: 0.75
        }
    },
    {
        id: "2",
        tokenId: "2",
        name: "Downtown High-Rise Apartment",
        description: "Modern 2-bedroom apartment in the heart of downtown. Floor-to-ceiling windows, premium finishes, and access to luxury building amenities.",
        value: 850000,
        location: "Chicago, IL",
        imageUrl: "/properties/apartment-2.jpg",
        type: "residential",
        status: "available",
        metrics: {
            sqft: 1800,
            bedrooms: 2,
            bathrooms: 2,
            yearBuilt: 2019,
            lotSize: 0
        }
    },
    {
        id: "3",
        tokenId: "3",
        name: "Prime Commercial Space",
        description: "Class A office building with prime location. Recently renovated with modern amenities, secure access, and ample parking.",
        value: 4200000,
        location: "Austin, TX",
        imageUrl: "/properties/commercial-3.jpg",
        type: "commercial",
        status: "available",
        metrics: {
            sqft: 15000,
            yearBuilt: 2015,
            lotSize: 1.2,
            parkingSpaces: 50,
            floors: 3
        }
    },
    {
        id: "4",
        tokenId: "4",
        name: "Mediterranean Estate",
        description: "Elegant Mediterranean-style estate on 2 acres. Wine cellar, home theater, guest house, and meticulously landscaped grounds.",
        value: 3800000,
        location: "Beverly Hills, CA",
        imageUrl: "/properties/villa-4.jpg",
        type: "residential",
        status: "available",
        metrics: {
            sqft: 8200,
            bedrooms: 6,
            bathrooms: 8,
            yearBuilt: 2018,
            lotSize: 2.0
        }
    }
];

export const getProperties = async (
    page: number = 1,
    limit: number = 10
): Promise<{ properties: Property[]; hasMore: boolean }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProperties = mockProperties.slice(start, end);

    return {
        properties: paginatedProperties,
        hasMore: end < mockProperties.length,
    };
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const property = mockProperties.find((p) => p.id === id);
    return property || null;
};

export const propertyService = {
    async getProperties(page = 1, pageSize = 10): Promise<PropertyResponse> {
        // Always return mock data for now since we're in development
        const mockData = propertyService.getMockProperties();
        return {
            properties: mockData,
            totalCount: mockData.length,
            page,
            pageSize
        };

        // TODO: Uncomment when API is ready
        // try {
        //     const response = await fetch(
        //         `${API_BASE_URL}/properties?page=${page}&pageSize=${pageSize}`
        //     );
        //     if (!response.ok) throw new Error('Failed to fetch properties');
        //     return await response.json();
        // } catch (error) {
        //     console.error('Error fetching properties:', error);
        //     const mockData = propertyService.getMockProperties();
        //     return {
        //         properties: mockData,
        //         totalCount: mockData.length,
        //         page,
        //         pageSize
        //     };
        // }
    },

    async getPropertyById(id: string): Promise<Property | null> {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return mockProperties.find(p => p.id === id) || null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/properties/${id}`);
            if (!response.ok) throw new Error('Failed to fetch property');
            return await response.json();
        } catch (error) {
            console.error('Error fetching property:', error);
            return mockProperties.find(p => p.id === id) || null;
        }
    },

    getMockProperties(): Property[] {
        return mockProperties;
    }
}; 