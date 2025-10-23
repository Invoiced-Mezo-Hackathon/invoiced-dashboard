import { useState, useEffect } from 'react';
import { X, Copy, Share2, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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

interface InvoiceQRModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceQRModal({ invoice, isOpen, onClose }: InvoiceQRModalProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (invoice && isOpen) {
      // Create shareable URL with invoice data
      const invoiceData = {
        id: invoice.id,
        clientName: invoice.clientName,
        amount: invoice.amount,
        currency: invoice.currency,
        details: invoice.details,
        wallet: invoice.wallet,
        createdAt: invoice.createdAt
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(invoiceData));
      const url = `${window.location.origin}/invoice/${invoice.id}?data=${encodedData}`;
      setShareUrl(url);

      // Generate QR code
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataURL);
    }
  }, [invoice, isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Invoice link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `invoice-${invoice?.id}-qr.png`;
      link.href = qrCodeDataURL;
      link.click();
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass p-8 rounded-3xl border border-white/20 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold font-title mb-2">Share Invoice</h2>
          <p className="text-white/60 mb-6">Scan QR code or share the link</p>

          {/* QR Code */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-white rounded-2xl">
              {qrCodeDataURL && (
                <img 
                  src={qrCodeDataURL} 
                  alt="Invoice QR Code" 
                  className="w-48 h-48"
                />
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="glass p-4 rounded-2xl border border-white/10 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60">Client:</span>
                <span className="font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Amount:</span>
                <span className="font-medium">{invoice.currency} {invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">MUSD:</span>
                <span className="font-medium">{invoice.musdAmount.toFixed(2)} MUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  invoice.status === 'pending' && "bg-yellow-500/20 text-yellow-400",
                  invoice.status === 'paid' && "bg-green-500/20 text-green-400",
                  invoice.status === 'cancelled' && "bg-red-500/20 text-red-400"
                )}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-400 hover:bg-orange-500 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
