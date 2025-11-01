export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Price in MUSD
  priceInMUSD: string; // Formatted price string
  icon: string;
  category: 'giftcard' | 'hardware' | 'mining';
  image?: string;
}

export interface MarketplaceState {
  isPurchasing: boolean;
  purchaseHash: string | null;
  isPurchaseSuccess: boolean;
  purchaseError: string | null;
}

// Marketplace products catalog
export const MARKETPLACE_PRODUCTS: Product[] = [
  {
    id: 'bitcoin-giftcard',
    name: 'Bitcoin Giftcard',
    description: '$250 Bitcoin giftcard redeemable at major retailers. Perfect for Bitcoin enthusiasts.',
    price: 250,
    priceInMUSD: '250.0',
    icon: '🎁',
    category: 'giftcard',
    image: 'https://plus.unsplash.com/premium_photo-1728613749980-cd3e758183df?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=995',
  },
  {
    id: 'ledger-nano',
    name: 'Ledger Nano X / S Plus',
    description: 'Hardware wallet for secure Bitcoin storage. Supports BTC, ETH, and 5,500+ coins.',
    price: 249,
    priceInMUSD: '249.0',
    icon: '🔐',
    category: 'hardware',
    image: 'https://images.unsplash.com/photo-1637597383944-d39bc455d5c0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=869',
  },
  {
    id: 'mining-hardware',
    name: 'Mining Hardware Pack',
    description: 'Complete mining setup: solar chargers, cooling fans, PSUs, and cables for Bitcoin miners.',
    price: 599,
    priceInMUSD: '599.0',
    icon: '⚡',
    category: 'mining',
    image: 'https://images.unsplash.com/photo-1634672350437-f9632adc9c3f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870',
  },
];

// Marketplace receiver address (for demo, using vault address)
// In production, this would be a proper marketplace contract
export const MARKETPLACE_RECEIVER = '0xE4e18d7AED75FCB48ee20822B5880086DcA0724a' as `0x${string}`; // Using vault address for demo

