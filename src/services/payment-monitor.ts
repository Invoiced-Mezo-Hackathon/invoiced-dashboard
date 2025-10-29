// Payment Monitor Service
// Real-time Bitcoin transaction monitoring using Boar Network WebSocket API

import { BOAR_CONFIG, BoarMessage, BoarTransaction, AddressSubscription, BoarError, BOAR_ERRORS } from '@/lib/boar-config';
import { transactionStorage, StoredTransaction } from './transaction-storage';
import { boarRPC } from './boar-rpc';
import { invoiceStorage } from './invoice-storage';
import { Invoice } from '@/types/invoice';

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
    // Merge with existing callbacks instead of replacing
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('📝 Payment monitor callbacks updated');
  }

  // Connect to Boar WebSocket API
  private connect(): void {
    try {
      console.log('🔌 Connecting to Boar Network WebSocket...');
      console.log('🌐 WebSocket URL:', BOAR_CONFIG.wsUrl);
      
      // Connect to Boar Network WebSocket (API key is already in the URL)
      this.ws = new WebSocket(BOAR_CONFIG.wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to Boar Network WebSocket');
        console.log('🔗 Boar RPC endpoint:', BOAR_CONFIG.httpUrl);
        console.log('🔗 Boar WebSocket endpoint:', BOAR_CONFIG.wsUrl);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.resubscribeAll();
        this.notifyConnectionStatus('connected');
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 Boar WebSocket connection closed');
        this.isConnected = false;
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('🚨 Boar WebSocket error:', error);
        this.notifyError(new BoarError('WebSocket error', BOAR_ERRORS.CONNECTION_FAILED, error));
      };
      
    } catch (error) {
      console.error('🚨 Failed to connect to Boar Network:', error);
      this.notifyError(new BoarError('Failed to connect', BOAR_ERRORS.CONNECTION_FAILED, error));
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: string): void {
    try {
      // Handle ping/pong messages
      if (data === 'ping' || data === 'pong') {
        return;
      }
      
      const message: BoarMessage = JSON.parse(data);
      
      if (!message.type) {
        console.log('📨 Received message without type:', data);
        return;
      }
      
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
      console.error('📨 Raw data:', data);
      this.notifyError(new BoarError('Invalid message format', BOAR_ERRORS.INVALID_MESSAGE, error));
    }
  }

  // Handle transaction notifications
  private handleTransaction(transaction: BoarTransaction): void {
    console.log('💰 Mezo testnet transaction detected:', transaction.hash);
    console.log('   From:', transaction.from);
    console.log('   To:', transaction.to);
    console.log('   Value:', transaction.value);
    
    // Find matching subscription
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.address.toLowerCase() === transaction.to.toLowerCase());
    
    if (subscription) {
      console.log('🎯 Transaction matches invoice:', subscription.invoiceId);
      console.log('   Expected address:', subscription.address);
      
      // Check amount if expected amount is specified
      if (subscription.expectedAmount) {
        const receivedAmount = BigInt(transaction.value);
        const expectedAmount = BigInt(subscription.expectedAmount);
        
        console.log('   Expected amount:', subscription.expectedAmount);
        console.log('   Received amount:', transaction.value);
        
        // Payment must be >= expected amount (can be more, not less)
        if (receivedAmount < expectedAmount) {
          console.log('   ⚠️ Payment amount too low. Expected:', subscription.expectedAmount, 'Got:', transaction.value);
          console.log('   Shortfall:', (expectedAmount - receivedAmount).toString(), 'wei');
          return;
        }
        
        // Check if this is an overpayment
        if (receivedAmount > expectedAmount) {
          const overpayment = receivedAmount - expectedAmount;
          console.log('   💰 Overpayment detected! Extra amount:', overpayment.toString(), 'wei');
          console.log('   ✅ Payment accepted with overpayment (received > expected)');
        } else {
          console.log('   ✅ Payment amount accepted (received = expected)');
        }
      }
      
      // Store transaction
      const storedTransaction: StoredTransaction = {
        txHash: transaction.hash,
        invoiceId: subscription.invoiceId,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.value,
        blockNumber: transaction.blockNumber,
        timestamp: transaction.timestamp,
        confirmations: transaction.confirmations,
        status: transaction.status,
        detectedAt: Date.now(), // number, not string
      };
      
      transactionStorage.addTransaction(storedTransaction);
      
      // Automatically mark invoice as paid
      invoiceStorage.markAsPaid(subscription.invoiceId, transaction.value, transaction.hash);
      
      // Unsubscribe from this address since payment is complete
      this.unsubscribeFromAddress(subscription.address);
      
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
    console.log('👀 SUBSCRIBING to Mezo testnet address:', subscription.address, 'for invoice:', subscription.invoiceId);
    console.log('   Current connection status:', this.isConnected);
    console.log('   Active subscriptions before:', this.subscriptions.size);
    
    this.subscriptions.set(subscription.address.toLowerCase(), subscription);
    
    if (this.isConnected && this.ws) {
      this.sendSubscription(subscription.address);
      console.log('✅ Subscription sent to Boar Network');
    } else {
      // If not connected yet, it will resubscribe when connection is established
      console.log('⏳ Waiting for WebSocket connection to subscribe...');
      console.log('   Will resubscribe when connection is established');
    }
    console.log('   Active subscriptions after:', this.subscriptions.size);
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
      console.log('📡 Subscribing to Mezo testnet address:', address);
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
    this.subscriptions.forEach((_subscription, address) => {
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

  // Confirm if an invoice has been paid using Boar RPC
  async confirmInvoicePaid(invoice: Invoice): Promise<{ confirmed: boolean; amount: string; error?: string }> {
    try {
      console.log('🔍 ===== PAYMENT CONFIRMATION DEBUG =====');
      console.log('🔍 Checking payment for invoice:', invoice.id);
      console.log('🔍 Invoice payToAddress:', invoice.payToAddress);
      console.log('🔍 Invoice bitcoinAddress:', invoice.bitcoinAddress);
      console.log('🔍 Invoice requestedAmount:', invoice.requestedAmount);
      console.log('🔍 Invoice balanceAtCreation:', invoice.balanceAtCreation);
      console.log('🔍 Invoice expiresAt:', invoice.expiresAt);
      console.log('🔍 Invoice type:', typeof invoice.payToAddress);
      
      // Check if Boar is connected before attempting verification
      console.log('🔍 Boar connection status:', this.isConnected);
      console.log('🔍 Boar WebSocket state:', this.ws?.readyState);
      
      if (!this.isConnected) {
        console.log('❌ Boar Network not connected, cannot verify payment');
        return { confirmed: false, amount: '0', error: 'Boar Network not connected. Please wait for connection.' };
      }
      
      console.log('✅ Boar Network is connected, proceeding with payment verification');
      
      // Use payToAddress if available, otherwise fall back to bitcoinAddress
      let paymentAddress = invoice.payToAddress || invoice.bitcoinAddress;
      
      // Ensure paymentAddress is a string and not undefined/null
      if (!paymentAddress || typeof paymentAddress !== 'string') {
        console.log('❌ No valid payment address found in invoice');
        console.log('   payToAddress:', invoice.payToAddress, 'type:', typeof invoice.payToAddress);
        console.log('   bitcoinAddress:', invoice.bitcoinAddress, 'type:', typeof invoice.bitcoinAddress);
        return { confirmed: false, amount: '0', error: 'No valid payment address found' };
      }
      
      // Trim whitespace and ensure it's a string
      paymentAddress = String(paymentAddress).trim();
      
      console.log('🔍 Using payment address:', paymentAddress);
      
      // Check if invoice is still valid (not expired)
      const now = new Date();
      const expiresAt = new Date(invoice.expiresAt);
      
      if (now > expiresAt) {
        console.log('⏰ Invoice has expired, cannot confirm payment');
        return { confirmed: false, amount: '0', error: 'Invoice has expired' };
      }

      // Get current balance for the payment address
      console.log('🔍 Calling Boar RPC to get balance for address:', paymentAddress);
      const balance = await boarRPC.getAddressBalance(paymentAddress);
      const currentBalance = BigInt(balance.balance);
      
      console.log('💰 Boar RPC Response:', balance);
      console.log('💰 Current balance for', paymentAddress, ':', balance.balance);
      console.log('💰 Current balance (BigInt):', currentBalance.toString());
      
      // If we have a balance snapshot from creation, compare
      if (invoice.balanceAtCreation) {
        const creationBalance = BigInt(invoice.balanceAtCreation);
        const balanceIncrease = currentBalance - creationBalance;
        
        console.log('📊 ===== BALANCE COMPARISON =====');
        console.log('📊 Creation balance:', invoice.balanceAtCreation);
        console.log('📊 Creation balance (BigInt):', creationBalance.toString());
        console.log('📊 Current balance (BigInt):', currentBalance.toString());
        console.log('📊 Balance increase since creation:', balanceIncrease.toString());
        
        if (balanceIncrease > 0n) {
          // Funds have been received
          const requestedAmount = BigInt(invoice.requestedAmount);
          
          console.log('💰 ===== PAYMENT VALIDATION =====');
          console.log('💰 Balance increase:', balanceIncrease.toString());
          console.log('💰 Requested amount:', invoice.requestedAmount);
          console.log('💰 Requested amount (BigInt):', requestedAmount.toString());
          console.log('💰 Is balance increase >= requested?', balanceIncrease >= requestedAmount);
          
          if (balanceIncrease >= requestedAmount) {
            console.log('✅ Payment confirmed! Amount received:', balanceIncrease.toString());
            
            // Create a transaction record for the payments section
            const transactionRecord: StoredTransaction = {
              txHash: `manual_${Date.now()}`, // Generate a unique ID for manual confirmation
              invoiceId: invoice.id,
              from: 'unknown', // We don't know the sender for manual confirmation
              to: paymentAddress,
              amount: balanceIncrease.toString(),
              blockNumber: 0, // Manual confirmation, no block number
              timestamp: Date.now(),
              confirmations: 1, // Manual confirmation counts as 1 confirmation
              status: 'confirmed',
              detectedAt: Date.now(),
            };
            
            // Store the transaction
            transactionStorage.addTransaction(transactionRecord);
            
            return { confirmed: true, amount: balanceIncrease.toString() };
          } else {
            console.log('⚠️ Partial payment received:', balanceIncrease.toString(), 'Expected:', requestedAmount.toString());
            console.log('   Shortfall:', (requestedAmount - balanceIncrease).toString(), 'wei');
            return { confirmed: false, amount: balanceIncrease.toString(), error: 'Partial payment received' };
          }
        }
      } else {
        // No creation balance snapshot, check if current balance > 0
        if (currentBalance > 0n) {
          const requestedAmount = BigInt(invoice.requestedAmount);
          
          if (currentBalance >= requestedAmount) {
            console.log('✅ Payment confirmed! Current balance:', currentBalance.toString());
            
            // Create a transaction record for the payments section
            const transactionRecord: StoredTransaction = {
              txHash: `manual_${Date.now()}`, // Generate a unique ID for manual confirmation
              invoiceId: invoice.id,
              from: 'unknown', // We don't know the sender for manual confirmation
              to: paymentAddress,
              amount: currentBalance.toString(),
              blockNumber: 0, // Manual confirmation, no block number
              timestamp: Date.now(),
              confirmations: 1, // Manual confirmation counts as 1 confirmation
              status: 'confirmed',
              detectedAt: Date.now(),
            };
            
            // Store the transaction
            transactionStorage.addTransaction(transactionRecord);
            
            return { confirmed: true, amount: currentBalance.toString() };
          } else {
            console.log('⚠️ Partial payment detected. Current balance:', currentBalance.toString(), 'Expected:', requestedAmount.toString());
            return { confirmed: false, amount: currentBalance.toString(), error: 'Partial payment detected' };
          }
        }
      }
      
      console.log('❌ No payment detected');
      return { confirmed: false, amount: '0' };
      
    } catch (error) {
      console.error('🚨 Error confirming payment:', error);
      return { confirmed: false, amount: '0', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Start monitoring all pending invoices
  startMonitoringPendingInvoices(): void {
    console.log('👀 Starting to monitor all pending invoices...');
    
    const pendingInvoices = invoiceStorage.listDrafts().filter(invoice => invoice.status === 'pending');
    
    pendingInvoices.forEach(invoice => {
      if (invoice.payToAddress) {
        this.subscribeToAddress({
          address: invoice.payToAddress,
          invoiceId: invoice.id,
          expectedAmount: invoice.requestedAmount,
        });
      }
    });
  }

  // Stop monitoring all invoices
  stopMonitoringAllInvoices(): void {
    console.log('🛑 Stopping monitoring for all invoices...');
    
    this.subscriptions.forEach((_subscription, address) => {
      this.unsubscribeFromAddress(address);
    });
  }

  // Check and update expired invoices
  checkExpiredInvoices(): void {
    const expiredInvoices = invoiceStorage.getExpiredInvoices();
    
    expiredInvoices.forEach(invoice => {
      console.log('⏰ Marking invoice as expired:', invoice.id);
      invoiceStorage.markAsExpired(invoice.id);
      
      // Unsubscribe from monitoring this address
      if (invoice.payToAddress) {
        this.unsubscribeFromAddress(invoice.payToAddress);
      }
    });
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
