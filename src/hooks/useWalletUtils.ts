import { useAccount } from 'wagmi';

export const useWalletUtils = () => {
  const { address, chainId, isConnected } = useAccount();

  const formatAddress = (address: string, length: number = 6) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string, chainId?: number) => {
    if (!address) return '';
    
    switch (chainId) {
      case 1:
        return `https://etherscan.io/address/${address}`;
      case 137:
        return `https://polygonscan.com/address/${address}`;
      case 56:
        return `https://bscscan.com/address/${address}`;
      case 31611: // Mezo Testnet
        return `https://explorer.test.mezo.org/address/${address}`;
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

  const isMezoTestnet = (chainId?: number) => {
    return chainId === 31611;
  };

  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 137:
        return 'Polygon';
      case 56:
        return 'BSC';
      case 31611:
        return 'Mezo Testnet';
      default:
        return 'Unknown Network';
    }
  };

  return {
    formatAddress,
    getExplorerUrl,
    copyToClipboard,
    isConnected,
    address,
    chainId,
    isMezoTestnet,
    getNetworkName,
  };
};
