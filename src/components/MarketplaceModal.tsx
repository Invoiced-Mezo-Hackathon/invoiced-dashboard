import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { MARKETPLACE_PRODUCTS, Product } from '@/types/market';
import { useMarketplace } from '@/hooks/useMarketplace';
import toast from 'react-hot-toast';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketplaceModal({ isOpen, onClose }: MarketplaceModalProps) {
  const { purchaseProduct, isPurchasing, purchaseHash, isPurchaseSuccess, purchaseError, musdBalance } = useMarketplace();
  const [purchasedProductId, setPurchasedProductId] = useState<string | null>(null);

  // Auto-close modal when purchase succeeds
  useEffect(() => {
    if (isPurchaseSuccess && purchasedProductId) {
      const timer = setTimeout(() => {
        onClose();
        setPurchasedProductId(null);
        toast.dismiss('purchase');
        toast.success('Purchase completed successfully!');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPurchaseSuccess, purchasedProductId, onClose]);

  if (!isOpen) return null;

  const handlePurchase = (product: Product) => {
    setPurchasedProductId(product.id);
    purchaseProduct(product.id, product.price);
  };

  const getCategoryColor = (category: Product['category']) => {
    switch (category) {
      case 'giftcard':
        return 'bg-purple-500/20 border-purple-400/30';
      case 'hardware':
        return 'bg-blue-500/20 border-blue-400/30';
      case 'mining':
        return 'bg-orange-500/20 border-orange-400/30';
      default:
        return 'bg-green-500/20 border-green-400/30';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 safe-area-inset"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[#2C2C2E]/90 backdrop-blur-xl p-5 sm:p-8 rounded-xl sm:rounded-3xl border border-green-400/20 w-full max-w-4xl mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-navbar text-white flex items-center gap-2">
              <span>🛒</span>
              Mezo Market
            </h2>
            <p className="text-sm text-white/60 font-navbar mt-1">Spend your borrowed MUSD on Bitcoin essentials</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-navbar text-white/60">Your MUSD Balance</p>
              <p className="text-2xl font-bold font-navbar text-green-400">{musdBalance} MUSD</p>
            </div>
            {parseFloat(musdBalance) === 0 && (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-navbar">Borrow MUSD to shop</span>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {MARKETPLACE_PRODUCTS.map((product) => {
            const isThisProductPurchasing = isPurchasing && purchasedProductId === product.id;
            const isThisProductSuccess = isPurchaseSuccess && purchasedProductId === product.id;
            const canPurchase = parseFloat(musdBalance) >= product.price && !isPurchasing;

            return (
              <div
                key={product.id}
                className={`p-5 rounded-xl border ${getCategoryColor(product.category)} transition-all ${
                  canPurchase ? 'hover:scale-105 cursor-pointer' : 'opacity-75'
                }`}
              >
                {/* Product Icon */}
                <div className="text-5xl mb-3 text-center">{product.icon}</div>

                {/* Product Info */}
                <h3 className="text-lg font-bold font-navbar text-white mb-2">{product.name}</h3>
                <p className="text-sm font-navbar text-white/70 mb-4 min-h-[3rem]">{product.description}</p>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-2xl font-bold font-navbar text-green-400">{product.priceInMUSD} MUSD</p>
                  <p className="text-xs font-navbar text-white/50">≈ ${product.price} USD</p>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={() => handlePurchase(product)}
                  disabled={!canPurchase || isPurchasing}
                  className={`w-full font-navbar ${
                    isThisProductSuccess
                      ? 'bg-green-500 hover:bg-green-600'
                      : canPurchase
                      ? 'bg-green-400 hover:bg-green-500'
                      : 'bg-gray-500/50 cursor-not-allowed'
                  }`}
                >
                  {isThisProductPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isThisProductSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Purchased!
                    </>
                  ) : parseFloat(musdBalance) < product.price ? (
                    'Insufficient Balance'
                  ) : (
                    'Buy Now'
                  )}
                </Button>

                {/* Error Message */}
                {purchaseError && purchasedProductId === product.id && (
                  <p className="text-xs text-red-400 mt-2 font-navbar">{purchaseError}</p>
                )}

                {/* Transaction Link */}
                {purchaseHash && purchasedProductId === product.id && (
                  <a
                    href={`https://explorer.test.mezo.org/tx/${purchaseHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-300 underline hover:text-green-200 mt-2 inline-block font-navbar"
                  >
                    View Transaction →
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-navbar text-white/50 text-center">
            All products are shipped within 5-7 business days. Payments are processed securely on-chain.
          </p>
        </div>
      </div>
    </div>
  );
}

