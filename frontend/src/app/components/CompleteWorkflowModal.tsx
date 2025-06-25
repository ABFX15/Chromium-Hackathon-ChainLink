import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { parseUnits, formatUnits, Address, parseEther } from "viem";
import {
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  CreditCard,
  Shield,
  Globe,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { useContracts } from "../contexts/ContractsContext";
import { PropertyNFT } from "@/types/contracts";
import { formatCurrency } from "@/lib/utils";

interface CompleteWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: PropertyNFT | null;
  mode: "borrow" | "lend" | "buy";
}

type WorkflowStep =
  | "deposit"
  | "ai_assessment"
  | "ai_strategy"
  | "fund"
  | "complete";

interface LoanData {
  loanId?: number;
  requestedAmount: number;
  estimatedAPR: number;
  riskScore: number;
  maxLTV: number;
}

interface AIStrategy {
  protocol: string;
  apy: number;
  projectedYield: number;
}

export function CompleteWorkflowModal({
  isOpen,
  onClose,
  nft,
  mode,
}: CompleteWorkflowModalProps) {
  const { address, isConnected } = useAccount();
  const {
    fundLoan,
    depositNFTCollateral,
    approveNFT,
    approveUSDC,
    isProcessing: isContractProcessing,
    creatingLoan,
    approving,
    allLoans,
  } = useContracts();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("ai_assessment");
  const [loanData, setLoanData] = useState<LoanData>({
    requestedAmount: 0,
    estimatedAPR: 5.0,
    riskScore: 0,
    maxLTV: 70,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<AIStrategy | null>(null);
  const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);

  const { writeContractAsync } = useWriteContract();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsProcessing(false);
      setProcessingMessage("");
      setAssessmentComplete(false);
      setAiStrategy(null);
      setAcknowledgeRisk(false);

      if (mode === "lend") {
        if (!nft) return;
        console.log("DEBUG: allLoans", allLoans, "nft", nft);
        const loanToFund = allLoans.find(
          (loan) =>
            BigInt(loan.tokenId) === BigInt(nft.tokenId) &&
            loan.isActive &&
            !loan.isFunded
        );

        if (loanToFund) {
          const apr = Number(loanToFund.interestRate) / 100;
          const inferredRiskScore = Math.round((apr - 5) * 10);
          const requestedAmount = Number(loanToFund.principalAmount) / 1e6;

          setCurrentStep("ai_assessment");
          setLoanData({
            loanId: Number(loanToFund.loanId),
            requestedAmount: requestedAmount,
            estimatedAPR: apr,
            riskScore: inferredRiskScore > 0 ? inferredRiskScore : 0,
            maxLTV: 70,
          });

          // For demo property, always run a mock AI assessment
          if (nft.tokenId === 9100) {
            setTimeout(() => {
              setLoanData((prev) => ({
                ...prev,
                riskScore: 72,
                estimatedAPR: 6.2,
              }));
              setProcessingMessage(
                "AI assessment complete - loan terms optimized!"
              );
              setAssessmentComplete(true);
              setAiStrategy({
                protocol: "Aave",
                apy: 3.2,
                projectedYield: requestedAmount * 0.032,
              });
            }, 800);
          } else {
            handleAIAssessment(requestedAmount, true);
          }
        } else {
          setError("No active, unfunded loan available for this property.");
          setCurrentStep("fund");
        }
      } else {
        setCurrentStep("ai_assessment");
        if (nft) {
          setLoanData({
            requestedAmount: Math.floor(
              ((nft as any).propertyValue || 0) * 0.7
            ),
            estimatedAPR: 5.0,
            riskScore: 0,
            maxLTV: 70,
          });
        }
      }
    }
  }, [isOpen, mode, nft, allLoans]);

  if (!isOpen || !nft) return null;

  const handleDepositCollateral = async () => {
    if (!isConnected || !address || !nft) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Approve NFT for LoanManager
      setProcessingMessage("Approving NFT for collateral...");
      const approved = await approveNFT(BigInt(nft.tokenId));
      if (!approved) {
        throw new Error("NFT Approval failed. Please try again.");
      }

      // Step 2: Create the loan
      setProcessingMessage("Depositing NFT as collateral...");
      const created = await depositNFTCollateral(
        BigInt(nft.tokenId),
        parseUnits(loanData.requestedAmount.toString(), 6),
        loanData.estimatedAPR,
        0 // assetType 0 for Real Estate
      );

      if (!created) {
        throw new Error("Collateral deposit failed. Please try again.");
      }

      setProcessingMessage("Loan created successfully!");
      setCurrentStep("complete");
    } catch (err: any) {
      console.error("Collateral deposit failed:", err);
      setError(`Collateral deposit failed: ${err.shortMessage || err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  };

  const handleAIAssessment = async (amount: number, isLenderFlow = false) => {
    setIsProcessing(true);
    setError(null);
    setProcessingMessage("AI analyzing property and market conditions...");

    try {
      // Call our backend to trigger AWS Bedrock risk assessment
      const response = await fetch("/api/assess-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyValue: (nft as any).propertyValue || 0,
          loanAmount: amount,
          propertyType: "Single Family",
          location: (nft as any).location || "Unknown Location",
          yearBuilt: 2005,
          squareFootage: 2400,
          borrowerCreditScore: 750,
          debtToIncomeRatio: 35,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newAPR = Math.max(3.5, 5 + (result.riskScore / 100) * 10); // Dynamic APR based on risk
        setLoanData((prev) => ({
          ...prev,
          riskScore: result.riskScore,
          estimatedAPR: newAPR,
        }));
        setProcessingMessage("AI assessment complete - loan terms optimized!");
        setAssessmentComplete(true);

        if (isLenderFlow || mode === "lend") {
          setAiStrategy({
            protocol: "Aave",
            apy: 3.2,
            projectedYield: amount * 0.032,
          });
        }
      } else {
        throw new Error(result.error || "Risk assessment failed");
      }
    } catch (err: any) {
      console.error("AI Assessment Error:", err);
      setError(`AI assessment is currently unavailable. Using default values.`);
      // Fallback to default risk assessment
      setLoanData((prev) => ({
        ...prev,
        riskScore: 45, // Default medium risk
        estimatedAPR: 6.5, // Default APR
      }));
      // Generate a mock AI strategy on error
      setAiStrategy({
        protocol: "Aave",
        apy: 3.2,
        projectedYield: amount * 0.032,
      });
      setProcessingMessage("Using default risk assessment and strategy");
      setAssessmentComplete(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrossChainFunding = async () => {
    const loanToFund = allLoans.find(
      (loan) =>
        loan.tokenId === BigInt(nft!.tokenId) && loan.isActive && !loan.isFunded
    );

    if (!isConnected || !address || !loanToFund) {
      setError("Could not find an active, unfunded loan for this property.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const usdcAmount = parseUnits(loanData.requestedAmount.toString(), 6);

      // First approve USDC to LoanManager
      setProcessingMessage("Approving USDC transfer...");
      const approved = await approveUSDC(usdcAmount);
      if (!approved) {
        throw new Error("USDC approval failed. Please try again.");
      }

      setProcessingMessage("Funding loan via contract hook...");
      const fee = parseEther("0.01"); // Hardcoded fee, can be replaced by estimation
      const funded = await fundLoan(Number(loanToFund.loanId), fee);
      if (!funded) {
        throw new Error("Funding failed. Please try again.");
      }

      setProcessingMessage("Loan funded successfully!");
      setCurrentStep("complete");
    } catch (err: any) {
      setError(
        `Cross-chain funding failed: ${err.shortMessage || err.message}`
      );
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
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
      case "ai_strategy":
        return <BrainCircuit className="w-6 h-6 text-orange-400" />;
      case "fund":
        return <Globe className="w-6 h-6 text-blue-400" />;
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
  };

  const getStepIndex = (step: WorkflowStep) => {
    if (mode === "lend") {
      const lendSteps: WorkflowStep[] = [
        "ai_assessment",
        "ai_strategy",
        "fund",
        "complete",
      ];
      return lendSteps.indexOf(step);
    }
    const borrowSteps: WorkflowStep[] = [
      "ai_assessment",
      "deposit",
      "complete",
    ];
    return borrowSteps.indexOf(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "deposit":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Confirm Loan Request
              </h3>
              <p className="text-gray-400">
                Step 2: Review and submit your loan request. Your NFT will be
                held as collateral.
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
              disabled={isProcessing || creatingLoan || approving}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isProcessing || creatingLoan || approving ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  {processingMessage || "Processing..."}
                </div>
              ) : (
                "Submit Loan Request"
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
                Step 1: AWS Bedrock analyzes loan risk and adjusts interest
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

            {assessmentComplete && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acknowledge-risk"
                  checked={acknowledgeRisk}
                  onChange={(e) => setAcknowledgeRisk(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-cyan-600"
                />
                <label
                  htmlFor="acknowledge-risk"
                  className="text-gray-300 text-sm"
                >
                  I have reviewed the AI risk assessment and understand the
                  risks involved.
                </label>
              </div>
            )}

            {!assessmentComplete ? (
              <button
                onClick={() => handleAIAssessment(loanData.requestedAmount)}
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
            ) : (
              <button
                onClick={() =>
                  setCurrentStep(mode === "lend" ? "ai_strategy" : "deposit")
                }
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                disabled={!acknowledgeRisk}
              >
                Proceed
              </button>
            )}
          </div>
        );
      case "ai_strategy":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                AI-Powered Yield Strategy
              </h3>
              <p className="text-gray-400">
                The AI suggests an optimal yield-farming strategy for the loaned
                capital.
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <h4 className="text-orange-400 font-medium">
                    Automated Yield Farming on Avalanche
                  </h4>
                  <p className="text-orange-300 text-sm mt-1">
                    Funds will be deposited into Aave to generate additional
                    yield for the lender while the borrower receives their
                    principal.
                  </p>
                </div>
              </div>
            </div>

            {aiStrategy && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-4">
                <h4 className="text-white font-semibold mb-3">
                  Strategy Details
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Protocol:</span>
                  <span className="text-white font-bold">
                    {aiStrategy.protocol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Projected APY:</span>
                  <span className="text-green-400 font-bold">
                    {aiStrategy.apy.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Est. Extra Yield (1yr):</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency(aiStrategy.projectedYield)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
              <div className="text-center">
                <div className="p-3 bg-gray-700 rounded-full mb-2">
                  {" "}
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                Sepolia
              </div>
              <ArrowRight className="w-6 h-6 text-gray-500" />
              <div className="text-center">
                <div className="p-3 bg-gray-700 rounded-full mb-2">
                  {" "}
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                Avalanche
              </div>
              <ArrowRight className="w-6 h-6 text-gray-500" />
              <div className="text-center">
                <div className="p-3 bg-gray-700 rounded-full mb-2">
                  {" "}
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                Aave
              </div>
            </div>

            <button
              onClick={() => setCurrentStep("fund")}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Proceed to Funding
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
                  <span className="text-gray-400">AI Risk Score:</span>
                  <span className="text-white">{loanData.riskScore}/100</span>
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
              disabled={isProcessing || creatingLoan || approving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isProcessing || creatingLoan || approving ? (
                <div className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 animate-spin" />
                  {processingMessage || "Funding..."}
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
                {mode === "borrow"
                  ? "Loan Request Submitted!"
                  : "Loan Funded Successfully!"}
              </h3>
              <p className="text-gray-400">
                {mode === "borrow"
                  ? "Your NFT is now collateralized and your loan is listed on the marketplace."
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
            {mode === "borrow"
              ? "Request a Loan"
              : mode === "lend"
              ? "Fund Loan"
              : "Purchase Property"}{" "}
            - {(nft as any).name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {(mode === "lend"
              ? ["ai_assessment", "ai_strategy", "fund", "complete"]
              : ["ai_assessment", "deposit", "complete"]
            ).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    getStepIndex(currentStep as WorkflowStep) >= index
                      ? "border-cyan-400 bg-cyan-400/20"
                      : "border-gray-600"
                  }`}
                >
                  {getStepIcon(step as WorkflowStep)}
                </div>
                {index < (mode === "lend" ? 3 : 2) && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      getStepIndex(currentStep as WorkflowStep) > index
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
