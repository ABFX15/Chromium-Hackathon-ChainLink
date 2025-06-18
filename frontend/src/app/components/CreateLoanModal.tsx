'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWriteContract } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI, ORIGINATION_FEE_BPS } from '@/lib/contracts'
import { PropertyNFT } from '@/types/contracts'
import { formatCurrency } from '@/lib/utils'
import { AIRiskAssessment } from './AIRiskAssessment'
import { RiskAssessment } from '@/lib/bedrock-ai'

const createLoanSchema = z.object({
  tokenId: z.string().min(1, 'Please select a property'),
  amount: z.string().min(1, 'Please enter loan amount'),
})

type CreateLoanForm = z.infer<typeof createLoanSchema>

interface CreateLoanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableNFTs: PropertyNFT[]
}

export function CreateLoanModal({ open, onOpenChange, availableNFTs }: CreateLoanModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [aiAssessment, setAiAssessment] = useState<RiskAssessment | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<PropertyNFT | null>(null)
  const { writeContract } = useWriteContract()
  const { toast } = useToast()

  const form = useForm<CreateLoanForm>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      tokenId: '',
      amount: '',
    },
  })

  const watchedValues = form.watch()
  const selectedNFT = availableNFTs.find(nft => nft.tokenId.toString() === watchedValues.tokenId)
  const loanAmount = parseFloat(watchedValues.amount) || 0
  const originationFee = (loanAmount * ORIGINATION_FEE_BPS) / 10000
  const netAmount = loanAmount - originationFee
  const ltv = selectedNFT ? (loanAmount / selectedNFT.propertyValue) * 100 : 0

  const onSubmit = async (data: CreateLoanForm) => {
    if (!selectedNFT) return

    setIsLoading(true)
    try {
      // Convert amount to wei (assuming 6 decimals for USDC)
      const amountInWei = BigInt(Math.floor(loanAmount * 1e6))
      
      await writeContract({
        address: CONTRACT_ADDRESSES.LOAN_MANAGER,
        abi: LOAN_MANAGER_ABI,
        functionName: 'createLoan',
        args: [BigInt(selectedNFT.tokenId), amountInWei],
      })

      toast({
        title: "Loan Created Successfully",
        description: `Your loan for ${formatCurrency(netAmount)} has been created`,
        variant: "success",
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Loan Creation Failed",
        description: "There was an error creating your loan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Create New Loan</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">Select Property</Label>
            <Select
              value={form.watch('tokenId')}
              onValueChange={(value) => form.setValue('tokenId', value)}
            >
              <SelectTrigger className="w-full bg-dark-800 border-white/20 text-white">
                <SelectValue placeholder="Choose a property..." />
              </SelectTrigger>
              <SelectContent>
                {availableNFTs.map((nft) => (
                  <SelectItem key={nft.tokenId} value={nft.tokenId.toString()}>
                    {nft.name} - {formatCurrency(nft.propertyValue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.tokenId && (
              <p className="text-red-400 text-xs">{form.formState.errors.tokenId.message}</p>
            )}
          </div>

          {/* Loan Amount */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">Loan Amount (USDC)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 bg-dark-800 border-white/20 text-white"
                {...form.register('amount')}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">$</div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-dark-400">
                Max available: <span className="text-white">{selectedNFT ? formatCurrency(selectedNFT.maxLoan) : '$0'}</span>
              </span>
              <span className="text-dark-400">
                LTV: <span className={ltv > 70 ? 'text-red-400' : 'text-white'}>{ltv.toFixed(1)}%</span>
              </span>
            </div>
            {form.formState.errors.amount && (
              <p className="text-red-400 text-xs">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Loan Terms */}
          <div className="bg-dark-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Interest Rate (APR)</span>
              <span className="text-white font-medium">5.0%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Origination Fee</span>
              <span className="text-white font-medium">{formatCurrency(originationFee)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/10 pt-2">
              <span className="text-dark-400">You'll Receive</span>
              <span className="text-white font-medium">{formatCurrency(netAmount)}</span>
            </div>
          </div>

          {/* Validation Warnings */}
          {ltv > 70 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">LTV exceeds maximum of 70%</p>
            </div>
          )}

          {loanAmount > (selectedNFT?.maxLoan || 0) && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">Amount exceeds maximum loan value</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isLoading || ltv > 70 || loanAmount > (selectedNFT?.maxLoan || 0)}
            >
              {isLoading ? 'Creating...' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
