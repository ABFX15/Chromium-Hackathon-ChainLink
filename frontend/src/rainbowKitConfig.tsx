"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, sepolia } from "wagmi/chains";
import { http } from "wagmi";

export default getDefaultConfig({
  appName: "RWA Vault",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [mainnet, optimism, arbitrum, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});
