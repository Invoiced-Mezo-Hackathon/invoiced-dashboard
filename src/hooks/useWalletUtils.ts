import { useWallet } from '@/contexts/WalletContext';

export const useWalletUtils = () => {
  const { account, chainId } = useWallet();

  const formatAddress = (address: string, length: number = 6) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string, chainId?: string) => {
    if (!address) return '';
    
    switch (chainId) {
      case '0x1':
        return `https://etherscan.io/address/${address}`;
      case '0x89':
        return `https://polygonscan.com/address/${address}`;
      case '0x38':
        return `https://bscscan.com/address/${address}`;
      default:
        return `https://etherscan.io/address/${address}`;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  return {
    formatAddress,
    getExplorerUrl,
    copyToClipboard,
    isConnected: !!account,
    account,
    chainId,
  };
};
