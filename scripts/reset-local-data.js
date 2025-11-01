// Reset Local Data Script
// Clears all localStorage data to start fresh like a new user

console.log('🔄 Resetting all local data...\n');

// Get all localStorage keys
const keysToRemove = [];

// Find all keys related to this app
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key) {
    // Match keys for:
    // - MATS rewards: mats_rewards_*
    // - Transactions: transactions_*
    // - Invoices: invoices_*, invoice_drafts_*
    // - Invoice metadata: invoice_metadata_*
    if (
      key.startsWith('mats_rewards_') ||
      key.startsWith('transactions_') ||
      key.startsWith('invoices_') ||
      key.startsWith('invoice_drafts_') ||
      key.startsWith('invoice_metadata_')
    ) {
      keysToRemove.push(key);
    }
  }
}

console.log(`Found ${keysToRemove.length} keys to remove:`);
keysToRemove.forEach(key => {
  console.log(`  - ${key}`);
  localStorage.removeItem(key);
});

console.log(`\n✅ Cleared ${keysToRemove.length} localStorage entries`);
console.log('✨ Your app is now reset to a fresh state!\n');

// Optionally clear ALL localStorage (use with caution)
if (process.argv.includes('--all')) {
  console.log('⚠️  Clearing ALL localStorage...');
  localStorage.clear();
  console.log('✅ All localStorage cleared');
}

