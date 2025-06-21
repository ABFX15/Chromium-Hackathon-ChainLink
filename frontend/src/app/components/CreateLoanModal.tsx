"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useWriteContract } from "wagmi";
import { useToast } from "../hooks/use-toast";
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI } from "../lib/contracts";
import { Property } from "../../types/property";
import { formatCurrency } from "../lib/utils";
import { AIRiskAssessment } from "./AIRiskAssessment";
import { RiskAssessment } from "../lib/bedrock-ai";
import { usePropertyNFTs } from "../hooks/use-property-nfts";

// Constants
const ORIGINATION_FEE_BPS = 100; // 1% fee

const createLoanSchema = z.object({
  tokenId: z.string().min(1, "Please select a property"),
  amount: z.string().min(1, "Please enter loan amount"),
});

type CreateLoanForm = z.infer<typeof createLoanSchema>;

interface CreateLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableNFTs: Property[];
}

export function CreateLoanModal({
  open,
  onOpenChange,
  availableNFTs,
}: CreateLoanModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Map Property to PropertyNFT for internal use
  const mappedNFTs = availableNFTs.map((nft) => ({
    tokenId: BigInt(nft.tokenId),
    propertyValue: nft.value,
    isCollateral: nft.status === "collateral",
    maxLoan: nft.value * 0.7, // 70% LTV
    tokenURI: nft.imageUrl,
  }));

  const form = useForm<CreateLoanForm>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      tokenId: "",
      amount: "",
    },
  });

  const { writeContract } = useWriteContract();

  // Auto-trigger AI risk assessment when property is selected
  const handlePropertyChange = async (tokenId: string) => {
    form.setValue("tokenId", tokenId);
    const property = availableNFTs.find(nft => nft.tokenId.toString() === tokenId);
    if (property) {
      setSelectedProperty(property);
      await runRiskAssessment(property, parseFloat(form.watch("amount")) || 0);
    }
  };

  // Auto-trigger AI risk assessment when loan amount changes
  const handleAmountChange = async (amount: string) => {
    form.setValue("amount", amount);
    if (selectedProperty && parseFloat(amount) > 0) {
      await runRiskAssessment(selectedProperty, parseFloat(amount));
    }
  };

  // Run AI risk assessment
  const runRiskAssessment = async (property: Property, loanAmount: number) => {
    if (!property || loanAmount <= 0) return;

    setIsAssessing(true);
    try {
      const response = await fetch('/api/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyValue: property.value,
          propertyType: property.type || 'Residential',
          location: property.location || 'Unknown',
          yearBuilt: 2020, // Default if not available
          squareFootage: 2000, // Default if not available
          loanAmount: loanAmount,
          borrowerCreditScore: 720, // Could be from user profile
          debtToIncomeRatio: 30, // Could be from user profile
        }),
      });

      if (response.ok) {
        const assessment = await response.json();
        setRiskAssessment(assessment);

        toast({
          title: "AI Assessment Complete",
          description: `Risk Score: ${assessment.riskScore}, Suggested Rate: ${assessment.suggestedInterestRate}%`,
        });
      }
    } catch (error) {
      console.error('Risk assessment failed:', error);
      toast({
        title: "AI Assessment Failed",
        description: "Using default risk parameters",
        variant: "destructive",
      });
    } finally {
      setIsAssessing(false);
    }
  };

  const onSubmit = async (data: CreateLoanForm) => {
    setIsLoading(true);
    try {
      // Create loan with AI-adjusted interest rate if available
      let adjustedAmount = BigInt(data.amount);

      // If we have risk assessment, we could adjust terms here
      // For now, we'll log the assessment for the smart contract to use
      if (riskAssessment) {
        console.log("Creating loan with AI assessment:", {
          riskScore: riskAssessment.riskScore,
          suggestedRate: riskAssessment.suggestedInterestRate,
          maxLTV: riskAssessment.maxLTV
        });
      }

      await writeContract({
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LOAN_MANAGER_ABI,
        functionName: "depositNFTCollateral",
        args: [BigInt(data.tokenId), adjustedAmount],
      });

      toast({
        title: "Success",
        description: `Loan created successfully! ${riskAssessment ? `AI-assessed rate: ${riskAssessment.suggestedInterestRate}%` : ''}`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating loan:", error);
      toast({
        title: "Error",
        description: "Failed to create loan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>
            Select a property NFT and enter the loan amount.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenId">Property</Label>
            <Select
              value={form.watch("tokenId")}
              onValueChange={handlePropertyChange}
            >
              <SelectTrigger className="w-full bg-dark-800 border-white/20 text-white">
                <SelectValue placeholder="Choose a property..." />
              </SelectTrigger>
              <SelectContent>
                {mappedNFTs.map((nft) => (
                  <SelectItem
                    key={nft.tokenId.toString()}
                    value={nft.tokenId.toString()}
                  >
                    {`Property #${nft.tokenId.toString()} - Value: ${formatCurrency(
                      nft.propertyValue
                    )}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.tokenId && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.tokenId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in USDC"
              value={form.watch("amount")}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="bg-dark-800 border-white/20 text-white"
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* AI Risk Assessment Display */}
          {(isAssessing || riskAssessment) && (
            <div className="space-y-3 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <Label className="text-purple-400">🤖 AI Risk Assessment</Label>

              {isAssessing ? (
                <div className="flex items-center gap-2 text-purple-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  <span className="text-sm">AWS Bedrock analyzing loan risk...</span>
                </div>
              ) : riskAssessment && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Risk Score:</span>
                      <span className={`ml-2 font-medium ${
                        riskAssessment.riskScore < 40 ? 'text-green-400' : 
                        riskAssessment.riskScore < 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {riskAssessment.riskScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className={`ml-2 font-medium capitalize ${
                        riskAssessment.riskCategory === 'low' ? 'text-green-400' : 
                        riskAssessment.riskCategory === 'medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {riskAssessment.riskCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">AI Suggested Rate:</span>
                      <span className="text-purple-400 ml-2 font-medium">
                        {riskAssessment.suggestedInterestRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Max LTV:</span>
                      <span className="text-purple-400 ml-2 font-medium">
                        {riskAssessment.maxLTV}%
                      </span>
                    </div>
                  </div>

                  {riskAssessment.recommendations && riskAssessment.recommendations.length > 0 && (
                    <div className="text-xs text-purple-300">
                      <strong>AI Recommendations:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {riskAssessment.recommendations.slice(0, 2).map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Loan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}