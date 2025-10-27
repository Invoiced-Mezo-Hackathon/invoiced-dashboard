async function main() {
  console.log("🚀 Deploying to local network...");
  
  const { ethers } = require("hardhat");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  console.log("\n📄 Deploying InvoiceContract...");
  const InvoiceContract = await ethers.getContractFactory("InvoiceContract");
  const invoiceContract = await InvoiceContract.deploy();
  await invoiceContract.waitForDeployment();
  const invoiceAddress = await invoiceContract.getAddress();
  
  console.log("✅ InvoiceContract deployed to:", invoiceAddress);
  
  console.log("\n📋 Update src/lib/mezo.ts with this address:");
  console.log(`INVOICE_CONTRACT: '${invoiceAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

