
import { useState } from 'react';
import { RiskAssessment } from '../lib/bedrock-ai';

interface UseAIAssessmentProps {
  onAssessmentComplete?: (assessment: RiskAssessment) => void;
}

export function useAIAssessment({ onAssessmentComplete }: UseAIAssessmentProps = {}) {
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = async (data: {
    propertyValue: number;
    propertyType: string;
    location: string;
    yearBuilt: number;
    squareFootage: number;
    loanAmount: number;
    borrowerCreditScore?: number;
    debtToIncomeRatio?: number;
  }) => {
    setIsAssessing(true);
    setError(null);

    try {
      const response = await fetch('/api/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Assessment failed: ${response.status}`);
      }

      const result = await response.json();
      setAssessment(result);
      
      if (onAssessmentComplete) {
        onAssessmentComplete(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Assessment failed';
      setError(errorMessage);
      console.error('AI Assessment error:', err);
      throw err;
    } finally {
      setIsAssessing(false);
    }
  };

  const resetAssessment = () => {
    setAssessment(null);
    setError(null);
  };

  return {
    assessment,
    isAssessing,
    error,
    runAssessment,
    resetAssessment,
  };
}
