"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Building2,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { InteractiveWalkthrough } from "@/app/components/InteractiveWalkthrough";

export default function HomePage() {
  const router = useRouter();
  const { address } = useAccount();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const features = [
    {
      icon: Brain,
      title: "AI Risk Assessment",
      description:
        "Advanced machine learning models analyze property risks in real-time",
    },
    {
      icon: Globe,
      title: "Cross-Chain Functionality",
      description: "Seamlessly operate across multiple blockchain networks",
    },
    {
      icon: Shield,
      title: "Automated Liquidation",
      description:
        "Smart contract monitoring with automated protection mechanisms",
    },
    {
      icon: Zap,
      title: "Chainlink Oracles",
      description:
        "Reliable, decentralized price feeds for accurate valuations",
    },
  ];

  const stats = [
    { label: "Total Value Locked", value: "$127.5M", icon: DollarSign },
    { label: "Properties Listed", value: "1,284", icon: Building2 },
    { label: "Active Users", value: "12.8K", icon: Users },
    { label: "Success Rate", value: "99.2%", icon: TrendingUp },
  ];

  // Dashboard stats cards like MultiversX
  const dashboardStats = [
    {
      title: "Average Cost",
      subtitle: "per Transaction",
      value: "~$0.002",
      color: "from-cyan-500 to-blue-500",
      icon: Target,
    },
    {
      title: "Total Transactions",
      subtitle: "",
      value: "529,598,905",
      color: "from-green-500 to-emerald-500",
      icon: Activity,
    },
    {
      title: "Validator Nodes",
      subtitle: "",
      value: "3,619",
      color: "from-purple-500 to-pink-500",
      icon: Shield,
    },
    {
      title: "AI Risk Score",
      subtitle: "Average",
      value: "94.2%",
      color: "from-orange-500 to-red-500",
      icon: Brain,
    },
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Announcement Banner */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 px-6 py-3 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-cyan-400">
              Protocol Live on Sepolia Testnet
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl lg:text-8xl font-bold leading-tight mb-8">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              The Future-Scale
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              RWA Protocol
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto mb-12">
            ORACLEND is an NFT-collateralized lending platform for real-world
            assets (RWAs) featuring AI risk assessment, cross-chain
            functionality, automated liquidation monitoring, and
            Chainlink-powered oracles.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Button
              onClick={() => handleNavigation("/marketplace")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 min-w-[200px]"
            >
              Start Lending
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            <Button
              variant="outline"
              onClick={() => handleNavigation("/risk-analysis")}
              className="border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 min-w-[200px]"
            >
              Explore Platform
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <Icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Stats Section - Like MultiversX */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group relative overflow-hidden">
                  {/* Background card */}
                  <div className="h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105">
                    {/* Animated background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Title and subtitle */}
                      <div className="mb-3">
                        <h3 className="text-gray-400 text-sm font-medium">
                          {stat.title}
                        </h3>
                        {stat.subtitle && (
                          <p className="text-gray-500 text-xs">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Value */}
                      <div
                        className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}
                      >
                        {stat.value}
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              How
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                ORACLEND
              </span>{" "}
              Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A seamless peer-to-peer lending ecosystem for tokenized real-world
              assets.
            </p>
          </div>

          <InteractiveWalkthrough />
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Built for the
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                Next Generation
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced technology stack powering secure, efficient, and
              transparent real estate lending
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative">
                  <div className="h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to revolutionize your
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                real estate investments?
              </span>
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users already leveraging AI-powered lending for
              their property portfolios
            </p>
            <Button
              onClick={() => handleNavigation("/marketplace")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-16 py-6 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
            >
              Get Started Today
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
