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
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );

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

  const onSubmit = async (data: CreateLoanForm) => {
    setIsLoading(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LOAN_MANAGER_ABI,
        functionName: "depositNFTCollateral",
        args: [BigInt(data.tokenId), BigInt(data.amount)],
      });

      toast({
        title: "Success",
        description: "Loan created successfully!",
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
              onValueChange={(value) => form.setValue("tokenId", value)}
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
              {...form.register("amount")}
              className="bg-dark-800 border-white/20 text-white"
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {riskAssessment && (
            <div className="space-y-2">
              <Label>Risk Assessment</Label>
              <div className="text-sm text-gray-400">
                Risk Score: {riskAssessment.riskScore}
                <br />
                Suggested Rate: {riskAssessment.suggestedInterestRate}%
              </div>
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
