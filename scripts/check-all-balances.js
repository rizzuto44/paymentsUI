const { ethers } = require("ethers");
require('dotenv').config();

// Contract addresses from deployment
const CONTRACTS = {
  arbitrum: {
    name: "Arbitrum Sepolia",
    address: "0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a",
    eid: 40231,
    rpc: "https://sepolia-rollup.arbitrum.io/rpc"
  },
  ethereum: {
    name: "Ethereum Sepolia", 
    address: "0x862c21F0987A61a9A0c9239Dc2fC0926412B3Ea4",
    eid: 40161,
    rpc: "https://ethereum-sepolia.publicnode.com"
  },
  base: {
    name: "Base Sepolia",
    address: "0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008",
    eid: 40245,
    rpc: "https://sepolia.base.org"
  }
};

// OFT ABI (simplified)
const OFT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

async function checkAllBalances() {
  console.log("💰 Complete Three-Network Balance Check");
  console.log("=======================================\n");

  try {
    // Set up providers and contracts
    const providers = {
      arbitrum: new ethers.providers.JsonRpcProvider(CONTRACTS.arbitrum.rpc),
      ethereum: new ethers.providers.JsonRpcProvider(CONTRACTS.ethereum.rpc),
      base: new ethers.providers.JsonRpcProvider(CONTRACTS.base.rpc)
    };
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const wallets = {
      arbitrum: wallet.connect(providers.arbitrum),
      ethereum: wallet.connect(providers.ethereum),
      base: wallet.connect(providers.base)
    };
    
    const contracts = {
      arbitrum: new ethers.Contract(CONTRACTS.arbitrum.address, OFT_ABI, wallets.arbitrum),
      ethereum: new ethers.Contract(CONTRACTS.ethereum.address, OFT_ABI, wallets.ethereum),
      base: new ethers.Contract(CONTRACTS.base.address, OFT_ABI, wallets.base)
    };
    
    console.log(`📋 Three-Network USDT System:`);
    console.log(`   Arbitrum: ${CONTRACTS.arbitrum.address}`);
    console.log(`   Ethereum: ${CONTRACTS.ethereum.address}`);
    console.log(`   Base: ${CONTRACTS.base.address}`);
    console.log(`   Wallet: ${wallet.address}\n`);
    
    // Check all balances and total supplies
    const balances = {};
    const totalSupplies = {};
    
    console.log(`💰 Current Balances & Total Supplies:`);
    console.log("─".repeat(50));
    
    for (const [network, contract] of Object.entries(contracts)) {
      try {
        const balance = await contract.balanceOf(wallet.address);
        const totalSupply = await contract.totalSupply();
        const name = await contract.name();
        const symbol = await contract.symbol();
        
        balances[network] = balance;
        totalSupplies[network] = totalSupply;
        
        console.log(`   ${CONTRACTS[network].name}:`);
        console.log(`     Your Balance: ${ethers.utils.formatUnits(balance, 6)} ${symbol}`);
        console.log(`     Total Supply: ${ethers.utils.formatUnits(totalSupply, 6)} ${symbol}`);
        console.log();
        
      } catch (e) {
        console.log(`   ${CONTRACTS[network].name}: ❌ Error - ${e.message}\n`);
      }
    }
    
    // Calculate expected balances based on all transfers
    console.log(`🧮 Transfer Summary & Expected vs Actual:`);
    console.log("─".repeat(50));
    console.log(`   Transfers made:`);
    console.log(`     Arbitrum → Ethereum: 20 USDT (2 transfers of 10 each)`);
    console.log(`     Ethereum → Arbitrum: 5 USDT (1 transfer)`);
    console.log(`     Ethereum → Base: 3 USDT (1 transfer)`);
    console.log(`     Base → Arbitrum: 2 USDT (1 transfer)`);
    console.log();
    
    // Expected final balances (assuming all messages settle)
    const expected = {
      arbitrum: 1000000 - 20 + 5 + 2, // Started 1M, sent 20, received 5+2
      ethereum: 1000000 + 20 - 5 - 3, // Started 1M, received 20, sent 5+3  
      base: 1000000 + 10 + 3 - 2 // Started 1M, minted 10, received 3, sent 2
    };
    
    console.log(`   Expected final balances (when all settle):`);
    console.log(`     Arbitrum: ${expected.arbitrum.toLocaleString()} USDT`);
    console.log(`     Ethereum: ${expected.ethereum.toLocaleString()} USDT`);
    console.log(`     Base: ${expected.base.toLocaleString()} USDT`);
    console.log();
    
    // Status check
    let allSettled = true;
    console.log(`📊 Settlement Status:`);
    
    for (const [network, balance] of Object.entries(balances)) {
      const actual = parseFloat(ethers.utils.formatUnits(balance, 6));
      const expectedVal = expected[network];
      
      if (Math.abs(actual - expectedVal) < 0.001) {
        console.log(`   ${CONTRACTS[network].name}: ✅ SETTLED (${actual.toLocaleString()} USDT)`);
      } else {
        console.log(`   ${CONTRACTS[network].name}: ⏳ PENDING (${actual.toLocaleString()} USDT, expecting ${expectedVal.toLocaleString()})`);
        allSettled = false;
      }
    }
    
    console.log();
    
    if (allSettled) {
      console.log(`🎉 ALL CROSS-CHAIN MESSAGES HAVE SETTLED!`);
      console.log(`   Your three-network USDT system is fully functional! 🚀`);
    } else {
      console.log(`⏳ Some cross-chain messages are still in transit.`);
      console.log(`   This is normal on testnets. Check again in a few minutes.`);
    }
    
  } catch (error) {
    console.log(`❌ Balance check failed: ${error.message}`);
  }
}

checkAllBalances(); 