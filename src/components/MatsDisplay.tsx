import { useAccount } from 'wagmi';
import { matsRewards } from '@/services/mats-rewards';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface MatsDisplayProps {
  compact?: boolean;
  showBreakdown?: boolean;
}

export function MatsDisplay({ compact = false, showBreakdown = false }: MatsDisplayProps) {
  const { address } = useAccount();
  const [totalMats, setTotalMats] = useState(0);
  const [vaultMats, setVaultMats] = useState(0);
  const [marketMats, setMarketMats] = useState(0);

  useEffect(() => {
    if (!address) {
      setTotalMats(0);
      setVaultMats(0);
      setMarketMats(0);
      return;
    }

    const updateMats = () => {
      const total = matsRewards.getTotalMats(address);
      const vault = matsRewards.getRewardsBySource(address, 'vault').reduce((sum, r) => sum + r.amount, 0);
      const market = matsRewards.getRewardsBySource(address, 'marketplace').reduce((sum, r) => sum + r.amount, 0);
      
      setTotalMats(total);
      setVaultMats(vault);
      setMarketMats(market);
    };

    updateMats();
    
    // Listen for storage changes (when MATS are reset)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('mats_rewards_')) {
        updateMats();
      }
    };
    
    // Listen for custom reset event
    const handleReset = () => {
      updateMats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_reset', handleReset);
    
    // Refresh every 2 seconds to catch new rewards
    const interval = setInterval(updateMats, 2000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_reset', handleReset);
    };
  }, [address]);

  if (!address) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30">
        <Sparkles className="w-4 h-4 text-purple-300" />
        <span className="text-xs font-navbar text-purple-300">
          {totalMats.toLocaleString()} MATS
        </span>
      </div>
    );
  }

  return (
    <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-300" />
          <h3 className="text-sm font-navbar text-purple-300">MATS Rewards</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-navbar text-purple-200">{totalMats.toLocaleString()}</p>
          <p className="text-xs font-navbar text-purple-300/70">Total Earned</p>
        </div>
      </div>
      
      {showBreakdown && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-purple-400/20">
          <div>
            <p className="text-xs font-navbar text-purple-300/70">From Vault</p>
            <p className="text-lg font-bold font-navbar text-purple-200">{vaultMats.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-navbar text-purple-300/70">From Market</p>
            <p className="text-lg font-bold font-navbar text-purple-200">{marketMats.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

