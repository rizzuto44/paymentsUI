# Frontend Specification v2 - Cross-Chain USDT Transfer UI

## 🎯 **Project Overview**

**Goal:** Build a sleek, user-friendly web interface for cross-chain USDT transfers using our deployed LayerZero OFT contracts on Base and Arbitrum testnets.

**Core Value Proposition:** 
- Send USDT to users by username (no need to know wallet addresses)
- Seamless cross-chain transfers between Base and Arbitrum using OFT contracts
- Simple, card-based UI that fits everything in one fixed-size interface
- Local transaction history for user convenience (last 10 transfers)

**Token Representation:** Frontend displays "USDT" but interacts with our deployed OFT contracts (from LayerZero CLI deployment) on both networks.

**Network Selection Logic:** User selects USDT asset on either Base or Arbitrum, which determines the sending network. Recipient's chain preference is handled automatically by the cross-chain logic without user awareness.

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Framework:** Next.js 14+ with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Web3 Integration:** wagmi v2 + viem for Ethereum interactions
- **Wallet Integration:** Dynamic for wallet connection and management
- **State Management:** React hooks + Context API
- **Data Persistence:** Cookies for history (not localStorage for better cross-device experience)
- **API Integration:** Custom backend for username resolution

### **Key Design Principles**
1. **Fixed Layout:** Single card (420×520px) that never resizes
2. **Tab-Based Navigation:** Send | Mint | History
3. **Progressive Enhancement:** Works without wallet, shows connect prompts when needed
4. **Responsive Feedback:** Loading states, success/error toasts, real-time validation

---

## 🎨 **UI/UX Design System**

### **Layout Hierarchy**
```typescript
<AppPage>
  <CenteredContainer className="min-h-screen flex items-center justify-center">
    <Card className="w-[420px] h-[520px] shadow-lg">
      <CardHeader className="pb-4">
        <Tabs defaultValue="send" className="w-full">
          <TabsList variant="text" className="grid w-full grid-cols-3">
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <TabsContent value="send"><SendPanel /></TabsContent>
        <TabsContent value="mint"><MintPanel /></TabsContent>
        <TabsContent value="history"><HistoryPanel /></TabsContent>
      </CardContent>
      
      <CardFooter className="pt-4">
        {/* Dynamic CTA button area controlled by active tab */}
      </CardFooter>
    </Card>
  </CenteredContainer>
</AppPage>
```

### **Visual Design Language**
- **Color Palette:** Clean, modern with primary brand color
- **Typography:** Inter font family, consistent sizing scale
- **Spacing:** 4px base unit (gap-1 to gap-8)
- **Borders:** Subtle rounded corners (rounded-md, rounded-lg)
- **Shadows:** Soft elevation for card and dropdowns
- **Animations:** Subtle transitions for state changes

---

## 📱 **Tab Specifications**

## **Tab 1: Send Panel**

### **Purpose**
Enable users to send USDT cross-chain to other users by username, automatically determining the optimal network routing.

### **UI Components**
```typescript
function SendPanel() {
  return (
    <div className="space-y-6">
      {/* Asset & Network Selection */}
      <div className="space-y-2">
        <Label htmlFor="asset-select">Asset</Label>
        <Select value={selectedAssetNetwork} onValueChange={setSelectedAssetNetwork}>
          <SelectTrigger id="asset-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base-usdt">USDT (Base)</SelectItem>
            <SelectItem value="arbitrum-usdt">USDT (Arbitrum)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recipient Search */}
      <div className="space-y-2">
        <Label htmlFor="recipient-search">Recipient</Label>
        <Command>
          <CommandInput 
            id="recipient-search"
            placeholder="Search username..."
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isLoading && <CommandItem>Loading...</CommandItem>}
            {searchResults.map(user => (
              <CommandItem 
                key={user.username}
                onSelect={() => selectRecipient(user)}
              >
                {user.username}
                <Badge variant="outline" className="ml-auto">
                  {user.chainKey}
                </Badge>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
        {selectedRecipient && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckIcon className="w-4 h-4" />
            Selected: {selectedRecipient.username}
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount-input">Amount</Label>
        <Input
          id="amount-input"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={handleAmountChange}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
}
```

### **Business Logic**
1. **Asset & Network Selection:** User selects USDT on either Base or Arbitrum, which determines the sending network
2. **Username Search:** 
   - Debounced API calls (300ms delay) with AbortController for cancellation
   - Prefix matching with 10 result limit
   - Ignore out-of-order responses
   - No auto-select on blur - user must explicitly select from suggestions
3. **Amount Input:** Required field with dynamic formatting and validation
4. **Validation:** All fields required before enabling send button
5. **Cross-Chain Logic:** Automatic cross-chain transfer if recipient prefers different network than sender's selection
6. **Gas Preflight:** Check native balance for fees and USDT balance for amount before enabling send

### **API Integration**
```typescript
// Username resolution API
const searchUsers = async (prefix: string): Promise<UsernameRecord[]> => {
  const response = await fetch(`/api/resolve?prefix=${prefix}&limit=10`);
  return response.json();
};
```

---

## **Tab 2: Mint Panel**

### **Purpose**
Allow users to mint USDT tokens on either Base or Arbitrum for testing purposes.

### **UI Components**
```typescript
function MintPanel() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  return (
    <div className="space-y-6">
      {/* Token Selection */}
      <div className="space-y-2">
        <Label htmlFor="token-select">Token</Label>
        <Select value="USDT" disabled>
          <SelectTrigger id="token-select">
            <SelectValue>USDT</SelectValue>
          </SelectTrigger>
        </Select>
      </div>

      {/* Network Selection */}
      <div className="space-y-2">
        <Label htmlFor="network-select">Network</Label>
        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
          <SelectTrigger id="network-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base">Base Sepolia</SelectItem>
            <SelectItem value="arbitrum">Arbitrum Sepolia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <Label htmlFor="quantity-input">Quantity</Label>
        <Input
          id="quantity-input"
          type="text"
          placeholder="0"
          value={displayQuantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur} // Format with commas on blur
        />
      </div>

      {/* Chain Status Indicator */}
      {chain && (
        <div className="text-sm">
          Current network: <Badge variant="outline">{chain.name}</Badge>
        </div>
      )}
    </div>
  );
}
```

### **Smart Contract Integration**
```typescript
const mintTokens = async (amount: string, network: ChainKey) => {
  const contractAddress = CONTRACTS[network].USDT_OFT;
  // Convert to BigInt, never use floats in state
  const parsedAmount = parseUnits(amount, CONSTANTS.TOKEN.DECIMALS);
  
  try {
    // Switch chain if needed
    if (chain?.id !== CONSTANTS.CHAINS[network.toUpperCase() + '_SEPOLIA'].id) {
      await switchChain({ 
        chainId: CONSTANTS.CHAINS[network.toUpperCase() + '_SEPOLIA'].id 
      });
      // Keep form state after chain switch
    }
    
    // Execute mint transaction (OFT mint/burn, no approvals needed)
    const hash = await writeContract({
      address: contractAddress,
      abi: USDT_OFT_ABI,
      functionName: 'mint',
      args: [userAddress, parsedAmount],
    });
    
    // Show success toast with explorer link
    toast.success(
      <div>
        Mint successful! 
        <a href={`${CONSTANTS.CHAINS[network.toUpperCase() + '_SEPOLIA'].explorer}/tx/${hash}`} 
           target="_blank" 
           className="underline ml-2">
          View transaction
        </a>
      </div>
    );
    
  } catch (error) {
    // Handle wallet cancellation gracefully
    if (error.message.includes('User rejected')) {
      toast.error('Transaction cancelled by user');
    } else {
      toast.error(`Mint failed: ${error.message}`);
    }
  }
};
```

### **Button States**
- **Disconnected:** "Connect Wallet" (triggers wallet connection)
- **Wrong Chain:** "Switch to [Network]" (triggers chain switch)
- **Invalid Input:** Disabled with validation message
- **Ready:** "Mint [Amount] USDT"
- **Processing:** "Minting..." with spinner

---

## **Tab 3: History Panel**

### **Purpose**
Display local transaction history for user's outgoing transfers, stored in cookies for persistence across sessions.

### **UI Components**
```typescript
function HistoryPanel() {
  const [history, setHistory] = useLocalHistory();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Recent sends (this device)</h3>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearHistory}
          >
            Clear history
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[300px]">
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No outgoing transfers yet on this device.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{tx.asset}</Badge>
                  <span className="text-sm">→ {tx.recipientUsername}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tx.amount}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(tx.ts)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
```

### **Data Management**
```typescript
// Cookie-based history management
const useLocalHistory = () => {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  
  useEffect(() => {
    const saved = Cookies.get('oft_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check version for schema migration
        if (parsed.v === 1) {
          setHistory(parsed.data || []);
        } else {
          // Wipe old schema
          Cookies.remove('oft_history');
        }
      } catch (error) {
        console.error('Failed to parse history:', error);
        Cookies.remove('oft_history');
      }
    }
  }, []);
  
  const addHistoryEntry = (entry: Omit<HistoryRow, 'id' | 'ts'>) => {
    const newEntry: HistoryRow = {
      ...entry,
      id: crypto.randomUUID(),
      ts: Date.now(),
    };
    
    const updated = [newEntry, ...history].slice(0, 10); // Keep max 10 entries
    setHistory(updated);
    const payload = { v: 1, data: updated };
    Cookies.set('oft_history', JSON.stringify(payload), { expires: 365 });
  };
  
  const clearHistory = () => {
    setHistory([]);
    Cookies.remove('oft_history');
  };
  
  return { history, addHistoryEntry, clearHistory };
};
```

---

## 🔧 **Core Types & Interfaces**

```typescript
// Constants Configuration
export const CONSTANTS = {
  CHAINS: {
    BASE_SEPOLIA: {
      id: 84532,
      name: 'Base Sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL!,
      explorer: 'https://sepolia.basescan.org',
      lzEndpointId: 10247,
    },
    ARBITRUM_SEPOLIA: {
      id: 421614,
      name: 'Arbitrum Sepolia', 
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL!,
      explorer: 'https://sepolia.arbiscan.io',
      lzEndpointId: 10231,
    },
  },
  TOKEN: {
    DECIMALS: 6, // USDT has 6 decimals
    SYMBOL: 'USDT',
  },
  UI: {
    DEBOUNCE_MS: 300,
    MAX_HISTORY_ROWS: 10,
    COOKIE_KEY: 'oft_history',
  },
} as const;

// Network and Asset Types
type ChainKey = 'base' | 'arbitrum';
type AssetKey = 'USDT';

// Username Resolution
interface UsernameRecord {
  username: string;
  ownerAddress: `0x${string}`;
  preferredDstEid: number;
  chainKey: ChainKey;
}

// Transaction History
interface HistoryRow {
  id: string;
  ts: number;
  asset: AssetKey;
  recipientUsername: string;
  amount: string;
  chainFrom: ChainKey;
  txHash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

// Network Configuration
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  lzEndpointId: number;
}

// Contract Configuration
interface ContractConfig {
  USDT_OFT: `0x${string}`;
}
```

---

## 🌐 **Web3 Integration**

### **Dynamic + Wagmi Configuration**
```typescript
import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';

// Dynamic configuration
export const dynamicConfig = {
  environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
  walletConnectors: ['metamask', 'walletconnect', 'coinbase'],
};

// Wagmi configuration for Dynamic
export const wagmiConfig = createConfig({
  chains: [baseSepolia, arbitrumSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
  },
});
```

### **Contract Integration**
```typescript
// Contract addresses from LayerZero CLI deployments
export const CONTRACTS: Record<ChainKey, ContractConfig> = {
  base: {
    USDT_OFT: '0x...', // OFT contract from LayerZero CLI deployment
  },
  arbitrum: {
    USDT_OFT: '0x...', // OFT contract from LayerZero CLI deployment
  },
};

// Network configurations
export const NETWORK_CONFIG: Record<ChainKey, NetworkConfig> = {
  base: {
    chainId: baseSepolia.id,
    name: 'Base Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL!,
    explorer: 'https://sepolia.basescan.org',
    lzEndpointId: 10247,
  },
  arbitrum: {
    chainId: arbitrumSepolia.id,
    name: 'Arbitrum Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL!,
    explorer: 'https://sepolia.arbiscan.io',
    lzEndpointId: 10231,
  },
};
```

---

## 🎯 **User Experience Flows**

### **Send Flow**
1. **Asset & Network Selection:** User selects USDT on Base or Arbitrum
2. **Recipient Search:** Type username → see suggestions → explicitly select user (no auto-select on blur)
3. **Amount Entry:** Input USDT amount with validation
4. **Gas Preflight:** Check native balance for fees and USDT balance for amount
5. **Transaction Execution:** 
   - Same chain: Direct `transfer(recipient, amount)`
   - Cross-chain: LayerZero OFT flow:
     1. Build SendParam with `minAmountLD = amount` (lossless)
     2. Call `quoteSend(param)` to get `fee.nativeFee`
     3. Call `send{ value: fee.nativeFee }(param, fee, refundAddress)` using `msg.sender` for refunds
6. **Status Tracking:** Write pending history entry, update to confirmed/failed
7. **Confirmation:** Toast notification + transaction hash

### **Mint Flow**
1. **Token Selection:** USDT pre-selected
2. **Network Selection:** Choose Base or Arbitrum
3. **Amount Entry:** Input quantity to mint
4. **Chain Validation:** Prompt to switch if on wrong network
5. **Transaction Execution:** Call mint function on selected network
6. **Confirmation:** Success toast with explorer link

### **History Flow**
1. **View History:** See chronological list of outgoing transfers
2. **Entry Details:** Asset, recipient, amount, timestamp
3. **Clear History:** Confirmation modal → wipe local data

---

## 🔒 **Error Handling & Validation**

### **Input Validation**
- **Amount Fields:** Positive numbers, max 6 decimals for USDT
- **Username Search:** Min 2 characters, max 50 characters
- **Network Selection:** Must match available options

### **Web3 Error Handling**
```typescript
const handleWeb3Error = (error: Error) => {
  if (error.message.includes('User rejected')) {
    toast.error('Transaction cancelled by user');
  } else if (error.message.includes('insufficient funds')) {
    toast.error('Insufficient balance for transaction');
  } else if (error.message.includes('network')) {
    toast.error('Network connection error. Please try again.');
  } else {
    toast.error(`Transaction failed: ${error.message}`);
  }
};
```

### **Loading States**
- **Username Search:** Skeleton loader in dropdown
- **Transaction Processing:** Button spinner + disabled state
- **Chain Switching:** Modal overlay with progress indicator

---

## 📱 **Responsive Design**

### **Desktop (Primary)**
- Fixed card size: 420×520px
- Centered on screen with subtle shadow
- Full feature set available

### **Mobile Considerations**
- Card remains fixed size but centers within viewport
- Touch-friendly button sizes (min 44px)
- Proper keyboard handling for inputs
- Swipe gestures for tab navigation (future enhancement)

---

## ♿ **Accessibility Features**

### **Keyboard Navigation**
- Tab order: Tabs → Form fields → Buttons
- Arrow keys for tab navigation
- Enter/Space for button activation
- Escape to close dropdowns/modals

### **Screen Reader Support**
- Semantic HTML structure
- ARIA labels for all interactive elements
- Live regions for dynamic content updates
- Descriptive button text and form labels

### **Visual Accessibility**
- High contrast color ratios (WCAG AA)
- Focus indicators on all interactive elements
- Error messages with clear descriptions
- Loading states with accessible announcements

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Component rendering and prop handling
- Hook behavior and state management
- Utility function validation
- Error handling scenarios

### **Integration Tests**
- Wallet connection flows
- Contract interaction mocking
- API integration testing
- Cross-chain transfer simulation

### **E2E Tests**
- Complete user journeys
- Multi-tab navigation
- Error recovery flows
- History persistence

### **Manual QA Checklist**
- [ ] Card maintains fixed size across all tabs
- [ ] Send tab: asset selection → network derivation → recipient search → amount validation
- [ ] Mint tab: network selection → chain switching → transaction execution
- [ ] History tab: data persistence → clear functionality → empty states
- [ ] Accessibility: keyboard navigation → screen reader compatibility
- [ ] Error handling: network failures → transaction rejections → invalid inputs

---

## 🚀 **Performance Optimization**

### **Bundle Size**
- Tree-shake unused shadcn components
- Lazy load heavy dependencies
- Optimize font loading
- Compress images and assets

### **Runtime Performance**
- Debounced search inputs
- Memoized expensive calculations
- Efficient re-renders with React.memo
- Optimistic UI updates

### **Web3 Optimization**
- Connection state caching
- Contract call batching where possible
- Gas estimation caching
- Transaction status polling optimization

---

## 📋 **Implementation Roadmap**

### **Phase 1: Foundation (Week 1)**
- [ ] Next.js project setup with TypeScript
- [ ] shadcn/ui installation and configuration
- [ ] Basic layout with fixed card and tabs
- [ ] Wagmi configuration for testnet

### **Phase 2: Core Features (Week 2)**
- [ ] Send panel with username search
- [ ] Mint panel with contract integration
- [ ] History panel with cookie storage
- [ ] Basic error handling and validation

### **Phase 3: Polish (Week 3)**
- [ ] Loading states and animations
- [ ] Comprehensive error handling
- [ ] Accessibility improvements
- [ ] Mobile responsiveness testing

### **Phase 4: Testing & Deployment (Week 4)**
- [ ] Unit and integration tests
- [ ] E2E testing with Playwright
- [ ] Performance optimization
- [ ] Vercel deployment configuration

---

## 🔧 **Development Environment**

### **Required Environment Variables**
```bash
# Network RPC URLs
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Dynamic Wallet Integration
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# API Endpoints
NEXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com

# Contract Addresses (MYOFT contracts loaded from deployments/)
NEXT_PUBLIC_BASE_MYOFT_CONTRACT=0x...
NEXT_PUBLIC_ARBITRUM_MYOFT_CONTRACT=0x...
```

### **Supabase Backend Configuration**
```sql
-- Users table with proper indexing and constraints
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  owner_address text NOT NULL,
  preferred_dst_eid integer NOT NULL,
  chain_key text NOT NULL,
  created_at timestamp DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) BETWEEN 3 AND 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$'),
  CONSTRAINT username_lowercase CHECK (username = LOWER(username))
);

-- Index for fast prefix search
CREATE INDEX idx_username_prefix ON users (username text_pattern_ops);
```

**API Implementation:**
```typescript
// Rate-limited search endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix')?.toLowerCase() || '';
  
  if (prefix.length < 2) {
    return Response.json({ users: [], error: 'Minimum 2 characters' });
  }
  
  try {
    const { data } = await supabase
      .from('users')
      .select('username, owner_address, preferred_dst_eid, chain_key')
      .ilike('username', `${prefix}%`)
      .limit(10);
    
    return Response.json({ users: data || [] }, {
      headers: { 'Cache-Control': 'max-age=30' } // 30s cache
    });
  } catch (error) {
    return Response.json({ users: [], error: 'Search failed' });
  }
}
```

### **Package Dependencies**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "wagmi": "^2.0.0",
    "viem": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "cmdk": "^0.2.0",
    "js-cookie": "^3.0.0",
    "sonner": "^1.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "zod": "^3.0.0"
  }
}
```

---

This comprehensive specification provides a complete blueprint for building the cross-chain USDT transfer interface. The design emphasizes simplicity, accessibility, and seamless user experience while leveraging our robust LayerZero infrastructure. 