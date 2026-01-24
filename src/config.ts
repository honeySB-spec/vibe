import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'ConsensusCode',
    projectId: '50404c342642d41dade4e9c28756867c', // Get one at https://cloud.walletconnect.com (it's free)
    chains: [baseSepolia],
    ssr: true, // If your dApp uses server-side rendering (Next.js)
});