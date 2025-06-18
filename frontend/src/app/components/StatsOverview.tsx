"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Handshake, CreditCard, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePropertyNFTs } from "@/hooks/use-property-nfts";
import { useLoans } from "@/hooks/use-loans";

export function StatsOverview() {
  const { isConnected } = useAccount();
  const { nfts, refetch: refetchNFTs } = usePropertyNFTs();
  const { loans, refetch: refetchLoans } = useLoans();
  const [isClient, setIsClient] = useState(false);

  // Fix hydration by ensuring we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for NFT and loan events
  useEffect(() => {
    const handleNFTMinted = () => {
      refetchNFTs();
    };

    const handleLoanCreated = () => {
      refetchLoans();
    };

    window.addEventListener("nftMinted", handleNFTMinted);
    window.addEventListener("loanCreated", handleLoanCreated);

    return () => {
      window.removeEventListener("nftMinted", handleNFTMinted);
      window.removeEventListener("loanCreated", handleLoanCreated);
    };
  }, [refetchNFTs, refetchLoans]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="glass-effect hover:bg-white/10 transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="glass-effect hover:bg-white/10 transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">
                  Connect wallet to view stats
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalPortfolioValue: nfts.reduce(
      (total, nft) => total + nft.propertyValue,
      0
    ),
    activeLoansCount: loans.filter((loan) => loan.isActive).length,
    totalBorrowed: loans
      .filter((loan) => loan.isActive)
      .reduce((total, loan) => total + loan.debt, 0),
    availableCredit: nfts.reduce(
      (total, nft) => total + (nft.isCollateral ? 0 : nft.maxLoan),
      0
    ),
    interestEarned: 12450, // Mock data for now
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="stats-card hover:scale-105 transition-all duration-300 floating-animation">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                Total Portfolio Value
              </p>
              <p className="text-3xl font-bold text-gradient">
                {formatCurrency(stats.totalPortfolioValue)}
              </p>
              <p className="text-green-400 text-sm mt-1 bounce-animation">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="w-14 h-14 gradient-border glow-effect">
              <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white text-xl pulse-animation" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect hover:bg-white/10 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Active Loans</p>
              <p className="text-2xl font-bold text-white">
                {stats.activeLoansCount}
              </p>
              <p className="text-primary-400 text-sm mt-1">
                <Handshake className="inline w-3 h-3 mr-1" />
                {formatCurrency(stats.totalBorrowed)} borrowed
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Handshake className="text-primary-400 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect hover:bg-white/10 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Available Credit</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.availableCredit)}
              </p>
              <p className="text-secondary-400 text-sm mt-1">
                <CreditCard className="inline w-3 h-3 mr-1" />
                Based on 70% LTV
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="text-secondary-400 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect hover:bg-white/10 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Interest Earned</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.interestEarned)}
              </p>
              <p className="text-yellow-400 text-sm mt-1">
                <PiggyBank className="inline w-3 h-3 mr-1" />
                This year
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <PiggyBank className="text-yellow-400 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
