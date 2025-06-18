import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bedrockAI, PropertyRiskData } from "./bedrock-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Risk Assessment endpoint
  app.post("/api/assess-risk", async (req, res) => {
    try {
      const riskData: PropertyRiskData = req.body;
      
      // Validate required fields
      if (!riskData.propertyValue || !riskData.loanAmount || !riskData.propertyType) {
        return res.status(400).json({ 
          error: "Missing required fields: propertyValue, loanAmount, propertyType" 
        });
      }

      const assessment = await bedrockAI.assessPropertyRisk(riskData);
      res.json(assessment);
    } catch (error) {
      console.error("Risk assessment error:", error);
      res.status(500).json({ 
        error: "Failed to assess property risk",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Complete workflow AI risk assessment endpoint
  app.post("/api/ai/risk-assessment", async (req, res) => {
    try {
      const { propertyData, borrowerData, loanId } = req.body;
      
      const riskData: PropertyRiskData = {
        propertyValue: propertyData.value,
        propertyType: propertyData.type || 'Residential',
        location: propertyData.location || 'Urban Area',
        yearBuilt: propertyData.yearBuilt || 2020,
        squareFootage: propertyData.squareFootage || 2500,
        loanAmount: propertyData.loanAmount,
        borrowerCreditScore: borrowerData?.creditScore || 750,
        debtToIncomeRatio: borrowerData?.debtToIncomeRatio || 0.3
      };
      
      const assessment = await bedrockAI.assessPropertyRisk(riskData);
      
      res.json({
        success: true,
        riskScore: assessment.riskScore,
        riskCategory: assessment.riskCategory,
        suggestedInterestRate: assessment.suggestedInterestRate,
        maxLTV: assessment.maxLTV,
        confidence: assessment.confidence,
        factors: assessment.factors,
        recommendations: assessment.recommendations
      });
    } catch (error) {
      console.error("Complete workflow risk assessment error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Risk assessment failed"
      });
    }
  });

  // Market Insights endpoint
  app.post("/api/market-insights", async (req, res) => {
    try {
      const { location, propertyType } = req.body;
      
      if (!location || !propertyType) {
        return res.status(400).json({ 
          error: "Missing required fields: location, propertyType" 
        });
      }

      const insights = await bedrockAI.getMarketInsights(location, propertyType);
      res.json({ insights });
    } catch (error) {
      console.error("Market insights error:", error);
      res.status(500).json({ 
        error: "Failed to get market insights",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: {
        bedrock: process.env.AWS_ACCESS_KEY_ID ? "configured" : "not configured"
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
