import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useContracts } from "../contexts/ContractsContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import {
  ArrowRight,
  Network,
  Globe,
  Zap,
  DollarSign,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  supportedChains,
  getDestinationChains,
  SupportedChainKey,
} from "@/app/lib/chains";
import { formatCurrency } from "@/app/lib/utils";

// Explicitly define the type for a chain object to help TypeScript
interface Chain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: readonly string[];
    };
  };
  blockExplorers: any;
  testnet?: boolean;
  ccipChainSelector: string;
}

export function CrossChainLending() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    addCCIPLiquidity,
    estimateCCIPFee,
    approveUSDC,
    addingLiquidity,
    isProcessing,
  } = useContracts();

  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<bigint>(BigInt(0));
  const [isEstimating, setIsEstimating] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const handleChainSwitch = (newChainId: number) => {
    if (switchChain) {
      switchChain({ chainId: newChainId });
    }
  };

  const currentChain = Object.values(supportedChains).find(
    (chain: Chain) => chain.id === chainId
  );
  const destinationChains = getDestinationChains(chainId) as Chain[];

  useEffect(() => {
    const estimateFee = async () => {
      if (selectedDestination && currentChain) {
        setIsEstimating(true);
        const fee = await estimateCCIPFee(
          selectedDestination as SupportedChainKey
        );
        setEstimatedFee(fee);
        setIsEstimating(false);
      }
    };
    estimateFee();
  }, [selectedDestination, currentChain, estimateCCIPFee]);

  const getChainIcon = (chainName: string) => {
    switch (chainName.toLowerCase()) {
      case "sepolia":
        return "◇";
      case "avalanche fuji":
        return "▲";
      case "polygon mumbai":
        return "⬟";
      case "arbitrum sepolia":
        return "◐";
      default:
        return "○";
    }
  };

  const getChainColor = (chainName: string) => {
    switch (chainName.toLowerCase()) {
      case "sepolia":
        return "text-blue-400";
      case "avalanche fuji":
        return "text-red-400";
      case "polygon mumbai":
        return "text-purple-400";
      case "arbitrum sepolia":
        return "text-blue-300";
      default:
        return "text-cyan-400";
    }
  };

  // Stepper logic
  const resetStepper = () => {
    setStep(1);
    setSelectedDestination("");
    setLoanAmount("");
    setEstimatedFee(BigInt(0));
    setSuccess(false);
    setError(null);
  };

  // Step 3: Execute
  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    try {
      const destChainKey = Object.keys(supportedChains).find(
        (key) => key.toLowerCase() === selectedDestination.toLowerCase()
      );
      if (destChainKey) {
        const chainSelector = BigInt(
          supportedChains[destChainKey as SupportedChainKey].ccipChainSelector
        );
        const amount = BigInt(loanAmount) * BigInt(10 ** 6);
        // Approve USDC first
        const approved = await approveUSDC(amount);
        if (approved) {
          await addCCIPLiquidity(chainSelector, amount, estimatedFee);
          setSuccess(true);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Transaction failed");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stepper Progress */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div
          className={`flex flex-col items-center ${
            step >= 1 ? "text-cyan-400" : "text-gray-500"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 1
                ? "border-cyan-400 bg-cyan-900/40"
                : "border-gray-500 bg-gray-800/40"
            }`}
          >
            1
          </div>
          <span className="text-xs mt-1">Destination</span>
        </div>
        <div
          className={`h-1 w-8 ${step >= 2 ? "bg-cyan-400" : "bg-gray-500"}`}
        ></div>
        <div
          className={`flex flex-col items-center ${
            step >= 2 ? "text-cyan-400" : "text-gray-500"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 2
                ? "border-cyan-400 bg-cyan-900/40"
                : "border-gray-500 bg-gray-800/40"
            }`}
          >
            2
          </div>
          <span className="text-xs mt-1">Amount</span>
        </div>
        <div
          className={`h-1 w-8 ${step >= 3 ? "bg-cyan-400" : "bg-gray-500"}`}
        ></div>
        <div
          className={`flex flex-col items-center ${
            step === 3 ? "text-cyan-400" : "text-gray-500"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 3
                ? "border-cyan-400 bg-cyan-900/40"
                : "border-gray-500 bg-gray-800/40"
            }`}
          >
            3
          </div>
          <span className="text-xs mt-1">Review</span>
        </div>
      </div>

      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Cross-Chain Lending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <CheckCircle className="w-12 h-12 text-green-400 animate-bounce" />
              <div className="text-xl text-green-300 font-bold">Success!</div>
              <div className="text-cyan-200">
                Your cross-chain liquidity was added successfully.
              </div>
              <Button
                onClick={resetStepper}
                className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-2 rounded-lg"
              >
                Add More Liquidity
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-cyan-200 text-base font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" /> Step 1: Select
                    Destination Chain
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    Choose the blockchain network where you want to provide
                    liquidity for lending.
                  </div>
                  <Select
                    value={selectedDestination}
                    onValueChange={(val) => setSelectedDestination(val)}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono">
                      <SelectValue placeholder="Select Destination Chain" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-cyan-500/30">
                      {destinationChains.map((chain: Chain) => (
                        <SelectItem
                          key={chain.id}
                          value={
                            Object.keys(supportedChains).find(
                              (key) =>
                                supportedChains[key as SupportedChainKey].id ===
                                chain.id
                            ) || ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className={getChainColor(chain.name)}>
                              {getChainIcon(chain.name)}
                            </span>
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedDestination}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-2 rounded-lg"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetStepper}
                      className="border-cyan-500/50 text-cyan-400 font-bold px-6 py-2 rounded-lg"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-cyan-200 text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-cyan-400" /> Step 2:
                    Enter Amount
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    Specify the amount of USDC you want to provide as
                    cross-chain liquidity.
                  </div>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 font-bold px-6 py-2 rounded-lg"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!loanAmount || Number(loanAmount) <= 0}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-2 rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-cyan-200 text-base font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" /> Step 3: Review &
                    Confirm
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-700/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 font-bold">
                        Destination:
                      </span>
                      <span className="text-cyan-200">
                        {selectedDestination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 font-bold">Amount:</span>
                      <span className="text-cyan-200">{loanAmount} USDC</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 font-bold">
                        Estimated CCIP Fee:
                      </span>
                      {isEstimating ? (
                        <span className="text-cyan-200 flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Calculating...
                        </span>
                      ) : (
                        <span className="text-cyan-200">
                          {(Number(estimatedFee) / 1e18).toFixed(6)} ETH
                        </span>
                      )}
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-400 font-bold">{error}</div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 font-bold px-6 py-2 rounded-lg"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleExecute}
                      disabled={
                        executing ||
                        isEstimating ||
                        !loanAmount ||
                        !selectedDestination
                      }
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                      {executing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {executing ? "Processing..." : "Confirm & Add Liquidity"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Cross-Chain Protocol Stats */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Protocol Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">total_tvl</div>
              <div className="text-cyan-300 font-mono text-lg">$2.4M</div>
            </div>
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">
                active_chains
              </div>
              <div className="text-cyan-300 font-mono text-lg">4</div>
            </div>
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">
                ccip_messages
              </div>
              <div className="text-cyan-300 font-mono text-lg">127</div>
            </div>
            <div className="space-y-1">
              <div className="text-cyan-500 font-mono text-sm">
                cross_chain_liquidity
              </div>
              <div className="text-cyan-300 font-mono text-lg">$1.8M</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
