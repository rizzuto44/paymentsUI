# Shared Configuration

This folder contains shared constants and configurations used by both the smart contracts and frontend.

## Files

### `contracts.js`
Contains all the essential contract information for the frontend:

- **Network configurations** (Arbitrum Sepolia, Base Sepolia)
- **Contract addresses** and LayerZero EIDs
- **Simplified ABI** with only needed functions
- **Helper functions** for formatting and network switching
- **MetaMask integration** configurations

## Usage in Frontend

```javascript
import { 
  NETWORKS, 
  CONTRACTS, 
  USDT_OFT_ABI,
  getContractForChain,
  formatTokenAmount 
} from '../shared/contracts.js';

// Get contract for current chain
const contract = getContractForChain(chainId);

// Format token amounts for display
const formattedBalance = formatTokenAmount(balance);
```

## Key Features

- ✅ **Working contract addresses** from successful deployments
- ✅ **Tested ABI functions** (`quoteSend`, `send`, `balanceOf`, etc.)
- ✅ **Network switching** helpers for MetaMask
- ✅ **Token formatting** utilities (6-decimal USDT format)
- ✅ **Cross-chain routing** logic (Arbitrum ↔ Base) 