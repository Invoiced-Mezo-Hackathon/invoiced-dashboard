import { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle, XCircle, QrCode, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InvoiceQRModal } from '@/components/invoice/InvoiceQRModal';
import { CreateInvoicePanel } from '@/components/invoice/CreateInvoicePanel';
// import { useInvoicePaymentMonitor } from '@/hooks/usePaymentMonitor';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { useCountdown } from '@/hooks/useCountdown';
import { Invoice as InvoiceType } from '@/types/invoice';
import type { StoredTransaction } from '@/services/transaction-storage';
import toast from 'react-hot-toast';
import { invoiceStorage } from '@/services/invoice-storage';

interface Invoice {
  id: string;
  clientName: string;
  clientCode: string;
  details: string;
  amount: number;
  currency: string;
  musdAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'draft' | 'expired';
  createdAt: string;
  wallet: string;
  bitcoinAddress?: string;
  expiresAt?: string;
}

interface InvoicesProps {
  invoices: InvoiceType[];
}

export function Invoices({ invoices }: InvoicesProps) {
  const { confirmPayment, cancelInvoice, refreshData } = useInvoiceContract();
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInvoice, setQrInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled' | 'expired'>('all');
  const [showCancelConfirm, setShowCancelConfirm] = useState<Invoice | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPrice = async () => {
      try {
        setIsLoadingPrice(true);
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        if (!cancelled) setBitcoinPrice(data.bitcoin.usd || 0);
      } catch {
        if (!cancelled) setBitcoinPrice(0);
      } finally {
        if (!cancelled) setIsLoadingPrice(false);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Compute derived status for expiry and filter accordingly
  const filteredInvoices = useMemo(() => {
    const now = Date.now();
    const withDerived = invoices.map(inv => {
      const isExpired = inv.expiresAt ? new Date(inv.expiresAt).getTime() <= now : false;
      const derivedStatus = inv.status === 'pending' && isExpired ? 'expired' : inv.status;
      return { ...inv, status: derivedStatus } as InvoiceType & { status: 'pending' | 'paid' | 'cancelled' | 'expired' };
    });
    if (statusFilter === 'all') return withDerived;
    return withDerived.filter(inv => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const handleMarkAsPaid = async () => {
    if (selectedInvoice) {
      toast.loading('Verifying payment...', { id: 'verify-payment' });
      try {
        await confirmPayment(selectedInvoice.id);
        toast.dismiss('verify-payment');
        toast.success('Invoice has been paid successfully');
        setSelectedInvoice(null);
        refreshData();
      } catch (error) {
        toast.dismiss('verify-payment');
        console.error('Error marking as paid:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (selectedInvoice) {
      await cancelInvoice(selectedInvoice.id);
      toast.success('Invoice cancelled');
      setSelectedInvoice(null);
      refreshData();
    }
  };

  const handleShowQR = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setQrInvoice(invoice);
    setShowQRModal(true);
  };

  const handleShowTransaction = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const txHash = (invoice as any).paymentTxHash || (invoice as any).txHash;
    if (txHash) {
      window.open(`https://explorer.test.mezo.org/tx/${txHash}`, '_blank');
    } else {
      toast.error('Transaction hash not available');
    }
  };

  

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">Invoices</h1>
          <p className="text-sm font-navbar text-white/60">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} 
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'paid', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-navbar font-medium transition-all capitalize border min-h-[44px] touch-manipulation active:scale-95",
                statusFilter === status
                  ? "bg-green-500/10 text-green-400 border-green-400/30"
                  : "bg-[#2C2C2E]/60 text-white/60 border-transparent hover:bg-green-500/5 hover:border-green-400/10 active:bg-green-500/10"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Create Invoice Button */}
      <div className="mb-6 flex justify-center">
        <CreateInvoicePanel />
      </div>

      {/* Invoices Grid */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-green-400/20 transition-all group active:scale-[0.99] touch-manipulation"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-white transition-colors font-navbar text-white truncate">
                  {invoice.clientName}
                </h3>
                <p className="text-xs font-navbar text-white/50 mb-1 sm:mb-2 truncate">{invoice.clientCode}</p>
                <p className="text-xs sm:text-sm font-navbar text-white/60 line-clamp-2">{invoice.details}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 ml-2 shrink-0">
                <button
                  onClick={(e) => handleShowQR(invoice, e)}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-green-400/30 bg-green-500/10 hover:bg-green-500/20 active:bg-green-500/30 transition-all flex items-center justify-center group touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                  title="Share QR Code"
                >
                  <QrCode className="w-4 h-4 text-white" />
                </button>
                {invoice.status === 'paid' && (
                  <button
                    onClick={(e) => handleShowTransaction(invoice, e)}
                    className="w-8 h-8 rounded-lg border border-green-400/30 bg-green-500/10 hover:bg-green-500/20 transition-all flex items-center justify-center"
                    title="View Transaction Details"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                )}
                {invoice.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCancelConfirm(invoice);
                    }}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 transition-all flex items-center justify-center touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                    title="Cancel Invoice"
                  >
                    <XCircle className="w-4 h-4 text-white" />
                  </button>
                )}
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-navbar font-medium border",
                    invoice.status === 'paid' && "bg-green-500/10 text-green-400 border-green-400/20",
                    invoice.status === 'pending' && "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
                    invoice.status === 'cancelled' && "bg-red-500/10 text-red-400 border-red-400/20"
                  )}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold font-navbar mb-1 text-white">
                  {invoice.amount.toFixed(8)} BTC
                </p>
                <p className="text-sm font-navbar text-white/60">${invoice.musdAmount.toFixed(2)} USD</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-navbar text-white/50 mb-1">Created</p>
                <p className="text-sm font-navbar text-white/70">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-green-400/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs font-navbar text-white/60">
                  Mezo: {invoice.bitcoinAddress ? `${invoice.bitcoinAddress.slice(0, 8)}...${invoice.bitcoinAddress.slice(-8)}` : 'Not set'}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(invoice)}
                className="px-4 py-2.5 sm:py-2 rounded-full bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 hover:border-green-400/50 active:bg-green-500/30 transition-all text-xs sm:text-sm font-navbar font-medium text-white min-h-[44px] touch-manipulation active:scale-95 w-full sm:w-auto"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 font-navbar text-white">No invoices yet</h3>
            <p className="text-white/60 text-sm mb-2 font-navbar">
              {statusFilter === 'all' 
                ? 'Create your first invoice to get started'
                : `No ${statusFilter} invoices found`
              }
            </p>
            {statusFilter === 'all' && (
              <p className="text-xs font-navbar text-white/40">Click "Create Invoice" above to get started</p>
            )}
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 safe-area-inset">
          <div className="bg-[#2C2C2E]/90 backdrop-blur-xl border border-green-400/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-xl font-semibold font-navbar text-white">
                <span className="text-[#F7931A] text-sm">₿</span>
                Invoice Details
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Client Name</label>
                  <p className="text-white">{selectedInvoice.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Client Code</label>
                  <p className="text-white">{selectedInvoice.clientCode}</p>
                </div>
                {selectedInvoice.currency === 'BTC' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Amount</label>
                      <p className="text-white">{selectedInvoice.amount.toFixed(8)} BTC</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">USD Equivalent</label>
                      <p className="text-white">${(selectedInvoice.amount * (bitcoinPrice || 0)).toFixed(2)} USD</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Amount</label>
                      <p className="text-white">${(selectedInvoice.amount * (bitcoinPrice || 0)).toFixed(2)} USD</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Bitcoin Equivalent</label>
                      <p className="text-white">{selectedInvoice.amount.toFixed(8)} BTC</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      selectedInvoice.status === 'paid' && "bg-green-500/20 text-green-400",
                      selectedInvoice.status === 'pending' && "bg-yellow-500/20 text-yellow-400",
                      selectedInvoice.status === 'cancelled' && "bg-red-500/20 text-red-400"
                    )}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Created</label>
                  <p className="text-white">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <p className="text-white">{selectedInvoice.details}</p>
              </div>

              {/* Receiving address */}
              {(selectedInvoice as any).payToAddress || selectedInvoice.bitcoinAddress ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-white/80">Receiving address</label>
                    {selectedInvoice.status === 'paid' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-400/30 font-navbar">auto-detected</span>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white font-mono text-sm break-all">{(selectedInvoice as any).payToAddress || selectedInvoice.bitcoinAddress}</p>
                  </div>
                </div>
              ) : null}

              {/* Dev payment debug removed for cleaner UX */}

              {/* Actions */}
              {selectedInvoice.status === 'pending' && selectedInvoice.expiresAt && new Date(selectedInvoice.expiresAt).getTime() > Date.now() && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    onClick={handleMarkAsPaid}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 flex items-center gap-2 min-h-[44px] touch-manipulation active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Mark as Paid</span>
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 flex items-center gap-2 min-h-[44px] touch-manipulation active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Cancel Invoice</span>
                  </Button>
                </div>
              )}
              {/* Approval step removed; paid is final for UX simplicity */}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelConfirm(null)}
        >
          <div
            className="w-full max-w-md bg-[#2C2C2E]/90 backdrop-blur-xl border border-green-400/20 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold font-navbar text-white">Cancel Invoice</h3>
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-white/80">
              <p>Are you sure you want to cancel this invoice?</p>
              <div className="p-3 bg-white/5 rounded-xl">
                <p><strong>Client:</strong> {showCancelConfirm.clientName}</p>
                <p><strong>Amount:</strong> {showCancelConfirm.amount.toFixed(8)} BTC</p>
                <p><strong>Details:</strong> {showCancelConfirm.details}</p>
              </div>
              <p className="text-sm text-red-400">
                ⚠️ This action cannot be undone. The invoice will be marked as cancelled.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1"
              >
                Keep Invoice
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // Optimistically close modal immediately (UI already updated)
                    setShowCancelConfirm(null);
                    await cancelInvoice(showCancelConfirm.id);
                  } catch (error) {
                    console.error('Error cancelling invoice:', error);
                    // Don't reopen modal on error, let toast handle it
                  }
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      <InvoiceQRModal 
        invoice={qrInvoice as InvoiceType}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      
    </div>
  );
}

// Timer component for invoice expiry
function InvoiceTimer({ expiresAt }: { expiresAt: string }) {
  const { label, isExpired } = useCountdown(expiresAt);
  
  return (
    <div className="mt-2 flex items-center gap-1">
      <Clock className="w-3 h-3 text-yellow-400" />
      <span className={cn(
        "text-xs font-navbar font-medium",
        isExpired ? "text-red-400" : "text-yellow-400"
      )}>
        {isExpired ? 'Expired' : label}
      </span>
    </div>
  );
}