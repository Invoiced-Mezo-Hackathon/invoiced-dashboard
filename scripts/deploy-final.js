const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying InvoiceContract to Mezo Testnet...");
  
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
  console.log("Balance:", ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("❌ No testnet BTC! Get some from: https://testnet.mezo.org/");
    process.exit(1);
  }

  // Read compiled contract
  const contractPath = "artifacts/contracts/InvoiceContract.sol/InvoiceContract.json";
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  
  console.log("\n📄 Deploying InvoiceContract...");
  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  
  const invoiceContract = await factory.deploy();
  console.log("Waiting for deployment (this may take a minute)...");
  await invoiceContract.waitForDeployment();
  
  const address = await invoiceContract.getAddress();
  console.log("\n✅ InvoiceContract deployed to:", address);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${address}`);
  
  // Update the config file
  console.log("\n📋 Updating src/lib/mezo.ts...");
  const configPath = "src/lib/mezo.ts";
  let config = fs.readFileSync(configPath, "utf8");
  
  // Replace the placeholder address
  config = config.replace(
    /INVOICE_CONTRACT:\s*'[^']*'/,
    `INVOICE_CONTRACT: '${address}'`
  );
  
  fs.writeFileSync(configPath, config);
  console.log("✅ Config updated!");
  
  console.log("\n🎉 Deployment successful!");
  console.log("\nYour app at http://localhost:3000 will now use the deployed contract!");
  
  return address;
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
