import { Address } from 'viem';
import { readContract } from '@wagmi/core';
import { config } from './wagmi';

// Contract addresses by network
export const CONTRACT_ADDRESSES_BY_NETWORK = {
  // Hardhat local network
  31337: {
    PROPERTY_NFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
    COLLATERAL_VAULT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as Address,
    LENDER_NFT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as Address,
    PROPERTY_ORACLE: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as Address,
    LOAN_MANAGER: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as Address,
    CROSS_CHAIN_LIQUIDITY_POOL: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as Address,
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
  },
  
  // Sepolia testnet - Add your deployed addresses here
  11155111: {
    PROPERTY_NFT: "0x0000000000000000000000000000000000000000" as Address, // Update with deployed address
    COLLATERAL_VAULT: "0x0000000000000000000000000000000000000000" as Address,
    LENDER_NFT: "0x0000000000000000000000000000000000000000" as Address,
    PROPERTY_ORACLE: "0x0000000000000000000000000000000000000000" as Address,
    LOAN_MANAGER: "0x0000000000000000000000000000000000000000" as Address,
    CROSS_CHAIN_LIQUIDITY_POOL: "0x0000000000000000000000000000000000000000" as Address,
    USDC: "0x4d06f916930877A66530913AF69c3890c431D892" as Address, // Sepolia USDC
  },
  
  // Polygon Mumbai - Add your deployed addresses here
  80001: {
    PROPERTY_NFT: "0x0000000000000000000000000000000000000000" as Address,
    COLLATERAL_VAULT: "0x0000000000000000000000000000000000000000" as Address,
    LENDER_NFT: "0x0000000000000000000000000000000000000000" as Address,
    PROPERTY_ORACLE: "0x0000000000000000000000000000000000000000" as Address,
    LOAN_MANAGER: "0x0000000000000000000000000000000000000000" as Address,
    CROSS_CHAIN_LIQUIDITY_POOL: "0x0000000000000000000000000000000000000000" as Address,
    USDC: "0x0000000000000000000000000000000000000000" as Address,
  },
} as const;

// Get contract addresses for current network
export const getContractAddresses = (chainId: number) => {
  const addresses = CONTRACT_ADDRESSES_BY_NETWORK[chainId as keyof typeof CONTRACT_ADDRESSES_BY_NETWORK];
  
  if (!addresses) {
    throw new Error(`Contracts not deployed on network ${chainId}. Please deploy contracts first.`);
  }
  
  return addresses;
};

// Check if a contract exists and has the expected function
export const isContractDeployed = async (
  address: Address, 
  abi: any[], 
  functionName: string = 'totalSupply'
): Promise<boolean> => {
  try {
    // Check if address is zero address
    if (address === "0x0000000000000000000000000000000000000000") {
      return false;
    }
    
    // Try to call a simple function to verify contract exists
    await readContract(config, {
      address,
      abi,
      functionName,
    });
    
    return true;
  } catch (error) {
    console.warn(`Contract at ${address} not found or function ${functionName} not available:`, error);
    return false;
  }
};

// Enhanced contract addresses with fallback
export const getContractAddressesWithFallback = async (chainId: number) => {
  try {
    const addresses = getContractAddresses(chainId);
    return addresses;
  } catch (error) {
    console.warn(`No contracts deployed on network ${chainId}, using mock mode`);
    
    // Return zero addresses for mock mode
    return {
      PROPERTY_NFT: "0x0000000000000000000000000000000000000000" as Address,
      COLLATERAL_VAULT: "0x0000000000000000000000000000000000000000" as Address,
      LENDER_NFT: "0x0000000000000000000000000000000000000000" as Address,
      PROPERTY_ORACLE: "0x0000000000000000000000000000000000000000" as Address,
      LOAN_MANAGER: "0x0000000000000000000000000000000000000000" as Address,
      CROSS_CHAIN_LIQUIDITY_POOL: "0x0000000000000000000000000000000000000000" as Address,
      USDC: "0x0000000000000000000000000000000000000000" as Address,
    };
  }
};

// Safe contract read with error handling
export const safeReadContract = async <T = any>(params: {
  address: Address;
  abi: any[];
  functionName: string;
  args?: any[];
}): Promise<{ data?: T; error?: string }> => {
  try {
    // Check if contract is deployed first
    const isDeployed = await isContractDeployed(params.address, params.abi, params.functionName);
    
    if (!isDeployed) {
      return { error: 'Contract not deployed or function not available' };
    }
    
    const data = await readContract(config, params) as T;
    return { data };
  } catch (error: any) {
    const errorMessage = error.shortMessage || error.message || 'Unknown contract error';
    console.warn('Contract read failed:', errorMessage);
    return { error: errorMessage };
  }
};

// Deployment status checker
export const checkDeploymentStatus = async (chainId: number) => {
  try {
    const addresses = getContractAddresses(chainId);
    const status = {
      chainId,
      contracts: {} as Record<string, boolean>,
      allDeployed: true,
    };
    
    // Import ABIs dynamically to avoid issues
    const { default: PropertyNFTABI } = await import('@/abis/PropertyNFT.json');
    const { default: LoanManagerABI } = await import('@/abis/LoanManager.json');
    const { default: MockUSDCABI } = await import('@/abis/MockUSDC.json');
    
    // Check each contract
    const checks = [
      { name: 'PROPERTY_NFT', address: addresses.PROPERTY_NFT, abi: PropertyNFTABI.abi },
      { name: 'LOAN_MANAGER', address: addresses.LOAN_MANAGER, abi: LoanManagerABI.abi, fn: 'nextLoanId' },
      { name: 'USDC', address: addresses.USDC, abi: MockUSDCABI.abi, fn: 'balanceOf' },
    ];
    
    for (const check of checks) {
      const isDeployed = await isContractDeployed(
        check.address, 
        check.abi, 
        check.fn || 'totalSupply'
      );
      
      status.contracts[check.name] = isDeployed;
      if (!isDeployed) {
        status.allDeployed = false;
      }
    }
    
    return status;
  } catch (error) {
    return {
      chainId,
      contracts: {},
      allDeployed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};