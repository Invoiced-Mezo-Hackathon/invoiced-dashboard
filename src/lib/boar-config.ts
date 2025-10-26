// Boar Network API Configuration
// Provides enhanced blockchain monitoring for Mezo testnet

export interface BoarConfig {
  apiKey: string;
  wsUrl: string;
  httpUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export const BOAR_CONFIG: BoarConfig = {
  apiKey: import.meta.env.VITE_BOAR_API_KEY || 'WfNc1YhD65vUESGOdWFMCGrvl6S5FMgg',
  wsUrl: import.meta.env.VITE_BOAR_WS_URL || 'wss://api.boar.network/ws',
  httpUrl: import.meta.env.VITE_BOAR_HTTP_URL || 'https://api.boar.network/api',
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 10,
};

// Mezo testnet explorer URL
export const MEZO_EXPLORER_URL = 'https://explorer.test.mezo.org';

// WebSocket message types for Boar API
export interface BoarMessage {
  type: 'subscribe' | 'unsubscribe' | 'transaction' | 'block' | 'error';
  data?: any;
  address?: string;
  txHash?: string;
  blockNumber?: number;
  timestamp?: number;
}

// Transaction data from Boar WebSocket
export interface BoarTransaction {
  hash: string;
  from: string;
  to: string;
  value: string; // in wei
  blockNumber: number;
  timestamp: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Subscription request for monitoring addresses
export interface AddressSubscription {
  address: string;
  invoiceId: string;
  expectedAmount?: string; // Expected payment amount in wei
}

// Error handling
export class BoarError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BoarError';
  }
}

export const BOAR_ERRORS = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  SUBSCRIPTION_FAILED: 'SUBSCRIPTION_FAILED',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  API_KEY_INVALID: 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;
