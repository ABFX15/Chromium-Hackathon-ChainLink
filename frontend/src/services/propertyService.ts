import { Property, PropertyResponse } from '../types/property';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const propertyService = {
    async getProperties(page = 1, pageSize = 10): Promise<PropertyResponse> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/properties?page=${page}&pageSize=${pageSize}`
            );
            if (!response.ok) throw new Error('Failed to fetch properties');
            return await response.json();
        } catch (error) {
            console.error('Error fetching properties:', error);
            // Return mock data in development
            return {
                properties: propertyService.getMockProperties(),
                totalCount: 8,
                page: 1,
                pageSize: 10
            };
        }
    },

    async getPropertyById(id: string): Promise<Property | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/properties/${id}`);
            if (!response.ok) throw new Error('Failed to fetch property');
            return await response.json();
        } catch (error) {
            console.error('Error fetching property:', error);
            return null;
        }
    },

    // Mock data with high-quality images
    getMockProperties(): Property[] {
        return [
            {
                id: '1',
                tokenId: '1',
                name: 'Luxury Beachfront Villa',
                description: 'Stunning 5-bedroom villa with direct beach access and panoramic ocean views',
                value: 2500000,
                location: 'Miami Beach, FL',
                imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
                type: 'residential',
                status: 'available',
                metrics: {
                    sqft: 4500,
                    yearBuilt: 2020,
                    lastValuation: '2024-03-15'
                }
            },
            {
                id: '2',
                tokenId: '2',
                name: 'Downtown High-Rise Office',
                description: 'Prime commercial space in the heart of the business district',
                value: 5000000,
                location: 'Manhattan, NY',
                imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
                type: 'commercial',
                status: 'funded',
                metrics: {
                    sqft: 10000,
                    yearBuilt: 2018,
                    lastValuation: '2024-03-10'
                }
            },
            {
                id: '3',
                tokenId: '3',
                name: 'Modern Apartment Complex',
                description: 'Newly renovated 50-unit luxury apartment building',
                value: 8000000,
                location: 'Austin, TX',
                imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
                type: 'residential',
                status: 'available',
                metrics: {
                    sqft: 45000,
                    yearBuilt: 2015,
                    lastValuation: '2024-03-01'
                }
            },
            {
                id: '4',
                tokenId: '4',
                name: 'Mediterranean Villa Estate',
                description: 'Exclusive villa with panoramic ocean views and private pool',
                value: 3500000,
                location: 'Los Angeles, CA',
                imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
                type: 'residential',
                status: 'available',
                metrics: {
                    sqft: 6000,
                    yearBuilt: 2019,
                    lastValuation: '2024-03-05'
                }
            },
            {
                id: '5',
                tokenId: '5',
                name: 'Industrial Warehouse Complex',
                description: 'Modern logistics facility with state-of-the-art amenities',
                value: 4200000,
                location: 'Phoenix, AZ',
                imageUrl: 'https://images.unsplash.com/photo-1587293852726-70656d4e2277?w=800&q=80',
                type: 'industrial',
                status: 'available',
                metrics: {
                    sqft: 25000,
                    yearBuilt: 2021,
                    lastValuation: '2024-03-12'
                }
            },
            {
                id: '6',
                tokenId: '6',
                name: 'Tech Hub Office Building',
                description: 'Modern office space designed for technology companies',
                value: 6500000,
                location: 'San Francisco, CA',
                imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                type: 'commercial',
                status: 'available',
                metrics: {
                    sqft: 15000,
                    yearBuilt: 2017,
                    lastValuation: '2024-03-08'
                }
            },
            {
                id: '7',
                tokenId: '7',
                name: 'Luxury Penthouse Suite',
                description: 'Spectacular penthouse with 360-degree city views',
                value: 4800000,
                location: 'Chicago, IL',
                imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
                type: 'residential',
                status: 'funded',
                metrics: {
                    sqft: 3800,
                    yearBuilt: 2016,
                    lastValuation: '2024-03-03'
                }
            },
            {
                id: '8',
                tokenId: '8',
                name: 'Distribution Center',
                description: 'Strategic location with excellent transportation access',
                value: 5500000,
                location: 'Dallas, TX',
                imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
                type: 'industrial',
                status: 'available',
                metrics: {
                    sqft: 35000,
                    yearBuilt: 2020,
                    lastValuation: '2024-03-14'
                }
            }
        ];
    }
}; 