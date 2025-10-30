require("dotenv").config();
const { JsonRpcProvider, Wallet, ContractFactory, formatEther } = require("ethers");
const artifact = require("../artifacts/contracts/InvoiceContract.sol/InvoiceContract.json");

async function main() {
  console.log("🚀 Deploying InvoiceContract...");
  
  try {
    const rpcUrl = process.env.MEZO_RPC_URL || "https://rpc.test.mezo.org";
    const provider = new JsonRpcProvider(rpcUrl);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error("PRIVATE_KEY not set in .env");
    const wallet = new Wallet(pk, provider);
    const deployerAddress = await wallet.getAddress();
    console.log("Deploying with account:", deployerAddress);
    const balance = await provider.getBalance(deployerAddress);
    console.log("Balance:", formatEther(balance));

    // Warn if low balance
    if (balance === 0n) {
      console.log("⚠️  Low or zero balance. Fund the deployer on Mezo testnet.");
    }

    console.log("\nDeploying InvoiceContract...");
    const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const invoiceAddress = await contract.getAddress();
    
    console.log("✅ InvoiceContract deployed to:", invoiceAddress);
    // Network name unknown without hre; print RPC URL instead
    console.log("🔗 RPC:", rpcUrl);
    
    console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${invoiceAddress}`);
    
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

