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

- `PropertyNFT.sol`: ERC721 for tokenized properties, supports batch minting and metadata management.
- `CollateralVault.sol`: Holds NFT collateral during loans.
- `LenderNFT.sol`: Represents lender positions as NFTs.
- `PropertyOracle.sol`: Advanced oracle for property values, supports multiple appraisers, price history, and staleness checks.
- `LoanManager.sol`: Main protocol logic, orchestrates loans, collateral, cross-chain messaging, and liquidation.
- `YieldVault.sol`: Receives funds cross-chain, deposits into Aave, manages yield and principal distribution.
- `AIRiskManager.sol`: AI-powered risk assessment using Chainlink Functions and AWS Bedrock/Claude-3, with fallback and rate limiting.
- `CrossChainLiquidityPool.sol`: Manages cross-chain liquidity, supports adding/removing liquidity, and authorizes vaults for loan funding.
- `DepositNftTypes.sol`: Library for NFT collateral deposit data structures (used by CollateralVault).
- `InsurancePool.sol`: Lender insurance pool. Lenders can buy insurance for loans, premiums are pooled, and claims are paid out on default. Integrated with LoanManager for automatic claim processing.
- **Mocks (for testing):**
  - `MockUSDC.sol`, `MockERC20.sol`: Mock ERC20 tokens.
  - `MockERC721.sol`: Mock ERC721 token.
  - `MockAavePool.sol`: Mock Aave pool for local yield simulation.
  - `MockRouter.sol`: Mock Chainlink CCIP router.

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
5. **Buy Insurance**: On the loan detail or dashboard, a "Buy Insurance" button is visible for each loan that is not already insured. Once purchased, insurance status and claim info are displayed in real time.

---

## AI Strategy Step (Lender)

- After risk assessment, the modal shows:
  - Projected APY (e.g., 3.2%)
  - Estimated extra yield (e.g., $320 on $10,000 for 1 year)
  - Visual flow: Sepolia → Avalanche → Aave
- This step helps lenders understand the yield-optimization process.

---

## Insurance Feature (How it Works)

- **Smart Contract:** `InsurancePool.sol` allows lenders to buy insurance for any active loan. Premiums are pooled and paid out to the lender if the loan defaults.
- **Frontend:**
  - The insurance status and actions are visible on the loan detail view and/or lender dashboard.
  - If a loan is not insured, a "Buy Insurance" button is shown. If insured, the status and claim info are displayed.
  - The insurance UI is powered by the `InsuranceActions` component and uses the `buyInsurance` and `getPolicy` hooks.

---

## Testing

- Use the Sepolia testnet for end-to-end testing.
- Use the provided mock data and demo NFTs for quick setup.
- For real cross-chain testing, deploy `YieldVault` on Avalanche Fuji and update the address in `LoanManager`.

---

## License

MIT
