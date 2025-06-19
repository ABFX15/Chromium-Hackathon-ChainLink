"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "../hooks/use-contracts";
import { useProperties } from "../hooks/use-properties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Building2,
  Wallet,
  TrendingUp,
  Brain,
  Activity,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  Zap,
  ImageIcon,
} from "lucide-react";
import { Marketplace } from "../components/Marketplace";

// Fallback image for properties without photos
const FALLBACK_IMAGE = "/properties/property-placeholder.jpg";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const {
    properties,
    isLoading: propertiesLoading,
    loadMore,
  } = useProperties();

  const {
    userNFTs,
    userLoans,
    userUSDCBalance,
    protocolYield,
    aiRiskScores,
    createLoan,
    addLiquidity,
    withdrawYield,
  } = useContracts();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#000000] text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#0c1620] to-[#000000] opacity-80"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZjY2ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#0ff] to-[#2d6dff] rounded-full mb-6 shadow-[0_0_30px_rgba(45,109,255,0.5)]">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#0ff] via-[#2d6dff] to-[#0ff] text-transparent bg-clip-text">
                Private Credit Vault
              </h1>
              <p className="text-xl text-[#88ccff] mb-8 leading-relaxed">
                Connect your wallet to access the next-generation decentralized
                lending platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-[#0f1c2e]/30 backdrop-blur-sm rounded-xl border border-[#2d6dff]/30 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
                <Shield className="w-8 h-8 text-[#0ff] mb-3" />
                <h3 className="text-lg font-semibold mb-2">Secure Lending</h3>
                <p className="text-[#88ccff] text-sm">
                  AI-powered risk assessment with real-time collateral
                  monitoring
                </p>
              </div>
              <div className="p-6 bg-[#0f1c2e]/30 backdrop-blur-sm rounded-xl border border-[#2d6dff]/30 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
                <Zap className="w-8 h-8 text-[#0ff] mb-3" />
                <h3 className="text-lg font-semibold mb-2">Cross-Chain</h3>
                <p className="text-[#88ccff] text-sm">
                  Seamless liquidity across multiple blockchain networks
                </p>
              </div>
              <div className="p-6 bg-[#0f1c2e]/30 backdrop-blur-sm rounded-xl border border-[#2d6dff]/30 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
                <Sparkles className="w-8 h-8 text-[#0ff] mb-3" />
                <h3 className="text-lg font-semibold mb-2">Smart Yield</h3>
                <p className="text-[#88ccff] text-sm">
                  Optimized returns through intelligent protocol management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case "createLoan":
          await createLoan("1", "1000000");
          break;
        case "addLiquidity":
          await addLiquidity("500000");
          break;
        case "withdrawYield":
          await withdrawYield();
          break;
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#0c1620] to-[#000000] opacity-80"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZjY2ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0ff] to-[#2d6dff] text-transparent bg-clip-text">
                  Dashboard
                </h1>
                <p className="text-[#88ccff] mt-1">
                  Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0ff]/10 border border-[#0ff]/30 rounded-full">
                  <div className="w-2 h-2 bg-[#0ff] rounded-full animate-pulse"></div>
                  <span className="text-[#0ff] text-sm">Connected</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-[#0f1c2e]/30 backdrop-blur-sm rounded-lg p-1 border border-[#2d6dff]/30">
              {["overview", "portfolio", "loans", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedTab === tab
                      ? "bg-gradient-to-r from-[#0ff] to-[#2d6dff] text-white shadow-[0_0_15px_rgba(45,109,255,0.3)]"
                      : "text-[#88ccff] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="group bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm hover:border-[#0ff]/50 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#0ff]">
                  Portfolio Value
                </CardTitle>
                <Wallet className="h-4 w-4 text-[#0ff] group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  $
                  {userUSDCBalance
                    ? (Number(userUSDCBalance) / 1e6).toLocaleString()
                    : "0.00"}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-[#0ff]" />
                  <span className="text-[#0ff] text-sm">+12.5%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm hover:border-[#0ff]/50 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#0ff]">
                  Active Loans
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-[#0ff] group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userLoans?.length || 0}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-[#0ff]" />
                  <span className="text-[#0ff] text-sm">+2 this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm hover:border-[#0ff]/50 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#0ff]">
                  Protocol Yield
                </CardTitle>
                <Activity className="h-4 w-4 text-[#0ff] group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  $
                  {protocolYield
                    ? (Number(protocolYield) / 1e6).toLocaleString()
                    : "0.00"}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-[#0ff]" />
                  <span className="text-[#0ff] text-sm">+8.3% APY</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm hover:border-[#0ff]/50 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(45,109,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#0ff]">
                  Risk Score
                </CardTitle>
                <Brain className="h-4 w-4 text-[#0ff] group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {Object.values(aiRiskScores)[0] || "N/A"}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="w-4 h-4 text-[#0ff]" />
                  <span className="text-[#0ff] text-sm">-5 points</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Marketplace */}
            <div className="lg:col-span-2">
              <Card className="bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm shadow-[0_0_15px_rgba(45,109,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#0ff] flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Property Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Marketplace
                    properties={properties}
                    isLoading={propertiesLoading}
                    onLoadMore={loadMore}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Activity */}
            <div className="space-y-6">
              <Card className="bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm shadow-[0_0_15px_rgba(45,109,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#0ff] flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-[#0ff] to-[#2d6dff] hover:from-[#0ff]/80 hover:to-[#2d6dff]/80 transition-all duration-200 shadow-[0_0_15px_rgba(45,109,255,0.3)]"
                    onClick={() => handleAction("createLoan")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Create New Loan"}
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-[#0ff] to-[#2d6dff] hover:from-[#0ff]/80 hover:to-[#2d6dff]/80 transition-all duration-200 shadow-[0_0_15px_rgba(45,109,255,0.3)]"
                    onClick={() => handleAction("addLiquidity")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Add Liquidity"}
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-[#0ff] to-[#2d6dff] hover:from-[#0ff]/80 hover:to-[#2d6dff]/80 transition-all duration-200 shadow-[0_0_15px_rgba(45,109,255,0.3)]"
                    onClick={() => handleAction("withdrawYield")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Withdraw Yield"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#0f1c2e]/30 border-[#2d6dff]/30 backdrop-blur-sm shadow-[0_0_15px_rgba(45,109,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#0ff] flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0ff]/5 border border-[#0ff]/20">
                      <div className="w-2 h-2 rounded-full bg-[#0ff] animate-pulse"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Loan #123 funded
                        </div>
                        <div className="text-xs text-[#88ccff]">
                          $50,000 • 2m ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2d6dff]/5 border border-[#2d6dff]/20">
                      <div className="w-2 h-2 rounded-full bg-[#2d6dff]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Risk score updated
                        </div>
                        <div className="text-xs text-[#88ccff]">
                          Score: 72 • 1h ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0ff]/5 border border-[#0ff]/20">
                      <div className="w-2 h-2 rounded-full bg-[#0ff]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Property value updated
                        </div>
                        <div className="text-xs text-[#88ccff]">
                          +$25,000 • 3h ago
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
