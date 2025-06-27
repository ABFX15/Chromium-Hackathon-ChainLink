import { Address } from 'viem';

// Enhanced type definitions with consistent bigint usage
export interface LoanData {
  loanId: bigint;
  tokenId: bigint;
  principalAmount: bigint;
  interestRate: bigint; // basis points
  startTimestamp: bigint;
  borrower: Address;
  lender: Address;
  isActive: boolean;
  isFunded: boolean;
  assetType?: bigint;
}

export interface PropertyNFTData {
  id: string;
  tokenId: bigint;
  name: string;
  description: string;
  image: string;
  owner: Address;
  isCollateral: boolean;
  propertyValue: bigint; // in wei equivalent (scaled)
  maxLoan: bigint;
  location: string;
  riskScore: number; // 0-100
  isSyncing?: boolean;
  metadata?: PropertyMetadata;
}

export interface PropertyMetadata {
  name: string;
  description: string;
  image: string;
  attributes: PropertyAttribute[];
  external_url?: string;
}

export interface PropertyAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface TransactionData {
  hash: Address;
  type: 'loan_created' | 'loan_funded' | 'loan_repaid' | 'nft_minted' | 'collateral_deposited' | 'value_updated';
  property: string;
  amount?: bigint;
  timestamp: bigint;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: bigint;
}

export interface RiskAssessmentData {
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  suggestedInterestRate: number;
  maxLTV: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
  timestamp: number;
}

export interface UserProfile {
  address: Address;
  totalLoansCreated: number;
  totalLoansFunded: number;
  totalValueLocked: bigint;
  creditScore?: number;
  riskLevel: 'low' | 'medium' | 'high';
  joinedAt: number;
}

// Error types for better error handling
export type ContractError = 
  | { type: 'NETWORK_ERROR'; message: string; cause?: Error }
  | { type: 'CONTRACT_ERROR'; message: string; code?: string }
  | { type: 'USER_REJECTED'; message: string }
  | { type: 'INSUFFICIENT_FUNDS'; message: string; required: bigint; available: bigint }
  | { type: 'VALIDATION_ERROR'; message: string; field?: string }
  | { type: 'IPFS_ERROR'; message: string; uri?: string };

export interface ContractResult<T> {
  data?: T;
  error?: ContractError;
  isLoading: boolean;
  isSuccess: boolean;
}

// Transaction state management
export interface TransactionState {
  hash?: Address;
  status: 'idle' | 'preparing' | 'pending' | 'confirming' | 'confirmed' | 'failed';
  error?: ContractError;
  receipt?: any;
}

// Form validation types
export interface LoanFormData {
  tokenId: string;
  amount: string;
  interestRate?: string;
  duration?: string;
}

export interface PropertyMintData {
  name: string;
  description: string;
  location: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land';
  value: string;
  sqft: string;
  yearBuilt?: string;
  image: File | null;
}

// API response types
export interface IPFSUploadResponse {
  success: boolean;
  hash?: string;
  url?: string;
  error?: string;
}

export interface RiskAssessmentRequest {
  propertyValue: number;
  propertyType: string;
  location: string;
  yearBuilt: number;
  squareFootage: number;
  loanAmount: number;
  borrowerCreditScore?: number;
  debtToIncomeRatio?: number;
}

// Chain and network types
export type SupportedChainId = 11155111 | 43113 | 80001 | 421614; // Sepolia, Fuji, Mumbai, Arbitrum Sepolia

export interface ChainConfig {
  id: SupportedChainId;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp: number;
}