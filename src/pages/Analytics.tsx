import { useEffect, useMemo, useState } from 'react';
import type { Invoice } from '@/types/invoice';
import { transactionStorage } from '@/services/transaction-storage';
import { MEZO_EXPLORER_URL } from '@/lib/boar-config';
import { TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';

interface AnalyticsProps {
  invoices: Invoice[];
}

export function Analytics({ invoices }: AnalyticsProps) {
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBitcoinPrice(data.bitcoin.usd);
      } catch {
        setBitcoinPrice(65000);
      }
    };
    fetchBitcoinPrice();
  }, []);

  useEffect(() => {
    const onStorageUpdate = () => setVersion(v => v + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('transactions_updated', onStorageUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('transactions_updated', onStorageUpdate);
      }
    };
  }, []);

  const paidInvoices = useMemo(() => invoices.filter(i => i.status === 'paid'), [invoices]);
  const pendingInvoices = useMemo(() => invoices.filter(i => i.status === 'pending'), [invoices]);

  // Calculate total received using same logic as Payments/Dashboard (use observedInboundAmount)
  const totalReceived = useMemo(() => {
    return paidInvoices.reduce((sum, inv) => {
      let amountBtc = inv.amount; // fallback to requested amount
      try {
        const observed = (inv as any).observedInboundAmount as string | undefined;
        if (observed && observed !== '0' && observed !== '') {
          amountBtc = Number(BigInt(observed)) / Math.pow(10, 18);
        } else {
          const txs = transactionStorage.getTransactionsForInvoice(inv.id);
          const latest = txs[0];
          if (latest?.amount) {
            amountBtc = Number(BigInt(latest.amount)) / Math.pow(10, 18);
          }
        }
      } catch {}
      return sum + amountBtc;
    }, 0);
  }, [paidInvoices, version]);

  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Calculate monthly activity data for all months (from oldest invoice to now)
  const monthlyData = useMemo(() => {
    const months: { [key: string]: { revenue: number; count: number } } = {};
    const now = new Date();
    
    // Find the oldest paid invoice date
    let oldestDate: Date | null = null;
    paidInvoices.forEach(inv => {
      const paidDate = inv.paidAt ? new Date(inv.paidAt) : (inv.createdAt ? new Date(inv.createdAt) : new Date());
      if (!oldestDate || paidDate < oldestDate) {
        oldestDate = paidDate;
      }
    });

    // If no paid invoices, default to last 6 months including current month
    if (!oldestDate || paidInvoices.length === 0) {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[key] = { revenue: 0, count: 0 };
      }
      // Always include current month
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (!months[currentMonthKey]) {
        months[currentMonthKey] = { revenue: 0, count: 0 };
      }
    } else {
      // Initialize all months from oldest date to current month (always include current month)
      const od = oldestDate as Date;
      const startDate = new Date(od.getFullYear(), od.getMonth(), 1);
      const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let current = new Date(startDate);
      while (current <= currentDate) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        months[key] = { revenue: 0, count: 0 };
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }
      // Always ensure current month is included
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (!months[currentMonthKey]) {
        months[currentMonthKey] = { revenue: 0, count: 0 };
      }
    }

    // Process paid invoices
    paidInvoices.forEach(inv => {
      let amountBtc = inv.amount;
      try {
        const observed = (inv as any).observedInboundAmount as string | undefined;
        if (observed && observed !== '0' && observed !== '') {
          amountBtc = Number(BigInt(observed)) / Math.pow(10, 18);
        } else {
          const txs = transactionStorage.getTransactionsForInvoice(inv.id);
          const latest = txs[0];
          if (latest?.amount) {
            amountBtc = Number(BigInt(latest.amount)) / Math.pow(10, 18);
          }
        }
      } catch {}

      const paidDate = inv.paidAt ? new Date(inv.paidAt) : (inv.createdAt ? new Date(inv.createdAt) : new Date());
      const monthKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (months[monthKey]) {
        months[monthKey].revenue += amountBtc;
        months[monthKey].count += 1;
      }
    });

    return Object.entries(months).map(([key, value]) => ({
      month: key,
      revenue: value.revenue,
      count: value.count,
      revenueUSD: value.revenue * bitcoinPrice,
    }));
  }, [paidInvoices, bitcoinPrice, version]);

  // Calculate average payment size
  const averagePayment = paidInvoices.length > 0 ? totalReceived / paidInvoices.length : 0;

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    const statuses: { [key: string]: number } = {};
    invoices.forEach(inv => {
      statuses[inv.status] = (statuses[inv.status] || 0) + 1;
    });
    return statuses;
  }, [invoices]);

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 0.001);

  const recentPayments = useMemo(() => {
    const map = new Map<string, { invoice: Invoice; amountBtc: number; txHash?: string; timestamp: number }>();
    for (const inv of paidInvoices) {
      const txs = transactionStorage.getTransactionsForInvoice(inv.id);
      const latest = txs[0];
      const amount = latest?.amount ? Number(BigInt(latest.amount)) / Math.pow(10, 18) : inv.amount;
      map.set(inv.id, {
        invoice: inv,
        amountBtc: amount,
        txHash: latest?.txHash || inv.paymentTxHash,
        timestamp: latest?.timestamp || (inv.paidAt ? new Date(inv.paidAt).getTime() : new Date(inv.createdAt).getTime()),
      });
    }
    return Array.from(map.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [paidInvoices, version]);

  const lastPaymentAt = recentPayments[0]?.timestamp;

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">Analytics</h1>
        <p className="text-sm font-navbar text-white/60">Business insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 active:scale-[0.98] touch-manipulation">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <p className="text-xs font-navbar text-white/60">Total Received</p>
          </div>
          <p className="text-xl font-bold font-navbar text-white">{totalReceived.toFixed(8)} BTC</p>
          <p className="text-xs font-navbar text-white/50">${(totalReceived * bitcoinPrice).toFixed(2)} USD</p>
        </div>
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-blue-400/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <p className="text-xs font-navbar text-white/60">Paid Invoices</p>
          </div>
          <p className="text-xl font-bold font-navbar text-white">{paidInvoices.length}</p>
          <p className="text-xs font-navbar text-white/50">Avg: {averagePayment.toFixed(8)} BTC</p>
        </div>
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-orange-400/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <p className="text-xs font-navbar text-white/60">Pending Amount</p>
          </div>
          <p className="text-xl font-bold font-navbar text-white">{pendingAmount.toFixed(8)} BTC</p>
          <p className="text-xs font-navbar text-white/50">${(pendingAmount * bitcoinPrice).toFixed(2)} USD</p>
        </div>
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-purple-400/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <p className="text-xs font-navbar text-white/60">Last Payment</p>
          </div>
          <p className="text-sm font-bold font-navbar text-white">{lastPaymentAt ? new Date(lastPaymentAt).toLocaleDateString() : '—'}</p>
          <p className="text-xs font-navbar text-white/50">{lastPaymentAt ? new Date(lastPaymentAt).toLocaleTimeString() : 'No payments'}</p>
        </div>
      </div>

      {/* Monthly Revenue Chart - Enhanced & Motivating */}
      <div className="bg-gradient-to-br from-[#2C2C2E]/60 to-[#1a1a1c]/60 backdrop-blur-xl border border-green-400/20 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 pointer-events-none"></div>
        
        {/* Header with motivational messaging */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold font-navbar text-white">Revenue Growth</h2>
            </div>
            
            {/* Milestone Progress */}
            <div className="ml-12 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-navbar text-white/90">Journey to</span>
                <span className="text-2xl font-bold font-navbar bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">$1,000,000</span>
                <span className="text-sm font-navbar text-white/60">💰</span>
              </div>
              
              {/* Progress Bar */}
              {(() => {
                const currentTotal = totalReceived * bitcoinPrice;
                const milestone = 1000000; // $1M milestone
                const progress = Math.min((currentTotal / milestone) * 100, 100);
                const formattedCurrent = currentTotal.toLocaleString('en-US', { maximumFractionDigits: 2 });
                
                return (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-navbar">
                      <span className="text-white/70">Current: <span className="text-green-400 font-bold">${formattedCurrent}</span></span>
                      <span className="text-white/70">Goal: <span className="text-yellow-400 font-bold">$1,000,000</span></span>
                      <span className="text-white/70">Progress: <span className="text-green-400 font-bold">{progress.toFixed(2)}%</span></span>
                    </div>
                    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full transition-all duration-1000 shadow-lg shadow-green-500/50"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                      {/* Milestone markers */}
                      {progress >= 10 && (
                        <div className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-yellow-400/50"></div>
                      )}
                      {progress >= 25 && (
                        <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-yellow-400/50"></div>
                      )}
                      {progress >= 50 && (
                        <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-yellow-400/50"></div>
                      )}
                      {progress >= 75 && (
                        <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-yellow-400/50"></div>
                      )}
                      {progress >= 100 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-400 animate-pulse">🎉 Milestone Achieved!</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              <p className="text-xs font-navbar text-white/50 mt-2">
                ✨ Track your success month by month ✨
              </p>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative z-10">
          <div className="h-80 overflow-x-auto pb-4">
            <div className="flex items-end gap-3 min-w-max px-2">
              {monthlyData.map((data) => {
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                const monthLabel = new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                const hasRevenue = data.revenue > 0;
                const isPeak = data.revenue === maxRevenue && maxRevenue > 0;
                
                return (
                  <div 
                    key={data.month} 
                    className="flex flex-col items-center group relative min-w-[60px]"
                  >
                    {/* Peak indicator */}
                    {isPeak && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 mb-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                          🏆 PEAK
                        </div>
                      </div>
                    )}
                    
                    {/* Bar container */}
                    <div className="w-full relative flex flex-col items-center justify-end h-full min-h-[200px]">
                      {/* Revenue bar */}
                      <div className="w-full relative group/bar cursor-pointer">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative overflow-hidden ${
                            hasRevenue 
                              ? 'bg-gradient-to-t from-green-600 via-green-500 to-green-400 shadow-lg shadow-green-500/30 hover:shadow-green-500/50' 
                              : 'bg-white/5'
                          }`}
                          style={{ 
                            height: `${Math.max(height, hasRevenue ? 3 : 2)}%`, 
                            minHeight: hasRevenue ? '12px' : '4px',
                            animation: hasRevenue ? 'glow 2s ease-in-out infinite' : 'none'
                          }}
                        >
                          {/* Shimmer effect for bars with revenue */}
                          {hasRevenue && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>
                          )}
                          
                          {/* Sparkle effect for peak months */}
                          {isPeak && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-lg animate-ping">✨</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <div className="mt-3 text-center">
                      <p className="text-xs font-navbar text-white/60 font-medium">{monthLabel.split(' ')[0]}</p>
                      <p className="text-[10px] font-navbar text-white/40">{new Date(data.month + '-01').getFullYear()}</p>
                      {hasRevenue && (
                        <div className="mt-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Chart footer with total stats */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs font-navbar text-white/60">Total Period</p>
              <p className="text-sm font-bold font-navbar text-white">{monthlyData.length} months</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-xs font-navbar text-white/60">Active Months</p>
              <p className="text-sm font-bold font-navbar text-green-400">{monthlyData.filter(m => m.revenue > 0).length}</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-xs font-navbar text-white/60">Total Revenue</p>
              <p className="text-sm font-bold font-navbar text-green-400">${(totalReceived * bitcoinPrice).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Add CSS animations */}
        <style>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2); }
            50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-navbar text-white/90 mb-4">Invoice Status</h2>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = invoices.length > 0 ? (count / invoices.length) * 100 : 0;
              const colorMap: { [key: string]: string } = {
                paid: 'bg-green-400',
                pending: 'bg-blue-400',
                cancelled: 'bg-red-400',
                draft: 'bg-gray-400',
              };
              const colorClass = colorMap[status] || 'bg-gray-400';
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-navbar text-white capitalize">{status}</span>
                      <span className="text-xs font-navbar text-white/60">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClass} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Activity */}
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-navbar text-white/90 mb-4">Payment Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#2C2C2E]/20">
              <span className="text-sm font-navbar text-white/70">Total Payments</span>
              <span className="text-sm font-bold font-navbar text-white">{paidInvoices.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#2C2C2E]/20">
              <span className="text-sm font-navbar text-white/70">Average Payment</span>
              <span className="text-sm font-bold font-navbar text-green-400">{averagePayment.toFixed(8)} BTC</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#2C2C2E]/20">
              <span className="text-sm font-navbar text-white/70">Total Revenue</span>
              <span className="text-sm font-bold font-navbar text-green-400">${(totalReceived * bitcoinPrice).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#2C2C2E]/20">
              <span className="text-sm font-navbar text-white/70">Pending Invoices</span>
              <span className="text-sm font-bold font-navbar text-blue-400">{pendingInvoices.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold font-navbar text-white/90">Recent Payments</h2>
        </div>
        {recentPayments.length === 0 ? (
          <p className="text-sm font-navbar text-white/60">No recent payments</p>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.invoice.id} className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10">
                <div>
                  <p className="font-navbar font-medium text-white">{p.invoice.clientName}</p>
                  <p className="text-xs font-navbar text-white/50">{new Date(p.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-navbar font-semibold text-green-400">+{p.amountBtc.toFixed(8)} BTC</p>
                  {p.txHash && (
                    <a
                      href={`${MEZO_EXPLORER_URL}/tx/${p.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 font-navbar"
                    >
                      {p.txHash.slice(0, 10)}...{p.txHash.slice(-8)}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
