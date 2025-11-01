// Payment Monitor React Hook
// Provides real-time payment monitoring functionality to React components

import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentMonitor, PaymentEvent, PaymentMonitorCallbacks } from '@/services/payment-monitor';
import { transactionStorage, StoredTransaction } from '@/services/transaction-storage';
import { BoarError } from '@/lib/boar-config';

export interface PaymentMonitorState {
  isConnected: boolean;
  isMonitoring: boolean;
  activeSubscriptions: number;
  recentTransactions: StoredTransaction[];
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export interface PaymentMonitorActions {
  startMonitoring: (invoiceId: string, address: string, expectedAmount?: string) => void;
  stopMonitoring: (address: string) => void;
  getTransactionsForInvoice: (invoiceId: string) => StoredTransaction[];
  clearError: () => void;
  refreshTransactions: () => void;
}

export function usePaymentMonitor(): PaymentMonitorState & PaymentMonitorActions {
  const [state, setState] = useState<PaymentMonitorState>({
    isConnected: false,
    isMonitoring: false,
    activeSubscriptions: 0,
    recentTransactions: [],
    error: null,
    connectionStatus: 'disconnected',
  });

  const callbacksRef = useRef<PaymentMonitorCallbacks>({});

  // Initialize payment monitor callbacks
  useEffect(() => {
    callbacksRef.current = {
      onPaymentDetected: (event: PaymentEvent) => {
        console.log('💰 Payment detected for invoice:', event.invoiceId);
        
        setState(prev => ({
          ...prev,
          // Note: getRecentTransactions requires address - will be handled per wallet
          recentTransactions: [],
        }));
      },

      onPaymentConfirmed: (event: PaymentEvent) => {
        console.log('✅ Payment confirmed for invoice:', event.invoiceId);
        
        setState(prev => ({
          ...prev,
          // Note: getRecentTransactions requires address - will be handled per wallet
          recentTransactions: [],
        }));
      },

      onConnectionStatus: (event: PaymentEvent) => {
        console.log('🔌 Connection status:', event.status);
        
        setState(prev => ({
          ...prev,
          isConnected: event.status === 'connected',
          connectionStatus: event.status || 'disconnected',
          isMonitoring: event.status === 'connected' && prev.activeSubscriptions > 0,
        }));
      },

      onError: (error: BoarError) => {
        console.error('🚨 Payment monitor error:', error);
        
        setState(prev => ({
          ...prev,
          error: error.message,
        }));
      },
    };

    paymentMonitor.setCallbacks(callbacksRef.current);

    // Initialize state
    setState(prev => ({
      ...prev,
      isConnected: paymentMonitor.getConnectionStatus(),
      activeSubscriptions: paymentMonitor.getActiveSubscriptions(),
      recentTransactions: transactionStorage.getRecentTransactions(),
    }));

    // Cleanup on unmount
    return () => {
      paymentMonitor.setCallbacks({});
    };
  }, []);

  // Start monitoring an address for payments
  const startMonitoring = useCallback((invoiceId: string, address: string, expectedAmount?: string) => {
    try {
      console.log('👀 Starting payment monitoring for invoice:', invoiceId, 'address:', address);
      
      paymentMonitor.subscribeToAddress({
        address,
        invoiceId,
        expectedAmount,
      });

      setState(prev => ({
        ...prev,
        activeSubscriptions: paymentMonitor.getActiveSubscriptions(),
        isMonitoring: paymentMonitor.getConnectionStatus() && paymentMonitor.getActiveSubscriptions() > 0,
        error: null,
      }));
    } catch (error) {
      console.error('🚨 Failed to start monitoring:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start monitoring',
      }));
    }
  }, []);

  // Stop monitoring an address
  const stopMonitoring = useCallback((address: string) => {
    try {
      console.log('👋 Stopping payment monitoring for address:', address);
      
      paymentMonitor.unsubscribeFromAddress(address);

      setState(prev => ({
        ...prev,
        activeSubscriptions: paymentMonitor.getActiveSubscriptions(),
        isMonitoring: paymentMonitor.getConnectionStatus() && paymentMonitor.getActiveSubscriptions() > 0,
      }));
    } catch (error) {
      console.error('🚨 Failed to stop monitoring:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop monitoring',
      }));
    }
  }, []);

  // Get transactions for a specific invoice
  const getTransactionsForInvoice = useCallback((address: string | null | undefined, invoiceId: string): StoredTransaction[] => {
    if (!address) return [];
    return transactionStorage.getTransactionsForInvoice(address, invoiceId);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Refresh transactions from storage
  const refreshTransactions = useCallback(() => {
    setState(prev => ({
      ...prev,
      recentTransactions: transactionStorage.getRecentTransactions(),
    }));
  }, []);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    getTransactionsForInvoice,
    clearError,
    refreshTransactions,
  };
}

// Hook for monitoring a specific invoice
export function useInvoicePaymentMonitor(invoiceId: string, address: string, expectedAmount?: string) {
  const { startMonitoring, stopMonitoring, getTransactionsForInvoice, ...monitorState } = usePaymentMonitor();
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);

  // Start monitoring when invoice ID or address changes
  useEffect(() => {
    if (invoiceId && address) {
      startMonitoring(invoiceId, address, expectedAmount);
      
      return () => {
        stopMonitoring(address);
      };
    }
  }, [invoiceId, address, expectedAmount, startMonitoring, stopMonitoring]);

  // Update transactions when they change
  useEffect(() => {
    const invoiceTransactions = getTransactionsForInvoice(invoiceId);
    setTransactions(invoiceTransactions);
  }, [invoiceId, getTransactionsForInvoice, monitorState.recentTransactions]);

  return {
    ...monitorState,
    transactions,
    hasPayment: transactions.length > 0,
    latestTransaction: transactions[0],
    isPaid: transactions.some(tx => tx.status === 'confirmed'),
  };
}
