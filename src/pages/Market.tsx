import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { MEZO_CONTRACTS, MUSD_ABI, MezoUtils } from '@/lib/mezo';
import { MARKETPLACE_PRODUCTS, Product } from '@/types/market';
import { useMarketplace } from '@/hooks/useMarketplace';
import { matsRewards } from '@/services/mats-rewards';
import { MatsDisplay } from '@/components/MatsDisplay';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, ShoppingBag, Sparkles, Zap, Gift, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function Market() {
  const { address, isConnected } = useAccount();
  const { purchaseProduct, isPurchasing, purchaseHash, isPurchaseSuccess, purchaseError, musdBalance } = useMarketplace();
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);

  // Read MUSD balance
  const { 
    data: musdBalanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance
  } = useReadContract({
    address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
    abi: MUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const formattedBalance = musdBalanceData ? MezoUtils.formatAmount(musdBalanceData as bigint) : '0';

  // Refetch balance after purchase
  useEffect(() => {
    if (isPurchaseSuccess && purchaseHash) {
      refetchBalance();
      // Add MATS reward and send notification
      if (purchasingProductId && address) {
        const product = MARKETPLACE_PRODUCTS.find(p => p.id === purchasingProductId);
        if (product) {
          const matsEarned = matsRewards.calculateMarketplaceRewards(product.id, product.price);
          matsRewards.addReward(address, {
            amount: matsEarned,
            source: 'marketplace',
            action: 'purchase',
            description: `Purchased ${product.name}`,
            metadata: {
              productId: product.id,
              amount: product.priceInMUSD,
            },
          });
          if (matsEarned > 0) {
            toast.success(`🎉 Earned ${matsEarned} MATS!`, { duration: 3000 });
          }
          
          // Send notification with MATS earned
          try {
            window.dispatchEvent(new CustomEvent('notify', {
              detail: {
                title: 'Purchase Successful',
                message: matsEarned > 0 ? `Bought ${product.name} • +${matsEarned} MATS` : `Bought ${product.name}`,
                key: `purchase-${purchasingProductId}-${Date.now()}`,
              }
            }));
          } catch {}
        }
      }
      setPurchasingProductId(null);
    }
  }, [isPurchaseSuccess, purchaseHash, purchasingProductId, address, refetchBalance]);

  const handlePurchase = (product: Product) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }
    setPurchasingProductId(product.id);
    purchaseProduct(product.id, product.price);
  };

  const getCategoryGradient = (category: Product['category']) => {
    switch (category) {
      case 'giftcard':
        return {
          card: 'from-purple-500/30 via-purple-500/20 to-purple-600/10 border-purple-400/40',
          header: 'from-purple-600/40 via-purple-500/30 to-pink-500/20',
          accent: 'text-purple-300',
          icon: 'text-purple-400',
        };
      case 'hardware':
        return {
          card: 'from-blue-500/30 via-blue-500/20 to-cyan-500/10 border-blue-400/40',
          header: 'from-blue-600/40 via-blue-500/30 to-cyan-500/20',
          accent: 'text-blue-300',
          icon: 'text-blue-400',
        };
      case 'mining':
        return {
          card: 'from-orange-500/30 via-orange-500/20 to-red-500/10 border-orange-400/40',
          header: 'from-orange-600/40 via-orange-500/30 to-red-500/20',
          accent: 'text-orange-300',
          icon: 'text-orange-400',
        };
      default:
        return {
          card: 'from-green-500/30 via-green-500/20 to-emerald-500/10 border-green-400/40',
          header: 'from-green-600/40 via-green-500/30 to-emerald-500/20',
          accent: 'text-green-300',
          icon: 'text-green-400',
        };
    }
  };

  const getCategoryIcon = (category: Product['category']) => {
    switch (category) {
      case 'giftcard':
        return <Gift className="w-5 h-5" />;
      case 'hardware':
        return <Shield className="w-5 h-5" />;
      case 'mining':
        return <Zap className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-navbar text-white flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              Mezo Market
            </h1>
            <p className="text-sm font-navbar text-white/60">Premium Bitcoin essentials powered by MUSD</p>
          </div>
          <MatsDisplay compact />
        </div>
      </div>

      {/* MUSD Balance - Compact */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <span className="text-sm font-navbar text-white/60">Balance:</span>
          <span className="text-lg font-bold font-navbar text-green-400">
            {isBalanceLoading ? 'Loading...' : `${formattedBalance} MUSD`}
          </span>
        </div>
        {parseFloat(formattedBalance) === 0 && (
          <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-navbar bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Borrow from Vault</span>
          </div>
        )}
      </div>

      {/* Products Grid - Creative Design */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {MARKETPLACE_PRODUCTS.map((product) => {
            const isPurchasingThis = isPurchasing && purchasingProductId === product.id;
            const justPurchased = isPurchaseSuccess && purchasingProductId === product.id;
            const canPurchase = parseFloat(musdBalance) >= product.price && !isPurchasing;
            const matsEarned = matsRewards.calculateMarketplaceRewards(product.id, product.price);
            const gradient = getCategoryGradient(product.category);

            return (
              <div
                key={product.id}
                className={`relative group bg-gradient-to-br ${gradient.card} backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  !canPurchase && !justPurchased ? 'opacity-75' : ''
                }`}
              >
                {/* Creative Header with Image */}
                <div className={`relative h-32 bg-gradient-to-br ${gradient.header} overflow-hidden`}>
                  {/* Product Image */}
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Dark Overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
                  
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }} />
                  </div>

                  {/* Floating Decorative Elements */}
                  <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                    <span className="text-lg opacity-60">{product.icon}</span>
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-500">
                    <span className="text-base opacity-40">{product.icon}</span>
                  </div>

                  {/* Category Badge */}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/30 ${gradient.accent}`}>
                    {getCategoryIcon(product.category)}
                    <span className="text-[10px] font-navbar font-semibold capitalize">{product.category}</span>
                  </div>

                  {/* MATS Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/90 backdrop-blur-md px-2 py-1 rounded-md border border-purple-400/40 shadow-lg">
                    <Sparkles className="w-3 h-3 text-purple-100" />
                    <span className="text-[10px] font-navbar font-bold text-white">{matsEarned} MATS</span>
                  </div>

                  {/* Bottom Gradient Fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold font-navbar text-white mb-1.5">{product.name}</h3>
                    <p className="text-xs font-navbar text-white/70 leading-relaxed line-clamp-2">{product.description}</p>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-navbar text-green-400">{product.priceInMUSD}</span>
                        <span className="text-xs font-navbar text-white/50">MUSD</span>
                      </div>
                    </div>
                    <div className={`text-2xl ${gradient.icon} opacity-30`}>
                      {product.icon}
                    </div>
                  </div>

                  {/* Buy Button */}
                  <Button
                    onClick={() => handlePurchase(product)}
                    disabled={!canPurchase || isPurchasing}
                    className={`w-full font-navbar h-10 text-sm font-semibold ${
                      justPurchased
                        ? 'bg-green-500 hover:bg-green-600'
                        : canPurchase
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/30'
                        : 'bg-gray-500/50 cursor-not-allowed'
                    }`}
                  >
                    {isPurchasingThis ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : justPurchased ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Purchased!
                      </>
                    ) : parseFloat(musdBalance) < product.price ? (
                      'Insufficient Balance'
                    ) : (
                      'Buy Now'
                    )}
                  </Button>

                  {/* Error Message */}
                  {purchaseError && purchasingProductId === product.id && (
                    <p className="text-xs text-red-400 mt-2 font-navbar text-center">{purchaseError}</p>
                  )}

                  {/* Transaction Link */}
                  {purchaseHash && purchasingProductId === product.id && (
                    <a
                      href={`https://explorer.test.mezo.org/tx/${purchaseHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-300 underline hover:text-green-200 text-center block mt-2 font-navbar"
                    >
                      View Transaction →
                    </a>
                  )}
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-[#2C2C2E]/60 to-[#2C2C2E]/40 backdrop-blur-xl p-6 rounded-2xl border border-green-400/20">
          <h3 className="text-lg font-bold font-navbar text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-300" />
            Why Shop with MUSD?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-navbar text-white/70">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <p className="font-semibold text-white/90 mb-1">On-Chain Security</p>
                <p className="text-xs">All purchases processed securely on the blockchain</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 text-xl">🎁</span>
              <div>
                <p className="font-semibold text-white/90 mb-1">Earn MATS Rewards</p>
                <p className="text-xs">Get rewarded with MATS points on every purchase</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-xl">⚡</span>
              <div>
                <p className="font-semibold text-white/90 mb-1">Fast Delivery</p>
                <p className="text-xs">Products ship within 5-7 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">🔒</span>
              <div>
                <p className="font-semibold text-white/90 mb-1">Transparent</p>
                <p className="text-xs">Track every transaction on the blockchain explorer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
