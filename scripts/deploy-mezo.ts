import { ethers } from "ethers";
import * as fs from "fs";

async function main() {
  console.log("🚀 Deploying InvoiceContract to Mezo Testnet...");
  
  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider("https://rpc.test.mezo.org");
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY?.trim() || "",
    provider
  );
  
  console.log("Deploying with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("❌ No testnet BTC! Get some from: https://testnet.mezo.org/");
    process.exit(1);
  }

  // Read and compile contract
  const contractPath = "artifacts/contracts/InvoiceContract.sol/InvoiceContract.json";
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  
  console.log("\n📄 Deploying InvoiceContract...");
  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  
  const invoiceContract = await factory.deploy();
  console.log("Waiting for deployment...");
  await invoiceContract.waitForDeployment();
  
  const address = await invoiceContract.getAddress();
  console.log("\n✅ InvoiceContract deployed to:", address);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${address}`);
  
  console.log("\n📋 Add this to src/lib/mezo.ts:");
  console.log(`  INVOICE_CONTRACT: '${address}',`);
  
  return address;
}

main()
  .then(() => {
    console.log("\n🎉 Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  });

