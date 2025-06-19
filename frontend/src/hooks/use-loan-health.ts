import { useReadContract, useWatchContractEvent } from 'wagmi';
import { formatUnits } from 'viem';
import { type Abi } from 'viem';
import LoanManagerJSON from '../abis/LoanManager.json';
import { useState, useEffect } from 'react';

const LoanManagerABI = LoanManagerJSON.abi as Abi;
const LOAN_MANAGER_ADDRESS = '0xa06E2EC33adD56Eab0629Ba6A0C9A709822941ac';

// Constants from LoanManager.sol
const WARNING_THRESHOLD = 8500; // 85%
const SOFT_LIQUIDATION_THRESHOLD = 8000; // 80%
const HARD_LIQUIDATION_THRESHOLD = 7500; // 75%

export type LoanHealth = {
    loanId: number;
    currentLTV: number;
    riskLevel: 'SAFE' | 'WARNING' | 'SOFT_LIQUIDATION' | 'HARD_LIQUIDATION';
    timeToLiquidation: number | null;
    healthFactor: number;
};

interface LoanDetails {
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

export function useLoanHealth(loanId: number) {
    const [health, setHealth] = useState<LoanHealth | null>(null);

    // Get current loan data
    const { data: loan } = useReadContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerABI,
        functionName: 'getLoanDetails',
        args: [BigInt(loanId)],
    }) as { data: LoanDetails | undefined };

    // Get AI risk score
    const { data: riskScore } = useReadContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerABI,
        functionName: 'getAIRiskScore',
        args: [BigInt(loanId)],
    });

    // Get current debt
    const { data: currentDebt } = useReadContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerABI,
        functionName: 'calculateCurrentDebt',
        args: [BigInt(loanId)],
    }) as { data: bigint | undefined };

    // Watch for loan updates
    useWatchContractEvent({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerABI,
        eventName: 'LoanUpdated',
        onLogs: () => {
            // Trigger a re-fetch of loan data
            // This will cause the useEffect below to run
        },
    });

    useEffect(() => {
        if (!loan || !currentDebt) return;

        const ltv = Number(formatUnits(currentDebt, 6)) / Number(formatUnits(loan.principalAmount, 6)) * 100;

        // Calculate risk level
        let riskLevel: LoanHealth['riskLevel'] = 'SAFE';
        if (ltv >= HARD_LIQUIDATION_THRESHOLD) {
            riskLevel = 'HARD_LIQUIDATION';
        } else if (ltv >= SOFT_LIQUIDATION_THRESHOLD) {
            riskLevel = 'SOFT_LIQUIDATION';
        } else if (ltv >= WARNING_THRESHOLD) {
            riskLevel = 'WARNING';
        }

        // Calculate health factor (1 is the liquidation threshold)
        const healthFactor = SOFT_LIQUIDATION_THRESHOLD / ltv;

        // Estimate time to liquidation based on current trend
        let timeToLiquidation = null;
        if (riskLevel !== 'SAFE') {
            // Simple estimation - assumes linear growth
            const rateOfChange = 0.1; // 0.1% per hour
            const hoursToLiquidation = (HARD_LIQUIDATION_THRESHOLD - ltv) / rateOfChange;
            timeToLiquidation = Math.max(0, hoursToLiquidation);
        }

        setHealth({
            loanId,
            currentLTV: ltv,
            riskLevel,
            timeToLiquidation,
            healthFactor,
        });
    }, [loan, currentDebt, loanId]);

    return {
        health,
        riskScore: Number(riskScore || 0),
        isLoading: !health,
    };
} 