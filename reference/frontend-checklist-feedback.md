## **1\) Alignment & scope gaps (fix first)**

* **Send tab spec drift.** Your earlier product spec had **no amount field** on Send (v1), but the checklist adds an **Amount input** and “dynamic number formatting” in 4.2. Decide now:

  * If v1 truly excludes amount, **remove the amount work** from 4.2, 4.3, 5.x and disable Send until a valid recipient is selected.

  * If you do want amount (I’d recommend it for a useful demo), reflect that consistently across the spec: validation, disabled states, history schema, tests, and copy.

	I WANT AMOUNTS AS THE PRODUCT CHECKLIST STATES.

* **Network derivation inconsistency.** Original plan: network “defaulted from asset” on Send. The checklist (4.2) says **“Network badge (auto-derived from recipient)”**. Pick one:

  * For a pay-to-username flow, the **recipient’s preferred chain** is the best UX. If so, update Send wording everywhere and remove “defaulted from asset” from the checklist.

TO BE CLEAR, I WANT THE SENDER TO SELECT EITHER USDT (FRONTEND FOR MYOFT TOKEN) ON EITHER BASE OR ARBITRUM, AND THAT WILL AUTO SELECT THE NETWORK (SEND NETWORK) AS EITHER BASE OR ARB. THE SENDER SHOULD HAVE NO INDICATION OF THE RECIPIENTS PREFERRED CHAIN. THERE’S NO NEED. THATS THE WHOLE POINT OF THE UI.

* **Wallet stack indecision.** The checklist references **Dynamic** (not locked), but also wagmi/viem. If Dynamic is TBD, I’d either (a) spec **RainbowKit \+ WalletConnect** now, or (b) explicitly document the Dynamic connector packages and flows so developers aren’t blocked.  
  DYNAMIC IS NOT TBD.  
* **Cookie vs. payload growth.** You store history in a single cookie. With timestamps, status, amount, etc., you risk exceeding practical cookie limits. Keep cookies if you prefer, but add: **cap rows (50), prune oldest, consider compressing payload and/or move to localStorage if you exceed 4KB**.  
  SURE WE CAN JUST STORE THE LAST 10 TRANSFERS OR SMT. THIS IS JUST A DEMO ANYWAYS. LETS GO WITH LAST 10\.

---

## **2\) Architecture & configuration**

* **Chains & constants.** Add a single `constants.ts` with: chain IDs, wagmi chain objects (Base Sepolia, Arbitrum Sepolia), LayerZero EIDs (testnet), contract addresses, token decimals, cookie key, debounce ms, max history rows. Prevent magic numbers sprinkled around.  
  THIS SEEMS REASONABLE. NOW WE ALREADY HAVE SOME FILES IN THE CODEBASE RELATED TO THE SMART CONTRACT DEV, SO NEED TO THINK ABOUT THIS A BIT MORE THOUGHTFULLY TO DO IT RIGHT.

* **RPC strategy.** You hardcode the public RPC URLs. Add **two RPCs per network** (primary \+ fallback), configurable via env. Fail fast and surface an actionable error if all fail.  
  FOR THIS DEMO APP, WE DONT NEED TO WORRY ABOUT THIS.

* **Contracts naming & path.** 3.1 uses `MYOFT` and then loads `USD.address`. Normalize to `USDT_OFT` consistently, and strongly type the deployments import. Add a note to **switch to mainnet addresses via env** later.

	LETS NORMALIZE TO WHATEVER THE LATEST SMART CONTRACTS DEPLOYED WERE. WE HAD ONE RUN OF SMART CONTRACTS DEPLOYED VIA HARDHAT, AND THEN WE REDID IT WITH LZ CLI. LETS USE THE LZ CLI GENERATED ONES ONLY AND DELETE ALL MENTIONS OF THE FORMER CONTRACTS INN THE CODEBASE AND IN THE PRODUCT SPEC AND PLAN.

* **Command (typeahead) import.** Your components list is missing `Command` (shadcn) and friends on Phase 1/2. Add `command` to shadcn setup or you’ll end up hand-rolling the dropdown.


OK.

---

## **3\) Send tab UX**

* **Typeahead correctness.** Add: 300ms debounce, **AbortController** to cancel in-flight fetches, ignore out-of-order responses. Show “No results” and “Couldn’t fetch” states in the suggestion popover. Support ↑/↓ navigation, Enter to select, Esc to close.  
  OK

* **Recipient selection rule.** Send button should enable **only after** a suggestion is explicitly selected (not just text typed). Add this to 4.2 validation.  
  OK

* **Gas/fee preflight (if amount retained).** If you keep an amount, add a preflight for cross-chain: call `quoteSend` and disable Send when the user’s **native balance \< fee \+ gas**. For same-chain, check **USDT balance \>= amount**.  
  OK

* **No auto-select on blur.** Make explicit: do **not** auto-pick the first suggestion when the field loses focus—too risky for payments.  
  OK

* **Security.** Validate the address returned from search (`0x` length \+ checksum). Escape the username in the UI list (avoid DOM injection).

	OK

---

## **4\) Mint tab UX**

* **Chain switching flow.** The CTA must adapt: Connect → Switch → Mint. After `switchChain`, **keep form state** and enable Mint automatically. Add a note to **handle wallet cancellation** of the switch gracefully.  
  OK

* **Numeric input friction.** Live thousands-separator while typing (“1,000”) can be jumpy and error-prone. Prefer **plain numeric input** with formatting on blur, or use an input mask that doesn’t reinsert commas mid-typing. Always convert to BigInt at call time, **never** keep floats in state.  
  OK

* **Token decimals.** Decide now: USDT decimals **6** or **18** for your OFT? Bake it into `constants.ts`, and reflect in the placeholder and `parseUnits`.  
  IDK WHAT IT IS. CURSOR WILL FIND OUT AND FIX.

---

## **5\) History tab**

* **Schema versioning.** Add a `v` field to the cookie. If schema changes, you can migrate or wipe cleanly.  
  FINE.

* **Timestamps.** Be deterministic: use **local time** with a clear, consistent format. If you show “Yesterday,” write the exact rule (e.g., within 24–48h).  
  OK.

* **Pending entries.** When you add on-chain sending, write a **pending** history row immediately, then update status to confirmed/failed later. (Your type hints at this—nice—just be explicit in the flow).  
  OK.

---

## **6\) OFT integration details (when you wire it)**

* **quoteSend → send.** Add the exact flow and disabled rules:

  1. Build `SendParam`, `minAmountLD = amount` (lossless),

  2. `quoteSend(p)` → display `fee.nativeFee`,

  3. `send{ value: fee.nativeFee }(p, fee, refundAddress)`.  
     OK

* **Same-chain vs cross-chain.** If same chain, call `transfer(recipient, amount)`; if cross-chain, run the flow above. Add tests for both branches.  
  OK  
* **Refund address.** Decide: use `msg.sender` for refunds. Document it.  
  OK

* **No approvals.** You’re using **OFT (mint/burn)**, so no token approvals; keep that note present in 4.3 so devs don’t add unnecessary approve calls.  
  OK.

---

## **7\) Username backend (Supabase)**

* **Indexing & search.** Create an index on `LOWER(username)`. Enforce lowercase on write, store lowercase, and **normalize input to lowercase** on read.  
  OK

* **Constraints & validation.** State exact rules: length (3–20), allowed charset (a–z, 0–9, `_`?), **no whitespace**, reserved names, NFC normalization to avoid lookalikes.  
  OK

* **Rate limiting.** Add IP-based rate limit for search to protect your demo. Return consistent JSON on error (`{ users: [], error: '...' }`).  
  OK

* **CORS & caching.** Short cache headers (e.g., 30s) for search responses. Ensure CORS allows your origin.  
  OK

---

## **8\) Accessibility & microcopy**

* **A11y.** Ensure Tabs have roles, `aria-selected`, inputs with `<label htmlFor>`, focus rings visible in dark mode, and minimum contrast for disabled primary (≥ 3:1).  
  OK

* **Helper text.**

  * Send disabled: “Select a recipient from the list.”

  * Wrong chain (Mint): “Switch to Arbitrum to mint on Arbitrum.”

  * Empty suggestions: “No usernames start with ‘jac’.”  
    OK

---

## **9\) Testing & quality**

* **Add E2E.** Unit tests are good, but visual/flow bugs here are common. Add **Playwright** flows for:

  * Connect → Mint (both chains),

  * Search → Send (same-chain & cross-chain),

  * History write/update/clear,

  * Chain-switch cancel/carry on.  
    

OK

* **Visual regression.** Since the card’s size must never change, stand up Chromatic/Percy snapshots for tab switching and list overflow cases.  
  OK

* **Mock viem/wagmi.** Don’t rely on live RPCs in unit tests; mock contract calls, chain switches, and balances.  
  OK

---

## **10\) Deployment & performance**

* **SSR vs CSR.** Wallet UIs often require CSR. Disable SSR for wallet-heavy components or code-split them; prevent hydration mismatches.  
  OK

* **Code splitting.** Lazy-load wallet connectors and contract ABIs. Keep the skeletons in place to mask load.  
  OK

* **Env hygiene.** Do not expose private RPC keys in `NEXT_PUBLIC_*`. Validate env presence at build-time with a schema (zod).  
  OK

---

## **Concrete edits you can paste back into the checklist**

OK TO ALL MENTIONED BELOW

* Under Phase 4.2:

  * Add: “Use shadcn `command` component for typeahead. Debounce 300ms; cancel in-flight with `AbortController`; ignore stale responses.”

  * Add: “Send button only enabled after user selects a suggestion (not merely typing). No auto-select on blur.”

* Under Phase 4.3 (if keeping amount):

  * Add: “Preflight `quoteSend` and disable Send if `nativeBalance < fee + estGas`.”

  * Add: “For same-chain, verify `USDT balance >= amount`; for cross-chain, approvals are not required (OFT mint/burn).”

* Under Phase 3.2:

  * Replace “auto-format while typing” with “format on blur; parse to BigInt on submit.”

* Under Phase 5.1:

  * Add: “Cookie has version, capped at 50 rows; prune oldest; consider compression if cookie exceeds 4KB.”

* Under Phase 1.3:

  * Specify wallet stack now (Dynamic vs RainbowKit). If Dynamic is unknown, switch to RainbowKit \+ WalletConnect and list the packages.

* Add a new “Constants” task in Phase 1:

  * “Create `constants.ts` with chain IDs, EIDs, RPCs (primary/fallback), token decimals, cookie key, debounce ms, max history rows.”

* Add “Playwright E2E” to Phase 6.2.

---

### **Bottom line**

You’re very close. Resolve the Send tab contradictions (amount? who sets the network?), lock the wallet stack, and add a few defensive UX and infra touches (debounce/cancel, rpc fallback, cookie caps, E2E). With those edits, this checklist will be execution-ready and will save you a lot of rework later.

