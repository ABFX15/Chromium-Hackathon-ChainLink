import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useContracts } from "../hooks/useContracts";
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

  return (
    <div className="space-y-6">
      {/* Chain Status */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Network className="w-5 h-5" />
            Chain Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentChain ? (
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${getChainColor(currentChain.name)}`}>
                {getChainIcon(currentChain.name)}
              </span>
              <div className="flex-1">
                <div className="text-cyan-300 font-mono">
                  {currentChain.name}
                </div>
                <div className="text-cyan-500/70 font-mono text-sm">
                  chain_id: {currentChain.id}
                </div>
              </div>
              <div className="text-green-400 font-mono text-sm flex items-center gap-1">
                <span className="animate-pulse">●</span>
                connected
              </div>
            </div>
          ) : (
            <div className="text-red-400 font-mono text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              unsupported_chain
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Chains */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Available Networks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(supportedChains).map((chain: Chain) => (
              <div
                key={chain.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  chainId === chain.id
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : "border-gray-600/30 hover:border-cyan-500/30 hover:bg-gray-800/50"
                }`}
                onClick={() => handleChainSwitch(chain.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xl ${getChainColor(chain.name)}`}>
                    {getChainIcon(chain.name)}
                  </span>
                  <span className="text-cyan-300 font-mono text-sm">
                    {chain.name}
                  </span>
                </div>
                <div className="text-cyan-500/70 font-mono text-xs">
                  {chain.nativeCurrency.symbol}
                </div>
                {chainId === chain.id && (
                  <div className="text-green-400 font-mono text-xs mt-1">
                    current
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Chain Lending Interface */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Add Cross-Chain Liquidity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentChain?.name === "Sepolia" ? (
            <>
              {/* Source Chain (Collateral) */}
              <div className="space-y-2">
                <label className="text-cyan-500 font-mono text-sm">
                  collateral_chain
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                  <span
                    className={`text-xl ${getChainColor(currentChain.name)}`}
                  >
                    {getChainIcon(currentChain.name)}
                  </span>
                  <div className="flex-1">
                    <div className="text-cyan-300 font-mono">
                      {currentChain.name}
                    </div>
                    <div className="text-cyan-500/70 font-mono text-xs">
                      nft_collateral_deposits
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </div>

              {/* Destination Chain (Lending Pool) */}
              <div className="space-y-2">
                <label className="text-cyan-500 font-mono text-sm">
                  lending_pool_chain
                </label>
                <Select
                  value={selectedDestination}
                  onValueChange={setSelectedDestination}
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
              </div>

              {/* Loan Amount */}
              <div className="space-y-2">
                <label className="text-cyan-500 font-mono text-sm">
                  loan_amount_usdc
                </label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="bg-gray-800/50 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>

              {/* CCIP Fee Estimation */}
              {selectedDestination && (
                <div className="space-y-2">
                  <label className="text-cyan-500 font-mono text-sm">
                    estimated_ccip_fee
                  </label>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                    {isEstimating ? (
                      <div className="text-cyan-300 font-mono text-sm">
                        calculating...
                      </div>
                    ) : (
                      <div className="text-cyan-300 font-mono">
                        {(Number(estimatedFee) / 1e18).toFixed(6)} ETH
                      </div>
                    )}
                    <div className="text-cyan-500/70 font-mono text-xs">
                      cross_chain_message_fee
                    </div>
                  </div>
                </div>
              )}

              {/* Execute Cross-Chain Loan */}
              <Button
                disabled={
                  !selectedDestination ||
                  !loanAmount ||
                  !address ||
                  addingLiquidity ||
                  isProcessing
                }
                onClick={async () => {
                  if (selectedDestination && loanAmount) {
                    const destChainKey = Object.keys(supportedChains).find(
                      (key) =>
                        key.toLowerCase() === selectedDestination.toLowerCase()
                    );

                    if (destChainKey) {
                      const chainSelector = BigInt(
                        supportedChains[destChainKey as SupportedChainKey]
                          .ccipChainSelector
                      );
                      const amount = BigInt(loanAmount) * BigInt(10 ** 6);
                      // Approve USDC first
                      const approved = await approveUSDC(amount);
                      if (approved) {
                        await addCCIPLiquidity(
                          chainSelector,
                          amount,
                          estimatedFee
                        );
                      }
                    }
                  }
                }}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono"
              >
                <Zap className="w-4 h-4 mr-2" />
                {addingLiquidity || isProcessing
                  ? "Executing..."
                  : "Add Liquidity Cross-Chain"}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-cyan-500/70 font-mono text-sm mb-4">
                Switch to Sepolia to provide collateral or liquidity.
              </div>
              <Button
                onClick={() => handleChainSwitch(supportedChains.sepolia.id)}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 font-mono"
              >
                <Network className="w-4 h-4 mr-2" />
                Switch to Sepolia
              </Button>
            </div>
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
