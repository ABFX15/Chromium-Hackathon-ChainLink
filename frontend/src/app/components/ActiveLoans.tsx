"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { LoanCard } from "./LoanCard";
import { LoanHealthDashboard } from "./LoanHealthDashboard";
import { Loan } from "@/types/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ArrowDownAZ } from "lucide-react";

interface ActiveLoansProps {
  loans: Loan[];
}

export function ActiveLoans({ loans }: ActiveLoansProps) {
  const activeLoans = loans.filter((loan) => loan.isActive);
  const router = useRouter();
  // For future extensibility: sort state
  const [sortBy, setSortBy] = useState<string>("health");

  return (
    <div className="space-y-10">
      {/* Section Heading */}
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-cyan-200">
          Loan Health & Overview
        </h2>
      </div>
      {/* Health Dashboard */}
      <LoanHealthDashboard />

      {/* Divider */}
      <div className="border-t border-cyan-900/40 my-8"></div>

      {/* Active Loans List */}
      <Card className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border-cyan-700/30 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-white">
                Active Loans
              </CardTitle>
              <div className="text-sm text-gray-400 mt-1">
                All loans you are currently borrowing or funding
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {activeLoans.length} active
              </span>
              {/* Sort by dropdown (UI only) */}
              <div className="flex items-center gap-1">
                <ArrowDownAZ className="w-4 h-4 text-cyan-400" />
                <select
                  className="bg-gray-900/80 border border-cyan-700/30 text-cyan-200 rounded px-2 py-1 text-xs focus:outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled
                >
                  <option value="health">Sort by Health</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <Shield className="w-10 h-10 text-cyan-400" />
              <p className="text-gray-400 text-base">No active loans</p>
              <Button
                onClick={() => router.push("/marketplace")}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-2 rounded-lg"
              >
                Create Loan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div
                  key={loan.loanId.toString()}
                  className="transition-shadow duration-200 hover:shadow-2xl hover:border-cyan-400/40 rounded-lg"
                >
                  <LoanCard loan={loan} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
