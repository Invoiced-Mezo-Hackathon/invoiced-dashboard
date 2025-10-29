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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">
          Payments
        </h1>
        <p className="text-sm font-navbar text-white/60">Track your payment history and transactions</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

        <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-4 hover:border-blue-400/50 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg border border-blue-400/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-navbar font-medium text-blue-400">+12.5%</span>
          </div>
          <div>
            <p className="text-xl font-bold font-navbar mb-1"><span className="text-green-400">{totalReceived.toFixed(8)}</span> BTC</p>
            <p className="text-xs font-navbar text-white/60">Net Balance</p>
            <p className="text-xs font-navbar text-white/50">$<span className="text-green-400">{(totalReceived * bitcoinPrice).toFixed(2)}</span> USD</p>
          </div>
        </div>

        <div className="bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-4 hover:border-purple-400/50 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg border border-purple-400/30 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-white" />
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