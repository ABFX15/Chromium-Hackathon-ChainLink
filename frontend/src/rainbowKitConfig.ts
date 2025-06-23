import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, base, mainnet, optimism, anvil, zksync, sepolia, avalancheFuji, polygonMumbai } from "wagmi/chains"

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("WalletConnect project ID is missing");
}

export default getDefaultConfig({
  appName: "ORACLEND",
  projectId: walletConnectProjectId,
  chains: [mainnet, optimism, arbitrum, base, zksync, sepolia, anvil],
  ssr: false,
})