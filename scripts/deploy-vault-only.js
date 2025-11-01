const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying MezoVaultContract to Mezo Testnet...\n");
  
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

  // MUSD Token address - read from mezo.ts or use newly deployed one
  // First try to read from mezo.ts
  let MUSD_TOKEN = "0x0194D83FD76fb22949dAAc5C4C7B98b4C3C011Dc"; // Newly deployed
  try {
    const mezoTsPath = path.join(__dirname, "..", "src", "lib", "mezo.ts");
    if (fs.existsSync(mezoTsPath)) {
      const mezoTsContent = fs.readFileSync(mezoTsPath, "utf8");
      const match = mezoTsContent.match(/MUSD_TOKEN:\s*['"](0x[a-fA-F0-9]{40})['"]/);
      if (match) {
        MUSD_TOKEN = match[1];
      }
    }
  } catch (e) {
    console.log("Using default MUSD token address");
  }
  console.log("Using MUSD Token:", MUSD_TOKEN);

  // ===== Deploy MezoVaultContract =====
  console.log("\n🏦 Deploying MezoVaultContract...");
  const vaultContractPath = "artifacts/contracts/MezoVaultContract.sol/MezoVaultContract.json";
  
  if (!fs.existsSync(vaultContractPath)) {
    console.log("❌ MezoVaultContract artifact not found. Please run: npx hardhat compile");
    process.exit(1);
  }
  
  const vaultContractJson = JSON.parse(fs.readFileSync(vaultContractPath, "utf8"));
  const vaultFactory = new ethers.ContractFactory(
    vaultContractJson.abi,
    vaultContractJson.bytecode,
    wallet
  );
  
  // MezoVaultContract requires MUSD token address as constructor argument
  const vaultContract = await vaultFactory.deploy(MUSD_TOKEN);
  console.log("Waiting for MezoVaultContract deployment (this may take a minute)...");
  await vaultContract.waitForDeployment();
  
  const vaultAddress = await vaultContract.getAddress();
  console.log("✅ MezoVaultContract deployed to:", vaultAddress);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${vaultAddress}`);

  // ===== Update mezo.ts with new vault address =====
  console.log("\n📋 Updating src/lib/mezo.ts...");
  const mezoTsPath = path.join(__dirname, "..", "src", "lib", "mezo.ts");
  let mezoTsContent = fs.readFileSync(mezoTsPath, "utf8");
  
  // Update MEZO_VAULT address
  mezoTsContent = mezoTsContent.replace(
    /MEZO_VAULT:\s*['"](0x[a-fA-F0-9]{40})['"]/,
    `MEZO_VAULT: '${vaultAddress}'`
  );
  
  fs.writeFileSync(mezoTsPath, mezoTsContent);
  console.log("✅ Updated src/lib/mezo.ts with new vault address");

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
  deploymentInfo.contracts.MUSDToken = MUSD_TOKEN;
  deploymentInfo.contracts.MezoVaultContract = vaultAddress;
  deploymentInfo.explorer = deploymentInfo.explorer || {};
  deploymentInfo.explorer.musdToken = `https://explorer.test.mezo.org/address/${MUSD_TOKEN}`;
  deploymentInfo.explorer.vault = `https://explorer.test.mezo.org/address/${vaultAddress}`;
  
  // Add deployment version hash
  const crypto = require("crypto");
  const invoiceAddress = deploymentInfo.contracts.InvoiceContract || "0x0000000000000000000000000000000000000000";
  const versionHash = crypto
    .createHash("sha256")
    .update(`${invoiceAddress}-${vaultAddress}-${MUSD_TOKEN}`)
    .digest("hex")
    .substring(0, 16);
  
  deploymentInfo.deploymentVersion = versionHash;
  deploymentInfo.versionTimestamp = new Date().toISOString();
  
  fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Updated deployment-info.json");
  console.log("🔐 Deployment version:", versionHash);
  console.log("⚠️  MATS will automatically reset on next app load due to vault redeployment");

  console.log("\n📋 Deployment Summary:");
  console.log({
    network: "Mezo Testnet",
    chainId: 31611,
    deployer: wallet.address,
    contracts: {
      MUSDToken: MUSD_TOKEN,
      MezoVaultContract: vaultAddress,
    },
    explorer: {
      vault: `https://explorer.test.mezo.org/address/${vaultAddress}`,
    },
  });

  console.log("\n🎉 Vault deployment completed successfully!");
  
  return vaultAddress;
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

