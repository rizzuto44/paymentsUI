// Constants Configuration
export const CONSTANTS = {
  CHAINS: {
    BASE_SEPOLIA: {
      id: 84532,
      name: 'Base Sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL!,
      explorer: 'https://sepolia.basescan.org',
      lzEndpointId: 40245, // CORRECTED: LayerZero V2 EID for Base Sepolia
    },
    ARBITRUM_SEPOLIA: {
      id: 421614,
      name: 'Arbitrum Sepolia', 
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL!,
      explorer: 'https://sepolia.arbiscan.io',
      lzEndpointId: 40231, // CORRECTED: LayerZero V2 EID for Arbitrum Sepolia
    },
  },
  TOKEN: {
    DECIMALS: 6, // USDT has 6 decimals
    SYMBOL: 'USDT',
  },
  UI: {
    DEBOUNCE_MS: 300,
    MAX_HISTORY_ROWS: 10,
    COOKIE_KEY: 'oft_history',
  },
} as const;

// Network and Asset Types
export type ChainKey = 'base' | 'arbitrum';
export type AssetKey = 'USDT';

// Username Resolution Types
export interface UsernameRecord {
  username: string;
  ownerAddress: `0x${string}`;
  preferredDstEid: number;
  chainKey: ChainKey;
}

// Contract addresses from LayerZero CLI deployments
export const CONTRACTS: Record<ChainKey, { USDT_OFT: `0x${string}` }> = {
  base: {
    USDT_OFT: '0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008', // MyOFT on Base Sepolia
  },
  arbitrum: {
    USDT_OFT: '0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a', // MyOFT on Arbitrum Sepolia
  },
};

// Network configuration mapping
export const NETWORK_CONFIG = {
  base: CONSTANTS.CHAINS.BASE_SEPOLIA,
  arbitrum: CONSTANTS.CHAINS.ARBITRUM_SEPOLIA,
} as const; 