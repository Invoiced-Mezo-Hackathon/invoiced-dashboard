import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';
import { 
  Invoice, 
  InvoiceStats, 
  PaymentHistory, 
  InvoiceFormData, 
  TransactionState, 
  UseInvoiceContractReturn,
  BlockchainInvoice 
} from '@/types/invoice';
import { MEZO_CONTRACTS, INVOICE_CONTRACT_ABI } from '@/lib/mezo';
import { paymentMonitor, PaymentEvent } from '@/services/payment-monitor';
import { transactionStorage } from '@/services/transaction-storage';

export function useInvoiceContract(): UseInvoiceContractReturn {
  const { address, isConnected } = useAccount();
  
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    totalRevenue: 0,
    activeInvoices: 0,
    pendingAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Transaction states
  const [createTx, setCreateTx] = useState<TransactionState>({ status: 'idle' });
  const [confirmTx, setConfirmTx] = useState<TransactionState>({ status: 'idle' });
  const [cancelTx, setCancelTx] = useState<TransactionState>({ status: 'idle' });
  
  // Contract reads
  const { data: userInvoiceIds, refetch: refetchUserInvoices } = useContractRead({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getUserInvoices',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });
  
  const { data: totalRevenue } = useContractRead({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getTotalRevenue',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });
  
  const { data: pendingAmount } = useContractRead({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getPendingAmount',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });
  
  const { data: totalInvoices } = useContractRead({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getUserInvoiceCount',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });
  
  // Contract writes
  const { write: createInvoiceWrite, data: createTxData } = useContractWrite({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'createInvoice',
  });
  
  const { write: confirmPaymentWrite, data: confirmTxData } = useContractWrite({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'confirmPayment',
  });
  
  const { write: cancelInvoiceWrite, data: cancelTxData } = useContractWrite({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'cancelInvoice',
  });
  
  // Wait for transactions
  const { isLoading: isCreating } = useWaitForTransaction({
    hash: createTxData?.hash,
    onSuccess: () => {
      setCreateTx({ status: 'success', hash: createTxData?.hash });
      toast.success('Invoice created successfully!');
      refreshData();
    },
    onError: (error) => {
      setCreateTx({ status: 'error', error: error.message });
      toast.error('Failed to create invoice');
    },
  });
  
  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: confirmTxData?.hash,
    onSuccess: () => {
      setConfirmTx({ status: 'success', hash: confirmTxData?.hash });
      toast.success('Payment confirmed!');
      refreshData();
    },
    onError: (error) => {
      setConfirmTx({ status: 'error', error: error.message });
      toast.error('Failed to confirm payment');
    },
  });
  
  const { isLoading: isCancelling } = useWaitForTransaction({
    hash: cancelTxData?.hash,
    onSuccess: () => {
      setCancelTx({ status: 'success', hash: cancelTxData?.hash });
      toast.success('Invoice cancelled!');
      refreshData();
    },
    onError: (error) => {
      setCancelTx({ status: 'error', error: error.message });
      toast.error('Failed to cancel invoice');
    },
  });
  
  // Convert blockchain invoice to frontend invoice
  const convertBlockchainInvoice = useCallback((blockchainInvoice: BlockchainInvoice, txHash?: string): Invoice => {
    const status: 'pending' | 'paid' | 'cancelled' = 
      blockchainInvoice.cancelled ? 'cancelled' :
      blockchainInvoice.paid ? 'paid' : 'pending';
    
    return {
      id: blockchainInvoice.id.toString(),
      clientName: blockchainInvoice.clientName,
      clientCode: blockchainInvoice.clientCode,
      details: blockchainInvoice.description,
      amount: parseFloat(formatEther(BigInt(blockchainInvoice.amount))),
      currency: 'USD', // Default to USD, can be enhanced later
      musdAmount: parseFloat(formatEther(BigInt(blockchainInvoice.amount))) * 0.98, // Mock conversion
      status,
      createdAt: new Date(blockchainInvoice.createdAt * 1000).toISOString(),
      wallet: blockchainInvoice.bitcoinAddress,
      bitcoinAddress: blockchainInvoice.bitcoinAddress,
      creator: blockchainInvoice.creator,
      recipient: blockchainInvoice.recipient,
      paidAt: blockchainInvoice.paidAt > 0 ? new Date(blockchainInvoice.paidAt * 1000).toISOString() : undefined,
      txHash,
    };
  }, []);
  
  // Fetch individual invoice details
  const fetchInvoiceDetails = useCallback(async (invoiceId: number): Promise<BlockchainInvoice | null> => {
    try {
      // This would need to be implemented with a contract read
      // For now, we'll return null and handle it in the main fetch
      return null;
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      return null;
    }
  }, []);
  
  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!address || !isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Refetch user invoices
      await refetchUserInvoices();
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalRevenue: totalRevenue ? parseFloat(formatEther(totalRevenue)) : 0,
        pendingAmount: pendingAmount ? parseFloat(formatEther(pendingAmount)) : 0,
        totalInvoices: totalInvoices ? Number(totalInvoices) : 0,
        activeInvoices: totalInvoices && totalInvoices > 0 ? Number(totalInvoices) - (paymentHistory.length || 0) : 0,
        paidInvoices: paymentHistory.length || 0,
      }));
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, refetchUserInvoices, totalRevenue, pendingAmount, totalInvoices, paymentHistory.length]);
  
  // Create invoice
  const createInvoice = useCallback(async (data: InvoiceFormData) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    try {
      setCreateTx({ status: 'pending' });
      
      // Generate client code
      const clientCode = `CLT-${data.clientName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Convert amount to wei
      const amountInWei = parseEther(data.amount);
      
      // Call contract
      createInvoiceWrite({
        args: [
          address, // recipient (same as creator for now)
          amountInWei,
          data.details,
          data.bitcoinAddress,
          data.clientName,
          clientCode
        ]
      });
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      setCreateTx({ status: 'error', error: 'Failed to create invoice' });
      toast.error('Failed to create invoice');
    }
  }, [address, isConnected, createInvoiceWrite]);
  
  // Confirm payment
  const confirmPayment = useCallback(async (invoiceId: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    try {
      setConfirmTx({ status: 'pending' });
      
      confirmPaymentWrite({
        args: [BigInt(invoiceId)]
      });
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      setConfirmTx({ status: 'error', error: 'Failed to confirm payment' });
      toast.error('Failed to confirm payment');
    }
  }, [address, isConnected, confirmPaymentWrite]);
  
  // Cancel invoice
  const cancelInvoice = useCallback(async (invoiceId: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    try {
      setCancelTx({ status: 'pending' });
      
      cancelInvoiceWrite({
        args: [BigInt(invoiceId)]
      });
      
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      setCancelTx({ status: 'error', error: 'Failed to cancel invoice' });
      toast.error('Failed to cancel invoice');
    }
  }, [address, isConnected, cancelInvoiceWrite]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Auto-confirm invoices when payments are detected
  useEffect(() => {
    const handlePaymentDetected = (event: PaymentEvent) => {
      if (event.type === 'payment_detected' && event.transaction) {
        console.log('💰 Auto-confirming payment for invoice:', event.invoiceId);
        
        // Find the invoice
        const invoice = invoices.find(inv => inv.id === event.invoiceId);
        if (invoice && invoice.status === 'pending') {
          // Auto-confirm the payment
          confirmPayment(event.invoiceId);
          
          // Show notification
          toast.success(`Payment received! Invoice ${event.invoiceId} confirmed automatically.`);
        }
      }
    };

    // Set up payment monitor callbacks
    paymentMonitor.setCallbacks({
      onPaymentDetected: handlePaymentDetected,
    });

    return () => {
      // Clean up callbacks
      paymentMonitor.setCallbacks({});
    };
  }, [invoices, confirmPayment]);

  // Load data when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      refreshData();
    }
  }, [address, isConnected, refreshData]);
  
  return {
    // Data
    invoices,
    stats,
    paymentHistory,
    
    // Loading states
    isLoading,
    isCreating,
    isConfirming,
    isCancelling,
    
    // Transaction states
    createTx,
    confirmTx,
    cancelTx,
    
    // Actions
    createInvoice,
    confirmPayment,
    cancelInvoice,
    refreshData,
    
    // Error handling
    error,
    clearError,
  };
}
