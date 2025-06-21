
// Contract addresses (these would be set after deployment)
export const CONTRACT_ADDRESSES = {
  PROPERTY_NFT: process.env.NEXT_PUBLIC_PROPERTY_NFT_ADDRESS || "0x1234567890123456789012345678901234567890",
  LOAN_MANAGER: process.env.NEXT_PUBLIC_LOAN_MANAGER_ADDRESS || "0x1234567890123456789012345678901234567890",
  MOCK_USDC: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || "0x1234567890123456789012345678901234567890",
  COLLATERAL_VAULT: process.env.NEXT_PUBLIC_COLLATERAL_VAULT_ADDRESS || "0x1234567890123456789012345678901234567890"
};

// Basic ABI definitions (you would import the full ABIs from your generated files)
export const PROPERTY_NFT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)"
];

export const LOAN_MANAGER_ABI = [
  "function createLoan(uint256 tokenId, uint256 loanAmount) public",
  "function repayLoan(uint256 loanId) public",
  "function liquidateLoan(uint256 loanId) public",
  "function getLoanDetails(uint256 loanId) public view returns (tuple(uint256 tokenId, uint256 debt, uint256 startTimestamp, address borrower))"
];

export const MOCK_USDC_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function mint(address to, uint256 amount) public"
];
