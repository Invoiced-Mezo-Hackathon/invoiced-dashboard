import { Invoice } from '@/types/invoice';
import { parseEther } from 'viem';

// Helper function to get storage key scoped by wallet address
function getStorageKey(address: string | null | undefined): string {
  if (!address) return '';
  return `invoiced_local_drafts_v1_${address.toLowerCase()}`;
}

export interface DraftInvoice extends Omit<Invoice, 'id'> {
  id: string; // Will be 'draft_<timestamp>'
  syncPending?: boolean; // True if blockchain submission failed
  blockchainId?: string; // Set when confirmed on-chain
}

class InvoiceStorage {
  private getDrafts(address: string | null | undefined): DraftInvoice[] {
    if (!address) return [];
    try {
      const storageKey = getStorageKey(address);
      if (!storageKey) return [];
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading drafts from localStorage:', error);
      return [];
    }
  }

  private saveDrafts(address: string | null | undefined, drafts: DraftInvoice[]): void {
    if (!address) return;
    try {
      const storageKey = getStorageKey(address);
      if (!storageKey) return;
      localStorage.setItem(storageKey, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving drafts to localStorage:', error);
    }
  }

  saveDraft(address: string | null | undefined, draft: DraftInvoice): void {
    if (!address) return;
    const drafts = this.getDrafts(address);
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.push(draft);
    }
    
    this.saveDrafts(address, drafts);
    console.log('💾 Draft saved:', draft.id, draft.clientName);
  }

  updateDraft(address: string | null | undefined, id: string, updates: Partial<DraftInvoice>): void {
    if (!address) return;
    const drafts = this.getDrafts(address);
    const index = drafts.findIndex(d => d.id === id);
    
    if (index >= 0) {
      drafts[index] = { ...drafts[index], ...updates };
      this.saveDrafts(address, drafts);
      console.log('💾 Draft updated:', id, updates);
    }
  }

  removeDraft(address: string | null | undefined, id: string): void {
    if (!address) return;
    const drafts = this.getDrafts(address);
    const filtered = drafts.filter(d => d.id !== id);
    this.saveDrafts(address, filtered);
    console.log('💾 Draft removed:', id);
  }

  markCancelled(address: string | null | undefined, id: string): void {
    if (!address) return;
    const drafts = this.getDrafts(address);
    const index = drafts.findIndex(d => d.id === id);
    
    if (index >= 0) {
      drafts[index] = { ...drafts[index], status: 'cancelled' };
      this.saveDrafts(address, drafts);
      console.log('💾 Draft marked as cancelled:', id);
    }
  }

  listDrafts(address: string | null | undefined): DraftInvoice[] {
    if (!address) return [];
    const drafts = this.getDrafts(address);
    console.log('💾 Loaded drafts:', drafts.length);
    return drafts;
  }

  markSynced(address: string | null | undefined, draftId: string, blockchainId: string): void {
    if (!address) return;
    this.updateDraft(address, draftId, { 
      blockchainId, 
      syncPending: false,
      status: 'pending' // Keep as pending until marked paid
    });
  }

  // Create a new invoice with proper timestamps and expiry
  createInvoice(address: string | null | undefined, formData: unknown): DraftInvoice | null {
    if (!address) return null;
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

    this.saveDraft(address, invoice);
    return invoice;
  }

  // Mark invoice as paid
  markAsPaid(address: string | null | undefined, invoiceId: string, observedAmount?: string, txHash?: string): void {
    if (!address) return;
    this.updateDraft(address, invoiceId, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      observedInboundAmount: observedAmount,
      paymentTxHash: txHash,
    });
  }

  // Mark invoice as expired
  markAsExpired(address: string | null | undefined, invoiceId: string): void {
    if (!address) return;
    this.updateDraft(address, invoiceId, {
      status: 'expired',
    });
  }

  // Get invoices that are about to expire (within 5 minutes)
  getExpiringInvoices(address: string | null | undefined): DraftInvoice[] {
    if (!address) return [];
    const drafts = this.getDrafts(address);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    return drafts.filter(draft => {
      if (draft.status !== 'pending') return false;
      const expiresAt = new Date(draft.expiresAt);
      return expiresAt <= fiveMinutesFromNow;
    });
  }

  // Get expired invoices that need status update
  getExpiredInvoices(address: string | null | undefined): DraftInvoice[] {
    if (!address) return [];
    const drafts = this.getDrafts(address);
    const now = new Date();
    
    return drafts.filter(draft => {
      if (draft.status !== 'pending') return false;
      const expiresAt = new Date(draft.expiresAt);
      return expiresAt <= now;
    });
  }

  clearSynced(address: string | null | undefined): void {
    if (!address) return;
    // Remove drafts that have been synced to blockchain
    const drafts = this.getDrafts(address);
    const unsynced = drafts.filter(d => !d.blockchainId);
    this.saveDrafts(address, unsynced);
    console.log('💾 Cleared synced drafts, kept:', unsynced.length);
  }

  clearOldCancelled(address: string | null | undefined): void {
    if (!address) return;
    // Remove cancelled drafts older than 30 days
    const drafts = this.getDrafts(address);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const active = drafts.filter(d => {
      if (d.status === 'cancelled') {
        const createdAt = new Date(d.createdAt).getTime();
        return createdAt > thirtyDaysAgo; // Keep cancelled invoices less than 30 days old
      }
      return true; // Keep all non-cancelled invoices
    });
    this.saveDrafts(address, active);
    console.log('💾 Cleaned old cancelled drafts, kept:', active.length);
  }

  cleanupOldInvoices(address: string | null | undefined): void {
    if (!address) return;
    // Clean up old invoices to prevent localStorage from growing too large
    const drafts = this.getDrafts(address);
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
      this.saveDrafts(address, active);
      console.log('💾 Cleaned up old invoices, kept:', active.length, 'removed:', drafts.length - active.length);
    }
  }

  getDraftById(address: string | null | undefined, id: string): DraftInvoice | null {
    if (!address) return null;
    const drafts = this.getDrafts(address);
    return drafts.find(d => d.id === id) || null;
  }

  getPendingSyncDrafts(address: string | null | undefined): DraftInvoice[] {
    if (!address) return [];
    const drafts = this.getDrafts(address);
    return drafts.filter(d => d.syncPending && !d.blockchainId);
  }

  // Clear all invoices for a specific wallet (for testing)
  clearAllInvoices(address: string | null | undefined): void {
    if (!address) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🧹 Starting invoice cleanup for wallet:', address);
        
        // Log what we're about to clear
        const currentDrafts = this.getDrafts(address);
        console.log('📋 Current invoices before clearing:', currentDrafts.length);
        
        // Clear storage for this wallet
        const storageKey = getStorageKey(address);
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
        
        console.log('✅ All invoices cleared for wallet:', address);
      }
    } catch (error) {
      console.error('Failed to clear invoices:', error);
    }
  }
}

export const invoiceStorage = new InvoiceStorage();
