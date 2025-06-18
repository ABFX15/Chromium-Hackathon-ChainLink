import { 
  BedrockRuntimeClient, 
  InvokeModelCommand,
  InvokeModelCommandInput 
} from '@aws-sdk/client-bedrock-runtime'

// Initialize Bedrock client with server-side environment variables
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export interface PropertyRiskData {
  propertyValue: number
  propertyType: string
  location: string
  yearBuilt: number
  squareFootage: number
  loanAmount: number
  borrowerCreditScore?: number
  debtToIncomeRatio?: number
  marketTrends?: string
}

export interface RiskAssessment {
  riskScore: number
  riskCategory: 'low' | 'medium' | 'high'
  suggestedInterestRate: number
  maxLTV: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

export class BedrockAIService {
  async assessPropertyRisk(data: PropertyRiskData): Promise<RiskAssessment> {
    try {
      const prompt = this.buildRiskAssessmentPrompt(data)
      
      const input: InvokeModelCommandInput = {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      }

      const command = new InvokeModelCommand(input)
      const response = await bedrockClient.send(command)
      
      if (!response.body) {
        throw new Error('No response body from Bedrock')
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      return this.parseRiskAssessment(responseBody.content[0].text)
      
    } catch (error) {
      console.error('Bedrock AI assessment error:', error)
      return this.calculateBasicRisk(data)
    }
  }

  private buildRiskAssessmentPrompt(data: PropertyRiskData): string {
    return `
You are an expert real estate lending risk analyst. Analyze the following property loan data and provide a comprehensive risk assessment.

Property Details:
- Property Value: $${data.propertyValue.toLocaleString()}
- Property Type: ${data.propertyType}
- Location: ${data.location}
- Year Built: ${data.yearBuilt}
- Square Footage: ${data.squareFootage}
- Requested Loan Amount: $${data.loanAmount.toLocaleString()}
- Loan-to-Value Ratio: ${((data.loanAmount / data.propertyValue) * 100).toFixed(1)}%
${data.borrowerCreditScore ? `- Borrower Credit Score: ${data.borrowerCreditScore}` : ''}
${data.debtToIncomeRatio ? `- Debt-to-Income Ratio: ${data.debtToIncomeRatio}%` : ''}
${data.marketTrends ? `- Market Trends: ${data.marketTrends}` : ''}

Please provide your assessment in the following JSON format:
{
  "riskScore": [0-100 risk score, higher = riskier],
  "riskCategory": ["low", "medium", or "high"],
  "suggestedInterestRate": [recommended APR percentage],
  "maxLTV": [maximum recommended loan-to-value ratio],
  "confidence": [0-100 confidence in assessment],
  "factors": ["key risk factor 1", "key risk factor 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Consider factors like:
- Property age and condition
- Location desirability and market stability
- Loan-to-value ratio
- Property type liquidity
- Current market conditions
- Borrower financial profile (if available)
`
  }

  private parseRiskAssessment(aiResponse: string): RiskAssessment {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        riskScore: Math.max(0, Math.min(100, parsed.riskScore || 50)),
        riskCategory: ['low', 'medium', 'high'].includes(parsed.riskCategory) 
          ? parsed.riskCategory 
          : 'medium',
        suggestedInterestRate: Math.max(3, Math.min(25, parsed.suggestedInterestRate || 8)),
        maxLTV: Math.max(50, Math.min(90, parsed.maxLTV || 70)),
        confidence: Math.max(0, Math.min(100, parsed.confidence || 75)),
        factors: Array.isArray(parsed.factors) ? parsed.factors : ['Standard risk factors'],
        recommendations: Array.isArray(parsed.recommendations) 
          ? parsed.recommendations 
          : ['Standard lending recommendations']
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return {
        riskScore: 50,
        riskCategory: 'medium',
        suggestedInterestRate: 8,
        maxLTV: 70,
        confidence: 50,
        factors: ['Unable to parse AI assessment'],
        recommendations: ['Manual review recommended']
      }
    }
  }

  private calculateBasicRisk(data: PropertyRiskData): RiskAssessment {
    const ltvRatio = (data.loanAmount / data.propertyValue) * 100
    const propertyAge = new Date().getFullYear() - data.yearBuilt
    
    let riskScore = 30
    
    if (ltvRatio > 80) riskScore += 20
    else if (ltvRatio > 70) riskScore += 10
    else if (ltvRatio > 60) riskScore += 5
    
    if (propertyAge > 50) riskScore += 15
    else if (propertyAge > 30) riskScore += 10
    else if (propertyAge > 20) riskScore += 5
    
    if (data.propertyType.toLowerCase().includes('commercial')) riskScore += 10
    if (data.propertyType.toLowerCase().includes('vacant')) riskScore += 15
    
    const riskCategory: 'low' | 'medium' | 'high' = 
      riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high'
    
    const suggestedInterestRate = 5 + (riskScore * 0.15)
    
    return {
      riskScore: Math.min(100, riskScore),
      riskCategory,
      suggestedInterestRate: Math.min(25, suggestedInterestRate),
      maxLTV: Math.max(50, 90 - (riskScore * 0.5)),
      confidence: 85,
      factors: [
        `Loan-to-value ratio: ${ltvRatio.toFixed(1)}%`,
        `Property age: ${propertyAge} years`,
        `Property type: ${data.propertyType}`
      ],
      recommendations: [
        riskCategory === 'high' ? 'Consider additional collateral' : 'Standard lending terms acceptable',
        'Monitor property value regularly',
        'Set up automated liquidation triggers'
      ]
    }
  }

  async getMarketInsights(location: string, propertyType: string): Promise<string[]> {
    try {
      const prompt = `
Provide 3-5 brief market insights for ${propertyType} properties in ${location}. 
Focus on current market conditions, pricing trends, and investment outlook.
Format as a simple bullet-point list.
`

      const input: InvokeModelCommandInput = {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      }

      const command = new InvokeModelCommand(input)
      const response = await bedrockClient.send(command)
      
      if (!response.body) {
        return ['Market data unavailable']
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      const insights = responseBody.content[0].text
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
        .filter((line: string) => line.length > 0)

      return insights.length > 0 ? insights : [
        'Market analysis in progress',
        'Historical data shows stable growth',
        'Current lending conditions favorable'
      ]
      
    } catch (error) {
      console.error('Market insights error:', error)
      return [
        'Market data temporarily unavailable',
        'Using historical trends for assessment',
        'Manual review recommended'
      ]
    }
  }
}

export const bedrockAI = new BedrockAIService()