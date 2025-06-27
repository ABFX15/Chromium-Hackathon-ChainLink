import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { NFTDetailModal } from "./NFTDetailModal";
import { Badge } from "@/app/components/ui/badge";
import {
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  ExternalLink,
  Star,
  Activity,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { CompleteWorkflowModal } from "./CompleteWorkflowModal";
import { useAccount } from "wagmi";
import { useContracts } from "../contexts/ContractsContext";
import { NFT as ContractNFT } from "../hooks/useContracts";
import { useAIAssessment } from "../hooks/use-ai-assessment";

interface PropertyNFTCardProps {
  nft: ContractNFT;
  showBuyButton?: boolean;
  onBuy?: (nft: ContractNFT) => void;
}

export function PropertyNFTCard({
  nft,
  showBuyButton = false,
  onBuy,
}: PropertyNFTCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<"buy" | "borrow" | "lend">(
    "buy"
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const { address } = useAccount();
  const { allLoans } = useContracts();
  const { getAssessment } = useAIAssessment();
  const aiAssessment = getAssessment(nft.tokenId.toString());

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowMode("buy");
    setWorkflowModalOpen(true);
  };

  const handleLoanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowMode("borrow");
    setWorkflowModalOpen(true);
  };

  const handleLendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowMode("lend");
    setWorkflowModalOpen(true);
  };

  // Guard clause to handle undefined nft
  if (!nft) {
    return (
      <div className="nft-card bg-gray-800/50 border border-gray-700 rounded-20 p-6">
        <div className="text-center text-gray-400">
          <div className="text-sm">NFT data not available</div>
        </div>
      </div>
    );
  }

  if (nft.isSyncing) {
    return (
      <div className="nft-card group">
        <div className="relative h-56 overflow-hidden rounded-t-20 animate-pulse bg-gray-800">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="p-6 space-y-4 bg-gray-800/50 rounded-b-20">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
            <div className="flex items-center text-white/60 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              On-chain Asset
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Zap className="w-4 h-4 animate-spin" />
              <p className="text-sm">{nft.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const relevantLoan = allLoans.find(
    (loan) => loan.tokenId === BigInt(nft.tokenId) && loan.isActive
  );
  const isOwner = address === nft.owner;
  const canBorrow = isOwner && !nft.isCollateral;
  // For demo: always allow lending for the demo property (tokenId 9100)
  const isDemoLend = nft.tokenId === 9100;
  const canLend =
    isDemoLend ||
    (!isOwner && nft.isCollateral && relevantLoan && !relevantLoan.isFunded);

  return (
    <>
      <div
        className="nft-card group cursor-pointer"
        onClick={(e) => {
          // Only open modal if not clicking on a button
          const target = e.target as HTMLElement;
          if (target.tagName !== "BUTTON" && !target.closest("button")) {
            setIsModalOpen(true);
          }
        }}
      >
        {/* Header Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <Badge className="bg-green-400/10 text-green-400 border-green-400/30 border font-semibold text-xs px-3 py-1">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
          <div className="flex space-x-2">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
              <Star className="w-3 h-3 mr-1 text-yellow-400" />
              Chain-Verified
            </Badge>
            {aiAssessment && (
              <Badge className="bg-purple-400/10 text-purple-400 border-purple-400/30 border font-semibold text-xs px-3 py-1 ml-2">
                <Zap className="w-3 h-3 mr-1" />
                AI Risk: {aiAssessment.riskScore}/100
              </Badge>
            )}
          </div>
        </div>

        {/* Image Container */}
        <div className="relative h-56 overflow-hidden rounded-t-20">
          {!imageLoaded && <div className="absolute inset-0 skeleton"></div>}
          <img
            src={nft.image}
            alt={nft.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Eye className="w-4 h-4 text-white" />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Location */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-all duration-300">
              {nft.name}
            </h3>
            <div className="flex items-center text-white/60 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              On-chain Asset
            </div>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide">
                Property Value
              </p>
              <p className="text-white font-bold text-lg">
                {formatCurrency(nft.propertyValue)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide">
                Token ID
              </p>
              <p className="text-white font-bold text-lg">
                #{nft.tokenId.toString()}
              </p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white/50 text-xs">Max LTV</p>
                <p className="text-white font-semibold text-sm">70%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white/50 text-xs">Status</p>
                <p className="text-white font-semibold text-sm">
                  {nft.isCollateral ? "Collateralized" : "Available"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm col-span-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
            <div className="grid grid-cols-1">
              {canBorrow ? (
                <button
                  onClick={handleLoanClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  Request Loan
                </button>
              ) : canLend ? (
                <button
                  onClick={handleLendClick}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Fund Loan
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-20"></div>
      </div>

      <NFTDetailModal
        nft={nft}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showBuyButton={showBuyButton}
        onBuy={onBuy}
      />

      <CompleteWorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        nft={nft}
        mode={workflowMode}
      />
    </>
  );
}
