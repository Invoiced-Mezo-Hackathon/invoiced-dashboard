# Fresh Start Instructions

This guide will help you redeploy all contracts and reset your local data for a completely fresh start.

## Step 1: Reset Local Storage Data

You have two options to reset your local data:

### Option A: Browser Console (Recommended)
1. Open your browser's Developer Console (F12 or Right-click → Inspect → Console)
2. Copy and paste the code from `scripts/reset-all.js`
3. Press Enter
4. You should see a confirmation message

### Option B: Manual Browser Clear
1. Open Developer Tools (F12)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Navigate to **Local Storage** → Your domain
4. Delete all keys that start with:
   - `mats_rewards_`
   - `transactions_`
   - `invoices_`
   - `invoice_drafts_`
   - `invoice_metadata_`

Or simply clear all localStorage:
```javascript
localStorage.clear();
```

## Step 2: Deploy Fresh Contracts

Run the deployment script to deploy new contracts:

```bash
# Make sure you have your PRIVATE_KEY in .env
npx hardhat run scripts/deploy-fresh.cjs --network mezotestnet
```

This will:
- Deploy new InvoiceContract
- Deploy new MezoVaultContract
- Automatically update `src/lib/mezo.ts` with the new addresses
- Save deployment info to `deployment-info.json`

## Step 3: Verify Deployment

After deployment, check:
1. The contract addresses printed in the terminal
2. The updated `src/lib/mezo.ts` file
3. The contracts on the explorer:
   - InvoiceContract: `https://explorer.test.mezo.org/address/[YOUR_ADDRESS]`
   - MezoVaultContract: `https://explorer.test.mezo.org/address/[YOUR_ADDRESS]`

## Step 4: Refresh Your App

1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Disconnect and reconnect your wallet
3. Start testing as a fresh user!

## What Gets Reset

When you reset local data, the following will be cleared:
- ✅ All MATS rewards (your 638 MATS will be gone)
- ✅ All stored transactions
- ✅ All invoice drafts
- ✅ All invoice metadata
- ✅ All cached data

**Note:** This only clears browser localStorage. Your wallet and on-chain data remain unchanged.

## Troubleshooting

### Still seeing old MATS?
- Make sure you cleared localStorage for the correct wallet address
- Check the browser console for any errors
- Try clearing all localStorage: `localStorage.clear()`

### Contracts not updating?
- Verify the deployment succeeded
- Check that `src/lib/mezo.ts` was updated
- Restart your dev server if running
- Clear browser cache

### Need to reset everything including contracts?
1. Follow Step 1 (Reset Local Storage)
2. Follow Step 2 (Deploy Fresh Contracts)
3. Make sure you're using the new contract addresses everywhere

