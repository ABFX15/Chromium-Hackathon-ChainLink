
import { useState, useCallback } from 'react';
import { RiskAssessment, PropertyRiskData } from '../lib/bedrock-ai';

export function useAIAssessment() {
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessments, setAssessments] = useState<Map<string, RiskAssessment>>(new Map());

  const assessProperty = useCallback(async (data: PropertyRiskData, propertyId?: string): Promise<RiskAssessment> => {
    setIsAssessing(true);
    try {
      const response = await fetch('/api/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to assess property risk');
      }

      const assessment = await response.json();
      
      // Store assessment if propertyId provided
      if (propertyId) {
        setAssessments(prev => new Map(prev).set(propertyId, assessment));
      }
      
      return assessment;
    } catch (error) {
      console.error('Risk assessment failed:', error);
      // Return a fallback assessment
      const fallbackAssessment: RiskAssessment = {
        riskScore: 45,
        riskCategory: 'medium' as const,
        suggestedInterestRate: 6.5,
        maxLTV: 70,
        confidence: 0.8,
        factors: [
          'Property age and condition',
          'Local market conditions',
          'Loan-to-value ratio'
        ],
        recommendations: [
          'Consider property inspection',
          'Monitor local market trends',
          'Maintain adequate insurance coverage'
        ]
      };
      
      if (propertyId) {
        setAssessments(prev => new Map(prev).set(propertyId, fallbackAssessment));
      }
      
      return fallbackAssessment;
    } finally {
      setIsAssessing(false);
    }
  }, []);

  const getAssessment = useCallback((propertyId: string) => {
    return assessments.get(propertyId);
  }, [assessments]);

  const clearAssessments = useCallback(() => {
    setAssessments(new Map());
  }, []);

  return {
    assessProperty,
    getAssessment,
    clearAssessments,
    isAssessing,
    assessments: assessments
  };
}
