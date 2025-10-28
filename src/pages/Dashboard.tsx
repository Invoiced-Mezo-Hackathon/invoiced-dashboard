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

interface InvoiceStats {
  totalRevenue: number;
  activeInvoices: number;
  pendingAmount: number;
  totalInvoices: number;
  paidInvoices: number;
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
  invoices: Invoice[];
  stats: InvoiceStats;
}

export function Dashboard({ onNavigate, invoices, stats }: DashboardProps) {
  // Use stats from hook if available, otherwise calculate from invoices
  const totalRevenue = stats?.totalRevenue ?? invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const activeInvoices = stats?.activeInvoices ?? invoices.filter(invoice => invoice.status === 'pending').length;
  const totalInvoices = stats?.totalInvoices ?? invoices.length;
  const pendingAmount = stats?.pendingAmount ?? invoices
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
      description: 'Generate invoices with Bitcoin payments',
      icon: TrendingUp,
      tab: 'invoices',
      emoji: '📝',
      gradient: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/30',
      hoverBg: 'hover:bg-blue-500/30',
      hoverBorder: 'hover:border-blue-400/50',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-400/30',
      iconHover: 'group-hover:bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Track Payments',
      description: 'Monitor transactions and payments',
      icon: Clock,
      tab: 'payments',
      emoji: '💸',
      gradient: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/30',
      hoverBg: 'hover:bg-green-500/30',
      hoverBorder: 'hover:border-green-400/50',
      iconBg: 'bg-green-500/10',
      iconBorder: 'border-green-400/30',
      iconHover: 'group-hover:bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      label: 'Manage Vault',
      description: 'Deposit BTC and borrow MUSD',
      icon: Vault,
      tab: 'vault',
      emoji: '🔐',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/30',
      hoverBg: 'hover:bg-orange-500/30',
      hoverBorder: 'hover:border-orange-400/50',
      iconBg: 'bg-orange-500/10',
      iconBorder: 'border-orange-400/30',
      iconHover: 'group-hover:bg-orange-500/20',
      iconColor: 'text-orange-400',
    },
    {
      label: 'View Analytics',
      description: 'Business insights and trends',
      icon: Activity,
      tab: 'settings',
      emoji: '📊',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30',
      hoverBg: 'hover:bg-purple-500/30',
      hoverBorder: 'hover:border-purple-400/50',
      iconBg: 'bg-purple-500/10',
      iconBorder: 'border-purple-400/30',
      iconHover: 'group-hover:bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }} />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">
            Dashboard
          </h1>
          <p className="text-sm font-navbar text-white/60">Welcome back! Here's what's happening with your business.</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 font-navbar text-white/90">Business Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <div key={stat.label} className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-4 hover:border-green-400/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg border border-green-400/30 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-navbar font-medium ${stat.change.startsWith('+') ? 'text-green-400' : stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold font-navbar mb-1">{stat.value}</p>
                  <p className="text-xs font-navbar text-white/60">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 font-navbar text-white/90">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <div key={action.label} className="relative group">
                <button
                  onClick={() => onNavigate(action.tab)}
                  className={`flex items-center gap-3 px-4 py-3 ${action.bgColor} border ${action.borderColor} rounded-full ${action.hoverBg} ${action.hoverBorder} transition-all duration-200 group`}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.iconBg} border ${action.iconBorder} flex items-center justify-center ${action.iconHover} transition-all`}>
                    <action.icon className={`w-4 h-4 text-white`} />
                  </div>
                  <span className="text-sm font-navbar text-white/80 group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </button>
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg border border-gray-600/30">
                  {action.description}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-800/95"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
