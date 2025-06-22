
import { http, createConfig } from "wagmi";
import { sepolia, avalancheFuji, polygonMumbai, arbitrumSepolia } from "wagmi/chains";
import { supportedChains } from "./chains";

const chains = Object.values(supportedChains).map(chain => ({
  ...chain,
  rpcUrls: {
    default: { http: [chain.rpcUrls.default.http[0]] }
  }
}));

export const config = createConfig({
  chains: [sepolia, avalancheFuji, polygonMumbai, arbitrumSepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [polygonMumbai.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
