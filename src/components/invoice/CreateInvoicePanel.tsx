import { useState, useEffect, useRef } from 'react';
import { Send, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { InvoiceQRModal } from './InvoiceQRModal';

interface Invoice {
  id: string;
  clientName: string;
  clientCode: string;
  details: string;
  amount: number; // Bitcoin amount
  currency: string; // Will be 'BTC'
  musdAmount: number; // USD equivalent
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  wallet: string;
  bitcoinAddress?: string; // Mezo testnet address
}

interface CreateInvoicePanelProps {
  onInvoiceCreated: (invoice: Invoice) => void;
}

export function CreateInvoicePanel({ onInvoiceCreated }: CreateInvoicePanelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [details, setDetails] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [bitcoinAmount, setBitcoinAmount] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch real-time Bitcoin price
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        setIsLoadingPrice(true);
        // Using CoinGecko API (free, no API key required)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBitcoinPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        // Fallback to a reasonable price if API fails
        setBitcoinPrice(65000);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchBitcoinPrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchBitcoinPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Calculate USD equivalent using real-time Bitcoin price
  const usdAmount = bitcoinAmount ? parseFloat(bitcoinAmount) * bitcoinPrice : 0;

  // Validate Mezo testnet address (Ethereum-compatible addresses)
  const isValidMezoAddress = (address: string): boolean => {
    // Ethereum address validation (0x followed by 40 hex characters)
    const ethereumPattern = /^0x[a-fA-F0-9]{40}$/;
    return ethereumPattern.test(address);
  };

  const handleSendInvoice = async () => {
    if (!clientName.trim() || !details.trim() || !bitcoinAmount.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!bitcoinAddress.trim()) {
      toast.error('Please enter a Mezo testnet address');
      return;
    }

    if (!isValidMezoAddress(bitcoinAddress)) {
      toast.error('Please enter a valid Mezo testnet address (0x...)');
      return;
    }

    const amountNum = parseFloat(bitcoinAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid Bitcoin amount');
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newInvoice: Invoice = {
        id: Date.now().toString(),
        clientName: clientName,
        clientCode: clientCode,
        details: details,
        amount: amountNum,
        currency: 'BTC',
        musdAmount: usdAmount, // USD equivalent
        status: 'pending',
        createdAt: new Date().toISOString(),
        wallet: '0x1234567890123456789012345678901234567890', // Placeholder
        bitcoinAddress: bitcoinAddress
      };

      // Reset form
      setClientName('');
      setDetails('');
      setBitcoinAmount('');
      setClientCode('');
      setBitcoinAddress('');
      setIsDropdownOpen(false);
      
      // Show success message
      toast.success('Invoice created successfully! Client has been notified.', {
        duration: 4000,
      });
      
      onInvoiceCreated(newInvoice);
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Create Invoice</span>
      </button>

      {/* Modal Overlay */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setIsDropdownOpen(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Create New Invoice</h3>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Enter client name"
                />
              </div>

              {/* Client Code (Auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Code
                </label>
                <input
                  type="text"
                  value={clientCode}
                  readOnly
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/70 cursor-not-allowed"
                  placeholder="Auto-generated"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Invoice Details *
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe the services or products"
                />
              </div>

              {/* Bitcoin Amount */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Bitcoin Amount *
                </label>
                <input
                  type="number"
                  value={bitcoinAmount}
                  onChange={(e) => setBitcoinAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="0.001"
                  step="0.00000001"
                  min="0"
                />
                {bitcoinAmount && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl">
                    <p className="text-sm text-white/80">
                      USD Equivalent: <span className="font-semibold text-orange-400">${usdAmount.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {isLoadingPrice ? (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                          Loading Bitcoin price...
                        </span>
                      ) : (
                        `Based on Bitcoin price: $${bitcoinPrice.toLocaleString()}`
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Mezo Testnet Address */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Mezo Testnet Address *
                </label>
                <input
                  type="text"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="0x1234567890123456789012345678901234567890"
                />
                <p className="text-xs text-white/60 mt-1">
                  Enter your Mezo testnet address to receive Bitcoin payments
                </p>
              </div>


              {/* Send Button */}
              <button
                onClick={handleSendInvoice}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Invoice...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Create Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && createdInvoice && (
        <InvoiceQRModal
          invoice={createdInvoice}
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setCreatedInvoice(null);
          }}
        />
      )}
    </div>
  );
}