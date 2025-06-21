
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
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockProperties: Property[] = [
      {
        id: '1',
        name: 'Luxury Downtown Apartment',
        location: 'Manhattan, NY',
        price: 850000,
        image: '/properties/apartment-2.jpg',
        description: 'Modern luxury apartment in the heart of Manhattan',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        type: 'apartment'
      },
      {
        id: '2',
        name: 'Beachfront Villa',
        location: 'Miami, FL',
        price: 1200000,
        image: '/properties/villa-4.jpg',
        description: 'Stunning beachfront villa with ocean views',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2800,
        type: 'villa'
      },
      {
        id: '3',
        name: 'Commercial Office Space',
        location: 'Chicago, IL',
        price: 650000,
        image: '/properties/commercial-3.jpg',
        description: 'Prime commercial real estate in downtown Chicago',
        bedrooms: 0,
        bathrooms: 4,
        sqft: 3500,
        type: 'commercial'
      }
    ];

    setTimeout(() => {
      setProperties(mockProperties);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { properties, isLoading };
}
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
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockProperties: Property[] = [
      {
        id: '1',
        name: 'Luxury Downtown Apartment',
        location: 'Manhattan, NY',
        price: 850000,
        image: '/properties/apartment-2.jpg',
        description: 'Modern luxury apartment in the heart of Manhattan',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        type: 'apartment'
      },
      {
        id: '2',
        name: 'Beachfront Villa',
        location: 'Miami, FL',
        price: 1200000,
        image: '/properties/villa-4.jpg',
        description: 'Stunning beachfront villa with ocean views',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2800,
        type: 'villa'
      },
      {
        id: '3',
        name: 'Commercial Office Space',
        location: 'Chicago, IL',
        price: 650000,
        image: '/properties/commercial-3.jpg',
        description: 'Prime commercial real estate in downtown Chicago',
        bedrooms: 0,
        bathrooms: 4,
        sqft: 3500,
        type: 'commercial'
      }
    ];

    setTimeout(() => {
      setProperties(mockProperties);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { properties, isLoading };
}
