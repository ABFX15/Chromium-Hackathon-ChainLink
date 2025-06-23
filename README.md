# ORACLEND: NFT-Collateralized Cross-Chain Lending Platform

## Overview

**ORACLEND** is a next-generation NFT-collateralized lending protocol for real-world assets (RWAs), featuring:

- **AI-powered risk assessment**
- **Cross-chain lending** via Chainlink CCIP
- **Automated liquidation monitoring**
- **Dynamic yield farming**: Lender funds are sent cross-chain and deposited into protocols like Aave to earn extra yield

---

## Key Features

- **NFT Collateralization**: Tokenize real estate or other RWAs as NFTs and use them as loan collateral.
- **AI Risk Assessment**: AWS Bedrock/Claude-3 analyzes property and borrower data to set optimal loan terms.
- **Cross-Chain Lending**: Loans are funded on one chain (e.g., Ethereum Sepolia), collateral is held, and funds are sent to another chain (e.g., Avalanche Fuji) for yield farming.
- **YieldVault**: A smart contract on the destination chain receives funds and deposits them into Aave (or similar) to generate yield for the lender.
- **Automated Liquidation**: Chainlink Automation monitors loan health and triggers liquidation if needed.
- **Modern Frontend**: Step-by-step animated workflow, including a new "AI Strategy" step for lenders.

---

## Architecture

```
Lender (Sepolia) ──funds──▶ LoanManager ──CCIP──▶ YieldVault (Avalanche Fuji) ──▶ Aave
   ▲                        │
   │                        └── NFT Collateral held in CollateralVault
   │
Borrower ◀─────────────── receives principal from YieldVault
```

- **LoanManager**: Orchestrates the loan, collateral, and cross-chain messaging.
- **YieldVault**: Receives funds on the destination chain, deposits into Aave, and manages yield distribution.
- **PropertyOracle**: Stores property values for LTV calculations.
- **CollateralVault**: Holds NFT collateral during the loan.

---

## Smart Contracts

- `PropertyNFT.sol`: ERC721 for tokenized properties
- `CollateralVault.sol`: Holds NFT collateral
- `LenderNFT.sol`: Represents lender positions
- `PropertyOracle.sol`: Key-value store for property values
- `LoanManager.sol`: Main protocol logic, cross-chain messaging, liquidation
- `YieldVault.sol`: Receives funds cross-chain, deposits into Aave, manages yield

---

## Deployment

### Prerequisites

- Node.js, npm
- Hardhat
- Sepolia ETH (for deployment)
- (Optional) Avalanche Fuji testnet funds for cross-chain testing

### 1. Install dependencies

```sh
npm install
```

### 2. Deploy contracts

```sh
npx hardhat run scripts/DeployAllContracts.ts --network sepolia
```

- This will deploy all contracts and print their addresses.
- The script also deploys a mock `YieldVault` for local testing.

### 3. Update frontend config

- Copy the deployed contract addresses into `frontend/src/lib/contracts.ts`.

### 4. Start the frontend

```sh
cd frontend
npm install
npm run dev
```

---

## Frontend Workflow

### Borrower

1. **Mint Property NFT**
2. **Request Loan** (AI risk assessment sets terms)
3. **Deposit NFT as Collateral**
4. **Loan listed in marketplace**

### Lender

1. **Select a loan to fund**
2. **AI Risk Assessment**
3. **AI Strategy Step**: See projected yield from cross-chain Aave deposit
4. **Fund Loan** (USDC sent cross-chain, yield farming begins)

---

## AI Strategy Step (Lender)

- After risk assessment, the modal shows:
  - Projected APY (e.g., 3.2%)
  - Estimated extra yield (e.g., $320 on $10,000 for 1 year)
  - Visual flow: Sepolia → Avalanche → Aave
- This step helps lenders understand the yield-optimization process.

---

## Testing

- Use the Sepolia testnet for end-to-end testing.
- Use the provided mock data and demo NFTs for quick setup.
- For real cross-chain testing, deploy `YieldVault` on Avalanche Fuji and update the address in `LoanManager`.

---

## Contributing

PRs and issues welcome!

---

## License

MIT
