// Transaction Storage Service
// Handles persistence of detected Bitcoin transactions

// Helper function to get storage key scoped by wallet address
function getStorageKey(address: string | null | undefined): string {
  if (!address) return '';
  return `boar_transactions_${address.toLowerCase()}`;
}

export interface StoredTransaction {
  txHash: string;
  invoiceId: string;
  from: string;
  to: string;
  amount: string; // in wei
  blockNumber: number;
  timestamp: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  detectedAt: number; // when we first detected it
}

export interface TransactionStorage {
  transactions: StoredTransaction[];
  lastUpdated: number;
}

class TransactionStorageService {
  // Load transactions from storage for a specific address (lazy loading)
  private loadFromStorage(address: string | null | undefined): TransactionStorage {
    if (!address) {
      return { transactions: [], lastUpdated: Date.now() };
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storageKey = getStorageKey(address);
        if (!storageKey) {
          return { transactions: [], lastUpdated: Date.now() };
        }
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load transaction storage:', error);
    }
    return { transactions: [], lastUpdated: Date.now() };
  }

  // Save transactions to storage for a specific address
  private saveToStorage(address: string | null | undefined, data: TransactionStorage): void {
    if (!address) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storageKey = getStorageKey(address);
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save transaction storage:', error);
    }
  }

  // Add a new transaction
  addTransaction(address: string | null | undefined, transaction: Omit<StoredTransaction, 'detectedAt'>): void {
    if (!address) return;
    const data = this.loadFromStorage(address);
    const newTransaction: StoredTransaction = {
      ...transaction,
      detectedAt: Date.now(),
    };

    // Check if transaction already exists
    const exists = data.transactions.find(tx => tx.txHash === transaction.txHash);
    if (!exists) {
      data.transactions.push(newTransaction);
      data.lastUpdated = Date.now();
      this.saveToStorage(address, data);
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactions_updated'));
        }
      } catch {}
    }
  }

  // Get all transactions
  getAllTransactions(address: string | null | undefined): StoredTransaction[] {
    if (!address) return [];
    const data = this.loadFromStorage(address);
    return [...data.transactions];
  }

  // Get transactions for a specific invoice
  getTransactionsForInvoice(address: string | null | undefined, invoiceId: string): StoredTransaction[] {
    if (!address) return [];
    const data = this.loadFromStorage(address);
    return data.transactions.filter(tx => tx.invoiceId === invoiceId);
  }

  // Get transaction by hash
  getTransactionByHash(address: string | null | undefined, txHash: string): StoredTransaction | undefined {
    if (!address) return undefined;
    const data = this.loadFromStorage(address);
    return data.transactions.find(tx => tx.txHash === txHash);
  }

  // Update transaction confirmations
  updateTransactionConfirmations(address: string | null | undefined, txHash: string, confirmations: number): void {
    if (!address) return;
    const data = this.loadFromStorage(address);
    const transaction = data.transactions.find(tx => tx.txHash === txHash);
    if (transaction) {
      transaction.confirmations = confirmations;
      transaction.status = confirmations >= 1 ? 'confirmed' : 'pending';
      data.lastUpdated = Date.now();
      this.saveToStorage(address, data);
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactions_updated'));
        }
      } catch {}
    }
  }

  // Update transaction status
  updateTransactionStatus(address: string | null | undefined, txHash: string, status: 'pending' | 'confirmed' | 'failed'): void {
    if (!address) return;
    const data = this.loadFromStorage(address);
    const transaction = data.transactions.find(tx => tx.txHash === txHash);
    if (transaction) {
      transaction.status = status;
      data.lastUpdated = Date.now();
      this.saveToStorage(address, data);
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactions_updated'));
        }
      } catch {}
    }
  }

  // Get recent transactions (last 24 hours)
  getRecentTransactions(address: string | null | undefined): StoredTransaction[] {
    if (!address) return [];
    const data = this.loadFromStorage(address);
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return data.transactions.filter(tx => tx.detectedAt > oneDayAgo);
  }

  // Clear all transactions for a specific wallet (for testing)
  clearAllTransactions(address: string | null | undefined): void {
    if (!address) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storageKey = getStorageKey(address);
        if (storageKey) {
          localStorage.removeItem(storageKey);
          console.log('✅ Cleared all transactions for wallet:', address);
        }
      }
    } catch (error) {
      console.error('Failed to clear transactions:', error);
    }
  }

  // Get storage statistics
  getStats(address: string | null | undefined): { totalTransactions: number; confirmedTransactions: number; pendingTransactions: number } {
    if (!address) {
      return { totalTransactions: 0, confirmedTransactions: 0, pendingTransactions: 0 };
    }
    const data = this.loadFromStorage(address);
    const total = data.transactions.length;
    const confirmed = data.transactions.filter(tx => tx.status === 'confirmed').length;
    const pending = data.transactions.filter(tx => tx.status === 'pending').length;

    return { totalTransactions: total, confirmedTransactions: confirmed, pendingTransactions: pending };
  }
}

// Export singleton instance
export const transactionStorage = new TransactionStorageService();
