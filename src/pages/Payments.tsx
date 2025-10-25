import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, BarChart3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useWalletUtils } from '@/hooks/useWalletUtils';

export function Payments() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const { account, formatAddress, isConnected } = useWalletUtils();

  const payments: Array<{
    id: string;
    type: 'received' | 'sent';
    counterparty: string;
    amount: number;
    date: string;
    status: string;
  }> = [];

  const totalReceived = 0;
  const totalSent = 0;

  // Empty chart data
  const chartData: Array<{
    day: string;
    balance: number;
    received: number;
    sent: number;
  }> = [];

  const handleWithdraw = () => {
    // Simulate withdrawal
    console.log('Withdrawing:', withdrawAmount);
    setWithdrawAmount('');
    setShowWithdrawModal(false);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-title">Payments</h1>
        <p className="text-white/60">Track all your transactions</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <ArrowDownLeft className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Received</p>
              <p className="text-3xl font-bold">${totalReceived.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <ArrowUpRight className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Sent</p>
              <p className="text-3xl font-bold">${totalSent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-title">Transaction History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'list' 
                  ? "bg-orange-400 text-white" 
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'graph' 
                  ? "bg-orange-400 text-white" 
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Graphs
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        payment.type === 'received' ? "bg-green-500/10" : "bg-red-500/10"
                      )}
                    >
                      {payment.type === 'received' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{payment.counterparty}</p>
                      <p className="text-sm text-white/50">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      payment.type === 'received' ? "text-green-400" : "text-red-400"
                    )}>
                      {payment.type === 'received' ? '+' : '-'}${Math.abs(payment.amount).toFixed(2)}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-white/60 text-sm">No transactions yet</p>
              <p className="text-white/40 text-xs mt-2">Your transaction history will appear here</p>
            </div>
          )
        ) : (
          chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Balance Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white/80">Balance Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="day" 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value) => [`$${value}`, 'Balance']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Received vs Sent Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white/80">Paid/Deposited vs Spent/Borrowed</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="day" 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.6)"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value) => [`$${value}`, '']}
                      />
                      <Bar dataKey="received" fill="#10b981" name="Paid/Deposited" />
                      <Bar dataKey="sent" fill="#ef4444" name="Spent/Borrowed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-white/60 text-sm">No data to display</p>
              <p className="text-white/40 text-xs mt-2">Charts will appear when you have transactions</p>
            </div>
          )
        )}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => setShowWithdrawModal(true)}
          className="bg-orange-400 hover:bg-orange-500 text-white border-0 h-14 px-8 text-base font-medium shadow-2xl"
        >
          Withdraw Funds
        </Button>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-8 rounded-3xl border border-white/20 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-6 font-title">Withdraw Funds</h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm text-white/70 mb-2 block">Connected Wallet</Label>
                <div className="glass border-white/20 px-4 py-3 rounded-lg text-white/80 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  {isConnected && account ? formatAddress(account) : 'Not connected'}
                </div>
              </div>

              <div>
                <Label htmlFor="withdrawAmount" className="text-sm text-white/70 mb-2 block">
                  Amount (USD)
                </Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="glass border-white/20 focus:border-white/40 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowWithdrawModal(false)}
                variant="outline"
                className="flex-1 border border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white border-0"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
