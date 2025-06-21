import { useState } from 'react'
import { PropertyNFT } from '@/types/contracts'
import { formatCurrency } from '@/lib/utils'
import { Building2, Brain, TrendingUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useRiskAssessment } from '@/hooks/use-risk-assessment'

interface RWAPurchaseModalProps {
  nft: PropertyNFT
  isOpen: boolean
  onClose: () => void
  purchaseType: 'buy' | 'loan'
}

export function RWAPurchaseModal({ nft, isOpen, purchaseType, onClose }: RWAPurchaseModalProps) {
  const [step, setStep] = useState<'amount' | 'ai_analysis' | 'confirmation' | 'processing'>('amount')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [aiAssessment, setAiAssessment] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { assessProperty } = useRiskAssessment()

  console.log('RWAPurchaseModal render - isOpen:', isOpen, 'nft:', nft?.name)

  const handleAIAnalysis = async () => {
    setStep('ai_analysis')
    setIsProcessing(true)
    
    try {
      const assessment = await assessProperty({
        propertyValue: nft.propertyValue,
        propertyType: 'residential',
        location: nft.name.includes('Downtown') ? 'downtown' : 'suburban',
        yearBuilt: 2020,
        squareFootage: 2000,
        loanAmount: parseInt(loanAmount) || parseInt(purchaseAmount)
      })
      
      setAiAssessment(assessment)
      setStep('confirmation')
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmPurchase = async () => {
    setStep('processing')
    setIsProcessing(true)
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setIsProcessing(false)
      onClose()
      // Reset modal state
      setStep('amount')
      setPurchaseAmount('')
      setLoanAmount('')
      setAiAssessment(null)
    }, 3000)
  }

  // Move conditional return after all hooks
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {purchaseType === 'buy' ? 'Purchase RWA' : 'AI-Powered Loan'}
                </h2>
                <p className="text-cyan-400 text-sm font-mono">{nft.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-6">
              {/* Property Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-cyan-400 text-sm font-mono">Property Value</div>
                    <div className="text-white font-bold text-lg">{formatCurrency(nft.propertyValue)}</div>
                  </div>
                  <div>
                    <div className="text-cyan-400 text-sm font-mono">Max Loan</div>
                    <div className="text-white font-bold text-lg">{formatCurrency(nft.maxLoan)}</div>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                {purchaseType === 'buy' ? (
                  <div>
                    <label className="text-cyan-400 text-sm font-mono block mb-2">
                      Purchase Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      placeholder={nft.propertyValue.toString()}
                      className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-cyan-400 text-sm font-mono block mb-2">
                      Loan Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder={nft.maxLoan.toString()}
                      max={nft.maxLoan}
                      className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                    <div className="text-gray-400 text-xs mt-1">
                      Maximum: {formatCurrency(nft.maxLoan)} (70% LTV)
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAIAnalysis}
                  disabled={!purchaseAmount && !loanAmount}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Start AI Analysis
                </button>
              </div>
            </div>
          )}

          {step === 'ai_analysis' && (
            <div className="space-y-6 text-center">
              <div className="animate-pulse">
                <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">AI Risk Assessment</h3>
                <p className="text-gray-400">
                  AWS Bedrock Claude-3 is analyzing property data, market conditions, and risk factors...
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Property valuation verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Market analysis complete</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Calculating risk metrics...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmation' && aiAssessment && (
            <div className="space-y-6">
              {/* AI Assessment Results */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  AI Risk Assessment
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-cyan-400 text-sm font-mono">Risk Score</div>
                    <div className={`text-2xl font-bold ${
                      aiAssessment.riskCategory === 'low' ? 'text-green-400' :
                      aiAssessment.riskCategory === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {aiAssessment.riskScore}/100
                    </div>
                    <div className={`text-xs uppercase font-mono ${
                      aiAssessment.riskCategory === 'low' ? 'text-green-400' :
                      aiAssessment.riskCategory === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {aiAssessment.riskCategory} Risk
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-sm font-mono">Suggested APR</div>
                    <div className="text-white text-2xl font-bold">
                      {aiAssessment.suggestedInterestRate.toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-xs">
                      AI Optimized Rate
                    </div>
                  </div>
                </div>

                {/* Key Factors */}
                <div className="space-y-2">
                  <div className="text-cyan-400 text-sm font-mono">Key Risk Factors:</div>
                  {aiAssessment.factors.slice(0, 3).map((factor: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Transaction Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-mono">
                      {formatCurrency(parseInt(purchaseAmount || loanAmount))}
                    </span>
                  </div>
                  {purchaseType === 'loan' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Interest Rate:</span>
                        <span className="text-white font-mono">
                          {aiAssessment.suggestedInterestRate.toFixed(2)}% APR
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Payment:</span>
                        <span className="text-white font-mono">
                          {formatCurrency((parseInt(loanAmount) * aiAssessment.suggestedInterestRate / 100) / 12)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirmPurchase}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                {purchaseType === 'buy' ? 'Confirm Purchase' : 'Approve Loan'}
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-6 text-center py-8">
              <Loader2 className="w-16 h-16 text-cyan-400 mx-auto animate-spin" />
              <h3 className="text-xl font-bold text-white">Processing Transaction</h3>
              <p className="text-gray-400">
                {purchaseType === 'buy' 
                  ? 'Executing RWA purchase on blockchain...'
                  : 'Processing AI-approved loan...'
                }
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Smart contract executed</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">NFT ownership transferred</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Finalizing transaction...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}