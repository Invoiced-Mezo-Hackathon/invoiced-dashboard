const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying InvoiceContract to Mezo testnet...");
  
  // Get the deployer account
  const ethers = hre.ethers;
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

  // Deploy InvoiceContract
  console.log("\n📄 Deploying InvoiceContract...");
  const InvoiceContract = await ethers.getContractFactory("InvoiceContract");
  const invoiceContract = await InvoiceContract.deploy();
  
  await invoiceContract.waitForDeployment();
  const invoiceAddress = await invoiceContract.getAddress();
  console.log("✅ InvoiceContract deployed to:", invoiceAddress);

  // Verify contracts on explorer
  console.log("\n🔍 Contract verification:");
  console.log("InvoiceContract:", `https://explorer.test.mezo.org/address/${invoiceAddress}`);

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

