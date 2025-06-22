"use client";

import { useMemo } from "react";
import { useContracts } from "@/app/hooks/useContracts";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Zap,
  DollarSign,
  TrendingUp,
  Activity,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ActiveLoans } from "../components/ActiveLoans";

export default function LoansPage() {
  const { userLoans, loading } = useContracts();
  const router = useRouter();

  const { totalBorrowed, activeLoanCount, avgAPR } = useMemo(() => {
    const activeLoans = userLoans.filter((loan) => loan.isActive);
    const totalBorrowed = activeLoans.reduce(
      (sum, loan) => sum + Number(loan.principalAmount) / 1e6,
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

  const stats = [
    {
      title: "Total Borrowed",
      value: formatCurrency(totalBorrowed),
      icon: Landmark,
      color: "from-blue-500 to-blue-600",
      description: "Total principal of your active loans",
    },
    {
      title: "Active Loans",
      value: activeLoanCount,
      icon: Activity,
      color: "from-cyan-500 to-cyan-600",
      description: "Number of loans you are borrowing",
    },
    {
      title: "Average APR",
      value: `${avgAPR.toFixed(2)}%`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      description: "Your average interest rate",
    },
    {
      title: "AI Secured",
      value: activeLoanCount,
      icon: ShieldCheck,
      color: "from-green-500 to-green-600",
      description: "Loans monitored by AI risk models",
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
            <Landmark className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl lg:text-5xl font-bold font-heading bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Loan Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your NFT-collateralized loans and funding activity
          </p>
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

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-white/60">Loading your loans...</p>
          </div>
        ) : userLoans.length > 0 ? (
          <ActiveLoans loans={userLoans} />
        ) : (
          <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 text-center p-12 space-y-6">
            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-heading text-white">
                No Active Loans
              </h3>
              <p className="text-white/60 max-w-sm mx-auto">
                Create your first loan by using your property NFTs as collateral
              </p>
            </div>
            <Button
              onClick={() => router.push("/marketplace")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg"
            >
              Create Your First Loan
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
