import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { nftData, borrowerData } = await req.json();

    // --- MOCK IMPLEMENTATION ---
    // In production, call AWS Bedrock here
    // For now, return a random APR between 5 and 15
    const apr = Math.floor(Math.random() * 10) + 5;

    return NextResponse.json({ apr });
} 