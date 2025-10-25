import { ethers } from "hardhat";

async function main() {
  console.log("Deploying InvoiceContract to Mezo testnet...");
  
  const InvoiceContract = await ethers.getContractFactory("InvoiceContract");
  const invoiceContract = await InvoiceContract.deploy();
  
  await invoiceContract.waitForDeployment();
  
  const address = await invoiceContract.getAddress();
  console.log("InvoiceContract deployed to:", address);
  
  // Save the contract address for frontend integration
  console.log("\nContract deployment successful!");
  console.log("Contract Address:", address);
  console.log("Network: Mezo Testnet (Chain ID: 31611)");
  console.log("\nYou can now integrate this contract with your React frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
