// Contract Addresses (Sepolia Testnet) - Updated after deployment
export const USDC_ADDRESS = '0x4d06f916930877A66530913AF69c3890c431D892';
export const PROPERTY_NFT_ADDRESS = '0x50eB8643547890076c0aF7f8A08252C0eB6F0C75';
export const COLLATERAL_VAULT_ADDRESS = '0x3ce46C18c085F84F4a8C1e027B08D6DeD7885aA1';
export const LOAN_MANAGER_ADDRESS = '0x50d1B01CAbAaf46Bf0F92515cBF4E40eDb3A9469';
export const PROPERTY_ORACLE_ADDRESS = '0xBe99D72f6409d430b0284abAe2EDe988319a0A1e';
export const LENDER_NFT_ADDRESS = '0xfc8b879Eb5354FE0b07a9e11eabdd2d6B0a9644b';
export const AI_RISK_MANAGER_ADDRESS = '0x4f355bb7eCfCa4EEe5589ad6dE2939641C5C098a';

// Chainlink Configuration
export const CHAINLINK_FUNCTIONS_ROUTER = '0x6eed6a1c74bb1ea4e6cc7e0201c7ba8db6bdaba0';
export const CHAINLINK_LINK_TOKEN = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
export const CHAINLINK_CCIP_ROUTER = '0xD0daae2231E9CB96b94C8512223533293C3693Bf';

// Asset Types
export const ASSET_TYPES = {
    REAL_ESTATE: 0,
    ART: 1,
    INVOICE: 2,
    COMMERCIAL_PROPERTY: 3,
    RESIDENTIAL_PROPERTY: 4
} as const;

// Loan Constants
export const LOAN_CONSTANTS = {
    PRECISION: 10000,
    BASE_RATE: 500, // 5% base rate
    MAX_RISK_SCORE: 100,
    LIQUIDATION_THRESHOLD: 8000, // 80% LTV
    WARNING_THRESHOLD: 8500, // 85% LTV
    SOFT_LIQUIDATION_THRESHOLD: 8000, // 80% LTV
    HARD_LIQUIDATION_THRESHOLD: 7500, // 75% LTV
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
    chainId: 11155111, // Sepolia
    name: 'Sepolia Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id',
} as const; 