// Transaction Storage Service
// Handles persistence of detected Bitcoin transactions

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
  // kept for future file-based persistence (unused in browser env)
  // private _storageFile = 'transactions.json';
  private data: TransactionStorage = {
    transactions: [],
    lastUpdated: Date.now(),
  };

  constructor() {
    this.loadFromStorage();
  }

  // Load transactions from JSON file
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('boar_transactions');
        if (stored) {
          this.data = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load transaction storage:', error);
      this.data = { transactions: [], lastUpdated: Date.now() };
    }
  }

  // Save transactions to JSON file
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('boar_transactions', JSON.stringify(this.data));
      }
    } catch (error) {
      console.error('Failed to save transaction storage:', error);
    }
  }

  // Add a new transaction
  addTransaction(transaction: Omit<StoredTransaction, 'detectedAt'>): void {
    const newTransaction: StoredTransaction = {
      ...transaction,
      detectedAt: Date.now(),
    };

    // Check if transaction already exists
    const exists = this.data.transactions.find(tx => tx.txHash === transaction.txHash);
    if (!exists) {
      this.data.transactions.push(newTransaction);
      this.data.lastUpdated = Date.now();
      this.saveToStorage();
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactions_updated'));
        }
      } catch {}
    }
  }

  // Get all transactions
  getAllTransactions(): StoredTransaction[] {
    return [...this.data.transactions];
  }

  // Get transactions for a specific invoice
  getTransactionsForInvoice(invoiceId: string): StoredTransaction[] {
    return this.data.transactions.filter(tx => tx.invoiceId === invoiceId);
  }

  // Get transaction by hash
  getTransactionByHash(txHash: string): StoredTransaction | undefined {
    return this.data.transactions.find(tx => tx.txHash === txHash);
  }

  // Update transaction confirmations
  updateTransactionConfirmations(txHash: string, confirmations: number): void {
    const transaction = this.data.transactions.find(tx => tx.txHash === txHash);
    if (transaction) {
      transaction.confirmations = confirmations;
      transaction.status = confirmations >= 1 ? 'confirmed' : 'pending';
      this.data.lastUpdated = Date.now();
      this.saveToStorage();
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactions_updated'));
        }
      } catch {}
    }
  }

  // Update transaction status
  updateTransactionStatus(txHash: string, status: 'pending' | 'confirmed' | 'failed'): void {
    const transaction = this.data.transactions.find(tx => tx.txHash === txHash);
    if (transaction) {
      transaction.status = status;
      this.data.lastUpdated = Date.now();
      this.saveToStorage();
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactions_updated'));
        }
      } catch {}
    }
  }

  // Get recent transactions (last 24 hours)
  getRecentTransactions(): StoredTransaction[] {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.data.transactions.filter(tx => tx.detectedAt > oneDayAgo);
  }

  // Clear all transactions (for testing)
  clearAllTransactions(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('boar_transactions');
        console.log('✅ Cleared all transactions');
      }
    } catch (error) {
      console.error('Failed to clear transactions:', error);
    }
  }

  // Get storage statistics
  getStats(): { totalTransactions: number; confirmedTransactions: number; pendingTransactions: number } {
    const total = this.data.transactions.length;
    const confirmed = this.data.transactions.filter(tx => tx.status === 'confirmed').length;
    const pending = this.data.transactions.filter(tx => tx.status === 'pending').length;

    return { totalTransactions: total, confirmedTransactions: confirmed, pendingTransactions: pending };
  }
}

// Export singleton instance
export const transactionStorage = new TransactionStorageService();
