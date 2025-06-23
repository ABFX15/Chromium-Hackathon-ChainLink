"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { useState, useEffect, useCallback } from "react";
import { Address } from "viem";
import { toast } from "react-hot-toast";
import { SupportedChainKey } from "@/app/lib/chains";

import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { Loan, PropertyNFT as NFTMetadata } from "@/types/contracts";

import LoanManagerABI from "@/abis/LoanManager.json";
import PropertyNFTABI from "@/abis/PropertyNFT.json";
import MockUSDCABI from "@/abis/MockUSDC.json";
import CrossChainLiquidityPoolABI from "@/abis/CrossChainLiquidityPool.json";

// --- Helper function for fetching with retry ---
const fetchWithRetry = async (url: string, retries = 5, delay = 2000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url);
        if (response.ok) {
            return response;
        }
        if (i < retries - 1) {
            console.log(`Attempt ${i + 1} failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else {
            return response;
        }
    }
    throw new Error("fetchWithRetry failed after all retries.");
};

export type NFT = NFTMetadata & { isSyncing?: boolean };

export const useContracts = () => {
    const { address, isConnected } = useAccount();
    const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
    const [userLoans, setUserLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);
    const [allProperties, setAllProperties] = useState<NFT[]>([]);
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
    const [addingLiquidity, setAddingLiquidity] = useState(false);

    const executeContractWrite = async (setLoadingState: (loading: boolean) => void, params: any): Promise<Address | undefined> => {
        if (!address) {
            toast.error("Please connect your wallet first.");
            return undefined;
        };
        setLoadingState(true);
        try {
            const hash = await writeContractAsync(params);
            toast.loading("Transaction submitted... waiting for confirmation.", { id: hash });
            await waitForTransactionReceipt(config, { hash });
            toast.success("Transaction Confirmed!", { id: hash });
            return hash;
        } catch (error: any) {
            console.error("Contract write error:", error);
            const message = error.shortMessage || error.message;
            toast.error(message.includes("User rejected the request") ? "Transaction rejected." : `Error: ${message}`);
            return undefined;
        } finally {
            setLoadingState(false);
        }
    };

    const approveNFT = (tokenId: bigint): Promise<Address | undefined> => executeContractWrite(setApproving, {
        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
        abi: PropertyNFTABI.abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER as Address, tokenId],
    });

    const approveUSDC = (amount: bigint): Promise<Address | undefined> => executeContractWrite(setApproving, {
        address: CONTRACT_ADDRESSES.USDC as Address,
        abi: MockUSDCABI.abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER as Address, amount],
    });

    const repayLoan = (loanId: bigint): Promise<Address | undefined> => executeContractWrite(() => { }, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "repayLoan",
        args: [loanId],
    });

    const depositNFTCollateral = (tokenId: bigint, amount: bigint, apr: number, assetType: number): Promise<Address | undefined> => executeContractWrite(setCreatingLoan, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "depositNFTCollateral",
        args: [tokenId, amount, BigInt(assetType), BigInt(Math.round(apr * 100))],
    });

    const fundLoan = (loanId: number, fee: bigint): Promise<Address | undefined> => executeContractWrite(setCreatingLoan, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "fundLoanCrossChain",
        args: [BigInt(loanId)],
        value: fee,
    });

    const mintPropertyNFT = async (metadataUrl: string): Promise<Address | undefined> => {
        return executeContractWrite(setMinting, {
            address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
            abi: PropertyNFTABI.abi,
            functionName: 'safeMint',
            args: [address, metadataUrl],
        });
    };

    const addCCIPLiquidity = async (destinationChainSelector: bigint, amount: bigint, fee: bigint): Promise<Address | undefined> => {
        return executeContractWrite(setAddingLiquidity, {
            address: CONTRACT_ADDRESSES.CROSS_CHAIN_LIQUIDITY_POOL as Address,
            abi: CrossChainLiquidityPoolABI as any,
            functionName: 'addLiquidity',
            args: [destinationChainSelector, amount],
            value: fee,
        });
    };

    const estimateCCIPFee = useCallback(async (destinationChain: SupportedChainKey) => {
        if (!address) return BigInt(0);
        try {
            const fee = await readContract(config, {
                address: CONTRACT_ADDRESSES.CROSS_CHAIN_LIQUIDITY_POOL as Address,
                abi: CrossChainLiquidityPoolABI as any,
                functionName: "estimateFee",
                args: [destinationChain],
            });
            return fee as bigint;
        } catch (error) {
            console.error("Fee estimation error:", error);
            return BigInt(0);
        }
    }, [address]);

    const loadAllProperties = useCallback(async () => {
        console.log("Loading all properties...");
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

                const nfts: NFT[] = [];
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
                            const ipfsGatewayUrl = "https://ipfs.io/ipfs/";
                            const metadataUrl = tokenURI.replace("ipfs://", ipfsGatewayUrl);
                            const metadataResponse = await fetchWithRetry(metadataUrl);

                            if (!metadataResponse.ok) {
                                const owner = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'ownerOf', args: [tokenId] }) as Address;
                                nfts.push({
                                    id: tokenId.toString(),
                                    tokenId: Number(tokenId),
                                    name: `Property #${tokenId.toString()}`,
                                    description: 'Metadata is propagating. Please check back shortly.',
                                    image: '/properties/mock-2.jpg',
                                    owner: owner,
                                    isCollateral: collateralizedTokenIds.has(tokenId),
                                    propertyValue: 0, price: 0, maxLoan: 0, location: 'Syncing...', riskScore: 0, isSyncing: true,
                                });
                                continue;
                            }

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
                                propertyValue, price: propertyValue, maxLoan: propertyValue * 0.7,
                                location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A',
                                riskScore: riskScore, isSyncing: false,
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

    const loadUserData = useCallback(async () => {
        if (!address || !isConnected) {
            setUserNFTs([]);
            setUserLoans([]);
            return;
        }
        console.log("Loading user data...");
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

            setUserLoans(loans);
            setAllLoans(allLoansTemp);

            const balance = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'balanceOf', args: [address] }) as bigint;
            const nfts: NFT[] = [];
            for (let i = 0; i < Number(balance); i++) {
                try {
                    const tokenId = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(i)] }) as bigint;
                    const tokenURI = await readContract(config, { address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address, abi: PropertyNFTABI.abi, functionName: 'tokenURI', args: [tokenId] }) as string;
                    if (tokenURI) {
                        const ipfsGatewayUrl = "https://ipfs.io/ipfs/";
                        const metadataUrl = tokenURI.replace("ipfs://", ipfsGatewayUrl);
                        const metadataResponse = await fetchWithRetry(metadataUrl);

                        if (!metadataResponse.ok) {
                            nfts.push({
                                id: tokenId.toString(),
                                tokenId: Number(tokenId),
                                name: `My Property #${tokenId.toString()}`,
                                description: 'Your NFT was minted successfully. Metadata is propagating and will appear shortly.',
                                image: '/properties/mock-1.jpg',
                                owner: address,
                                isCollateral: collateralizedTokenIds.has(tokenId),
                                propertyValue: 0, price: 0, maxLoan: 0, location: 'Syncing...', riskScore: 0, isSyncing: true,
                            });
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
                            propertyValue, price: propertyValue, maxLoan: propertyValue * 0.7,
                            location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A',
                            riskScore: riskScore, isSyncing: false,
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
    }, [address, isConnected]);

    const refreshAllData = useCallback(async () => {
        toast.loading("Refreshing on-chain data...");
        await Promise.all([loadAllProperties(), loadUserData()]);
        toast.dismiss();
        toast.success("Data refreshed!");
    }, [loadAllProperties, loadUserData]);

    // This effect runs on mount and when the user connects/disconnects.
    useEffect(() => {
        if (isConnected) {
            refreshAllData();
        }
    }, [isConnected, refreshAllData]);

    return { userNFTs, userLoans, allLoans, loading, userUSDCBalance, minting, approving, creatingLoan, isProcessing, txSuccess, depositNFTCollateral, fundLoan, approveNFT, approveUSDC, mintPropertyNFT, allProperties, loadAllProperties, addCCIPLiquidity, estimateCCIPFee, addingLiquidity, repayLoan, refreshAllData };
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