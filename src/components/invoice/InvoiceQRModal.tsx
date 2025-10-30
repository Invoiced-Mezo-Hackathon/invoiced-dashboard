import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Invoice } from '@/types/invoice';

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
    } catch {
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
      <div className="bg-[#2C2C2E]/90 backdrop-blur-xl p-8 rounded-3xl border border-green-400/20 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <i className="fa-solid fa-xmark text-white text-sm"></i>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold font-navbar mb-2 text-white">Share Invoice</h2>
          <p className="text-white/60 mb-6 font-navbar">Scan QR code or share the link</p>

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
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-green-400/10 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 font-navbar">Client:</span>
                <span className="font-medium text-white font-navbar">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 font-navbar">Amount:</span>
                <span className="font-medium text-white font-navbar">{invoice.currency} {invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 font-navbar">MUSD:</span>
                <span className="font-medium text-white font-navbar">{invoice.musdAmount.toFixed(2)} MUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 font-navbar">Status:</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium font-navbar",
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
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2C2C2E]/40 hover:bg-green-500/20 transition-colors border border-green-400/20 text-white font-navbar"
            >
              <i className="fa-solid fa-copy"></i>
              Copy Link
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors font-navbar"
            >
              <i className="fa-solid fa-download"></i>
              Download QR
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
