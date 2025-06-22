"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { useState, useEffect } from "react";
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
        functionName: "fundLoan",
        args: [BigInt(loanId)],
    });

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
                const collateralizedTokenIds = new Set<bigint>();
                for (let i = 1; i < Number(nextLoanId); i++) {
                    try {
                        const loanData = await readContract(config, { address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address, abi: LoanManagerABI.abi, functionName: "loans", args: [BigInt(i)] }) as any;
                        if (loanData && (loanData[5] === address || loanData[6] === address)) {
                            const loan: Loan = { loanId: loanData[0], tokenId: loanData[1], principalAmount: loanData[2], interestRate: loanData[3], startTimestamp: loanData[4], borrower: loanData[5], lender: loanData[6], isActive: loanData[7], isFunded: loanData[8] };
                            loans.push(loan);
                            if (loan.isActive) collateralizedTokenIds.add(loan.tokenId);
                        }
                    } catch (e) {
                        console.warn(`Could not fetch loan with ID ${i}:`, e);
                    }
                }
                setUserLoans(loans);

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
                                location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A'
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
    }, [address, isConnected, txSuccess]);

    useEffect(() => {
        if (!isPending && !isProcessing) {
            setMinting(false);
            setApproving(false);
            setCreatingLoan(false);
        }
    }, [isPending, isProcessing]);

    return { userNFTs, userLoans, loading, userUSDCBalance, minting, approving, creatingLoan, isProcessing, txSuccess, createLoan, fundLoan, approveNFT, approveUSDC };
}; 