# Frontend Development Questions

*Please answer each question below to ensure I build exactly what you want. Add your responses under each question.*

---

## 🔗 **1. Dynamic Wallet Setup**

### Q1.1: Do you have a Dynamic account/environment ID already?
**Answer:** 

Yes

### Q1.2: Which wallet connectors do you want enabled?
Options: MetaMask, Coinbase Wallet, WalletConnect, Rainbow, Trust Wallet, etc.
**Answer:** 

MetaMask and Rainbow is enough

### Q1.3: Any specific Dynamic configuration preferences?
(Theme colors, modal styles, button appearance, etc.)
**Answer:** 

Nothing, whatever is standard.

---

## 🌐 **2. Backend API for Username Search**

### Q2.1: Do you have a backend API ready for username resolution?
If yes, what's the endpoint? If no, should I mock it for now?
**Answer:** 

I dont. We likely need to set up supabase for this and do all of this work.

### Q2.2: What's the expected API response format?
Example:
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
**Answer:** 

No idea. Need your help here.

### Q2.3: Any authentication required for the username API?
(API keys, CORS settings, etc.)
**Answer:** 

For this demo, not necessary. 

---

## 📄 **3. MYOFT Contract Integration**

### Q3.1: How should I load contract addresses?
- A) Dynamically from `deployments/` folder
- B) Hardcoded in config files  
- C) Environment variables
**Answer:** 

Good question, I dont imagine theyll change for this demo so do whatever is easiest.

### Q3.2: Should the frontend auto-detect optimal network?
(Based on gas fees, liquidity, etc., or let user choose?)
**Answer:** 

No. 

### Q3.3: Cross-chain transfer error handling?
Any specific error messages or recovery flows for LayerZero failures?
**Answer:** 

No. When we call the LZ functions we already need to provide a return address in the event of errors so its fine.

### Q3.4: Token decimals and display format?
How should amounts be formatted? (e.g., "1.50 USDT" vs "1.500000 USDT")
**Answer:** 

The UI should have dynamic number handling where, if I type 100..nothing happens, but as soon as i add a fourth 0, it goes from 100 to 1,000. In terms of decimals, dont show them unless the user types it in. 

---

## 🎨 **4. UI/UX Design Preferences**

### Q4.1: Color scheme preference?
- A) Default shadcn theme
- B) Custom brand colors (provide hex codes)
- C) Specific palette (dark/light preference)
**Answer:** 

DARK

### Q4.2: Font preferences?
Default Inter, or specific font family?
**Answer:** 

Inter is fine for now

### Q4.3: Loading animation style?
- A) Spinners
- B) Skeleton loaders
- C) Progress bars
- D) Custom animations
**Answer:** 

Skeleton

### Q4.4: Success/error notification style?
Toast position, duration, styling preferences?
**Answer:** 

No preferences. We can modify later.

---

## 🔧 **5. Development Approach & Priorities**

### Q5.1: Development sequence preference?
- A) Build all tabs simultaneously
- B) Complete Send tab first, then Mint, then History
- C) Basic functionality first, then polish
**Answer:** 

Build super basic skeleton for each, ability to toggle, and then hammer down the components on each tab one by one. Start with the mint tab.

### Q5.2: Testing environment priority?
Start with testnets and move to mainnet, or prepare for mainnet from start?
**Answer:** 

Only testnets. ArbSep and BaseSep. 

### Q5.3: Performance vs. feature priority?
Focus on core functionality first, or build with all optimizations from start?
**Answer:** 

Core functionality.

---

## 🚨 **6. Error Handling & User Experience**

### Q6.1: Error message detail level?
- A) Technical details for debugging
- B) User-friendly simplified messages
- C) Both (technical in console, friendly to user)
**Answer:** 

I don't really care about error handling for this demo. All I care about is that we sync back the status of a "payment" so the user can see their payment to xyz person was successful. We can do this by reading the blockchain in question and also by reading data from LayerZero Scan. I can figure out how to get you the Scan API later.

### Q6.2: Error logging strategy?
Should errors be logged to console, external service, or both?
**Answer:** 

Console is fine.

### Q6.3: Error recovery flows?
Include retry buttons, alternative paths, or just show error messages?
**Answer:** 

Just show errors.

### Q6.4: Wallet connection failure handling?
How should we handle rejected connections, network switching failures, etc.?
**Answer:** 

Return errors on FE.

---

## 🧪 **7. Testing Strategy**

### Q7.1: Testing approach preference?
- A) Build functionality first, add tests later
- B) Write tests as I build (TDD approach)
- C) Focus on manual testing only
**Answer:** 

Write tests as you go. We want to test each componnent one by one.

### Q7.2: Testing framework preferences?
Any specific preferences beyond standard Next.js testing tools?
**Answer:** 

No.

### Q7.3: E2E testing scope?
Should I include Playwright tests, or focus on unit/integration testing?
**Answer:** 

Whatever you recommend. I mainly just want to test the core functionality.

---

## 📱 **8. Mobile & Responsive Considerations**

### Q8.1: Mobile experience priority?
Should the 420×520px card work well on mobile, or is desktop primary?
**Answer:** 

Desktop primary for this UI, but mobile is also important. 

### Q8.2: Touch interaction preferences?
Any specific mobile UX considerations for the wallet integration?
**Answer:** 

No. 

---

## 🔐 **9. Security & Privacy**

### Q9.1: Data privacy preferences?
Any specific considerations for storing transaction history in cookies?
**Answer:** 

No.

### Q9.2: Wallet security considerations?
Any specific security measures or warnings to include?
**Answer:** 

No.

---

## 📊 **10. Analytics & Monitoring**

### Q10.1: Usage analytics?
Should I include analytics tracking for user interactions?
**Answer:** 

No

### Q10.2: Transaction monitoring?
Any specific monitoring or logging for successful/failed transactions?
**Answer:** 

Yes - mentioned above by reading blockchain in question and LayerZero Scan.

---

## 🚀 **11. Deployment & Environment**

### Q11.1: Deployment target?
Vercel, Netlify, or other platform preferences?
**Answer:** 

Vercel

### Q11.2: Environment management?
How should staging vs. production environments be handled?
**Answer:** 

Idk. Can you advise me?

### Q11.3: Domain and routing?
Any specific routing requirements or domain setup needs?
**Answer:** 

No. We'll use the domain name vercel provides us.

---

## 🎯 **12. Success Criteria**

### Q12.1: Definition of "done"?
What constitutes a successful first version?
**Answer:** 

The UI works as intended. So the user can pay a counterparty without know what the counterparty's chain preferences are, and counterparty is succesfully paid based on their pref, without any consdieration of where the user has assets today.

### Q12.2: Performance benchmarks?
Any specific performance targets (load time, transaction speed, etc.)?
**Answer:** 

No. It just needs to work.

### Q12.3: User acceptance criteria?
How will we know the UI meets user needs?
**Answer:** 

Ill tell you ;)

---

*Once you've answered these questions, I'll create a detailed `frontend-checklist.md` with a step-by-step implementation plan optimized for zero errors and perfect alignment with your requirements.* 