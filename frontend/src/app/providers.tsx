'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

// Dynamically import WagmiProvider to prevent SSR issues
const WagmiProvider = dynamic(
  () => import('wagmi').then(mod => ({ default: mod.WagmiProvider })),
  { ssr: false }
);

// Dynamically import Dynamic Labs components to prevent SSR issues
const DynamicContextProvider = dynamic(
  () => import('@dynamic-labs/sdk-react-core').then(mod => ({ default: mod.DynamicContextProvider })),
  { ssr: false }
);

const DynamicWagmiConnector = dynamic(
  () => import('@dynamic-labs/wagmi-connector').then(mod => ({ default: mod.DynamicWagmiConnector })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  const [isClient, setIsClient] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import wagmi config
    import('@/lib/wagmi').then(({ config }) => {
      setWagmiConfig(config);
    });
  }, []);

  // Only render Dynamic Labs on the client side
  if (!isClient || !wagmiConfig) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider
        settings={{
          environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
          walletConnectors: [EthereumWalletConnectors],
          walletConnectPreferredChains: ['eip155:84532', 'eip155:421614'], // Base Sepolia and Arbitrum Sepolia
          initialAuthenticationMode: 'connect-only',
          overrides: {
            evmNetworks: [
              {
                blockExplorerUrls: ['https://sepolia.basescan.org'],
                chainId: 84532,
                name: 'Base Sepolia',
                iconUrls: ['https://avatars.githubusercontent.com/u/108554348?s=280&v=4'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                networkId: 84532,
                rpcUrls: [process.env.NEXT_PUBLIC_BASE_RPC_URL!],
                vanityName: 'Base Sepolia',
              },
              {
                blockExplorerUrls: ['https://sepolia.arbiscan.io'],
                chainId: 421614,
                name: 'Arbitrum Sepolia',
                iconUrls: ['https://arbitrum.io/wp-content/uploads/2021/01/cropped-Arbitrum_Symbol_-_Full_color_-_White_background-32x32.png'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                networkId: 421614,
                rpcUrls: [process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL!],
                vanityName: 'Arbitrum Sepolia',
              },
            ],
          },
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicContextProvider>
    </QueryClientProvider>
  );
} 