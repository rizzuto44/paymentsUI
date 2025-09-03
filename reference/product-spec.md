# **1\) Deployment: end-to-end for USDT (OFT) on Base \+ Arbitrum**

## **A. Choose the OFT flavor**

* **OFT (mint/burn)** for a new token (your case). No user approvals to move the token cross-chain; `send` burns on source, mints on dest.

## **B. Contracts to deploy**

* `USDT_OFT_Base` on **Base mainnet**

* `USDT_OFT_Arb` on **Arbitrum One**

* Each contract constructor (example):  
   `OFT(name, symbol, lzEndpointOnThisChain, owner)`

You’ll use the LayerZero V2 Endpoint address for each chain in the constructor.

## **C. Deploy \+ wire (owner-only config)**

**Recommended:** use the LayerZero CLI to avoid manual foot-guns.

1. **Deploy** both OFTs (Base and Arbitrum).

2. **Wire peers** (bidirectional) so contracts trust each other:

   * `setPeer(dstEid, bytes32(remoteOFTAddress))` on **both** sides.

3. **Libraries / DVNs / Executor / Enforced options**

   * Keep CLI defaults to start; set minimal enforced gas for `lzReceive`.

   * You can later tune DVN sets, confirmation thresholds, and executor options via CLI config.

4. **(Optional) setDelegate(ownerAlt)** if you want a separate ops key.

5. **Sanity tests**

   * From Base → `quoteSend` small amount → `send` → confirm mint on Arbitrum.

   * Repeat Arbitrum → Base.

That’s the whole “wired as peers via LZ V2” bit: **deploy both**, **setPeer each way**, keep **default libraries/DVNs/executor**, and **enforce** basic gas for `lzReceive`.

---

# **2\) Username registry: centralized for v1 (demo)**

You **can** keep this entirely off-chain for the demo. The FE talks to your backend API; the backend persists usernames and preferences in a DB.

## **Minimal API \+ DB**

* **Table**: `usernames`

  * `username` (PK, unique, lowercase)

  * `owner_address` (EVM address)

  * `preferred_dst_eid` (uint32; e.g., Base EID or Arbitrum EID)

  * `created_at`, `updated_at`

* **Endpoints**

  * `POST /register` → body: `{ username, ownerAddress, signature }`

    * Verify **address ownership** by requiring a wallet **signature** over a nonce+username (prevents someone registering your address).

  * `POST /setPreferredChain` → `{ username, preferredDstEid, ownerAddress, signature }`

  * `GET /resolve?username=...` → returns `{ ownerAddress, preferredDstEid }`

For a later production pass you can move this on-chain (single canonical registry or mirrored across chains with LZ messages). For demo speed, centralized is fine; just **verify wallet ownership** on register/update.

---

# **3\) Mint model**

* **Public mint** (demo): expose `mint(to, amount)` on each OFT contract.

  * UI: user selects chain (Base/Arb), enters amount, calls `mint`.

* No KYC/roles for v1; lock it down later if needed.

**Contract call**

`USDT_OFT.mint(msg.sender, amount);`

---

# **4\) Send to username: UX logic \+ checks**

## **Decision tree (FE)**

1. Resolve recipient: `GET /resolve?username=alice` → `(recipient, recipientPreferredEid)`.

2. Detect **sender chain** (connected network) and **sender USDT balance** on that chain.

3. Validate input:

   * Disable “Send” button unless `amount > 0` **and** `balance >= amount`.

   * Also check native coin balance ≥ estimated gas \+ `quoteSend.nativeFee` (if cross-chain).

4. Path:

   * **Same-chain** (`senderChainEid == recipientPreferredEid`): do local ERC-20 transfer.

   * **Cross-chain** (not equal): do OFT `quoteSend` → `send`.

## **UI affordances**

* Grey out/disable **Send** when balance insufficient.

* For cross-chain:

  * Call `quoteSend` on every amount change; show **native fee** to user.

  * Show a min-receive guard (you can set `minAmountLD = amount` for 1:1, since OFT is lossless; keep a tiny buffer if you plan rate-limits/decimal quirks later).

  * Warn if native coin for fees is too low.

---

# **5\) Approvals**

* You’re using **OFT (mint/burn)** → **no `approve` needed** for the token itself.

* Fee model is **standard (native)** → no fee-token approvals either.

---

# **6\) Fee model: standard (native)**

* Always call `quoteSend` first; then pass the returned fee into `send{ value: fee.nativeFee }(...)`.

* Any unused native fee is refunded to `refundAddress`.

---

# **Contract call crib sheet (what the user actually signs)**

## **A) Mint (on chosen chain)**

`USDT_OFT.mint(msg.sender, amount);`

## **B) Same-chain transfer**

`USDT_OFT.transfer(recipient, amount);`

## **C) Cross-chain transfer (Base ↔ Arbitrum)**

`SendParam memory p = SendParam({`  
  `dstEid: recipientPreferredEid,`  
  `to: addressToBytes32(recipient),`  
  `amountLD: amount,`  
  `minAmountLD: amount,           // 1:1 guard for lossless token`  
  `extraOptions: bytes(""),       // keep empty if you’re not composing`  
  `composeMsg: bytes(""),         // not using composer in v1`  
  `oftCmd: bytes("")              // reserved`  
`});`

`(MessagingFee memory fee, /*limits*/) = USDT_OFT.quoteSend(p);`  
`USDT_OFT.send{ value: fee.nativeFee }(p, fee, msg.sender);`

---

# **Frontend gating (pseudo)**

`// after wallet connect + chain detect`  
`const { balance } = await erc20.balanceOf(user);`  
`const canSend = amount > 0 && balance.gte(amount);`

`if (!canSend) disableSendButton();`

`if (sameChain) {`  
  `// local transfer`  
  `tx = await usdt.transfer(recipient, amount);`  
`} else {`  
  `// cross-chain`  
  `const p = buildSendParam(recipientPreferredEid, recipient, amount);`  
  `const { fee } = await usdt.quoteSend(p);`  
  `const hasNative = await provider.getBalance(user);`  
  `if (hasNative.lt(fee.nativeFee + estGas)) disableSendButton();`

  `tx = await usdt.send(p, fee, user, { value: fee.nativeFee });`  
`}`

---

# **Owner runbook (quick)**

1. **Deploy** `USDT_OFT` on Base \+ Arbitrum (constructor: `name, symbol, endpoint, owner`).

2. **Wire peers** on both contracts via `setPeer`.

3. Keep **default libraries/DVNs/executor**; set minimal **enforced options** for `lzReceive` via CLI.

4. **Smoke test**: tiny `send` each way.

5. Ship FE:

   * Mint page (public `mint`)

   * Username API (centralized): register, setPreferredChain, resolve

   * Send page with balance/fee gating \+ same-chain / cross-chain routing

That’s the v1 demo stack: minimal contracts, centralized usernames, public mint, native fees, and a clean UI decision tree. When you’re ready, I can turn this into a Cursor-ready spec with file structure, ABIs, and concrete Base/Arbitrum EIDs plugged into a `layerzero.config.ts`.

