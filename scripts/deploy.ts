const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts to Mezo testnet...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("❌ No balance found! Please get testnet BTC from the faucet:");
    console.log("🔗 https://testnet.mezo.org/");
    return;
  }

  // Deploy InvoiceContract
  console.log("\n📄 Deploying InvoiceContract...");
  const InvoiceContract = await hre.ethers.getContractFactory("InvoiceContract");
  const invoiceContract = await InvoiceContract.deploy();
  
  await invoiceContract.waitForDeployment();
  const invoiceAddress = await invoiceContract.getAddress();
  console.log("✅ InvoiceContract deployed to:", invoiceAddress);

  // Deploy MezoVaultContract (our custom vault contract)
  console.log("\n🏦 Deploying MezoVaultContract...");
  const MezoVaultContract = await hre.ethers.getContractFactory("MezoVaultContract");
  const vaultContract = await MezoVaultContract.deploy();
  
  await vaultContract.waitForDeployment();
  const vaultAddress = await vaultContract.getAddress();
  console.log("✅ MezoVaultContract deployed to:", vaultAddress);

  // Verify contracts on explorer
  console.log("\n🔍 Contract verification:");
  console.log("InvoiceContract:", `https://explorer.test.mezo.org/address/${invoiceAddress}`);
  console.log("MezoVaultContract:", `https://explorer.test.mezo.org/address/${vaultAddress}`);

  // Save contract addresses to a file
  const contractAddresses = {
    InvoiceContract: invoiceAddress,
    MezoVaultContract: vaultAddress,
    network: "mezotestnet",
    chainId: 31611,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  console.log("\n📋 Contract addresses:");
  console.log(JSON.stringify(contractAddresses, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update your frontend with these contract addresses");
  console.log("2. Test the vault functionality");
  console.log("3. Connect to Mezo testnet in your wallet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });