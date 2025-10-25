# Mezo Testnet Setup Guide

This invoice dashboard is configured to work with Mezo Testnet. Here's how to set it up:

## For Users

### Automatic Setup
1. Connect your wallet using the "Connect Wallet" button
2. If you're not on Mezo Testnet, you'll see a popup asking you to switch
3. Click "Switch to Mezo Testnet" to automatically add and switch to the network

### Manual Setup (if automatic doesn't work)
If Mezo Testnet doesn't appear in your wallet, you can add it manually:

**Network Details:**
- Network Name: Mezo Testnet
- RPC URL: https://rpc.test.mezo.org
- Chain ID: 31611
- Currency Symbol: BTC
- Block Explorer: https://explorer.test.mezo.org

### Getting Testnet BTC
You'll need testnet BTC for gas fees. Get it from the Mezo testnet faucet.

## For Developers

### Hardhat Configuration
The project is configured with Hardhat for smart contract development:

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Mezo testnet
npm run deploy:mezo
```

### Environment Variables
Create a `.env` file with your private key:
```
PRIVATE_KEY=your_private_wallet_key_here
```

### Network Configuration
Mezo Testnet is configured in `src/main.tsx`:
- Chain ID: 31611
- RPC URL: https://rpc.test.mezo.org
- Currency: BTC
- Explorer: https://explorer.test.mezo.org

## Features

- **Automatic Network Detection**: Detects when users are on the wrong network
- **Network Switch Modal**: Prompts users to switch to Mezo Testnet
- **Network Status Indicators**: Shows current network status in the UI
- **Toast Notifications**: Notifies users when they switch networks
- **Manual Network Addition**: Provides instructions for manual network setup

## Troubleshooting

1. **Network not appearing**: Try refreshing the page or clearing browser cache
2. **Switch failing**: Check if your wallet supports custom networks
3. **No testnet BTC**: Visit the Mezo testnet faucet to get testnet tokens
4. **Connection issues**: Ensure you're using a supported wallet (MetaMask, WalletConnect, etc.)

## Support

For more information about Mezo Testnet, visit: https://mezo.org/docs/developers/getting-started/configure-environment
