// Invoice types for blockchain integration

export interface BlockchainInvoice {
  id: number;
  creator: string;
  recipient: string;
  amount: string; // BigInt as string for precision
  description: string;
  bitcoinAddress: string;
  clientName: string;
  clientCode: string;
  paid: boolean;
  cancelled: boolean;
  createdAt: number; // Unix timestamp
  paidAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
  payToAddress: string; // Actual payment destination address
  paymentTxHash: string; // Bitcoin transaction hash
  observedInboundAmount: string; // Actual amount received
  currency: string; // Invoice currency (USD/KES/BTC)
  balanceAtCreation: string; // Balance snapshot for verification
}

export interface Invoice {
  id: string;
  clientName: string;
  clientCode: string;
  details: string;
  amount: number;
  currency: 'USD' | 'KES';
  musdAmount: number;
  status: 'draft' | 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (createdAt + 1 hour)
  wallet: string; // Bitcoin address
  bitcoinAddress: string; // Same as wallet, for clarity
  payToAddress: string; // Address provided in invoice form for payment
  creator: string; // Ethereum address
  recipient: string; // Ethereum address
  paidAt?: string; // ISO string, only if paid
  txHash?: string; // Transaction hash for creation
  paymentTxHash?: string; // Transaction hash for payment confirmation
  requestedAmount: string; // Amount in wei (10^18 base unit), stored as string
  observedInboundAmount?: string; // Actual amount received
  balanceAtCreation?: string; // Snapshot from Boar at creation time
}

export interface InvoiceFormData {
  clientName: string;
  details: string;
  amount: string;
  currency: 'USD' | 'KES';
  bitcoinAddress: string;
  payToAddress: string; // Address for payment
  balanceAtCreation?: string; // Balance snapshot at creation time
}

export interface InvoiceStats {
  totalRevenue: number;
  activeInvoices: number;
  pendingAmount: number;
  totalInvoices: number;
  paidInvoices: number;
}

export interface PaymentHistory {
  id: string;
  invoiceId: string;
  clientName: string;
  amount: number;
  currency: string;
  bitcoinAddress: string;
  paidAt: string;
  txHash: string;
  // Enhanced transaction details
  blockNumber?: number;
  confirmations?: number;
  from?: string;
  to?: string;
  gasUsed?: string;
  gasPrice?: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

// Transaction states
export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

// Contract events
export interface InvoiceCreatedEvent {
  id: number;
  creator: string;
  recipient: string;
  amount: string;
  bitcoinAddress: string;
  clientName: string;
  payToAddress: string;
  currency: string;
  expiresAt: number;
  txHash: string;
  blockNumber: number;
}

export interface InvoicePaidEvent {
  id: number;
  amount: string;
  timestamp: number;
  paymentTxHash: string;
  observedInboundAmount: string;
  txHash: string;
  blockNumber: number;
}

export interface InvoiceCancelledEvent {
  id: number;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

// Utility types
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'expired' | 'cancelled';

export interface InvoiceFilters {
  status?: InvoiceStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientName?: string;
}

// Hook return types
export interface UseInvoiceContractReturn {
  // Data
  invoices: Invoice[];
  stats: InvoiceStats;
  paymentHistory: PaymentHistory[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isConfirming: boolean;
  isCancelling: boolean;
  
  // Transaction states
  createTx: TransactionState;
  confirmTx: TransactionState;
  cancelTx: TransactionState;
  
  // Actions
  createInvoice: (data: InvoiceFormData) => Promise<void>;
  confirmPayment: (invoiceId: string) => Promise<void>;
  cancelInvoice: (invoiceId: string) => Promise<void>;
  approveInvoice: (invoiceId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}
