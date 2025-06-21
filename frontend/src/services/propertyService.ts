
export interface Property {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  value: number;
  location: string;
  propertyType: string;
  sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
}

class PropertyService {
  getMockProperties(): Property[] {
    return [
      {
        tokenId: "1",
        name: "Luxury Downtown Apartment",
        description: "Modern apartment in the heart of the city",
        image: "/properties/apartment-2.jpg",
        value: 450000,
        location: "New York, NY",
        propertyType: "Apartment",
        sqft: 1200,
        bedrooms: 2,
        bathrooms: 2,
        yearBuilt: 2020
      },
      {
        tokenId: "2", 
        name: "Suburban Villa",
        description: "Spacious family home with garden",
        image: "/properties/villa-4.jpg",
        value: 750000,
        location: "Austin, TX",
        propertyType: "House",
        sqft: 2800,
        bedrooms: 4,
        bathrooms: 3,
        yearBuilt: 2018
      },
      {
        tokenId: "3",
        name: "Commercial Office Space",
        description: "Prime commercial real estate",
        image: "/properties/commercial-3.jpg",
        value: 1200000,
        location: "San Francisco, CA", 
        propertyType: "Commercial",
        sqft: 5000,
        yearBuilt: 2015
      }
    ];
  }
}

export const propertyService = new PropertyService();
