const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying all contracts to Mezo Testnet...\n");
  
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

  // MUSD Token address (verified address on Mezo testnet)
  const MUSD_TOKEN = "0x5987aA39B41E961c9683901BfF50f87C88C839a9";
  console.log("Using MUSD Token:", MUSD_TOKEN);

  // ===== Deploy InvoiceContract =====
  console.log("\n📄 Deploying InvoiceContract...");
  const invoiceContractPath = "artifacts/contracts/InvoiceContract.sol/InvoiceContract.json";
  
  if (!fs.existsSync(invoiceContractPath)) {
    console.log("❌ InvoiceContract artifact not found. Please run: npx hardhat compile");
    process.exit(1);
  }
  
  const invoiceContractJson = JSON.parse(fs.readFileSync(invoiceContractPath, "utf8"));
  const invoiceFactory = new ethers.ContractFactory(
    invoiceContractJson.abi,
    invoiceContractJson.bytecode,
    wallet
  );
  
  const invoiceContract = await invoiceFactory.deploy();
  console.log("Waiting for InvoiceContract deployment (this may take a minute)...");
  await invoiceContract.waitForDeployment();
  
  const invoiceAddress = await invoiceContract.getAddress();
  console.log("✅ InvoiceContract deployed to:", invoiceAddress);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${invoiceAddress}`);

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

  // ===== Save deployment info =====
  const contractAddresses = {
    network: "Mezo Testnet",
    chainId: 31611,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    contracts: {
      MUSDToken: MUSD_TOKEN,
      InvoiceContract: invoiceAddress,
      MezoVaultContract: vaultAddress,
    },
    explorer: {
      musdToken: `https://explorer.test.mezo.org/address/${MUSD_TOKEN}`,
      invoiceContract: `https://explorer.test.mezo.org/address/${invoiceAddress}`,
      vault: `https://explorer.test.mezo.org/address/${vaultAddress}`,
    },
  };

  // Add deployment version hash
  const crypto = require("crypto");
  const versionHash = crypto
    .createHash("sha256")
    .update(`${invoiceAddress}-${vaultAddress}-${MUSD_TOKEN}`)
    .digest("hex")
    .substring(0, 16);
  
  contractAddresses.deploymentVersion = versionHash;
  contractAddresses.versionTimestamp = new Date().toISOString();

  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(deploymentInfoPath, JSON.stringify(contractAddresses, null, 2));
  console.log("\n✅ Saved deployment info to:", deploymentInfoPath);
  console.log("🔐 Deployment version:", versionHash);
  console.log("⚠️  MATS will automatically reset on next app load");

  // ===== Update mezo.ts with new addresses =====
  console.log("\n📋 Updating src/lib/mezo.ts...");
  const mezoTsPath = path.join(__dirname, "..", "src", "lib", "mezo.ts");
  let mezoTsContent = fs.readFileSync(mezoTsPath, "utf8");
  
  // Update INVOICE_CONTRACT address
  mezoTsContent = mezoTsContent.replace(
    /INVOICE_CONTRACT:\s*['"](0x[a-fA-F0-9]{40})['"]/,
    `INVOICE_CONTRACT: '${invoiceAddress}'`
  );
  
  // Update MEZO_VAULT address
  mezoTsContent = mezoTsContent.replace(
    /MEZO_VAULT:\s*['"](0x[a-fA-F0-9]{40})['"]/,
    `MEZO_VAULT: '${vaultAddress}'`
  );
  
  fs.writeFileSync(mezoTsPath, mezoTsContent);
  console.log("✅ Updated src/lib/mezo.ts with new contract addresses");

  console.log("\n📋 Contract addresses summary:");
  console.log(JSON.stringify(contractAddresses, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n✨ Next steps:");
  console.log("1. Reset local data: Clear browser localStorage (MATS, transactions, invoices)");
  console.log("2. Refresh your app to use the new contracts");
  console.log("3. Test the vault and invoice functionality");
  
  return contractAddresses;
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

