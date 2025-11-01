// Transaction Details Modal Component
// Shows comprehensive transaction information with explorer links

import { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoredTransaction } from '@/services/transaction-storage';
import { MEZO_EXPLORER_URL } from '@/lib/boar-config';
import { usePublicClient } from 'wagmi';
import { formatEther, formatGwei } from 'viem';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: StoredTransaction | null;
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const publicClient = usePublicClient();

  // Fetch full transaction details from Mezo testnet
  useEffect(() => {
    if (!isOpen || !transaction || !transaction.txHash || !publicClient) return;

    const fetchTransactionDetails = async () => {
      setIsLoadingDetails(true);
      try {
        // Fetch transaction receipt for gas details
        const receipt = await publicClient.getTransactionReceipt({
          hash: transaction.txHash as `0x${string}`,
        });

        // Fetch transaction details
        const tx = await publicClient.getTransaction({
          hash: transaction.txHash as `0x${string}`,
        });

        // Get block details for timestamp
        let blockTimestamp = transaction.timestamp;
        if (receipt?.blockNumber) {
          try {
            const block = await publicClient.getBlock({
              blockNumber: receipt.blockNumber,
            });
            blockTimestamp = Number(block.timestamp);
          } catch (e) {
            console.warn('Could not fetch block timestamp:', e);
          }
        }

        setTxDetails({
          gasUsed: receipt?.gasUsed ? receipt.gasUsed.toString() : undefined,
          gasPrice: tx?.gasPrice ? tx.gasPrice.toString() : undefined,
          effectiveGasPrice: receipt?.effectiveGasPrice ? receipt.effectiveGasPrice.toString() : undefined,
          blockTimestamp,
          blockNumber: receipt?.blockNumber ? Number(receipt.blockNumber) : transaction.blockNumber,
          from: tx?.from || transaction.from,
          to: tx?.to || transaction.to,
          value: tx?.value ? tx.value.toString() : transaction.amount,
          nonce: tx?.nonce,
          transactionIndex: receipt?.transactionIndex,
          status: receipt?.status === 'success' ? 'confirmed' : receipt?.status === 'reverted' ? 'failed' : 'pending',
        });
      } catch (error) {
        console.error('Failed to fetch transaction details:', error);
        // Fallback to stored transaction data
        setTxDetails({
          from: transaction.from,
          to: transaction.to,
          blockNumber: transaction.blockNumber,
          blockTimestamp: transaction.timestamp,
          status: transaction.status,
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchTransactionDetails();
  }, [isOpen, transaction, publicClient]);

  if (!isOpen || !transaction) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAmount = (amount: string) => {
    // Convert wei to BTC (assuming 18 decimals)
    const btcAmount = parseFloat(amount) / 1e18;
    return btcAmount.toFixed(8);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold font-title">Transaction Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            {getStatusIcon(txDetails?.status || transaction.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(txDetails?.status || transaction.status)}`}>
              {(txDetails?.status || transaction.status).toUpperCase()}
            </span>
            {transaction.confirmations > 0 && (
              <span className="text-sm text-white/60">
                {transaction.confirmations} confirmation{transaction.confirmations !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Transaction Hash</label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <code className="flex-1 text-sm text-white/90 font-mono">
                {transaction.txHash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.txHash, 'txHash')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {copiedField === 'txHash' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${MEZO_EXPLORER_URL}/tx/${transaction.txHash}`, '_blank')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Amount</label>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-lg font-semibold text-green-400">
                {formatAmount(txDetails?.value || transaction.amount)} BTC
              </div>
              {isLoadingDetails && (
                <div className="text-xs text-white/50 mt-1">Loading transaction details...</div>
              )}
            </div>
          </div>

          {/* From Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">From Address</label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <code className="flex-1 text-sm text-white/90 font-mono">
                {txDetails?.from || transaction.from || 'N/A'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(txDetails?.from || transaction.from || '', 'from')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {copiedField === 'from' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${MEZO_EXPLORER_URL}/address/${txDetails?.from || transaction.from}`, '_blank')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* To Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">To Address</label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <code className="flex-1 text-sm text-white/90 font-mono">
                {txDetails?.to || transaction.to || 'N/A'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(txDetails?.to || transaction.to || '', 'to')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {copiedField === 'to' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${MEZO_EXPLORER_URL}/address/${txDetails?.to || transaction.to}`, '_blank')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Block Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Block Number</label>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/90 font-mono">
                  #{txDetails?.blockNumber || transaction.blockNumber || 'N/A'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Timestamp</label>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/90">
                  {txDetails?.blockTimestamp 
                    ? formatTimestamp(txDetails.blockTimestamp) 
                    : formatTimestamp(transaction.timestamp)}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Fee & Gas Information */}
          {txDetails && (txDetails.gasUsed || txDetails.gasPrice) && (
            <div className="grid grid-cols-2 gap-4">
              {txDetails.gasUsed && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Gas Used</label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-sm text-white/90 font-mono">
                      {Number(txDetails.gasUsed).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {txDetails.effectiveGasPrice && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Gas Price</label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-sm text-white/90 font-mono">
                      {formatGwei(BigInt(txDetails.effectiveGasPrice))} Gwei
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transaction Fee */}
          {txDetails?.gasUsed && txDetails?.effectiveGasPrice && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Transaction Fee</label>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/90">
                  {formatEther(BigInt(txDetails.gasUsed) * BigInt(txDetails.effectiveGasPrice))} ETH
                </div>
              </div>
            </div>
          )}

          {/* Transaction Index */}
          {txDetails?.transactionIndex !== undefined && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Transaction Index</label>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/90 font-mono">
                  {txDetails.transactionIndex}
                </div>
              </div>
            </div>
          )}

          {/* Nonce */}
          {txDetails?.nonce !== undefined && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Nonce</label>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/90 font-mono">
                  {txDetails.nonce}
                </div>
              </div>
            </div>
          )}

          {/* Invoice Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Invoice ID</label>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm text-white/90 font-mono">
                {transaction.invoiceId}
              </div>
            </div>
          </div>

          {/* Detected At */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Detected At</label>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm text-white/90">
                {new Date(transaction.detectedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => window.open(`${MEZO_EXPLORER_URL}/tx/${transaction.txHash}`, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
