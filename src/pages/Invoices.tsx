import { useState } from 'react';
import { X, CheckCircle, XCircle, QrCode, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InvoiceQRModal } from '@/components/invoice/InvoiceQRModal';
import { CreateInvoicePanel } from '@/components/invoice/CreateInvoicePanel';
import { useInvoicePaymentMonitor } from '@/hooks/usePaymentMonitor';
import { TransactionDetailsModal } from '@/components/TransactionDetailsModal';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { useCountdown } from '@/hooks/useCountdown';
import { Invoice as InvoiceType } from '@/types/invoice';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [showCancelConfirm, setShowCancelConfirm] = useState<Invoice | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Filter invoices based on status
  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter === 'all') return true;
    return invoice.status === statusFilter;
  });

  const handleMarkAsPaid = async () => {
    if (selectedInvoice) {
      await confirmPayment(selectedInvoice.id);
      setSelectedInvoice(null);
      refreshData();
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

  const handleShowTransaction = (invoice: InvoiceType, e: React.MouseEvent) => {
    e.stopPropagation();
    // Get transaction details for this invoice
    const { transactions } = useInvoicePaymentMonitor(invoice.id, invoice.bitcoinAddress || '');
    if (transactions.length > 0) {
      setSelectedTransaction(transactions[0]);
      setShowTransactionModal(true);
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
                "px-4 py-2 rounded-full text-sm font-navbar font-medium transition-all capitalize border",
                statusFilter === status
                  ? "bg-green-500/10 text-green-400 border-green-400/30"
                  : "bg-[#2C2C2E]/60 text-white/60 border-transparent hover:bg-green-500/5 hover:border-green-400/10"
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
            className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/10 rounded-2xl p-5 hover:border-green-400/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors font-navbar text-white">
                  {invoice.clientName}
                </h3>
                <p className="text-xs font-navbar text-white/50 mb-2">{invoice.clientCode}</p>
                <p className="text-sm font-navbar text-white/60">{invoice.details}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => handleShowQR(invoice, e)}
                  className="w-8 h-8 rounded-lg border border-green-400/30 bg-green-500/10 hover:bg-green-500/20 transition-all flex items-center justify-center group"
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
                    className="w-8 h-8 rounded-lg border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center"
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
                {/* Timer for pending invoices */}
                {invoice.status === 'pending' && invoice.expiresAt && (
                  <InvoiceTimer expiresAt={invoice.expiresAt} />
                )}
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
                className="px-4 py-2 rounded-full bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 hover:border-green-400/50 transition-all text-sm font-navbar font-medium text-white"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2C2E]/90 backdrop-blur-xl border border-green-400/20 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold font-navbar text-white">Invoice Details</h3>
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
        invoice={qrInvoice as InvoiceType}
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