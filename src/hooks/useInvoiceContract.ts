import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
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
  const { isLoading: isCreating } = useWaitForTransactionReceipt({
    hash: createTxData,
    onSuccess: () => {
      setCreateTx({ status: 'success', hash: createTxData });
      toast.success('Invoice created successfully!');
      refreshData();
    },
    onError: (error) => {
      setCreateTx({ status: 'error', error: error.message });
      toast.error('Failed to create invoice');
    },
  });
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: confirmTxData,
    onSuccess: () => {
      setConfirmTx({ status: 'success', hash: confirmTxData });
      toast.success('Payment confirmed!');
      refreshData();
    },
    onError: (error) => {
      setConfirmTx({ status: 'error', error: error.message });
      toast.error('Failed to confirm payment');
    },
  });
  
  const { isLoading: isCancelling } = useWaitForTransactionReceipt({
    hash: cancelTxData,
    onSuccess: () => {
      setCancelTx({ status: 'success', hash: cancelTxData });
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

  // Read all invoices from blockchain
  const { data: allBlockchainInvoices, refetch: refetchAllInvoices } = useContractRead({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getAllInvoices',
    enabled: true, // Fetch all invoices regardless of wallet connection
  });

  const { data: invoiceCountData } = useContractRead({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'invoiceCount',
  });
  
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
  
  // Fetch and convert all invoices from blockchain
  useEffect(() => {
    if (allBlockchainInvoices && Array.isArray(allBlockchainInvoices)) {
      try {
        const convertedInvoices = allBlockchainInvoices.map((invoice) => {
          const blockchainInvoice: BlockchainInvoice = {
            id: Number(invoice.id),
            creator: invoice.creator,
            recipient: invoice.recipient,
            amount: invoice.amount.toString(),
            description: invoice.description,
            bitcoinAddress: invoice.bitcoinAddress,
            clientName: invoice.clientName,
            clientCode: invoice.clientCode,
            paid: invoice.paid,
            cancelled: invoice.cancelled,
            createdAt: Number(invoice.createdAt),
            paidAt: Number(invoice.paidAt),
          };
          
          return convertBlockchainInvoice(blockchainInvoice);
        });
        
        setInvoices(convertedInvoices);
        
        // Update payment history
        const paidInvoices = convertedInvoices.filter(inv => inv.status === 'paid').map(inv => ({
          id: inv.id,
          type: 'received' as const,
          counterparty: inv.clientName,
          amount: inv.amount,
          date: inv.paidAt || inv.createdAt,
          status: 'confirmed' as const,
          bitcoinAddress: inv.bitcoinAddress,
          txHash: inv.paymentTxHash,
        }));
        setPaymentHistory(paidInvoices);
        
      } catch (error) {
        console.error('Error converting invoices:', error);
        setError('Failed to load invoices');
      }
    }
  }, [allBlockchainInvoices, convertBlockchainInvoice]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refetch all invoices
      await refetchAllInvoices();
      if (address && isConnected) {
        await refetchUserInvoices();
      }
      
      // Update stats
      const totalCount = invoiceCountData ? Number(invoiceCountData) : 0;
      const paidCount = invoices.filter(inv => inv.status === 'paid').length;
      
      setStats({
        totalRevenue: totalRevenue ? parseFloat(formatEther(totalRevenue)) : 0,
        pendingAmount: pendingAmount ? parseFloat(formatEther(pendingAmount)) : 0,
        totalInvoices: totalCount,
        activeInvoices: totalCount - paidCount,
        paidInvoices: paidCount,
      });
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [refetchAllInvoices, refetchUserInvoices, totalRevenue, pendingAmount, invoiceCountData, invoices]);
  
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
        if (invoice && invoice.status === 'pending' && address === invoice.creator) {
          // Auto-confirm the payment
          confirmPayment(event.invoiceId);
          
          // Show notification
          toast.success(`Payment received! Invoice ${event.invoiceId} confirmed automatically.`);
        }
      }
    };

    const handlePaymentConfirmed = (event: PaymentEvent) => {
      if (event.type === 'payment_confirmed') {
        console.log('✅ Payment confirmed for invoice:', event.invoiceId);
        // Refresh data after payment confirmation
        refreshData();
      }
    };

    // Set up payment monitor callbacks
    paymentMonitor.setCallbacks({
      onPaymentDetected: handlePaymentDetected,
      onPaymentConfirmed: handlePaymentConfirmed,
    });

    return () => {
      // Clean up callbacks
      paymentMonitor.setCallbacks({});
    };
  }, [invoices, confirmPayment, address, refreshData]);

  // Start monitoring for all pending invoices
  useEffect(() => {
    invoices.forEach(invoice => {
      if (invoice.status === 'pending' && invoice.bitcoinAddress && address === invoice.creator) {
        console.log('👀 Starting monitoring for invoice:', invoice.id);
        paymentMonitor.subscribeToAddress({
          address: invoice.bitcoinAddress,
          invoiceId: invoice.id,
        });
      }
    });

    return () => {
      // Cleanup all subscriptions when component unmounts
      invoices.forEach(invoice => {
        if (invoice.bitcoinAddress) {
          paymentMonitor.unsubscribeFromAddress(invoice.bitcoinAddress);
        }
      });
    };
  }, [invoices, address]);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);
  
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
