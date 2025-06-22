import { useState } from "react";
import { PropertyNFT } from "@/types/contracts";
import {
  X,
  ExternalLink,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  Zap,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CompleteWorkflowModal } from "./CompleteWorkflowModal";
import { useAccount } from "wagmi";

interface NFTDetailModalProps {
  nft: PropertyNFT | null;
  isOpen: boolean;
  onClose: () => void;
  showBuyButton?: boolean;
  onBuy?: (nft: PropertyNFT) => void;
}

export function NFTDetailModal({
  nft,
  isOpen,
  onClose,
  showBuyButton,
  onBuy,
}: NFTDetailModalProps) {
  const { isConnected } = useAccount();
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<"borrow" | "lend">("borrow");

  const handleWorkflowStart = (mode: "borrow" | "lend") => {
    setWorkflowMode(mode);
    setWorkflowModalOpen(true);
  };

  if (!isOpen || !nft) return null;

  // Helper function with proper type safety
  const getRarity = (value: number) => {
    if (value > 800000)
      return { name: "LEGENDARY", color: "text-yellow-400 bg-yellow-400/20" };
    if (value > 650000)
      return { name: "EPIC", color: "text-purple-400 bg-purple-400/20" };
    if (value > 500000)
      return { name: "RARE", color: "text-blue-400 bg-blue-400/20" };
    return { name: "COMMON", color: "text-gray-400 bg-gray-400/20" };
  };

  const rarity = getRarity((nft as any).propertyValue); // Now properly typed

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl border border-cyan-500/30 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {(nft as any).name}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${rarity.color} border`}
              >
                {rarity.name}
              </span>
              <span className="text-gray-400 text-sm">
                Token ID #{(nft as any).tokenId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Side: Image and Description */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video">
              <img
                src={
                  (nft as any).image || "/properties/property-placeholder.jpg"
                }
                alt={(nft as any).name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {(nft as any).description}
            </p>
          </div>

          {/* Right Side: Stats and Actions */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Property Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency((nft as any).propertyValue)}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Max Loan (70%)</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency((nft as any).maxLoan)}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{(nft as any).location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-semibold ${
                      (nft as any).isCollateral
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {(nft as any).isCollateral ? "Collateralized" : "Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isConnected && (
              <div className="space-y-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleWorkflowStart("borrow")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Borrow Against NFT
                </button>
                <button
                  onClick={() => handleWorkflowStart("lend")}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <DollarSign className="w-5 h-5" />
                  Lend / Fund Loan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CompleteWorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        nft={nft}
        mode={workflowMode}
      />
    </div>
  );
}
