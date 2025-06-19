import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useCallback, useState } from 'react'
import { parseUnits, formatUnits } from 'viem'
import { type Abi } from 'viem'

// Import ABIs and assert their type
import LoanManagerJSON from '../abis/LoanManager.json'
import PropertyNFTJSON from '../abis/PropertyNFT.json'
import CollateralVaultJSON from '../abis/CollateralVault.json'
import MockUSDCJSON from '../abis/MockUSDC.json'

const LoanManagerABI = LoanManagerJSON.abi as Abi
const PropertyNFTABI = PropertyNFTJSON.abi as Abi
const CollateralVaultABI = CollateralVaultJSON.abi as Abi
const MockUSDCABI = MockUSDCJSON.abi as Abi

interface NFT {
    tokenId: string
    value: number
}

interface ContractState {
    loading: boolean
    error: Error | null
}

// Contract addresses - replace with your deployed addresses
const LOAN_MANAGER_ADDRESS = '0xa06E2EC33adD56Eab0629Ba6A0C9A709822941ac'
const PROPERTY_NFT_ADDRESS = '0x23d7Ae1B750e174a915A95606E64927324df3548'
const COLLATERAL_VAULT_ADDRESS = '0xe2f72471c2D1Acc74F410a1AD481F87d77A512A7'
const USDC_ADDRESS = '0x4d06f916930877A66530913AF69c3890c431D892'

export interface Loan {
    loanId: number
    tokenId: number
    principalAmount: bigint
    interestRate: number
    startTimestamp: number
    borrower: string
    lender: string
    isActive: boolean
    isFunded: boolean
    assetType: number
}

export function useContracts() {
    const { address } = useAccount()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Read Contract States
    const { data: userNFTs } = useReadContract({
        address: PROPERTY_NFT_ADDRESS,
        abi: PropertyNFTABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    })

    const { data: userLoans } = useReadContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerABI,
        functionName: 'getLoansByBorrower',
        args: address ? [address] : undefined,
    }) as { data: Loan[] }

    const { data: userUSDCBalance } = useReadContract({
        address: USDC_ADDRESS,
        abi: MockUSDCABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    }) as { data: bigint | undefined } as { data: bigint | undefined }

    // Write Contract Functions
    const { writeContract: writeDepositNFTCollateral } = useWriteContract()
    const { writeContract: writeFundLoan } = useWriteContract()
    const { writeContract: writeRepayLoan } = useWriteContract()
    const { writeContract: writeApproveUSDC } = useWriteContract()
    const { writeContract: writeApproveNFT } = useWriteContract()

    // Helper Functions
    const createLoan = async (tokenId: number, amount: number, assetType: number) => {
        setLoading(true)
        try {
            // 1. Approve NFT transfer
            await writeApproveNFT({
                address: PROPERTY_NFT_ADDRESS,
                abi: PropertyNFTABI,
                functionName: 'approve',
                args: [LOAN_MANAGER_ADDRESS, BigInt(tokenId)],
            })

            // 2. Create loan
            await writeDepositNFTCollateral({
                address: LOAN_MANAGER_ADDRESS,
                abi: LoanManagerABI,
                functionName: 'depositNFTCollateral',
                args: [BigInt(tokenId), parseUnits(amount.toString(), 6), BigInt(assetType)],
            })

            return true
        } catch (error) {
            console.error('Error creating loan:', error)
            setError(error as Error)
            return false
        } finally {
            setLoading(false)
        }
    }

    const fundLoanWithCrossChain = async (loanId: number, amount: number) => {
        setLoading(true)
        try {
            // 1. Approve USDC transfer
            await writeApproveUSDC({
                address: USDC_ADDRESS,
                abi: MockUSDCABI,
                functionName: 'approve',
                args: [LOAN_MANAGER_ADDRESS, parseUnits(amount.toString(), 6)],
            })

            // 2. Fund loan
            await writeFundLoan({
                address: LOAN_MANAGER_ADDRESS,
                abi: LoanManagerABI,
                functionName: 'fundLoanCrossChain',
                args: [BigInt(loanId)],
            })

            return true
        } catch (error) {
            console.error('Error funding loan:', error)
            setError(error as Error)
            return false
        } finally {
            setLoading(false)
        }
    }

    const repayLoanWithInterest = async (loanId: number, amount: number) => {
        setLoading(true)
        try {
            // 1. Approve USDC transfer
            await writeApproveUSDC({
                address: USDC_ADDRESS,
                abi: MockUSDCABI,
                functionName: 'approve',
                args: [LOAN_MANAGER_ADDRESS, parseUnits(amount.toString(), 6)],
            })

            // 2. Repay loan
            await writeRepayLoan({
                address: LOAN_MANAGER_ADDRESS,
                abi: LoanManagerABI,
                functionName: 'repayLoan',
                args: [BigInt(loanId)],
            })

            return true
        } catch (error) {
            console.error('Error repaying loan:', error)
            setError(error as Error)
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        // Contract States
        userNFTs: Number(userNFTs || 0),
        userLoans: userLoans || [],
        userUSDCBalance: typeof userUSDCBalance === 'bigint' ? formatUnits(userUSDCBalance, 6) : '0',

        // State
        loading,
        error,

        // Contract Functions
        createLoan,
        fundLoanWithCrossChain,
        repayLoanWithInterest,
    }
}