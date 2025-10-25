import { useState } from 'react';
import { X, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InvoiceQRModal } from '@/components/invoice/InvoiceQRModal';
import { Invoice } from '@/types/invoice';

interface InvoicesProps {
  invoices: Invoice[];
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

export function Invoices({ invoices, onUpdateInvoice }: InvoicesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInvoice, setQrInvoice] = useState<Invoice | null>(null);

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

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 font-title">Invoices</h1>
        <p className="text-white/50">{invoices.length} total invoice{invoices.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-6">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="glass-card p-6 rounded-3xl hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-white/90 transition-colors font-title">{invoice.clientName}</h3>
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
                  {invoice.currency} {invoice.amount.toFixed(2)}
                </p>
                <p className="text-sm text-white/50">{invoice.musdAmount.toFixed(2)} MUSD</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50 mb-1">Created</p>
                <p className="text-sm text-white/70">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-white/60">Wallet: {invoice.wallet}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(invoice)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="glass-card p-16 rounded-3xl text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <p className="text-4xl">📝</p>
            </div>
            <h3 className="text-xl font-semibold mb-2 font-title">No invoices yet</h3>
            <p className="text-foreground/60 text-sm mb-6">Create your first invoice to get started with managing your business</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
              Create Invoice
            </button>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl border border-white/20 w-full max-w-2xl mx-4 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-title mb-1">Invoice Details</h2>
              <p className="text-white/60 text-sm">Invoice #{selectedInvoice.clientCode}</p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Client & Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Client</p>
                      <p className="font-semibold">{selectedInvoice.clientName}</p>
                    </div>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Status</p>
                      <span
                        className={cn(
                          "inline-block px-3 py-1 rounded-full text-xs font-medium",
                          selectedInvoice.status === 'paid' && "bg-green-500/20 text-green-400 border border-green-500/30",
                          selectedInvoice.status === 'pending' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                          selectedInvoice.status === 'cancelled' && "bg-red-500/20 text-red-400 border border-red-500/30"
                        )}
                      >
                        {selectedInvoice.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">Created</p>
                      <p className="text-xs font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Section */}
              <div className="glass p-6 rounded-xl border border-white/10 text-center">
                <p className="text-sm text-white/60 mb-2">Invoice Amount</p>
                <div className="text-3xl font-bold mb-1">
                  {selectedInvoice.currency} {selectedInvoice.amount.toFixed(2)}
                </div>
                <p className="text-lg text-orange-400 font-medium">
                  {selectedInvoice.musdAmount.toFixed(2)} MUSD
                </p>
              </div>

              {/* Details Section */}
              <div className="glass p-4 rounded-xl border border-white/10">
                <h3 className="text-base font-semibold mb-3 font-title">Invoice Details</h3>
                <p className="text-white/90 text-sm leading-relaxed">{selectedInvoice.details}</p>
              </div>

              {/* Wallet & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl border border-white/10">
                  <h3 className="text-base font-semibold mb-3 font-title">Payment Info</h3>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Recipient Wallet</p>
                    <p className="font-mono text-xs bg-black/20 p-2 rounded border border-white/10">
                      {selectedInvoice.wallet}
                    </p>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl border border-white/10">
                  <h3 className="text-base font-semibold mb-3 font-title">Invoice Info</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Invoice Code</p>
                      <p className="font-mono text-xs bg-black/20 p-2 rounded border border-white/10">
                        {selectedInvoice.clientCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Created Date</p>
                      <p className="text-xs font-medium">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedInvoice.status === 'pending' && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                <Button
                  onClick={handleMarkAsPaid}
                  className="flex-1 glass-hover border border-green-500/30 h-12 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-300 transition-all rounded-xl"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Paid
                </Button>
                <Button
                  onClick={handleCancel}
                  className="flex-1 glass-hover border border-red-500/30 h-12 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all rounded-xl"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Invoice
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <InvoiceQRModal 
        invoice={qrInvoice}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}

