
export interface PropertyData {
  address: string;
  valueEstimate: number;
  propertyType: string;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number;
  description?: string;
  image?: string;
}

export interface RiskAssessmentData {
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  suggestedInterestRate: number;
  maxLTV: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

class PropertyService {
  async getPropertyData(address?: string): Promise<{ demo: boolean; property: PropertyData; note?: string }> {
    try {
      const response = await fetch('/api/rentcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch property data:', error);
      // Return fallback data
      return {
        demo: true,
        property: {
          address: address || "Unknown Address",
          valueEstimate: 400000,
          propertyType: "Single Family",
          city: "Demo City",
          state: "CA",
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1500,
          yearBuilt: 2010,
          description: "Demo property",
          image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"
        },
        note: "Using fallback data due to API error"
      };
    }
  }

  async assessPropertyRisk(propertyData: PropertyData, loanAmount: number): Promise<RiskAssessmentData> {
    try {
      const response = await fetch('/api/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyValue: propertyData.valueEstimate,
          loanAmount,
          propertyType: propertyData.propertyType,
          location: `${propertyData.city}, ${propertyData.state}`,
          yearBuilt: propertyData.yearBuilt || 2010,
          squareFootage: propertyData.sqft || 1500,
          borrowerCreditScore: 750, // Default credit score
          debtToIncomeRatio: 30 // Default DTI
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        riskScore: data.riskScore,
        riskCategory: data.riskCategory,
        suggestedInterestRate: data.suggestedInterestRate,
        maxLTV: data.maxLTV,
        confidence: data.confidence,
        factors: data.factors,
        recommendations: data.recommendations
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      // Return fallback assessment
      const ltv = (loanAmount / propertyData.valueEstimate) * 100;
      return {
        riskScore: Math.min(50 + ltv, 85),
        riskCategory: ltv > 80 ? 'high' : ltv > 60 ? 'medium' : 'low',
        suggestedInterestRate: 6.5,
        maxLTV: 75,
        confidence: 0.8,
        factors: ['Property location', 'Loan-to-value ratio', 'Market conditions'],
        recommendations: ['Consider property inspection', 'Monitor market trends']
      };
    }
  }

  async getDemoProperties(): Promise<PropertyData[]> {
    const addresses = [
      "123 Main St, New York, NY 10001",
      "456 Oak Ave, Los Angeles, CA 90210", 
      "789 Pine St, Chicago, IL 60601"
    ];

    const properties = await Promise.all(
      addresses.map(async (address) => {
        const result = await this.getPropertyData(address);
        return result.property;
      })
    );

    return properties;
  }
}

export const propertyService = new PropertyService();
