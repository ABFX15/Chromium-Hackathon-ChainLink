import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PropertyRiskData, RiskAssessment } from '../lib/bedrock-ai'

export function useRiskAssessment() {
  const [isAssessing, setIsAssessing] = useState(false)

  const assessProperty = useCallback(async (data: PropertyRiskData): Promise<RiskAssessment> => {
    setIsAssessing(true)
    try {
      const response = await fetch('/api/ai/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to assess property risk')
      }

      const assessment = await response.json()
      return assessment
    } catch (error) {
      console.error('Risk assessment failed:', error)
      // Return a fallback assessment
      return {
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
      }
    } finally {
      setIsAssessing(false)
    }
  }, [])

  return {
    assessProperty,
    isAssessing
  }
}

export function usePropertyRiskQuery(data: PropertyRiskData | null) {
  return useQuery({
    queryKey: ['/api/ai/risk-assessment', data],
    queryFn: async () => {
      if (!data) return null
      
      const response = await fetch('/api/ai/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to assess property risk')
      }

      return response.json()
    },
    enabled: !!data,
  })
}

export function useMarketInsightsQuery(location: string, propertyType: string) {
  return useQuery({
    queryKey: ['/api/ai/market-insights', location, propertyType],
    queryFn: async () => {
      const response = await fetch('/api/ai/market-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, propertyType }),
      })

      if (!response.ok) {
        throw new Error('Failed to get market insights')
      }

      return response.json()
    },
    enabled: !!location && !!propertyType,
  })
}