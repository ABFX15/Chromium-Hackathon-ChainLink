// Contract addresses (Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
    LOAN_MANAGER: '0xa06E2EC33adD56Eab0629Ba6A0C9A709822941ac',
    COLLATERAL_VAULT: '0xe2f72471c2D1Acc74F410a1AD481F87d77A512A7',
    PROPERTY_NFT: '0x23d7Ae1B750e174a915A95606E64927324df3548',
    LENDER_NFT: '0x0000000000000000000000000000000000000000', // needs deployment
    USDC: '0x4d06f916930877A66530913AF69c3890c431D892', // MockUSDC
    PRICE_FEED: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // ETH/USD Sepolia
    CCIP_ROUTER: '0xD0daae2231E9CB96b94C8512223533293C3693Bf',
    PROPERTY_ORACLE: '0xB778e095E88da7466005B72ceBF6e78341401a30',
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
    },
    {
        "inputs": [],
        "name": "nextLoanId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint64", "name": "chainSelector", "type": "uint64" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "addCCIPLiquidity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "loanId", "type": "uint256" },
            { "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64" }
        ],
        "name": "executeCCIPLoan",
        "outputs": [],
        "stateMutability": "payable",
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

export const USDC_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{ "name": "", "type": "string" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
        "name": "transferFrom",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
] as const;