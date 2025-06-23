"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { useState, useEffect, useCallback } from "react";
import { Address } from "viem";

import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { Loan, PropertyNFT as NFTMetadata } from "@/types/contracts";

import LoanManagerABI from "@/abis/LoanManager.json";
import PropertyNFTABI from "@/abis/PropertyNFT.json";
import MockUSDCABI from "@/abis/MockUSDC.json";

export const useContracts = () => {
    const { address, isConnected } = useAccount();
    const [userNFTs, setUserNFTs] = useState<NFTMetadata[]>([]);
    const [userLoans, setUserLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);
    const [allProperties, setAllProperties] = useState<NFTMetadata[]>([]);
    const [allLoans, setAllLoans] = useState<Loan[]>([]);

    const { data: userUSDCBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.USDC as Address,
        abi: MockUSDCABI.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const { writeContractAsync, data: writeData, isPending } = useWriteContract();
    const { isLoading: isProcessing, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: writeData });

    const [minting, setMinting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [creatingLoan, setCreatingLoan] = useState(false);

    const executeContractWrite = async (setLoadingState: (loading: boolean) => void, params: any): Promise<boolean> => {
        if (!address) return false;
        setLoadingState(true);
        try {
            const hash = await writeContractAsync(params);
            await waitForTransactionReceipt(config, { hash });
            return true;
        } catch (error) {
            console.error("Contract write error:", error);
            return false;
        } finally {
            setLoadingState(false);
        }
    };

    const approveNFT = (tokenId: bigint) => executeContractWrite(setApproving, {
        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
        abi: PropertyNFTABI.abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER as Address, tokenId],
    });

    const approveUSDC = (amount: bigint) => executeContractWrite(setApproving, {
        address: CONTRACT_ADDRESSES.USDC as Address,
        abi: MockUSDCABI.abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER as Address, amount],
    });


    const createLoan = (tokenId: bigint, amount: bigint, apr: number) => executeContractWrite(setCreatingLoan, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "createLoan",
        args: [tokenId, amount, BigInt(apr)],
    });

    const fundLoan = (loanId: number) => executeContractWrite(setCreatingLoan, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "fundLoanCrossChain",
        args: [BigInt(loanId)],
    });

    const mintPropertyNFT = async (metadataUrl: string, propertyValue: number) => {
        return executeContractWrite(() => { }, {
            address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
            abi: PropertyNFTABI.abi,
            functionName: 'safeMint',
            args: [address, BigInt(propertyValue), metadataUrl],
        });
    };

    const loadAllProperties = useCallback(async () => {
        setLoading(true);
        try {
            const totalSupply = await readContract(config, {
                address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                abi: PropertyNFTABI.abi,
                functionName: "totalSupply",
            }) as bigint;

            if (totalSupply > 0) {
                const nextLoanId = await readContract(config, { address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address, abi: LoanManagerABI.abi, functionName: "nextLoanId" }) as bigint;
                const collateralizedTokenIds = new Set<bigint>();
                for (let i = 1; i < Number(nextLoanId); i++) {
                    try {
                        const loanData = await readContract(config, { address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address, abi: LoanManagerABI.abi, functionName: "loans", args: [BigInt(i)] }) as any;
                        if (loanData && loanData[7]) { // isActive
                            collateralizedTokenIds.add(loanData[1]); // tokenId
                        }
                    } catch (e) {
                        console.warn(`Could not fetch loan with ID ${i} for collateral status check:`, e);
                    }
                }

                const nfts: NFTMetadata[] = [];
                for (let i = 0; i < Number(totalSupply); i++) {
                    try {
                        const tokenId = await readContract(config, {
                            address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                            abi: PropertyNFTABI.abi,
                            functionName: "tokenByIndex",
                            args: [BigInt(i)],
                        }) as bigint;

                        const tokenURI = await readContract(config, {
                            address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                            abi: PropertyNFTABI.abi,
                            functionName: 'tokenURI',
                            args: [tokenId]
                        }) as string;

                        if (tokenURI) {
                            const ipfsGatewayUrl = "https://gateway.pinata.cloud/ipfs/";
                            const metadataUrl = tokenURI.replace("ipfs://", ipfsGatewayUrl);
                            const metadataResponse = await fetch(metadataUrl);

                            if (!metadataResponse.ok) continue;

                            const metadata = await metadataResponse.json();
                            const propertyValue = metadata.attributes?.find((a: any) => a.trait_type === 'Property Value')?.value || 0;
                            const imageUrl = metadata.image?.replace("ipfs://", ipfsGatewayUrl) || '';
                            const owner = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'ownerOf', args: [tokenId] }) as Address;
                            const riskScore = metadata.attributes?.find((a: any) => a.trait_type === 'Risk Score')?.value || 50;

                            nfts.push({
                                id: tokenId.toString(),
                                tokenId: Number(tokenId),
                                name: metadata.name || 'Unknown',
                                description: metadata.description || '',
                                image: imageUrl,
                                owner: owner,
                                isCollateral: collateralizedTokenIds.has(tokenId),
                                propertyValue,
                                price: propertyValue,
                                maxLoan: propertyValue * 0.7,
                                location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A',
                                riskScore: riskScore,
                            });
                        }
                    } catch (e) {
                        console.warn(`Could not process NFT with index ${i}:`, e);
                    }
                }
                setAllProperties(nfts);
            } else {
                console.log("No on-chain properties found. Loading mock data.");
                setAllProperties(getMockProperties(address));
            }
        } catch (error) {
            console.error("Error loading all properties:", error);
            setAllProperties(getMockProperties(address));
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        const loadUserData = async () => {
            if (!address || !isConnected) {
                setUserNFTs([]);
                setUserLoans([]);
                return;
            }
            setLoading(true);
            try {
                const nextLoanId = await readContract(config, { address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address, abi: LoanManagerABI.abi, functionName: "nextLoanId" }) as bigint;
                const loans: Loan[] = [];
                const allLoansTemp: Loan[] = [];
                const collateralizedTokenIds = new Set<bigint>();
                for (let i = 1; i < Number(nextLoanId); i++) {
                    try {
                        const loanData = await readContract(config, { address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address, abi: LoanManagerABI.abi, functionName: "loans", args: [BigInt(i)] }) as any;
                        const loan: Loan = { loanId: loanData[0], tokenId: loanData[1], principalAmount: loanData[2], interestRate: loanData[3], startTimestamp: loanData[4], borrower: loanData[5], lender: loanData[6], isActive: loanData[7], isFunded: loanData[8] };
                        allLoansTemp.push(loan);

                        if (loanData && (loanData[5] === address || loanData[6] === address)) {
                            loans.push(loan);
                        }
                        if (loan.isActive) collateralizedTokenIds.add(loan.tokenId);
                    } catch (e) {
                        console.warn(`Could not fetch loan with ID ${i}:`, e);
                    }
                }

                // If using mock properties, add a mock loan for the lendable property
                if (allProperties.some(p => p.id.startsWith('mock-'))) {
                    allLoansTemp.push({
                        loanId: BigInt(101),
                        tokenId: BigInt(9002), // Sunny Beachside Bungalow
                        principalAmount: BigInt(840000 * 1e6),
                        interestRate: BigInt(7.5 * 100),
                        startTimestamp: BigInt(Math.floor(Date.now() / 1000)),
                        borrower: '0xMockBorrower',
                        lender: '0x0000000000000000000000000000000000000000',
                        isActive: true,
                        isFunded: false,
                    });
                }

                setUserLoans(loans);
                setAllLoans(allLoansTemp);

                const balance = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'balanceOf', args: [address] }) as bigint;
                const nfts: NFTMetadata[] = [];
                for (let i = 0; i < Number(balance); i++) {
                    try {
                        const tokenId = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(i)] }) as bigint;
                        const tokenURI = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'tokenURI', args: [tokenId] }) as string;
                        if (tokenURI) {
                            const ipfsGatewayUrl = "https://gateway.pinata.cloud/ipfs/";
                            const metadataUrl = tokenURI.replace("ipfs://", ipfsGatewayUrl);

                            const metadataResponse = await fetch(metadataUrl);

                            if (!metadataResponse.ok) {
                                console.error(`Failed to fetch NFT metadata from ${metadataUrl}. Status: ${metadataResponse.status}`);
                                continue;
                            }

                            const metadata = await metadataResponse.json();
                            const propertyValue = metadata.attributes?.find((a: any) => a.trait_type === 'Property Value')?.value || 0;
                            const imageUrl = metadata.image?.replace("ipfs://", ipfsGatewayUrl) || '';
                            const riskScore = metadata.attributes?.find((a: any) => a.trait_type === 'Risk Score')?.value || 50;

                            nfts.push({
                                id: tokenId.toString(),
                                tokenId: Number(tokenId),
                                name: metadata.name || 'Unknown',
                                description: metadata.description || '',
                                image: imageUrl,
                                owner: address,
                                isCollateral: collateralizedTokenIds.has(tokenId),
                                propertyValue,
                                price: propertyValue,
                                maxLoan: propertyValue * 0.7,
                                location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A',
                                riskScore: riskScore,
                            });
                        }
                    } catch (e) {
                        console.warn(`Could not process NFT with index ${i}:`, e);
                    }
                }
                setUserNFTs(nfts);
            } catch (error) {
                console.error("Error loading user data:", error);
                setUserNFTs([]);
                setUserLoans([]);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [address, isConnected, txSuccess, allProperties]);

    useEffect(() => {
        if (!isPending && !isProcessing) {
            setMinting(false);
            setApproving(false);
            setCreatingLoan(false);
        }
    }, [isPending, isProcessing]);

    return { userNFTs, userLoans, allLoans, loading, userUSDCBalance, minting, approving, creatingLoan, isProcessing, txSuccess, createLoan, fundLoan, approveNFT, approveUSDC, mintPropertyNFT, allProperties, loadAllProperties };
};

const getMockProperties = (ownerAddress?: Address): NFTMetadata[] => {
    return [
        {
            id: 'mock-1',
            tokenId: 9001,
            name: 'Pioneer Square Loft',
            description: 'A stylish, modern loft in the heart of the historic Pioneer Square, offering a blend of classic architecture and contemporary design. Perfect for urban living.',
            image: '/properties/mock-1.jpg',
            owner: ownerAddress || '0x000000000000000000000000000000000000dEaD',
            isCollateral: false,
            propertyValue: 750000,
            price: 750000,
            maxLoan: 750000 * 0.7,
            location: 'Seattle, WA',
            riskScore: 25,
        },
        {
            id: 'mock-2',
            tokenId: 9002,
            name: 'Sunny Beachside Bungalow',
            description: 'Charming bungalow just steps from the sand. Features an open floor plan, updated kitchen, and a spacious deck for soaking up the sun.',
            image: '/properties/mock-2.jpg',
            owner: '0xMockBorrower',
            isCollateral: true,
            propertyValue: 1200000,
            price: 1200000,
            maxLoan: 1200000 * 0.7,
            location: 'Malibu, CA',
            riskScore: 45,
        },
        {
            id: 'mock-3',
            tokenId: 9003,
            name: 'Mountain View Chalet',
            description: 'A cozy chalet with breathtaking mountain views. Ideal for a ski retreat or a peaceful getaway, featuring a stone fireplace and rustic decor.',
            image: '/properties/mock-3.jpg',
            owner: '0xMockOwner3',
            isCollateral: false,
            propertyValue: 850000,
            price: 850000,
            maxLoan: 850000 * 0.7,
            location: 'Aspen, CO',
            riskScore: 65,
        },
        {
            id: 'mock-4',
            tokenId: 9004,
            name: 'Downtown Financial Hub',
            description: 'A prime piece of real estate in the bustling financial district. Perfect for a high-value commercial or residential investment.',
            image: '/properties/mock-4.jpg',
            owner: '0xMockOwner4',
            isCollateral: false,
            propertyValue: 2500000,
            price: 2500000,
            maxLoan: 2500000 * 0.7,
            location: 'New York, NY',
            riskScore: 85,
        }
    ];
}; 