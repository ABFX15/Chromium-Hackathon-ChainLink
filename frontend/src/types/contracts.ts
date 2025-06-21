
export interface Loan {
  loanId: string;
  propertyName: string;
  tokenId: number;
  debt: number;
  totalDue: number;
  interest: number;
  healthFactor: number;
  isActive: boolean;
}

export interface PropertyNFT {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  tokenId: number;
  owner: string;
}

export interface LoanRequest {
  tokenId: number;
  amount: number;
  duration: number;
}
