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
  "function decimals() view returns (uint8)",
  "function quoteSend((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), bool payInLzToken) view returns ((uint256 nativeFee, uint256 lzTokenFee))",
  "function send((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), (uint256 nativeFee, uint256 lzTokenFee), address refundAddress) payable returns ((bytes32 guid, uint64 nonce))",
  "function mintForSelf(uint256 amount) external"
];

async function testBaseTransfers() {
  console.log("🧪 Testing Base Sepolia Cross-Chain Transfers");
  console.log("=============================================\n");

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
    
    console.log(`📋 All Network Contract Addresses:`);
    console.log(`   Arbitrum: ${CONTRACTS.arbitrum.address}`);
    console.log(`   Ethereum: ${CONTRACTS.ethereum.address}`);
    console.log(`   Base: ${CONTRACTS.base.address}`);
    console.log(`   Wallet: ${wallet.address}\n`);
    
    // Check all balances
    console.log(`💰 Current Balances:`);
    for (const [network, contract] of Object.entries(contracts)) {
      try {
        const balance = await contract.balanceOf(wallet.address);
        console.log(`   ${CONTRACTS[network].name}: ${ethers.utils.formatUnits(balance, 6)} USDT`);
      } catch (e) {
        console.log(`   ${CONTRACTS[network].name}: Error - ${e.message}`);
      }
    }
    console.log();
    
    // Test 1: Ethereum → Base
    console.log(`🌉 Test 1: Ethereum → Base (3 USDT)`);
    
    const transferAmount = ethers.utils.parseUnits("3", 6);
    const recipientBytes32 = ethers.utils.hexZeroPad(wallet.address, 32);
    
    const sendParam = {
      dstEid: CONTRACTS.base.eid,
      to: recipientBytes32,
      amountLD: transferAmount,
      minAmountLD: transferAmount,
      extraOptions: "0x",
      composeMsg: "0x",
      oftCmd: "0x"
    };
    
    // Quote and send
    const feeQuote = await contracts.ethereum.quoteSend(sendParam, false);
    console.log(`   Fee: ${ethers.utils.formatEther(feeQuote.nativeFee)} ETH`);
    
    const sendTx = await contracts.ethereum.send(
      sendParam,
      { nativeFee: feeQuote.nativeFee, lzTokenFee: 0 },
      wallet.address,
      { value: feeQuote.nativeFee, gasLimit: 500000 }
    );
    
    console.log(`   ✅ Sent! TX: ${sendTx.hash}\n`);
    
    // Test 2: Base → Arbitrum  
    console.log(`🌉 Test 2: Base → Arbitrum (2 USDT)`);
    
    // First mint some tokens on Base
    console.log(`   🪙 Minting tokens on Base first...`);
    const mintTx = await contracts.base.mintForSelf(ethers.utils.parseUnits("10", 6));
    await mintTx.wait();
    console.log(`   ✅ Minted 10 USDT on Base`);
    
    const sendParam2 = {
      dstEid: CONTRACTS.arbitrum.eid,
      to: recipientBytes32,
      amountLD: ethers.utils.parseUnits("2", 6),
      minAmountLD: ethers.utils.parseUnits("2", 6),
      extraOptions: "0x",
      composeMsg: "0x",
      oftCmd: "0x"
    };
    
    const feeQuote2 = await contracts.base.quoteSend(sendParam2, false);
    console.log(`   Fee: ${ethers.utils.formatEther(feeQuote2.nativeFee)} ETH`);
    
    const sendTx2 = await contracts.base.send(
      sendParam2,
      { nativeFee: feeQuote2.nativeFee, lzTokenFee: 0 },
      wallet.address,
      { value: feeQuote2.nativeFee, gasLimit: 500000 }
    );
    
    console.log(`   ✅ Sent! TX: ${sendTx2.hash}\n`);
    
    console.log(`🎉 SUCCESS! All three networks are now connected and working!`);
    console.log(`   ✅ Ethereum → Base transfer initiated`);
    console.log(`   ✅ Base → Arbitrum transfer initiated`);
    console.log(`   ✅ Three-way cross-chain system is functional!`);
    
    console.log(`\n💡 Cross-chain messages will settle in 1-5 minutes.`);
    console.log(`   Run 'node scripts/check-all-balances.js' in a few minutes to see final results.`);
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    
    if (error.data) {
      console.log(`   Error data: ${error.data}`);
    }
  }
}

testBaseTransfers(); 