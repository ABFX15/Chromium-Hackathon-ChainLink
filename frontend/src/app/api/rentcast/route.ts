
import { NextRequest, NextResponse } from "next/server";

const DEMO_PROPERTIES = [
  {
    address: "123 Main St, New York, NY 10001",
    valueEstimate: 850000,
    propertyType: "Apartment",
    city: "New York",
    state: "NY",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    yearBuilt: 2015,
    description: "Modern apartment in Manhattan",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
  },
  {
    address: "456 Oak Ave, Los Angeles, CA 90210",
    valueEstimate: 1200000,
    propertyType: "Single Family",
    city: "Los Angeles",
    state: "CA",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2500,
    yearBuilt: 2010,
    description: "Luxury home in Beverly Hills",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
  },
  {
    address: "789 Pine St, Chicago, IL 60601",
    valueEstimate: 420000,
    propertyType: "Condo",
    city: "Chicago",
    state: "IL",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    yearBuilt: 2005,
    description: "Downtown Chicago condo",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"
  }
];

export async function POST(req: NextRequest) {
    try {
        const { address } = await req.json();
        const apiKey = process.env.RENTCAST_API_KEY;

        // If no address provided, return demo property
        if (!address) {
            return NextResponse.json({
                demo: true,
                property: DEMO_PROPERTIES[0]
            });
        }

        // Check for demo addresses
        const demoProperty = DEMO_PROPERTIES.find(prop => 
            prop.address.toLowerCase().includes(address.toLowerCase()) ||
            address.toLowerCase().includes(prop.city.toLowerCase())
        );

        if (demoProperty) {
            return NextResponse.json({
                demo: true,
                property: demoProperty
            });
        }

        // If no API key, return mock data based on address
        if (!apiKey) {
            console.log("RentCast API key not found, using mock data");
            const mockProperty = {
                address: address,
                valueEstimate: Math.floor(Math.random() * 800000) + 200000,
                propertyType: ["Single Family", "Condo", "Apartment"][Math.floor(Math.random() * 3)],
                city: address.split(',')[1]?.trim() || "Unknown City",
                state: address.split(',')[2]?.trim().split(' ')[0] || "Unknown State",
                bedrooms: Math.floor(Math.random() * 4) + 1,
                bathrooms: Math.floor(Math.random() * 3) + 1,
                sqft: Math.floor(Math.random() * 2000) + 800,
                yearBuilt: Math.floor(Math.random() * 30) + 1990,
                description: `Property located at ${address}`,
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"
            };
            
            return NextResponse.json({
                demo: true,
                property: mockProperty
            });
        }

        // Call actual RentCast API
        try {
            const res = await fetch(`https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`, {
                headers: {
                    "X-Api-Key": apiKey,
                },
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('RentCast API error:', errorText);
                throw new Error(`RentCast API returned ${res.status}`);
            }
            
            const data = await res.json();
            return NextResponse.json({ 
                demo: false, 
                property: data 
            });
            
        } catch (apiError) {
            console.error('RentCast API call failed:', apiError);
            // Fall back to mock data
            const mockProperty = {
                address: address,
                valueEstimate: Math.floor(Math.random() * 800000) + 200000,
                propertyType: "Single Family",
                city: address.split(',')[1]?.trim() || "Unknown City",
                state: address.split(',')[2]?.trim().split(' ')[0] || "Unknown State",
                bedrooms: 3,
                bathrooms: 2,
                sqft: 1500,
                yearBuilt: 2010,
                description: `Property located at ${address}`,
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"
            };
            
            return NextResponse.json({
                demo: true,
                property: mockProperty,
                note: "Using fallback data due to API unavailability"
            });
        }
        
    } catch (error) {
        console.error('RentCast endpoint error:', error);
        return NextResponse.json(
            { error: "Failed to fetch property data", details: String(error) }, 
            { status: 500 }
        );
    }
}
