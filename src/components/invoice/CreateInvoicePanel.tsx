import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { InvoiceQRModal } from './InvoiceQRModal';
import { boarRPC } from '@/services/boar-rpc';
import type { Invoice } from '@/types/invoice';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';

interface CreateInvoicePanelProps {
  onInvoiceCreated?: () => void;
  // Make the prop optional with a default of undefined
}

export function CreateInvoicePanel({ onInvoiceCreated }: CreateInvoicePanelProps = {}) {
  const { isConnected, address } = useAccount();
  const { createInvoice: createBlockchainInvoice, isCreating } = useInvoiceContract();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [details, setDetails] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [btcInput, setBtcInput] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'BTC'>('USD');
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

  // Auto-fill Mezo testnet address from connected wallet
  useEffect(() => {
    if (address) {
      setBitcoinAddress(address);
    }
  }, [address]);

  // Auto-generate client code when name changes
  useEffect(() => {
    if (clientName.length > 0) {
      const code = `CLT-${clientName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setClientCode(code);
    } else {
      setClientCode('');
    }
  }, [clientName]);

  // Calculate Bitcoin equivalent from USD input using real-time Bitcoin price
  const getBitcoinAmount = () => {
    if (!usdAmount || !bitcoinPrice) return 0;
    const parsed = parseFloat(usdAmount);
    if (isNaN(parsed)) return 0;
    return parsed / bitcoinPrice;
  };
  
  const bitcoinAmount = getBitcoinAmount();
  
  // Calculate display amounts based on input currency
  const getDisplayUsdAmount = () => {
    if (inputCurrency === 'BTC') {
      const parsed = parseFloat(btcInput || '0');
      return isNaN(parsed) ? 0 : parsed * bitcoinPrice;
    }
    const parsed = parseFloat(usdAmount || '0');
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const displayUsdAmount = getDisplayUsdAmount();

  // Validate Mezo testnet address (Ethereum-compatible addresses)
  const isValidMezoAddress = (address: string): boolean => {
    // Ethereum address validation (0x followed by 40 hex characters)
    const ethereumPattern = /^0x[a-fA-F0-9]{40}$/;
    return ethereumPattern.test(address);
  };

  const handleSendInvoice = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!clientName.trim() || !details.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if ((inputCurrency === 'USD' && !usdAmount.trim()) || (inputCurrency === 'BTC' && !btcInput.trim())) {
      toast.error('Please enter an amount');
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

    // Calculate the Bitcoin amount from the selected currency
    const finalBitcoinAmount = inputCurrency === 'USD' 
      ? parseFloat(usdAmount) / bitcoinPrice 
      : parseFloat(btcInput);
    
    if (isNaN(finalBitcoinAmount) || finalBitcoinAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      // Snapshot current balance at the payment address for verification later
      let balanceAtCreation = '0';
      try {
        const snapshot = await boarRPC.getAddressBalance(bitcoinAddress);
        balanceAtCreation = String(snapshot.balance || '0');
      } catch (e) {
        console.warn('Failed to snapshot balance at creation, proceeding with 0:', e);
      }

      // Call smart contract - store the original currency and BTC amount
      await createBlockchainInvoice({
        clientName,
        details,
        amount: finalBitcoinAmount.toString(), // Always BTC amount for on-chain storage
        currency: inputCurrency, // Store the original currency (USD or BTC)
        bitcoinAddress,
        payToAddress: bitcoinAddress,
        balanceAtCreation,
      });

      // Reset form
      setClientName('');
      setDetails('');
      setUsdAmount('');
      setBtcInput('');
      setClientCode('');
      setBitcoinAddress('');
      setInputCurrency('USD');
      setIsDropdownOpen(false);
      
      // Notify parent
      onInvoiceCreated?.();
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-xs sm:text-sm min-h-[44px] touch-manipulation"
      >
        <Plus className="w-4 h-4" />
        <span>Create Invoice</span>
      </button>

      {/* Modal Overlay */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setIsDropdownOpen(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-[#2C2C2E]/90 backdrop-blur-xl border border-green-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white font-navbar">
                <span className="text-[#F7931A] text-sm">₿</span>
                Create New Invoice
              </h3>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-navbar">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-navbar"
                  placeholder="Enter client name"
                />
              </div>

              {/* Client Code (Auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-navbar">
                  Client Code
                </label>
                <input
                  type="text"
                  value={clientCode}
                  readOnly
                  className="w-full px-4 py-3 bg-[#2C2C2E]/20 border border-green-400/10 rounded-xl text-white/70 cursor-not-allowed font-navbar"
                  placeholder="Auto-generated"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-navbar">
                  Invoice Details *
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none font-navbar"
                  rows={3}
                  placeholder="Describe the services or products"
                />
              </div>

              {/* Amount Input with Currency Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/80 font-navbar">
                    Amount *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInputCurrency('USD')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all font-navbar ${
                        inputCurrency === 'USD'
                          ? 'bg-green-500 text-white border border-green-400/30'
                          : 'bg-[#2C2C2E]/40 text-white/60 hover:bg-green-500/20 border border-green-400/10'
                      }`}
                    >
                      USD
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputCurrency('BTC')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all font-navbar ${
                        inputCurrency === 'BTC'
                          ? 'bg-green-500 text-white border border-green-400/30'
                          : 'bg-[#2C2C2E]/40 text-white/60 hover:bg-green-500/20 border border-green-400/10'
                      }`}
                    >
                      BTC
                    </button>
                  </div>
                </div>
                
                {inputCurrency === 'USD' ? (
                  <input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-navbar"
                    placeholder="100.00"
                    step="0.01"
                    min="0"
                  />
                ) : (
                  <input
                    type="number"
                    value={btcInput}
                    onChange={(e) => setBtcInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-navbar"
                    placeholder="0.001"
                    step="0.00000001"
                    min="0"
                  />
                )}
                
                {((inputCurrency === 'USD' && usdAmount) || (inputCurrency === 'BTC' && btcInput)) && (
                  <div className="mt-2 p-3 bg-[#2C2C2E]/20 border border-green-400/10 rounded-xl">
                    <p className="text-sm text-white/80 font-navbar">
                      {inputCurrency === 'USD' ? (
                        <>
                          Bitcoin Amount: <span className="font-semibold text-green-400">{isNaN(bitcoinAmount) ? '0.00000000' : bitcoinAmount.toFixed(8)} BTC</span>
                        </>
                      ) : (
                        <>
                          USD Equivalent: <span className="font-semibold text-green-400">${isNaN(displayUsdAmount) ? '0.00' : displayUsdAmount.toFixed(2)}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-white/60 mt-1 font-navbar">
                      {isLoadingPrice ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                          Loading Bitcoin price...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">₿</span>
                          <span>Current Bitcoin price: ${bitcoinPrice.toLocaleString()}</span>
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-navbar">
                  Mezo Testnet Address *
                </label>
                <input
                  type="text"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-navbar"
                  placeholder="0x1234567890123456789012345678901234567890"
                  readOnly={!!address}
                />
                <p className="text-xs text-white/60 mt-1 font-navbar">
                  Enter your Mezo testnet address to receive Bitcoin payments
                </p>
              </div>


              {/* Send Button */}
              <button
                onClick={handleSendInvoice}
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:cursor-not-allowed font-navbar min-h-[44px] touch-manipulation text-sm sm:text-base"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Invoice...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
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