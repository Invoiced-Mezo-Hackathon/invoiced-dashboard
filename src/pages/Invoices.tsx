import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, QrCode, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InvoiceQRModal } from '@/components/invoice/InvoiceQRModal';
import { CreateInvoicePanel } from '@/components/invoice/CreateInvoicePanel';
import { TransactionDetailsModal } from '@/components/TransactionDetailsModal';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';
import { invoiceStorage } from '@/services/invoice-storage';
import { paymentMonitor } from '@/services/payment-monitor';

interface InvoicesProps {
  invoices: Invoice[];
}

export function Invoices({ invoices }: InvoicesProps) {
  const { cancelInvoice, refreshData } = useInvoiceContract();
  const { toast } = useToast();
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInvoice, setQrInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled' | 'expired'>('all');
  const [showCancelConfirm, setShowCancelConfirm] = useState<Invoice | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Update current time every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load local invoices and combine with blockchain invoices
  useEffect(() => {
    const loadLocalInvoices = () => {
      const drafts = invoiceStorage.listDrafts();
      setLocalInvoices(drafts);
    };
    
    loadLocalInvoices();
    
    // Refresh every 5 seconds to check for expired invoices
    const interval = setInterval(() => {
      loadLocalInvoices();
      paymentMonitor.checkExpiredInvoices();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Set up payment monitoring callbacks
  useEffect(() => {
    paymentMonitor.setCallbacks({
      onPaymentDetected: (event) => {
        console.log('💰 Payment detected for invoice:', event.invoiceId);
        toast({
          title: "Payment Received!",
          description: "Invoice has been marked as paid",
        });
        // Refresh local invoices
        setLocalInvoices(invoiceStorage.listDrafts());
      },
      onPaymentConfirmed: (event) => {
        console.log('✅ Payment confirmed for invoice:', event.invoiceId);
      },
      onConnectionStatus: (event) => {
        if (event.status === 'connected') {
          console.log('🔌 Payment monitor connected');
          toast({
            title: "🔌 Boar Connected",
            description: "Payment monitoring is active",
            duration: 3000,
          });
        } else if (event.status === 'disconnected') {
          console.log('🔌 Payment monitor disconnected');
          toast({
            title: "🔌 Boar Disconnected",
            description: "Payment monitoring is offline",
            variant: "destructive",
            duration: 3000,
          });
        }
      },
      onError: (error) => {
        console.error('🚨 Payment monitor error:', error);
        toast({
          title: "🚨 Boar Error",
          description: error.message || "Payment monitoring error",
          variant: "destructive",
        });
      },
    });

    // Start monitoring pending invoices
    paymentMonitor.startMonitoringPendingInvoices();

    return () => {
      paymentMonitor.stopMonitoringAllInvoices();
    };
  }, [toast]);

  // Combine blockchain invoices with local invoices, removing duplicates
  const allInvoices = [...invoices];
  
  // Add local invoices that aren't already in blockchain invoices
  localInvoices.forEach(localInvoice => {
    const exists = allInvoices.some(invoice => invoice.id === localInvoice.id);
    if (!exists) {
      allInvoices.push(localInvoice);
    }
  });

  // Filter invoices based on status
  const filteredInvoices = allInvoices.filter(invoice => {
    if (statusFilter === 'all') return true;
    return invoice.status === statusFilter;
  });

  const handleMarkAsPaid = async () => {
    if (selectedInvoice) {
      try {
        console.log('🚀 ===== MARK AS PAID CLICKED =====');
        console.log('🚀 Selected invoice:', selectedInvoice);
        console.log('🚀 Invoice ID:', selectedInvoice.id);
        console.log('🚀 Invoice status:', selectedInvoice.status);
        console.log('🚀 Invoice payToAddress:', selectedInvoice.payToAddress);
        console.log('🚀 Invoice bitcoinAddress:', selectedInvoice.bitcoinAddress);
        
        // Show verification popup
        setIsVerifyingPayment(true);
        
        // Use the new payment confirmation logic
        console.log('🚀 Calling paymentMonitor.confirmInvoicePaid...');
        const result = await paymentMonitor.confirmInvoicePaid(selectedInvoice);
        
        console.log('🚀 Payment confirmation result:', result);
        
        if (result.confirmed) {
          // Generate transaction hash for manual confirmation
          const txHash = `manual_${Date.now()}`;
          
          // Mark as paid in local storage with transaction hash
          invoiceStorage.markAsPaid(selectedInvoice.id, result.amount, txHash);
          
          // Calculate if this was an overpayment
          const receivedAmount = parseFloat(result.amount) / 1e18;
          const requestedAmount = selectedInvoice.amount;
          const isOverpaid = receivedAmount > requestedAmount;
          const overpaidAmount = isOverpaid ? receivedAmount - requestedAmount : 0;
          
          // Show success toast with overpayment details
          const toastDescription = isOverpaid 
            ? `Invoice #${selectedInvoice.clientCode} marked as paid. Amount received: ${receivedAmount.toFixed(8)} BTC (+${overpaidAmount.toFixed(8)} BTC tip)`
            : `Invoice #${selectedInvoice.clientCode} marked as paid. Amount received: ${receivedAmount.toFixed(8)} BTC`;
          
          toast({
            title: "🎉 Payment Confirmed!",
            description: toastDescription,
            duration: 5000,
          });
          
          // Refresh local invoices to show updated status
          setLocalInvoices(invoiceStorage.listDrafts());
          
          // Refresh all data to update payments section
          refreshData();
          
          console.log('✅ Payment confirmed and invoice marked as paid');
          if (isOverpaid) {
            console.log('💰 Overpayment detected:', overpaidAmount.toFixed(8), 'BTC');
          }
        } else {
          toast({
            title: "No Payment Detected",
            description: result.error || "No inbound funds detected yet. Please ensure the payment has been sent to the correct address.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        toast({
          title: "Confirmation Failed",
          description: "Failed to confirm payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Hide verification popup
        setIsVerifyingPayment(false);
        // Don't close the modal automatically - let user see the result
        // setSelectedInvoice(null);
      }
    }
  };

  const handleCancel = async () => {
    if (selectedInvoice) {
      await cancelInvoice(selectedInvoice.id);
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
    // Get transaction details for this invoice from transaction storage
    const { transactionStorage } = require('@/services/transaction-storage');
    const transactions = transactionStorage.getTransactionsForInvoice(invoice.id);
    if (transactions.length > 0) {
      setSelectedTransaction(transactions[0]);
      setShowTransactionModal(true);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-title">Invoices</h1>
          <p className="text-white/50">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} 
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {(['all', 'pending', 'paid', 'cancelled', 'expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                statusFilter === status
                  ? "bg-orange-400 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Create Invoice Button - Middle Section */}
      <div className="mb-8 flex justify-center">
        <CreateInvoicePanel onInvoiceCreated={() => {
          refreshData();
          setLocalInvoices(invoiceStorage.listDrafts());
        }} />
      </div>

      {/* Invoices Grid */}
      <div className="grid gap-6">
        {filteredInvoices.map((invoice) => {
          // Calculate expiry status without using hooks inside map
          const expiresAt = invoice.expiresAt ? new Date(invoice.expiresAt).getTime() : 0;
          const remainingMs = Math.max(0, expiresAt - currentTime);
          const isExpired = remainingMs <= 0 || invoice.status === 'expired';
          
          // Debug logging for new invoices
          if (invoice.id.startsWith('draft_') && invoice.status === 'pending') {
            console.log('🕐 Invoice expiry debug:', {
              id: invoice.id,
              expiresAt: invoice.expiresAt,
              expiresAtTime: expiresAt,
              currentTime,
              remainingMs,
              isExpired
            });
          }
          
          // Format countdown display
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          
          const getCountdownLabel = () => {
            if (isExpired) return 'Expired';
            if (hours > 0) {
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          };
          
          return (
            <div
              key={invoice.id}
              className="glass-card p-6 rounded-3xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-white/90 transition-colors font-title">
                    {invoice.clientName}
                  </h3>
                  <p className="text-sm text-white/50 mb-2">{invoice.clientCode}</p>
                  <p className="text-sm text-white/60 line-clamp-2">{invoice.details}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => handleShowQR(invoice, e)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
                    title="Share QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  {invoice.status === 'paid' && (
                    <button
                      onClick={(e) => handleShowTransaction(invoice, e)}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors group"
                      title="View Transaction Details"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                  {invoice.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCancelConfirm(invoice);
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors group"
                      title="Cancel Invoice"
                    >
                      <XCircle className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                      invoice.status === 'paid' && "bg-green-500/20 text-green-400",
                      invoice.status === 'pending' && !isExpired && "bg-yellow-500/20 text-yellow-400",
                      invoice.status === 'pending' && isExpired && "bg-red-500/20 text-red-400",
                      invoice.status === 'cancelled' && "bg-red-500/20 text-red-400",
                      invoice.status === 'expired' && "bg-gray-500/20 text-gray-400"
                    )}
                  >
                    {invoice.status === 'pending' && !isExpired ? 'pending' : 
                     invoice.status === 'pending' && isExpired ? 'expired' : 
                     invoice.status}
                  </span>
                </div>
              </div>
            
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold mb-1">
                    {invoice.amount.toFixed(8)} BTC
                  </p>
                  <p className="text-sm text-white/50">${invoice.musdAmount.toFixed(2)} USD</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50 mb-1">Created</p>
                  <p className="text-sm text-white/70">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Countdown Timer for Pending Invoices */}
              {invoice.status === 'pending' && invoice.expiresAt && (
                <div className="mb-4 p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white/80">Payment Window:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-mono font-bold",
                        isExpired ? "text-red-400" : "text-orange-400"
                      )}>
                        {getCountdownLabel()}
                      </span>
                      {isExpired && (
                        <span className="text-xs text-red-400">Expired</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-xs text-white/60">
                    Pay To: {invoice.payToAddress ? `${invoice.payToAddress.slice(0, 8)}...${invoice.payToAddress.slice(-8)}` : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredInvoices.length === 0 && (
          <div className="glass-card p-16 rounded-3xl text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <p className="text-4xl">📝</p>
            </div>
            <h3 className="text-xl font-semibold mb-2 font-title">No invoices yet</h3>
            <p className="text-foreground/60 text-sm mb-6">
              {statusFilter === 'all' 
                ? 'Create your first invoice to get started'
                : `No ${statusFilter} invoices found`
              }
            </p>
            {statusFilter === 'all' && (
              <p className="text-xs text-white/40">Click "Create Invoice" above to get started</p>
            )}
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold font-title">Invoice Details</h3>
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
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Bitcoin Amount</label>
                  <p className="text-white">{selectedInvoice.amount.toFixed(8)} BTC</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">USD Equivalent</label>
                  <p className="text-white">${selectedInvoice.musdAmount.toFixed(2)} USD</p>
                </div>
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
                    {selectedInvoice.status === 'pending' ? 'draft' : selectedInvoice.status}
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

              {/* Payment Address */}
              {selectedInvoice.payToAddress && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Payment Address</label>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white font-mono text-sm break-all">{selectedInvoice.payToAddress}</p>
                  </div>
                </div>
              )}

              {/* Countdown Timer for Pending Invoices */}
              {selectedInvoice.status === 'pending' && selectedInvoice.expiresAt && (() => {
                const expiresAt = new Date(selectedInvoice.expiresAt).getTime();
                const remainingMs = Math.max(0, expiresAt - currentTime);
                const isExpired = remainingMs <= 0;
                
                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
                
                const getCountdownLabel = () => {
                  if (isExpired) return 'Expired';
                  if (hours > 0) {
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                  }
                  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                };
                
                return (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <span className="text-sm font-medium text-white/80">Payment Window</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-lg font-mono font-bold",
                          isExpired ? "text-red-400" : "text-orange-400"
                        )}>
                          {getCountdownLabel()}
                        </span>
                        {isExpired && (
                          <span className="text-sm text-red-400">Expired</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              {selectedInvoice.status === 'pending' && (() => {
                const expiresAt = selectedInvoice.expiresAt ? new Date(selectedInvoice.expiresAt).getTime() : 0;
                const remainingMs = Math.max(0, expiresAt - currentTime);
                const isExpired = remainingMs <= 0;
                
                return (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Button
                      onClick={handleMarkAsPaid}
                      disabled={isExpired}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isExpired ? 'Expired' : 'Mark as Paid'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Invoice
                    </Button>
                  </div>
                );
              })()}
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
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Cancel Invoice</h3>
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
                  await cancelInvoice(showCancelConfirm.id);
                  setShowCancelConfirm(null);
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
        invoice={qrInvoice}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={selectedTransaction}
      />

      {/* Payment Verification Modal */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">🔍 Verifying Payment</h3>
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Checking Bitcoin transaction with Boar Network...
                  </p>
                  <p className="text-xs text-gray-500">
                    This may take a few moments
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsVerifyingPayment(false)}
                  className="mt-4"
                >
                  Cancel Verification
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}