'use client';

import * as React from 'react';
import {
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/src/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { ThemeProvider as NextThemesProvider } from "next-themes";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <RainbowKitProvider theme={darkTheme()}>
                        {children}
                    </RainbowKitProvider>
                </NextThemesProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
