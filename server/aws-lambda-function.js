// AWS Lambda function for AI risk scoring integration with LoanManager contract
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { ethers } = require("ethers");

// Lambda handler
exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Extract loan data from event (triggered by contract or API Gateway)
        const { loanId, borrowerData, propertyData } = JSON.parse(event.body || event.Records[0].body);
        
        // Initialize Bedrock client
        const bedrockClient = new BedrockRuntimeClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        
        // Prepare AI prompt for risk assessment
        const prompt = buildRiskAssessmentPrompt({
            propertyValue: propertyData.value,
            propertyType: propertyData.type,
            location: propertyData.location,
            loanAmount: propertyData.loanAmount,
            borrowerCreditScore: borrowerData.creditScore,
            marketConditions: propertyData.marketConditions
        });
        
        // Call AWS Bedrock Claude-3
        const input = {
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        };
        
        const command = new InvokeModelCommand(input);
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiResponse = responseBody.content[0].text;
        
        // Parse AI response to extract risk score
        const riskScore = parseRiskScore(aiResponse);
        
        // Update smart contract with AI risk score
        await updateLoanManagerContract(loanId, riskScore);
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                success: true,
                loanId: loanId,
                riskScore: riskScore,
                aiResponse: aiResponse
            })
        };
        
    } catch (error) {
        console.error('Lambda function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

function buildRiskAssessmentPrompt(data) {
    return `
You are an AI risk assessment specialist for real estate lending. Analyze the following property and borrower data to provide a risk score.

PROPERTY DATA:
- Property Value: $${data.propertyValue.toLocaleString()}
- Property Type: ${data.propertyType}
- Location: ${data.location}
- Loan Amount: $${data.loanAmount.toLocaleString()}

BORROWER DATA:
- Credit Score: ${data.borrowerCreditScore || 'Not provided'}
- Loan-to-Value Ratio: ${((data.loanAmount / data.propertyValue) * 100).toFixed(1)}%

MARKET CONDITIONS:
${data.marketConditions || 'Current market analysis pending'}

Please provide a comprehensive risk assessment with:
1. Risk Score (0-100, where 100 is highest risk)
2. Key risk factors
3. Recommended interest rate adjustment

Format your response as:
RISK_SCORE: [number 0-100]
RISK_FACTORS: [list of main concerns]
RATE_RECOMMENDATION: [suggested interest rate in basis points above base rate]
`;
}

function parseRiskScore(aiResponse) {
    // Extract numeric risk score from AI response
    const riskMatch = aiResponse.match(/RISK_SCORE:\s*(\d+)/i);
    if (riskMatch) {
        return Math.min(100, Math.max(0, parseInt(riskMatch[1])));
    }
    
    // Fallback parsing for different response formats
    const numberMatch = aiResponse.match(/(\d+)/);
    if (numberMatch) {
        return Math.min(100, Math.max(0, parseInt(numberMatch[1])));
    }
    
    // Default to medium risk if parsing fails
    return 50;
}

async function updateLoanManagerContract(loanId, riskScore) {
    try {
        // Initialize provider and contract
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        const loanManagerABI = [
            "function updateAIRiskScore(uint256 loanId, uint256 riskScore) external"
        ];
        
        const loanManager = new ethers.Contract(
            process.env.LOAN_MANAGER_ADDRESS,
            loanManagerABI,
            wallet
        );
        
        // Call contract function to update risk score
        const tx = await loanManager.updateAIRiskScore(loanId, riskScore);
        await tx.wait();
        
        console.log(`Updated loan ${loanId} with risk score ${riskScore}. TX: ${tx.hash}`);
        
    } catch (error) {
        console.error('Contract update failed:', error);
        throw new Error(`Failed to update contract: ${error.message}`);
    }
}