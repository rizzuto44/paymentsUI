'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { config } from '@/lib/wagmi';
import { useState } from 'react';
import { baseSepolia, arbitrumSepolia } from 'wagmi/chains';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        walletConnectPreferredChains: ['eip155:84532', 'eip155:421614'], // Base Sepolia and Arbitrum Sepolia
        initialAuthenticationMode: 'connect-only',
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: [baseSepolia.blockExplorers.default.url],
              chainId: baseSepolia.id,
              name: baseSepolia.name,
              iconUrls: ['https://avatars.githubusercontent.com/u/108554348?s=280&v=4'],
              nativeCurrency: baseSepolia.nativeCurrency,
              networkId: baseSepolia.id,
              rpcUrls: [process.env.NEXT_PUBLIC_BASE_RPC_URL!],
              vanityName: baseSepolia.name,
            },
            {
              blockExplorerUrls: [arbitrumSepolia.blockExplorers.default.url],
              chainId: arbitrumSepolia.id,
              name: arbitrumSepolia.name,
              iconUrls: ['https://arbitrum.io/wp-content/uploads/2021/01/cropped-Arbitrum_Symbol_-_Full_color_-_White_background-32x32.png'],
              nativeCurrency: arbitrumSepolia.nativeCurrency,
              networkId: arbitrumSepolia.id,
              rpcUrls: [process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL!],
              vanityName: arbitrumSepolia.name,
            },
          ],
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
} 