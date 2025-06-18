import { Address } from 'viem'

export interface PropertyNFT {
  tokenId: bigint
  propertyValue: number
  isCollateral: boolean
  maxLoan: number
  tokenURI?: string
}

export interface Loan {
  loanId: bigint
  tokenId: bigint
  principalAmount: bigint
  interestRate: bigint
  startTimestamp: bigint
  borrower: string
  lender: string
  isActive: boolean
  isFunded: boolean
}

export interface DepositNFT {
  tokenId: bigint
  loanId: bigint
  collateralValue: bigint
  timestamp: bigint
  borrower: string
  isActive: boolean
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: bigint
  timestamp: number
  status: 'pending' | 'success' | 'failed'
}

export interface MarketData {
  ethPrice: number
  ethChange: number
  usdcPrice: number
  protocolTVL: number
  activeLoans: number
  avgAPR: number
}

export interface StatsData {
  totalPortfolioValue: number
  activeLoansCount: number
  totalBorrowed: number
  availableCredit: number
  interestEarned: number
}
