"use client";

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryProvider } from './QueryProvider';
import { WebSocketProvider } from '../components/realtime/WebSocketProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { config } from '../lib/wagmi';
import { Toaster } from 'react-hot-toast';

interface EnhancedProvidersProps {
  children: React.ReactNode;
}

export function EnhancedProviders({ children }: EnhancedProvidersProps) {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryProvider>
          <RainbowKitProvider>
            <WebSocketProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    borderRadius: '0.5rem',
                  },
                  success: {
                    style: {
                      background: '#065f46',
                      color: '#ecfdf5',
                    },
                  },
                  error: {
                    style: {
                      background: '#7f1d1d',
                      color: '#fef2f2',
                    },
                  },
                }}
              />
            </WebSocketProvider>
          </RainbowKitProvider>
        </QueryProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}