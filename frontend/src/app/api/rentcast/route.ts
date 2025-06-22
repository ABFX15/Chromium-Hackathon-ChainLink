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
        description: "Modern apartment in Manhattan with stunning city views and luxury amenities.",
        image: "/properties/apartment-2.jpg"
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
        description: "Spacious luxury home in Beverly Hills with a large backyard and pool.",
        image: "/properties/luxury-home-1.jpg"
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
        description: "A cozy downtown Chicago condo, perfect for city living with easy access to shops.",
        image: "/properties/commercial-3.jpg"
    },
    {
        address: "101 Maple Dr, Austin, TX 78701",
        valueEstimate: 950000,
        propertyType: "Single Family",
        city: "Austin",
        state: "TX",
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 2200,
        yearBuilt: 2018,
        description: "Modern family home in the heart of Austin with a private yard.",
        image: "/properties/villa-4.jpg"
    }
];

export async function GET() {
    try {
        console.log("GET /api/rentcast: Returning demo properties.");
        return NextResponse.json({ properties: DEMO_PROPERTIES });
    } catch (error) {
        console.error('RentCast GET endpoint error:', error);
        return NextResponse.json(
            { error: "Failed to fetch property data", details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { addresses } = await req.json();
        const apiKey = process.env.RENTCAST_API_KEY;

        // If no addresses provided, or in a non-API key env, return demo properties
        if (!apiKey || !addresses || addresses.length === 0) {
            console.log("Using demo properties for RentCast API.");
            return NextResponse.json({
                properties: DEMO_PROPERTIES
            });
        }

        const properties = await Promise.all(
            addresses.map(async (address: string) => {
                try {
                    const res = await fetch(`https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`, {
                        headers: { "X-Api-Key": apiKey },
                    });
                    if (!res.ok) throw new Error(`RentCast API returned ${res.status}`);
                    const data = await res.json();
                    return data.length > 0 ? data[0] : null;
                } catch (apiError) {
                    console.error(`RentCast API call for ${address} failed:`, apiError);
                    // Fallback to demo data for the specific address that failed
                    return DEMO_PROPERTIES.find(p => p.address.includes(address.split(',')[1])) || null;
                }
            })
        );

        const validProperties = properties.filter(p => p !== null);

        return NextResponse.json({ properties: validProperties });

    } catch (error) {
        console.error('RentCast endpoint error:', error);
        return NextResponse.json(
            { error: "Failed to fetch property data", details: String(error) },
            { status: 500 }
        );
    }
}
