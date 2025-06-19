import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { type Abi } from 'viem';
import { useQuery } from '@tanstack/react-query';
import AIRiskManagerJSON from '../abis/AIRiskManager.json';
import { PropertyRiskData, RiskAssessment } from '../types/bedrock-ai';

const AIRiskManagerABI = AIRiskManagerJSON.abi as Abi;
const AI_RISK_MANAGER_ADDRESS = '0x1234...'; // Replace with actual address

export function usePropertyRiskQuery(data: PropertyRiskData | null) {
    return useQuery({
        queryKey: ['propertyRisk', data],
        queryFn: async () => {
            if (!data) return null;
            const response = await fetch('/api/risk-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to get risk assessment');
            return response.json();
        },
        enabled: !!data,
    });
}

export function useMarketInsightsQuery(location: string, propertyType: string) {
    return useQuery({
        queryKey: ['marketInsights', location, propertyType],
        queryFn: async () => {
            if (!location || !propertyType) return null;
            const response = await fetch('/api/market-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, propertyType }),
            });
            if (!response.ok) throw new Error('Failed to get market insights');
            return response.json();
        },
        enabled: !!(location && propertyType),
    });
}

export function useRiskAssessment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

            await writeContract({
                address: AI_RISK_MANAGER_ADDRESS,
                abi: AIRiskManagerABI,
                functionName: 'updateAIRiskScore',
                args: [propertyId, BigInt(Math.floor(data.score * 100))],
            });

            return {
                riskScore: data.score * 100,
                riskCategory: 'medium',
                suggestedInterestRate: data.score * 10,
                maxLTV: 80,
                confidence: data.confidence,
                factors: data.factors,
                recommendations: [data.recommendation]
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