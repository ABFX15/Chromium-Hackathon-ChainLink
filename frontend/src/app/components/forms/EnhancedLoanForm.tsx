"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Info,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';

import { PropertyNFTData } from '../../types/enhanced-contracts';
import { createLoanSchemaWithProperty } from '../../lib/validation';
import { useEnhancedContracts } from '../../hooks/useEnhancedContracts';
import { LoadingButton } from '../loading/LoadingStates';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface EnhancedLoanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProperties: PropertyNFTData[];
  onSuccess?: (loanId: bigint) => void;
}

export function EnhancedLoanForm({
  open,
  onOpenChange,
  availableProperties,
  onSuccess,
}: EnhancedLoanFormProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyNFTData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  
  const { createLoan, approveNFT } = useEnhancedContracts();

  // Dynamic schema based on selected property
  const formSchema = useMemo(() => {
    if (!selectedProperty) {
      return z.object({
        tokenId: z.string().min(1, 'Please select a property'),
        amount: z.string().min(1, 'Please enter loan amount'),
        interestRate: z.number().optional(),
        duration: z.number().optional(),
      });
    }

    const propertyValueInEth = Number(selectedProperty.propertyValue) / 1e18;
    return createLoanSchemaWithProperty(propertyValueInEth);
  }, [selectedProperty]);

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenId: '',
      amount: '',
      interestRate: 5.0,
      duration: 12,
    },
    mode: 'onChange', // Real-time validation
  });

  const watchedAmount = form.watch('amount');
  const watchedTokenId = form.watch('tokenId');

  // Update selected property when token ID changes
  useEffect(() => {
    if (watchedTokenId) {
      const property = availableProperties.find(p => p.tokenId.toString() === watchedTokenId);
      setSelectedProperty(property || null);
    }
  }, [watchedTokenId, availableProperties]);

  // Calculate loan metrics in real-time
  const loanMetrics = useMemo(() => {
    if (!selectedProperty || !watchedAmount) {
      return null;
    }

    const loanAmountNum = parseFloat(watchedAmount);
    const propertyValueInEth = Number(selectedProperty.propertyValue) / 1e18;
    const interestRate = form.getValues('interestRate') || 5.0;
    const duration = form.getValues('duration') || 12;

    const ltv = (loanAmountNum / propertyValueInEth) * 100;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmountNum * 
      (monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
      (Math.pow(1 + monthlyRate, duration) - 1);
    const totalPayment = monthlyPayment * duration;
    const totalInterest = totalPayment - loanAmountNum;

    // Risk assessment
    const riskLevel = ltv < 50 ? 'low' : ltv < 70 ? 'medium' : 'high';
    const riskColor = riskLevel === 'low' ? 'text-green-600' : 
                     riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600';

    return {
      ltv,
      monthlyPayment,
      totalPayment,
      totalInterest,
      riskLevel,
      riskColor,
      isValid: ltv <= 80, // Max 80% LTV
    };
  }, [selectedProperty, watchedAmount, form]);

  // Real-time risk assessment
  useEffect(() => {
    if (!selectedProperty || !watchedAmount) return;

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch('/api/assess-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyValue: Number(selectedProperty.propertyValue) / 1e18,
            propertyType: selectedProperty.metadata?.attributes?.find(
              a => a.trait_type === 'Property Type'
            )?.value || 'residential',
            location: selectedProperty.location,
            yearBuilt: selectedProperty.metadata?.attributes?.find(
              a => a.trait_type === 'Year Built'
            )?.value || 2020,
            squareFootage: selectedProperty.metadata?.attributes?.find(
              a => a.trait_type === 'Square Footage'
            )?.value || 2000,
            loanAmount: parseFloat(watchedAmount),
          }),
        });

        if (response.ok) {
          const assessment = await response.json();
          setRiskAssessment(assessment);
        }
      } catch (error) {
        console.warn('Risk assessment failed:', error);
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [selectedProperty, watchedAmount]);

  const onSubmit = async (data: FormData) => {
    if (!selectedProperty || !loanMetrics?.isValid) return;

    setIsCreating(true);

    try {
      // First approve the NFT
      const approvalResult = await approveNFT(
        selectedProperty.tokenId,
        '0xYourContractAddress' // Would use actual contract address
      );

      if (!approvalResult.isSuccess) {
        throw new Error('NFT approval failed');
      }

      // Create the loan
      const loanResult = await createLoan(
        selectedProperty.tokenId,
        BigInt(parseFloat(data.amount) * 1e6), // Convert to scaled amount
        BigInt(1), // Asset type
        BigInt((data.interestRate || 5.0) * 100) // Convert to basis points
      );

      if (loanResult.isSuccess && loanResult.data) {
        onSuccess?.(loanResult.data.loanId);
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      console.error('Loan creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Create Loan Request
          </DialogTitle>
          <DialogDescription>
            Use your property as collateral to request a loan. All terms are calculated in real-time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              {/* Property Selection */}
              <div>
                <Label htmlFor="tokenId">Select Property</Label>
                <Controller
                  name="tokenId"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a property..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProperties
                          .filter(p => !p.isCollateral)
                          .map((property) => (
                            <SelectItem 
                              key={property.id} 
                              value={property.tokenId.toString()}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{property.name}</span>
                                <span className="text-sm text-gray-500">
                                  ${formatNumber(Number(property.propertyValue) / 1e18)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.tokenId && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.tokenId.message}
                  </p>
                )}
              </div>

              {/* Loan Amount */}
              <div>
                <Label htmlFor="amount">
                  Loan Amount (USD)
                  {selectedProperty && (
                    <span className="text-sm text-gray-500 ml-2">
                      Max: ${formatNumber(Number(selectedProperty.maxLoan) / 1e18)}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    {...form.register('amount')}
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    className="pl-10"
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Interest Rate Slider */}
              <div>
                <Label>
                  Interest Rate: {form.watch('interestRate') || 5.0}%
                  {riskAssessment && (
                    <span className="text-sm text-blue-600 ml-2">
                      (AI Suggested: {riskAssessment.suggestedInterestRate.toFixed(1)}%)
                    </span>
                  )}
                </Label>
                <Controller
                  name="interestRate"
                  control={form.control}
                  render={({ field }) => (
                    <Slider
                      value={[field.value || 5.0]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={20}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                  )}
                />
              </div>

              {/* Duration Slider */}
              <div>
                <Label>
                  Loan Duration: {form.watch('duration') || 12} months
                </Label>
                <Controller
                  name="duration"
                  control={form.control}
                  render={({ field }) => (
                    <Slider
                      value={[field.value || 12]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={360}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  )}
                />
              </div>
            </div>

            {/* Right Column - Real-time Calculations */}
            <div className="space-y-4">
              {/* Selected Property Info */}
              {selectedProperty && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{selectedProperty.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <p className="font-semibold">
                          ${formatNumber(Number(selectedProperty.propertyValue) / 1e18)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Risk Score:</span>
                        <p className="font-semibold">{selectedProperty.riskScore}/100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loan Calculations */}
              {loanMetrics && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Loan Summary
                      <Badge 
                        variant={loanMetrics.riskLevel === 'low' ? 'default' : 
                                loanMetrics.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                      >
                        {loanMetrics.riskLevel} risk
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">LTV Ratio:</span>
                        <p className={`font-semibold ${loanMetrics.riskColor}`}>
                          {loanMetrics.ltv.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Monthly Payment:</span>
                        <p className="font-semibold">
                          ${formatNumber(loanMetrics.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Interest:</span>
                        <p className="font-semibold">
                          ${formatNumber(loanMetrics.totalInterest)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Payment:</span>
                        <p className="font-semibold">
                          ${formatNumber(loanMetrics.totalPayment)}
                        </p>
                      </div>
                    </div>

                    {!loanMetrics.isValid && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">
                          LTV ratio exceeds maximum of 80%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI Risk Assessment */}
              {riskAssessment && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      AI Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-semibold">{riskAssessment.riskScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-semibold">{riskAssessment.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suggested Rate:</span>
                        <span className="font-semibold">
                          {riskAssessment.suggestedInterestRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isCreating}
              loadingText="Creating Loan..."
              disabled={!loanMetrics?.isValid || !form.formState.isValid}
            >
              Create Loan Request
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}