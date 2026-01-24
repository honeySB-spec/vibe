import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'ConsensusCode',
    projectId: 'YOUR_PROJECT_ID',
    chains: [base, baseSepolia],
    ssr: true,
});
