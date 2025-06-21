
import { sepolia, avalancheFuji, polygonMumbai, arbitrumSepolia } from 'wagmi/chains'

export type SupportedChainKey = 'sepolia' | 'avalancheFuji' | 'polygonMumbai' | 'arbitrumSepolia'

export const supportedChains = {
  sepolia: {
    ...sepolia,
    ccipChainSelector: '16015286601757825753',
  },
  avalancheFuji: {
    ...avalancheFuji,
    ccipChainSelector: '14767482510784806043',
  },
  polygonMumbai: {
    ...polygonMumbai,
    ccipChainSelector: '12532609583862916517',
  },
  arbitrumSepolia: {
    ...arbitrumSepolia,
    ccipChainSelector: '3478487238524512106',
  },
} as const

export const getDestinationChains = (currentChainId: number) => {
  return Object.values(supportedChains).filter(chain => chain.id !== currentChainId)
}

export const estimateCCIPFee = async (sourceChain: SupportedChainKey, destinationChain: SupportedChainKey) => {
  // This is a simplified fee estimation
  // In production, this would call the actual CCIP fee estimation
  return BigInt('10000000000000000') // 0.01 ETH
}
