import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
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
import { useInvoiceContract } from '@/hooks/useInvoiceContract';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [hasShownNetworkPrompt, setHasShownNetworkPrompt] = useState(false);

  const { isConnected, chainId } = useAccount();
  const { isMezoTestnet } = useWalletUtils();
  
  // Get invoices from blockchain
  const { invoices, stats } = useInvoiceContract();
  
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
        return <Dashboard onNavigate={setActiveTab} invoices={invoices} stats={stats} />;
      case 'invoices':
        return <Invoices invoices={invoices} />;
      case 'payments':
        return <Payments invoices={invoices} />;
      case 'vault':
        return <Vault />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActiveTab} invoices={invoices} stats={stats} />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#1C1C1E] text-foreground overflow-hidden">
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
    </>
  );
}

export default App;