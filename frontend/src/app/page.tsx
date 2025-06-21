
"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "./hooks/useContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Building2,
  Wallet,
  TrendingUp,
  Brain,
  Activity,
  Shield,
  Zap,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  AlertTriangle,
  ArrowRight,
  Target,
  Globe,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// Chart colors
const CHART_COLORS = {
  primary: "#06b6d4",
  secondary: "#3b82f6",
  warning: "#fbbf24",
  danger: "#ef4444",
  success: "#10b981",
  purple: "#a855f7",
};

// Enhanced sample data
const marketTrendData = [
  { month: "Jan", volume: 2.4, growth: 12 },
  { month: "Feb", volume: 3.1, growth: 18 },
  { month: "Mar", volume: 2.8, growth: 8 },
  { month: "Apr", volume: 4.2, growth: 32 },
  { month: "May", volume: 5.1, growth: 28 },
  { month: "Jun", volume: 6.8, growth: 45 },
];

const riskDistributionData = [
  { name: "Low Risk", value: 65, color: CHART_COLORS.success },
  { name: "Medium Risk", value: 25, color: CHART_COLORS.warning },
  { name: "High Risk", value: 10, color: CHART_COLORS.danger },
];

const aiPredictionData = [
  { time: "1H", accuracy: 94.2, confidence: 87 },
  { time: "1D", accuracy: 91.8, confidence: 89 },
  { time: "1W", accuracy: 88.5, confidence: 92 },
  { time: "1M", accuracy: 85.7, confidence: 94 },
];

export default function HomePage() {
  const router = useRouter();
  const { address } = useAccount();
  const [selectedMetric, setSelectedMetric] = useState("volume");

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const platformStats = [
    { label: "Total Value Locked", value: "$127.5M", change: "+12.3%", icon: DollarSign },
    { label: "Active Properties", value: "1,284", change: "+8.7%", icon: Building2 },
    { label: "AI Predictions", value: "94.2%", change: "+2.1%", icon: Brain },
    { label: "Global Users", value: "12.8K", change: "+24.5%", icon: Users },
  ];

  const quickActions = [
    {
      title: "Browse Properties",
      description: "Discover tokenized real estate assets",
      icon: Building2,
      path: "/marketplace",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Get a Loan",
      description: "Borrow against your property NFTs",
      icon: Wallet,
      path: "/loans",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "AI Risk Analysis",
      description: "Get intelligent property valuations",
      icon: Brain,
      path: "/risk-analysis",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Market Analytics",
      description: "View real-time market insights",
      icon: BarChart3,
      path: "/analytics",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-cyan-400">AI-Powered Real World Assets</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                    The Future of
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Real Estate
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Finance
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  ORACLEND revolutionizes property lending with AI-driven risk assessment, 
                  cross-chain liquidity, and automated liquidation protection powered by Chainlink.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => handleNavigation("/marketplace")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
                >
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/risk-analysis")}
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  AI Analysis
                  <Brain className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Platform Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                {platformStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className="w-5 h-5 text-cyan-400" />
                        <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Dashboard Preview */}
            <div className="space-y-6">
              {/* Live Market Data */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    Market Trends
                  </h3>
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Live</span>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={marketTrendData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(0, 0, 0, 0.8)', 
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '12px'
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    AI Predictions
                  </h3>
                  <span className="text-purple-400 text-sm font-semibold">94.2% Accuracy</span>
                </div>
                
                <div className="space-y-3">
                  {aiPredictionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{item.time}</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={item.confidence} className="w-20 h-2" />
                        <span className="text-white font-semibold text-sm">{item.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  System Health
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Chainlink Oracles</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-semibold">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">AI Risk Engine</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-semibold">Optimal</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Cross-Chain Bridge</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm font-semibold">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Modern Lending</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of real estate finance with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.path}>
                  <div className="group h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-gray-300 mb-4">{action.description}</p>
                    
                    <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      <span className="text-sm font-semibold">Learn More</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
