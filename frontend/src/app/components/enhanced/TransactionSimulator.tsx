"use client";

import React, { useState } from 'react';
import { simulateContract } from '@wagmi/core';
import { config } from '@/app/lib/wagmi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface TransactionSimulatorProps {
  contractParams: any;
  onSimulationResult: (success: boolean, error?: string) => void;
  children: React.ReactNode;
}

export const TransactionSimulator = ({
  contractParams,
  onSimulationResult,
  children,
}: TransactionSimulatorProps) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    error?: string;
    gasEstimate?: bigint;
  } | null>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    
    try {
      const result = await simulateContract(config, contractParams);
      
      setSimulationResult({
        success: true,
        gasEstimate: result.request.gas,
      });
      
      onSimulationResult(true);
    } catch (error: any) {
      const errorMessage = error.shortMessage || error.message || 'Simulation failed';
      
      setSimulationResult({
        success: false,
        error: errorMessage,
      });
      
      onSimulationResult(false, errorMessage);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Transaction Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runSimulation}
            disabled={isSimulating}
            variant="outline"
            size="sm"
          >
            {isSimulating ? 'Simulating...' : 'Test Transaction'}
          </Button>
        </div>

        {simulationResult && (
          <Alert className={simulationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {simulationResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription>
                {simulationResult.success ? (
                  <div>
                    <p className="font-medium text-green-800">Transaction will succeed</p>
                    {simulationResult.gasEstimate && (
                      <p className="text-sm text-green-700">
                        Estimated gas: {simulationResult.gasEstimate.toString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-red-800">Transaction will fail</p>
                    <p className="text-sm text-red-700">{simulationResult.error}</p>
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {simulationResult?.success && children}
      </CardContent>
    </Card>
  );
};