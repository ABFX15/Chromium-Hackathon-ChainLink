import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import {
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  CreditCard,
  Shield,
  Globe,
} from "lucide-react";
import {
  CONTRACT_ADDRESSES,
  LOAN_MANAGER_ABI,
  PROPERTY_NFT_ABI,
  MOCK_USDC_ABI,
} from "@/lib/contracts";
import { PropertyNFT } from "@/types/contracts";
import { formatCurrency } from "@/lib/utils";

interface CompleteWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: PropertyNFT | null;
  mode: "borrow" | "lend";
}

type WorkflowStep = "deposit" | "ai_assessment" | "fund" | "complete";

interface LoanData {
  loanId?: number;
  requestedAmount: number;
  estimatedAPR: number;
  riskScore: number;
  maxLTV: number;
}

export function CompleteWorkflowModal({
  isOpen,
  onClose,
  nft,
  mode,
}: CompleteWorkflowModalProps) {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("deposit");
  const [loanData, setLoanData] = useState<LoanData>({
    requestedAmount: 0,
    estimatedAPR: 5.0,
    riskScore: 0,
    maxLTV: 70,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(mode === "borrow" ? "deposit" : "fund");
      setError(null);
      setIsProcessing(false);
      if (nft) {
        setLoanData((prev) => ({
          ...prev,
          requestedAmount: Math.floor(((nft as any).propertyValue || 0) * 0.7), // 70% LTV
        }));
      }
    }
  }, [isOpen, mode, nft]);

  if (!isOpen || !nft) return null;

  const handleDepositCollateral = async () => {
    if (!isConnected || !address) return;

    setIsProcessing(true);
    setError(null);

    try {
      // First approve NFT to LoanManager
      writeContract({
        address: CONTRACT_ADDRESSES.PROPERTY_NFT as Address,
        abi: PROPERTY_NFT_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER as Address, BigInt(nft.tokenId)],
      });

      // Wait for approval, then create loan
      setTimeout(() => {
        writeContract({
          address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
          abi: LOAN_MANAGER_ABI,
          functionName: "createLoan",
          args: [
            BigInt(nft.tokenId),
            parseUnits(loanData.requestedAmount.toString(), 6),
            BigInt(loanData.estimatedAPR * 100),
          ],
        });
      }, 3000);
    } catch (err: any) {
      setError(`Collateral deposit failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleAIAssessment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call our backend to trigger AWS Lambda risk assessment
      const response = await fetch("/api/ai/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: loanData.loanId,
          propertyData: {
            value: (nft as any).propertyValue || 0,
            type: "Residential",
            location: "Downtown",
            loanAmount: loanData.requestedAmount,
          },
          borrowerData: {
            creditScore: 750,
            address: address,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newAPR = 5 + result.riskScore * 0.1; // Base 5% + risk adjustment
        setLoanData((prev) => ({
          ...prev,
          riskScore: result.riskScore,
          estimatedAPR: newAPR,
        }));
        setCurrentStep("fund");
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(`AI assessment failed: ${err.message}`);
    }

    setIsProcessing(false);
  };

  const handleCrossChainFunding = async () => {
    if (!isConnected || !address) return;

    setIsProcessing(true);
    setError(null);

    try {
      const usdcAmount = parseUnits(loanData.requestedAmount.toString(), 6);

      // First approve USDC to LoanManager
      writeContract({
        address: CONTRACT_ADDRESSES.USDC as Address,
        abi: MOCK_USDC_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.LOAN_MANAGER as Address, usdcAmount],
      });

      // Wait for approval, then fund loan
      setTimeout(() => {
        writeContract({
          address: CONTRACT_ADDRESSES.LOAN_MANAGER as Address,
          abi: LOAN_MANAGER_ABI,
          functionName: "createLoan",
          args: [
            BigInt(loanData.loanId || 1),
            usdcAmount,
            BigInt(loanData.estimatedAPR * 100),
          ],
        });
      }, 3000);
    } catch (err: any) {
      setError(`Cross-chain funding failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    const isActive = currentStep === step;
    const isCompleted = getStepIndex(currentStep) > getStepIndex(step);

    if (isCompleted) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (isActive && isProcessing)
      return <Clock className="w-6 h-6 text-yellow-400 animate-spin" />;

    switch (step) {
      case "deposit":
        return <Shield className="w-6 h-6 text-cyan-400" />;
      case "ai_assessment":
        return <Zap className="w-6 h-6 text-purple-400" />;
      case "fund":
        return <Globe className="w-6 h-6 text-blue-400" />;
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
  };

  const getStepIndex = (step: WorkflowStep) => {
    const steps = ["deposit", "ai_assessment", "fund", "complete"];
    return steps.indexOf(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "deposit":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Deposit NFT Collateral
              </h3>
              <p className="text-gray-400">
                Step 1: Secure your property NFT as loan collateral
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Loan Terms</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Property Value:</span>
                  <span className="text-white ml-2">
                    {formatCurrency((nft as any).propertyValue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Requested Amount:</span>
                  <span className="text-white ml-2">
                    {formatCurrency(loanData.requestedAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">LTV Ratio:</span>
                  <span className="text-white ml-2">
                    {(nft as any).propertyValue
                      ? (
                          (loanData.requestedAmount /
                            (nft as any).propertyValue) *
                          100
                        ).toFixed(1)
                      : "N/A"}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Estimated APR:</span>
                  <span className="text-white ml-2">
                    {loanData.estimatedAPR.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium">
                    Chainlink Price Verification
                  </h4>
                  <p className="text-blue-300 text-sm mt-1">
                    Your property value will be verified using Chainlink's
                    decentralized price oracles before loan creation.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDepositCollateral}
              disabled={isPending || isProcessing}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isPending || isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Depositing Collateral...
                </div>
              ) : (
                "Deposit NFT as Collateral"
              )}
            </button>
          </div>
        );

      case "ai_assessment":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                AI Risk Assessment
              </h3>
              <p className="text-gray-400">
                Step 2: AWS Bedrock analyzes loan risk and adjusts interest
                rates
              </p>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-purple-400 font-medium">
                    AWS Bedrock AI Analysis
                  </h4>
                  <p className="text-purple-300 text-sm mt-1">
                    Claude-3 will analyze property data, market conditions, and
                    borrower profile to determine optimal interest rate.
                  </p>
                </div>
              </div>
            </div>

            {loanData.riskScore > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h4 className="text-white font-semibold mb-3">
                  AI Assessment Results
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Risk Score:</span>
                    <span className="text-white ml-2">
                      {loanData.riskScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Adjusted APR:</span>
                    <span className="text-white ml-2">
                      {loanData.estimatedAPR.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAIAssessment}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 animate-spin" />
                  Running AI Assessment...
                </div>
              ) : (
                "Run AI Risk Assessment"
              )}
            </button>
          </div>
        );

      case "fund":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Cross-Chain Funding
              </h3>
              <p className="text-gray-400">
                Step 3: Fund loan via Chainlink CCIP to Avalanche
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium">
                    Chainlink CCIP Transfer
                  </h4>
                  <p className="text-blue-300 text-sm mt-1">
                    USDC will be sent cross-chain to Avalanche Fuji where the
                    borrower can access funds. You'll receive a LenderNFT
                    representing your position.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Funding Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Loan Amount:</span>
                  <span className="text-white">
                    {formatCurrency(loanData.requestedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interest Rate:</span>
                  <span className="text-white">
                    {loanData.estimatedAPR.toFixed(2)}% APR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Destination:</span>
                  <span className="text-white">Avalanche Fuji</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CCIP Fees:</span>
                  <span className="text-white">~0.01 ETH</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCrossChainFunding}
              disabled={isPending || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isPending || isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 animate-spin" />
                  Sending Cross-Chain...
                </div>
              ) : (
                "Fund Loan Cross-Chain"
              )}
            </button>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Workflow Complete!
              </h3>
              <p className="text-gray-400">
                {mode === "borrow"
                  ? "Your NFT is now collateralized and ready for funding"
                  : "Loan funded successfully via Chainlink CCIP"}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {mode === "borrow" ? "Borrow Against NFT" : "Fund Loan"} -{" "}
            {(nft as any).name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {(
              ["deposit", "ai_assessment", "fund", "complete"] as WorkflowStep[]
            ).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    getStepIndex(currentStep) >= index
                      ? "border-cyan-400 bg-cyan-400/20"
                      : "border-gray-600"
                  }`}
                >
                  {getStepIcon(step)}
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      getStepIndex(currentStep) > index
                        ? "bg-cyan-400"
                        : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
