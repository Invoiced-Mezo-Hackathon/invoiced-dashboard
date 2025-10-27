const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying Vault System to Mezo Testnet...");
  
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
  
  console.log("\n📝 Deploying with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BTC");
  
  if (balance === 0n) {
    console.log("\n❌ No testnet BTC! Get some from: https://testnet.mezo.org/");
    process.exit(1);
  }

  // Step 1: Deploy MUSDToken
  console.log("\n📄 Step 1: Deploying MUSDToken...");
  const musdTokenPath = "artifacts/contracts/MUSDToken.sol/MUSDToken.json";
  
  if (!fs.existsSync(musdTokenPath)) {
    console.log("❌ MUSDToken artifact not found. Run 'npm run compile' first.");
    process.exit(1);
  }
  
  const musdTokenJson = JSON.parse(fs.readFileSync(musdTokenPath, "utf8"));
  const musdFactory = new ethers.ContractFactory(
    musdTokenJson.abi,
    musdTokenJson.bytecode,
    wallet
  );
  
  const musdToken = await musdFactory.deploy();
  await musdToken.waitForDeployment();
  const musdAddress = await musdToken.getAddress();
  console.log("✅ MUSDToken deployed to:", musdAddress);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${musdAddress}`);

  // Step 2: Deploy MezoVaultContract
  console.log("\n📄 Step 2: Deploying MezoVaultContract...");
  const vaultPath = "artifacts/contracts/MezoVaultContract.sol/MezoVaultContract.json";
  
  if (!fs.existsSync(vaultPath)) {
    console.log("❌ MezoVaultContract artifact not found. Run 'npm run compile' first.");
    process.exit(1);
  }
  
  const vaultJson = JSON.parse(fs.readFileSync(vaultPath, "utf8"));
  const vaultFactory = new ethers.ContractFactory(
    vaultJson.abi,
    vaultJson.bytecode,
    wallet
  );
  
  const vault = await vaultFactory.deploy(musdAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ MezoVaultContract deployed to:", vaultAddress);
  console.log("🌐 Explorer:", `https://explorer.test.mezo.org/address/${vaultAddress}`);

  // Step 3: Set Vault as MUSD minter
  console.log("\n🔗 Step 3: Linking Vault as MUSD minter...");
  const setMinterTx = await musdToken.addMinter(vaultAddress);
  await setMinterTx.wait();
  console.log("✅ Vault is now a minter for MUSD");

  // Step 4: Save addresses to file
  console.log("\n💾 Saving deployment info...");
  const deploymentInfo = {
    network: "Mezo Testnet",
    chainId: 31611,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    contracts: {
      MUSDToken: musdAddress,
      MezoVaultContract: vaultAddress,
    },
    explorer: {
      musdToken: `https://explorer.test.mezo.org/address/${musdAddress}`,
      vault: `https://explorer.test.mezo.org/address/${vaultAddress}`,
    }
  };
  
  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Saved to deployment-info.json");

  // Step 5: Update mezo.ts
  console.log("\n📋 Updating src/lib/mezo.ts...");
  const configPath = "src/lib/mezo.ts";
  let config = fs.readFileSync(configPath, "utf8");
  
  // Replace MUSD token address
  config = config.replace(
    /MUSD_TOKEN:\s*'[^']*',/,
    `MUSD_TOKEN: '${musdAddress}',`
  );
  
  // Replace vault address
  config = config.replace(
    /MEZO_VAULT:\s*'[^']*',/,
    `MEZO_VAULT: '${vaultAddress}',`
  );
  
  fs.writeFileSync(configPath, config);
  console.log("✅ Config updated!");

  console.log("\n🎉 Deployment successful!");
  console.log("\n📊 Summary:");
  console.log(`   MUSD Token: ${musdAddress}`);
  console.log(`   Vault: ${vaultAddress}`);
  console.log("\n🌐 View on Explorer:");
  console.log(`   MUSD: https://explorer.test.mezo.org/address/${musdAddress}`);
  console.log(`   Vault: https://explorer.test.mezo.org/address/${vaultAddress}`);
  console.log("\n🚀 Your app at http://localhost:3000 will now use the deployed contracts!");
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

