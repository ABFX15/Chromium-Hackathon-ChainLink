import LoanManagerJSON from '../abis/LoanManager.json'
import PropertyNFTJSON from '../abis/PropertyNFT.json'
import CollateralVaultJSON from '../abis/CollateralVault.json'
import MockUSDCJSON from '../abis/MockUSDC.json'
import { type Abi } from 'viem'

export const CONTRACT_ADDRESSES = {
    LOAN_MANAGER: '0xa06E2EC33adD56Eab0629Ba6A0C9A709822941ac',
    PROPERTY_NFT: '0x23d7Ae1B750e174a915A95606E64927324df3548',
    COLLATERAL_VAULT: '0xe2f72471c2D1Acc74F410a1AD481F87d77A512A7',
    USDC: '0x4d06f916930877A66530913AF69c3890c431D892',
} as const

export const LOAN_MANAGER_ABI = LoanManagerJSON.abi as Abi
export const PROPERTY_NFT_ABI = PropertyNFTJSON.abi as Abi
export const COLLATERAL_VAULT_ABI = CollateralVaultJSON.abi as Abi
export const MOCK_USDC_ABI = MockUSDCJSON.abi as Abi 