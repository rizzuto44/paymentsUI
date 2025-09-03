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
- [ ] Create Next.js 14+ project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Set up dark theme as default
- [ ] Configure Inter font family
- [ ] Set up basic folder structure

**Commands:**
```bash
cd frontend/
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

**Status:** ⏳ Pending  
**Lessons Learned:**  
**Notes:**

**Verification:** Basic Next.js app runs on localhost:3000

---

### **1.2 shadcn/ui Setup**
- [ ] Initialize shadcn/ui with dark theme
- [ ] Install required components: Card, Tabs, Button, Input, Select, Badge, Toast, Skeleton, ScrollArea, Command
- [ ] Test component rendering with dark theme
- [ ] Set up Sonner for toast notifications

**Commands:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card tabs button input select badge toast skeleton scroll-area command
npm install sonner
```

**Status:** ⏳ Pending  
**Lessons Learned:**  
**Notes:**

**Verification:** All shadcn components render correctly with dark theme

---

### **1.3 Web3 Stack Installation**
- [ ] Install wagmi v2 + viem
- [ ] Install Dynamic wallet packages (MetaMask + Rainbow connectors)
- [ ] Install Supabase client and Zod for validation
- [ ] Set up environment variables for Dynamic
- [ ] Configure wagmi for ArbSep + BaseSep testnets

**Packages to install:**
```bash
npm install wagmi viem @supabase/supabase-js zod
# Dynamic packages - user will provide exact packages
```

**Environment Variables:**
```bash
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=user_provided_id
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

**Status:** ⏳ Pending  
**Lessons Learned:**  
**Notes:**

**Verification:** Wallet connection modal appears and connects to MetaMask/Rainbow

---

### **1.4 Constants Configuration**
- [ ] Create `constants.ts` with chain IDs, LayerZero EIDs, RPC URLs, token decimals
- [ ] Add UI constants (debounce timing, max history rows, cookie keys)
- [ ] Set up strongly typed configuration
- [ ] Use LayerZero CLI deployment addresses only (remove old Hardhat deployments)

**Constants Structure:**
```typescript
export const CONSTANTS = {
  CHAINS: { BASE_SEPOLIA: {...}, ARBITRUM_SEPOLIA: {...} },
  TOKEN: { DECIMALS: 6, SYMBOL: 'USDT' },
  UI: { DEBOUNCE_MS: 300, MAX_HISTORY_ROWS: 10, COOKIE_KEY: 'oft_history' }
} as const;
```

**Status:** ⏳ Pending  
**Lessons Learned:**  
**Notes:**

**Verification:** Constants are properly typed and accessible throughout the app

---

## 🏗️ **Phase 2: Basic UI Skeleton**

### **2.1 Fixed Card Layout**
- [ ] Create centered container with 420×520px card
- [ ] Implement three-tab structure: Send | Mint | History
- [ ] Set up tab switching functionality
- [ ] Ensure card never resizes between tabs
- [ ] Test responsive behavior on mobile

**Key Component:**
```typescript
<Card className="w-[420px] h-[520px] shadow-lg">
  <CardHeader>
    <Tabs defaultValue="mint">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="send">Send</TabsTrigger>
        <TabsTrigger value="mint">Mint</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
    </Tabs>
  </CardHeader>
  <CardContent className="flex-1 overflow-hidden">
    {/* Tab content here */}
  </CardContent>
  <CardFooter>
    {/* Dynamic CTA button */}
  </CardFooter>
</Card>
```

**Status:** ⏳ Pending  
**Lessons Learned:**  
**Notes:**

**Verification:** Card maintains fixed size, tabs switch correctly, looks good on desktop and mobile

---

### **2.2 Basic Tab Panels (Placeholders)**
- [ ] Create empty MintPanel component
- [ ] Create empty SendPanel component  
- [ ] Create empty HistoryPanel component
- [ ] Add placeholder content for each tab
- [ ] Test tab navigation

**Verification:** All tabs are accessible and show placeholder content

---

## 🪙 **Phase 3: Mint Tab Implementation (Priority 1)**

### **3.1 Contract Integration Setup**
- [ ] Load OFT contract addresses from LayerZero CLI deployments only
- [ ] Create contract configuration utilities
- [ ] Set up ABI imports for OFT contracts
- [ ] Create network configuration (ArbSep + BaseSep)
- [ ] Remove all references to old Hardhat deployment contracts

**Contract Loading Strategy:**
```typescript
// Load from LayerZero CLI deployments only
import { CONSTANTS } from '../constants';

export const CONTRACTS = {
  base: { USDT_OFT: '0x...' }, // From LayerZero CLI deployment
  arbitrum: { USDT_OFT: '0x...' } // From LayerZero CLI deployment
};
```

**Status:** ⏳ Pending  
**Lessons Learned:**  
**Notes:**

**Verification:** Contract addresses load correctly, network configs are valid

---

### **3.2 Mint Panel UI Components**
- [ ] Token selector (USDT only, disabled)
- [ ] Network selector (Base Sepolia | Arbitrum Sepolia)
- [ ] Amount input with dynamic number formatting
- [ ] Wallet connection status indicator
- [ ] Dynamic CTA button (Connect/Switch/Mint states)

**Number Input Handling:**
- Plain numeric input, format with commas on blur (not while typing)
- Convert to BigInt at call time, never keep floats in state
- Handle decimal precision properly (6 decimals for USDT)

**Button States:**
- Disconnected: "Connect Wallet"
- Wrong chain: "Switch to [Network]"
- Ready: "Mint [Amount] USDT"
- Processing: "Minting..." with skeleton

**Verification:** All UI components render, number formatting works, button states change correctly

---

### **3.3 Mint Functionality**
- [ ] Implement wallet connection with Dynamic
- [ ] Add chain switching functionality (keep form state after switch)
- [ ] Implement mint contract call (OFT mint/burn, no approvals needed)
- [ ] Add transaction success/error handling
- [ ] Handle wallet cancellation gracefully
- [ ] Show transaction hash in success toast
- [ ] Add skeleton loading states

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

**Verification:** Can mint tokens on both networks, success/error states work, explorer links are correct

---

### **3.4 Mint Tab Testing**
- [ ] Write unit tests for MintPanel component
- [ ] Test wallet connection flows
- [ ] Test chain switching
- [ ] Test contract interactions (mocked)
- [ ] Test error scenarios

**Verification:** All mint functionality works end-to-end, tests pass

---

## 📤 **Phase 4: Send Tab Implementation (Priority 2)**

### **4.1 Username Backend Setup**
- [ ] Set up Supabase project for username storage
- [ ] Create users table schema
- [ ] Set up API routes for username resolution
- [ ] Implement search endpoint with prefix matching
- [ ] Add mock data for testing

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
- [ ] Asset & Network selector (USDT on Base | USDT on Arbitrum)
- [ ] Username search with shadcn Command component and debounced API calls
- [ ] Amount input with dynamic formatting
- [ ] Selected recipient confirmation UI
- [ ] Send button with proper validation

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

### **4.3 Cross-Chain Send Logic**
- [ ] Implement LayerZero OFT send functionality
- [ ] Handle same-chain vs cross-chain transfers
- [ ] Add gas estimation and preflight checks
- [ ] Implement transaction monitoring
- [ ] Add transaction history tracking

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

## 🧪 **Phase 6: Testing & Quality Assurance**

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

### **Overall Progress: 0% (0/70+ tasks completed)**
- **Phase 1:** 0/16 tasks (0%) - Foundation & Setup (added Constants task)
- **Phase 2:** 0/8 tasks (0%) - Basic UI Skeleton  
- **Phase 3:** 0/16 tasks (0%) - Mint Tab Implementation
- **Phase 4:** 0/20 tasks (0%) - Send Tab Implementation (expanded with UX improvements)
- **Phase 5:** 0/10 tasks (0%) - History Tab Implementation (added versioning)
- **Phase 6:** 0/18 tasks (0%) - Testing & QA (added Playwright E2E)
- **Phase 7:** 0/14 tasks (0%) - Deployment (added performance optimizations)

### **Key Milestones**
- [ ] **Foundation Ready** - Next.js + shadcn + Dynamic setup complete
- [ ] **UI Skeleton Complete** - Fixed card layout with tab switching
- [ ] **Mint Tab Working** - Can mint MYOFT tokens on both testnets
- [ ] **Send Tab Working** - Username search + cross-chain transfers
- [ ] **History Tab Working** - Transaction history with cookie storage
- [ ] **Testing Complete** - All functionality tested and verified
- [ ] **Deployed to Vercel** - Live application ready for use

---

## 🔄 **Development Updates**

### **[Date: TBD]**
**What we accomplished:**
**What we learned:**
**Challenges encountered:**
**Next steps:**

---

*Last updated: [Date]*
*Project: Cross-Chain USDT Transfer UI*
*Status: Ready to Begin Development! 🚀*

**🚀 Ready to start building! This checklist ensures zero errors and perfect alignment with your requirements. Let's begin with Phase 1! 🎨** 