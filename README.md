<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="width: 400px" src="https://docs.layerzero.network/img/LayerZero_Logo_Black.svg"/>
  </a>
</p>

<p align="center">
 <a href="https://docs.layerzero.network/" style="color: #a77dff">LayerZero Docs</a>
</p>

# Cross-Chain USDT Transfer System

A complete cross-chain USDT transfer system built with LayerZero V2 OFT (Omnichain Fungible Token) technology, enabling seamless transfers between Arbitrum Sepolia and Base Sepolia testnets.

## 🏗️ Project Structure

```
paymentsUI/
├── contracts/          # LayerZero V2 OFT smart contracts
├── scripts/           # Deployment & testing scripts  
├── deployments/       # Contract deployment artifacts
├── frontend/          # React web application (coming soon)
├── shared/            # Shared constants & configurations
├── layerzero.config.ts # LayerZero network configuration
└── hardhat.config.ts  # Hardhat development environment
```

## 🚀 Deployed Contracts

### Working Networks
- **Arbitrum Sepolia**: `0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a`
- **Base Sepolia**: `0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008`

### Contract Features
- ✅ **Cross-chain transfers** between Arbitrum and Base
- ✅ **6-decimal USDT-like token** with mint functionality
- ✅ **LayerZero V2 OFT** (mint/burn flavor) 
- ✅ **Proper DVN configuration** with LayerZero Labs DVN
- ✅ **Gas-efficient** transfers with enforced options

## 🧪 Testing Scripts

### Balance Checking
```bash
# Check balances on both networks
node scripts/check-all-balances.js
```

### Cross-Chain Transfers
```bash
# Test Arbitrum → Base transfers
node scripts/test-eth-to-arb.js

# Test Base → Arbitrum transfers  
node scripts/test-base-transfers.js
```

## 🛠️ Development Commands

### Smart Contract Development
```bash
# Compile contracts
npx hardhat compile

# Deploy to new networks
npx hardhat lz:deploy

# Wire cross-chain connections
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

### Frontend Development (Coming Soon)
```bash
cd frontend/
npm install
npm run dev
```

## 📋 Network Configuration

### Arbitrum Sepolia
- **Chain ID**: 421614
- **RPC**: https://sepolia-rollup.arbitrum.io/rpc
- **Explorer**: https://sepolia.arbiscan.io
- **LayerZero EID**: 40231

### Base Sepolia  
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **LayerZero EID**: 40245

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Wallet
PRIVATE_KEY=your_private_key_here

# RPC URLs
ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
BASE_RPC_URL=https://sepolia.base.org

# Block Explorer API Keys (for verification)
ARBISCAN_API_KEY=your_arbiscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

## 🎯 Key Learnings

### LayerZero CLI vs Manual Setup
- **✅ LayerZero CLI**: Clean deployment, automatic wiring, proper DVN configuration
- **❌ Manual Setup**: Dependency conflicts, DVN configuration struggles, time-consuming

### Cross-Chain Performance
- **Arbitrum → Base**: Fast settlement (~1-2 minutes)
- **Base → Arbitrum**: Fast settlement (~1-2 minutes)  
- **Ethereum Sepolia**: Slower pathway, excluded from frontend

## 🚧 Next Steps

1. **Web Frontend**: React app for user-friendly transfers
2. **Contract Verification**: Submit to block explorers  
3. **Mainnet Deployment**: Production-ready contracts
4. **Additional Networks**: Expand to more LayerZero-supported chains

## 📚 Resources

- [LayerZero V2 Documentation](https://docs.layerzero.network/v2)
- [OFT Contract Standards](https://docs.layerzero.network/v2/developers/evm/oft/quickstart)
- [Hardhat Documentation](https://hardhat.org/docs)
