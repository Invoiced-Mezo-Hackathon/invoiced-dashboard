import { useState } from 'react';
import { WalletProvider } from '@/contexts/WalletContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreateInvoicePanel } from '@/components/invoice/CreateInvoicePanel';
import { Dashboard } from '@/pages/Dashboard';
import { Invoices } from '@/pages/Invoices';
import { Payments } from '@/pages/Payments';
import { Vault } from '@/pages/Vault';
import { Settings } from '@/pages/Settings';

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
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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
        return <Dashboard onNavigate={setActiveTab} />;
      case 'invoices':
        return <Invoices invoices={invoices} onUpdateInvoice={handleUpdateInvoice} />;
      case 'payments':
        return <Payments />;
      case 'vault':
        return <Vault />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <WalletProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Mobile: hide sidebar by default, show via menu button */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          <div className="flex-1">
            {renderContent()}
          </div>
          <CreateInvoicePanel 
            onInvoiceCreated={handleInvoiceCreated} 
          />
        </div>
      </div>
    </WalletProvider>
  );
}

export default App;
