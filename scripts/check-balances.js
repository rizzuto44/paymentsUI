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
  }
};

// OFT ABI (simplified)
const OFT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

async function checkBalances() {
  console.log("💰 Current Balance Check");
  console.log("========================\n");

  try {
    // Set up providers and contracts
    const arbProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.arbitrum.rpc);
    const ethProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.ethereum.rpc);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    
    const arbWallet = wallet.connect(arbProvider);
    const ethWallet = wallet.connect(ethProvider);
    
    const arbContract = new ethers.Contract(CONTRACTS.arbitrum.address, OFT_ABI, arbWallet);
    const ethContract = new ethers.Contract(CONTRACTS.ethereum.address, OFT_ABI, ethWallet);
    
    // Get contract info
    const arbName = await arbContract.name();
    const ethName = await ethContract.name();
    const arbSymbol = await arbContract.symbol();
    const ethSymbol = await ethContract.symbol();
    
    console.log(`📋 Contract Info:`);
    console.log(`   Arbitrum: ${arbName} (${arbSymbol}) - ${CONTRACTS.arbitrum.address}`);
    console.log(`   Ethereum: ${ethName} (${ethSymbol}) - ${CONTRACTS.ethereum.address}`);
    console.log(`   Wallet: ${wallet.address}\n`);
    
    // Check balances
    const arbBalance = await arbContract.balanceOf(wallet.address);
    const ethBalance = await ethContract.balanceOf(wallet.address);
    const arbTotalSupply = await arbContract.totalSupply();
    const ethTotalSupply = await ethContract.totalSupply();
    
    console.log(`💰 Your Balances:`);
    console.log(`   Arbitrum: ${ethers.utils.formatUnits(arbBalance, 6)} USDT`);
    console.log(`   Ethereum: ${ethers.utils.formatUnits(ethBalance, 6)} USDT\n`);
    
    console.log(`📊 Total Supply:`);
    console.log(`   Arbitrum: ${ethers.utils.formatUnits(arbTotalSupply, 6)} USDT`);
    console.log(`   Ethereum: ${ethers.utils.formatUnits(ethTotalSupply, 6)} USDT\n`);
    
    // Calculate what we expect based on transfers
    console.log(`🧮 Expected vs Actual:`);
    console.log(`   Expected after all transfers:`);
    console.log(`     Arbitrum: 999,975 USDT (started with 1M, sent 20 total, received 5)`);
    console.log(`     Ethereum: 1,000,015 USDT (started with 1M, received 20 total, sent 5)`);
    console.log(`\n   Current status:`);
    
    const arbExpected = ethers.utils.parseUnits("999975", 6);
    const ethExpected = ethers.utils.parseUnits("1000015", 6);
    
    if (arbBalance.eq(arbExpected) && ethBalance.eq(ethExpected)) {
      console.log(`     🎉 ALL TRANSFERS COMPLETED! Balances match perfectly.`);
    } else if (arbBalance.lt(ethers.utils.parseUnits("999990", 6))) {
      console.log(`     ⏳ Some Arbitrum → Ethereum messages still pending delivery`);
    } else if (ethBalance.lt(ethExpected) || arbBalance.gt(arbExpected)) {
      console.log(`     ⏳ Some messages still being processed`);
    }
    
  } catch (error) {
    console.log(`❌ Balance check failed: ${error.message}`);
  }
}

checkBalances(); 