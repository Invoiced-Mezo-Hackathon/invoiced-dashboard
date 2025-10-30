import { useEffect, useMemo, useState } from 'react';
import type { Invoice } from '@/types/invoice';
import { transactionStorage } from '@/services/transaction-storage';
import { MEZO_EXPLORER_URL } from '@/lib/boar-config';

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

  const totalReceived = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4">
          <p className="text-xs font-navbar text-white/60 mb-1">Total Received</p>
          <p className="text-xl font-bold font-navbar text-white">{totalReceived.toFixed(8)} BTC</p>
          <p className="text-xs font-navbar text-white/50">${(totalReceived * bitcoinPrice).toFixed(2)} USD</p>
        </div>
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4">
          <p className="text-xs font-navbar text-white/60 mb-1">Paid Invoices</p>
          <p className="text-xl font-bold font-navbar text-white">{paidInvoices.length}</p>
        </div>
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4">
          <p className="text-xs font-navbar text-white/60 mb-1">Pending Amount</p>
          <p className="text-xl font-bold font-navbar text-white">{pendingAmount.toFixed(8)} BTC</p>
        </div>
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4">
          <p className="text-xs font-navbar text-white/60 mb-1">Last Payment</p>
          <p className="text-xl font-bold font-navbar text-white">{lastPaymentAt ? new Date(lastPaymentAt).toLocaleString() : '—'}</p>
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
