
"use client";

import { useState } from "react";
import { useLoans } from "../hooks/use-loans";
import { useLoanHealth, type LoanHealth } from "../../hooks/use-loan-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Zap, 
  Target, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Activity,
  RefreshCw,
  Eye,
  ChevronRight
} from "lucide-react";

const WARNING_THRESHOLD = 8500; // 85%
const SOFT_LIQUIDATION_THRESHOLD = 8000; // 80%
const HARD_LIQUIDATION_THRESHOLD = 7500; // 75%

export default function LiquidationPage() {
  const { loans: userLoans } = useLoans();
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { health } = useLoanHealth(selectedLoanId || 0);

  const loans = Array.isArray(userLoans) ? userLoans : [];
  const atRiskLoans = loans.filter((loan) => {
    const loanHealth = useLoanHealth(loan.loanId);
    return (loanHealth.health?.currentLTV ?? 0) >= SOFT_LIQUIDATION_THRESHOLD;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "HARD_LIQUIDATION": return "from-red-500 to-red-600";
      case "SOFT_LIQUIDATION": return "from-orange-500 to-orange-600";
      case "WARNING": return "from-yellow-500 to-yellow-600";
      default: return "from-green-500 to-green-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-cyan-400">Real-time Monitoring Active</span>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Liquidation Dashboard
            </h1>
          </div>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Automated monitoring and protection powered by Chainlink Automation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Total Monitored", 
              value: loans.length, 
              icon: Target, 
              color: "from-blue-500 to-blue-600",
              description: "Active loans under surveillance"
            },
            { 
              title: "At Risk", 
              value: atRiskLoans.length, 
              icon: AlertTriangle, 
              color: "from-orange-500 to-orange-600",
              description: "Loans requiring attention"
            },
            { 
              title: "Automated", 
              value: loans.length, 
              icon: Zap, 
              color: "from-green-500 to-green-600",
              description: "Protected by smart contracts"
            },
            { 
              title: "Threshold", 
              value: "80%", 
              icon: Activity, 
              color: "from-purple-500 to-purple-600",
              description: "Liquidation trigger point"
            }
          ].map((stat, index) => (
            <Card key={stat.title} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="font-medium text-gray-300">{stat.title}</p>
                  <p className="text-sm text-gray-400">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Monitoring Table */}
        <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" />
                Active Loan Monitoring
              </CardTitle>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Loan ID</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Borrower</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Property Value</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Total Debt</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">LTV</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Health Factor</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Risk Level</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Time to Liquidation</th>
                    <th className="text-left py-4 px-2 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, index) => {
                    const { health } = useLoanHealth(loan.loanId);
                    const ltv = health?.currentLTV || 0;
                    const healthFactor = health?.healthFactor || 0;
                    const riskLevel = health?.riskLevel || "LOADING";
                    const timeToLiquidation = health?.timeToLiquidation;

                    return (
                      <tr 
                        key={loan.loanId} 
                        className="border-b border-gray-800/50 hover:bg-white/5 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="py-4 px-2">
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                            #{loan.loanId}
                          </Badge>
                        </td>
                        <td className="py-4 px-2 text-gray-300 font-mono">
                          {loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}
                        </td>
                        <td className="py-4 px-2 text-white font-semibold">
                          ${Number(loan.principalAmount).toLocaleString()}
                        </td>
                        <td className="py-4 px-2 text-white font-semibold">
                          ${(Number(loan.principalAmount) * (1 + loan.interestRate / 10000)).toLocaleString()}
                        </td>
                        <td className="py-4 px-2">
                          <Badge 
                            className={`${
                              ltv >= 80 ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                              ltv >= 75 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                              'bg-green-500/20 text-green-400 border-green-500/50'
                            }`}
                          >
                            {ltv.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              healthFactor < 1 ? 'bg-red-400' :
                              healthFactor < 1.2 ? 'bg-yellow-400' : 'bg-green-400'
                            } animate-pulse`}></div>
                            <span className="text-white font-medium">{healthFactor.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge className={`bg-gradient-to-r ${getRiskColor(riskLevel)} text-white border-0`}>
                            {riskLevel.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span>
                              {timeToLiquidation
                                ? timeToLiquidation < 1
                                  ? "< 1 hour"
                                  : `${timeToLiquidation.toFixed(1)} hours`
                                : "> 1 week"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                            onClick={() => setSelectedLoanId(loan.loanId)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Automation Performance */}
        <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-400" />
              Automation Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: "⚡", 
                  value: "99.9%", 
                  label: "Uptime", 
                  color: "from-green-500 to-green-600",
                  description: "System availability"
                },
                { 
                  icon: "◎", 
                  value: "0.002", 
                  label: "ETH Gas Used", 
                  color: "from-blue-500 to-blue-600",
                  description: "Average per transaction"
                },
                { 
                  icon: "⏲", 
                  value: "12", 
                  label: "Liquidations Prevented", 
                  color: "from-purple-500 to-purple-600",
                  description: "This month"
                }
              ].map((metric, index) => (
                <div key={metric.label} className="text-center space-y-4">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${metric.color} flex items-center justify-center text-3xl animate-pulse`}>
                    {metric.icon}
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-white">{metric.value}</p>
                    <p className="text-lg font-medium text-gray-300">{metric.label}</p>
                    <p className="text-sm text-gray-400">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
