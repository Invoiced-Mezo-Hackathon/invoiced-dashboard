import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { NetworkSwitchModal } from '@/components/ui/NetworkSwitchModal';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { Dashboard } from '@/pages/Dashboard';
import { Invoices } from '@/pages/Invoices';
import { Payments } from '@/pages/Payments';
import { Vault } from '@/pages/Vault';
import { Settings } from '@/pages/Settings';
import { Analytics } from '@/pages/Analytics';
import { useWalletUtils } from '@/hooks/useWalletUtils';
import { useNetworkNotifications } from '@/hooks/useNetworkNotifications';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { invoiceStorage } from '@/services/invoice-storage';
import { Invoice } from '@/types/invoice';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [hasShownNetworkPrompt, setHasShownNetworkPrompt] = useState(false);
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);

  const { isConnected, chainId } = useAccount();
  const { isMezoTestnet } = useWalletUtils();
  
  // Get invoices from blockchain
  const { invoices, stats } = useInvoiceContract();
  
  // Load local invoices and refresh periodically
  useEffect(() => {
    const loadLocalInvoices = () => {
      const drafts = invoiceStorage.listDrafts();
      setLocalInvoices(drafts);
    };
    
    loadLocalInvoices();
    
    // Refresh every 5 seconds to keep data in sync
    const interval = setInterval(loadLocalInvoices, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Combine blockchain invoices with local invoices safely (avoid duplicates)
  const allInvoices = (() => {
    // Build a set of blockchain client codes for de-duplication
    const chainClientCodes = new Set<string>(
      invoices.map(i => i.clientCode).filter(Boolean) as string[]
    );

    // Only include drafts that are not already on-chain (match by clientCode)
    // and are still pending sync
    const filteredDrafts = localInvoices.filter(d => {
      const notOnChain = d.clientCode ? !chainClientCodes.has(d.clientCode) : true;
      const isPending = (d as any).syncPending !== false; // default to true if undefined
      return notOnChain && isPending;
    });

    // Merge lists and sort by createdAt (newest first)
    const merged = [...invoices, ...filteredDrafts];
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();
  
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} invoices={allInvoices} stats={stats} />;
      case 'invoices':
        return <Invoices invoices={allInvoices} />;
      case 'payments':
        return <Payments invoices={allInvoices} />;
      case 'vault':
        return <Vault />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics invoices={allInvoices} />;
      default:
        return <Dashboard onNavigate={setActiveTab} invoices={allInvoices} stats={stats} />;
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onShowNetworkModal={() => setShowNetworkModal(true)}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            onShowNetworkModal={() => setShowNetworkModal(true)}
          />
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Network Switch Modal */}
      <NetworkSwitchModal 
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />
      
      {/* Toast Viewport */}
      <ToastViewport />
    </ToastProvider>
  );
}

export default App;