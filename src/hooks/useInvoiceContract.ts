import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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
import { invoiceStorage, DraftInvoice } from '@/services/invoice-storage';

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
  
  // Contract reads - using v2 API
  const { data: userInvoiceIds, refetch: refetchUserInvoices } = useReadContract({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getUserInvoices',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  const { data: totalRevenue } = useReadContract({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getTotalRevenue',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  const { data: pendingAmount } = useReadContract({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getPendingAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  const { data: totalInvoices } = useReadContract({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getUserInvoiceCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  // Contract writes - using v2 API
  const { writeContract: createInvoiceWrite, data: createTxData } = useWriteContract();
  
  const { writeContract: confirmPaymentWrite, data: confirmTxData } = useWriteContract();
  
  const { writeContract: cancelInvoiceWrite, data: cancelTxData } = useWriteContract();
  
  // Wait for transactions
  const { isLoading: isCreating } = useWaitForTransactionReceipt({
    hash: createTxData,
      onSuccess: () => {
        setCreateTx({ status: 'success', hash: createTxData });
        toast.success('✅ Invoice created on blockchain successfully!');
        refreshData();
      },
    onError: (error) => {
      setCreateTx({ status: 'error', error: error.message });
      toast.error('❌ Failed to create invoice on blockchain');
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
  const { data: allBlockchainInvoices, refetch: refetchAllInvoices } = useReadContract({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'getAllInvoices',
    query: {
      enabled: true, // Fetch all invoices regardless of wallet connection
    },
  });
  
  const { data: invoiceCountData } = useReadContract({
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
  
  // Load drafts from localStorage on mount and when blockchain data changes
  useEffect(() => {
    const drafts = invoiceStorage.listDrafts();
    console.log('💾 Loaded drafts from localStorage:', drafts.length);
    
    if (allBlockchainInvoices && Array.isArray(allBlockchainInvoices)) {
      try {
        console.log('📋 Converting invoices from blockchain:', allBlockchainInvoices.length);
        
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
          
          console.log('📄 Converting invoice:', blockchainInvoice.id, 'bitcoinAddress:', blockchainInvoice.bitcoinAddress);
          
          return convertBlockchainInvoice(blockchainInvoice);
        });
        
        console.log('✅ Converted invoices:', convertedInvoices.length);

        // Merge with existing UI invoices, replacing temporary ones with real blockchain data
        setInvoices(prevInvoices => {
          // Create a map of existing invoices by clientCode
          const existingMap = new Map<string, Invoice>();
          prevInvoices.forEach(inv => {
            existingMap.set(inv.clientCode, inv);
          });
          
          // Replace temporary invoices with real blockchain data
          const updatedInvoices = [...prevInvoices];
          convertedInvoices.forEach(blockchainInvoice => {
            const existingIndex = updatedInvoices.findIndex(inv => inv.clientCode === blockchainInvoice.clientCode);
            if (existingIndex >= 0) {
              // Replace temporary invoice with real blockchain data
              updatedInvoices[existingIndex] = blockchainInvoice;
              console.log('🔄 Replaced temporary invoice with blockchain data:', blockchainInvoice.clientCode);
            } else {
              // Add new blockchain invoice
              updatedInvoices.push(blockchainInvoice);
            }
          });
          
          // Sort by creation date (newest first)
          const sorted = updatedInvoices.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          console.log('📝 Updated invoices:', sorted.length, 'drafts:', drafts.length, 'blockchain:', convertedInvoices.length);
          return sorted;
        });
        
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
        // Still show drafts even if blockchain fails
        setInvoices(drafts);
      }
    } else {
      // If no blockchain invoices, just show drafts from localStorage
      console.log('📝 No blockchain invoices, showing drafts only:', drafts.length);
      setInvoices(drafts);
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
      console.log('Creating invoice with data:', data);
      setCreateTx({ status: 'pending' });
      
      // Generate client code
      const clientCode = `CLT-${data.clientName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Create draft invoice with localStorage ID
      const draftId = `draft_${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      
      const draft: DraftInvoice = {
        id: draftId,
        clientName: data.clientName,
        clientCode,
        details: data.details,
        amount: parseFloat(data.amount),
        currency: data.currency,
        musdAmount: parseFloat(data.amount) * 0.98,
        status: 'pending', // Will be displayed as 'draft' in UI
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(), // Set expiry time
        wallet: data.bitcoinAddress,
        bitcoinAddress: data.bitcoinAddress,
        payToAddress: data.bitcoinAddress, // Set payToAddress for payment monitoring
        creator: address,
        recipient: address,
        requestedAmount: data.amount,
        balanceAtCreation: data.balanceAtCreation || '0', // Use provided balance snapshot
        syncPending: true, // Will try to sync to blockchain
      };
      
      console.log('💾 Saving draft to localStorage:', draft);
      console.log('🕐 Expiry debug:', {
        createdAt: draft.createdAt,
        expiresAt: draft.expiresAt,
        expiresAtTime: new Date(draft.expiresAt).getTime(),
        currentTime: Date.now(),
        timeUntilExpiry: new Date(draft.expiresAt).getTime() - Date.now()
      });
      
      // Save to localStorage as backup only (not shown in UI)
      invoiceStorage.saveDraft(draft);
      
      // Don't add to UI until blockchain transaction is confirmed
      // This ensures only blockchain invoices appear in the UI
      
      // Try to submit to blockchain (if wallet is connected)
      if (createInvoiceWrite) {
        try {
          // Convert amount to wei
          const amountInWei = parseEther(data.amount);
          
          console.log('Calling createInvoiceWrite with args:', [
            address,
            amountInWei,
            data.details,
            data.bitcoinAddress,
            data.clientName,
            clientCode,
            Math.floor(expiresAt.getTime() / 1000), // expiresAt as Unix timestamp
            data.payToAddress || data.bitcoinAddress, // payToAddress
            data.currency, // currency
            data.balanceAtCreation || '0' // balanceAtCreation
          ]);
          
          const hash = await createInvoiceWrite({
            address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
            abi: INVOICE_CONTRACT_ABI,
            functionName: 'createInvoice',
            args: [
              address, // recipient (same as creator for now)
              amountInWei,
              data.details,
              data.bitcoinAddress,
              data.clientName,
              clientCode,
              Math.floor(expiresAt.getTime() / 1000), // expiresAt as Unix timestamp
              data.payToAddress || data.bitcoinAddress, // payToAddress
              data.currency, // currency
              data.balanceAtCreation || '0' // balanceAtCreation
            ],
          });
          
          console.log('createInvoiceWrite succeeded, transaction hash:', hash);
          // The useWaitForTransactionReceipt hook will handle the rest
          
        } catch (blockchainError) {
          console.error('Blockchain submission failed, keeping draft:', blockchainError);
          // Keep the draft but mark sync as pending
          invoiceStorage.updateDraft(draftId, { syncPending: true });
          toast.error('Invoice saved locally. Will sync to blockchain when connection improves.');
        }
        } else {
          console.log('No wallet connection, keeping draft only');
          toast.error('Please connect your wallet to create invoices on blockchain.');
        }
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      setCreateTx({ status: 'error', error: 'Failed to create invoice' });
      toast.error('Failed to create invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [address, isConnected, createInvoiceWrite]);
  
  // Verify payment via Boar socket
  const verifyPaymentViaBoar = useCallback(async (paymentAddress: string, expectedAmount: number) => {
    try {
      console.log('🔍 Starting payment verification via Boar...');

      // Subscribe to the payment address temporarily
      const subscriptionId = `verify_${Date.now()}`;
      const expectedAmountWei = parseEther(expectedAmount.toString());
      paymentMonitor.subscribeToAddress({
        address: paymentAddress,
        invoiceId: subscriptionId,
        expectedAmount: expectedAmountWei.toString(),
      });

      // Wait briefly to allow any recent tx notifications to arrive
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check transaction storage for recent payments to this temp subscription
      const recentTransactions = transactionStorage.getTransactionsForInvoice(subscriptionId);

      // Clean up subscription
      paymentMonitor.unsubscribeFromAddress(paymentAddress);

      if (recentTransactions.length === 0) {
        console.log('❌ No recent transactions found');
        return { success: false, error: 'No recent payment found' };
      }

      // Require amount >= expected AND confirmations >= 1
      const validTransaction = recentTransactions.find(tx => {
        const receivedAmount = BigInt(tx.amount);
        const hasSufficientAmount = receivedAmount >= expectedAmountWei;
        const hasConfirmations = (tx.confirmations ?? 0) >= 1;
        return hasSufficientAmount && hasConfirmations;
      });

      if (!validTransaction) {
        // Provide specific reason if any tx had amount but lacked confirmations
        const anyAmountOk = recentTransactions.some(tx => BigInt(tx.amount) >= expectedAmountWei);
        if (anyAmountOk) {
          return { success: false, error: 'Payment found but awaiting 1 confirmation' };
        }
        return { success: false, error: 'Payment amount is less than expected' };
      }

      console.log('✅ Payment verification successful with confirmations >= 1!');
      return { success: true, transaction: validTransaction };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }, []);
  
  // Confirm payment with verification
  const confirmPayment = useCallback(async (invoiceId: string) => {
    try {
      setConfirmTx({ status: 'pending' });
      
      // Find the invoice to get payment details
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        toast.error('Invoice not found');
        setConfirmTx({ status: 'error', error: 'Invoice not found' });
        return;
      }
      
      if (!invoice.bitcoinAddress) {
        toast.error('No payment address found for this invoice');
        setConfirmTx({ status: 'error', error: 'No payment address' });
        return;
      }
      
      // Verify payment via Boar socket
      console.log('🔍 Verifying payment for invoice:', invoiceId);
      console.log('   Payment address:', invoice.bitcoinAddress);
      console.log('   Expected amount:', invoice.amount);
      
      const verificationResult = await verifyPaymentViaBoar(invoice.bitcoinAddress, invoice.amount);
      
      if (verificationResult.success) {
        console.log('✅ Payment verified! Marking as paid...');
        
        // For draft invoices, mark as paid locally
        if (invoiceId.startsWith('draft_')) {
          invoiceStorage.markAsPaid(invoiceId, verificationResult.transaction?.amount, verificationResult.transaction?.txHash);
          toast.success(`Payment confirmed! Invoice marked as paid.`);
          setConfirmTx({ status: 'success' });
          refreshData();
          return;
        }
        
        // For blockchain invoices, confirm on blockchain
        if (!address || !isConnected) {
          toast.error('Please connect your wallet to confirm blockchain payment');
          setConfirmTx({ status: 'error', error: 'Wallet not connected' });
          return;
        }
        
        if (!confirmPaymentWrite) {
          console.error('confirmPaymentWrite is undefined!');
          toast.error('Failed to initialize contract write');
          setConfirmTx({ status: 'error', error: 'Contract write not available' });
          return;
        }
        
        toast.success(`Payment verified! Confirming on blockchain...`);
        
        await confirmPaymentWrite({
          address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
          abi: INVOICE_CONTRACT_ABI,
          functionName: 'confirmPayment',
          args: [
            BigInt(invoiceId),
            verificationResult.transaction?.txHash || '',
            verificationResult.transaction?.amount || '0'
          ]
        });
        
      } else {
        console.log('❌ Payment verification failed:', verificationResult.error);
        toast.error(`Payment verification failed: ${verificationResult.error}`);
        setConfirmTx({ status: 'error', error: verificationResult.error });
      }
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      setConfirmTx({ status: 'error', error: 'Failed to confirm payment' });
      toast.error('Failed to confirm payment');
    }
  }, [address, isConnected, confirmPaymentWrite, invoices, refreshData]);
  
  // Cancel invoice
  const cancelInvoice = useCallback(async (invoiceId: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    // If this is a draft invoice (not yet on-chain), mark it as cancelled locally
    if (invoiceId.startsWith('draft_')) {
      invoiceStorage.markCancelled(invoiceId);
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: 'cancelled' }
          : inv
      ));
      toast.success('Invoice cancelled');
      return;
    }

    if (!cancelInvoiceWrite) {
      console.error('cancelInvoiceWrite is undefined!');
      toast.error('Failed to initialize contract write');
      return;
    }
    
    try {
      setCancelTx({ status: 'pending' });
      
      await cancelInvoiceWrite({
        address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
        abi: INVOICE_CONTRACT_ABI,
        functionName: 'cancelInvoice',
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
  
  // Manual confirmation only - no automatic payment detection
  useEffect(() => {
    const handlePaymentDetected = (event: PaymentEvent) => {
      if (event.type === 'payment_detected' && event.transaction) {
        console.log('💰 Payment detected event received for invoice:', event.invoiceId);
        console.log('   Note: Manual confirmation required - no auto-confirmation');
        // Just log the payment detection, don't auto-confirm
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
      // Don't clear callbacks on unmount - keep them
    };
  }, [refreshData]);

  // Monitor payments for manual verification (no auto-confirmation)
  useEffect(() => {
    console.log('🔍 Setting up payment monitoring for manual verification:', invoices.length, 'invoices');
    console.log('🔍 Connected wallet address:', address);
    
    invoices.forEach(invoice => {
      console.log('Invoice:', invoice.id, 'Status:', invoice.status, 'BitcoinAddr:', invoice.bitcoinAddress);
      
      // Monitor if invoice is pending and has bitcoinAddress (for manual verification)
      if (invoice.status === 'pending' && invoice.bitcoinAddress) {
        console.log('👀 Monitoring for manual verification - invoice:', invoice.id, 'Payment address:', invoice.bitcoinAddress);
        
        // Calculate expected amount in wei
        const expectedAmount = invoice.amount ? parseEther(invoice.amount.toString()).toString() : undefined;
        
        // Subscribe to monitor the invoice's bitcoinAddress (payment recipient)
        paymentMonitor.subscribeToAddress({
          address: invoice.bitcoinAddress,
          invoiceId: invoice.id,
          expectedAmount: expectedAmount,
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
  }, [invoices, address]); // Depend on invoices and address

  // Handle transaction success - add invoice to UI immediately
  useEffect(() => {
    if (createTx.status === 'success' && createTx.hash) {
      console.log('✅ Transaction confirmed, adding invoice to UI immediately');
      
      // Find the most recent draft (should be the one we just created)
      const drafts = invoiceStorage.listDrafts();
      const latestDraft = drafts.find(d => d.syncPending && !d.blockchainId);
      
      if (latestDraft) {
        console.log('🚀 Adding invoice to UI immediately:', latestDraft.clientCode);
        
        // Convert draft to blockchain invoice format for immediate UI display
        const blockchainInvoice: Invoice = {
          ...latestDraft,
          id: `blockchain_${Date.now()}`, // Temporary ID until we get real blockchain ID
          status: 'pending',
          syncPending: false, // Mark as synced since it's on blockchain
        };
        
        // Add to UI immediately
        setInvoices(prev => [blockchainInvoice, ...prev]);
        
        // Remove the draft from localStorage since it's now on blockchain
        invoiceStorage.removeDraft(latestDraft.id);
        
        // Refresh blockchain data to get the real blockchain invoice (will replace the temporary one)
        refetchAllInvoices();
      }
    }
  }, [createTx.status, createTx.hash, refetchAllInvoices]);

  // Debug: Monitor invoices state changes
  useEffect(() => {
    console.log('📊 Invoices state updated:', invoices.length, 'invoices');
  }, [invoices]);

  // Clean up old invoices to prevent localStorage from growing too large
  useEffect(() => {
    invoiceStorage.cleanupOldInvoices();
  }, []);

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
