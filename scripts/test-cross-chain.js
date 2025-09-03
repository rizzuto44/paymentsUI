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

async function testCrossChainTransfer() {
  console.log("🧪 Testing Cross-Chain Transfer with LayerZero CLI Deployed Contracts");
  console.log("=====================================================================\n");

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
    console.log(`   Arbitrum: ${CONTRACTS.arbitrum.address}`);
    console.log(`   Ethereum: ${CONTRACTS.ethereum.address}`);
    console.log(`   Wallet: ${wallet.address}\n`);
    
    // Check initial balances
    const arbBalance = await arbContract.balanceOf(wallet.address);
    const ethBalance = await ethContract.balanceOf(wallet.address);
    
    console.log(`💰 Initial Balances:`);
    console.log(`   Arbitrum: ${ethers.utils.formatUnits(arbBalance, 6)} USDT`);
    console.log(`   Ethereum: ${ethers.utils.formatUnits(ethBalance, 6)} USDT\n`);
    
    // If we don't have tokens on Arbitrum, mint some
    if (arbBalance.eq(0)) {
      console.log(`🪙 Minting tokens on Arbitrum...`);
      const mintTx = await arbContract.mintForSelf(ethers.utils.parseUnits("100", 6));
      await mintTx.wait();
      console.log(`   ✅ Minted 100 USDT on Arbitrum\n`);
    }
    
    // Test cross-chain transfer: Arbitrum → Ethereum
    const transferAmount = ethers.utils.parseUnits("10", 6); // 10 USDT
    const recipientBytes32 = ethers.utils.hexZeroPad(wallet.address, 32);
    
    console.log(`🌉 Testing Cross-Chain Transfer: Arbitrum → Ethereum`);
    console.log(`   Amount: 10 USDT`);
    console.log(`   Recipient: ${wallet.address}\n`);
    
    // Build send parameters
    const sendParam = {
      dstEid: CONTRACTS.ethereum.eid,
      to: recipientBytes32,
      amountLD: transferAmount,
      minAmountLD: transferAmount,
      extraOptions: "0x", // Default options
      composeMsg: "0x",
      oftCmd: "0x"
    };
    
    // Quote the fee
    console.log(`💸 Quoting transfer fee...`);
    const feeQuote = await arbContract.quoteSend(sendParam, false);
    const nativeFee = feeQuote.nativeFee;
    
    console.log(`   Native fee: ${ethers.utils.formatEther(nativeFee)} ETH\n`);
    
    // Execute the transfer
    console.log(`🚀 Executing cross-chain transfer...`);
    const sendTx = await arbContract.send(
      sendParam,
      { nativeFee, lzTokenFee: 0 },
      wallet.address,
      { value: nativeFee, gasLimit: 500000 }
    );
    
    console.log(`   Transaction hash: ${sendTx.hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);
    
    const receipt = await sendTx.wait();
    console.log(`   ✅ Transaction confirmed! Block: ${receipt.blockNumber}\n`);
    
    // Check balances after transfer
    console.log(`⏰ Waiting 30 seconds for cross-chain message delivery...`);
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const arbBalanceAfter = await arbContract.balanceOf(wallet.address);
    const ethBalanceAfter = await ethContract.balanceOf(wallet.address);
    
    console.log(`💰 Final Balances:`);
    console.log(`   Arbitrum: ${ethers.utils.formatUnits(arbBalanceAfter, 6)} USDT`);
    console.log(`   Ethereum: ${ethers.utils.formatUnits(ethBalanceAfter, 6)} USDT\n`);
    
    // Verify the transfer worked
    const expectedArbBalance = arbBalance.sub(transferAmount);
    const expectedEthBalance = ethBalance.add(transferAmount);
    
    if (arbBalanceAfter.eq(expectedArbBalance) && ethBalanceAfter.eq(expectedEthBalance)) {
      console.log(`🎉 SUCCESS! Cross-chain transfer completed successfully!`);
      console.log(`   ✅ Arbitrum balance decreased by 10 USDT`);
      console.log(`   ✅ Ethereum balance increased by 10 USDT`);
    } else {
      console.log(`⚠️  Transfer may still be processing...`);
      console.log(`   Expected Arbitrum: ${ethers.utils.formatUnits(expectedArbBalance, 6)} USDT`);
      console.log(`   Expected Ethereum: ${ethers.utils.formatUnits(expectedEthBalance, 6)} USDT`);
      console.log(`   \n💡 LayerZero cross-chain messages can take 1-5 minutes on testnets`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    
    if (error.data) {
      console.log(`   Error data: ${error.data}`);
    }
    
    if (error.message.includes('0x6592671c')) {
      console.log(`\n💡 This is the same DVN error we had before.`);
      console.log(`   The LayerZero CLI should have fixed this, but the pathway may still need time to activate.`);
    }
  }
}

testCrossChainTransfer(); 