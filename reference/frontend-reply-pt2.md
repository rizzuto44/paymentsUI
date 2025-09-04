## **The two “blockers” are actually one main blocker \+ one wiring issue**

### **1\) “Wallet doesn’t pop up”**

In your latest logs, the **wallet never gets a chance to open** because your code throws **before** the provider call (the invalid recipient address). When an exception is thrown prior to `simulateContract`/`writeContract`, no wallet can open. Fix the address issue first; most “no popup” symptoms will disappear.

### **2\) “Invalid address format”**

You’re repeatedly getting `…Hac…` in the address. That’s simply **not hex**. This is almost certainly a **data integrity** problem coming from Supabase (or from the FE not freezing the selected suggestion and accidentally reusing free-typed text).

---

## **What to change right now**

### **A) Validate before anything else (FE)**

Use viem’s utils, not custom regex. If this fails, **do not** call any wagmi function.

* `import { isAddress, getAddress } from 'viem'`  
  *   
  * ``function assertValidEthAddress(addr: string): asserts addr is `0x${string}` {``  
  *   `if (!isAddress(addr)) {`  
  *     ``throw new Error(`Invalid Ethereum address: ${addr}`)``  
  *   `}`  
  * `}`  
  *   
  * `const recipientAddress = selectedRecipient?.ownerAddress // from suggestion click`  
  * `assertValidEthAddress(recipientAddress)           // throw early, show inline error`  
  * `const checksummed = getAddress(recipientAddress)  // use this for display`  
    

Important:

* **Never** trust the text inside the input once the user starts typing again. The Send button should only enable when a **suggestion has been explicitly selected**. Freeze that selection (e.g., show a pill with a “✓” and hide raw text).

* **Do not** run `addressToBytes32` on the same-chain path (you’re calling `transfer`, not OFT `send`).

  ### **B) Fix your DB (BE)**

Add a constraint, backfill/clean, and keep it clean:

**Postgres constraint (Supabase):**

* `-- Store normalized lowercase or checksum (your choice), but enforce hex:`  
  * `ALTER TABLE public.users`  
  * `ADD CONSTRAINT owner_address_is_hex40`  
  * `CHECK (owner_address ~* '^0x[0-9a-fA-F]{40}$');`  
  *   
  * `-- Optional: uniqueness if you want one username per address:`  
  * `-- ALTER TABLE public.users ADD CONSTRAINT owner_address_unique UNIQUE (owner_address);`  
    

**Find and inspect bad rows:**

* `SELECT username, owner_address`  
  * `FROM public.users`  
  * `WHERE owner_address !~* '^0x[0-9a-fA-F]{40}$';`  
    

**During “register” API:**

* Require a **signature** from the claimed address.

* Verify `isAddress(ownerAddress)` server-side before insert.

* Store a **normalized** form (either lowercase or checksum via a small server util).

  ### **C) Don’t bury wallet calls in effects or async chains**

Call **`simulateContract → writeContract`** directly **inside the button’s onClick handler**, with an awaited promise chain. Wallet UIs often require a “user gesture” call-stack. Also pass `account` and `chainId` explicitly.

#### **Same-chain (ERC-20 transfer)**

* `import { erc20Abi } from 'viem'`  
  * `import { simulateContract, writeContract } from '@wagmi/core'`  
  *   
  * `async function handleSendSameChain() {`  
  *   `// 1) Validate`  
  *   `assertValidEthAddress(recipientAddress)`  
  *   
  *   `// 2) Simulate (produces a fully-formed request including gasLimit)`  
  *   `const { request } = await simulateContract(config, {`  
  *     ``account: address as `0x${string}`,``  
  *     `chainId: srcChainId,`  
  *     ``address: usdtAddress as `0x${string}`,``  
  *     `abi: erc20Abi,`  
  *     `functionName: 'transfer',`  
  *     ``args: [recipientAddress as `0x${string}`, amountLD], // BigInt``  
  *   `})`  
  *   
  *   `// 3) Send exactly what we simulated`  
  *   `await writeContract(config, request)`  
  * `}`  
    

    #### **Cross-chain (OFT send)**

  * `import { simulateContract, writeContract, readContract } from '@wagmi/core'`  
  * `import { isAddress } from 'viem'`  
  *   
  * `// 1) Validate recipient + route`  
  * `assertValidEthAddress(recipientAddress)`  
  * `if (srcEid === dstEid) throw new Error('Same chain detected; use transfer')`  
  *   
  * `// 2) Build send params (no compose/options for v1)`  
  * `const sendParam = {`  
  *   `dstEid,`  
  *   ``to: `0x${recipientAddress.slice(2).padStart(64, '0')}` as `0x${string}`,``  
  *   `amountLD,              // BigInt`  
  *   `minAmountLD: amountLD, // lossless`  
  *   `extraOptions: '0x',`  
  *   `composeMsg: '0x',`  
  *   `oftCmd: '0x',`  
  * `} as const`  
  *   
  * `// 3) Quote fee`  
  * `const [nativeFee] = await readContract(config, {`  
  *   ``account: address as `0x${string}`,``  
  *   `chainId: srcChainId,`  
  *   ``address: oftAddress as `0x${string}`,``  
  *   `abi: oftAbi,`  
  *   `functionName: 'quoteSend',`  
  *   `args: [sendParam, false], // payInLzToken = false`  
  * `}) as [bigint, bigint?]`  
  *   
  * `// 4) Simulate and write`  
  * `const { request } = await simulateContract(config, {`  
  *   ``account: address as `0x${string}`,``  
  *   `chainId: srcChainId,`  
  *   ``address: oftAddress as `0x${string}`,``  
  *   `abi: oftAbi,`  
  *   `functionName: 'send',`  
  *   ``args: [sendParam, { nativeFee, lzTokenFee: 0n }, address as `0x${string}`],``  
  *   `value: nativeFee,`  
  * `})`  
  * `await writeContract(config, request)`  
    

**Do not** pass manual `gas`, `gasPrice`, `maxFeePerGas`. Let the simulation produce a correct `gas` value that wallets respect. This also obviates the “gas 0” dialog you saw earlier.

### **D) UI rules that kill a ton of bugs**

* The **Send** button is enabled only if:

  * a suggestion was selected (not just raw text),

  * `isAddress(selected.ownerAddress)` is true,

  * for cross-chain: you successfully fetched `nativeFee`,

  * (optional) you’ve verified the connected chain matches the **source** network.

* When the user **edits** the recipient input after selecting a suggestion, **clear the selection** and disable the Send button again.

* Render the selected recipient as a pill: `jacob (0xAbC…123)` with a ✓ and a small “Change” link.

  ---

  ## **Why the wallet “popup” still might not open (after you fix addresses)**

* The call **is not inside a user gesture** (e.g., it happens in an effect after state changes). Keep it inside the click handler, not in `useEffect`.

* Missing **`account` or `chainId`**. Always pass both.

* **Multiple providers/overlays** competing (Dynamic \+ RainbowKit \+ manual provider). Pick **one** orchestrator for the connection flow; right now you’ve got Dynamic in the mix. Ensure your wagmi config’s `connectors` match what Dynamic provides.

* Chrome `runtime.sendMessage` noise: usually from another extension. Test in **Incognito** with only one wallet extension enabled, or try **WalletConnect mobile** to bypass extensions entirely. This log alone typically **doesn’t** block provider requests.

  ---

  ## **One more gotcha I see a lot**

**Don’t reuse the typed input as the recipient after a selection.**  
 The pattern that causes corruption: you store both `inputValue` and `selectedRecipient`. The user selects “jacob” (valid), then types an extra character (e.g., a space or pastes something). If the code builds args from `inputValue` instead of `selectedRecipient.ownerAddress`, boom—bad address. In SendPanel, derive transaction params **solely** from `selectedRecipient`.

---

## **Quick checklist to get you unblocked**

* On recipient selection: store `{ username, ownerAddress }` and freeze it; disable Send until this happens.

* Validate with `isAddress` and `getAddress`. No custom regex.

* Same-chain → `transfer`; cross-chain → `quoteSend` then `send`.

* Use **`simulateContract → writeContract`** with explicit `account` and `chainId` inside the **button click** handler.

* Add DB constraint \+ cleanup for owner\_address in Supabase.

* Test in Incognito with one wallet extension; verify wallet opens after simulation.

* Log the exact values you pass to `simulateContract` (address, abi fn, args, account, chainId, value). If simulate throws, print that error.

  ---

  ## **If you want me to double-check your code**

Paste (or gist) these:

1. The **Send button handler** (full function).

2. The typeahead **selection** code path (where you set `selectedRecipient`).

3. Your **wagmi config** (connectors, transports) and whether Dynamic is wrapping wagmi or vice versa.  
   * 

