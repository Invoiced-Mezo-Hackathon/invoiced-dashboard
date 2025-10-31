import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
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
import { boarRPC } from '@/services/boar-rpc';
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
  const { refetch: refetchUserInvoices } = useReadContract({
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
  
  const { data: invoiceCountData } = useReadContract({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    functionName: 'invoiceCount',
  });
  
  // Contract writes - using v2 API
  const { writeContractAsync: createInvoiceWrite } = useWriteContract();
  const { writeContractAsync: confirmPaymentWrite } = useWriteContract();
  const { writeContractAsync: cancelInvoiceWrite } = useWriteContract();
  const { writeContractAsync: approveInvoiceWrite } = useWriteContract();
  
  // Wait for transaction receipts
  const { isLoading: isWaitingCreate } = useWaitForTransactionReceipt({
    hash: createTx.status === 'success' && 'hash' in createTx ? (createTx.hash as `0x${string}`) : undefined,
  });
  
  const { isLoading: isWaitingConfirm } = useWaitForTransactionReceipt({
    hash: confirmTx.status === 'success' && 'hash' in confirmTx ? (confirmTx.hash as `0x${string}`) : undefined,
  });
  
  const { isLoading: isWaitingCancel } = useWaitForTransactionReceipt({
    hash: cancelTx.status === 'success' && 'hash' in cancelTx ? (cancelTx.hash as `0x${string}`) : undefined,
  });
  
  // Track loading states
  const isCreating = createTx.status === 'pending' || isWaitingCreate;
  const isConfirming = confirmTx.status === 'pending' || isWaitingConfirm;
  const isCancelling = cancelTx.status === 'pending' || isWaitingCancel;
  
  
  // Convert blockchain invoice to frontend invoice
  const convertBlockchainInvoice = useCallback((blockchainInvoice: BlockchainInvoice, txHash?: string): Invoice => {
    const status: 'pending' | 'paid' | 'cancelled' = 
      blockchainInvoice.cancelled ? 'cancelled' :
      blockchainInvoice.paid ? 'paid' : 'pending';
    
    // Parse the amount from wei (stored as BTC on-chain)
    const btcAmount = parseFloat(formatEther(BigInt(blockchainInvoice.amount)));
    
    // Display the originally requested amount; keep observedInboundAmount separately for transaction details
    const displayAmount = btcAmount;
    
    return {
      id: blockchainInvoice.id.toString(),
      clientName: blockchainInvoice.clientName,
      clientCode: blockchainInvoice.clientCode,
      details: blockchainInvoice.description,
      amount: displayAmount, // Show requested amount; actual received is tracked in observedInboundAmount
      currency: (blockchainInvoice.currency || 'USD') as 'USD' | 'KES', // Use stored currency
      musdAmount: displayAmount * 0.98, // Mock conversion
      status,
      createdAt: new Date(blockchainInvoice.createdAt * 1000).toISOString(),
      wallet: blockchainInvoice.bitcoinAddress,
      bitcoinAddress: blockchainInvoice.bitcoinAddress,
      creator: blockchainInvoice.creator,
      recipient: blockchainInvoice.recipient,
      paidAt: blockchainInvoice.paidAt > 0 ? new Date(blockchainInvoice.paidAt * 1000).toISOString() : undefined,
      txHash,
      expiresAt: new Date((blockchainInvoice.expiresAt || 0) * 1000).toISOString(),
      payToAddress: blockchainInvoice.payToAddress || blockchainInvoice.bitcoinAddress,
      requestedAmount: blockchainInvoice.amount,
      paymentTxHash: blockchainInvoice.paymentTxHash || undefined,
      observedInboundAmount: blockchainInvoice.observedInboundAmount || undefined,
      balanceAtCreation: blockchainInvoice.balanceAtCreation || undefined,
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

  // Real-time: refresh on on-chain invoice events
  const notifiedCreatedRef = useRef<Set<string>>(new Set());
  const notifiedPaidRef = useRef<Set<string>>(new Set());

  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceCreated',
    onLogs: (logs) => {
      refetchAllInvoices();
      if (address && isConnected) refetchUserInvoices();
      try {
        for (const log of (logs as any[])) {
          const id = ((log as any).args?.id as bigint | undefined)?.toString() || 'unknown';
          if (!notifiedCreatedRef.current.has(id)) {
            toast.success('Client has been notified');
            // Bell notification: client received request and will pay within an hour
            try { window.dispatchEvent(new CustomEvent('notify', { detail: { title: 'Invoice sent', message: 'Client received your request and will pay within 1 hour' } })); } catch {}
            notifiedCreatedRef.current.add(id);
          }
        }
      } catch {}
    }
  });
  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoicePaid',
    onLogs: (logs) => {
      refetchAllInvoices();
      if (address && isConnected) refetchUserInvoices();
      try {
        for (const log of (logs as any[])) {
          const id = ((log as any).args?.id as bigint | undefined)?.toString() || 'unknown';
          if (!notifiedPaidRef.current.has(id)) {
            toast.success('Payment confirmed on-chain');
            // Do not push a bell notification here; the bell is emitted on user confirmPayment success
            notifiedPaidRef.current.add(id);
          }
        }
      } catch {}
    }
  });
  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceCancelled',
    onLogs: () => {
      refetchAllInvoices();
      if (address && isConnected) refetchUserInvoices();
      toast('Invoice cancelled', { icon: '🛑' });
    }
  });
  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceApproved',
    onLogs: () => {
      refetchAllInvoices();
      if (address && isConnected) refetchUserInvoices();
      toast.success('Invoice approved');
    }
  });
  
  // Note: fetchInvoiceDetails function removed as it was unused
  
  // Load drafts from localStorage on mount and when blockchain data changes
  useEffect(() => {
    const drafts = invoiceStorage.listDrafts();
    console.log('💾 Loaded drafts from localStorage:', drafts.length);

    // If blockchain data is temporarily unavailable (during refetch), don't clobber existing UI
    if (!allBlockchainInvoices) {
      // Only show drafts if we have nothing in UI yet
      setInvoices(prev => {
        if (prev.length === 0) {
          console.log('📝 No blockchain invoices yet, initializing from drafts:', drafts.length);
          return drafts;
        }
        return prev;
      });
      return;
    }

    if (Array.isArray(allBlockchainInvoices)) {
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
            paidAt: Number(invoice.paidAt || 0),
            expiresAt: Number(invoice.expiresAt || 0),
            payToAddress: invoice.payToAddress || invoice.bitcoinAddress || '',
            paymentTxHash: invoice.paymentTxHash || '',
            observedInboundAmount: invoice.observedInboundAmount || '0',
            currency: invoice.currency || 'USD',
            balanceAtCreation: invoice.balanceAtCreation || '0',
          };
          
          console.log('📄 Converting invoice:', blockchainInvoice.id, 'bitcoinAddress:', blockchainInvoice.bitcoinAddress);
          
          return convertBlockchainInvoice(blockchainInvoice);
        });
        
        console.log('✅ Converted invoices:', convertedInvoices.length);

        // Remove any local drafts that match blockchain invoices (avoid duplicates)
        try {
          const draftList = invoiceStorage.listDrafts();
          const chainClientCodes = new Set(convertedInvoices.map(ci => ci.clientCode).filter(Boolean));
          draftList
            .filter(d => d.clientCode && chainClientCodes.has(d.clientCode))
            .forEach(d => invoiceStorage.removeDraft(d.id));
        } catch (e) {
          console.warn('Failed to prune duplicate drafts:', e);
        }

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
        const paidInvoices = convertedInvoices
          .filter(inv => inv.status === 'paid')
          .map(inv => ({
            id: `${inv.id}-ph`,
            invoiceId: inv.id,
            clientName: inv.clientName,
            amount: inv.amount,
            currency: inv.currency,
            bitcoinAddress: inv.bitcoinAddress,
            paidAt: inv.paidAt || inv.createdAt,
            txHash: inv.paymentTxHash || inv.txHash || '',
            status: 'confirmed' as const,
          }));
        setPaymentHistory(paidInvoices as PaymentHistory[]);
        
      } catch (error) {
        console.error('Error converting invoices:', error);
        setError('Failed to load invoices');
        // Still show drafts even if blockchain fails
        setInvoices(drafts);
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
      const totalCount = invoiceCountData ? Number(invoiceCountData as unknown as bigint) : 0;
      const paidCount = invoices.filter(inv => inv.status === 'paid').length;
      
      // Fallback to local sums if on-chain stats are unavailable
      const localTotalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => {
          const observed = (inv as any).observedInboundAmount as string | undefined;
          if (observed && observed !== '0') {
            try { return sum + Number(BigInt(observed)) / Math.pow(10, 18); } catch { return sum + inv.amount; }
          }
          return sum + inv.amount;
        }, 0);

      const localPending = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);

      setStats({
        totalRevenue: (totalRevenue as unknown as bigint) ? parseFloat(formatEther(totalRevenue as unknown as bigint)) : localTotalRevenue,
        pendingAmount: (pendingAmount as unknown as bigint) ? parseFloat(formatEther(pendingAmount as unknown as bigint)) : localPending,
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
  }, [refetchAllInvoices, refetchUserInvoices, totalRevenue, pendingAmount, invoiceCountData, invoices, address, isConnected]);
  
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
      
      // Snapshot balance at creation from Mezo RPC (wei)
      const payAddr = (data.payToAddress || data.bitcoinAddress || '').trim();
      let balanceSnapshotWei = '0';
      try {
        if (/^0x[a-fA-F0-9]{40}$/.test(payAddr)) {
          const bal = await boarRPC.getAddressBalance(payAddr);
          balanceSnapshotWei = String(bal.balance);
        }
      } catch (e) {
        console.warn('Failed to snapshot balance at creation; defaulting to 0', e);
      }

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
        requestedAmount: parseEther(data.amount).toString(),
        balanceAtCreation: balanceSnapshotWei, // Use measured balance snapshot (wei)
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
            balanceSnapshotWei // balanceAtCreation
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
              balanceSnapshotWei // balanceAtCreation
            ],
          } as any);
          
          console.log('createInvoiceWrite succeeded, transaction hash:', hash);
          setCreateTx({ status: 'success', hash });
          
          // Optimistically show the invoice in UI while awaiting chain confirmation
          setInvoices(prev => [
            {
              id: `pending_${Date.now()}`,
              clientName: data.clientName,
              clientCode,
              details: data.details,
              amount: parseFloat(data.amount),
              currency: data.currency,
              musdAmount: parseFloat(data.amount) * 0.98,
              status: 'pending',
              createdAt: now.toISOString(),
              expiresAt: expiresAt.toISOString(),
              wallet: data.bitcoinAddress,
              bitcoinAddress: data.bitcoinAddress,
              payToAddress: data.payToAddress || data.bitcoinAddress,
              creator: address,
              recipient: address,
              txHash: hash,
              requestedAmount: amountInWei.toString(),
              paymentTxHash: undefined,
              observedInboundAmount: undefined,
              balanceAtCreation: data.balanceAtCreation || '0',
            },
            ...prev,
          ]);
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
  
  // Verify payment via Boar using HTTP balance delta only (no WS fallback)
  const verifyPaymentViaBoar = useCallback(async (invoice: Invoice) => {
    try {
      const result = await paymentMonitor.confirmInvoicePaid(invoice);
      if (result.confirmed) {
        return { success: true, amount: result.amount };
      }
      return { success: false, error: result.error || 'No payment detected' };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }, []);
  
  // Confirm payment with verification
  const confirmPayment = useCallback(async (invoiceId: string) => {
    try {
      setConfirmTx({ status: 'pending' });
      console.log('🔄 Starting payment confirmation for invoice:', invoiceId);
      
      // Find the invoice to get payment details
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        console.error('❌ Invoice not found:', invoiceId);
        toast.error('Invoice not found');
        setConfirmTx({ status: 'error', error: 'Invoice not found' });
        return;
      }
      
      const paymentAddress = invoice.payToAddress || invoice.bitcoinAddress;
      if (!paymentAddress) {
        console.error('❌ No payment address found for invoice:', invoiceId);
        toast.error('No payment address found for this invoice');
        setConfirmTx({ status: 'error', error: 'No payment address' });
        return;
      }
      
      // Verify payment via Boar
      console.log('🔍 Verifying payment for invoice:', invoiceId);
      console.log('   Payment address:', paymentAddress);
      console.log('   Expected amount (BTC):', invoice.amount);
      toast.loading('Checking payment address for incoming BTC...', { id: 'checking-payment' });
      const verificationResult = await verifyPaymentViaBoar(invoice);
      toast.dismiss('checking-payment');
      
      if (verificationResult.success) {
        console.log('✅ Payment verified! Marking as paid...');
        
        // For draft invoices, mark as paid locally
        if (invoiceId.startsWith('draft_')) {
          invoiceStorage.markAsPaid(invoiceId, verificationResult.amount, (verificationResult as any).transaction?.txHash);
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
        
        console.log('📤 Confirming payment on blockchain...');
        toast.loading('Confirming payment on blockchain... Wallet will prompt for signature.', { id: 'confirming-blockchain' });
        
        try {
          const paymentTxHash = (verificationResult as any).transaction?.txHash || '';
          const observedAmount = verificationResult.amount || '0';
          
          // Get the transaction hash from the write operation
          const txHash = await confirmPaymentWrite({
            address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
            abi: INVOICE_CONTRACT_ABI,
            functionName: 'confirmPayment',
            args: [
              BigInt(invoiceId),
              paymentTxHash,
              observedAmount
            ]
          } as any);
          
          // Store transaction details immediately for Payments page
          const paymentAddress = invoice.payToAddress || invoice.bitcoinAddress;
          transactionStorage.addTransaction({
            txHash: txHash || paymentTxHash || `confirm_${invoiceId}_${Date.now()}`,
            invoiceId: invoiceId,
            from: 'unknown',
            to: paymentAddress || '',
            amount: observedAmount, // Actual amount received (in wei, may be more than requested)
            blockNumber: 0, // Will be updated when event is processed
            timestamp: Date.now(),
            confirmations: 1,
            status: 'confirmed',
          });
          
          console.log('✅ Transaction stored for Payments page:', {
            txHash,
            invoiceId,
            amount: observedAmount,
            paymentTxHash
          });
          
          toast.dismiss('confirming-blockchain');
          toast.success('Payment confirmed on blockchain! Transaction details saved.');
          try { window.dispatchEvent(new CustomEvent('notify', { detail: { title: 'Invoice paid', message: `Invoice #${invoiceId} confirmed on-chain` } })); } catch {}
          // Refresh to update Payments page immediately
          refreshData();
        } catch (blockchainError) {
          toast.dismiss('confirming-blockchain');
          console.error('❌ Blockchain confirmation error:', blockchainError);
          throw blockchainError;
        }
        
      } else {
        console.log('❌ Payment verification failed:', verificationResult.error);
        toast.error(`Payment verification failed: ${verificationResult.error || 'No payment detected. Make sure BTC was sent to the invoice address.'}`);
        setConfirmTx({ status: 'error', error: verificationResult.error });
      }
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      setConfirmTx({ status: 'error', error: 'Failed to confirm payment' });
      toast.error('Failed to confirm payment');
    }
  }, [address, isConnected, confirmPaymentWrite, invoices, refreshData, verifyPaymentViaBoar]);
  
  // Cancel invoice
  const cancelInvoice = useCallback(async (invoiceId: string) => {
    // IMMEDIATE UPDATE: Mark as cancelled in UI instantly for ALL invoice types
    const invoice = invoices.find(inv => inv.id === invoiceId);
    const previousStatus = invoice?.status;
    
    // Update UI immediately - works for both draft and on-chain
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: 'cancelled' as const }
        : inv
    ));
    
    // If this is a draft invoice (not yet on-chain), mark it as cancelled locally
    if (invoiceId.startsWith('draft_')) {
      invoiceStorage.markCancelled(invoiceId);
      toast.success('Invoice cancelled');
      return; // Done for draft invoices
    }

    // For on-chain invoices, we still need wallet confirmation if connected
    if (!address || !isConnected) {
      toast.success('Invoice marked as cancelled locally');
      // If wallet not connected, just keep the local update
      return;
    }

    if (!cancelInvoiceWrite) {
      console.error('cancelInvoiceWrite is undefined!');
      toast.error('Failed to initialize contract write');
      // Revert on error if write unavailable
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: (previousStatus || 'pending') }
          : inv
      ));
      return;
    }
    
    try {
      setCancelTx({ status: 'pending' });
      toast.loading('Confirming cancellation on-chain... Wallet will prompt for signature.', { id: 'cancel-invoice' });
      
      const hash = await cancelInvoiceWrite({
        address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
        abi: INVOICE_CONTRACT_ABI,
        functionName: 'cancelInvoice',
        args: [BigInt(invoiceId)]
      } as any);
      setCancelTx({ status: 'success', hash });
      toast.dismiss('cancel-invoice');
      toast.success('Invoice cancelled successfully on-chain');
      // Refresh to pick up InvoiceCancelled event for final confirmation
      refreshData();
      
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      setCancelTx({ status: 'error', error: 'Failed to cancel invoice' });
      toast.dismiss('cancel-invoice');
      toast.error('Failed to cancel invoice on-chain');
      // Revert optimistic update on error
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: (previousStatus || 'pending') }
          : inv
      ));
    }
  }, [address, isConnected, cancelInvoiceWrite, invoices]);

  // Approve invoice (Board role)
  const approveInvoice = useCallback(async (invoiceId: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!approveInvoiceWrite) {
      toast.error('Failed to initialize contract write');
      return;
    }
    try {
      await approveInvoiceWrite({
        address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
        abi: INVOICE_CONTRACT_ABI,
        functionName: 'approveInvoice',
        args: [BigInt(invoiceId)],
      } as any);
      toast.success('Approval transaction sent');
    } catch (error) {
      console.error('Error approving invoice:', error);
      toast.error('Failed to approve invoice');
    }
  }, [address, isConnected, approveInvoiceWrite]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Manual confirmation only - notify on detection, user clicks Mark as Paid to confirm
  const notifiedDetectedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const handlePaymentDetected = async (event: PaymentEvent) => {
      if (event.type === 'payment_detected' && event.transaction) {
        console.log('💰 Payment detected event received for invoice:', event.invoiceId);
        if (!notifiedDetectedRef.current.has(event.invoiceId)) {
          toast.success('Client payment detected. Click "Mark as Paid" to confirm.');
          // Do not add bell notification for detection; keep bell for explicit user actions
          notifiedDetectedRef.current.add(event.invoiceId);
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
      const payAddr = (invoice.payToAddress || invoice.bitcoinAddress || '').trim();
      const isEvmAddress = /^0x[a-fA-F0-9]{40}$/.test(payAddr);
      if (invoice.status === 'pending' && isEvmAddress) {
        console.log('👀 Monitoring for manual verification - invoice:', invoice.id, 'Payment address:', payAddr);

        // Calculate expected amount in wei
        const expectedAmount = invoice.amount ? parseEther(invoice.amount.toString()).toString() : undefined;

        // Subscribe to monitor the invoice's payToAddress (preferred) or bitcoinAddress
        paymentMonitor.subscribeToAddress({
          address: payAddr,
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
            // synced on blockchain
        };
        
        // Add to UI immediately
        setInvoices(prev => [blockchainInvoice, ...prev]);
        
        // Remove the draft from localStorage since it's now on blockchain
        invoiceStorage.removeDraft(latestDraft.id);
        
        // Notify that client has been notified (assumes invoice delivery)
        toast.success('Client has been notified');
        try { window.dispatchEvent(new CustomEvent('notify', { detail: { title: 'Invoice sent', message: 'Client received your request and will pay within 1 hour' } })); } catch {}

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
  }, [refreshData]);
  
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
    approveInvoice,
    refreshData,
    
    // Error handling
    error,
    clearError,
  };
}
