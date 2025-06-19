import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { type Abi } from 'viem';
import AIRiskManagerJSON from '../abis/AIRiskManager.json';

const AIRiskManagerABI = AIRiskManagerJSON.abi as Abi;
const AI_RISK_MANAGER_ADDRESS = '0x1234...'; // Replace with actual address

export type RiskAssessment = {
    score: number;
    recommendation: string;
    confidence: number;
    factors: {
        name: string;
        impact: number;
        description: string;
    }[];
};

export function useRiskAssessment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Contract interaction for updating risk score
    const { writeContract } = useWriteContract();

    const assessPropertyRisk = async (
        propertyId: string,
        location: string,
        value: number,
        propertyType: string
    ): Promise<RiskAssessment | null> => {
        setLoading(true);
        setError(null);

        try {
            // Call AWS Bedrock API for risk assessment
            const response = await fetch('/api/risk-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    propertyId,
                    location,
                    value,
                    propertyType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get risk assessment');
            }

            const data = await response.json();

            // Update risk score on-chain
            await writeContract({
                address: AI_RISK_MANAGER_ADDRESS,
                abi: AIRiskManagerABI,
                functionName: 'updateAIRiskScore',
                args: [propertyId, BigInt(Math.floor(data.score * 100))],
            });

            return {
                score: data.score,
                recommendation: data.recommendation,
                confidence: data.confidence,
                factors: data.factors,
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        assessPropertyRisk,
        loading,
        error,
    };
} 