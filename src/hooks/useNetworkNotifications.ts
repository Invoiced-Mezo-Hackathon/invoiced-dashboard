import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWalletUtils } from './useWalletUtils';
import { toast } from 'react-hot-toast';

export const useNetworkNotifications = () => {
  const { isConnected, chainId } = useAccount();
  const { isMezoTestnet, getNetworkName } = useWalletUtils();

  useEffect(() => {
    if (isConnected && chainId) {
      if (isMezoTestnet(chainId)) {
        toast.success(`Connected to ${getNetworkName(chainId)}! 🎉`, {
          duration: 3000,
          icon: '✅',
        });
      } else {
        toast.error(`Please switch to Mezo Testnet for full functionality`, {
          duration: 5000,
          icon: '⚠️',
        });
      }
    }
  }, [isConnected, chainId, isMezoTestnet, getNetworkName]);
};
