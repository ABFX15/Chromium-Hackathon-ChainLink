"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "../hooks/use-contracts";
import { useProperties } from "../hooks/use-properties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "../types/property";
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
} from "recharts";
import { Marketplace } from "../components/Marketplace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Chart colors
const CHART_COLORS = {
  primary: "#0ff",
  secondary: "#2d6dff",
  warning: "#ffd700",
  danger: "#ff4444",
  success: "#00ff9d",
};

// Sample data for charts
const riskDistributionData = [
  { name: "High Risk", value: 2 },
  { name: "Medium Risk", value: 3 },
  { name: "Low Risk", value: 5 },
];

const healthTrendData = [
  { time: "12h ago", health: 1.5 },
  { time: "9h ago", health: 1.4 },
  { time: "6h ago", health: 1.3 },
  { time: "3h ago", health: 1.25 },
  { time: "Now", health: 1.23 },
];

const collateralValueData = [
  { id: "Loan #1", value: 750000 },
  { id: "Loan #2", value: 750000 },
  { id: "Loan #3", value: 750000 },
];

const COLORS = ["#ff4444", "#ffd700", "#00ff9d"];

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      {/* Welcome Message */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>⚡</span>
          <span>Welcome to ORACLEND AI</span>
        </div>
        <div style={{ color: "#00ff00" }}>⚡System Status: Online</div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Total Value Locked
          </div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>$5,250,000</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>Active Loans</div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>12</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Properties Listed
          </div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>28</div>
        </div>
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "15px",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>Average APY</div>
          <div style={{ fontSize: "24px", color: "#0ff" }}>5.8%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          border: "1px solid rgba(0, 255, 255, 0.2)",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>Quick Actions</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(0, 255, 255, 0.2)",
              padding: "15px",
              cursor: "pointer",
            }}
          >
            <div
              style={{ fontSize: "18px", color: "#0ff", marginBottom: "5px" }}
            >
              🏠 Browse Properties
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              View available real estate NFTs
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(0, 255, 255, 0.2)",
              padding: "15px",
              cursor: "pointer",
            }}
          >
            <div
              style={{ fontSize: "18px", color: "#0ff", marginBottom: "5px" }}
            >
              💰 Get a Loan
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Borrow against your property
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(0, 255, 255, 0.2)",
              padding: "15px",
              cursor: "pointer",
            }}
          >
            <div
              style={{ fontSize: "18px", color: "#0ff", marginBottom: "5px" }}
            >
              📊 View Analytics
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Check market statistics
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(0, 255, 255, 0.2)",
              padding: "15px",
              cursor: "pointer",
            }}
          >
            <div
              style={{ fontSize: "18px", color: "#0ff", marginBottom: "5px" }}
            >
              🤖 AI Risk Analysis
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Get property valuation
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div
        style={{ border: "1px solid rgba(0, 255, 255, 0.2)", padding: "20px" }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>
          System Information
        </div>
        <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          <div>Network: Sepolia Testnet</div>
          <div>Oracle Status: Connected</div>
          <div>Chainlink Automation: Active</div>
          <div>Last Block: #5,123,456</div>
          <div>Gas Price: 25 Gwei</div>
        </div>
      </div>
    </div>
  );
}
