// Hook to check contract versions and reset MATS if contracts changed
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { hasContractsChanged, updateDeploymentVersion } from '@/services/contract-version';
import { matsRewards } from '@/services/mats-rewards';
import toast from 'react-hot-toast';

/**
 * Hook that checks if contracts have been redeployed and resets MATS if needed
 */
export function useContractVersionCheck() {
  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;

    // Check if contracts have changed
    const contractsChanged = hasContractsChanged();

    if (contractsChanged) {
      console.log('🔄 Contracts have been redeployed. Resetting MATS rewards...');
      
      // Clear MATS rewards for this address
      const currentMats = matsRewards.getTotalMats(address);
      
      if (currentMats > 0) {
        matsRewards.clearRewards(address);
        console.log(`✅ Cleared ${currentMats} MATS rewards due to contract redeployment`);
        
        toast.success(
          `Contracts redeployed! MATS reset to 0 (was ${currentMats.toLocaleString()} MATS)`,
          {
            duration: 5000,
            icon: '🔄',
          }
        );
      }

      // Also clear transactions related to old contracts (only for this user)
      const transactionKey = `boar_transactions_${address.toLowerCase()}`;
      try {
        localStorage.removeItem(transactionKey);
        console.log('✅ Cleared transactions for this wallet due to contract redeployment');
      } catch (error) {
        console.error('Failed to clear transactions:', error);
      }

      // Update stored version to current contracts
      updateDeploymentVersion();
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('storage_reset'));
      
      console.log('✅ Contract version updated');
    } else {
      // Contracts haven't changed, just ensure version is stored
      updateDeploymentVersion();
    }
  }, [address]);
}

