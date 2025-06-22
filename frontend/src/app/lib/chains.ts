
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
