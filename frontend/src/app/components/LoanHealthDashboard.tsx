"use client";

import { useState, useEffect, useMemo } from "react";
import { useContracts } from "@/app/hooks/useContracts";
import { Loan, PropertyNFT } from "@/types/contracts";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";

export function LoanHealthDashboard() {
  const { userLoans, userNFTs, loading } = useContracts();

  const enrichedLoans = useMemo(() => {
    if (loading || !userLoans || !userNFTs) return [];

    return userLoans
      .filter((loan) => loan.isActive)
      .map((loan) => {
        const nft = userNFTs.find((n) => n.tokenId === Number(loan.tokenId));
        const propertyValue = nft ? nft.propertyValue : 0;
        const principal = Number(loan.principalAmount) / 1e6;
        const interest = Number(loan.interestRate) / 100;
        const debt = principal * (1 + interest / 100); // Simplified debt calculation

        // Simplified health factor: (Collateral Value * LTV) / Debt
        // Lower is worse. 1.0 is the liquidation threshold.
        const healthFactor =
          propertyValue > 0 ? (propertyValue * 0.7) / debt : 0;

        return {
          ...loan,
          debt,
          healthFactor,
          interest,
          propertyName: nft?.name || "Unknown Property",
        };
      });
  }, [userLoans, userNFTs, loading]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (enrichedLoans.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Loan Health Monitor
        </h3>
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No active loans to monitor</p>
        </div>
      </div>
    );
  }

  const totalDebt = enrichedLoans.reduce((sum, loan) => sum + loan.debt, 0);
  const avgHealthFactor =
    enrichedLoans.reduce((sum, loan) => sum + loan.healthFactor, 0) /
    enrichedLoans.length;
  const criticalLoans = enrichedLoans.filter(
    (loan) => loan.healthFactor < 1.2
  ).length;
  const healthyLoans = enrichedLoans.filter(
    (loan) => loan.healthFactor >= 1.5
  ).length;

  const getHealthStatus = (healthFactor: number) => {
    if (healthFactor < 1.1)
      return {
        status: "Critical",
        color: "text-red-400",
        bg: "bg-red-400/10",
        icon: AlertTriangle,
      };
    if (healthFactor < 1.3)
      return {
        status: "Warning",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        icon: TrendingDown,
      };
    if (healthFactor < 1.5)
      return {
        status: "Moderate",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        icon: TrendingUp,
      };
    return {
      status: "Healthy",
      color: "text-green-400",
      bg: "bg-green-400/10",
      icon: Shield,
    };
  };

  const overallHealth = getHealthStatus(avgHealthFactor);
  const OverallIcon = overallHealth.icon;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">TOTAL DEBT</span>
          </div>
          <p className="text-white text-xl font-bold">
            {formatCurrency(totalDebt)}
          </p>
        </div>

        <div
          className={`${overallHealth.bg} rounded-xl p-4 border border-gray-700`}
        >
          <div className="flex items-center justify-between mb-2">
            <OverallIcon className={`w-5 h-5 ${overallHealth.color}`} />
            <span className="text-xs text-gray-400">AVG HEALTH</span>
          </div>
          <p className="text-white text-xl font-bold">
            {avgHealthFactor.toFixed(2)}
          </p>
          <p className={`text-xs ${overallHealth.color}`}>
            {overallHealth.status}
          </p>
        </div>

        <div className="bg-red-400/10 rounded-xl p-4 border border-red-400/20">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-gray-400">AT RISK</span>
          </div>
          <p className="text-white text-xl font-bold">{criticalLoans}</p>
          <p className="text-xs text-red-400">Critical Loans</p>
        </div>

        <div className="bg-green-400/10 rounded-xl p-4 border border-green-400/20">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">HEALTHY</span>
          </div>
          <p className="text-white text-xl font-bold">{healthyLoans}</p>
          <p className="text-xs text-green-400">Secure Loans</p>
        </div>
      </div>

      {/* Loan Details */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Active Loan Positions
          </h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {enrichedLoans.map((loan) => {
              const health = getHealthStatus(loan.healthFactor);
              const HealthIcon = health.icon;
              const daysRemaining = Math.floor(
                (Number(loan.startTimestamp) * 1000 +
                  30 * 24 * 60 * 60 * 1000 -
                  Date.now()) /
                  (24 * 60 * 60 * 1000)
              );

              return (
                <div
                  key={loan.loanId.toString()}
                  className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${health.bg}`}>
                      <HealthIcon className={`w-4 h-4 ${health.color}`} />
                    </div>

                    <div>
                      <h4 className="text-white font-medium">
                        {loan.propertyName}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>ID: #{loan.loanId.toString()}</span>
                        <span>Token: #{loan.tokenId.toString()}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {daysRemaining > 0
                              ? `${daysRemaining} days left`
                              : "Payment overdue"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-white font-medium">
                          {formatCurrency(loan.debt)}
                        </p>
                        <p className="text-xs text-gray-400">Debt</p>
                      </div>

                      <div>
                        <p className="text-white font-medium">
                          {loan.interest.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">APR</p>
                      </div>

                      <div>
                        <p className={`font-bold ${health.color}`}>
                          {loan.healthFactor.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">Health</p>
                      </div>
                    </div>

                    {/* Health Factor Bar */}
                    <div className="mt-2 w-32">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            loan.healthFactor < 1.1
                              ? "bg-red-500"
                              : loan.healthFactor < 1.3
                              ? "bg-yellow-500"
                              : loan.healthFactor < 1.5
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (loan.healthFactor / 2) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      {criticalLoans > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-red-400 font-semibold">Risk Alert</h3>
          </div>
          <p className="text-red-300 mb-4">
            You have {criticalLoans} loan{criticalLoans > 1 ? "s" : ""} at risk
            of liquidation. Consider adding more collateral or repaying debt to
            improve your health factor.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              Add Collateral
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
              Repay Loan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
