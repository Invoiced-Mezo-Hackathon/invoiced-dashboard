import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletProvider } from '@/contexts/WalletContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { NetworkSwitchModal } from '@/components/ui/NetworkSwitchModal';
import { Dashboard } from '@/pages/Dashboard';
import { Invoices } from '@/pages/Invoices';
import { Payments } from '@/pages/Payments';
import { Vault } from '@/pages/Vault';
import { Settings } from '@/pages/Settings';
import { useWalletUtils } from '@/hooks/useWalletUtils';
import { useNetworkNotifications } from '@/hooks/useNetworkNotifications';

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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [hasShownNetworkPrompt, setHasShownNetworkPrompt] = useState(false);

  const { isConnected, chainId } = useAccount();
  const { isMezoTestnet } = useWalletUtils();
  
  // Enable network notifications
  useNetworkNotifications();

  // Show network modal when user connects to a non-Mezo network
  useEffect(() => {
    if (isConnected && !isMezoTestnet(chainId) && !hasShownNetworkPrompt) {
      setShowNetworkModal(true);
      setHasShownNetworkPrompt(true);
    }
  }, [isConnected, chainId, isMezoTestnet, hasShownNetworkPrompt]);

  // Reset the prompt flag when user disconnects
  useEffect(() => {
    if (!isConnected) {
      setHasShownNetworkPrompt(false);
    }
  }, [isConnected]);

  const handleInvoiceCreated = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  const handleUpdateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} invoices={invoices} />;
      case 'invoices':
        return <Invoices invoices={invoices} onUpdateInvoice={handleUpdateInvoice} onInvoiceCreated={handleInvoiceCreated} />;                                                                          
      case 'payments':
        return <Payments invoices={invoices} />;
      case 'vault':
        return <Vault />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActiveTab} invoices={invoices} />;
    }
  };

  return (
    <WalletProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">                                                                             
        {/* Mobile: hide sidebar by default, show via menu button */}
        <div className="hidden md:block">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onShowNetworkModal={() => setShowNetworkModal(true)}
          />
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">                                                                             
          <div className="flex-1">
            {renderContent()}
          </div>
          <Header 
            onShowNetworkModal={() => setShowNetworkModal(true)}
          />
        </div>
      </div>
      
      {/* Network Switch Modal */}
      <NetworkSwitchModal 
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />
    </WalletProvider>
  );
}

export default App;