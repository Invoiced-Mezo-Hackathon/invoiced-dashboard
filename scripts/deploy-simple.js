const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying InvoiceContract to Mezo Testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("❌ No testnet BTC! Get some from: https://testnet.mezo.org/");
    process.exit(1);
  }

  // Deploy InvoiceContract
  console.log("\n📄 Deploying InvoiceContract...");
  const InvoiceContract = await ethers.getContractFactory("InvoiceContract");
  const invoiceContract = await InvoiceContract.deploy();
  
  console.log("Waiting for deployment...");
  await invoiceContract.waitForDeployment();
  
  const address = await invoiceContract.getAddress();
  console.log("\n✅ InvoiceContract deployed to:", address);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${address}`);
  
  console.log("\n📋 Add this to src/lib/mezo.ts:");
  console.log(`  INVOICE_CONTRACT: '${address}',`);
  
  console.log("\n🎉 Deployment successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  });