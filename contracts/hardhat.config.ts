import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, ".env") });

// Make sure to create a .env file with these variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const TESTNET_RPC_URL = process.env.TESTNET_RPC_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    testnet: {
      url: TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111 // Sepolia testnet
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;