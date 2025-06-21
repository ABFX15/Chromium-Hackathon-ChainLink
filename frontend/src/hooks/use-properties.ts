
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  address: string;
  propertyType: string;
  city: string;
  state: string;
  yearBuilt?: number;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Demo addresses to fetch from RentCast API
        const addresses = [
          "123 Main St, New York, NY 10001",
          "456 Oak Ave, Los Angeles, CA 90210", 
          "789 Pine St, Chicago, IL 60601",
          "321 Elm Street, Miami, FL 33101",
          "654 Broadway, San Francisco, CA 94102",
          "987 Park Avenue, Boston, MA 02101"
        ];

        const propertiesData: Property[] = [];

        for (let i = 0; i < addresses.length; i++) {
          const address = addresses[i];
          
          try {
            const response = await fetch('/api/rentcast', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ address })
            });

            if (response.ok) {
              const result = await response.json();
              const propData = result.property;
              
              const property: Property = {
                id: `${i + 1}`,
                name: propData.description || `${propData.propertyType} Property`,
                location: `${propData.city}, ${propData.state}`,
                price: propData.valueEstimate || 400000,
                image: propData.image || `https://images.unsplash.com/photo-${1564013799919 + i * 100000}-ab600027ffc6?auto=format&fit=crop&w=600&q=80`,
                description: propData.description || `Beautiful ${propData.propertyType.toLowerCase()} in ${propData.city}`,
                bedrooms: propData.bedrooms || 3,
                bathrooms: propData.bathrooms || 2,
                sqft: propData.sqft || 1500,
                type: propData.propertyType || 'Single Family',
                address: propData.address,
                propertyType: propData.propertyType || 'Single Family',
                city: propData.city,
                state: propData.state,
                yearBuilt: propData.yearBuilt
              };
              
              propertiesData.push(property);
            }
          } catch (error) {
            console.error(`Failed to fetch data for ${address}:`, error);
            
            // Add fallback property with better images
            const fallbackImages = [
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"
            ];
            
            const property: Property = {
              id: `${i + 1}`,
              name: `Property in ${address.split(',')[1]?.trim() || 'Unknown City'}`,
              location: address.split(',').slice(1).join(',').trim() || 'Unknown Location',
              price: 400000 + (i * 100000),
              image: fallbackImages[i % fallbackImages.length],
              description: `Beautiful property located at ${address}`,
              bedrooms: 2 + (i % 3),
              bathrooms: 1 + (i % 3),
              sqft: 1200 + (i * 300),
              type: ['Apartment', 'Single Family', 'Condo'][i % 3],
              address: address,
              propertyType: ['Apartment', 'Single Family', 'Condo'][i % 3],
              city: address.split(',')[1]?.trim() || 'Unknown City',
              state: address.split(',')[2]?.trim().split(' ')[0] || 'Unknown State'
            };
            
            propertiesData.push(property);
          }
        }

        setProperties(propertiesData);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        
        // Complete fallback with curated property images
        const fallbackProperties: Property[] = [
          {
            id: '1',
            name: 'Luxury Downtown Apartment',
            location: 'Manhattan, NY',
            price: 850000,
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
            description: 'Modern luxury apartment in the heart of Manhattan',
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            type: 'apartment',
            address: '123 Main St, New York, NY 10001',
            propertyType: 'Apartment',
            city: 'New York',
            state: 'NY'
          },
          {
            id: '2',
            name: 'Beachfront Villa',
            location: 'Miami, FL',
            price: 1200000,
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            description: 'Stunning beachfront villa with ocean views',
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2800,
            type: 'villa',
            address: '456 Ocean Dr, Miami, FL 33101',
            propertyType: 'Single Family',
            city: 'Miami',
            state: 'FL'
          },
          {
            id: '3',
            name: 'Modern Condo',
            location: 'Chicago, IL',
            price: 650000,
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
            description: 'Contemporary condo in downtown Chicago',
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1400,
            type: 'condo',
            address: '789 Pine St, Chicago, IL 60601',
            propertyType: 'Condo',
            city: 'Chicago',
            state: 'IL'
          }
        ];
        
        setProperties(fallbackProperties);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return { properties, isLoading };
}
