const { execSync } = require('child_process');

// Contract addresses from deployments
const CONTRACTS = {
  'arbitrum-sepolia': {
    name: 'Arbitrum Sepolia',
    address: '0x4cCe71303Ea60C3D7D251316f23AA734fA96c30a',
    explorer: 'https://sepolia.arbiscan.io'
  },
  'sepolia': {
    name: 'Ethereum Sepolia', 
    address: '0x862c21F0987A61a9A0c9239Dc2fC0926412B3Ea4',
    explorer: 'https://sepolia.etherscan.io'
  },
  'base-sepolia': {
    name: 'Base Sepolia',
    address: '0xeE9672eEb74839Ed4dc432a5acfAa208f2Cd0008',
    explorer: 'https://sepolia.basescan.org'
  }
};

async function verifyContract(network, contractInfo) {
  console.log(`\n🔍 Verifying ${contractInfo.name} contract...`);
  console.log(`   Address: ${contractInfo.address}`);
  console.log(`   Explorer: ${contractInfo.explorer}`);
  
  try {
    // The LayerZero scaffold uses hardhat-deploy, so we can use the etherscan-verify task
    // which automatically reads deployment artifacts
    const command = `npx hardhat etherscan-verify --network ${network} --sleep`;
    
    console.log(`   Command: ${command}`);
    console.log(`   ⏳ Submitting to block explorer...`);
    
    const output = execSync(command, { 
      encoding: 'utf8',
      timeout: 60000 // 1 minute timeout
    });
    
    console.log(`   ✅ Verification submitted successfully!`);
    console.log(`   📋 Output: ${output.slice(-200)}...`); // Last 200 chars
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Verification failed: ${error.message}`);
    
    // Check for common issues
    if (error.message.includes('API key')) {
      console.log(`   💡 You need to add your API key to .env file`);
      console.log(`      Get it from: ${contractInfo.explorer}/apis`);
    } else if (error.message.includes('already verified')) {
      console.log(`   ✅ Contract was already verified!`);
      return true;
    } else if (error.message.includes('timeout')) {
      console.log(`   ⚠️  Verification timed out - try again later`);
    }
    
    return false;
  }
}

async function main() {
  console.log("🔍 LayerZero OFT Contract Verification");
  console.log("======================================");
  console.log("Verifying contracts on all three networks...\n");
  
  console.log("📋 Contracts to verify:");
  for (const [network, info] of Object.entries(CONTRACTS)) {
    console.log(`   ${info.name}: ${info.address}`);
  }
  
  console.log("\n⚠️  NOTE: You need API keys in your .env file:");
  console.log("   ETHERSCAN_API_KEY - Get from https://etherscan.io/apis");
  console.log("   ARBISCAN_API_KEY - Get from https://arbiscan.io/apis");  
  console.log("   BASESCAN_API_KEY - Get from https://basescan.org/apis");
  console.log("\n🚀 Starting verification process...");
  
  const results = [];
  
  for (const [network, contractInfo] of Object.entries(CONTRACTS)) {
    const success = await verifyContract(network, contractInfo);
    results.push({ network: contractInfo.name, success });
  }
  
  // Summary
  console.log(`\n📊 Verification Results:`);
  console.log("=".repeat(40));
  
  for (const result of results) {
    const status = result.success ? "✅ SUCCESS" : "❌ FAILED";
    console.log(`${result.network}: ${status}`);
  }
  
  const allVerified = results.every(r => r.success);
  
  if (allVerified) {
    console.log(`\n🎉 All contracts verified successfully!`);
    console.log(`You can now view them on the block explorers with full source code and ABI.`);
  } else {
    console.log(`\n⚠️  Some verifications failed.`);
    console.log(`Make sure you have valid API keys in your .env file and try again.`);
  }
  
  console.log(`\n📱 View your contracts:`);
  for (const [network, info] of Object.entries(CONTRACTS)) {
    console.log(`   ${info.name}: ${info.explorer}/address/${info.address}`);
  }
}

main().catch(console.error); 