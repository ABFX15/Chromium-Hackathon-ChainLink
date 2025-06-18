import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { address } = await req.json();
    const apiKey = process.env.RENTCAST_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Missing RentCast API key" }, { status: 500 });
    }

    // Demo property fallback
    if (!address) {
        return NextResponse.json({
            demo: true,
            property: {
                address: "123 Demo St, Demo City, CA 90000",
                rent: 2500,
                value: 400000,
                bedrooms: 3,
                bathrooms: 2,
                sqft: 1500,
                yearBuilt: 2010,
                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            }
        });
    }

    // Call RentCast API
    try {
        const res = await fetch(`https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`, {
            headers: {
                "X-Api-Key": apiKey,
            },
        });
        if (!res.ok) {
            return NextResponse.json({ error: "RentCast API error" }, { status: 500 });
        }
        const data = await res.json();
        return NextResponse.json({ demo: false, property: data });
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch property data" }, { status: 500 });
    }
} 