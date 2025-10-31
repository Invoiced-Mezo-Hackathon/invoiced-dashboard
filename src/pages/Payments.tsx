import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowDownLeft, BarChart3, ExternalLink } from 'lucide-react';
import { transactionStorage } from '@/services/transaction-storage';
import { MEZO_EXPLORER_URL } from '@/lib/boar-config';
import type { Invoice } from '@/types/invoice';
import { useWatchContractEvent } from 'wagmi';
import { INVOICE_CONTRACT_ABI, MEZO_CONTRACTS } from '@/lib/mezo';

interface PaymentsProps {
  invoices: Invoice[];
}

export function Payments({ invoices }: PaymentsProps) {
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [version, setVersion] = useState(0); // trigger refresh when new events arrive
  const notifiedTxsRef = useRef<Set<string>>(new Set());

  // Fetch real-time Bitcoin price
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBitcoinPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        setBitcoinPrice(65000); // Fallback price
      }
    };

    fetchBitcoinPrice();
  }, []);

  // Subscribe to on-chain events to keep payments list fresh
  useEffect(() => {
    const onStorageUpdate = () => setVersion((v) => v + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('transactions_updated', onStorageUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('transactions_updated', onStorageUpdate);
      }
    };
  }, []);

  // Subscribe to on-chain events to keep payments list fresh
  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoicePaid',
    onLogs: (logs) => {
      console.log('💰 InvoicePaid event detected, storing transaction details...');
      // No bell notification here; invoice confirmation bell is dispatched on explicit user action
      // Store complete transaction info with all payment details
      for (const log of logs) {
        // InvoicePaid(uint256 indexed id, uint256 amount, uint256 timestamp, string paymentTxHash, string observedInboundAmount)
        const invoiceId = (log.args?.id as bigint | undefined)?.toString();
        const txHash = log.transactionHash as string | undefined;
        
        // Access event args - wagmi uses array position or named access
        const args = log.args as any;
        const requestedAmount = args?.amount ? String(args.amount) : '0';
        const paymentTxHash = typeof args?.paymentTxHash === 'string' ? args.paymentTxHash : undefined;
        const observedAmount = typeof args?.observedInboundAmount === 'string' ? args.observedInboundAmount : undefined;
        const timestamp = args?.timestamp ? Number(args.timestamp) : Date.now();
        
        if (!invoiceId || !txHash) {
          console.warn('⚠️ InvoicePaid event missing invoiceId or txHash', log);
          continue;
        }
        
        // Use observed amount if available (handles overpayments), otherwise use requested amount
        const actualAmount = observedAmount && observedAmount !== '0' && observedAmount !== '' 
          ? observedAmount 
          : requestedAmount;
        
        console.log('📝 Storing payment transaction:', {
          invoiceId,
          txHash,
          paymentTxHash,
          requestedAmount,
          observedAmount,
          actualAmount
        });
        
        // Check if transaction already exists to avoid duplicates
        const existingTx = transactionStorage.getTransactionByHash(txHash);
        if (!existingTx) {
          transactionStorage.addTransaction({
            txHash,
            invoiceId,
            from: '',
            to: '',
            amount: actualAmount, // Use observed amount (may be more than requested)
            blockNumber: Number(log.blockNumber ?? 0),
            timestamp: timestamp > 0 ? timestamp : Date.now(),
            confirmations: 1,
            status: 'confirmed',
          });
          
          // Also store the Boar payment transaction hash if different from confirm tx
          if (paymentTxHash && paymentTxHash !== '' && paymentTxHash !== txHash) {
            const boarTx = transactionStorage.getTransactionByHash(paymentTxHash);
            if (!boarTx) {
              transactionStorage.addTransaction({
                txHash: paymentTxHash,
                invoiceId,
                from: '',
                to: '',
                amount: actualAmount,
                blockNumber: Number(log.blockNumber ?? 0),
                timestamp: timestamp > 0 ? timestamp : Date.now(),
                confirmations: 1,
                status: 'confirmed',
              });
            }
          }
        } else {
          console.log('ℹ️ Transaction already stored, updating details...');
          // Update existing transaction with latest info
          if (observedAmount && observedAmount !== '0' && observedAmount !== '') {
            existingTx.amount = observedAmount;
            transactionStorage.updateTransactionStatus(txHash, 'confirmed');
          }
        }
      }
      console.log('✅ Payment transactions stored, refreshing Payments page');
      setVersion((v) => v + 1);
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceApproved',
    onLogs: () => {
      setVersion((v) => v + 1);
    }
  });

  // Calculate payment history from invoices with transaction details (memoized)
  const paymentHistory = useMemo(() => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .map(invoice => {
        const transactions = transactionStorage.getTransactionsForInvoice(invoice.id);
        const latestTransaction = transactions[0];
        
        // Prefer observedInboundAmount (wei) recorded on chain; fallback to tx amount (wei). Convert to BTC.
        let amountBtc = invoice.amount; // fallback to requested amount
        try {
          const observed = (invoice as any).observedInboundAmount as string | undefined;
          if (observed && observed !== '0') {
            amountBtc = Number(BigInt(observed)) / Math.pow(10, 18);
          } else if (latestTransaction?.amount) {
            amountBtc = Number(BigInt(latestTransaction.amount)) / Math.pow(10, 18);
          }
        } catch {}

        // Only show tx link when we have a real tx hash
        const txHash = latestTransaction?.txHash && latestTransaction.txHash.startsWith('0x')
          ? latestTransaction.txHash
          : (invoice.paymentTxHash && invoice.paymentTxHash.startsWith('0x') ? invoice.paymentTxHash : undefined);
        
        return {
          id: invoice.id,
          type: 'received' as const,
          counterparty: invoice.clientName,
          amount: amountBtc,
          requestedAmount: invoice.amount,
          date: invoice.paidAt || invoice.createdAt,
          status: latestTransaction?.status || 'confirmed',
          bitcoinAddress: invoice.bitcoinAddress,
          txHash,
          blockNumber: latestTransaction?.blockNumber,
          confirmations: latestTransaction?.confirmations,
          from: latestTransaction?.from,
          to: latestTransaction?.to,
        };
      });
  }, [invoices, version]);

  const totalReceived = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);


  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">
          Payments
        </h1>
        <p className="text-sm font-navbar text-white/60">Track your payment history and transactions</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-500/20 backdrop-blur-xl border border-green-400/30 rounded-2xl p-4 hover:border-green-400/50 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg border border-green-400/30 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-navbar font-medium text-green-400">+{paymentHistory.length}</span>
          </div>
          <div>
            <p className="text-xl font-bold font-navbar mb-1"><span className="text-green-400">{totalReceived.toFixed(8)}</span> BTC</p>
            <p className="text-xs font-navbar text-white/60">Total Received</p>
            <p className="text-xs font-navbar text-white/50">$<span className="text-green-400">{(totalReceived * bitcoinPrice).toFixed(2)}</span> USD</p>
          </div>
        </div>

        <div className="bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-4 hover:border-purple-400/50 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg border border-purple-400/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-navbar font-medium text-purple-400">+{paymentHistory.length}</span>
          </div>
          <div>
            <p className="text-xl font-bold font-navbar mb-1"><span className="text-green-400">{paymentHistory.length}</span></p>
            <p className="text-xs font-navbar text-white/60">Transactions</p>
            <p className="text-xs font-navbar text-white/50">Paid invoices</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4 mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold font-navbar text-white/90">Payment History</h2>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10 hover:border-green-400/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg border border-green-400/30 flex items-center justify-center">
                    <i className="fa-solid fa-circle-down text-green-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-navbar font-medium text-white">{payment.counterparty}</p>
                    <p className="text-xs font-navbar text-white/50">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-navbar font-semibold text-green-400">+<span className="text-green-400">{payment.amount.toFixed(8)}</span> BTC</p>
                  <p className="text-xs font-navbar text-white/60">$<span className="text-green-400">{(payment.amount * bitcoinPrice).toFixed(2)}</span> USD</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-navbar">
                      {payment.status}
                    </span>
                    {payment.txHash && (
                      <a
                        href={`${MEZO_EXPLORER_URL}/tx/${payment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-navbar"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {payment.txHash.slice(0, 8)}...{payment.txHash.slice(-8)}
                      </a>
                    )}
                    {payment.blockNumber && (
                      <span className="text-xs text-white/50 font-navbar">
                        Block #{payment.blockNumber}
                      </span>
                    )}
                    {payment.confirmations !== undefined && (
                      <span className="text-xs text-white/50 font-navbar">
                        {payment.confirmations} confirmations
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mb-4">
              <i className="fa-solid fa-circle-down text-green-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2 font-navbar text-white">No confirmed payments yet</h3>
            <p className="text-white/60 text-sm font-navbar">Confirmed payments will appear here once invoices are marked as paid</p>
          </div>
        )}
      </div>
    </div>
  );
}