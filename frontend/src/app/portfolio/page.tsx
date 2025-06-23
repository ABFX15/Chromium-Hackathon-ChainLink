"use client";

import { useContracts } from "@/app/hooks/useContracts";
import { PropertyNFTCard } from "@/app/components/PropertyNFTCard";
import {
  Building2,
  Wallet,
  TrendingUp,
  DollarSign,
  Landmark,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "viem";
import { Card, CardContent } from "@/app/components/ui/card";
import { MintNFTModal } from "@/app/components/MintNFTModal";

export default function PortfolioPage() {
  const { userNFTs, userUSDCBalance, loading } = useContracts();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  const { totalValue, averageValue } = useMemo(() => {
    const total = userNFTs.reduce(
      (sum, nft) => sum + (nft.propertyValue || 0),
      0
    );
    const avg = userNFTs.length > 0 ? total / userNFTs.length : 0;
    return { totalValue: total, averageValue: avg };
  }, [userNFTs]);

  const formattedUSDCBalance =
    typeof userUSDCBalance === "bigint" ? formatUnits(userUSDCBalance, 6) : "0";

  const stats = [
    {
      title: "Portfolio Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: Landmark,
      color: "from-blue-500 to-blue-600",
      description: "Total estimated value of your properties",
    },
    {
      title: "Total Properties",
      value: userNFTs.length,
      icon: Building2,
      color: "from-cyan-500 to-cyan-600",
      description: "Number of properties in your wallet",
    },
    {
      title: "Avg. Property Value",
      value: `$${averageValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      description: "Average value per property",
    },
    {
      title: "Available Balance",
      value: `$${Number(formattedUSDCBalance).toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      description: "USDC ready for investment",
    },
  ];

  return (
    <div className="min-h-screen text-white p-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Wallet className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl lg:text-5xl font-bold font-heading bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              My Portfolio
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            An overview of your real estate assets and performance
          </p>
          <button
            onClick={() => setIsMintModalOpen(true)}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Mint New Property NFT
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="font-medium text-gray-300">{stat.title}</p>
                  <p className="text-sm text-gray-400">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Properties Grid */}
        <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 p-6">
          <h2 className="text-2xl font-bold font-heading text-white mb-6">
            My Properties ({userNFTs.length})
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl p-4 animate-pulse"
                >
                  <div className="h-48 bg-gray-700/50 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : userNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNFTs.map((nft) => (
                <PropertyNFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                You don't own any properties yet.
              </h3>
              <p className="text-gray-400 mb-6">
                Visit the marketplace to start building your portfolio.
              </p>
              <Link
                href="/marketplace"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </Card>
      </div>
      <MintNFTModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
      />
    </div>
  );
}
