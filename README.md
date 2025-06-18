# Oraclend - AI-Powered Private Credit Vault
An NFT-collateralized lending platform for real-world assets (RWAs) featuring AI risk assessment, cross-chain functionality, and automated liquidation monitoring.

## Features
NFT Collateral System: Deposit property NFTs as loan collateral with Chainlink price verification
AI Risk Assessment: AWS Bedrock analyzes property data and borrower profiles to optimize interest rates
Cross-Chain Lending: Chainlink CCIP enables seamless funding across multiple blockchains
Automated Liquidation: Chainlink Automation monitors loan health and prevents defaults
Complete Workflow: End-to-end lending process from collateral deposit to loan funding

## Tech Stack
Frontend: React + TypeScript + Vite + Tailwind CSS
Backend: Express.js + TypeScript
Blockchain: Wagmi + RainbowKit for Web3 integration
AI: AWS Bedrock (Claude-3) for risk assessment
Oracles: Chainlink Price Feeds, CCIP, and Automation
Database: In-memory storage (configurable for PostgreSQL)

## Prerequisites
Node.js 18+
npm or yarn
AWS Account (for Bedrock AI)
MetaMask or compatible Web3 wallet

## Quick Setup
```bash
1. Clone and Install
git clone <repository-url>
cd oraclend
npm install
2. Environment Configuration
Copy the example environment file and configure your settings:

cp .env.example .env
Required environment variables:

# AWS Bedrock (Required for AI risk assessment)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
# Optional: Enhanced market insights
PERPLEXITY_API_KEY=your_perplexity_api_key_here
3. AWS Bedrock Setup
Create an AWS account and enable Bedrock access
Request access to Claude-3 models in your AWS region
Create IAM user with Bedrock permissions:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
4. Start the Application
# Start both frontend and backend
npm run dev
The application will be available at http://localhost:5000
```

## Smart Contract Integration
The platform works with the following smart contracts (testnet addresses included):

PropertyNFT: Tokenized real estate assets
LoanManager: Core lending logic with AI integration
CollateralVault: Secure NFT collateral storage
PropertyOracle: Chainlink price feed integration
LenderNFT: Tokenized lender positions

## How to Use
For Borrowers:
Connect your Web3 wallet
Navigate to the marketplace and select a property NFT
Click "Borrow" to start the complete workflow
Deposit your NFT as collateral
AI analyzes risk and determines interest rate
Receive loan funding via cross-chain transfer

For Lenders:
Connect your wallet with USDC
Browse available loan opportunities
Click "Lend" on desired properties
Fund loans and receive LenderNFT positions
Monitor returns via the liquidation dashboard

For Monitoring:
Visit the "Liquidation" tab
View real-time loan health factors
Monitor automated Chainlink upkeep
Track performance metrics

## Demo Mode
The platform includes demo data for testing:

Sample property NFTs with realistic valuations
Mock loan scenarios with various risk levels
Simulated AI risk assessments
Test liquidation monitoring

## Security Features
Smart contract-secured transactions
Chainlink oracle price verification
Automated liquidation protection
AI-powered risk assessment
Cross-chain security via CCIP

## Architecture
┌────────────────-─┐    ┌─────────────────-┐    ┌─────────────────-┐
│   React Client   │    │  Express Server  │    │  Smart Contracts │
│                  │    │                  │    │                  │
│ • NFT Marketplace│◄──►│ • AI Risk API    │◄──►│ • LoanManager    │
│ • Loan Management│    │ • Bedrock Service│    │ • CollateralVault│
│ • Liquidation UI │    │ • Storage Layer  │    │ • PropertyOracle │
└─────────────────-┘    └────────────────-─┘    └─────────────────-┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   External APIs │
                    │                 │
                    │ • AWS Bedrock   │
                    │ • Chainlink     │
                    │ • Perplexity    │
                    └─────────────────┘
## Production Deployment
Environment Setup

# Production environment
NODE_ENV=production
# Update contract addresses for mainnet
VITE_PROPERTY_NFT_ADDRESS=<mainnet_address>
VITE_LOAN_MANAGER_ADDRESS=<mainnet_address>
# ... other contract addresses
Deploy Commands
# Build for production
npm run build
# Start production server
npm start

## License
This project is licensed under the MIT License.



Complete Chainlink integration (Price Feeds, CCIP, Automation)
AWS Bedrock AI integration
Full-stack implementation
Production-ready architecture
Comprehensive documentation
Built for the Chainlink and AWS ecosystem with focus on real-world asset tokenization and AI-powered DeFi.