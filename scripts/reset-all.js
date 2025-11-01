// Complete Reset Script
// Resets all local storage data for a fresh start
// This can be run in the browser console or as a bookmarklet

(function() {
  console.log('🔄 Resetting all local data for a fresh start...\n');
  
  const keysToRemove = [];
  let removedCount = 0;
  
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
    removedCount++;
  });
  
  console.log(`\n✅ Cleared ${removedCount} localStorage entries`);
  console.log('✨ Your app is now reset to a fresh state!');
  console.log('\n🔄 Please refresh the page to see the changes.\n');
  
  // Dispatch a custom event to notify the app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storage_reset'));
  }
  
  return removedCount;
})();

