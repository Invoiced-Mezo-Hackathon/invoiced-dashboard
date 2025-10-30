import { Invoice } from '@/types/invoice';
import { parseEther } from 'viem';

const STORAGE_KEY = 'invoiced_local_drafts_v1';

export interface DraftInvoice extends Omit<Invoice, 'id'> {
  id: string; // Will be 'draft_<timestamp>'
  syncPending?: boolean; // True if blockchain submission failed
  blockchainId?: string; // Set when confirmed on-chain
}

class InvoiceStorage {
  private getDrafts(): DraftInvoice[] {
    try {
      // First, try to migrate old data
      this.migrateOldData();
      
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading drafts from localStorage:', error);
      return [];
    }
  }

  // Migrate invoices from old storage format
  private migrateOldData(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Check if we've already migrated
        const migrationKey = 'invoiced_migration_completed';
        if (localStorage.getItem(migrationKey)) {
          return; // Already migrated
        }

        // Check for old invoice storage keys
        const oldKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('invoiced_invoices_')) {
            oldKeys.push(key);
          }
        }

        // Migrate each old key
        oldKeys.forEach(oldKey => {
          const oldData = localStorage.getItem(oldKey);
          if (oldData) {
            try {
              const oldInvoices = JSON.parse(oldData);
              if (Array.isArray(oldInvoices)) {
                // Convert old invoices to new format
                const migratedInvoices = oldInvoices.map((oldInvoice: unknown) => ({
                  ...(oldInvoice as Record<string, unknown>),
                  // Ensure required fields exist
                  expiresAt: (oldInvoice as { expiresAt?: string }).expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                  payToAddress: (oldInvoice as { payToAddress?: string; bitcoinAddress?: string }).payToAddress || (oldInvoice as { bitcoinAddress?: string }).bitcoinAddress || '',
                  requestedAmount: (oldInvoice as { requestedAmount?: string; amount?: { toString: () => string } }).requestedAmount || (oldInvoice as { amount?: { toString: () => string } }).amount?.toString() || '0',
                  balanceAtCreation: (oldInvoice as { balanceAtCreation?: string }).balanceAtCreation || '0',
                  status: (oldInvoice as { status?: string }).status || 'pending',
                }));

                // Add to current drafts
                const currentDrafts = this.getDraftsWithoutMigration();
                const newDrafts = [...currentDrafts, ...migratedInvoices];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newDrafts));

                console.log(`✅ Migrated ${migratedInvoices.length} invoices from ${oldKey}`);
                
                // Remove old key after migration
                localStorage.removeItem(oldKey);
              }
            } catch (error) {
              console.warn(`⚠️ Failed to migrate invoices from ${oldKey}:`, error);
            }
          }
        });

        // Mark migration as completed
        localStorage.setItem(migrationKey, 'true');
      }
    } catch (error) {
      console.error('Failed to migrate old invoice data:', error);
    }
  }

  // Helper method to get drafts without triggering migration
  private getDraftsWithoutMigration(): DraftInvoice[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading drafts from localStorage:', error);
      return [];
    }
  }

  private saveDrafts(drafts: DraftInvoice[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving drafts to localStorage:', error);
    }
  }

  saveDraft(draft: DraftInvoice): void {
    const drafts = this.getDrafts();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.push(draft);
    }
    
    this.saveDrafts(drafts);
    console.log('💾 Draft saved:', draft.id, draft.clientName);
  }

  updateDraft(id: string, updates: Partial<DraftInvoice>): void {
    const drafts = this.getDrafts();
    const index = drafts.findIndex(d => d.id === id);
    
    if (index >= 0) {
      drafts[index] = { ...drafts[index], ...updates };
      this.saveDrafts(drafts);
      console.log('💾 Draft updated:', id, updates);
    }
  }

  removeDraft(id: string): void {
    const drafts = this.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    this.saveDrafts(filtered);
    console.log('💾 Draft removed:', id);
  }

  markCancelled(id: string): void {
    const drafts = this.getDrafts();
    const index = drafts.findIndex(d => d.id === id);
    
    if (index >= 0) {
      drafts[index] = { ...drafts[index], status: 'cancelled' };
      this.saveDrafts(drafts);
      console.log('💾 Draft marked as cancelled:', id);
    }
  }

  listDrafts(): DraftInvoice[] {
    const drafts = this.getDrafts();
    console.log('💾 Loaded drafts:', drafts.length);
    return drafts;
  }

  markSynced(draftId: string, blockchainId: string): void {
    this.updateDraft(draftId, { 
      blockchainId, 
      syncPending: false,
      status: 'pending' // Keep as pending until marked paid
    });
  }

  // Create a new invoice with proper timestamps and expiry
  createInvoice(formData: unknown): DraftInvoice {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const form = formData as {
      clientName: string;
      clientCode?: string;
      details: string;
      amount: string;
      currency?: string;
      bitcoinAddress: string;
      payToAddress?: string;
      balanceAtCreation?: string;
    };

    // Convert requested amount (BTC decimal) to wei string for on-chain consistency
    const requestedAmountWei = (() => {
      try {
        return parseEther(form.amount).toString();
      } catch {
        return '0';
      }
    })();

    const invoice: DraftInvoice = {
      id: `draft_${Date.now()}`,
      clientName: form.clientName,
      clientCode: form.clientCode || '',
      details: form.details,
      amount: parseFloat(form.amount),
      currency: (form.currency as 'USD' | 'KES') || 'USD',
      musdAmount: parseFloat(form.amount), // Assuming 1:1 for now
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      wallet: form.bitcoinAddress,
      bitcoinAddress: form.bitcoinAddress,
      payToAddress: form.payToAddress ?? '',
      creator: '', // Will be set when synced
      recipient: '', // Will be set when synced
      requestedAmount: requestedAmountWei,
      balanceAtCreation: form.balanceAtCreation || '0',
      syncPending: true,
    };

    this.saveDraft(invoice);
    return invoice;
  }

  // Mark invoice as paid
  markAsPaid(invoiceId: string, observedAmount?: string, txHash?: string): void {
    this.updateDraft(invoiceId, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      observedInboundAmount: observedAmount,
      paymentTxHash: txHash,
    });
  }

  // Mark invoice as expired
  markAsExpired(invoiceId: string): void {
    this.updateDraft(invoiceId, {
      status: 'expired',
    });
  }

  // Get invoices that are about to expire (within 5 minutes)
  getExpiringInvoices(): DraftInvoice[] {
    const drafts = this.getDrafts();
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    return drafts.filter(draft => {
      if (draft.status !== 'pending') return false;
      const expiresAt = new Date(draft.expiresAt);
      return expiresAt <= fiveMinutesFromNow;
    });
  }

  // Get expired invoices that need status update
  getExpiredInvoices(): DraftInvoice[] {
    const drafts = this.getDrafts();
    const now = new Date();
    
    return drafts.filter(draft => {
      if (draft.status !== 'pending') return false;
      const expiresAt = new Date(draft.expiresAt);
      return expiresAt <= now;
    });
  }

  clearSynced(): void {
    // Remove drafts that have been synced to blockchain
    const drafts = this.getDrafts();
    const unsynced = drafts.filter(d => !d.blockchainId);
    this.saveDrafts(unsynced);
    console.log('💾 Cleared synced drafts, kept:', unsynced.length);
  }

  clearOldCancelled(): void {
    // Remove cancelled drafts older than 30 days
    const drafts = this.getDrafts();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const active = drafts.filter(d => {
      if (d.status === 'cancelled') {
        const createdAt = new Date(d.createdAt).getTime();
        return createdAt > thirtyDaysAgo; // Keep cancelled invoices less than 30 days old
      }
      return true; // Keep all non-cancelled invoices
    });
    this.saveDrafts(active);
    console.log('💾 Cleaned old cancelled drafts, kept:', active.length);
  }

  cleanupOldInvoices(): void {
    // Clean up old invoices to prevent localStorage from growing too large
    const drafts = this.getDrafts();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const active = drafts.filter(d => {
      const createdAt = new Date(d.createdAt).getTime();
      
      // Keep all invoices less than 30 days old
      if (createdAt > thirtyDaysAgo) {
        return true;
      }
      
      // For older invoices, only keep paid ones (they're important)
      return d.status === 'paid';
    });
    
    if (active.length !== drafts.length) {
      this.saveDrafts(active);
      console.log('💾 Cleaned up old invoices, kept:', active.length, 'removed:', drafts.length - active.length);
    }
  }

  getDraftById(id: string): DraftInvoice | null {
    const drafts = this.getDrafts();
    return drafts.find(d => d.id === id) || null;
  }

  getPendingSyncDrafts(): DraftInvoice[] {
    const drafts = this.getDrafts();
    return drafts.filter(d => d.syncPending && !d.blockchainId);
  }

  // Clear all invoices (for testing)
  clearAllInvoices(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🧹 Starting invoice cleanup...');
        
        // Log what we're about to clear
        const currentDrafts = this.getDrafts();
        console.log('📋 Current invoices before clearing:', currentDrafts.length);
        
        // Clear main storage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('invoiced_migration_completed');
        
        // Clear any old invoice storage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('invoiced_invoices_') || key.startsWith('invoiced_local_drafts'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ Removed key:', key);
        });
        
        // Verify clearing worked
        const remainingDrafts = this.getDrafts();
        console.log('✅ Verification - remaining invoices after clearing:', remainingDrafts.length);
        
        if (remainingDrafts.length > 0) {
          console.warn('⚠️ Some invoices still remain:', remainingDrafts);
        } else {
          console.log('✅ All invoices cleared successfully');
        }
      }
    } catch (error) {
      console.error('Failed to clear invoices:', error);
    }
  }

  // Force clear all data (manual override)
  forceClearAllData(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🚨 FORCE CLEARING ALL DATA...');
        
        // Clear ALL localStorage keys that might contain invoice data
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('invoice') || 
            key.includes('draft') || 
            key.includes('boar_transactions') ||
            key.startsWith('invoiced_')
          )) {
            allKeys.push(key);
          }
        }
        
        allKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ FORCE REMOVED:', key);
        });
        
        console.log('✅ FORCE CLEAR COMPLETE');
      }
    } catch (error) {
      console.error('Force clear failed:', error);
    }
  }
}

export const invoiceStorage = new InvoiceStorage();
