import { useState, useEffect } from "react";
import {
  usePropertyRiskQuery,
  useMarketInsightsQuery,
} from "@/app/hooks/use-risk-assessment";
import { PropertyRiskData, RiskAssessment } from "@/app/lib/bedrock-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Loader2,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AIRiskAssessmentProps {
  propertyData: {
    tokenId: number;
    propertyValue: number;
    propertyType: string;
    location: string;
    yearBuilt: number;
    squareFootage: number;
  };
  loanAmount: number;
  onAssessmentComplete?: (assessment: RiskAssessment) => void;
}

export function AIRiskAssessment({
  propertyData,
  loanAmount,
  onAssessmentComplete,
}: AIRiskAssessmentProps) {
  const [assessmentData, setAssessmentData] = useState<PropertyRiskData | null>(
    null
  );

  // Prepare data for AI assessment
  useEffect(() => {
    if (propertyData && loanAmount > 0) {
      const data: PropertyRiskData = {
        propertyValue: propertyData.propertyValue,
        propertyType: propertyData.propertyType || "Residential",
        location: propertyData.location || "Unknown Location",
        yearBuilt: propertyData.yearBuilt || 2000,
        squareFootage: propertyData.squareFootage || 2000,
        loanAmount: loanAmount,
        locationRisk: 50, // Default risk values
        marketTrend: 0, // Neutral trend
        condition: "Good", // Default condition
        age: new Date().getFullYear() - (propertyData.yearBuilt || 2000),
      };
      setAssessmentData(data);
    }
  }, [propertyData, loanAmount]);

  const {
    data: riskAssessment,
    isLoading: isAssessing,
    error: assessmentError,
  } = usePropertyRiskQuery(assessmentData);

  const { data: marketInsights, isLoading: loadingInsights } =
    useMarketInsightsQuery(
      propertyData?.location || "",
      propertyData?.propertyType || ""
    );

  // Notify parent component when assessment is complete
  useEffect(() => {
    if (riskAssessment && onAssessmentComplete) {
      onAssessmentComplete(riskAssessment);
    }
  }, [riskAssessment, onAssessmentComplete]);

  const getRiskColor = (category: string) => {
    switch (category) {
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      case "medium":
        return <TrendingUp className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  if (assessmentError) {
    return (
      <Card className="bg-gray-900/50 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 font-mono flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            [ai_risk_assessment_error]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300 font-mono text-sm">
            Failed to assess property risk. Using fallback analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Risk Assessment Card */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <Brain className="w-5 h-5" />
            [ai_risk_assessment]
            {isAssessing && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAssessing ? (
            <div className="flex items-center gap-3 text-cyan-300 font-mono">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>analyzing_risk_factors...</span>
            </div>
          ) : riskAssessment ? (
            <>
              {/* Risk Score & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-cyan-500 font-mono text-sm">
                    risk_score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono text-cyan-300">
                      {riskAssessment?.riskScore || 0}
                    </span>
                    <span className="text-cyan-500/70 font-mono">/100</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-cyan-500 font-mono text-sm">
                    category
                  </span>
                  <Badge
                    className={`${getRiskColor(
                      riskAssessment?.riskCategory || "default"
                    )} font-mono`}
                  >
                    {getRiskIcon(riskAssessment?.riskCategory || "default")}
                    {riskAssessment?.riskCategory?.toUpperCase() || "ANALYZING"}
                  </Badge>
                </div>
              </div>

              {/* Interest Rate & LTV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-cyan-500 font-mono text-sm">
                    suggested_apr
                  </span>
                  <span className="text-xl font-mono text-cyan-300">
                    {riskAssessment?.suggestedInterestRate?.toFixed(2) ||
                      "0.00"}
                    %
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-cyan-500 font-mono text-sm">
                    max_ltv
                  </span>
                  <span className="text-xl font-mono text-cyan-300">
                    {riskAssessment?.maxLTV || 0}%
                  </span>
                </div>
              </div>

              {/* Confidence */}
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">
                  ai_confidence
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${riskAssessment?.confidence || 0}%` }}
                    />
                  </div>
                  <span className="text-cyan-300 font-mono text-sm">
                    {riskAssessment?.confidence || 0}%
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">
                  key_factors
                </span>
                <div className="space-y-1">
                  {(riskAssessment.factors || []).map(
                    (factor: string, index: number) => (
                      <div
                        key={index}
                        className="text-cyan-300/80 font-mono text-sm flex items-start gap-2"
                      >
                        <span className="text-cyan-500">•</span>
                        <span>{factor}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <span className="text-cyan-500 font-mono text-sm">
                  ai_recommendations
                </span>
                <div className="space-y-1">
                  {(riskAssessment.recommendations || []).map(
                    (rec: string, index: number) => (
                      <div
                        key={index}
                        className="text-cyan-300/80 font-mono text-sm flex items-start gap-2"
                      >
                        <span className="text-cyan-500">→</span>
                        <span>{rec}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-cyan-500/70 font-mono text-sm">
              awaiting_loan_amount...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights Card */}
      <Card className="bg-gray-900/50 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            [market_insights]
            {loadingInsights && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInsights ? (
            <div className="flex items-center gap-3 text-cyan-300 font-mono">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>analyzing_market_data...</span>
            </div>
          ) : marketInsights && marketInsights.length > 0 ? (
            <div className="space-y-2">
              {(marketInsights || []).map((insight: string, index: number) => (
                <div
                  key={index}
                  className="text-cyan-300/80 font-mono text-sm flex items-start gap-2"
                >
                  <span className="text-cyan-500">▸</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-cyan-500/70 font-mono text-sm">
              market_data_unavailable
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
