
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, TrendingUp, Shield, AlertTriangle } from "lucide-react";

interface AILoanDetailsProps {
  loanId: string;
  riskScore?: number;
  riskCategory?: 'low' | 'medium' | 'high';
  aiInterestRate?: number;
  confidence?: number;
  lastAssessment?: string;
}

export function AILoanDetails({
  loanId,
  riskScore,
  riskCategory,
  aiInterestRate,
  confidence,
  lastAssessment
}: AILoanDetailsProps) {
  const getRiskColor = (category?: string) => {
    switch (category) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getRiskIcon = (category?: string) => {
    switch (category) {
      case 'low': return <Shield className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-purple-900/20 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-400 text-sm">
          <Brain className="w-4 h-4" />
          AI Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {riskScore !== undefined ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Risk Score</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{riskScore}/100</span>
                <Badge className={getRiskColor(riskCategory)}>
                  {getRiskIcon(riskCategory)}
                  <span className="ml-1 capitalize">{riskCategory || 'unknown'}</span>
                </Badge>
              </div>
            </div>

            {aiInterestRate !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">AI Suggested Rate</span>
                <span className="text-purple-400 font-medium">{aiInterestRate}%</span>
              </div>
            )}

            {confidence !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className="text-white font-medium">{Math.round(confidence * 100)}%</span>
              </div>
            )}

            {lastAssessment && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Last Assessment</span>
                <span className="text-xs text-gray-300">{lastAssessment}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <Brain className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No AI assessment available</p>
            <p className="text-xs text-gray-500">Assessment runs automatically on loan creation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
