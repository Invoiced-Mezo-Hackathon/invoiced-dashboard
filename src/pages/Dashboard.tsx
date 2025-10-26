import { TrendingUp, Clock, Vault, Activity, DollarSign, Users, FileText, CreditCard } from 'lucide-react';

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

interface DashboardProps {
  onNavigate: (tab: string) => void;
  invoices: Invoice[];
}

export function Dashboard({ onNavigate, invoices }: DashboardProps) {
  // Calculate stats from invoices
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const activeInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const totalInvoices = invoices.length;
  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Get recent invoices (last 5)
  const recentInvoices = invoices.slice(0, 5);

  const statsData = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: totalRevenue > 0 ? '+12.5%' : '0%',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Active Invoices',
      value: activeInvoices.toString(),
      change: activeInvoices > 0 ? `+${activeInvoices}` : '0',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Invoices',
      value: totalInvoices.toString(),
      change: totalInvoices > 0 ? `+${totalInvoices}` : '0',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Pending Payments',
      value: `$${pendingAmount.toFixed(2)}`,
      change: pendingAmount > 0 ? '-2.1%' : '0%',
      icon: CreditCard,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const quickActions = [
    {
      label: 'Create Invoice',
      description: 'Generate professional invoices with Bitcoin payment addresses',
      icon: TrendingUp,
      tab: 'invoices',
      emoji: '📝',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      label: 'Track Payments',
      description: 'Monitor all transactions and payment statuses',
      icon: Clock,
      tab: 'payments',
      emoji: '💸',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      label: 'Manage Vault',
      description: 'Deposit BTC, borrow MUSD, and track collateral ratios',
      icon: Vault,
      tab: 'vault',
      emoji: '🔐',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      label: 'View Analytics',
      description: 'Get insights into your business performance and trends',
      icon: Activity,
      tab: 'settings',
      emoji: '📊',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
        }} />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 font-title bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-foreground/60 text-lg">Welcome back! Here's what's happening with your business.</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 font-title">Business Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 font-title">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.tab)}
                className="glass-card p-6 rounded-2xl text-left group cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{action.emoji}</div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-title group-hover:text-white transition-colors">
                  {action.label}
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 font-title">Recent Activity</h2>
          {recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      invoice.status === 'paid' ? 'bg-green-500/10' : 
                      invoice.status === 'pending' ? 'bg-yellow-500/10' : 
                      'bg-red-500/10'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        invoice.status === 'paid' ? 'text-green-400' : 
                        invoice.status === 'pending' ? 'text-yellow-400' : 
                        'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.clientName}</p>
                      <p className="text-sm text-white/50">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount.toFixed(8)} BTC</p>
                    <p className="text-xs text-white/60">${invoice.musdAmount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <button
                  onClick={() => onNavigate('invoices')}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                >
                  View All Invoices →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                <div className="text-4xl">📊</div>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-title">No activity yet</h3>
              <p className="text-foreground/60 text-sm mb-4">Start by creating your first invoice to see activity here</p>
              <button
                onClick={() => onNavigate('invoices')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Create Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
