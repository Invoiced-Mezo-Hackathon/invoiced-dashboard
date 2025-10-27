import { useState, useEffect } from 'react';
import { ArrowDownLeft, BarChart3, List, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { transactionStorage } from '@/services/transaction-storage';
import { MEZO_EXPLORER_URL } from '@/lib/boar-config';

interface Invoice {
  id: string;
  clientName: string;
  clientCode: string;
  details: string;
  amount: number;
  currency: string;
  musdAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  wallet: string;
  bitcoinAddress?: string;
}

interface PaymentsProps {
  invoices: Invoice[];
}

export function Payments({ invoices }: PaymentsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);

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
  const paymentHistory = invoices
    .filter(invoice => invoice.status === 'paid')
    .map(invoice => {
      // Get transaction details from storage
      const transactions = transactionStorage.getTransactionsForInvoice(invoice.id);
      const latestTransaction = transactions[0]; // Most recent transaction
      
      return {
        id: invoice.id,
        type: 'received' as const,
        counterparty: invoice.clientName,
        amount: invoice.amount,
        date: invoice.paidAt || invoice.createdAt,
        status: latestTransaction?.status || 'confirmed',
        bitcoinAddress: invoice.bitcoinAddress,
        // Enhanced transaction details
        txHash: latestTransaction?.txHash || invoice.paymentTxHash,
        blockNumber: latestTransaction?.blockNumber,
        confirmations: latestTransaction?.confirmations,
        from: latestTransaction?.from,
        to: latestTransaction?.to,
      };
    });

  const totalReceived = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);

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
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 font-title bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Payments
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-foreground/60">Track your payment history and transactions</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-400">+12.5%</span>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{totalReceived.toFixed(8)} BTC</p>
            <p className="text-sm text-foreground/60">Net Balance</p>
            <p className="text-xs text-white/50">${(totalReceived * bitcoinPrice).toFixed(2)} USD</p>
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
            <p className="text-xs text-white/50">Paid invoices</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="glass p-6 rounded-2xl border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-title">Payment History</h2>
          <div className="flex items-center gap-2">
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
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.counterparty}</p>
                      <p className="text-sm text-white/50">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">+{payment.amount.toFixed(8)} BTC</p>
                    <p className="text-xs text-white/60">${(payment.amount * bitcoinPrice).toFixed(2)} USD</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        {payment.status}
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
                      {payment.confirmations !== undefined && (
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
    </div>
  );
}