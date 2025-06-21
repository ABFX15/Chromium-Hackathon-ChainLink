import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RiskMetrics {
  riskScore: number
  riskCategory: 'low' | 'medium' | 'high'
  suggestedInterestRate: number
  maxLTV: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

export function AIAnalytics() {
  const [propertyValue, setPropertyValue] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeRisk = async () => {
    if (!propertyValue || !loanAmount) {
      setError('Please enter both property value and loan amount')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyValue: parseFloat(propertyValue),
          loanAmount: parseFloat(loanAmount),
          propertyType: 'Residential',
          location: 'New York, NY',
          yearBuilt: 2010,
          squareFootage: 2000,
          borrowerCreditScore: 750,
          debtToIncomeRatio: 30
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Risk assessment API error:', errorText)
        throw new Error('Risk assessment failed')
      }

      const assessment = await response.json()
      setRiskMetrics(assessment)
    } catch (err) {
      setError('Failed to analyze risk. Please check your AWS Bedrock configuration.')
      console.error('Risk analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'low':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-cyan-400'
    }
  }

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      case 'medium':
        return <TrendingUp className="w-4 h-4" />
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Risk Assessment Input */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Brain className="w-5 h-5" />
            [ai_risk_analyzer]
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-cyan-500 font-mono text-sm">property_value</label>
              <Input
                type="number"
                placeholder="250000"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-cyan-500 font-mono text-sm">loan_amount</label>
              <Input
                type="number"
                placeholder="175000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono"
              />
            </div>
          </div>

          <Button
            onClick={analyzeRisk}
            disabled={isAnalyzing}
            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                analyzing_with_aws_bedrock...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                [run_ai_analysis]
              </>
            )}
          </Button>

          {error && (
            <div className="text-red-400 font-mono text-sm bg-red-500/10 border border-red-500/30 rounded p-3">
              error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Risk Results */}
      {riskMetrics && (
        <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              [ai_risk_results]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Score & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">risk_score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono text-cyan-300">
                    {riskMetrics.riskScore}
                  </span>
                  <span className="text-cyan-500/70 font-mono">/100</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">category</span>
                <div className={`flex items-center gap-2 ${getRiskColor(riskMetrics.riskCategory)} font-mono`}>
                  {getRiskIcon(riskMetrics.riskCategory)}
                  <span>{riskMetrics.riskCategory.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Interest Rate & LTV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">suggested_apr</span>
                <span className="text-xl font-mono text-cyan-300">
                  {riskMetrics.suggestedInterestRate.toFixed(2)}%
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">max_ltv</span>
                <span className="text-xl font-mono text-cyan-300">
                  {riskMetrics.maxLTV}%
                </span>
              </div>
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <span className="text-cyan-500 font-mono text-sm">ai_confidence</span>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${riskMetrics.confidence}%` }}
                  />
                </div>
                <span className="text-cyan-300 font-mono text-sm">
                  {riskMetrics.confidence}%
                </span>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-y-2">
              <span className="text-cyan-500 font-mono text-sm">key_factors</span>
              <div className="space-y-1">
                {riskMetrics.factors.map((factor, index) => (
                  <div key={index} className="text-cyan-300/80 font-mono text-sm flex items-start gap-2">
                    <span className="text-cyan-500">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <span className="text-cyan-500 font-mono text-sm">ai_recommendations</span>
              <div className="space-y-1">
                {riskMetrics.recommendations.map((rec, index) => (
                  <div key={index} className="text-cyan-300/80 font-mono text-sm flex items-start gap-2">
                    <span className="text-cyan-500">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI System Status */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Brain className="w-5 h-5" />
            [bedrock_status]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-cyan-300 font-mono text-sm">
              <span className="text-green-400 animate-pulse">●</span>
              <span>aws_bedrock: connected</span>
            </div>
            <div className="flex items-center gap-3 text-cyan-300 font-mono text-sm">
              <span className="text-green-400 animate-pulse">●</span>
              <span>claude_3_sonnet: ready</span>
            </div>
            <div className="flex items-center gap-3 text-cyan-300 font-mono text-sm">
              <span className="text-green-400 animate-pulse">●</span>
              <span>risk_assessment: operational</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}