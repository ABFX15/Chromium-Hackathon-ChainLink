"use client";

import { useContracts } from "@/app/hooks/useContracts";
import { PropertyNFTCard } from "@/app/components/PropertyNFTCard";
import { StatsCard } from "@/components/ui/stats-card";
import { Building2, Wallet, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { PropertyNFT } from "@/types/contracts";
import Link from "next/link";
import { formatUnits } from "viem";

export default function PortfolioPage() {
  const { userNFTs, userUSDCBalance, loading } = useContracts();

  const { totalValue, averageValue } = useMemo(() => {
    const total = userNFTs.reduce((sum, nft) => sum + nft.propertyValue, 0);
    const avg = userNFTs.length ? total / userNFTs.length : 0;
    return { totalValue: total, averageValue: avg };
  }, [userNFTs]);

  const formattedUSDCBalance =
    typeof userUSDCBalance === "bigint" ? formatUnits(userUSDCBalance, 6) : "0";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">My Portfolio</h1>
          </div>
          <p className="text-gray-400">
            Track your real estate investments and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Properties"
            value={String(userNFTs.length || 0)}
            icon={Building2}
            description="Number of properties owned"
          />
          <StatsCard
            title="Portfolio Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={Wallet}
            description="Total value of properties"
          />
          <StatsCard
            title="Average Value"
            value={`$${averageValue.toLocaleString()}`}
            icon={TrendingUp}
            description="Average property value"
          />
        </div>

        {/* Properties Grid */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-xl font-semibold text-white">My Properties</h2>
            <div className="px-3 py-1 bg-purple-500/20 rounded-full">
              <span className="text-sm text-purple-300">
                {userNFTs.length || 0} items
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass-effect rounded-xl p-6 animate-pulse"
                >
                  <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No properties found
              </h3>
              <p className="text-gray-400 mb-4">
                Visit the marketplace to browse available properties
              </p>
              <Link
                href="/marketplace"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>

        {/* USDC Balance */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Available Balance
              </h3>
              <div className="text-3xl font-bold text-green-400">
                ${Number(formattedUSDCBalance).toLocaleString()} USDC
              </div>
              <p className="text-gray-400 text-sm mt-1">Ready for investment</p>
            </div>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
