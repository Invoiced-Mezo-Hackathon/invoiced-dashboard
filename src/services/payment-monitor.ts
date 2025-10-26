// Payment Monitor Service
// Real-time Bitcoin transaction monitoring using Boar Network WebSocket API

import { BOAR_CONFIG, BoarMessage, BoarTransaction, AddressSubscription, BoarError, BOAR_ERRORS } from '@/lib/boar-config';
import { transactionStorage, StoredTransaction } from './transaction-storage';

export interface PaymentEvent {
  type: 'payment_detected' | 'payment_confirmed' | 'connection_status';
  invoiceId: string;
  transaction?: StoredTransaction;
  status?: 'connected' | 'disconnected' | 'reconnecting';
  error?: string;
}

export interface PaymentMonitorCallbacks {
  onPaymentDetected?: (event: PaymentEvent) => void;
  onPaymentConfirmed?: (event: PaymentEvent) => void;
  onConnectionStatus?: (event: PaymentEvent) => void;
  onError?: (error: BoarError) => void;
}

class PaymentMonitorService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptions = new Map<string, AddressSubscription>();
  private callbacks: PaymentMonitorCallbacks = {};
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Only connect if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  // Set event callbacks
  setCallbacks(callbacks: PaymentMonitorCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Connect to Boar WebSocket API
  private connect(): void {
    try {
      console.log('🔌 Connecting to Boar Network WebSocket...');
      
      // For now, simulate connection for demo purposes
      // In production, you would use the actual Boar WebSocket URL
      console.log('⚠️ Boar WebSocket connection simulated for demo');
      this.isConnected = true;
      this.notifyConnectionStatus('connected');
      
      // TODO: Replace with actual WebSocket connection when Boar endpoints are available
      // this.ws = new WebSocket(`${BOAR_CONFIG.wsUrl}?apiKey=${BOAR_CONFIG.apiKey}`);
      
    } catch (error) {
      console.error('🚨 Failed to connect to Boar Network:', error);
      this.notifyError(new BoarError('Failed to connect', BOAR_ERRORS.CONNECTION_FAILED, error));
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: string): void {
    try {
      const message: BoarMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'transaction':
          this.handleTransaction(message.data);
          break;
        case 'block':
          this.handleBlock(message.data);
          break;
        case 'error':
          this.handleError(message.data);
          break;
        default:
          console.log('📨 Received message:', message.type);
      }
    } catch (error) {
      console.error('🚨 Failed to parse WebSocket message:', error);
      this.notifyError(new BoarError('Invalid message format', BOAR_ERRORS.INVALID_MESSAGE, error));
    }
  }

  // Handle transaction notifications
  private handleTransaction(transaction: BoarTransaction): void {
    console.log('💰 Transaction detected:', transaction.hash);
    
    // Find matching subscription
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.address.toLowerCase() === transaction.to.toLowerCase());
    
    if (subscription) {
      console.log('🎯 Transaction matches invoice:', subscription.invoiceId);
      
      // Store transaction
      const storedTransaction: Omit<StoredTransaction, 'detectedAt'> = {
        txHash: transaction.hash,
        invoiceId: subscription.invoiceId,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.value,
        blockNumber: transaction.blockNumber,
        timestamp: transaction.timestamp,
        confirmations: transaction.confirmations,
        status: transaction.status,
      };
      
      transactionStorage.addTransaction(storedTransaction);
      
      // Notify payment detected
      this.notifyPaymentDetected(subscription.invoiceId, storedTransaction);
    }
  }

  // Handle new block notifications
  private handleBlock(blockData: any): void {
    // Update confirmation counts for pending transactions
    const pendingTransactions = transactionStorage.getAllTransactions()
      .filter(tx => tx.status === 'pending');
    
    pendingTransactions.forEach(tx => {
      const confirmations = blockData.number - tx.blockNumber + 1;
      transactionStorage.updateTransactionConfirmations(tx.txHash, confirmations);
      
      if (confirmations >= 1) {
        this.notifyPaymentConfirmed(tx.invoiceId, tx);
      }
    });
  }

  // Handle error messages
  private handleError(errorData: any): void {
    console.error('🚨 Boar API error:', errorData);
    this.notifyError(new BoarError(errorData.message || 'Unknown error', errorData.code || 'UNKNOWN_ERROR', errorData));
  }

  // Subscribe to monitor an address
  subscribeToAddress(subscription: AddressSubscription): void {
    console.log('👀 Subscribing to address:', subscription.address, 'for invoice:', subscription.invoiceId);
    
    this.subscriptions.set(subscription.address.toLowerCase(), subscription);
    
    if (this.isConnected && this.ws) {
      this.sendSubscription(subscription.address);
    }
    
    // For demo purposes, simulate a payment after 5 seconds
    // Remove this in production
    setTimeout(() => {
      this.simulatePayment(subscription);
    }, 5000);
  }

  // Simulate payment for demo purposes
  private simulatePayment(subscription: AddressSubscription): void {
    console.log('🎭 Simulating payment for demo...');
    
    const mockTransaction: StoredTransaction = {
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      invoiceId: subscription.invoiceId,
      from: '0x1234567890123456789012345678901234567890',
      to: subscription.address,
      amount: subscription.expectedAmount || '1000000000000000000', // 1 BTC in wei
      blockNumber: 12345,
      timestamp: Math.floor(Date.now() / 1000),
      confirmations: 1,
      status: 'confirmed',
      detectedAt: Date.now(),
    };
    
    transactionStorage.addTransaction(mockTransaction);
    this.notifyPaymentDetected(subscription.invoiceId, mockTransaction);
  }

  // Unsubscribe from monitoring an address
  unsubscribeFromAddress(address: string): void {
    console.log('👋 Unsubscribing from address:', address);
    
    this.subscriptions.delete(address.toLowerCase());
    
    if (this.isConnected && this.ws) {
      this.sendUnsubscription(address);
    }
  }

  // Send subscription request
  private sendSubscription(address: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: BoarMessage = {
        type: 'subscribe',
        address: address,
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Send unsubscription request
  private sendUnsubscription(address: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: BoarMessage = {
        type: 'unsubscribe',
        address: address,
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Resubscribe to all addresses after reconnection
  private resubscribeAll(): void {
    console.log('🔄 Resubscribing to all addresses...');
    this.subscriptions.forEach((subscription, address) => {
      this.sendSubscription(address);
    });
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectAttempts < BOAR_CONFIG.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = BOAR_CONFIG.reconnectInterval * this.reconnectAttempts;
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${BOAR_CONFIG.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.notifyConnectionStatus('reconnecting');
        this.connect();
      }, delay);
    } else {
      console.error('🚨 Max reconnection attempts reached');
      this.notifyError(new BoarError('Max reconnection attempts reached', BOAR_ERRORS.CONNECTION_FAILED));
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Notify payment detected
  private notifyPaymentDetected(invoiceId: string, transaction: StoredTransaction): void {
    const event: PaymentEvent = {
      type: 'payment_detected',
      invoiceId,
      transaction,
    };
    
    this.callbacks.onPaymentDetected?.(event);
  }

  // Notify payment confirmed
  private notifyPaymentConfirmed(invoiceId: string, transaction: StoredTransaction): void {
    const event: PaymentEvent = {
      type: 'payment_confirmed',
      invoiceId,
      transaction,
    };
    
    this.callbacks.onPaymentConfirmed?.(event);
  }

  // Notify connection status
  private notifyConnectionStatus(status: 'connected' | 'disconnected' | 'reconnecting'): void {
    const event: PaymentEvent = {
      type: 'connection_status',
      invoiceId: '',
      status,
    };
    
    this.callbacks.onConnectionStatus?.(event);
  }

  // Notify error
  private notifyError(error: BoarError): void {
    this.callbacks.onError?.(error);
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get active subscriptions count
  getActiveSubscriptions(): number {
    return this.subscriptions.size;
  }

  // Get subscription info
  getSubscription(address: string): AddressSubscription | undefined {
    return this.subscriptions.get(address.toLowerCase());
  }

  // Disconnect and cleanup
  disconnect(): void {
    console.log('👋 Disconnecting from Boar Network...');
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const paymentMonitor = new PaymentMonitorService();
