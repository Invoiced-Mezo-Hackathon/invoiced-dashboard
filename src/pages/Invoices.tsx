import { useState } from 'react';
import { X, CheckCircle, XCircle, QrCode, Eye, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InvoiceQRModal } from '@/components/invoice/InvoiceQRModal';
import { CreateInvoicePanel } from '@/components/invoice/CreateInvoicePanel';
import { useInvoicePaymentMonitor } from '@/hooks/usePaymentMonitor';
import { TransactionDetailsModal } from '@/components/TransactionDetailsModal';

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

interface InvoicesProps {
  invoices: Invoice[];
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
  onInvoiceCreated: (invoice: Invoice) => void;
}

export function Invoices({ invoices, onUpdateInvoice, onInvoiceCreated }: InvoicesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInvoice, setQrInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [showCancelConfirm, setShowCancelConfirm] = useState<Invoice | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Filter invoices based on status
  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter === 'all') return true;
    return invoice.status === statusFilter;
  });

  const handleMarkAsPaid = () => {
    if (selectedInvoice) {
      onUpdateInvoice(selectedInvoice.id, { status: 'paid' });
      setSelectedInvoice(null);
    }
  };

  const handleCancel = () => {
    if (selectedInvoice) {
      onUpdateInvoice(selectedInvoice.id, { status: 'cancelled' });
      setSelectedInvoice(null);
    }
  };

  const handleShowQR = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setQrInvoice(invoice);
    setShowQRModal(true);
  };

  const handleShowTransaction = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    // Get transaction details for this invoice
    const { getTransactionsForInvoice } = useInvoicePaymentMonitor();
    const transactions = getTransactionsForInvoice(invoice.id);
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
          {(['all', 'pending', 'paid', 'cancelled'] as const).map((status) => (
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
        <CreateInvoicePanel onInvoiceCreated={onInvoiceCreated} />
      </div>

      {/* Invoices Grid */}
      <div className="grid gap-6">
        {filteredInvoices.map((invoice) => (
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
                              invoice.status === 'pending' && "bg-yellow-500/20 text-yellow-400",
                              invoice.status === 'cancelled' && "bg-red-500/20 text-red-400"
                            )}
                          >
                            {invoice.status}
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

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-xs text-white/60">
                    Mezo: {invoice.bitcoinAddress ? `${invoice.bitcoinAddress.slice(0, 8)}...${invoice.bitcoinAddress.slice(-8)}` : 'Not set'}
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
        ))}

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

              {/* Mezo Testnet Address */}
              {selectedInvoice.bitcoinAddress && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Mezo Testnet Address</label>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white font-mono text-sm break-all">{selectedInvoice.bitcoinAddress}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedInvoice.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    onClick={handleMarkAsPaid}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Paid
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
              )}
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
                onClick={() => {
                  onUpdateInvoice(showCancelConfirm.id, { status: 'cancelled' });
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
    </div>
  );
}