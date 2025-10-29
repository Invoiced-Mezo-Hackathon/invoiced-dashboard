import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Send, Plus, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceQRModal } from './InvoiceQRModal';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { invoiceStorage } from '@/services/invoice-storage';
import { boarRPC } from '@/services/boar-rpc';

interface CreateInvoicePanelProps {
  onInvoiceCreated?: () => void;
  // Make the prop optional with a default of undefined
}

export function CreateInvoicePanel({ onInvoiceCreated }: CreateInvoicePanelProps = {}) {
  const { address, isConnected } = useAccount();
  const { createInvoice, isCreating, createTx } = useInvoiceContract();
  const { toast } = useToast();
  
  // Track when we started creating to avoid infinite loops
  const [hasStartedCreation, setHasStartedCreation] = useState(false);
  // Track if transaction actually started on blockchain
  const [txStarted, setTxStarted] = useState(false);
  // Track creation start time for timer
  const [creationStartTime, setCreationStartTime] = useState<number | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [details, setDetails] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [btcInput, setBtcInput] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState(address || '');
  const [payToAddress, setPayToAddress] = useState(address || ''); // Separate field for payment address
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
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

  // Auto-generate client code when name changes
  useEffect(() => {
    if (clientName.length > 0) {
      const code = `CLT-${clientName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setClientCode(code);
    } else {
      setClientCode('');
    }
  }, [clientName]);

  // Auto-detect connected wallet address for payment
  useEffect(() => {
    if (address && !bitcoinAddress) {
      setBitcoinAddress(address);
      setPayToAddress(address);
    }
  }, [address, bitcoinAddress]);

  // Calculate Bitcoin equivalent from USD input using real-time Bitcoin price
  const getBitcoinAmount = () => {
    if (!usdAmount || !bitcoinPrice) return 0;
    const parsed = parseFloat(usdAmount);
    if (isNaN(parsed)) return 0;
    return parsed / bitcoinPrice;
  };
  
  const bitcoinAmount = getBitcoinAmount();
  
  // Calculate display amounts based on input currency
  const getDisplayBitcoinAmount = () => {
    if (inputCurrency === 'USD') return bitcoinAmount;
    const parsed = parseFloat(btcInput || '0');
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const getDisplayUsdAmount = () => {
    if (inputCurrency === 'BTC') {
      const parsed = parseFloat(btcInput || '0');
      return isNaN(parsed) ? 0 : parsed * bitcoinPrice;
    }
    const parsed = parseFloat(usdAmount || '0');
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const displayBitcoinAmount = getDisplayBitcoinAmount();
  const displayUsdAmount = getDisplayUsdAmount();

  // Validate Mezo testnet address (Ethereum-compatible addresses)
  const isValidMezoAddress = (address: string): boolean => {
    // Ethereum address validation (0x followed by 40 hex characters)
    const ethereumPattern = /^0x[a-fA-F0-9]{40}$/;
    return ethereumPattern.test(address);
  };

  const handleSendInvoice = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    if (!clientName.trim() || !details.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if ((inputCurrency === 'USD' && !usdAmount.trim()) || (inputCurrency === 'BTC' && !btcInput.trim())) {
      toast({
        title: "Missing Amount",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    if (!payToAddress.trim()) {
      toast({
        title: "Missing Payment Address",
        description: "Please enter a payment address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidMezoAddress(payToAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Mezo testnet address (0x...)",
        variant: "destructive",
      });
      return;
    }

    // Calculate the Bitcoin amount from the selected currency
    const finalBitcoinAmount = inputCurrency === 'USD' 
      ? parseFloat(usdAmount) / bitcoinPrice 
      : parseFloat(btcInput);
    
    if (isNaN(finalBitcoinAmount) || finalBitcoinAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Begin creation
      setHasStartedCreation(true);

      console.log('🚀 Starting invoice creation with data:', {
        clientName,
        details,
        amount: finalBitcoinAmount.toString(),
        currency: 'USD',
        bitcoinAddress,
        payToAddress,
      });

      // Get balance snapshot for the payment address (optional)
      let balanceAtCreation = '0';
      try {
        console.log('🔍 Fetching balance for address:', payToAddress);
        if (!payToAddress || payToAddress.length < 10) {
          throw new Error('Invalid payment address');
        }
        const balance = await boarRPC.getAddressBalance(payToAddress);
        balanceAtCreation = balance.balance;
        console.log('💰 Balance snapshot at creation:', balanceAtCreation);
      } catch (error) {
        console.warn('⚠️ Could not get balance snapshot:', error);
        // Continue without balance snapshot - not critical for invoice creation
        balanceAtCreation = '0';
      }

      // Use the hook's createInvoice function to avoid duplicates
      const invoiceData = {
        clientName,
        details,
        amount: finalBitcoinAmount.toString(),
        currency: 'USD',
        bitcoinAddress: payToAddress, // Use payToAddress as the payment address
        balanceAtCreation, // Include balance snapshot for payment verification
      };

      console.log('📝 Creating invoice via hook:', invoiceData);
      
      // This will handle both localStorage and blockchain submission
      await createInvoice(invoiceData);

      // Close modal and reset form
      setIsDropdownOpen(false);
      setClientName('');
      setDetails('');
      setUsdAmount('');
      setBtcInput('');
      setClientCode('');
      setInputCurrency('USD');
      setHasStartedCreation(false);
      setTxStarted(false);
      setCreationStartTime(null);
      
      // Notify parent to refresh data
      console.log('📞 Calling onInvoiceCreated callback');
      onInvoiceCreated?.();
      
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      toast({
        title: "Creation Failed",
        description: `Failed to create invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setHasStartedCreation(false);
    }
  };

  // Track when transaction actually starts (when isCreating becomes true)
  useEffect(() => {
    if (isCreating && hasStartedCreation && !creationStartTime) {
      setTxStarted(true);
      setCreationStartTime(Date.now());
    }
  }, [isCreating, hasStartedCreation, creationStartTime]);

  // Calculate time remaining for display
  const getCountdownText = () => {
    if (!creationStartTime) return '';
    const elapsed = Date.now() - creationStartTime;
    const remaining = Math.max(0, 180000 - elapsed); // 3 minutes timeout
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle successful transaction completion
  useEffect(() => {
    // Check if transaction completed successfully
    const isSuccess = (txStarted && !isCreating && hasStartedCreation) || 
                      (createTx.status === 'success' && hasStartedCreation && txStarted);
    
    if (isSuccess) {
      console.log('✅ Invoice created successfully!');
      toast.success('Invoice created successfully!');
      
      // Close modal and reset everything
      setIsDropdownOpen(false);
      setClientName('');
      setDetails('');
      setUsdAmount('');
      setBtcInput('');
      setClientCode('');
      setInputCurrency('USD');
      setHasStartedCreation(false);
      setTxStarted(false);
      setCreationStartTime(null);
      
      // Notify parent to refresh data
      onInvoiceCreated?.();
    }
  }, [isCreating, createTx.status, hasStartedCreation, txStarted, onInvoiceCreated]);
  
  // Handle errors
  useEffect(() => {
    if (hasStartedCreation && !isCreating && createTx.status === 'error') {
      // Transaction failed - keep modal open but reset the flag so they can retry
      setHasStartedCreation(false);
      setTxStarted(false);
      toast.error('Transaction failed. Please try again.');
    }
  }, [createTx.status, hasStartedCreation, isCreating]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Generate Invoice</span>
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
              <h3 className="text-lg font-semibold text-white">Generate Invoice</h3>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setHasStartedCreation(false);
                  setTxStarted(false);
                  setClientName('');
                  setDetails('');
                  setUsdAmount('');
                  setBtcInput('');
                  setClientCode('');
                  // Don't reset bitcoinAddress - keep it as connected wallet
                  setInputCurrency('USD');
                }}
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

              {/* Amount Input with Currency Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/80">
                    Amount *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInputCurrency('USD')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        inputCurrency === 'USD'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      USD
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputCurrency('BTC')}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${
                        inputCurrency === 'BTC'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="100.00"
                    step="0.01"
                    min="0"
                  />
                ) : (
                  <input
                    type="number"
                    value={btcInput}
                    onChange={(e) => setBtcInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="0.001"
                    step="0.00000001"
                    min="0"
                  />
                )}
                
                {((inputCurrency === 'USD' && usdAmount) || (inputCurrency === 'BTC' && btcInput)) && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl">
                    <p className="text-sm text-white/80">
                      {inputCurrency === 'USD' ? (
                        <>
                          Bitcoin Amount: <span className="font-semibold text-orange-400">{isNaN(bitcoinAmount) ? '0.00000000' : bitcoinAmount.toFixed(8)} BTC</span>
                        </>
                      ) : (
                        <>
                          USD Equivalent: <span className="font-semibold text-orange-400">${isNaN(displayUsdAmount) ? '0.00' : displayUsdAmount.toFixed(2)}</span>
                        </>
                      )}
                    </p>
                    <div className="text-xs text-white/60 mt-1">
                      {isLoadingPrice ? (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                          Loading Bitcoin price...
                        </span>
                      ) : (
                        `Current Bitcoin price: $${bitcoinPrice.toLocaleString()}`
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Address (Auto-detected) */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Payment Address (Auto-detected) *
                </label>
                <input
                  type="text"
                  value={bitcoinAddress}
                  readOnly
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/70 cursor-not-allowed"
                  placeholder="Connect wallet to auto-detect address"
                />
                <p className="text-xs text-white/60 mt-1">
                  Payments will be sent to your connected wallet address
                </p>
              </div>

              {/* Pay To Address (Editable) */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Pay To Address *
                </label>
                <input
                  type="text"
                  value={payToAddress}
                  onChange={(e) => setPayToAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Enter payment address (0x...)"
                />
                <p className="text-xs text-white/60 mt-1">
                  Address where payments should be sent (can be different from your wallet)
                </p>
              </div>


              {/* Transaction Status (hidden to avoid blocking UX) */}

              {/* Send Button */}
              <button
                onClick={handleSendInvoice}
                disabled={isCreating || createTx.status === 'pending'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming Transaction...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Generate Invoice</span>
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