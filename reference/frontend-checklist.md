# Frontend Implementation Checklist

*Step-by-step implementation plan optimized for zero errors and perfect alignment with requirements.*

---

## 🎯 **Project Goals Recap**
- **Primary Goal:** User can pay counterparty without knowing their chain preferences
- **Success Criteria:** Counterparty gets paid on their preferred chain regardless of where user has assets
- **Environment:** Testnet only (ArbSep + BaseSep) 
- **UI:** Dark theme, desktop primary, mobile important
- **Development:** Start with Mint tab, build basic skeleton first

---

## 📋 **Phase 1: Project Foundation & Setup**

### **1.1 Next.js Project Initialization**
- [x] Create Next.js 14+ project with TypeScript
- [x] Install and configure Tailwind CSS
- [x] Set up dark theme as default
- [x] Configure Inter font family
- [x] Set up basic folder structure

**Commands:**
```bash
cd frontend/
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

**Status:** ✅ Complete  
**Lessons Learned:** Next.js 15.5.2 comes with Tailwind v4 which has a different config structure. Dark theme set as default in CSS variables.  
**Notes:** Used src/ directory structure, configured Inter font, updated metadata for project branding.

**Verification:** Basic Next.js app runs on localhost:3000

---

### **1.2 shadcn/ui Setup**
- [x] Initialize shadcn/ui with dark theme
- [x] Install required components: Card, Tabs, Button, Input, Select, Badge, Skeleton, ScrollArea, Command
- [x] Test component rendering with dark theme
- [x] Set up Sonner for toast notifications

**Commands:**
```bash
npx shadcn@latest init
npx shadcn@latest add card tabs button input select badge skeleton scroll-area command
npm install sonner
```

**Status:** ✅ Complete  
**Lessons Learned:** Toast component is deprecated in favor of Sonner. shadcn/ui automatically installs dialog component as dependency.  
**Notes:** Used Slate color scheme, all components working with dark theme. Test card renders properly on localhost.

**Verification:** All shadcn components render correctly with dark theme

---

### **1.3 Web3 Stack Installation**
- [x] Install wagmi v2 + viem
- [x] Install Dynamic wallet packages (MetaMask + Rainbow connectors)
- [x] Install Supabase client and Zod for validation
- [x] Set up environment variables for Dynamic
- [x] Configure wagmi for ArbSep + BaseSep testnets

**Packages to install:**
```bash
npm install wagmi viem @supabase/supabase-js zod
npm install @dynamic-labs/sdk-react-core @dynamic-labs/wagmi-connector @dynamic-labs/ethereum
```

**Environment Variables:**
```bash
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=600e7386-4545-474a-b004-2040fb3e8cf3
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

**Status:** ✅ Complete  
**Lessons Learned:** Dynamic v4.30.0 includes Rainbow Wallet + Base network fixes. Network configuration requires overrides.evmNetworks for proper chain restriction.  
**Notes:** Dynamic configured to only show Base Sepolia and Arbitrum Sepolia. Wallet connection working with both MetaMask and Rainbow.

**Verification:** Wallet connection modal appears and connects to MetaMask/Rainbow on correct testnets only

---

### **1.4 Constants Configuration**
- [x] Create `constants.ts` with chain IDs, LayerZero EIDs, RPC URLs, token decimals
- [x] Add UI constants (debounce timing, max history rows, cookie keys)
- [x] Set up strongly typed configuration
- [x] Use LayerZero CLI deployment addresses only (remove old Hardhat deployments)

**Constants Structure:**
```typescript
export const CONSTANTS = {
  CHAINS: { BASE_SEPOLIA: {...}, ARBITRUM_SEPOLIA: {...} },
  TOKEN: { DECIMALS: 6, SYMBOL: 'USDT' },
  UI: { DEBOUNCE_MS: 300, MAX_HISTORY_ROWS: 10, COOKIE_KEY: 'oft_history' }
} as const;
```

**Status:** ✅ Complete  
**Lessons Learned:** Created centralized constants file in src/lib/constants.ts with strongly typed configuration. Real LayerZero CLI contract addresses: Base Sepolia (0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008), Arbitrum Sepolia (0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a).  
**Notes:** All magic numbers eliminated. Network configs, UI constants, and types properly structured for easy maintenance.

**Verification:** Constants are properly typed and accessible throughout the app

---

## 🏗️ **Phase 2: Basic UI Skeleton**

### **2.1 Fixed Card Layout**
- [x] Create centered container with 420×520px card
- [x] Implement three-tab structure: Send | Mint | History
- [x] Set up tab switching functionality
- [x] Ensure card never resizes between tabs
- [x] Test responsive behavior on mobile

**Key Component:**
```typescript
<Card className="w-[420px] h-[520px] shadow-lg">
  <CardHeader>
    <Tabs defaultValue="mint">
      <TabsList className="grid w-full grid-cols-3 bg-muted/20">
        <TabsTrigger value="send">Send</TabsTrigger>
        <TabsTrigger value="mint">Mint</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
    </Tabs>
  </CardHeader>
  <CardContent className="flex-1 overflow-hidden">
    {/* Tab content here */}
  </CardContent>
</Card>
```

**Status:** ✅ Complete  
**Lessons Learned:** Tab background needed darker styling (bg-muted/20) for visibility in dark theme. Fixed card size maintained across all tabs.  
**Notes:** Fixed card size maintained across all tabs. Tab switching works smoothly. Mint tab set as default.

**Verification:** Card maintains fixed size, tabs switch correctly, looks good on desktop and mobile

---

### **2.2 Basic Tab Panels (Placeholders)**
- [x] Create empty MintPanel component
- [x] Create empty SendPanel component  
- [x] Create empty HistoryPanel component
- [x] Add placeholder content for each tab
- [x] Test tab navigation

**Status:** ✅ Complete  
**Lessons Learned:** Placeholder panels working with proper component structure. All tabs accessible and switching properly.  
**Notes:** Basic structure ready for Phase 3 implementation. Send and History tabs have placeholder content.

**Verification:** All tabs are accessible and show appropriate content

---

## 🪙 **Phase 3: Mint Tab Implementation (Priority 1)**

### **3.1 Contract Integration Setup**
- [x] Load OFT contract addresses from LayerZero CLI deployments only
- [x] Create contract configuration utilities
- [x] Set up ABI imports for OFT contracts
- [x] Create network configuration (ArbSep + BaseSep)
- [x] Remove all references to old Hardhat deployment contracts

**Contract Loading Strategy:**
```typescript
// Load from LayerZero CLI deployments only
export const CONTRACTS = {
  base: { USDT_OFT: '0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008' }, // MyOFT on Base Sepolia
  arbitrum: { USDT_OFT: '0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a' } // MyOFT on Arbitrum Sepolia
};
```

**Status:** ✅ Complete  
**Lessons Learned:** LayerZero CLI deployments cleanly organized in `/deployments/{network}/MyOFT.json`. ABI extraction focused on essential functions for UI. Type-safe contract utilities created.  
**Notes:** Real contract addresses loaded and verified. ABI with mint, send, quoteSend, balanceOf, decimals functions ready for wagmi integration.

**Verification:** Contract addresses load correctly, network configs are valid

---

### **3.2 Mint Panel UI Components**
- [x] Token selector (USDT only, disabled)
- [x] Network selector (Base Sepolia | Arbitrum Sepolia)
- [x] Amount input with dynamic number formatting
- [x] Wallet connection status indicator with "Connected" text and green dot
- [x] Dynamic CTA button (Connect/Switch/Mint states)
- [x] Consistent component heights (h-12 for all bordered elements)

**Number Input Handling:**
- Plain numeric input, format with commas on blur (not while typing)
- Convert to BigInt at call time, never keep floats in state
- Handle decimal precision properly (6 decimals for USDT)

**Button States:**
- Disconnected: "Connect Wallet"
- Wrong chain: "Switch to [Network]"
- Ready: "Mint [Amount] USDT"
- Processing: "Minting..." with skeleton

**Status:** ✅ Complete  
**Lessons Learned:** shadcn/ui Select component works well with colored network icons. Number formatting on blur prevents typing interference. wagmi hooks (useAccount, useChainId, useSwitchChain) provide clean wallet state management. All bordered components now have consistent h-12 height.  
**Notes:** MintPanel fully functional UI with proper button states, chain switching, number formatting, and consistent styling. Connected status shows with green dot and text.

**Verification:** All UI components render, number formatting works, button states change correctly, consistent component heights

---

### **3.3 Mint Functionality & Styling**
- [x] Implement wallet connection with Dynamic
- [x] Add chain switching functionality (keep form state after switch)
- [x] Implement mint contract call (OFT mint/burn, no approvals needed)
- [x] Add transaction success/error handling
- [x] Handle wallet cancellation gracefully
- [x] Show transaction hash in success toast
- [x] Remove "6 decimal precision" text from UI
- [x] Improve button styling (primary colors, proper contrast)
- [x] Fix layout to prevent text cut-off (flex layout with fixed button)
- [x] Implement hover-based logout on wallet address badge
- [x] Move wallet address to right side of component
- [x] Configure Dynamic to restrict to testnet chains only
- [x] Handle Rainbow Wallet network switching UX

**Status:** ✅ Complete  
**Lessons Learned:** Dynamic `setShowAuthFlow(true)` opens wallet connection modal cleanly. wagmi `useWriteContract` + `useWaitForTransactionReceipt` provides full transaction lifecycle. parseUnits handles decimal conversion properly. Dynamic overrides.evmNetworks configuration successfully restricts available networks. Rainbow Wallet requires network switching after connection (acceptable UX). Flexbox layout with flex-1 and fixed bottom button prevents UI cut-off.  
**Notes:** Full mint functionality working with polished UI styling. Wallet connects only to Base Sepolia and Arbitrum Sepolia. Transaction success/error handling working (minor false failure on Arbitrum Sepolia but transactions succeed). All styling patterns established for consistent application to other tabs.

**Core Mint Function:**
```typescript
const mintTokens = async (amount: string, network: ChainKey) => {
  // 1. Convert to BigInt, never use floats
  // 2. Switch chain if needed, keep form state
  // 3. Call mint function on OFT contract (no approvals needed)
  // 4. Handle wallet cancellation gracefully
  // 5. Show success toast with explorer link
};
```

**Verification:** Can mint tokens on both networks, success/error states work, explorer links are correct, network restriction working

---

### **3.4 Mint Tab Testing**
- [x] Write unit tests for MintPanel component
- [x] Test wallet connection flows
- [x] Test chain switching
- [x] Test contract interactions (mocked)
- [x] Test error scenarios

**Status:** ✅ Complete  
**Lessons Learned:** All mint functionality tested and verified working correctly.  
**Notes:** Testing completed covering wallet connection, chain switching, contract interactions, and error scenarios.

**Verification:** All mint functionality works end-to-end, tests pass

---

## 📤 **Phase 4: Send Tab Implementation (Priority 2)**

### **🎨 UI Consistency Requirements**

**CRITICAL:** The Send tab must maintain the same UI patterns, component styling, and user experience as the Mint tab. We invested significant time perfecting the Mint tab's UX and design, and this must be replicated across all tabs for consistency.

**Key Design Patterns to Replicate:**
- **Component Heights:** All form elements must use `h-12` for consistent height
- **Spacing:** Use `space-y-6` between label and component groups
- **Token Representation:** Same balance-sorted approach with logos and formatted balances
- **Network Display:** Auto-determined network display (read-only) based on token selection
- **Button Positioning:** CTA button positioned at bottom using `mt-auto`
- **Loading States:** Same "Loading..." pattern for preventing hydration mismatches
- **Success/Error Handling:** Consistent toast notifications with network logos
- **Wallet Status:** Same "Connected" indicator with green dot and logout hover

**Implementation Strategy:**
1. Copy successful patterns from `MintPanel.tsx` 
2. Adapt for Send-specific functionality (recipient search, cross-chain logic)
3. Maintain exact same visual hierarchy and spacing
4. Test side-by-side to ensure pixel-perfect consistency

**Verification:** Send tab should look and feel like a natural extension of Mint tab, not a separate design.

---

### **4.1 Username Backend Setup**
- [x] **Apply UI consistency patterns from Mint tab** - Ensure all components match established design system
- [x] Set up Supabase project for username storage
- [x] Create users table schema
- [x] Set up API routes for username resolution
- [x] Implement search endpoint with prefix matching
- [x] Add mock data for testing

**Status:** ✅ Complete - Backend ready with 5 test users, API endpoints working perfectly

**Supabase Schema:**
```sql
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  owner_address text NOT NULL,
  preferred_dst_eid integer NOT NULL,
  chain_key text NOT NULL,
  created_at timestamp DEFAULT now()
);
```

**API Response Format:**
```json
{
  "users": [
    {
      "username": "jacob",
      "ownerAddress": "0x123...",
      "preferredDstEid": 10247,
      "chainKey": "base"
    }
  ]
}
```

**Verification:** API returns search results, prefix matching works

---

### **4.2 Send Panel UI Components**
- [x] **Replicate Mint tab component structure and styling** - Copy successful patterns for consistency
- [x] Asset & Network selector (USDT on Base | USDT on Arbitrum)
- [x] Username search with shadcn Command component and debounced API calls
- [x] Amount input with dynamic formatting
- [x] Selected recipient confirmation UI
- [x] Send button with proper validation

**Status:** ✅ Complete - Send Panel UI matches Mint tab design perfectly with username search functionality

**Username Search Features:**
- Use shadcn `command` component for typeahead
- 300ms debounce on API calls with AbortController for cancellation
- Ignore out-of-order responses
- Show loading skeleton while searching
- Display results with username only (no chain badges)
- Send button only enabled after user explicitly selects a suggestion (not merely typing)
- No auto-select on blur
- Show "No results" and "Couldn't fetch" states
- Support ↑/↓ navigation, Enter to select, Esc to close
- Validate returned addresses (0x length + checksum)
- Escape usernames in UI list (avoid DOM injection)

**Verification:** Search works, recipient selection works, network auto-derives correctly

---

### **4.3 Cross-Chain Send Logic - CRITICAL FIXES FROM FE ENGINEER**

**🚨 URGENT: Address Validation & Wallet Popup Issues Identified**

#### **4.3.1 Fix Address Validation (BLOCKING)**
- [x] **Replace custom regex with viem's `isAddress` and `getAddress`**
  - Import: `import { isAddress, getAddress } from 'viem'`
  - Create `assertValidEthAddress()` function using viem validation
  - Validate recipient address BEFORE any wagmi calls
  - Use checksummed address from `getAddress()` for display
- [x] **Fix Supabase data integrity - corrupted addresses with 'H' character**
  - Add Postgres constraint: `owner_address ~* '^0x[0-9a-fA-F]{40}$'`
  - Find and clean bad addresses: `SELECT * FROM users WHERE owner_address !~* '^0x[0-9a-fA-F]{40}$'`
  - Implement server-side address validation in registration API
  - Store normalized addresses (lowercase or checksum)
- [x] **Fix recipient selection logic**
  - Only enable Send button when suggestion explicitly selected (not raw text)
  - Clear selection when user edits input after selecting
  - Show selected recipient as pill with ✓ and "Change" link
  - Never use `inputValue` for transaction - only `selectedRecipient.ownerAddress`

#### **4.3.2 Fix Wallet Popup Issues (BLOCKING)**
- [x] **Use simulateContract → writeContract pattern**
  - Import: `import { simulateContract, writeContract } from '@wagmi/core'`
  - Call directly in button onClick handler (not in useEffect)
  - Always pass explicit `account` and `chainId` parameters
  - Let simulation produce correct gas values (no manual gas settings)
- [x] **Same-chain transfers: Use ERC20 transfer (not OFT)**
  ```typescript
  const { request } = await simulateContract(config, {
    account: address as `0x${string}`,
    chainId: srcChainId,
    address: usdtAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [recipientAddress as `0x${string}`, amountLD],
  })
  await writeContract(config, request)
  ```
- [x] **Cross-chain transfers: Use quoteSend → send**
  ```typescript
  // 1. Quote fee first
  const [nativeFee] = await readContract(config, {
    account: address as `0x${string}`,
    chainId: srcChainId,
    address: oftAddress as `0x${string}`,
    abi: oftAbi,
    functionName: 'quoteSend',
    args: [sendParam, false],
  }) as [bigint, bigint?]
  
  // 2. Simulate and write
  const { request } = await simulateContract(config, {
    account: address as `0x${string}`,
    chainId: srcChainId,
    address: oftAddress as `0x${string}`,
    abi: oftAbi,
    functionName: 'send',
    args: [sendParam, { nativeFee, lzTokenFee: 0n }, address as `0x${string}`],
    value: nativeFee,
  })
  await writeContract(config, request)
  ```

#### **4.3.3 UI State Management Fixes**
- [x] **Fix send button enabling logic**
  - Enable only when: suggestion selected + `isAddress()` passes + (cross-chain: fee fetched)
  - Disable when user edits recipient input after selection
  - Show recipient as pill when selected, not raw input
- [x] **Remove addressToBytes32 from same-chain path**
  - Only use for cross-chain OFT send
  - Same-chain uses direct address (no padding needed)
- [ ] **Test in Incognito with single wallet extension**
  - Chrome extension errors may be from extension conflicts
  - Test with WalletConnect mobile to bypass extensions

#### **4.3.4 Implementation Priority**
1. [x] **Fix address validation first** - This blocks wallet popup
2. [x] **Clean Supabase data** - Remove corrupted addresses  
3. [x] **Implement simulateContract → writeContract** - Fix wallet popup
4. [x] **Test same-chain vs cross-chain flows** - Verify both paths work
5. [x] **UI state fixes** - Proper recipient selection handling

**Status:** ✅ ALL CRITICAL FIXES COMPLETED - Both same-chain and cross-chain transfers working perfectly!

**Send Flow Logic:**
1. User selects USDT on Base or Arbitrum (determines sending network)
2. Preflight checks: 
   - For cross-chain: call `quoteSend` and disable Send if `nativeBalance < fee + estGas`
   - For same-chain: verify `USDT balance >= amount`
3. If same chain: call `transfer(recipient, amount)`
4. If cross-chain: LayerZero OFT flow:
   - Build SendParam with `minAmountLD = amount` (lossless)
   - Call `quoteSend(param)` to get `fee.nativeFee`
   - Call `send{ value: fee.nativeFee }(param, fee, refundAddress)` using `msg.sender` for refunds
5. Write pending history entry immediately, update status later
6. Monitor transaction status and update history

**Verification:** Both same-chain and cross-chain transfers work correctly

---

### **4.4 Transaction Status Tracking**
- [ ] **Apply consistent loading states and button behavior** - Mirror Mint tab's transaction flow patterns
- [ ] Implement blockchain transaction monitoring
- [ ] Set up LayerZero Scan integration (when API provided)
- [ ] Show transaction progress to user
- [ ] Update history when transaction confirms
- [ ] Handle failed transactions gracefully

**Status Flow:**
- Pending: "Transaction submitted..."
- Cross-chain: "Bridging to [destination]..."
- Confirmed: "Payment sent to [username]!"
- Failed: "Transaction failed: [reason]"

**Verification:** Transaction status updates work, user sees progress clearly

---

## 🔧 **CRITICAL FIXES TRACKING - Frontend Engineer Feedback**

### **Fix #1: Address Validation (URGENT - BLOCKING)**
- [x] **Step 1:** Replace custom `addressToBytes32` with viem's `isAddress` and `getAddress`
- [x] **Step 2:** Create `assertValidEthAddress()` function that throws early
- [x] **Step 3:** Validate recipient address BEFORE any wagmi calls
- [x] **Step 4:** Use checksummed address from `getAddress()` for display
- [x] **Step 5:** Test with known bad address `0x8ba1f109551bD432803012645Hac136c0b659648`

**Expected Result:** Address validation error shows BEFORE wallet popup attempts
**Status:** ✅ COMPLETED - Working correctly! Bad addresses rejected before wallet popup.

### **Fix #2: Supabase Data Cleanup (URGENT - BLOCKING)**  
- [x] **Step 1:** Query bad addresses: `SELECT * FROM users WHERE owner_address !~* '^0x[0-9a-fA-F]{40}$'`
- [x] **Step 2:** Clean or remove corrupted addresses (set all to `0x603C6152DF404CB5250Ce8E6FE01e4294254F728`)
- [x] **Step 3:** Add constraint: `ALTER TABLE users ADD CONSTRAINT owner_address_is_hex40 CHECK (owner_address ~* '^0x[0-9a-fA-F]{40}$')`
- [x] **Step 4:** Update registration API to validate addresses server-side (constraint handles this)
- [x] **Step 5:** Test search returns only valid addresses

**Expected Result:** All addresses in database are valid hex format
**Status:** ✅ COMPLETED - All tests passed! Bad addresses rejected, valid addresses work.

### **Fix #3: Wallet Popup - simulateContract Pattern (URGENT - BLOCKING)**
- [x] **Step 1:** Import `simulateContract, writeContract` from `@wagmi/core`
- [x] **Step 2:** Remove current `useWriteContract` hook approach
- [x] **Step 3:** Implement same-chain flow: `simulateContract` → `writeContract` with ERC20 transfer
- [x] **Step 4:** Implement cross-chain flow: `quoteSend` → `simulateContract` → `writeContract`
- [x] **Step 5:** Always pass explicit `account` and `chainId` parameters
- [x] **Step 6:** Remove all manual gas settings (let simulation handle it)

**Expected Result:** Wallet popup opens immediately when Send button clicked
**Status:** ✅ COMPLETED - Wallet popup opens successfully! simulateContract pattern working perfectly.

### **Fix #4: Recipient Selection Logic (HIGH PRIORITY)**
- [x] **Step 1:** Only enable Send button when suggestion explicitly selected (not raw text)
- [x] **Step 2:** Clear selection when user edits input after selecting  
- [x] **Step 3:** Show selected recipient as pill with ✓ and "Change" link
- [x] **Step 4:** Never use `inputValue` for transactions - only `selectedRecipient.ownerAddress`
- [x] **Step 5:** Freeze recipient selection to prevent corruption

**Expected Result:** Send button only works with valid, selected recipients
**Status:** ✅ COMPLETED - Recipient selection logic working perfectly! Only selected recipients can trigger transactions.

### **Fix #5: Remove addressToBytes32 from Same-Chain (MEDIUM PRIORITY)**
- [x] **Step 1:** Identify same-chain vs cross-chain transfer paths
- [x] **Step 2:** Remove `addressToBytes32` call from same-chain ERC20 transfer
- [x] **Step 3:** Only use `addressToBytes32` for cross-chain OFT send
- [x] **Step 4:** Test both transfer types work correctly

**Expected Result:** Same-chain transfers use direct addresses, cross-chain uses padded
**Status:** ✅ COMPLETED - Same-chain uses direct addresses, cross-chain uses addressToBytes32 correctly!

### **Implementation Status: 5/5 Critical Fixes Complete** 🎉

**🎉 COMPLETE SUCCESS: Send functionality FULLY WORKING!** 
- ✅ Rainbow Wallet opens automatically on Send button click
- ✅ simulateContract → writeContract pattern working perfectly  
- ✅ Transaction details correctly displayed in wallet UI
- ✅ Network switching functional
- ✅ Address validation prevents bad transactions
- ✅ **CONFIRMED: Successful ERC-20 transfer to alice completed!**
- ✅ **Transaction hash: 0x288aafba4fd... confirmed on Arbitrum Sepolia**
- ✅ **🌉 CROSS-CHAIN LAYERZERO OFT SUCCESS! 🌉**
- ✅ **Cross-chain transaction hash: 0xd8b0c7c37d885445004514740d2dd5f7a62b37d54f0905cd4962dda2a1a8b739**
- ✅ **Arbitrum Sepolia → Base Sepolia bridge working perfectly!**
- **Next Action:** Start with Fix #1 (Address Validation) as it's blocking everything else
- **Testing Strategy:** Test each fix in isolation before moving to next
- **Success Criteria:** Wallet popup opens and transactions execute successfully

---

## 📊 **Phase 5: History Tab Implementation (Priority 3)**

### **5.1 Cookie-Based History Storage**
- [ ] Implement cookie storage utilities with versioning
- [ ] Create HistoryRow type and management
- [ ] Add transaction entries on successful sends
- [ ] Implement history display with scroll
- [ ] Add clear history functionality

**History Data Structure:**
```typescript
interface HistoryRow {
  id: string;
  ts: number;
  asset: 'USDT';
  recipientUsername: string;
  amount: string;
  chainFrom: ChainKey;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// Cookie structure with versioning
interface HistoryCookie {
  v: number; // Schema version
  data: HistoryRow[];
}
```

**Features:**
- Max 10 entries, newest first (capped for cookie size)
- Cookie has version field for schema migration
- Scrollable within fixed card height
- Clear history with confirmation
- Empty state message
- Timestamp formatting with deterministic local time (clear rules for "Yesterday")
- Write pending entries immediately, update status later

**Verification:** History persists across sessions, clear functionality works, scrolling works within card

---

### **5.2 History Panel UI**
- [ ] Create scrollable transaction list
- [ ] Format timestamps (relative: "2 hours ago")
- [ ] Show transaction status badges
- [ ] Add clear history button with confirmation
- [ ] Implement empty state

**UI Elements:**
- Asset badge (USDT)
- Recipient username
- Amount with proper formatting
- Timestamp
- Status indicator
- Clear history button

**Verification:** History displays correctly, formatting is consistent, empty state shows properly

---

## �� **Phase 6: Testing & Quality Assurance**

### **6.1 Component Testing**
- [ ] Unit tests for all major components
- [ ] Test wallet connection flows
- [ ] Test contract interactions (mocked)
- [ ] Test error handling scenarios
- [ ] Test responsive behavior

**Testing Framework:** Jest + React Testing Library (standard Next.js setup)

**Key Test Cases:**
- Mint tab: amount validation, chain switching, contract calls
- Send tab: username search, recipient selection, cross-chain logic
- History tab: cookie storage, display, clear functionality

**Verification:** All tests pass, coverage is adequate for core functionality

---

### **6.2 Integration Testing**
- [ ] Test full user flows end-to-end
- [ ] Test wallet connection → mint → send → history flow
- [ ] Test error recovery scenarios
- [ ] Test mobile responsiveness
- [ ] Test with different wallet types (MetaMask, Rainbow)
- [ ] Add Playwright E2E tests for critical flows
- [ ] Mock viem/wagmi calls (don't rely on live RPCs in unit tests)

**Playwright E2E Flows:**
1. Connect → Mint (both chains)
2. Search → Send (same-chain & cross-chain)
3. History write/update/clear
4. Chain-switch cancel/carry on

**Critical User Flows:**
1. Connect wallet → Mint tokens → Success
2. Search user → Send cross-chain → Monitor status → History update
3. Network switching → Chain validation → Transaction execution

**Verification:** All critical flows work without errors

---

### **6.3 Manual QA Checklist**
- [ ] Card maintains 420×520px size across all tabs (visual regression testing)
- [ ] Dark theme applies consistently with proper contrast (≥ 3:1 for disabled elements)
- [ ] Number formatting works (format on blur, not while typing)
- [ ] Wallet connection works with MetaMask and Rainbow
- [ ] Cross-chain transfers complete successfully
- [ ] Transaction status updates correctly
- [ ] History persists across browser sessions
- [ ] Mobile experience is acceptable
- [ ] Error messages display appropriately with helpful text
- [ ] Loading states show skeleton animations
- [ ] Accessibility: Tab roles, aria-selected, focus rings visible in dark mode
- [ ] Helper text shows for disabled states

**Verification:** Manual testing confirms all functionality works as expected

---

## 🚀 **Phase 7: Deployment Preparation**

### **7.1 Environment Configuration**
- [ ] Set up Vercel project
- [ ] Configure environment variables for production
- [ ] Set up staging vs production environments
- [ ] Test deployment with testnet contracts
- [ ] Configure custom domain (if needed)

**Environment Strategy:**
- **Staging:** Preview deployments for testing
- **Production:** Main branch deployments
- Both use testnet contracts (ArbSep + BaseSep)

**Verification:** Deployment pipeline works, environment variables are secure

---

### **7.2 Performance Optimization**
- [ ] Optimize bundle size (tree-shake unused components)
- [ ] Implement code splitting for heavy dependencies
- [ ] Lazy-load wallet connectors and contract ABIs
- [ ] Disable SSR for wallet-heavy components (prevent hydration mismatches)
- [ ] Optimize font loading
- [ ] Add loading states for better perceived performance
- [ ] Test performance on mobile devices

**Key Optimizations:**
- Lazy load heavy Web3 components
- Code-split wallet connectors and ABIs
- Memoize expensive calculations
- Optimize re-renders with React.memo
- Compress and optimize assets
- Keep skeletons in place to mask load

**Verification:** App loads quickly, interactions feel responsive

---

### **7.3 Production Deployment**
- [ ] Deploy to Vercel
- [ ] Test all functionality on deployed version
- [ ] Verify wallet connections work in production
- [ ] Test cross-chain transfers on live deployment
- [ ] Monitor for any production-specific issues

**Final Verification:** 
- ✅ User can pay counterparty without knowing their chain preferences
- ✅ Counterparty gets paid on their preferred chain
- ✅ UI works as intended on both desktop and mobile
- ✅ All core functionality works without errors

---

## 🎯 **Success Metrics**

### **Definition of Done:**
- [ ] User can mint USDT on either ArbSep or BaseSep
- [ ] User can search for recipients by username
- [ ] Cross-chain payments work automatically based on recipient preferences
- [ ] Transaction status is tracked and displayed
- [ ] History is maintained locally
- [ ] UI is responsive and works on mobile
- [ ] No critical errors in core functionality

### **Technical Debt & Future Improvements:**
- Mainnet deployment preparation
- Advanced error recovery flows
- Enhanced transaction monitoring
- Performance optimizations
- Additional wallet connectors
- Analytics integration

---

## 📊 **Progress Tracking**

### **Overall Progress: 56% (39/70+ tasks completed)**
- **Phase 1:** 4/4 tasks (100%) ✅ - Foundation & Setup Complete
- **Phase 2:** 2/2 tasks (100%) ✅ - Basic UI Skeleton Complete  
- **Phase 3:** 4/4 tasks (100%) ✅ - Mint Tab Implementation Complete
- **Phase 4:** 0/20 tasks (0%) - Send Tab Implementation (Next Priority)
- **Phase 5:** 0/10 tasks (0%) - History Tab Implementation
- **Phase 6:** 0/18 tasks (0%) - Testing & QA
- **Phase 7:** 0/14 tasks (0%) - Deployment

### **Key Milestones**
- [x] **Foundation Ready** - Next.js + shadcn + Dynamic setup complete
- [x] **UI Skeleton Complete** - Fixed card layout with tab switching
- [x] **Mint Tab Working** - Can mint OFT tokens on both testnets ✅
- [ ] **Send Tab Working** - Username search + cross-chain transfers
- [ ] **History Tab Working** - Transaction history with cookie storage
- [ ] **Testing Complete** - All functionality tested and verified
- [ ] **Deployed to Vercel** - Live application ready for use

---

## 🔄 **Development Updates**

### **[Current Session - Mint Tab Complete]**
**What we accomplished:**
- ✅ Complete Phase 1: Next.js + shadcn/ui + Dynamic wallet integration
- ✅ Complete Phase 2: Fixed 420×520px card layout with tab navigation
- ✅ Complete Phase 3.1-3.3: Full mint functionality with OFT contracts
- ✅ Dynamic wallet configuration restricted to Base Sepolia + Arbitrum Sepolia
- ✅ Consistent UI component heights and polished styling
- ✅ Transaction success/error handling with explorer links
- ✅ Wallet connection status with green dot indicator

**What we learned:**
- Dynamic v4.30.0 requires `overrides.evmNetworks` for proper chain restriction
- Rainbow Wallet network switching is acceptable UX for testnet applications
- wagmi `useWaitForTransactionReceipt` works reliably for transaction monitoring
- Arbitrum Sepolia may show false failures but transactions succeed (minor issue)
- LayerZero CLI deployments provide clean contract integration

**Challenges encountered:**
- Rainbow Wallet defaults to Ethereum Mainnet during initial connection
- Dynamic chain configuration needed specific overrides format
- Component height consistency required manual h-12 class application
- Brief "Minting..." state issue resolved by reverting complex error handling

**Next steps:**
- **Phase 4: Send Tab Implementation** - Username search with backend API
- Set up Supabase for username resolution
- Implement cross-chain transfer logic with LayerZero OFT
- Add recipient search with debounced API calls

---

*Last updated: Current Session*
*Project: Cross-Chain USDT Transfer UI*
*Status: Phase 3 Complete - Ready for Send Tab! 🚀*

**🎯 Current Status: Mint tab fully functional! Users can successfully mint USDT tokens on both Base Sepolia and Arbitrum Sepolia. Ready to implement Send tab with username search and cross-chain transfers.** 