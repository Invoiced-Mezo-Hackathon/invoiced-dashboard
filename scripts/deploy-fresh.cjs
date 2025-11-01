const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying fresh contracts to Mezo testnet...\n");
  
  // Get the deployer account
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("❌ No balance found! Please get testnet BTC from the faucet:");
    console.log("🔗 https://testnet.mezo.org/");
    return;
  }

  // MUSD Token address (this should be the official MUSD token on Mezo testnet)
  // Using the verified address from mezo.ts
  const MUSD_TOKEN = "0x5987aA39B41E961c9683901BfF50f87C88C839a9";
  
  // Deploy InvoiceContract
  console.log("\n📄 Deploying InvoiceContract...");
  const InvoiceContract = await ethers.getContractFactory("InvoiceContract");
  const invoiceContract = await InvoiceContract.deploy();
  
  await invoiceContract.waitForDeployment();
  const invoiceAddress = await invoiceContract.getAddress();
  console.log("✅ InvoiceContract deployed to:", invoiceAddress);

  // Deploy MezoVaultContract (our custom vault contract)
  console.log("\n🏦 Deploying MezoVaultContract...");
  const MezoVaultContract = await ethers.getContractFactory("MezoVaultContract");
  const vaultContract = await MezoVaultContract.deploy(MUSD_TOKEN);
  
  await vaultContract.waitForDeployment();
  const vaultAddress = await vaultContract.getAddress();
  console.log("✅ MezoVaultContract deployed to:", vaultAddress);

  // Verify contracts on explorer
  console.log("\n🔍 Contract verification:");
  console.log("InvoiceContract:", `https://explorer.test.mezo.org/address/${invoiceAddress}`);
  console.log("MezoVaultContract:", `https://explorer.test.mezo.org/address/${vaultAddress}`);

  // Save contract addresses to deployment-info.json
  const contractAddresses = {
    network: "Mezo Testnet",
    chainId: 31611,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
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

  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(deploymentInfoPath, JSON.stringify(contractAddresses, null, 2));
  console.log("\n✅ Saved deployment info to:", deploymentInfoPath);

  // Update mezo.ts with new addresses
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

  console.log("\n📋 Contract addresses:");
  console.log(JSON.stringify(contractAddresses, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n✨ Next steps:");
  console.log("1. Reset local data: Run the reset script or clear browser localStorage");
  console.log("2. Refresh your app to use the new contracts");
  console.log("3. Test the vault and invoice functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

