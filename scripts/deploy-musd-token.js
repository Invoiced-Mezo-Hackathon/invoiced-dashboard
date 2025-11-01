const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying MUSDToken to Mezo Testnet...\n");
  
  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY?.replace(/['" ]/g, '').trim();
  
  if (!privateKey || privateKey === '0x') {
    console.log("❌ No PRIVATE_KEY found in .env file");
    process.exit(1);
  }
  
  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider("https://rpc.test.mezo.org");
  let wallet;
  
  try {
    wallet = new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.log("❌ Invalid private key:", error.message);
    console.log("Please check your .env file. Private key should be a 64-character hex string.");
    process.exit(1);
  }
  
  console.log("Deploying with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("❌ No testnet BTC! Get some from: https://testnet.mezo.org/");
    process.exit(1);
  }

  // ===== Deploy MUSDToken =====
  console.log("\n💵 Deploying MUSDToken...");
  const musdContractPath = "artifacts/contracts/MUSDToken.sol/MUSDToken.json";
  
  if (!fs.existsSync(musdContractPath)) {
    console.log("❌ MUSDToken artifact not found. Please run: npx hardhat compile");
    process.exit(1);
  }
  
  const musdContractJson = JSON.parse(fs.readFileSync(musdContractPath, "utf8"));
  const musdFactory = new ethers.ContractFactory(
    musdContractJson.abi,
    musdContractJson.bytecode,
    wallet
  );
  
  const musdToken = await musdFactory.deploy();
  console.log("Waiting for MUSDToken deployment (this may take a minute)...");
  await musdToken.waitForDeployment();
  
  const musdAddress = await musdToken.getAddress();
  console.log("✅ MUSDToken deployed to:", musdAddress);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${musdAddress}`);

  // ===== Update mezo.ts with new MUSD token address =====
  console.log("\n📋 Updating src/lib/mezo.ts...");
  const mezoTsPath = path.join(__dirname, "..", "src", "lib", "mezo.ts");
  let mezoTsContent = fs.readFileSync(mezoTsPath, "utf8");
  
  // Update MUSD_TOKEN address
  mezoTsContent = mezoTsContent.replace(
    /MUSD_TOKEN:\s*['"](0x[a-fA-F0-9]{40})['"]/,
    `MUSD_TOKEN: '${musdAddress}'`
  );
  
  fs.writeFileSync(mezoTsPath, mezoTsContent);
  console.log("✅ Updated src/lib/mezo.ts with new MUSD token address");

  // ===== Update deployment-info.json =====
  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  let deploymentInfo = {};
  
  if (fs.existsSync(deploymentInfoPath)) {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
  }
  
  deploymentInfo.network = "Mezo Testnet";
  deploymentInfo.chainId = 31611;
  deploymentInfo.deployedAt = new Date().toISOString();
  deploymentInfo.deployer = wallet.address;
  deploymentInfo.contracts = deploymentInfo.contracts || {};
  deploymentInfo.contracts.MUSDToken = musdAddress;
  deploymentInfo.explorer = deploymentInfo.explorer || {};
  deploymentInfo.explorer.musdToken = `https://explorer.test.mezo.org/address/${musdAddress}`;
  
  // Add deployment version hash
  const crypto = require("crypto");
  const vaultAddress = deploymentInfo.contracts.MezoVaultContract || "0x0000000000000000000000000000000000000000";
  const invoiceAddress = deploymentInfo.contracts.InvoiceContract || "0x0000000000000000000000000000000000000000";
  const versionHash = crypto
    .createHash("sha256")
    .update(`${invoiceAddress}-${vaultAddress}-${musdAddress}`)
    .digest("hex")
    .substring(0, 16);
  
  deploymentInfo.deploymentVersion = versionHash;
  deploymentInfo.versionTimestamp = new Date().toISOString();
  
  fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Updated deployment-info.json");
  console.log("🔐 Deployment version:", versionHash);
  console.log("⚠️  MATS will automatically reset on next app load due to MUSD token redeployment");

  console.log("\n📋 Deployment Summary:");
  console.log({
    network: "Mezo Testnet",
    chainId: 31611,
    deployer: wallet.address,
    contracts: {
      MUSDToken: musdAddress,
    },
    explorer: {
      musdToken: `https://explorer.test.mezo.org/address/${musdAddress}`,
    },
  });

  console.log("\n🎉 MUSD Token deployment completed successfully!");
  console.log("\n⚠️  NOTE: You may need to redeploy MezoVaultContract with this new MUSD token address!");
  
  return musdAddress;
}

main()
  .then(() => {
    console.log("\n✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error.message);
    console.error(error);
    process.exit(1);
  });

