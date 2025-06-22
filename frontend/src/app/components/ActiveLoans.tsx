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

interface ActiveLoansProps {
  loans: Loan[];
}

export function ActiveLoans({ loans }: ActiveLoansProps) {
  const activeLoans = loans.filter((loan) => loan.isActive);

  return (
    <div className="space-y-6">
      {/* Loan Health Dashboard */}
      <LoanHealthDashboard />
      
      {/* Active Loans List */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Active Loans
            </CardTitle>
            <span className="text-sm text-gray-400">
              {activeLoans.length} active
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-sm">No active loans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <LoanCard key={loan.loanId.toString()} loan={loan} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
