"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from "wagmi";
import { readContract, waitForTransactionReceipt, simulateContract } from "@wagmi/core";
import { config } from "@/app/lib/wagmi";
import { useState, useCallback } from "react";
import { Address, TransactionReceipt } from "viem";
import { toast } from "react-hot-toast";

import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { ContractError, ContractResult, TransactionState, LoanData, PropertyNFTData } from "../types/enhanced-contracts";
import { useAppStore } from "../store/appStore";

import LoanManagerABI from "@/abis/LoanManager.json";
import PropertyNFTABI from "@/abis/PropertyNFT.json";
import MockUSDCABI from "@/abis/MockUSDC.json";
import CollateralVaultABI from "@/abis/CollateralVault.json";

// Enhanced error handling
const createContractError = (error: any): ContractError => {
  if (error?.message?.includes('User rejected')) {
    return { type: 'USER_REJECTED', message: 'Transaction was rejected by user' };
  }
  
  if (error?.message?.includes('insufficient funds')) {
    return { 
      type: 'INSUFFICIENT_FUNDS', 
      message: 'Insufficient funds for transaction',
      required: BigInt(0), // Would need to parse from error
      available: BigInt(0)
    };
  }
  
  if (error?.code) {
    return { 
      type: 'CONTRACT_ERROR', 
      message: error.shortMessage || error.message,
      code: error.code 
    };
  }
  
  return { 
    type: 'NETWORK_ERROR', 
    message: error?.message || 'Unknown network error',
    cause: error 
  };
};

// Transaction simulation helper
const simulateTransaction = async (params: any): Promise<boolean> => {
  try {
    await simulateContract(config, params);
    return true;
  } catch (error) {
    console.warn('Transaction simulation failed:', error);
    return false;
  }
};

export const useEnhancedContracts = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  // State management
  const { 
    setLoading, 
    setError, 
    clearError,
    addTransaction,
    updateTransaction,
    addLoan,
    addProperty,
    updateLoan,
    updateProperty
  } = useAppStore();

  // Transaction state
  const [transactionStates, setTransactionStates] = useState<Record<string, TransactionState>>({});

  // Enhanced contract write with proper error handling and simulation
  const executeContractWrite = useCallback(async <T = any>(
    params: any,
    options: {
      simulate?: boolean;
      loadingKey?: string;
      successMessage?: string;
      onSuccess?: (receipt: TransactionReceipt) => void;
      onError?: (error: ContractError) => void;
    } = {}
  ): Promise<ContractResult<TransactionReceipt>> => {
    const { simulate = true, loadingKey, successMessage, onSuccess, onError } = options;
    
    if (!address) {
      const error: ContractError = { type: 'VALIDATION_ERROR', message: 'Wallet not connected' };
      return { error, isLoading: false, isSuccess: false };
    }

    const operationId = `${params.functionName}_${Date.now()}`;
    
    // Set loading state
    if (loadingKey) {
      setLoading(loadingKey as any, true);
      clearError(loadingKey as any);
    }

    setTransactionStates(prev => ({
      ...prev,
      [operationId]: { status: 'preparing' }
    }));

    try {
      // Simulate transaction if requested
      if (simulate) {
        setTransactionStates(prev => ({
          ...prev,
          [operationId]: { status: 'preparing' }
        }));

        const canExecute = await simulateTransaction(params);
        if (!canExecute) {
          const error: ContractError = { 
            type: 'CONTRACT_ERROR', 
            message: 'Transaction simulation failed - this transaction would likely fail' 
          };
          
          if (loadingKey) setError(loadingKey as any, error);
          setTransactionStates(prev => ({
            ...prev,
            [operationId]: { status: 'failed', error }
          }));
          
          onError?.(error);
          return { error, isLoading: false, isSuccess: false };
        }
      }

      // Execute transaction
      setTransactionStates(prev => ({
        ...prev,
        [operationId]: { status: 'pending' }
      }));

      const hash = await writeContractAsync(params);
      
      setTransactionStates(prev => ({
        ...prev,
        [operationId]: { status: 'confirming', hash }
      }));

      // Add to transaction history
      addTransaction({
        hash,
        type: 'loan_created', // Will be more specific based on function
        property: `Operation ${params.functionName}`,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        status: 'pending'
      });

      toast.loading(`Transaction submitted...`, { id: hash });

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(config, { hash });
      
      setTransactionStates(prev => ({
        ...prev,
        [operationId]: { status: 'confirmed', hash, receipt }
      }));

      // Update transaction in history
      updateTransaction(hash, { 
        status: 'confirmed',
        blockNumber: receipt.blockNumber
      });

      toast.success(successMessage || 'Transaction confirmed!', { id: hash });
      
      onSuccess?.(receipt);
      
      return { 
        data: receipt, 
        isLoading: false, 
        isSuccess: true 
      };

    } catch (error: any) {
      const contractError = createContractError(error);
      
      setTransactionStates(prev => ({
        ...prev,
        [operationId]: { status: 'failed', error: contractError }
      }));

      if (loadingKey) setError(loadingKey as any, contractError);
      
      // Update transaction if hash exists
      const currentState = transactionStates[operationId];
      if (currentState?.hash) {
        updateTransaction(currentState.hash, { status: 'failed' });
        toast.error(contractError.message, { id: currentState.hash });
      }
      
      onError?.(contractError);
      
      return { 
        error: contractError, 
        isLoading: false, 
        isSuccess: false 
      };
    } finally {
      if (loadingKey) {
        setLoading(loadingKey as any, false);
      }
    }
  }, [address, writeContractAsync, setLoading, setError, clearError, addTransaction, updateTransaction]);

  // Specific contract functions with enhanced error handling
  const mintPropertyNFT = useCallback(async (
    metadataUrl: string
  ): Promise<ContractResult<{ tokenId: bigint; receipt: TransactionReceipt }>> => {
    const result = await executeContractWrite({
      address: CONTRACT_ADDRESSES.PROPERTY_NFT,
      abi: PropertyNFTABI.abi,
      functionName: 'safeMint',
      args: [address, metadataUrl],
    }, {
      loadingKey: 'properties',
      successMessage: 'Property NFT minted successfully!',
      onSuccess: (receipt) => {
        // Parse logs to get token ID and add to store
        // This would need proper log parsing
        console.log('NFT minted:', receipt);
      }
    });

    if (result.data) {
      // Extract tokenId from logs (simplified)
      const tokenId = BigInt(1); // Would parse from logs
      return { 
        ...result, 
        data: { tokenId, receipt: result.data }
      };
    }

    return result as any;
  }, [address, executeContractWrite]);

  const createLoan = useCallback(async (
    tokenId: bigint,
    amount: bigint,
    assetType: bigint,
    interestRate: bigint
  ): Promise<ContractResult<{ loanId: bigint; receipt: TransactionReceipt }>> => {
    const result = await executeContractWrite({
      address: CONTRACT_ADDRESSES.LOAN_MANAGER,
      abi: LoanManagerABI.abi,
      functionName: 'depositNFTCollateral',
      args: [tokenId, amount, assetType, interestRate],
    }, {
      loadingKey: 'loans',
      successMessage: 'Loan created successfully!',
      onSuccess: (receipt) => {
        // Add loan to store with parsed data from logs
        console.log('Loan created:', receipt);
      }
    });

    if (result.data) {
      const loanId = BigInt(1); // Would parse from logs
      return { 
        ...result, 
        data: { loanId, receipt: result.data }
      };
    }

    return result as any;
  }, [executeContractWrite]);

  const fundLoan = useCallback(async (
    loanId: bigint,
    fee: bigint = BigInt(0)
  ): Promise<ContractResult<TransactionReceipt>> => {
    return executeContractWrite({
      address: CONTRACT_ADDRESSES.LOAN_MANAGER,
      abi: LoanManagerABI.abi,
      functionName: 'fundLoanCrossChain',
      args: [loanId],
      value: fee,
    }, {
      loadingKey: 'loans',
      successMessage: 'Loan funded successfully!',
      onSuccess: (receipt) => {
        // Update loan status in store
        updateLoan(loanId, { isFunded: true, lender: address! });
      }
    });
  }, [executeContractWrite, updateLoan, address]);

  const repayLoan = useCallback(async (
    loanId: bigint
  ): Promise<ContractResult<TransactionReceipt>> => {
    return executeContractWrite({
      address: CONTRACT_ADDRESSES.LOAN_MANAGER,
      abi: LoanManagerABI.abi,
      functionName: 'repayLoan',
      args: [loanId],
    }, {
      loadingKey: 'loans',
      successMessage: 'Loan repaid successfully!',
      onSuccess: (receipt) => {
        // Update loan status in store
        updateLoan(loanId, { isActive: false });
      }
    });
  }, [executeContractWrite, updateLoan]);

  const approveToken = useCallback(async (
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ): Promise<ContractResult<TransactionReceipt>> => {
    return executeContractWrite({
      address: tokenAddress,
      abi: MockUSDCABI.abi,
      functionName: 'approve',
      args: [spender, amount],
    }, {
      simulate: false, // Approvals are usually safe
      successMessage: 'Token approval successful!'
    });
  }, [executeContractWrite]);

  const approveNFT = useCallback(async (
    tokenId: bigint,
    spender: Address
  ): Promise<ContractResult<TransactionReceipt>> => {
    return executeContractWrite({
      address: CONTRACT_ADDRESSES.PROPERTY_NFT,
      abi: PropertyNFTABI.abi,
      functionName: 'approve',
      args: [spender, tokenId],
    }, {
      simulate: false,
      successMessage: 'NFT approval successful!'
    });
  }, [executeContractWrite]);

  // Read functions with error handling
  const readContractSafe = useCallback(async <T = any>(
    params: any
  ): Promise<ContractResult<T>> => {
    try {
      const data = await readContract(config, params) as T;
      return { data, isLoading: false, isSuccess: true };
    } catch (error: any) {
      const contractError = createContractError(error);
      return { error: contractError, isLoading: false, isSuccess: false };
    }
  }, []);

  return {
    // Contract write functions
    mintPropertyNFT,
    createLoan,
    fundLoan,
    repayLoan,
    approveToken,
    approveNFT,
    
    // Utility functions
    executeContractWrite,
    readContractSafe,
    
    // State
    transactionStates,
    
    // Computed
    isConnected,
    userAddress: address,
  };
};