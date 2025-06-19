import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Wallet,
  TrendingUp,
  Brain,
  ArrowUpRight,
  Shield,
  Activity,
  DollarSign,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  stats: {
    portfolioValue: string;
    activeLoans: number;
    protocolYield: string;
    riskScore: string | number;
  };
}

export function DashboardLayout({ children, stats }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-cyan-400">
                Portfolio Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.portfolioValue}</div>
              <p className="text-xs text-cyan-400/70">
                Total assets under management
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">
                Active Loans
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLoans}</div>
              <p className="text-xs text-purple-400/70">
                Current lending positions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-emerald-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">
                Protocol Yield
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.protocolYield}</div>
              <p className="text-xs text-emerald-400/70">Total earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-amber-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-400">
                Risk Score
              </CardTitle>
              <Brain className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.riskScore}</div>
              <p className="text-xs text-amber-400/70">AI-powered assessment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
