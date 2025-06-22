import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, avalancheFuji, polygonMumbai, arbitrumSepolia } from "wagmi/chains";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local");
}

export const config = getDefaultConfig({
  appName: 'Oraclend',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [sepolia, avalancheFuji, polygonMumbai, arbitrumSepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [polygonMumbai.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
 