
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export default getDefaultConfig({
  appName: 'ORACLEND',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [sepolia],
  ssr: true,
});
