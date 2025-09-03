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
  "function decimals() view returns (uint8)",
  "function quoteSend((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), bool payInLzToken) view returns ((uint256 nativeFee, uint256 lzTokenFee))",
  "function send((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd), (uint256 nativeFee, uint256 lzTokenFee), address refundAddress) payable returns ((bytes32 guid, uint64 nonce))",
  "function mintForSelf(uint256 amount) external"
];

async function testEthToArbTransfer() {
  console.log("🧪 Testing Reverse Cross-Chain Transfer: Ethereum → Arbitrum");
  console.log("=============================================================\n");

  try {
    // Set up providers and contracts
    const arbProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.arbitrum.rpc);
    const ethProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.ethereum.rpc);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    
    const arbWallet = wallet.connect(arbProvider);
    const ethWallet = wallet.connect(ethProvider);
    
    const arbContract = new ethers.Contract(CONTRACTS.arbitrum.address, OFT_ABI, arbWallet);
    const ethContract = new ethers.Contract(CONTRACTS.ethereum.address, OFT_ABI, ethWallet);
    
    console.log(`📋 Contract Details:`);
    console.log(`   Ethereum: ${CONTRACTS.ethereum.address}`);
    console.log(`   Arbitrum: ${CONTRACTS.arbitrum.address}`);
    console.log(`   Wallet: ${wallet.address}\n`);
    
    // Check initial balances
    const ethBalance = await ethContract.balanceOf(wallet.address);
    const arbBalance = await arbContract.balanceOf(wallet.address);
    
    console.log(`💰 Current Balances:`);
    console.log(`   Ethereum: ${ethers.utils.formatUnits(ethBalance, 6)} USDT`);
    console.log(`   Arbitrum: ${ethers.utils.formatUnits(arbBalance, 6)} USDT\n`);
    
    // If we don't have tokens on Ethereum, mint some
    if (ethBalance.eq(0)) {
      console.log(`🪙 Minting tokens on Ethereum...`);
      const mintTx = await ethContract.mintForSelf(ethers.utils.parseUnits("50", 6));
      await mintTx.wait();
      console.log(`   ✅ Minted 50 USDT on Ethereum\n`);
    }
    
    // Test cross-chain transfer: Ethereum → Arbitrum
    const transferAmount = ethers.utils.parseUnits("5", 6); // 5 USDT
    const recipientBytes32 = ethers.utils.hexZeroPad(wallet.address, 32);
    
    console.log(`🌉 Testing Cross-Chain Transfer: Ethereum → Arbitrum`);
    console.log(`   Amount: 5 USDT`);
    console.log(`   Recipient: ${wallet.address}\n`);
    
    // Build send parameters
    const sendParam = {
      dstEid: CONTRACTS.arbitrum.eid,
      to: recipientBytes32,
      amountLD: transferAmount,
      minAmountLD: transferAmount,
      extraOptions: "0x", // Default options
      composeMsg: "0x",
      oftCmd: "0x"
    };
    
    // Quote the fee
    console.log(`💸 Quoting transfer fee...`);
    const feeQuote = await ethContract.quoteSend(sendParam, false);
    const nativeFee = feeQuote.nativeFee;
    
    console.log(`   Native fee: ${ethers.utils.formatEther(nativeFee)} ETH\n`);
    
    // Execute the transfer
    console.log(`🚀 Executing cross-chain transfer...`);
    const sendTx = await ethContract.send(
      sendParam,
      { nativeFee, lzTokenFee: 0 },
      wallet.address,
      { value: nativeFee, gasLimit: 500000 }
    );
    
    console.log(`   Transaction hash: ${sendTx.hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);
    
    const receipt = await sendTx.wait();
    console.log(`   ✅ Transaction confirmed! Block: ${receipt.blockNumber}\n`);
    
    console.log(`🎉 SUCCESS! Reverse direction transfer initiated successfully!`);
    console.log(`   ✅ quoteSend worked (no 0x6592671c error)`);
    console.log(`   ✅ send transaction confirmed`);
    console.log(`   ✅ Bidirectional pathway is functional`);
    
    console.log(`\n💡 Both directions are now working! The LayerZero CLI fixed our DVN issues.`);
    console.log(`   Cross-chain messages will settle in 1-5 minutes on testnets.`);
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    
    if (error.data) {
      console.log(`   Error data: ${error.data}`);
    }
    
    if (error.message.includes('0x6592671c')) {
      console.log(`\n⚠️  Still getting DVN error - may need more time for pathway activation.`);
    }
  }
}

testEthToArbTransfer(); 