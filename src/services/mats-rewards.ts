// MATS Rewards Service
// Tracks accumulated MATS (points) from vault and marketplace activities

interface MatsReward {
  id: string;
  amount: number; // MATS earned
  source: 'vault' | 'marketplace';
  action: 'deposit' | 'borrow' | 'repay' | 'withdraw' | 'purchase';
  description: string;
  timestamp: number;
  metadata?: {
    amount?: string; // Transaction amount
    productId?: string; // For purchases
  };
}

class MatsRewardsService {
  private getStorageKey(address: string): string {
    return `mats_rewards_${address.toLowerCase()}`;
  }

  // Get all rewards for a user
  getRewards(address: string): MatsReward[] {
    if (!address) return [];
    try {
      const stored = localStorage.getItem(this.getStorageKey(address));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get total MATS accumulated
  getTotalMats(address: string): number {
    const rewards = this.getRewards(address);
    return rewards.reduce((total, reward) => total + reward.amount, 0);
  }

  // Add a reward
  addReward(address: string, reward: Omit<MatsReward, 'id' | 'timestamp'>): void {
    if (!address) return;
    
    const rewards = this.getRewards(address);
    const newReward: MatsReward = {
      ...reward,
      id: `mats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    rewards.push(newReward);
    localStorage.setItem(this.getStorageKey(address), JSON.stringify(rewards));
  }

  // Calculate vault rewards
  calculateVaultRewards(action: 'deposit' | 'borrow' | 'repay' | 'withdraw', amount: string): number {
    const amountNum = parseFloat(amount || '0');
    
    switch (action) {
      case 'deposit':
        // 1 MATS per 0.001 BTC deposited (1000 MATS per 1 BTC)
        return Math.floor(amountNum * 1000);
      case 'borrow':
        // 0.5 MATS per 1 MUSD borrowed (500 MATS per 1000 MUSD)
        return Math.floor(amountNum * 0.5);
      case 'repay':
        // 0.3 MATS per 1 MUSD repaid
        return Math.floor(amountNum * 0.3);
      case 'withdraw':
        // 0.8 MATS per 0.001 BTC withdrawn
        return Math.floor(amountNum * 800);
      default:
        return 0;
    }
  }

  // Calculate marketplace rewards by product
  calculateMarketplaceRewards(productId: string, price: number): number {
    // Different rewards for different products
    switch (productId) {
      case 'bitcoin-giftcard':
        return 100; // 100 MATS for giftcard
      case 'ledger-nano':
        return 300; // 300 MATS for hardware wallet
      case 'mining-hardware':
        return 500; // 500 MATS for mining pack
      default:
        // Base reward: 1 MATS per 1 MUSD spent
        return Math.floor(price);
    }
  }

  // Get rewards by source
  getRewardsBySource(address: string, source: 'vault' | 'marketplace'): MatsReward[] {
    return this.getRewards(address).filter(r => r.source === source);
  }

  // Clear all rewards (for testing/reset)
  clearRewards(address: string): void {
    if (!address) return;
    localStorage.removeItem(this.getStorageKey(address));
  }
}

export const matsRewards = new MatsRewardsService();

