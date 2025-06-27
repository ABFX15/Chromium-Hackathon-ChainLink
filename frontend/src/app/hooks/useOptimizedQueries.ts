"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '@/app/lib/wagmi';
import { Address } from 'viem';

import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { PropertyNFTData, LoanData, PropertyMetadata } from '../types/enhanced-contracts';
import { useAppStore } from '../store/appStore';

import LoanManagerABI from '@/abis/LoanManager.json';
import PropertyNFTABI from '@/abis/PropertyNFT.json';
import MockUSDCABI from '@/abis/MockUSDC.json';

// Query keys factory for consistent key management
export const queryKeys = {
  properties: {
    all: ['properties'] as const,
    user: (address: Address) => ['properties', 'user', address] as const,
    byId: (tokenId: bigint) => ['properties', 'byId', tokenId.toString()] as const,
    metadata: (uri: string) => ['properties', 'metadata', uri] as const,
  },
  loans: {
    all: ['loans'] as const,
    user: (address: Address) => ['loans', 'user', address] as const,
    byId: (loanId: bigint) => ['loans', 'byId', loanId.toString()] as const,
  },
  balances: {
    usdc: (address: Address) => ['balances', 'usdc', address] as const,
    nft: (address: Address) => ['balances', 'nft', address] as const,
  },
  contracts: {
    nextLoanId: ['contracts', 'nextLoanId'] as const,
    totalSupply: ['contracts', 'totalSupply'] as const,
  },
};

// Enhanced IPFS fetching with retry and error handling
const fetchMetadataWithRetry = async (uri: string, retries = 3): Promise<PropertyMetadata> => {
  const ipfsGatewayUrl = "https://ipfs.io/ipfs/";
  const metadataUrl = uri.replace("ipfs://", ipfsGatewayUrl);
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(metadataUrl, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'max-age=3600', // Cache for 1 hour
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      
      // Validate metadata structure
      if (!metadata.name || !metadata.description) {
        throw new Error('Invalid metadata structure');
      }
      
      return metadata;
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${uri}:`, error);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw new Error('All retry attempts failed');
};

// Property metadata query with caching
export const usePropertyMetadata = (tokenURI: string) => {
  return useQuery({
    queryKey: queryKeys.properties.metadata(tokenURI),
    queryFn: () => fetchMetadataWithRetry(tokenURI),
    enabled: !!tokenURI && tokenURI.startsWith('ipfs://'),
    staleTime: 1000 * 60 * 30, // 30 minutes - metadata rarely changes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// User's USDC balance
export const useUSDCBalance = () => {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: queryKeys.balances.usdc(address!),
    queryFn: async () => {
      const balance = await readContract(config, {
        address: CONTRACT_ADDRESSES.USDC,
        abi: MockUSDCABI.abi,
        functionName: 'balanceOf',
        args: [address],
      });
      return balance as bigint;
    },
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds - balances change frequently
    refetchOnWindowFocus: true,
  });
};

// User's NFT balance and properties
export const useUserProperties = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.properties.user(address!),
    queryFn: async (): Promise<PropertyNFTData[]> => {
      if (!address) return [];
      
      // Get user's NFT balance
      const balance = await readContract(config, {
        address: CONTRACT_ADDRESSES.PROPERTY_NFT,
        abi: PropertyNFTABI.abi,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;
      
      const properties: PropertyNFTData[] = [];
      
      // Get each token owned by user
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await readContract(config, {
            address: CONTRACT_ADDRESSES.PROPERTY_NFT,
            abi: PropertyNFTABI.abi,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(i)],
          }) as bigint;
          
          const tokenURI = await readContract(config, {
            address: CONTRACT_ADDRESSES.PROPERTY_NFT,
            abi: PropertyNFTABI.abi,
            functionName: 'tokenURI',
            args: [tokenId],
          }) as string;
          
          // Get metadata from cache or fetch
          let metadata: PropertyMetadata | undefined;
          try {
            metadata = await queryClient.fetchQuery({
              queryKey: queryKeys.properties.metadata(tokenURI),
              queryFn: () => fetchMetadataWithRetry(tokenURI),
              staleTime: 1000 * 60 * 30,
            });
          } catch (error) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, error);
          }
          
          const propertyValue = metadata?.attributes?.find(
            attr => attr.trait_type === 'Property Value'
          )?.value as number || 0;
          
          const riskScore = metadata?.attributes?.find(
            attr => attr.trait_type === 'Risk Score'
          )?.value as number || 50;
          
          const location = metadata?.attributes?.find(
            attr => attr.trait_type === 'Location'
          )?.value as string || 'Unknown';
          
          properties.push({
            id: tokenId.toString(),
            tokenId,
            name: metadata?.name || `Property #${tokenId}`,
            description: metadata?.description || 'Loading...',
            image: metadata?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '',
            owner: address,
            isCollateral: false, // Will be updated by loan queries
            propertyValue: BigInt(propertyValue * 1e6), // Convert to scaled value
            maxLoan: BigInt(propertyValue * 0.7 * 1e6),
            location,
            riskScore,
            metadata,
            isSyncing: !metadata,
          });
        } catch (error) {
          console.warn(`Failed to process NFT at index ${i}:`, error);
        }
      }
      
      return properties;
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

// All properties with infinite scroll
export const useAllProperties = () => {
  const queryClient = useQueryClient();
  
  return useInfiniteQuery({
    queryKey: queryKeys.properties.all,
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 10;
      const totalSupply = await readContract(config, {
        address: CONTRACT_ADDRESSES.PROPERTY_NFT,
        abi: PropertyNFTABI.abi,
        functionName: 'totalSupply',
      }) as bigint;
      
      const startIndex = pageParam * pageSize;
      const endIndex = Math.min(startIndex + pageSize, Number(totalSupply));
      
      const properties: PropertyNFTData[] = [];
      
      for (let i = startIndex; i < endIndex; i++) {
        try {
          const tokenId = await readContract(config, {
            address: CONTRACT_ADDRESSES.PROPERTY_NFT,
            abi: PropertyNFTABI.abi,
            functionName: 'tokenByIndex',
            args: [BigInt(i)],
          }) as bigint;
          
          const [tokenURI, owner] = await Promise.all([
            readContract(config, {
              address: CONTRACT_ADDRESSES.PROPERTY_NFT,
              abi: PropertyNFTABI.abi,
              functionName: 'tokenURI',
              args: [tokenId],
            }) as Promise<string>,
            readContract(config, {
              address: CONTRACT_ADDRESSES.PROPERTY_NFT,
              abi: PropertyNFTABI.abi,
              functionName: 'ownerOf',
              args: [tokenId],
            }) as Promise<Address>,
          ]);
          
          // Get metadata from cache or fetch
          let metadata: PropertyMetadata | undefined;
          try {
            metadata = await queryClient.fetchQuery({
              queryKey: queryKeys.properties.metadata(tokenURI),
              queryFn: () => fetchMetadataWithRetry(tokenURI),
              staleTime: 1000 * 60 * 30,
            });
          } catch (error) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, error);
          }
          
          const propertyValue = metadata?.attributes?.find(
            attr => attr.trait_type === 'Property Value'
          )?.value as number || 0;
          
          const riskScore = metadata?.attributes?.find(
            attr => attr.trait_type === 'Risk Score'
          )?.value as number || 50;
          
          const location = metadata?.attributes?.find(
            attr => attr.trait_type === 'Location'
          )?.value as string || 'Unknown';
          
          properties.push({
            id: tokenId.toString(),
            tokenId,
            name: metadata?.name || `Property #${tokenId}`,
            description: metadata?.description || 'Loading...',
            image: metadata?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '',
            owner,
            isCollateral: false, // Will be updated by loan queries
            propertyValue: BigInt(propertyValue * 1e6),
            maxLoan: BigInt(propertyValue * 0.7 * 1e6),
            location,
            riskScore,
            metadata,
            isSyncing: !metadata,
          });
        } catch (error) {
          console.warn(`Failed to process NFT at index ${i}:`, error);
        }
      }
      
      return {
        properties,
        nextCursor: endIndex < Number(totalSupply) ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// User's loans
export const useUserLoans = () => {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: queryKeys.loans.user(address!),
    queryFn: async (): Promise<LoanData[]> => {
      if (!address) return [];
      
      const nextLoanId = await readContract(config, {
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LoanManagerABI.abi,
        functionName: 'nextLoanId',
      }) as bigint;
      
      const loans: LoanData[] = [];
      
      for (let i = 1n; i < nextLoanId; i++) {
        try {
          const loanData = await readContract(config, {
            address: CONTRACT_ADDRESSES.LOAN_MANAGER,
            abi: LoanManagerABI.abi,
            functionName: 'loans',
            args: [i],
          }) as any[];
          
          const loan: LoanData = {
            loanId: loanData[0],
            tokenId: loanData[1],
            principalAmount: loanData[2],
            interestRate: loanData[3],
            startTimestamp: loanData[4],
            borrower: loanData[5],
            lender: loanData[6],
            isActive: loanData[7],
            isFunded: loanData[8],
          };
          
          // Only include loans where user is borrower or lender
          if (loan.borrower === address || loan.lender === address) {
            loans.push(loan);
          }
        } catch (error) {
          console.warn(`Failed to fetch loan ${i}:`, error);
        }
      }
      
      return loans;
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 1, // 1 minute - loans change frequently
    refetchOnWindowFocus: true,
  });
};

// Mutation for invalidating related queries after contract interactions
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  
  return {
    invalidateUserData: () => {
      if (address) {
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.user(address) });
        queryClient.invalidateQueries({ queryKey: queryKeys.loans.user(address) });
        queryClient.invalidateQueries({ queryKey: queryKeys.balances.usdc(address) });
      }
    },
    invalidateAllProperties: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    invalidateProperty: (tokenId: bigint) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.byId(tokenId) });
    },
    invalidateLoan: (loanId: bigint) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.byId(loanId) });
    },
  };
};