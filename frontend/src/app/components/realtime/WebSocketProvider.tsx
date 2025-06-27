"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { useAppStore } from '../../store/appStore';
import LoanManagerABI from '@/abis/LoanManager.json';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  connectionStatus: 'disconnected',
});

export const useRealtimeUpdates = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketContextType['connectionStatus']>('disconnected');
  const { addTransaction, updateLoan, addLoan } = useAppStore();

  // Real-time loan events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LOAN_MANAGER,
    abi: LoanManagerABI.abi,
    eventName: 'LoanCreated',
    onLogs: (logs) => {
      setConnectionStatus('connected');
      logs.forEach((log: any) => {
        const { args } = log;
        addTransaction({
          hash: log.transactionHash,
          type: 'loan_created',
          property: `Property #${args.tokenId}`,
          amount: args.amount,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          status: 'confirmed',
          blockNumber: log.blockNumber,
        });
      });
    },
    onError: () => setConnectionStatus('error'),
  });

  return (
    <WebSocketContext.Provider value={{
      isConnected: connectionStatus === 'connected',
      connectionStatus,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};