const { network } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying InvoiceContract...");
  
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance));

    if (network.name === "mezotestnet" && balance === 0n) {
      console.log("⚠️  No testnet BTC! Get some from: https://testnet.mezo.org/");
    }

    console.log("\nDeploying InvoiceContract...");
    const InvoiceContract = await hre.ethers.getContractFactory("InvoiceContract");
    const invoiceContract = await InvoiceContract.deploy();
    await invoiceContract.waitForDeployment();
    const invoiceAddress = await invoiceContract.getAddress();
    
    console.log("✅ InvoiceContract deployed to:", invoiceAddress);
    console.log("🔗 Network:", network.name);
    
    if (network.name === "mezotestnet") {
      console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${invoiceAddress}`);
    }
    
    console.log("\n📋 Update src/lib/mezo.ts:");
    console.log(`  INVOICE_CONTRACT: '${invoiceAddress}',`);
    
    return invoiceAddress;
  } catch (error) {
    console.error("❌ Deployment error:", error.message);
    console.error(error);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  });

