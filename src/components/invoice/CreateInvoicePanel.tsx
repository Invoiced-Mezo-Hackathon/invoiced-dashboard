import { useState, useEffect, useRef } from 'react';
import { Send, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { InvoiceQRModal } from './InvoiceQRModal';

interface Invoice {
  id: string;
  clientName: string;
  clientCode: string;
  details: string;
  amount: number;
  currency: 'USD' | 'KES';
  musdAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  wallet: string;
}

interface CreateInvoicePanelProps {
  onInvoiceCreated: (invoice: Invoice) => void;
}

export function CreateInvoicePanel({ onInvoiceCreated }: CreateInvoicePanelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [details, setDetails] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'KES'>('USD');
  const [isSending, setIsSending] = useState(false);
  const [walletAddress] = useState('mezo1x...7k9p');
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Auto-generate client code when name changes
  useEffect(() => {
    if (clientName.length > 0) {
      const code = `CLT-${clientName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setClientCode(code);
    } else {
      setClientCode('');
    }
  }, [clientName]);

  // Calculate MUSD equivalent (mock conversion rate)
  const musdAmount = amount ? parseFloat(amount) * 0.98 : 0;

  const handleSendInvoice = async () => {
    if (!clientName || !details || !amount) return;

    setIsSending(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newInvoice = {
      id: `INV-${Date.now()}`,
      clientName,
      clientCode,
      details,
      amount: parseFloat(amount),
      currency,
      musdAmount,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      wallet: walletAddress,
    };

    onInvoiceCreated(newInvoice);
    setCreatedInvoice(newInvoice);
    setShowQRModal(true);
    toast.success('Invoice created successfully!');

    // Reset form and close dropdown
    setClientName('');
    setDetails('');
    setAmount('');
    setIsSending(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed right-4 top-4 z-50" ref={dropdownRef}>
      {/* Create Invoice Icon */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm">Create Invoice</span>
      </button>

      {/* Backdrop Overlay */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div className="absolute top-12 right-0 w-96 bg-background/95 backdrop-blur-sm border border-foreground/20 rounded-xl shadow-xl p-6 space-y-4 z-50">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-title">Create Invoice</h3>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-foreground/5 focus:bg-foreground/10 transition-colors outline-none text-foreground placeholder:text-foreground/40 text-sm border border-foreground/10"
                placeholder="Enter client name"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-foreground/5 focus:bg-foreground/10 transition-colors outline-none text-foreground placeholder:text-foreground/40 min-h-[60px] resize-none text-sm border border-foreground/10"
                placeholder="Invoice description"
              />
            </div>

            {/* Client Code (Auto-generated) */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">
                Client Code
              </label>
              <div className="px-3 py-2 rounded-lg bg-foreground/3 text-foreground/50 text-sm border border-foreground/10">
                {clientCode || 'Auto-generated after name entry'}
              </div>
            </div>

            {/* Amount with Currency Toggle */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">
                Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-foreground/5 focus:bg-foreground/10 transition-colors outline-none text-foreground placeholder:text-foreground/40 text-sm border border-foreground/10"
                  placeholder="0.00"
                />
                <button
                  onClick={() => setCurrency(currency === 'USD' ? 'KES' : 'USD')}
                  className="px-4 py-2 rounded-lg font-medium text-sm border border-foreground/10 hover:bg-foreground/5 transition-colors"
                >
                  {currency}
                </button>
              </div>
              {amount && (
                <p className="text-xs text-foreground/50 mt-1">
                  ≈ {musdAmount.toFixed(4)} MUSD
                </p>
              )}
            </div>

            {/* Recipient Wallet */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1">
                Recipient Wallet
              </label>
              <div className="px-3 py-2 rounded-lg bg-foreground/3 text-foreground/50 text-xs flex items-center gap-2 border border-foreground/10">
                <div className="w-2 h-2 rounded-full bg-green-500/70 shrink-0" />
                <span className="flex-1 truncate">{walletAddress}</span>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendInvoice}
              disabled={isSending || !clientName || !details || !amount}
              className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm bg-orange-400 hover:bg-orange-500 text-white transition-colors"
            >
              {isSending ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invoice
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <InvoiceQRModal 
        invoice={createdInvoice}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}
