
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet, avalancheFuji, polygonMumbai, arbitrumSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'RWA Lending Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [sepolia, avalancheFuji, polygonMumbai, arbitrumSepolia, mainnet],
  ssr: true,
})
