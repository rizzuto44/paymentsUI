# LayerZero OFT Gas Issue - Comprehensive Summary

## **🔍 CORE PROBLEM**

We're implementing a LayerZero OFT (Omnichain Fungible Token) send function for cross-chain transfers, but consistently getting **"intrinsic gas too low"** errors when users try to sign transactions in their Rainbow Wallet.

## **🛠 TECH STACK**

- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript, Tailwind CSS v4
- **Web3 Integration**: wagmi v2, viem, Dynamic Labs SDK v4.30.0
- **Smart Contracts**: LayerZero OFT contracts on Base Sepolia & Arbitrum Sepolia testnets
- **Wallet**: Rainbow Wallet (WalletConnect protocol)
- **Backend**: Supabase for username resolution

## **🎯 WHAT WE'RE TRYING TO DO**

Send tokens from one user to another, either:
1. **Same-chain**: Base Sepolia → Base Sepolia user
2. **Cross-chain**: Base Sepolia → Arbitrum Sepolia user (via LayerZero)

## **❌ THE ERROR PATTERN**

Every transaction attempt results in:
```
"intrinsic gas too low: gas 0, minimum needed 23564"
```
Even though we're setting much higher gas limits and fees.

## **🔄 WHAT WE'VE TRIED (CHRONOLOGICALLY)**

### **1. Initial Data Encoding Issues**
- **Problem**: `"Cannot convert string to Uint8Array"` errors
- **Solution**: Fixed `addressToBytes32` conversion using proper hex padding
- **Result**: ✅ Fixed data encoding, but revealed gas issues

### **2. Gas Limit Attempts**
```typescript
// Tried explicit gas limits
gas: BigInt(100000)  // Then 500000
```
- **Result**: ❌ Still "intrinsic gas too low"

### **3. Legacy Gas Pricing**
```typescript
gasPrice: parseUnits('20', 9) // 20 gwei
```
- **Result**: ❌ Still "intrinsic gas too low"

### **4. EIP-1559 Gas Pricing (Current)**
```typescript
maxFeePerGas: parseUnits('50', 9),        // 50 gwei
maxPriorityFeePerGas: parseUnits('2', 9)  // 2 gwei
```
- **Result**: ❌ Still "intrinsic gas too low"

### **5. Automatic Gas Estimation**
- **Tried**: Removing manual gas settings to let wagmi/viem estimate
- **Result**: ❌ Still "intrinsic gas too low"

## **✅ CURRENT TRANSACTION PARAMETERS (WORKING CORRECTLY)**

```javascript
// Console logs show perfect data:
originalRecipientAddress: "0x742d35Cc6634C0532925a3b8D6A2C2B4e6f7A8c9"
recipientAddressBytes32: "0x000000000000000000000000742d35cc6634c0532925a3b8d6a2c2b4e6f7a8c9"
sendParam: {
  dstEid: 10247,                    // Base Sepolia EID
  to: "0x000000000000000000000000742d35cc6634c0532925a3b8d6a2c2b4e6f7a8c9",
  amountLD: "10000000000000000000", // 10 tokens
  minAmountLD: "10000000000000000000",
  extraOptions: "0x",
  composeMsg: "0x",
  oftCmd: "0x"
}
messagingFee: { nativeFee: 1000000000000000, lzTokenFee: 0 }
txValue: "1000000000000000" // 0.001 ETH for same-chain, 0.01 ETH for cross-chain
```

## **🤔 THE MYSTERY**

1. **Data encoding is perfect** ✅
2. **Gas limits are 20x+ higher than needed** ✅
3. **Gas prices are reasonable for testnets** ✅
4. **ETH value covers LayerZero fees** ✅
5. **Contract ABI and function calls are correct** ✅

**But the wallet still reports "gas 0" instead of our configured gas settings.**

## **📝 CURRENT CODE STRUCTURE**

### Current `writeContract` Call:
```typescript
await writeContract({
  ...contractConfig,
  functionName: 'send',
  args: [sendParam, finalMessagingFee, address] as const,
  value: txValue, // Use higher fallback fees
  gas: BigInt(500000), // Higher gas limit for LayerZero
  maxFeePerGas: parseUnits('50', 9), // Higher max fee per gas (50 gwei)
  maxPriorityFeePerGas: parseUnits('2', 9), // Priority fee (2 gwei)
});
```

### Gas Fee Logic:
```typescript
if (isSameChain) {
  // Same-chain transfer: minimal fees but enough for gas
  txValue = parseUnits('0.001', 18); // Increased from 0.0001
  nativeFee = txValue;
} else {
  // Cross-chain transfer: higher fees for LayerZero messaging
  txValue = parseUnits('0.01', 18); // Increased from 0.005
  nativeFee = txValue;
}
```

## **🐛 PERSISTENT SIDE ISSUES**

- **Chrome Extension Error**: `runtime.sendMessage` errors (likely wallet extension communication issues)
- **Multiple Port Usage**: Dev server keeps incrementing ports (3000→3010) due to processes not properly terminating
- **Supabase Node.js Warning**: Using Node.js 18, should upgrade to Node.js 20+

## **❓ QUESTIONS FOR INVESTIGATION**

1. **Is this a testnet-specific gas estimation issue?** Some testnets have quirky gas handling.

2. **Could wagmi/viem be overriding our manual gas settings?** The wallet reports "gas 0" despite our explicit configuration.

3. **Is there a wagmi configuration issue** that's preventing proper gas estimation on testnets?

4. **Should we try a different approach** like using `prepareSendTransaction` or `estimateGas` separately?

5. **Could the LayerZero OFT contract** have specific gas requirements we're missing?

6. **Is there a Rainbow Wallet specific issue** with how it handles EIP-1559 vs legacy gas pricing on testnets?

7. **Could this be a viem version compatibility issue** with the specific contract interaction?

## **📊 CURRENT STATUS**

- ✅ **UI/UX**: Perfect, matches design requirements
- ✅ **Data Flow**: Username search, recipient selection, amount validation all working
- ✅ **Network Switching**: Automatic chain switching works
- ✅ **Transaction Encoding**: All parameters correctly formatted
- ❌ **Transaction Execution**: Blocked by gas estimation issues

**The app is 95% complete but blocked on this final gas configuration hurdle.**

## **🔬 DEBUGGING ATTEMPTS**

### Console Logs Show:
```javascript
🔍 Network Debug: {
  selectedNetwork: "base",
  targetChainId: 84532,
  currentChainId: 84532,
  needsSwitch: false,
  isConnected: true,
  address: "0x..."
}

🔍 Detailed Send Params Debug: {
  originalRecipientAddress: "0x742d35Cc6634C0532925a3b8D6A2C2B4e6f7A8c9",
  recipientAddressBytes32: "0x000000000000000000000000742d35cc6634c0532925a3b8d6a2c2b4e6f7a8c9",
  sendParam: { /* perfect structure */ },
  messagingFee: { nativeFee: 1000000000000000, lzTokenFee: 0 },
  isSameChain: true,
  txValue: "1000000000000000"
}
```

### Error in Rainbow Wallet:
```
"intrinsic gas too low: gas 0, minimum needed 23564"
```

## **🚀 POTENTIAL SOLUTIONS TO TRY**

1. **Try different gas estimation approach**:
   ```typescript
   const estimatedGas = await publicClient.estimateContractGas({
     ...contractConfig,
     functionName: 'send',
     args: [sendParam, finalMessagingFee, address],
     account: address,
     value: txValue,
   });
   ```

2. **Use `prepareSendTransaction` pattern**:
   ```typescript
   const { request } = await prepareWriteContract({
     ...contractConfig,
     functionName: 'send',
     args: [sendParam, finalMessagingFee, address],
     value: txValue,
   });
   ```

3. **Try legacy gas pricing only**:
   ```typescript
   // Remove EIP-1559 fields, use only gasPrice
   gasPrice: parseUnits('25', 9), // 25 gwei
   ```

4. **Check if it's a testnet RPC issue** by trying different RPC endpoints

5. **Test with a simpler contract call** to isolate if it's LayerZero-specific

## **📁 RELEVANT FILES**

- `frontend/src/components/SendPanel.tsx` - Main send logic
- `frontend/src/lib/contracts/index.ts` - Contract configuration
- `frontend/src/lib/contracts/MyOFT.abi.ts` - Contract ABI
- `frontend/src/lib/wagmi.ts` - Wagmi configuration
- `frontend/src/lib/constants.ts` - Network and token constants

---

**Last Updated**: January 4, 2025  
**Status**: Unresolved - Seeking frontend engineer consultation 