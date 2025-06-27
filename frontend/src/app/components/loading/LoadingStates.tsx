"use client";

import React from 'react';
import { Loader2, Wallet, Database, Globe, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

interface LoadingCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const LoadingCard = ({ title, description, icon, children }: LoadingCardProps) => (
  <Card className="max-w-md mx-auto">
    <CardContent className="p-6 text-center">
      <div className="flex justify-center mb-4">
        {icon || <LoadingSpinner size="lg" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      )}
      {children}
    </CardContent>
  </Card>
);

// Wallet connection loading
export const WalletConnectionLoading = () => (
  <LoadingCard
    title="Connecting Wallet"
    description="Please confirm the connection in your wallet..."
    icon={<Wallet className="w-8 h-8 text-blue-500 animate-pulse" />}
  />
);

// Contract interaction loading
export const ContractInteractionLoading = ({ 
  operation = "Processing transaction" 
}: { 
  operation?: string 
}) => (
  <LoadingCard
    title={operation}
    description="Please wait while we process your transaction on the blockchain..."
    icon={<Database className="w-8 h-8 text-green-500 animate-pulse" />}
  />
);

// IPFS loading
export const IPFSLoading = () => (
  <LoadingCard
    title="Loading from IPFS"
    description="Fetching property metadata from the distributed network..."
    icon={<Globe className="w-8 h-8 text-purple-500 animate-pulse" />}
  />
);

// Transaction confirmation loading
export const TransactionConfirmationLoading = ({ 
  hash,
  explorerUrl 
}: { 
  hash?: string;
  explorerUrl?: string;
}) => (
  <LoadingCard
    title="Confirming Transaction"
    description="Your transaction has been submitted and is being confirmed on the blockchain..."
  >
    {hash && explorerUrl && (
      <Button
        variant="outline"
        size="sm"
        asChild
        className="mt-4"
      >
        <a 
          href={`${explorerUrl}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Explorer
        </a>
      </Button>
    )}
  </LoadingCard>
);

// Full page loading overlay
export const FullPageLoading = ({ 
  message = "Loading..." 
}: { 
  message?: string 
}) => (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingCard
      title={message}
      description="Please wait while we fetch the latest data..."
    />
  </div>
);

// Error state with retry
interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = ({ 
  title, 
  description, 
  onRetry, 
  retryLabel = "Try Again" 
}: ErrorStateProps) => (
  <Card className="max-w-md mx-auto border-red-200 bg-red-50">
    <CardContent className="p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
      {description && (
        <p className="text-red-600 text-sm mb-4">{description}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);

// Empty state
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  title, 
  description, 
  action, 
  icon 
}: EmptyStateProps) => (
  <Card className="max-w-md mx-auto">
    <CardContent className="p-8 text-center">
      <div className="text-6xl mb-4">
        {icon || "📭"}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </CardContent>
  </Card>
);

// Inline loading states
export const InlineLoading = ({ 
  text = "Loading...",
  size = 'sm' 
}: { 
  text?: string;
  size?: 'sm' | 'md';
}) => (
  <div className="flex items-center gap-2 text-gray-600">
    <LoadingSpinner size={size} />
    <span className="text-sm">{text}</span>
  </div>
);

// Button loading state
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  [key: string]: any;
}

export const LoadingButton = ({ 
  isLoading, 
  children, 
  loadingText,
  ...props 
}: LoadingButtonProps) => (
  <Button disabled={isLoading} {...props}>
    {isLoading ? (
      <>
        <LoadingSpinner size="sm" className="mr-2" />
        {loadingText || children}
      </>
    ) : (
      children
    )}
  </Button>
);

// Progressive loading for data tables
export const ProgressiveTableLoading = ({ 
  currentCount,
  totalCount,
  itemName = "items"
}: {
  currentCount: number;
  totalCount: number;
  itemName?: string;
}) => (
  <div className="flex items-center justify-center p-4 text-sm text-gray-600">
    <LoadingSpinner size="sm" className="mr-2" />
    <span>
      Loaded {currentCount} of {totalCount} {itemName}...
    </span>
  </div>
);

// Smart loading wrapper
interface SmartLoadingProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
}

export const SmartLoading = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
}: SmartLoadingProps) => {
  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  if (isLoading) {
    return <InlineLoading text="Loading data..." />;
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    return (
      <ErrorState
        title="Failed to load data"
        description={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <EmptyState
        title="No data available"
        description="There's nothing to show here yet."
      />
    );
  }

  return <>{children}</>;
};