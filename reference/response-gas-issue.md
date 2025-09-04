## **TL;DR (do these first)**

1. **You’re using the wrong EIDs.**

   * **Base Sepolia** is **40245**, **not** 10247\. [LayerZero Docs](https://docs.layerzero.network/v2/deployments/chains/base-sepolia)

   * **Arbitrum Sepolia** is **40231**. [LayerZero Docs](https://docs.layerzero.network/v2/deployments/chains/arbitrum-sepolia)  
      If you pass an invalid `dstEid`, simulation/estimation can fail in odd ways, and some wallets end up showing `gas: 0`.

2. **Don’t call `OFT.send` for “same-chain” sends.**  
    Same chain should be a plain `ERC20.transfer`. OFT `send` is **cross-chain** accounting (A→B) and you pay DVNs/Executor on the **source** chain to deliver to the **destination** chain. [LayerZero Docs](https://docs.layerzero.network/v2/get-started/create-lz-oapp/configuring-pathways?utm_source=chatgpt.com)  
    Your logs show `isSameChain: true` while still calling `send()` with “Base Sepolia EID” — that’s not a valid cross-chain path and will trip estimation.

3. **Use the `simulateContract → writeContract` flow and pass `account` & `chainId` explicitly.**  
    WalletConnect \+ Rainbow can ignore/override gas if the request isn’t fully specified. Pre-simulate to produce a complete `request` (with gas limit) and then submit *that*.

---

## **What’s likely causing “gas 0”**

* **Wrong EID** (`10247`) → estimation fails → wallet shows `gas 0`. (Testnets use 40xxx EIDs.) [LayerZero Docs+1](https://docs.layerzero.network/v2/deployments/chains/base-sepolia)

* **Calling `send` on same-chain** (srcEid \== dstEid) → revert on simulate/estimate → wallet shows `gas 0`.

* **Missing/implicit `account`/`chainId` in the write** with WalletConnect providers → some wallets don’t do a second estimate and surface `gas 0`.

* **Manual gas fields** can be ignored by the wallet; if estimation fails, some UIs default to 0\.

---

## **Concrete fixes (code you can drop in)**

### **1\) Correct EIDs and route selection**

`// constants/eids.ts`  
`export const EIDS = {`  
  `'base-sepolia': 40245,       // Chain ID 84532`  
  `'arbitrum-sepolia': 40231,   // Chain ID 421614`  
`} as const`

`// decide path based on recipient's preferred chain`  
`const srcChainKey = currentChainId === 84532 ? 'base-sepolia' : 'arbitrum-sepolia';`  
`const dstChainKey = recipientPrefChainId === 84532 ? 'base-sepolia' : 'arbitrum-sepolia';`

`const isSameChain = srcChainKey === dstChainKey;`  
`const dstEid = EIDS[dstChainKey];`

### **2\) Same-chain → plain ERC-20 transfer**

`import { erc20Abi } from 'viem'`

`if (isSameChain) {`  
  `const { request } = await simulateContract(config, {`  
    ``account: address as `0x${string}`,``  
    `chainId: currentChainId,`  
    ``address: oftAddress as `0x${string}`,``  
    `abi: erc20Abi,`  
    `functionName: 'transfer',`  
    ``args: [recipientAddress as `0x${string}`, amountLD],``  
  `})`  
  `return await writeContract(config, request)`  
`}`

### **3\) Cross-chain → OFT `quoteSend` then `send` (simulate → write)**

`import { encodePacked, zeroAddress } from 'viem'`  
`import { simulateContract, writeContract, readContract } from '@wagmi/core'`

`// helper`  
``const addressToBytes32 = (addr: `0x${string}`) =>``  
  `` `0x${addr.slice(2).padStart(64, '0')}` as `0x${string}` ``

`// Build SendParam`  
`const sendParam = {`  
  `dstEid,`  
  ``to: addressToBytes32(recipientAddress as `0x${string}`),``  
  `amountLD,               // BigInt`  
  `minAmountLD: amountLD,  // no slippage in your demo`  
  `extraOptions: '0x',     // fine for now if you set enforced options on-chain`  
  `composeMsg: '0x',`  
  `oftCmd: '0x',`  
`} as const`

`// 1) Quote the fee`  
`const [nativeFee, lzTokenFee] = await readContract(config, {`  
  `chainId: currentChainId,`  
  ``address: oftAddress as `0x${string}`,``  
  `abi: oftAbi,`  
  `functionName: 'quoteSend',`  
  `args: [sendParam, false],`  
`}) as [bigint, bigint]`

`const fee = { nativeFee, lzTokenFee: lzTokenFee ?? 0n } // struct shape`

`// 2) Simulate to get a request with gas included`  
`const { request } = await simulateContract(config, {`  
  ``account: address as `0x${string}`,``  
  `chainId: currentChainId,`  
  ``address: oftAddress as `0x${string}`,``  
  `abi: oftAbi,`  
  `functionName: 'send',`  
  ``args: [sendParam, fee, address as `0x${string}`],``  
  `value: fee.nativeFee,                  // must equal nativeFee`  
`})`

`// 3) Submit exactly what we simulated`  
`await writeContract(config, request)`

**Notes**

* Don’t pass manual `gas`, `gasPrice`, `maxFeePerGas`, `maxPriorityFeePerGas`. Let `simulateContract` set the gas limit, then submit the exact `request`.

* Always pass **`account`** and **`chainId`**. This alone fixes many WalletConnect “gas 0” dialogs.

### **4\) Guard rails in the UI**

* If `srcChainKey === dstChainKey`, hide the OFT path and only show “Send on Base/Arb”.

* Disable the Send button if:

  * `dstEid` is undefined (bad mapping),

  * user balance \< amount,

  * peer not set (optional: preflight check via `readContract` to ensure `peer` is whitelisted).

