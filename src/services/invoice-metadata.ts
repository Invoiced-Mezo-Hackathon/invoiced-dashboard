// Store additional invoice metadata (e.g., Bitcoin price at creation time)
// This allows USD invoices to maintain fixed amounts regardless of price changes

// Helper function to get storage key scoped by wallet address
function getStorageKey(address: string | null | undefined): string {
  if (!address) return '';
  return `invoice_metadata_${address.toLowerCase()}`;
}

interface InvoiceMetadata {
  [invoiceId: string]: {
    bitcoinPriceAtCreation: number;
    originalUsdAmount?: number; // For USD invoices, store the original amount
  };
}

class InvoiceMetadataStorage {
  private getMetadata(address: string | null | undefined): InvoiceMetadata {
    if (!address) return {};
    try {
      const storageKey = getStorageKey(address);
      if (!storageKey) return {};
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading invoice metadata:', error);
      return {};
    }
  }

  private saveMetadata(address: string | null | undefined, metadata: InvoiceMetadata): void {
    if (!address) return;
    try {
      const storageKey = getStorageKey(address);
      if (!storageKey) return;
      localStorage.setItem(storageKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving invoice metadata:', error);
    }
  }

  // Store Bitcoin price at creation time for an invoice
  setBitcoinPriceAtCreation(address: string | null | undefined, invoiceId: string, price: number, originalUsdAmount?: number): void {
    if (!address) return;
    const metadata = this.getMetadata(address);
    metadata[invoiceId] = {
      bitcoinPriceAtCreation: price,
      ...(originalUsdAmount !== undefined && { originalUsdAmount }),
    };
    this.saveMetadata(address, metadata);
  }

  // Get Bitcoin price at creation time for an invoice
  getBitcoinPriceAtCreation(address: string | null | undefined, invoiceId: string): number | null {
    if (!address) return null;
    const metadata = this.getMetadata(address);
    return metadata[invoiceId]?.bitcoinPriceAtCreation || null;
  }

  // Get original USD amount for an invoice (if stored)
  getOriginalUsdAmount(address: string | null | undefined, invoiceId: string): number | null {
    if (!address) return null;
    const metadata = this.getMetadata(address);
    return metadata[invoiceId]?.originalUsdAmount || null;
  }

  // Clear metadata for an invoice (optional cleanup)
  clearMetadata(address: string | null | undefined, invoiceId: string): void {
    if (!address) return;
    const metadata = this.getMetadata(address);
    delete metadata[invoiceId];
    this.saveMetadata(address, metadata);
  }
}

export const invoiceMetadataStorage = new InvoiceMetadataStorage();

