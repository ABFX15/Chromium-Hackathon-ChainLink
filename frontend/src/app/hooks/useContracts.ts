"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { useState, useEffect } from "react";
import { Address } from "viem";

import { CONTRACT_ADDRESSES } from "@/lib/contracts"; // Keep this for addresses
import { Loan, PropertyNFT as NFTMetadata } from "@/types/contracts";

// Import ABIs from the correct JSON files
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

    const { writeContract, data: writeData, isPending } = useWriteContract();

    const { isLoading: isProcessing, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: writeData });

    const [minting, setMinting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [creatingLoan, setCreatingLoan] = useState(false);
    const [repaying, setRepaying] = useState(false);
    const [addingLiquidity, setAddingLiquidity] = useState(false);
    const [funding, setFunding] = useState(false);

    const executeContractWrite = async (setLoadingState: (loading: boolean) => void, params: any) => {
        if (!address) return;
        setLoadingState(true);
        try {
            await writeContract(params);
        } catch (error) {
            console.error("Contract write error:", error);
        } finally {
            setLoadingState(false);
        }
    };

    const mintPropertyNFT = (tokenId: number, uri: string) => executeContractWrite(setMinting, {
        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
        abi: PropertyNFTABI.abi,
        functionName: "safeMint",
        args: [address, BigInt(tokenId), uri],
    });

    const approveNFTForLoan = (tokenId: number) => executeContractWrite(setApproving, {
        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
        abi: PropertyNFTABI.abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER, BigInt(tokenId)],
    });

    const createLoan = (tokenId: number, amount: number, apr: number) => executeContractWrite(setCreatingLoan, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "createLoan",
        args: [BigInt(tokenId), BigInt(amount), BigInt(apr)],
    });

    const repayLoan = (loanId: number) => executeContractWrite(setRepaying, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: "repayLoan",
        args: [BigInt(loanId)],
    });

    const addCCIPLiquidity = (chainSelector: bigint, amount: bigint) => executeContractWrite(setAddingLiquidity, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
        abi: LoanManagerABI.abi,
        functionName: 'addCCIPLiquidity',
        args: [chainSelector, amount],
    });

    const estimateCCIPFee = async (destinationChainKey: string) => {
        console.log("Estimating fee for:", destinationChainKey);
        // This should ideally call a contract function, but we'll keep the placeholder
        return BigInt(1000000000000000);
    };

    const executeCCIPLoan = async (loanId: bigint, destinationChainSelector: bigint) => {
        const fee = await estimateCCIPFee("placeholder");
        executeContractWrite(setFunding, {
            address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
            abi: LoanManagerABI.abi,
            functionName: 'executeCCIPLoan',
            args: [loanId, destinationChainSelector],
            value: fee,
        });
    };


    useEffect(() => {
        const loadUserData = async () => {
            if (!address || !isConnected) {
                setUserNFTs([]);
                setUserLoans([]);
                return;
            }
            setLoading(true);
            try {
                const nextLoanIdBigInt = await readContract(config, {
                    address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
                    abi: LoanManagerABI.abi,
                    functionName: "nextLoanId",
                });

                const loans: Loan[] = [];
                const collateralizedTokenIds = new Set<bigint>();
                for (let i = 1; i < Number(nextLoanIdBigInt); i++) {
                    const loanData = (await readContract(config, {
                        address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
                        abi: LoanManagerABI.abi,
                        functionName: "loans",
                        args: [BigInt(i)],
                    })) as any; // Still need 'any' for the raw tuple from contract

                    if (loanData && (loanData[5] === address || loanData[6] === address)) {
                        const loan: Loan = {
                            loanId: loanData[0],
                            tokenId: loanData[1],
                            principalAmount: loanData[2],
                            interestRate: loanData[3],
                            startTimestamp: loanData[4],
                            borrower: loanData[5],
                            lender: loanData[6],
                            isActive: loanData[7],
                            isFunded: loanData[8],
                        };
                        loans.push(loan);
                        if (loan.isActive) {
                            collateralizedTokenIds.add(loan.tokenId);
                        }
                    }
                }
                setUserLoans(loans);

                const balance = await readContract(config, {
                    address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                    abi: PropertyNFTABI.abi,
                    functionName: 'balanceOf',
                    args: [address]
                });

                const nfts: NFTMetadata[] = [];
                for (let i = 0; i < Number(balance); i++) {
                    const tokenId = await readContract(config, {
                        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                        abi: PropertyNFTABI.abi,
                        functionName: 'tokenOfOwnerByIndex',
                        args: [address, BigInt(i)]
                    }) as bigint; // Correctly type tokenId

                    const tokenURI = await readContract(config, {
                        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
                        abi: PropertyNFTABI.abi,
                        functionName: 'tokenURI',
                        args: [tokenId]
                    }) as string;

                    if (tokenURI) {
                        const metadataResponse = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
                        const metadata = await metadataResponse.json();
                        const propertyValue = metadata.attributes?.find((a: any) => a.trait_type === 'Property Value')?.value || 0;

                        nfts.push({
                            id: tokenId.toString(),
                            tokenId: Number(tokenId),
                            name: metadata.name || 'Unknown Property',
                            description: metadata.description || 'No description available.',
                            image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || '',
                            owner: address,
                            isCollateral: collateralizedTokenIds.has(tokenId),
                            propertyValue: propertyValue,
                            maxLoan: propertyValue * 0.7, // 70% LTV
                            // these are just illustrative and not in the updated type
                            location: metadata.attributes?.find((a: any) => a.trait_type === 'Location')?.value || 'N/A',
                            price: propertyValue,
                        });
                    }
                }
                setUserNFTs(nfts);

            } catch (error) {
                console.error("Error loading user data:", error);
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
            setRepaying(false);
            setAddingLiquidity(false);
            setFunding(false);
        }
    }, [isPending, isProcessing]);

    return {
        userNFTs,
        userLoans,
        loading,
        userUSDCBalance,
        minting,
        approving,
        creatingLoan,
        repaying,
        addingLiquidity,
        funding,
        isProcessing,
        txSuccess,
        mintPropertyNFT,
        approveNFTForLoan,
        createLoan,
        repayLoan,
        addCCIPLiquidity,
        estimateCCIPFee,
        executeCCIPLoan,
    };
};