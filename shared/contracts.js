// Shared contract configuration for frontend
// Generated from successful LayerZero CLI deployment

export const NETWORKS = {
  ARBITRUM_SEPOLIA: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  },
  BASE_SEPOLIA: {
    name: "Base Sepolia", 
    chainId: 84532,
    rpc: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH", 
      decimals: 18
    }
  }
};

export const CONTRACTS = {
  [NETWORKS.ARBITRUM_SEPOLIA.chainId]: {
    address: "0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a",
    eid: 40231, // LayerZero Endpoint ID
    network: NETWORKS.ARBITRUM_SEPOLIA
  },
  [NETWORKS.BASE_SEPOLIA.chainId]: {
    address: "0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008", 
    eid: 40245, // LayerZero Endpoint ID
    network: NETWORKS.BASE_SEPOLIA
  }
};

// Simplified ABI for frontend use - only the functions we need
export const USDT_OFT_ABI = [
  // View functions
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  
  // Cross-chain functions
  "function quoteSend((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), bool payInLzToken) view returns ((uint256 nativeFee, uint256 lzTokenFee))",
  "function send((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), (uint256 nativeFee, uint256 lzTokenFee), address refundAddress) payable returns ((bytes32 guid, uint64 nonce))",
  
  // Utility functions
  "function mintForSelf(uint256 amount) external",
  "function mint(address to, uint256 amount) external",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount)"
];

// Helper functions for the frontend
export const getContractForChain = (chainId) => {
  return CONTRACTS[chainId];
};

export const getDestinationChain = (sourceChainId) => {
  if (sourceChainId === NETWORKS.ARBITRUM_SEPOLIA.chainId) {
    return NETWORKS.BASE_SEPOLIA.chainId;
  } else if (sourceChainId === NETWORKS.BASE_SEPOLIA.chainId) {
    return NETWORKS.ARBITRUM_SEPOLIA.chainId;
  }
  throw new Error(`Unsupported source chain: ${sourceChainId}`);
};

export const formatTokenAmount = (amount, decimals = 6) => {
  // USDT uses 6 decimals
  return (Number(amount) / Math.pow(10, decimals)).toLocaleString();
};

export const parseTokenAmount = (amount, decimals = 6) => {
  // Convert human readable amount to contract format
  return Math.floor(Number(amount) * Math.pow(10, decimals)).toString();
};

// Network switching helpers for MetaMask
export const METAMASK_NETWORKS = {
  [NETWORKS.ARBITRUM_SEPOLIA.chainId]: {
    chainId: `0x${NETWORKS.ARBITRUM_SEPOLIA.chainId.toString(16)}`,
    chainName: NETWORKS.ARBITRUM_SEPOLIA.name,
    nativeCurrency: NETWORKS.ARBITRUM_SEPOLIA.nativeCurrency,
    rpcUrls: [NETWORKS.ARBITRUM_SEPOLIA.rpc],
    blockExplorerUrls: [NETWORKS.ARBITRUM_SEPOLIA.blockExplorer]
  },
  [NETWORKS.BASE_SEPOLIA.chainId]: {
    chainId: `0x${NETWORKS.BASE_SEPOLIA.chainId.toString(16)}`,
    chainName: NETWORKS.BASE_SEPOLIA.name,
    nativeCurrency: NETWORKS.BASE_SEPOLIA.nativeCurrency,
    rpcUrls: [NETWORKS.BASE_SEPOLIA.rpc],
    blockExplorerUrls: [NETWORKS.BASE_SEPOLIA.blockExplorer]
  }
}; 