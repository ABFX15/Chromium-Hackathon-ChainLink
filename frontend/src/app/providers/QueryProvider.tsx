"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long data stays fresh
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Cache time: how long inactive data stays in cache
            gcTime: 1000 * 60 * 30, // 30 minutes
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on user rejection or validation errors
              if (error?.type === 'USER_REJECTED' || error?.type === 'VALIDATION_ERROR') {
                return false;
              }
              // Retry up to 3 times for network errors
              return failureCount < 3;
            },
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus for critical data
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations on network errors
            retry: (failureCount, error: any) => {
              if (error?.type === 'USER_REJECTED') return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}