"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import {
    LOAN_MANAGER_ADDRESS,
    PROPERTY_NFT_ADDRESS,
    COLLATERAL_VAULT_ADDRESS,
    LENDER_NFT_ADDRESS,
    AI_RISK_MANAGER_ADDRESS,
    PROPERTY_ORACLE_ADDRESS,
    USDC_ADDRESS,
    ASSET_TYPES,
    LOAN_CONSTANTS,
    CHAINLINK_FUNCTIONS_ROUTER,
    CHAINLINK_LINK_TOKEN,
    CHAINLINK_CCIP_ROUTER,
} from "../../constants";
import LoanManagerABI from "../../abis/LoanManager.json";
import PropertyNFTABI from "../../abis/PropertyNFT.json";
import CollateralVaultABI from "../../abis/CollateralVault.json";
import LenderNFTABI from "../../abis/LenderNFT.json";
import AIRiskManagerABI from "../../abis/AIRiskManager.json";
import MockUSDCABI from "../../abis/MockUSDC.json";

export interface Loan {
    loanId: bigint;
    tokenId: bigint;
    principalAmount: bigint;
    interestRate: bigint;
    startTimestamp: bigint;
    borrower: string;
    lender: string;
    isActive: boolean;
    isFunded: boolean;
    assetType: bigint;
}

export interface NFTMetadata {
    tokenId: number;
    owner: string;
    uri: string;
    value?: number;
    isCollateral?: boolean;
}

export interface LenderPosition {
    tokenId: number;
    loanId: number;
    amount: bigint;
    lender: string;
}

export interface ChainLiquidity {
    chainSelector: bigint;
    totalLiquidity: bigint;
    availableLiquidity: bigint;
    utilizationRate: bigint;
}

export interface AIRiskScore {
    loanId: number;
    riskScore: number;
    interestRate: number;
    volatilityScore: number;
}

export const useContracts = () => {
    const { address, isConnected } = useAccount();
    const [userNFTs, setUserNFTs] = useState<NFTMetadata[]>([]);
    const [userLoans, setUserLoans] = useState<Loan[]>([]);
    const [lenderPositions, setLenderPositions] = useState<LenderPosition[]>([]);
    const [chainLiquidity, setChainLiquidity] = useState<ChainLiquidity[]>([]);
    const [aiRiskScores, setAiRiskScores] = useState<AIRiskScore[]>([]);
    const [loading, setLoading] = useState(false);

    // Contract reads
    const { data: userBalance } = useReadContract({
        address: PROPERTY_NFT_ADDRESS as `0x${string}`,
        abi: PropertyNFTABI.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const { data: nextLoanId } = useReadContract({
        address: LOAN_MANAGER_ADDRESS as `0x${string}`,
        abi: LoanManagerABI.abi,
        functionName: "nextLoanId",
    });

    const { data: userUSDCBalance } = useReadContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: MockUSDCABI.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const { data: protocolYield } = useReadContract({
        address: LOAN_MANAGER_ADDRESS as `0x${string}`,
        abi: LoanManagerABI.abi,
        functionName: "protocolYield",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Contract writes
    const { writeContract: writeContract, data: writeData } = useWriteContract();

    // Transaction status
    const { isLoading: minting, isSuccess: mintSuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: approving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: depositing, isSuccess: depositSuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: funding, isSuccess: fundSuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: repaying, isSuccess: repaySuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: requestingValuation, isSuccess: valuationSuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: addingLiquidity, isSuccess: liquiditySuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    const { isLoading: withdrawingYield, isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    // Helper functions
    const mintPropertyNFT = async (tokenId: number, uri: string) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: PROPERTY_NFT_ADDRESS as `0x${string}`,
                abi: PropertyNFTABI.abi,
                functionName: "safeMint",
                args: [address, BigInt(tokenId), uri],
            });
        } catch (error) {
            console.error("Error minting NFT:", error);
        } finally {
            setLoading(false);
        }
    };

    const approveNFTForLoan = async (tokenId: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: PROPERTY_NFT_ADDRESS as `0x${string}`,
                abi: PropertyNFTABI.abi,
                functionName: "approve",
                args: [LOAN_MANAGER_ADDRESS, BigInt(tokenId)],
            });
        } catch (error) {
            console.error("Error approving NFT:", error);
        } finally {
            setLoading(false);
        }
    };

    const createLoan = async (tokenId: number, amount: number, assetType: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: LOAN_MANAGER_ADDRESS as `0x${string}`,
                abi: LoanManagerABI.abi,
                functionName: "depositNFTCollateral",
                args: [BigInt(tokenId), BigInt(amount), BigInt(assetType)],
            });
        } catch (error) {
            console.error("Error creating loan:", error);
        } finally {
            setLoading(false);
        }
    };

    const fundLoanCrossChain = async (loanId: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: LOAN_MANAGER_ADDRESS as `0x${string}`,
                abi: LoanManagerABI.abi,
                functionName: "fundLoanCrossChain",
                args: [BigInt(loanId)],
                value: BigInt(1000000000000000), // 0.001 ETH for CCIP fees
            });
        } catch (error) {
            console.error("Error funding loan:", error);
        } finally {
            setLoading(false);
        }
    };

    const repayLoanAmount = async (loanId: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: LOAN_MANAGER_ADDRESS as `0x${string}`,
                abi: LoanManagerABI.abi,
                functionName: "repayLoan",
                args: [BigInt(loanId)],
            });
        } catch (error) {
            console.error("Error repaying loan:", error);
        } finally {
            setLoading(false);
        }
    };

    const approveUSDCForLoan = async (amount: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: USDC_ADDRESS as `0x${string}`,
                abi: MockUSDCABI.abi,
                functionName: "approve",
                args: [LOAN_MANAGER_ADDRESS, BigInt(amount)],
            });
        } catch (error) {
            console.error("Error approving USDC:", error);
        } finally {
            setLoading(false);
        }
    };

    // New AI Risk Management functions
    const requestAIRiskScore = async (loanId: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: AI_RISK_MANAGER_ADDRESS as `0x${string}`,
                abi: AIRiskManagerABI.abi,
                functionName: "requestRiskScore",
                args: [BigInt(loanId)],
            });
        } catch (error) {
            console.error("Error requesting AI risk score:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateAIRiskScore = async (loanId: number, riskScore: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: AI_RISK_MANAGER_ADDRESS as `0x${string}`,
                abi: AIRiskManagerABI.abi,
                functionName: "updateRiskScore",
                args: [BigInt(loanId), BigInt(riskScore)],
            });
        } catch (error) {
            console.error("Error updating AI risk score:", error);
        } finally {
            setLoading(false);
        }
    };

    // Property Oracle functions (simplified for now)
    const requestPropertyValuation = async (tokenId: number) => {
        if (!address) return;

        try {
            setLoading(true);
            // For now, just simulate the valuation
            console.log(`Requesting property valuation for token ${tokenId}`);
            // TODO: Implement actual Chainlink Functions call when PropertyOracle ABI is available
        } catch (error) {
            console.error("Error requesting property valuation:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cross-chain liquidity functions
    const addChainLiquidity = async (chainSelector: number, amount: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: LOAN_MANAGER_ADDRESS as `0x${string}`,
                abi: LoanManagerABI.abi,
                functionName: "addChainLiquidity",
                args: [BigInt(chainSelector)],
                value: BigInt(1000000000000000), // 0.001 ETH for CCIP fees
            });
        } catch (error) {
            console.error("Error adding chain liquidity:", error);
        } finally {
            setLoading(false);
        }
    };

    const withdrawChainLiquidity = async (chainSelector: number, amount: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: LOAN_MANAGER_ADDRESS as `0x${string}`,
                abi: LoanManagerABI.abi,
                functionName: "withdrawChainLiquidity",
                args: [BigInt(chainSelector), BigInt(amount)],
            });
        } catch (error) {
            console.error("Error withdrawing chain liquidity:", error);
        } finally {
            setLoading(false);
        }
    };

    // Yield management functions
    const withdrawProtocolYield = async () => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: LOAN_MANAGER_ADDRESS as `0x${string}`,
                abi: LoanManagerABI.abi,
                functionName: "withdrawProtocolYield",
                args: [],
            });
        } catch (error) {
            console.error("Error withdrawing protocol yield:", error);
        } finally {
            setLoading(false);
        }
    };

    // Property value management
    const setPropertyValue = async (tokenId: number, value: number) => {
        if (!address) return;

        try {
            setLoading(true);
            writeContract({
                address: COLLATERAL_VAULT_ADDRESS as `0x${string}`,
                abi: CollateralVaultABI.abi,
                functionName: "setPropertyValueTest",
                args: [BigInt(tokenId), BigInt(value)],
            });
        } catch (error) {
            console.error("Error setting property value:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate current debt for a loan
    const calculateCurrentDebt = async (loanId: number) => {
        // This would need to be implemented with proper contract reading
        // For now, return a placeholder
        return BigInt(0);
    };

    // Get loan details
    const getLoanDetails = async (loanId: number) => {
        // This would need to be implemented with proper contract reading
        // For now, return a placeholder
        return null;
    };

    // Get AI risk score
    const getAIRiskScore = async (loanId: number) => {
        // This would need to be implemented with proper contract reading
        // For now, return a placeholder
        return BigInt(0);
    };

    // Load user data
    useEffect(() => {
        if (!address || !userBalance) return;

        const loadUserData = async () => {
            // Load user NFTs - simplified for now
            const nfts: NFTMetadata[] = [];
            for (let i = 0; i < Number(userBalance); i++) {
                nfts.push({
                    tokenId: i + 1,
                    owner: address,
                    uri: `https://ipfs.io/ipfs/QmDemo${i + 1}`,
                    value: 500000 + (i * 250000), // Demo values
                });
            }
            setUserNFTs(nfts);

            // Load user loans - simplified for now
            const loans: Loan[] = [];
            // TODO: Implement proper loan loading when contract reading is set up
            setUserLoans(loans);

            // Load lender positions
            const positions: LenderPosition[] = [];
            // This would require iterating through LenderNFT tokens owned by user
            setLenderPositions(positions);

            // Load AI risk scores
            const riskScores: AIRiskScore[] = [];
            // TODO: Implement proper risk score loading
            setAiRiskScores(riskScores);
        };

        loadUserData();
    }, [address, userBalance, nextLoanId]);

    return {
        // State
        userNFTs,
        userLoans,
        lenderPositions,
        chainLiquidity,
        aiRiskScores,
        loading,
        nextLoanId: nextLoanId ? Number(nextLoanId) : 0,
        userUSDCBalance: userUSDCBalance ? Number(userUSDCBalance) : 0,
        protocolYield: protocolYield ? Number(protocolYield) : 0,

        // Loading states
        minting,
        approving,
        depositing,
        funding,
        repaying,
        requestingValuation,
        addingLiquidity,
        withdrawingYield,

        // Success states
        mintSuccess,
        approveSuccess,
        depositSuccess,
        fundSuccess,
        repaySuccess,
        valuationSuccess,
        liquiditySuccess,
        withdrawSuccess,

        // Functions
        mintPropertyNFT,
        approveNFTForLoan,
        createLoan,
        fundLoanCrossChain,
        repayLoanAmount,
        approveUSDCForLoan,
        requestAIRiskScore,
        updateAIRiskScore,
        requestPropertyValuation,
        addChainLiquidity,
        withdrawChainLiquidity,
        withdrawProtocolYield,
        setPropertyValue,
        calculateCurrentDebt,
        getLoanDetails,
        getAIRiskScore,

        // Constants
        ASSET_TYPES,
        LOAN_CONSTANTS,
        CHAINLINK_FUNCTIONS_ROUTER,
        CHAINLINK_LINK_TOKEN,
        CHAINLINK_CCIP_ROUTER,
    };
}; 