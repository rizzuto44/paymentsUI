# **USD Demo UI Spec**

## **Framework and Styling**

`Framework: Next.js + TypeScript`  
`Styling: Tailwind + shadcn/ui`  
`EVM libs: wagmi + viem`  
`Username search: backend API`  
`History: stored in cookies (not localStorage)`  
`Layout rule: one fixed-size card, centered, never resizes`  
`Tabs: three text tabs → Send | Mint | History`

---

## **Layout Structure**

`<AppPage>`  
  `<CenteredContainer>`  
    `<Card class="w-[420px] h-[520px]">`  
      `<CardHeader>`  
        `<TabsList variant="text">`  
          `<TabsTrigger value="send">Send</TabsTrigger>`  
          `<TabsTrigger value="mint">Mint</TabsTrigger>`  
          `<TabsTrigger value="history">History</TabsTrigger>`  
        `</TabsList>`  
      `</CardHeader>`

      `<CardContent>`  
        `<TabsContent value="send"><SendPanel /></TabsContent>`  
        `<TabsContent value="mint"><MintPanel /></TabsContent>`  
        `<TabsContent value="history"><HistoryPanel /></TabsContent>`  
      `</CardContent>`

      `<CardFooter>`  
        `<!-- Each tab controls its own CTA button here -->`  
      `</CardFooter>`  
    `</Card>`  
  `</CenteredContainer>`  
`</AppPage>`

---

## **Core Components (shadcn/ui)**

`Card, Tabs, TabsList, TabsTrigger, TabsContent`  
`Button, Select, SelectTrigger, SelectItem`  
`Input, Command, CommandInput, CommandList, CommandItem`  
`Badge, Separator, Toast, ScrollArea, Tooltip, Skeleton`

---

## **Shared Types**

`type ChainKey = "base" | "arbitrum";`  
`type AssetKey = "USDT";`

`type UsernameRecord = {`  
  `username: string;`  
  ``ownerAddress: `0x${string}`;``  
  `preferredDstEid: number;`  
  `chainKey?: ChainKey;`  
`};`

`type SearchResult = UsernameRecord[];`

`type HistoryRow = {`  
  `id: string;`  
  `ts: number;`  
  `asset: AssetKey;`  
  `recipientUsername: string;`  
  `amount?: string;`  
  `chainFrom?: ChainKey;`  
`};`

---

# **Tab 1: Send**

### **UI Layout**

`Tabs: Send | Mint | History`

`Send`  
`──────────────────────────────`  
`Asset`  
`▼ [ USDT ]          (Select)`

`Network`  
`[ Base ]            (Badge, auto-derived)`

`Recipient`  
`[ search input… ]   (Command + suggestions)`  
  `- jacob`  
  `- jaclyn`  
  `- jack`  
`✓ shows when selected`

`───────────────────`

`[ Send ] (primary button)`

### **Behavior**

* Asset select: `USDT` only. Choosing asset sets network indicator automatically.

* Network indicator: badge, read-only.

* Recipient search:

  * Debounce API call (250–400ms).

  * Prefix match, show suggestions.

  * Selecting fills the field, locks in, shows checkmark.

* Send button: enabled only if asset selected, network derived, and recipient selected.

### **API Contract**

`GET /resolve?prefix=<string>&limit=10`  
`→ returns SearchResult[]`

---

# **Tab 2: Mint**

### **UI Layout**

`Tabs: Send | Mint | History`

`Mint`  
`──────────────────────────────`  
`Token`  
`▼ [ USDT ]              (Select)`

`Network`  
`▼ [ Base | Arbitrum ]   (Select)`

`Quantity`  
`[ 0.00 ]                (Numeric input)`

`───────────────────`

`[ Mint ] (primary button)`

### **Behavior**

* Token select: USDT only.

* Network select: Base or Arbitrum.

* Quantity input: must be \> 0, numeric, decimals enforced.

* CTA button states:

  * If wallet disconnected → “Connect Wallet”

  * If wrong chain → “Switch to Base/Arbitrum”

  * Otherwise → “Mint”

* On success: toast \+ explorer link.

### **Contract Call**

`await writeContract({`  
  `address: CONTRACTS[network].USDT_OFT,`  
  `abi: USDT_OFT_ABI,`  
  `functionName: 'mint',`  
  `args: [ userAddress, parseUnits(amount, tokenDecimals) ],`  
`});`

---

# **Tab 3: History**

### **UI Layout**

`Tabs: Send | Mint | History`

`History`  
`──────────────────────────────`  
`Recent sends (this device)`

`┌─────────────────────────────┐`  
`| USDT → jacob  | 12.00 | 10:42 |`  
`| USDT → jack   |  5.50 | 09:13 |`  
`| USDT → alice  |  1.00 | Yesterday |`  
`└─────────────────────────────┘`

`[ Clear history ]`

### **Behavior**

* Stores only outgoing sends, in cookies.

* Cookie key: `oft_history` → JSON array of HistoryRow.

* Max entries: 50\. Newest at top.

* Clear history: confirm modal, wipe cookie.

* Empty state: “No outgoing transfers yet on this device.”

---

## **States & Validation**

### **Send**

`Disabled if: no asset OR no network OR no recipient`  
`Recipient states:`  
`- idle (placeholder)`  
`- typing (loading skeleton)`  
`- results (list)`  
`- selected (locked + checkmark)`  
`- error (inline message)`

### **Mint**

`Disabled if: wallet disconnected, wrong chain, no token, no network, invalid quantity`  
`Loading state: spinner in button, disabled`

### **History**

`Scrollable table inside fixed card`  
`Clear history → confirm modal`  
`Empty state message`

---

## **Accessibility**

`Tabs focusable, arrow-key navigation`  
`Inputs labeled with <Label htmlFor>`  
`Buttons use aria-disabled`  
`Command list: Esc closes, Enter selects`

---

## **Styling**

`Card: w-[420px] h-[520px]`  
`Tabs: text labels, underline when active`  
`Badges: variant="secondary"`  
`Spacing: consistent gap-3 vertical rhythm`  
`ScrollArea: lists and tables scroll inside fixed card`  
`Buttons: solid primary; disabled 60% opacity, pointer-events-none`

---

## **Component Signatures**

`function AppCard() { /* Tabs + Card wrapper */ }`

`function SendPanel() {`  
  `// Select(Asset), Badge(Network), Command(Recipient), Button(Send)`  
`}`

`function MintPanel() {`  
  `// Select(Token), Select(Network), Input(Quantity), Button(Mint)`  
`}`

`function HistoryPanel() {`  
  `// ScrollArea(Table of HistoryRow), Button(Clear history)`  
`}`

---

## **Event Flows**

### **Send**

`Validate inputs`  
`If valid: toast “Send initiated” (scaffold)`  
`Later: call OFT send and push HistoryRow cookie`

### **Mint**

`Switch chain if needed`  
`Call mint()`  
`Toast with explorer link`

### **History**

`Clear history → confirm modal`  
`On confirm: wipe cookie + re-render empty state`

---

## **QA Checklist**

`Card size never changes between tabs`  
`Send tab: asset → network badge, recipient search works, button enables/disables`  
`Mint tab: validation, chain switch flow, tx toast`  
`History tab: shows cookie data, scrolls correctly, clear wipes`  
`Accessibility: focus rings, labels, keyboard nav`

