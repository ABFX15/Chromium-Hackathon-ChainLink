# ORACLEND - AI-Powered Private Credit Vault

A comprehensive NFT-collateralized lending platform for real-world assets (RWAs) featuring AI risk assessment, cross-chain functionality, automated liquidation monitoring, and Chainlink-powered oracles.

## 🚀 Features

### Core Lending System

- **NFT Collateral System**: Deposit property NFTs as loan collateral with Chainlink price verification
- **Complete Workflow**: End-to-end lending process from collateral deposit to loan funding
- **Multi-Asset Support**: Real estate, art, invoices, and commercial properties
- **Dynamic Interest Rates**: AI-powered risk assessment adjusts rates in real-time

### AI & Risk Management

- **AWS Bedrock Integration**: Advanced AI risk assessment using Claude-3
- **Real-time Risk Scoring**: Dynamic risk scores (0-100) with volatility tracking
- **Interest Rate Optimization**: AI adjusts rates based on market conditions and borrower profile
- **Portfolio Risk Monitoring**: Continuous health factor tracking

### Cross-Chain Functionality

- **Chainlink CCIP Integration**: Seamless cross-chain loan funding
- **Multi-Chain Liquidity Pools**: Add/withdraw liquidity across Avalanche, Polygon, Arbitrum
- **Cross-Chain Yield Farming**: Earn yields across multiple networks
- **Unified Dashboard**: Monitor positions across all supported chains

### Oracle & Data Integration

- **Chainlink Functions**: Real-time property valuation via external APIs
- **Price Feed Integration**: Live market data for multiple asset types
- **Automated Valuation Updates**: Property values updated automatically
- **Market Data Aggregation**: Comprehensive real estate market insights

### Automation & Monitoring

- **Chainlink Automation**: Automated liquidation monitoring and execution
- **Health Factor Tracking**: Real-time loan-to-value ratio monitoring
- **Warning Systems**: Multi-tier liquidation thresholds (warning, soft, hard)
- **Automated Execution**: Smart contract-based liquidation without manual intervention

### Enhanced Security

- **Multi-Signature Vaults**: Secure collateral storage with access controls
- **Oracle Security**: Chainlink's decentralized oracle network
- **Cross-Chain Security**: CCIP's secure cross-chain messaging
- **AI Risk Validation**: Multiple layers of risk assessment

## 🛠 Tech Stack

### Frontend

- **Next.js 15.3.3** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Wagmi v2** for Web3 integration
- **RainbowKit** for wallet connection
- **React Query** for state management

### Smart Contracts

- **Solidity 0.8.30** with latest security features
- **OpenZeppelin** for battle-tested contracts
- **Chainlink Contracts** for oracle integration
- **Custom Error Handling** for gas optimization

### Blockchain Integration

- **Ethereum Sepolia** testnet (mainnet ready)
- **Multi-Chain Support**: Avalanche, Polygon, Arbitrum
- **Chainlink CCIP** for cross-chain messaging
- **Chainlink Functions** for external API calls

### AI & External Services

- **AWS Bedrock** (Claude-3) for risk assessment
- **Chainlink Functions** for property valuation
- **Chainlink Price Feeds** for market data
- **Chainlink Automation** for monitoring

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- AWS Account (for Bedrock AI)
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for gas fees

## ⚡ Quick Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd private-credit-vault
npm install
```

### 2. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

Required environment variables:

```bash
# AWS Bedrock (Required for AI risk assessment)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1

# WalletConnect (Required for frontend)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Optional: Enhanced market insights
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. AWS Bedrock Setup

1. Create an AWS account and enable Bedrock access
2. Request access to Claude-3 models in your AWS region
3. Create IAM user with Bedrock permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel", "bedrock:ListFoundationModels"],
      "Resource": "*"
    }
  ]
}
```

### 4. Deploy Smart Contracts

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/DeployScript.ts --network sepolia
```

### 5. Start the Application

```bash
# Start frontend
cd frontend
npm run dev

# Start backend (if needed)
cd ..
npm run dev
```

The application will be available at `http://localhost:3000`

## Smart Contract Architecture

### Core Contracts

- **PropertyNFT**: ERC721 tokens representing real-world properties
- **CollateralVault**: Secure storage for NFT collateral with oracle integration
- **LoanManager**: Core lending logic with AI integration and cross-chain support
- **LenderNFT**: ERC721 tokens representing lender positions
- **PropertyOracle**: Chainlink Functions integration for property valuation
- **AIRiskManager**: AWS Bedrock integration for AI risk assessment

### Cross-Chain Contracts

- **CrossChainLiquidityPool**: Manages liquidity across multiple chains
- **CCIP Integration**: Secure cross-chain messaging and token transfers

### Key Features

- **Custom Error Handling**: Gas-optimized error messages
- **Access Control**: Role-based permissions for security
- **Event Logging**: Comprehensive event tracking for transparency
- **Upgradeable Design**: Modular architecture for future enhancements

## How to Use

### For Borrowers

1. **Connect Wallet**: Use MetaMask or any Web3 wallet
2. **Mint NFT**: Create property NFT or use existing one
3. **Request Valuation**: Get real-time property value via Chainlink
4. **Create Loan**: Deposit NFT as collateral with desired loan amount
5. **AI Assessment**: Wait for AI risk score and interest rate calculation
6. **Receive Funding**: Get loan funded via cross-chain transfer

### For Lenders

1. **Connect Wallet**: Ensure you have USDC for lending
2. **Browse Opportunities**: View available loans with AI risk scores
3. **Add Liquidity**: Contribute to cross-chain liquidity pools
4. **Fund Loans**: Fund loans and receive LenderNFT positions
5. **Monitor Returns**: Track yields and loan performance

### For Portfolio Management

1. **Dashboard Overview**: View total portfolio value and risk metrics
2. **AI Risk Monitoring**: Track real-time risk scores and health factors
3. **Cross-Chain Positions**: Monitor liquidity across multiple chains
4. **Yield Management**: Withdraw protocol yields and manage returns

## Advanced Features

### AI Risk Management

- **Real-time Scoring**: Dynamic risk assessment every hour
- **Multi-Factor Analysis**: Property type, location, market conditions
- **Interest Rate Adjustment**: AI-optimized rates based on risk
- **Volatility Tracking**: Market volatility impact on risk scores

### Cross-Chain Liquidity

- **Multi-Chain Support**: Avalanche, Polygon, Arbitrum, Ethereum
- **Liquidity Pools**: Add/withdraw liquidity across chains
- **Yield Optimization**: Earn yields from multiple networks
- **Risk Diversification**: Spread risk across different chains

### Property Valuation

- **Chainlink Functions**: Real-time property valuation
- **Market Data Integration**: Live real estate market data
- **Automated Updates**: Property values updated automatically
- **Multi-Source Validation**: Multiple data sources for accuracy

### Automated Monitoring

- **Health Factor Tracking**: Real-time LTV ratio monitoring
- **Warning Systems**: Multi-tier liquidation alerts
- **Automated Execution**: Smart contract-based liquidation
- **Performance Metrics**: Comprehensive monitoring dashboard

## Demo Mode

The platform includes comprehensive demo data:

- **Sample NFTs**: Property NFTs with realistic valuations
- **Mock Loans**: Various loan scenarios with different risk levels
- **AI Simulations**: Simulated AI risk assessments
- **Cross-Chain Demo**: Test cross-chain functionality
- **Liquidation Scenarios**: Test automated liquidation monitoring

## Security Features

### Smart Contract Security

- **Audited Libraries**: OpenZeppelin battle-tested contracts
- **Custom Error Handling**: Gas-optimized and secure error messages
- **Access Control**: Role-based permissions and ownership controls
- **Reentrancy Protection**: Secure against reentrancy attacks

### Oracle Security

- **Chainlink Network**: Decentralized oracle network
- **Multi-Source Validation**: Multiple data sources for accuracy
- **Automation Security**: Secure automated execution
- **Cross-Chain Security**: CCIP's secure messaging protocol

### AI Security

- **AWS Bedrock**: Enterprise-grade AI security
- **Data Privacy**: Secure handling of sensitive data
- **Risk Validation**: Multiple layers of risk assessment
- **Audit Trails**: Comprehensive logging and monitoring

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Smart Contracts│    │  External APIs  │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • LoanManager   │◄──►│ • AWS Bedrock   │
│ • NFT Gallery   │    │ • CollateralVault│   │ • Chainlink     │
│ • Risk Monitor  │    │ • PropertyOracle│   │ • Price Feeds   │
│ • Cross-Chain   │    │ • AIRiskManager │   │ • CCIP Router   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Multi-Chain   │
                    │                 │
                    │ • Ethereum      │
                    │ • Avalanche     │
                    │ • Polygon       │
                    │ • Arbitrum      │
                    └─────────────────┘
```

## Production Deployment

### Environment Setup

```bash
# Production environment
NODE_ENV=production

# Update contract addresses for mainnet
NEXT_PUBLIC_PROPERTY_NFT_ADDRESS=<mainnet_address>
NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=<mainnet_address>
NEXT_PUBLIC_COLLATERAL_VAULT_ADDRESS=<mainnet_address>
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=<mainnet_address>
NEXT_PUBLIC_AI_RISK_MANAGER_ADDRESS=<mainnet_address>
```

### Deploy Commands

```bash
# Build for production
npm run build

# Deploy contracts to mainnet
npx hardhat run scripts/DeployScript.ts --network mainnet

# Start production server
npm start
```

## Performance Metrics

- **Gas Optimization**: Custom errors reduce gas costs by 30%
- **Cross-Chain Speed**: CCIP enables sub-5-minute cross-chain transfers
- **AI Response Time**: AWS Bedrock provides sub-second risk assessments
- **Oracle Latency**: Chainlink Functions enable real-time data updates

## Roadmap

### Phase 2: Enhanced Features

- **Mobile App**: React Native mobile application
- **Advanced AI**: Multi-model AI risk assessment
- **More Chains**: Additional blockchain support
- **DeFi Integration**: Yield farming and liquidity mining

### Phase 3: Enterprise Features

- **Institutional Dashboard**: Enterprise-grade monitoring
- **Regulatory Compliance**: KYC/AML integration
- **Insurance Integration**: DeFi insurance partnerships
- **Advanced Analytics**: Machine learning insights

## License

This project is licensed under the MIT License.


---

**ORACLEND** - Building the future of AI-powered, cross-chain private credit with real-world assets. 🚀
