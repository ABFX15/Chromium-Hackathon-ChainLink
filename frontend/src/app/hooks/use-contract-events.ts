import { useEffect, useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { CONTRACT_ADDRESSES, LOAN_MANAGER_ABI, COLLATERAL_VAULT_ABI } from '@/lib/contracts'
import { Transaction } from '@/types/contracts'

export function useContractEvents() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Watch for LoanCreated events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LOAN_MANAGER,
    abi: LOAN_MANAGER_ABI,
    eventName: 'LoanCreated',
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log as any
        const transaction: Transaction = {
          hash: log.transactionHash,
          type: 'loan_created',
          property: `Property #${args.tokenId}`,
          amount: Number(args.netDebt) / 1e6, // Assuming USDC has 6 decimals
          status: 'confirmed',
          timestamp: Date.now(),
        }
        setTransactions(prev => [transaction, ...prev.slice(0, 9)]) // Keep last 10 transactions
      })
    },
  })

  // Watch for LoanRepaid events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LOAN_MANAGER,
    abi: LOAN_MANAGER_ABI,
    eventName: 'LoanRepaid',
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log as any
        const transaction: Transaction = {
          hash: log.transactionHash,
          type: 'loan_repaid',
          property: `Loan #${args.loanId}`,
          amount: Number(args.totalRepaid) / 1e6,
          status: 'confirmed',
          timestamp: Date.now(),
        }
        setTransactions(prev => [transaction, ...prev.slice(0, 9)])
      })
    },
  })

  // Watch for PropertyValueUpdated events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.COLLATERAL_VAULT,
    abi: COLLATERAL_VAULT_ABI,
    eventName: 'PropertyValueUpdated',
    onLogs(logs) {
      logs.forEach((log) => {
        const { args } = log as any
        const transaction: Transaction = {
          hash: log.transactionHash,
          type: 'value_updated',
          property: `Property #${args.tokenId}`,
          amount: Number(args.newValue) / 1e6,
          status: 'confirmed',
          timestamp: Date.now(),
        }
        setTransactions(prev => [transaction, ...prev.slice(0, 9)])
      })
    },
  })

  return { transactions }
}
