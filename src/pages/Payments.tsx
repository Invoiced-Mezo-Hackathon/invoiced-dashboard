import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, BarChart3, List, ExternalLink, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { transactionStorage } from '@/services/transaction-storage';
import { MEZO_EXPLORER_URL } from '@/lib/boar-config';
import { Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';
import { paymentMonitor, PaymentEvent } from '@/services/payment-monitor';
import { useToast } from '@/hooks/use-toast';

interface PaymentsProps {
  invoices: Invoice[];
}

export function Payments({ invoices }: PaymentsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'confirmed' | 'manual'>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Set up payment monitoring callbacks to refresh payments section
  useEffect(() => {
    paymentMonitor.setCallbacks({
      onPaymentDetected: (event: PaymentEvent) => {
        console.log('💰 Payment detected in Payments section:', event.invoiceId);
        toast({
          title: "🎉 Payment Received!",
          description: `New payment detected and added to payments history`,
          duration: 4000,
        });
        // Trigger refresh of payment history
        setRefreshTrigger(prev => prev + 1);
      },
      onPaymentConfirmed: (event: PaymentEvent) => {
        console.log('✅ Payment confirmed in Payments section:', event.invoiceId);
        toast({
          title: "✅ Payment Confirmed!",
          description: `Payment has been confirmed with ${event.transaction?.confirmations || 1} confirmations`,
          duration: 4000,
        });
        // Trigger refresh of payment history
        setRefreshTrigger(prev => prev + 1);
      },
      onConnectionStatus: (event: PaymentEvent) => {
        if (event.status === 'connected') {
          console.log('🔌 Payment monitor connected in Payments section');
        } else if (event.status === 'disconnected') {
          console.log('🔌 Payment monitor disconnected in Payments section');
        }
      },
      onError: (error) => {
        console.error('🚨 Payment monitor error in Payments section:', error);
      },
    });

    return () => {
      // Clean up callbacks when component unmounts
      paymentMonitor.setCallbacks({});
    };
  }, [toast]);

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

  // Calculate payment history from invoices with transaction details
  // Include refreshTrigger to recalculate when Boar detects payments
  const paymentHistory = React.useMemo(() => invoices
    .filter(invoice => invoice.status === 'paid')
    .map(invoice => {
      // Get transaction details from storage (refreshTrigger ensures updates)
      const transactions = transactionStorage.getTransactionsForInvoice(invoice.id);
      const latestTransaction = transactions[0]; // Most recent transaction
      
      // Calculate actual amount received
      const requestedAmount = invoice.amount;
      const actualAmount = invoice.observedInboundAmount
        ? parseFloat(invoice.observedInboundAmount) / 1e18
        : invoice.amount;
      const overpaid = actualAmount > requestedAmount;
      const overpaidAmount = overpaid ? actualAmount - requestedAmount : 0;
      
      // Determine if this is a confirmed transaction or manual confirmation
      const hasTransaction = latestTransaction?.txHash || invoice.paymentTxHash;
      const isConfirmed = hasTransaction && latestTransaction?.status === 'confirmed';
      
      return {
        id: invoice.id,
        type: 'received' as const,
        counterparty: invoice.clientName,
        amount: actualAmount,
        requestedAmount,
        overpaid,
        overpaidAmount,
        date: invoice.paidAt || invoice.createdAt,
        status: latestTransaction?.status || 'confirmed',
        bitcoinAddress: invoice.bitcoinAddress,
        payToAddress: invoice.payToAddress,
        // Enhanced transaction details
        txHash: latestTransaction?.txHash || invoice.paymentTxHash,
        blockNumber: latestTransaction?.blockNumber,
        confirmations: latestTransaction?.confirmations,
        from: latestTransaction?.from,
        to: latestTransaction?.to,
        hasTransaction,
        isConfirmed,
        isManual: !hasTransaction,
      };
    })
    .filter(payment => {
      // Apply filter
      switch (filterType) {
        case 'confirmed':
          return payment.isConfirmed;
        case 'manual':
          return payment.isManual;
        default:
          return true;
      }
    }), [invoices, refreshTrigger, filterType]);

  const totalReceived = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate confirmed vs manual transactions
  const confirmedTransactions = paymentHistory.filter(p => p.isConfirmed).length;
  const manualTransactions = paymentHistory.filter(p => p.isManual).length;
  const totalOverpaid = paymentHistory.reduce((sum, payment) => sum + (payment.overpaidAmount || 0), 0);

  // Generate chart data from payment history
  const chartData = paymentHistory.reduce((acc, payment) => {
    const date = new Date(payment.date).toLocaleDateString();
    const existing = acc.find(item => item.day === date);
    
    if (existing) {
      existing.balance += payment.amount;
      existing.received += payment.amount;
    } else {
      acc.push({
        day: date,
        balance: payment.amount,
        received: payment.amount,
      });
    }
    
    return acc;
  }, [] as any[]).sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());


  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 font-title bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Payments
        </h1>
        <p className="text-foreground/60 text-lg">Track your payment history and transactions</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <ArrowDownLeft className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-400">+{paymentHistory.length}</span>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{totalReceived.toFixed(8)} BTC</p>
            <p className="text-sm text-foreground/60">Total Received</p>
            <p className="text-xs text-white/50">${(totalReceived * bitcoinPrice).toFixed(2)} USD</p>
            {totalOverpaid > 0 && (
              <p className="text-xs text-green-400 mt-1">
                +{totalOverpaid.toFixed(8)} BTC in tips
              </p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <ArrowDownLeft className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-400">+{paymentHistory.length}</span>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{paymentHistory.length}</p>
            <p className="text-sm text-foreground/60">Transactions</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {confirmedTransactions} Confirmed
              </span>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                {manualTransactions} Manual
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="glass p-6 rounded-2xl border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-title">Payment History</h2>
          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={filterType === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('confirmed')}
                className="text-xs"
              >
                Confirmed
              </Button>
              <Button
                variant={filterType === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('manual')}
                className="text-xs"
              >
                Manual
              </Button>
            </div>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'graph' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('graph')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Graph
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      payment.isConfirmed ? 'bg-green-500/10' : 
                      payment.isManual ? 'bg-orange-500/10' : 
                      'bg-yellow-500/10'
                    }`}>
                      {payment.isConfirmed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : payment.isManual ? (
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{payment.counterparty}</p>
                      <p className="text-sm text-white/50">
                        {payment.isConfirmed ? 'Confirmed' : payment.isManual ? 'Manual' : 'Pending'} • {new Date(payment.date).toLocaleDateString()}
                      </p>
                      {payment.payToAddress && (
                        <p className="text-xs text-white/40 font-mono">
                          To: {payment.payToAddress.slice(0, 8)}...{payment.payToAddress.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-green-400">+{payment.amount.toFixed(8)} BTC</p>
                      {payment.overpaid && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          +{payment.overpaidAmount.toFixed(8)} tip
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60">${(payment.amount * bitcoinPrice).toFixed(2)} USD</p>
                    {payment.overpaid && (
                      <p className="text-xs text-green-400">
                        Requested: ${(payment.requestedAmount * bitcoinPrice).toFixed(2)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.isConfirmed ? 'bg-green-500/20 text-green-400' :
                        payment.isManual ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {payment.isConfirmed ? 'Confirmed' : payment.isManual ? 'Manual' : payment.status}
                      </span>
                      {payment.txHash && (
                        <a
                          href={`${MEZO_EXPLORER_URL}/tx/${payment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {payment.txHash.slice(0, 8)}...{payment.txHash.slice(-8)}
                        </a>
                      )}
                      {payment.blockNumber && (
                        <span className="text-xs text-white/50">
                          Block #{payment.blockNumber}
                        </span>
                      )}
                      {payment.confirmations !== undefined && payment.confirmations > 0 && (
                        <span className="text-xs text-white/50">
                          {payment.confirmations} confirmations
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                <div className="text-4xl">💰</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-title">No confirmed payments yet</h3>
              <p className="text-foreground/60 text-sm">Confirmed payments will appear here once invoices are marked as paid</p>
            </div>
          )
        ) : (
          chartData.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="balance" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Daily Payments</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="received" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                <div className="text-4xl">📊</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-title">No data to display</h3>
              <p className="text-foreground/60 text-sm">Payment charts will appear once you have confirmed payments</p>
            </div>
          )
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-title">Transaction Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Payment Info */}
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Client</p>
                    <p className="font-medium">{selectedPayment.counterparty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Date</p>
                    <p className="font-medium">{new Date(selectedPayment.date).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Amount Received</p>
                    <p className="font-medium text-green-400">{selectedPayment.amount.toFixed(8)} BTC</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">USD Value</p>
                    <p className="font-medium">${(selectedPayment.amount * bitcoinPrice).toFixed(2)}</p>
                  </div>
                </div>
                {selectedPayment.overpaid && (
                  <div className="mt-3 p-3 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-green-400">
                      <strong>Tip Received:</strong> +{selectedPayment.overpaidAmount.toFixed(8)} BTC 
                      (${(selectedPayment.overpaidAmount * bitcoinPrice).toFixed(2)})
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Requested: {selectedPayment.requestedAmount.toFixed(8)} BTC
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">Transaction Details</h3>
                {selectedPayment.txHash ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-white/60">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{selectedPayment.txHash}</p>
                        <a
                          href={`${MEZO_EXPLORER_URL}/tx/${selectedPayment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    {selectedPayment.blockNumber && (
                      <div>
                        <p className="text-sm text-white/60">Block Number</p>
                        <p className="font-medium">#{selectedPayment.blockNumber}</p>
                      </div>
                    )}
                    {selectedPayment.confirmations !== undefined && (
                      <div>
                        <p className="text-sm text-white/60">Confirmations</p>
                        <p className="font-medium">{selectedPayment.confirmations}</p>
                      </div>
                    )}
                    {selectedPayment.from && (
                      <div>
                        <p className="text-sm text-white/60">From Address</p>
                        <p className="font-mono text-sm">{selectedPayment.from}</p>
                      </div>
                    )}
                    {selectedPayment.to && (
                      <div>
                        <p className="text-sm text-white/60">To Address</p>
                        <p className="font-mono text-sm">{selectedPayment.to}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-orange-400 font-medium">Manual Confirmation</p>
                    <p className="text-sm text-white/60 mt-1">No transaction hash available</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">Status</h3>
                <div className="flex items-center gap-3">
                  {selectedPayment.isConfirmed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Confirmed Transaction</span>
                    </>
                  ) : selectedPayment.isManual ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <span className="text-orange-400 font-medium">Manual Confirmation</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}