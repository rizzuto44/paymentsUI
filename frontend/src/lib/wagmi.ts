import { http, createConfig } from 'wagmi';
import { baseSepolia, arbitrumSepolia } from 'wagmi/chains';

// Define our networks based on constants
export const config = createConfig({
  chains: [baseSepolia, arbitrumSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
} 