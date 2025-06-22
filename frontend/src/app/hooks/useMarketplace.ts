"use client";

import { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { Address } from "viem";

import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { PropertyNFT as NFTMetadata } from "@/types/contracts";
import PropertyNFTABI from "@/abis/PropertyNFT.json";

export const useMarketplace = () => {
    const [nfts, setNfts] = useState<NFTMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMarketplaceData = async () => {
            setLoading(true);
            try {
                const totalSupply = await readContract(config, {
                    address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                    abi: PropertyNFTABI.abi,
                    functionName: 'totalSupply',
                }) as bigint;

                let finalNfts: NFTMetadata[] = [];

                if (Number(totalSupply) > 0) {
                    const nftPromises = Array.from({ length: Number(totalSupply) }, (_, i) => (async (): Promise<NFTMetadata | null> => {
                        const tokenId = BigInt(i + 1);
                        try {
                            const tokenURI = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'tokenURI', args: [tokenId] }) as string;
                            const owner = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'ownerOf', args: [tokenId] }) as Address;

                            if (tokenURI) {
                                const metadataResponse = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
                                const metadata = await metadataResponse.json();
                                const propertyValue = metadata.attributes?.find((a: any) => a.trait_type === 'Property Value')?.value || 0;
                                return { id: tokenId.toString(), tokenId: Number(tokenId), name: metadata.name || 'Unknown', description: metadata.description || '', image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || '', owner, isCollateral: false, propertyValue, price: propertyValue, maxLoan: propertyValue * 0.7, location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A' };
                            }
                        } catch (e) { return null; }
                        return null;
                    })());
                    finalNfts = (await Promise.all(nftPromises)).filter((nft): nft is NFTMetadata => nft !== null);
                }

                if (finalNfts.length === 0) {
                    console.log("No on-chain NFTs found, using static fallback data.");
                    finalNfts = [
                        { id: 'mock-1', tokenId: 9991, name: 'Modern Luxury Villa', description: 'A beautiful villa with a view of the ocean.', image: '/properties/villa-4.jpg', owner: '0x0000000000000000000000000000000000000000', isCollateral: false, propertyValue: 1250000, price: 1250000, maxLoan: 1250000 * 0.7, location: 'Miami, FL' },
                        { id: 'mock-2', tokenId: 9992, name: 'Skyscraper Penthouse', description: 'A stunning penthouse with city views.', image: '/properties/apartment-2.jpg', owner: '0x0000000000000000000000000000000000000000', isCollateral: false, propertyValue: 2100000, price: 2100000, maxLoan: 2100000 * 0.7, location: 'New York, NY' },
                    ];
                }

                setNfts(finalNfts);
            } catch (error) {
                console.error("Error loading marketplace data:", error);
                console.log("Using static fallback data due to error.");
                setNfts([
                    { id: 'mock-1', tokenId: 9991, name: 'Modern Luxury Villa', description: 'A beautiful villa with a view of the ocean.', image: '/properties/villa-4.jpg', owner: '0x0000000000000000000000000000000000000000', isCollateral: false, propertyValue: 1250000, price: 1250000, maxLoan: 1250000 * 0.7, location: 'Miami, FL' },
                    { id: 'mock-2', tokenId: 9992, name: 'Skyscraper Penthouse', description: 'A stunning penthouse with city views.', image: '/properties/apartment-2.jpg', owner: '0x0000000000000000000000000000000000000000', isCollateral: false, propertyValue: 2100000, price: 2100000, maxLoan: 2100000 * 0.7, location: 'New York, NY' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadMarketplaceData();
    }, []);

    return { nfts, loading };
}; 