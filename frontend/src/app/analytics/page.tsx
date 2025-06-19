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
} from "recharts";

const COLORS = ["#0ff", "#00ff9d", "#ffd700", "#ff4444"];

export default function AnalyticsPage() {
  // Sample data - replace with real data from your API
  const marketData = [
    { month: "Jan", tvl: 4200000, loans: 8, avgApy: 5.2 },
    { month: "Feb", tvl: 4500000, loans: 10, avgApy: 5.4 },
    { month: "Mar", tvl: 4800000, loans: 11, avgApy: 5.6 },
    { month: "Apr", tvl: 5250000, loans: 12, avgApy: 5.8 },
  ];

  const riskDistribution = [
    { name: "Low Risk", value: 5 },
    { name: "Medium Risk", value: 4 },
    { name: "High Risk", value: 2 },
    { name: "Critical", value: 1 },
  ];

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", color: "#0ff" }}>Market Analytics</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Real-time market insights and trends
        </p>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* TVL Chart */}
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h2 style={{ color: "#0ff", marginBottom: "20px" }}>
            Total Value Locked (TVL)
          </h2>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 255, 255, 0.1)"
                />
                <XAxis dataKey="month" stroke="#0ff" />
                <YAxis stroke="#0ff" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid #0ff",
                    borderRadius: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tvl"
                  stroke="#0ff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h2 style={{ color: "#0ff", marginBottom: "20px" }}>
            Risk Distribution
          </h2>
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
                  label
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid #0ff",
                    borderRadius: "4px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Stats */}
        <div
          style={{
            border: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h2 style={{ color: "#0ff", marginBottom: "20px" }}>Market Stats</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Total Loans</p>
              <p style={{ fontSize: "24px", color: "#0ff" }}>12</p>
            </div>
            <div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Average APY</p>
              <p style={{ fontSize: "24px", color: "#0ff" }}>5.8%</p>
            </div>
            <div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Total Properties
              </p>
              <p style={{ fontSize: "24px", color: "#0ff" }}>28</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
