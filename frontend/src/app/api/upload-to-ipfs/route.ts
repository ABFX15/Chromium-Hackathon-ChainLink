import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get("image") as File | null;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const propertyValue = formData.get("propertyValue") as string;
        const location = formData.get("location") as string;

        if (!imageFile || !name || !propertyValue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Upload Image to IPFS
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const pinataJWT = process.env.PINATA_JWT;
        if (!pinataJWT) {
            throw new Error("Pinata JWT not configured in .env.local");
        }

        const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${pinataJWT}`,
            },
            body: imageFormData,
        });

        if (!imageRes.ok) {
            const errorBody = await imageRes.text();
            console.error("Pinata image upload error:", errorBody);
            throw new Error(`Failed to pin image to IPFS: ${imageRes.statusText}`);
        }

        const imageData = await imageRes.json();
        const imageUrl = `ipfs://${imageData.IpfsHash}`;

        // 2. Upload JSON metadata to IPFS
        const metadata = {
            name,
            description,
            image: imageUrl,
            attributes: [
                {
                    trait_type: "Property Value",
                    value: parseInt(propertyValue, 10),
                },
                {
                    trait_type: "Location",
                    value: location,
                },
            ],
        };

        const metadataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${pinataJWT}`,
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: { name: `${name}-metadata.json` },
            }),
        });

        if (!metadataRes.ok) {
            const errorBody = await metadataRes.text();
            console.error("Pinata metadata upload error:", errorBody);
            throw new Error(`Failed to pin metadata to IPFS: ${metadataRes.statusText}`);
        }

        const metadataData = await metadataRes.json();
        const metadataUrl = `ipfs://${metadataData.IpfsHash}`;

        return NextResponse.json({ success: true, metadataUrl });

    } catch (error: any) {
        console.error("IPFS Upload Error:", error);
        return NextResponse.json({ error: error.message || "Server error during IPFS upload" }, { status: 500 });
    }
} 