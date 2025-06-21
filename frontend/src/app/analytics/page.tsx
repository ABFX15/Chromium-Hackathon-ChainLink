"use client";

import { useEffect, useState } from "react";
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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2, 
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap
} from "lucide-react";

const COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced sample data
  const marketData = [
    { month: "Jan", tvl: 4200000, loans: 8, avgApy: 5.2, volume: 1200000 },
    { month: "Feb", tvl: 4500000, loans: 10, avgApy: 5.4, volume: 1450000 },
    { month: "Mar", tvl: 4800000, loans: 11, avgApy: 5.6, volume: 1680000 },
    { month: "Apr", tvl: 5250000, loans: 12, avgApy: 5.8, volume: 1920000 },
    { month: "May", tvl: 5650000, loans: 15, avgApy: 6.0, volume: 2150000 },
    { month: "Jun", tvl: 6100000, loans: 18, avgApy: 6.2, volume: 2380000 },
  ];

  const riskDistribution = [
    { name: "Low Risk (0-30%)", value: 12, color: "#10b981" },
    { name: "Medium Risk (30-60%)", value: 8, color: "#f59e0b" },
    { name: "High Risk (60-80%)", value: 3, color: "#ef4444" },
    { name: "Critical (80%+)", value: 1, color: "#dc2626" },
  ];

  const performanceData = [
    { metric: "Success Rate", value: 99.2, change: +0.8, period: "vs last month" },
    { metric: "Avg. Processing Time", value: 2.3, change: -0.5, period: "seconds" },
    { metric: "Gas Efficiency", value: 94.7, change: +2.1, period: "optimization %" },
    { metric: "User Satisfaction", value: 96.8, change: +1.2, period: "rating score" },
  ];

  const chainDistribution = [
    { name: "Ethereum", value: 45, transactions: 234, color: "#627eea" },
    { name: "Polygon", value: 25, transactions: 156, color: "#8247e5" },
    { name: "Arbitrum", value: 20, transactions: 98, color: "#28a0f0" },
    { name: "Avalanche", value: 10, transactions: 67, color: "#e84142" },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-400">Real-time Analytics</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
              Market Analytics
            </h1>
          </div>

          <div className="flex items-center justify-center gap-4">
            <p className="text-xl text-gray-300">
              Real-time market insights and performance metrics
            </p>
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Total Value Locked", 
              value: "$6.1M", 
              change: "+16.4%",
              icon: DollarSign, 
              color: "from-green-500 to-green-600" 
            },
            { 
              title: "Active Properties", 
              value: "24", 
              change: "+12.5%",
              icon: Building2, 
              color: "from-blue-500 to-blue-600" 
            },
            { 
              title: "Total Users", 
              value: "1.2K", 
              change: "+8.7%",
              icon: Users, 
              color: "from-purple-500 to-purple-600" 
            },
            { 
              title: "Average APY", 
              value: "6.2%", 
              change: "+0.4%",
              icon: TrendingUp, 
              color: "from-orange-500 to-orange-600" 
            },
          ].map((metric, index) => (
            <Card key={metric.title} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="font-medium text-gray-300">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TVL Trend Chart */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Total Value Locked Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData}>
                    <defs>
                      <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)"
                      }}
                      labelStyle={{ color: "#06b6d4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tvl"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fill="url(#tvlGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution Pie Chart */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-orange-400" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${value} loans`}
                      labelLine={false}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {riskDistribution.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceData.map((metric, index) => (
                <div key={metric.metric} className="text-center p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">{metric.value}%</p>
                    <p className="font-medium text-gray-300">{metric.metric}</p>
                    <div className="flex items-center justify-center space-x-1">
                      {metric.change > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}
                      </span>
                      <span className="text-sm text-gray-400">{metric.period}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cross-Chain Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Volume by Month */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chain Distribution */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Cross-Chain Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chainDistribution.map((chain, index) => (
                  <div key={chain.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: chain.color }}
                        ></div>
                        <span className="text-white font-medium">{chain.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{chain.value}%</p>
                        <p className="text-gray-400 text-sm">{chain.transactions} txns</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${chain.value}%`,
                          backgroundColor: chain.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}