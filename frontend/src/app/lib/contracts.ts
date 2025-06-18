// Contract addresses (Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
    LOAN_MANAGER: '0xDFCb7F89666a4B4E334C91E22fC96e9F311CC0D7',
    COLLATERAL_VAULT: '0x14CB1bFE6E8D65953D05EB3782b1424ff513f9E9',
    PROPERTY_NFT: '0x4E67Cb78CFAE488CA81290Bf3184453D4EF0d3a8',
    LENDER_NFT: '0x0000000000000000000000000000000000000000', // needs deployment
    USDC: '0x741f7929daa14476ee7c987b4C17a48AFC9dA35A', // MockUSDC
    PRICE_FEED: '0x0000000000000000000000000000000000000000', // Update with actual price feed
    CCIP_ROUTER: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    PROPERTY_ORACLE: '0xE05eb8421Cf98cC6a02d9b0BeCe0a3d7ECCE1d07',
} as const

// Loan Manager ABI
export const LOAN_MANAGER_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint256", "name": "requestedAmount", "type": "uint256" }
        ],
        "name": "depositNFTCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "loanId", "type": "uint256" }
        ],
        "name": "fundLoanCrossChain",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "loanId", "type": "uint256" }
        ],
        "name": "repayLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "loanId", "type": "uint256" }
        ],
        "name": "liquidateLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "loanId", "type": "uint256" }
        ],
        "name": "calculateCurrentDebt",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "loans",
        "outputs": [
            { "internalType": "uint256", "name": "loanId", "type": "uint256" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint256", "name": "principalAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
            { "internalType": "uint256", "name": "startTimestamp", "type": "uint256" },
            { "internalType": "address", "name": "borrower", "type": "address" },
            { "internalType": "address", "name": "lender", "type": "address" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "bool", "name": "isFunded", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

// Collateral Vault ABI
export const COLLATERAL_VAULT_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "activeLoans",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "getDeposit",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
                    { "internalType": "uint256", "name": "loanId", "type": "uint256" },
                    { "internalType": "uint256", "name": "collateralValue", "type": "uint256" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "address", "name": "borrower", "type": "address" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" }
                ],
                "internalType": "struct DepositNftTypes.DepositNft",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

// Property NFT ABI
export const PROPERTY_NFT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" }
        ],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "uint256", "name": "index", "type": "uint256" }
        ],
        "name": "tokenOfOwnerByIndex",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "tokenURI",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const

// USDC ABI
export const USDC_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const 