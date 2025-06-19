export interface PropertyRiskData {
    propertyValue: number;
    propertyType: string;
    location: string;
    yearBuilt: number;
    squareFootage: number;
    loanAmount: number;
    locationRisk?: number;
    marketTrend?: number;
    condition?: string;
    age?: number;
}

export interface RiskAssessment {
    riskScore: number;
    riskCategory: 'low' | 'medium' | 'high';
    suggestedInterestRate: number;
    maxLTV: number;
    confidence: number;
    factors: string[];
    recommendations: string[];
} 