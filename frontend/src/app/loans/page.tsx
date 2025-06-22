"use client";

import { useMemo, useState } from "react";
import { useContracts } from "@/app/hooks/useContracts";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import {
  Zap,
  DollarSign,
  TrendingUp,
  Activity,
  BarChart2,
  List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ActiveLoans } from "../components/ActiveLoans";
import { StatsCard } from "@/components/ui/stats-card";

export default function LoansPage() {
  const { userLoans, loading } = useContracts();
  const router = useRouter();

  const stats = useMemo(() => {
    const activeLoans = userLoans.filter((loan) => loan.isActive);
    const totalBorrowed = activeLoans.reduce(
      (sum, loan) => sum + Number(loan.principalAmount) / 1e6, // Assuming USDC has 6 decimals
      0
    );
    const avgAPR =
      activeLoans.length > 0
        ? activeLoans.reduce(
            (sum, loan) => sum + Number(loan.interestRate) / 100,
            0
          ) / activeLoans.length
        : 0;

    return {
      totalBorrowed,
      activeLoanCount: activeLoans.length,
      avgAPR,
    };
  }, [userLoans]);

  const handleCreateLoanClick = () => {
    // Navigate to the marketplace to select an NFT to borrow against
    router.push("/marketplace");
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Manage your NFT-collateralized loans and funding
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Borrowed"
          value={formatCurrency(stats.totalBorrowed)}
          icon={DollarSign}
          description="Total principal amount of active loans"
        />
        <StatsCard
          title="Active Loans"
          value={stats.activeLoanCount.toString()}
          icon={Activity}
          description="Number of loans currently active"
        />
        <StatsCard
          title="Avg APR"
          value={`${stats.avgAPR.toFixed(2)}%`}
          icon={TrendingUp}
          description="Average annual percentage rate"
        />
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-white/60">Loading your loans...</p>
        </div>
      ) : userLoans.length > 0 ? (
        <ActiveLoans loans={userLoans} />
      ) : (
        <Card className="glass-effect flex flex-col items-center justify-center text-center p-12 space-y-6">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No Active Loans</h3>
            <p className="text-white/60 max-w-sm">
              Create your first loan by using your property NFTs as collateral
            </p>
          </div>
          <Button
            onClick={handleCreateLoanClick}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg"
          >
            Create Your First Loan
          </Button>
        </Card>
      )}

      {/* Footer Banner */}
      <Card className="glass-effect p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Zap className="w-6 h-6 text-purple-400" />
          <div>
            <h4 className="font-bold text-white">AI-Powered Risk Assessment</h4>
            <p className="text-white/60 text-sm">
              Our AWS Bedrock integration provides real-time risk analysis and
              dynamic interest rates.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
        >
          Learn More
        </Button>
      </Card>
    </div>
  );
}
