
import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

interface PropertyRiskData {
  propertyValue: number;
  loanAmount: number;
  propertyType: string;
  location: string;
  yearBuilt: number;
  squareFootage: number;
  borrowerCreditScore?: number;
  debtToIncomeRatio?: number;
}

export async function POST(req: NextRequest) {
  try {
    const data: PropertyRiskData = await req.json();
    
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log("AWS credentials not found, using mock data");
      return NextResponse.json(generateMockRiskAssessment(data));
    }

    // Build AI prompt
    const prompt = `
You are an expert real estate lending risk analyst. Analyze the following property loan data and provide a comprehensive risk assessment.

Property Details:
- Property Value: $${data.propertyValue.toLocaleString()}
- Property Type: ${data.propertyType}
- Location: ${data.location}
- Year Built: ${data.yearBuilt}
- Square Footage: ${data.squareFootage}
- Requested Loan Amount: $${data.loanAmount.toLocaleString()}
- Loan-to-Value Ratio: ${((data.loanAmount / data.propertyValue) * 100).toFixed(1)}%
${data.borrowerCreditScore ? `- Borrower Credit Score: ${data.borrowerCreditScore}` : ''}
${data.debtToIncomeRatio ? `- Debt-to-Income Ratio: ${data.debtToIncomeRatio}%` : ''}

Please provide a JSON response with the following structure:
{
  "riskScore": <number 0-100>,
  "riskCategory": "<low|medium|high>",
  "suggestedInterestRate": <number>,
  "maxLTV": <number>,
  "confidence": <number 0-1>,
  "factors": ["<factor1>", "<factor2>", ...],
  "recommendations": ["<rec1>", "<rec2>", ...]
}

Consider factors like property age, location risk, market conditions, LTV ratio, and borrower profile.
`;

    try {
      const input = {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      };

      const command = new InvokeModelCommand(input);
      const response = await bedrockClient.send(command);
      
      if (!response.body) {
        throw new Error('No response body from Bedrock');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const aiResponse = responseBody.content[0].text;
      
      // Parse AI response
      const assessment = JSON.parse(aiResponse);
      
      return NextResponse.json({
        success: true,
        ...assessment
      });
      
    } catch (aiError) {
      console.error('Bedrock AI error:', aiError);
      return NextResponse.json(generateMockRiskAssessment(data));
    }
    
  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { error: "Risk assessment failed", details: String(error) }, 
      { status: 500 }
    );
  }
}

function generateMockRiskAssessment(data: PropertyRiskData) {
  const ltv = (data.loanAmount / data.propertyValue) * 100;
  const propertyAge = new Date().getFullYear() - data.yearBuilt;
  
  // Calculate risk score based on factors
  let riskScore = 30; // Base score
  if (ltv > 80) riskScore += 25;
  else if (ltv > 70) riskScore += 15;
  else if (ltv > 60) riskScore += 10;
  
  if (propertyAge > 30) riskScore += 15;
  else if (propertyAge > 20) riskScore += 10;
  
  if (data.borrowerCreditScore && data.borrowerCreditScore < 650) riskScore += 20;
  else if (data.borrowerCreditScore && data.borrowerCreditScore < 700) riskScore += 10;
  
  riskScore = Math.min(riskScore, 95);
  
  const riskCategory = riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high';
  const baseRate = 5.5;
  const suggestedInterestRate = baseRate + (riskScore * 0.1);
  const maxLTV = Math.max(50, 85 - (riskScore * 0.5));
  
  return {
    success: true,
    riskScore,
    riskCategory,
    suggestedInterestRate: Number(suggestedInterestRate.toFixed(2)),
    maxLTV: Number(maxLTV.toFixed(0)),
    confidence: 0.85,
    factors: [
      `Loan-to-value ratio: ${ltv.toFixed(1)}%`,
      `Property age: ${propertyAge} years`,
      `Property type: ${data.propertyType}`,
      `Location: ${data.location}`
    ],
    recommendations: [
      'Consider property inspection',
      'Monitor local market trends',
      'Maintain adequate insurance coverage',
      'Regular property value updates'
    ]
  };
}
