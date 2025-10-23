import { TrendingUp, Clock, Vault, Activity } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const metrics = [
    {
      label: 'Create Invoices',
      description: 'Start creating your invoices with automatic codes and MUSD conversion',
      icon: TrendingUp,
      tab: 'invoices',
      emoji: '📝',
    },
    {
      label: 'Track Payments',
      description: 'Keep an eye on your transactions and withdraw to your wallet',
      icon: Clock,
      tab: 'payments',
      emoji: '💸',
    },
    {
      label: 'Manage Vault',
      description: 'Deposit your BTC, borrow MUSD, and track your collateral',
      icon: Vault,
      tab: 'vault',
      emoji: '🔐',
    },
    {
      label: 'Stay Organized',
      description: 'Manage all your invoices, payments, and settings in one place',
      icon: Activity,
      tab: 'settings',
      emoji: '⚡',
    },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))'
        }} />
      </div>
      
      <div className="relative z-10">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-title">Dashboard</h1>
        </div>

      {/* Overview Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 font-title">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <button
              key={metric.label}
              onClick={() => onNavigate(metric.tab)}
              className="glass glass-hover-card p-6 rounded-2xl text-center group cursor-pointer"
            >
              <div className="text-4xl mb-3">{metric.emoji}</div>
              <h3 className="text-sm font-semibold mb-2 font-title">{metric.label}</h3>
              <p className="text-xs text-foreground/60">{metric.description}</p>
            </button>
          ))}
        </div>
      </div>

        {/* Recent Activity */}
        <div className="glass p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-semibold mb-6 font-title">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-foreground/60 text-sm">No activity yet</p>
            <p className="text-foreground/40 text-xs mt-2">Go ahead and create your first invoice to see it here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
