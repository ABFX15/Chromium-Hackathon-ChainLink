import { Address } from "viem";

export interface Loan {
  loanId: bigint;
  tokenId: bigint;
  principalAmount: bigint;
  interestRate: bigint;
  startTimestamp: bigint;
  borrower: Address;
  lender: Address;
  isActive: boolean;
  isFunded: boolean;
  healthFactor?: number; // Optional, as it might be calculated off-chain
}

export interface PropertyNFT {
  id: string; // Can be tokenId as a string
  tokenId: number;
  name: string;
  location: string;
  price: number; // Represents propertyValue
  image: string;
  owner: Address;
  isCollateral?: boolean; // Optional, as we determine this in the hook
  propertyValue: number;
  maxLoan: number;
  description: string;
  riskScore: number;
}

export interface LoanRequest {
  tokenId: number;
  amount: number;
  duration: number;
}
