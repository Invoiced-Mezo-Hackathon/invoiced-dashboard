import { Home, FileText, CreditCard, Vault, Settings, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'invoices', icon: FileText, label: 'Invoices' },
  { id: 'payments', icon: CreditCard, label: 'Payments' },
  { id: 'vault', icon: Vault, label: 'Vault' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { isConnected, account, connectWallet, isLoading } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = () => {
    if (!isConnected) {
      connectWallet();
    }
  };

  return (
    <aside className="w-60 sm:w-72 lg:w-80 glass h-screen flex flex-col border-r border-border shrink-0">
      {/* Logo */}
      <div className="p-5 sm:p-6 lg:p-8 border-b border-border">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Invoiced Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-title">Invoiced</h1>
            <p className="text-xs sm:text-sm text-foreground/50 mt-1">powered by Mezo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 sm:p-5 lg:p-6 space-y-2 sm:space-y-3 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all group',
              activeTab === item.id
                ? 'glass-active'
                : 'glass-hover'
            )}
          >
            <item.icon
              className={cn(
                'w-4 h-4 sm:w-5 sm:h-5 transition-colors shrink-0',
                activeTab === item.id ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
              )}
            />
            <span
              className={cn(
                'text-xs sm:text-sm font-medium transition-colors',
                activeTab === item.id ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 sm:p-5 lg:p-6 border-t border-border">
        <button
          onClick={handleWalletClick}
          disabled={isLoading}
          className={cn(
            'w-full glass p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300',
            isConnected 
              ? 'bg-green-400 border-green-400 hover:bg-green-500' 
              : 'bg-yellow-400 border-yellow-400 hover:bg-gray-500',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 backdrop-blur-sm bg-white/20 border border-white/30 shadow-inner">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs sm:text-sm font-medium truncate text-white">
                {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'User'}
              </p>
              <p className="text-[10px] sm:text-xs text-white truncate">
                {isLoading 
                  ? 'Please wait...' 
                  : isConnected && account 
                    ? formatAddress(account) 
                    : 'Connect Wallet'
                }
              </p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
