const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  console.log("🔗 Linking Vault as MUSD Minter...");
  
  const privateKey = process.env.PRIVATE_KEY?.replace(/['" ]/g, '').trim();
  if (!privateKey || privateKey === '0x') {
    console.log("❌ No PRIVATE_KEY found in .env file");
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider("https://rpc.test.mezo.org");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("📝 Using account:", wallet.address);
  
  // Get addresses from deployment info
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
  
  const musdAddress = deploymentInfo.contracts.MUSDToken;
  const vaultAddress = deploymentInfo.contracts.MezoVaultContract;
  
  console.log("📄 MUSD Token:", musdAddress);
  console.log("📄 Vault Contract:", vaultAddress);
  
  // Load MUSD ABI
  const musdPath = "artifacts/contracts/MUSDToken.sol/MUSDToken.json";
  const musdJson = JSON.parse(fs.readFileSync(musdPath, "utf8"));
  const musdContract = new ethers.Contract(musdAddress, musdJson.abi, wallet);
  
  // Check if vault is already a minter
  const isMinter = await musdContract.minters(vaultAddress);
  
  if (isMinter) {
    console.log("✅ Vault is already set as minter!");
  } else {
    console.log("🔧 Setting vault as minter...");
    const tx = await musdContract.addMinter(vaultAddress);
    await tx.wait();
    console.log("✅ Vault is now a minter for MUSD!");
    console.log("🌐 Transaction:", `https://explorer.test.mezo.org/tx/${tx.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Failed:", error.message);
    process.exit(1);
  });

