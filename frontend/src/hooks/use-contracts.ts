import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { useCallback, useState, useEffect } from 'react'

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
const PROPERTY_ORACLE_ADDRESS = '0xB778e095E88da7466005B72ceBF6e78341401a30'
const NFT_ADDRESS = '0x23d7Ae1B750e174a915A95606E64927324df3548'

export function useContracts() {
    const { address } = useAccount()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Real-time data fetching using wagmi
    const { data: nftData } = useReadContract({
        address: NFT_ADDRESS,
        abi: [
            {
                name: 'balanceOf',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'owner', type: 'address' }],
                outputs: [{ name: '', type: 'uint256' }],
            },
        ],
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        },
    })

    const { data: loansData } = useReadContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: [
            {
                name: 'getUserLoans',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'user', type: 'address' }],
                outputs: [{ name: '', type: 'uint256[]' }],
            },
        ],
        functionName: 'getUserLoans',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        },
    })

    // Contract write functions
    const { writeContract } = useWriteContract()

    // Contract interaction functions
    const createLoan = async (tokenId: string, amount: string) => {
        setLoading(true)
        try {
            await writeContract({
                address: LOAN_MANAGER_ADDRESS,
                abi: [{
                    name: 'createLoan',
                    type: 'function',
                    inputs: [
                        { name: 'tokenId', type: 'uint256' },
                        { name: 'amount', type: 'uint256' }
                    ]
                }],
                functionName: 'createLoan',
                args: [BigInt(tokenId), BigInt(amount)]
            })
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const addLiquidity = async (amount: string) => {
        setLoading(true)
        try {
            await writeContract({
                address: LOAN_MANAGER_ADDRESS,
                abi: [{
                    name: 'addChainLiquidity',
                    type: 'function',
                    inputs: [{ name: 'amount', type: 'uint256' }]
                }],
                functionName: 'addChainLiquidity',
                args: [BigInt(amount)]
            })
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const withdrawYield = async () => {
        setLoading(true)
        try {
            await writeContract({
                address: LOAN_MANAGER_ADDRESS,
                abi: [{
                    name: 'withdrawProtocolYield',
                    type: 'function',
                    inputs: []
                }],
                functionName: 'withdrawProtocolYield',
                args: []
            })
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // AI Risk Scoring
    const requestAIRiskScore = async (loanId: string) => {
        setLoading(true)
        try {
            await writeContract({
                address: LOAN_MANAGER_ADDRESS,
                abi: [{
                    name: 'requestAIRiskScore',
                    type: 'function',
                    inputs: [{ name: 'loanId', type: 'uint256' }]
                }],
                functionName: 'requestAIRiskScore',
                args: [BigInt(loanId)]
            })
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Property Value Management
    const updatePropertyValue = async (tokenId: string, newValue: string) => {
        setLoading(true)
        try {
            await writeContract({
                address: PROPERTY_ORACLE_ADDRESS,
                abi: [{
                    name: 'updatePropertyValue',
                    type: 'function',
                    inputs: [
                        { name: 'tokenId', type: 'uint256' },
                        { name: 'newValue', type: 'uint256' }
                    ]
                }],
                functionName: 'updatePropertyValue',
                args: [BigInt(tokenId), BigInt(newValue)]
            })
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        // Data from real-time hooks
        userNFTs: nftData ? [{ tokenId: '1', value: 100000 }] as NFT[] : [], // Replace with actual NFT data
        userLoans: loansData || [],
        userUSDCBalance: "1000000", // Replace with actual balance
        protocolYield: "50000", // Replace with actual yield
        aiRiskScores: { 0: "72" },

        // State
        loading,
        error,

        // Functions
        createLoan,
        addLiquidity,
        withdrawYield,
        requestAIRiskScore,
        updatePropertyValue
    }
}