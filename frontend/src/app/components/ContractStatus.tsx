"use client";

import React, { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Server,
  Zap
} from 'lucide-react';
import { checkDeploymentStatus } from '../lib/enhanced-contracts';

export const ContractStatus = () => {
  const chainId = useChainId();
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const deploymentStatus = await checkDeploymentStatus(chainId);
      setStatus(deploymentStatus);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check deployment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [chainId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Checking Contract Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying smart contract deployment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Failed to check contract deployment status.
        </AlertDescription>
      </Alert>
    );
  }

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 31337: return 'Hardhat Local';
      case 11155111: return 'Sepolia Testnet';
      case 80001: return 'Polygon Mumbai';
      case 421614: return 'Arbitrum Sepolia';
      default: return `Chain ${chainId}`;
    }
  };

  if (!status.allDeployed) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-yellow-800">
                Contracts not deployed on {getNetworkName(chainId)}
              </p>
              <p className="text-sm text-yellow-700">
                The application is running in demo mode with mock data.
              </p>
            </div>
            
            {status.error && (
              <p className="text-sm text-yellow-700 font-mono bg-yellow-100 p-2 rounded">
                Error: {status.error}
              </p>
            )}
            
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-yellow-800">To deploy contracts:</p>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>1. Start Hardhat local node: <code className="bg-yellow-100 px-1 rounded">npx hardhat node</code></p>
                <p>2. Deploy contracts: <code className="bg-yellow-100 px-1 rounded">npx hardhat run scripts/DeployAllContracts.ts --network localhost</code></p>
                <p>3. Refresh this page</p>
              </div>
            </div>
            
            <Button 
              onClick={checkStatus} 
              size="sm" 
              variant="outline" 
              className="w-fit"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Check Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Contracts Deployed Successfully
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Network:</span>
            <Badge variant="outline" className="border-green-300 text-green-800">
              {getNetworkName(chainId)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-800">Contract Status:</p>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(status.contracts).map(([name, deployed]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-green-700">{name}:</span>
                  <div className="flex items-center gap-1">
                    {deployed ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600" />
                    )}
                    <span className={deployed ? 'text-green-800' : 'text-red-800'}>
                      {deployed ? 'Deployed' : 'Missing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {lastChecked && (
            <div className="flex items-center justify-between text-xs text-green-600">
              <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
              <Button 
                onClick={checkStatus} 
                size="sm" 
                variant="ghost" 
                className="h-auto p-1 text-green-700 hover:text-green-800"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Compact version for headers/status bars
export const ContractStatusIndicator = () => {
  const chainId = useChainId();
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkQuick = async () => {
      try {
        const status = await checkDeploymentStatus(chainId);
        setIsDeployed(status.allDeployed);
      } catch {
        setIsDeployed(false);
      }
    };
    
    checkQuick();
  }, [chainId]);

  if (isDeployed === null) {
    return (
      <Badge variant="outline" className="border-gray-300">
        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
        Checking...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isDeployed ? "default" : "destructive"}
      className={isDeployed ? "bg-green-500" : ""}
    >
      {isDeployed ? (
        <><Zap className="w-3 h-3 mr-1" /> Live</>
      ) : (
        <><AlertTriangle className="w-3 h-3 mr-1" /> Demo Mode</>
      )}
    </Badge>
  );
};