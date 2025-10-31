import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Clock, Vault, Activity, DollarSign, Users, FileText, CreditCard } from 'lucide-react';
import type { Invoice, InvoiceStats as InvoiceStatsType } from '@/types/invoice';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { MEZO_CONTRACTS, INVOICE_CONTRACT_ABI, BORROW_MANAGER_ABI } from '@/lib/mezo';
import { useMezoVault } from '@/hooks/useMezoVault';
import { paymentMonitor, PaymentEvent } from '@/services/payment-monitor';
import { transactionStorage } from '@/services/transaction-storage';

type InvoiceStats = InvoiceStatsType;

interface DashboardProps {
  onNavigate: (tab: string) => void;
  invoices: Invoice[];
  stats: InvoiceStats;
}

export function Dashboard({ onNavigate, invoices, stats }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { refetchAll: refetchVault, vaultData, musdBalance, collateralBalance, borrowedAmount } = useMezoVault();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  // Watch invoice events for real-time updates
  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceCreated',
    onLogs: () => {
      console.log('📊 Dashboard: InvoiceCreated detected, triggering refresh');
      setRefreshTrigger((v) => v + 1);
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoicePaid',
    onLogs: () => {
      console.log('📊 Dashboard: InvoicePaid detected, triggering refresh');
      setRefreshTrigger((v) => v + 1);
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceApproved',
    onLogs: () => {
      console.log('📊 Dashboard: InvoiceApproved detected, triggering refresh');
      setRefreshTrigger((v) => v + 1);
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.INVOICE_CONTRACT as `0x${string}`,
    abi: INVOICE_CONTRACT_ABI,
    eventName: 'InvoiceCancelled',
    onLogs: () => {
      console.log('📊 Dashboard: InvoiceCancelled detected, triggering refresh');
      setRefreshTrigger((v) => v + 1);
    }
  });

  // Watch vault events for real-time updates
  useWatchContractEvent({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    eventName: 'CollateralDeposited',
    onLogs: () => {
      console.log('📊 Dashboard: CollateralDeposited detected, triggering vault refresh');
      refetchVault();
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    eventName: 'MUSDBorrowed',
    onLogs: () => {
      console.log('📊 Dashboard: MUSDBorrowed detected, triggering vault refresh');
      refetchVault();
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    eventName: 'MUSDRepaid',
    onLogs: () => {
      console.log('📊 Dashboard: MUSDRepaid detected, triggering vault refresh');
      refetchVault();
    }
  });

  useWatchContractEvent({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    eventName: 'CollateralWithdrawn',
    onLogs: () => {
      console.log('📊 Dashboard: CollateralWithdrawn detected, triggering vault refresh');
      refetchVault();
    }
  });

  // Watch payment monitor events
  useEffect(() => {
    const handlePaymentEvent = (event: PaymentEvent) => {
      if (event.type === 'payment_detected' || event.type === 'payment_confirmed') {
        console.log('📊 Dashboard: Payment event detected, triggering refresh');
        setRefreshTrigger((v) => v + 1);
      }
    };

    paymentMonitor.setCallbacks({
      onPaymentDetected: handlePaymentEvent,
      onPaymentConfirmed: handlePaymentEvent,
    });

    return () => {
      paymentMonitor.setCallbacks({});
    };
  }, []);

  // Fetch Bitcoin price for USD conversion
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBitcoinPrice(data.bitcoin.usd || 65000);
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        setBitcoinPrice(65000); // Fallback price
      } finally {
        setIsLoadingPrice(false);
      }
    };
    fetchBitcoinPrice();
  }, []);

  // Listen for transaction updates (same as Payments page)
  const [transactionVersion, setTransactionVersion] = useState(0);
  useEffect(() => {
    const onStorageUpdate = () => setTransactionVersion((v) => v + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('transactions_updated', onStorageUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('transactions_updated', onStorageUpdate);
      }
    };
  }, []);

  // Force re-render when refresh trigger changes (to update stats)
  useEffect(() => {
    // This effect ensures the component re-renders when events fire
    // The parent App component will pass updated invoices/stats via props
  }, [refreshTrigger, transactionVersion]);

  // Calculate real revenue from paid invoices in BTC, then convert to USD
  // Use same logic as Payments page to ensure consistency
  const totalRevenueBTC = useMemo(() => {
    // Calculate from invoices (sum in BTC) - match Payments page logic exactly
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    console.log('📊 Dashboard: Calculating revenue from', paidInvoices.length, 'paid invoices');
    
    const calculatedBTC = paidInvoices.reduce((sum, invoice) => {
      // Priority 1: Use observedInboundAmount (actual received in wei) - same as Payments
      let amountBtc = invoice.amount; // fallback to requested amount
      try {
        const observed = (invoice as any).observedInboundAmount as string | undefined;
        if (observed && observed !== '0' && observed !== '') {
          amountBtc = Number(BigInt(observed)) / Math.pow(10, 18);
          console.log('📊 Dashboard: Invoice', invoice.id, 'observedInboundAmount:', observed, '→', amountBtc, 'BTC');
          return sum + amountBtc;
        }
        
        // Priority 2: Try transaction amount (same as Payments page)
        const transactions = transactionStorage.getTransactionsForInvoice(invoice.id);
        const latestTransaction = transactions[0];
        if (latestTransaction?.amount) {
          amountBtc = Number(BigInt(latestTransaction.amount)) / Math.pow(10, 18);
          console.log('📊 Dashboard: Invoice', invoice.id, 'transaction amount:', latestTransaction.amount, '→', amountBtc, 'BTC');
          return sum + amountBtc;
        }
      } catch (e) {
        console.warn('📊 Dashboard: Failed to parse observedInboundAmount/transaction, using invoice.amount:', e);
      }
      
      // Priority 3: Fallback to invoice.amount (already in BTC)
      console.log('📊 Dashboard: Invoice', invoice.id, 'using invoice.amount:', amountBtc, 'BTC');
      return sum + amountBtc;
    }, 0);
    
    console.log('📊 Dashboard: Total revenue calculated:', calculatedBTC, 'BTC');
    return calculatedBTC;
  }, [invoices, transactionVersion]);

  // Convert BTC to USD using current Bitcoin price
  const totalRevenue = useMemo(() => {
    return totalRevenueBTC * (bitcoinPrice || 0);
  }, [totalRevenueBTC, bitcoinPrice]);

  const activeInvoices = useMemo(() => {
    return stats?.activeInvoices ?? invoices.filter(invoice => invoice.status === 'pending').length;
  }, [invoices, stats?.activeInvoices]);

  const totalInvoices = useMemo(() => {
    return stats?.totalInvoices ?? invoices.length;
  }, [invoices, stats?.totalInvoices]);

  const pendingAmount = useMemo(() => {
    if (stats?.pendingAmount && stats.pendingAmount > 0) {
      return stats.pendingAmount;
    }
    return invoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [invoices, stats?.pendingAmount]);

  // Calculate paid invoices count and collection metrics
  const paidInvoicesCount = useMemo(() => {
    return invoices.filter(invoice => invoice.status === 'paid').length;
  }, [invoices]);

  // Calculate collection rate (percentage of invoices paid)
  const collectionRate = useMemo(() => {
    if (totalInvoices === 0) return 0;
    return Math.round((paidInvoicesCount / totalInvoices) * 100);
  }, [paidInvoicesCount, totalInvoices]);

  const statsData = [
    {
      label: 'Total Revenue',
      value: isLoadingPrice ? 'Loading...' : `$${totalRevenue.toFixed(2)}`,
      btcValue: totalRevenueBTC.toFixed(8),
      change: paidInvoicesCount > 0 ? `Earned from ${paidInvoicesCount} ${paidInvoicesCount === 1 ? 'invoice' : 'invoices'}` : 'No payments yet',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Active Invoices',
      value: activeInvoices.toString(),
      change: activeInvoices > 0 ? 'Awaiting payment' : 'None',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Invoices',
      value: totalInvoices.toString(),
      change: totalInvoices > 0 ? 'All time' : 'No invoices',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Collection Rate',
      value: `${collectionRate}%`,
      change: totalInvoices > 0 ? `${paidInvoicesCount}/${totalInvoices} paid` : 'No invoices',
      icon: TrendingUp,
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
      tab: 'analytics',
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statsData.map((stat) => (
              <div key={stat.label} className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-green-400/20 transition-all active:scale-[0.98] touch-manipulation">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-green-400/30 flex items-center justify-center shrink-0">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className={`text-xs font-navbar font-medium ${
                    stat.label === 'Total Revenue' && paidInvoicesCount > 0 ? 'text-green-400' :
                    stat.label === 'Active Invoices' && activeInvoices > 0 ? 'text-blue-400' :
                    stat.label === 'Collection Rate' && collectionRate > 0 ? 'text-orange-400' :
                    'text-gray-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold font-navbar mb-1">{stat.value}</p>
                  {(stat as any).btcValue && (
                    <p className="text-[10px] font-navbar text-white/50 mb-1">{(stat as any).btcValue} BTC</p>
                  )}
                  <p className="text-xs font-navbar text-white/60">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 font-navbar text-white/90">Quick Actions</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {quickActions.map((action) => (
              <div key={action.label} className="relative group">
                <button
                  onClick={() => onNavigate(action.tab)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] ${action.bgColor} border ${action.borderColor} rounded-full ${action.hoverBg} ${action.hoverBorder} transition-all duration-200 group active:scale-95 touch-manipulation`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${action.iconBg} border ${action.iconBorder} flex items-center justify-center ${action.iconHover} transition-all shrink-0`}>
                    <action.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white`} />
                  </div>
                  <span className="text-xs sm:text-sm font-navbar text-white/80 group-hover:text-white transition-colors">
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
