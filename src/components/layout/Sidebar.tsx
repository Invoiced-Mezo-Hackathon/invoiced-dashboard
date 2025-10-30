import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShowNetworkModal?: () => void;
}

const navItems = [
  { id: 'dashboard', iconClass: 'fa-solid fa-house', label: 'Dashboard' },
  { id: 'invoices', iconClass: 'fa-solid fa-file-invoice', label: 'Invoices' },
  { id: 'payments', iconClass: 'fa-solid fa-sack-dollar', label: 'Payments' },
  { id: 'vault', iconClass: 'fa-solid fa-lock', label: 'Vault' },
  { id: 'settings', iconClass: 'fa-solid fa-gear', label: 'Settings' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#2C2C2E] backdrop-blur-md p-2 rounded-lg border border-[#2C2C2E]/20"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0",
        "w-60 sm:w-72 lg:w-80",
        "h-screen flex flex-col shrink-0",
        "transform transition-transform duration-300 z-40",
        "bg-[#1C1C1E] border-r border-r-green-400/20",
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
      {/* Logo */}
      <div className="px-6 py-6 lg:px-8 lg:py-8 border-b border-[#2C2C2E]/30 border-b-green-400/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#2C2C2E] rounded-lg">
            <img 
              src="/logo.png" 
              alt="Invoiced Logo" 
              className="w-6 h-6"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-invoiced uppercase tracking-tight text-white">INVOICED</h1>
            <p className="text-xs text-[#A0A0A0] mt-0.5">powered by Mezo</p>
          </div>
        </div>
      </div>

      {/* Navigation - Glass container */}
      <nav className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="bg-[#2C2C2E]/80 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 space-y-2 border border-green-400/30 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-200 group',
              activeTab === item.id
                ? 'bg-green-500/10 text-white shadow-sm border border-green-400/50'
                : 'bg-transparent text-[#A0A0A0] hover:bg-green-500/5 hover:text-white border border-transparent'
            )}
          >
            <i className={cn(
              item.iconClass,
              'text-lg sm:text-xl transition-colors shrink-0 text-white'
            )}></i>
            <span
              className={cn(
                'text-xs sm:text-sm font-medium font-navbar transition-colors',
                activeTab === item.id ? 'text-white font-semibold' : 'text-[#A0A0A0] group-hover:text-white'
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
        </div>
      </nav>

      </aside>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#1C1C1E]/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
