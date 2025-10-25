import { TrendingUp, Clock, Vault, Activity, DollarSign, Users, FileText, CreditCard } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$12,450',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Active Invoices',
      value: '24',
      change: '+3',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Clients',
      value: '156',
      change: '+8',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Pending Payments',
      value: '$3,240',
      change: '-2.1%',
      icon: CreditCard,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const quickActions = [
    {
      label: 'Create Invoice',
      description: 'Generate professional invoices with automatic codes and MUSD conversion',
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
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
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
        </div>
      </div>
    </div>
  );
}
