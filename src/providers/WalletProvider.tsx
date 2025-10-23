import { createContext, useContext, useState, useEffect } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { mainnet } from 'wagmi/chains';
import { mezoMainnet, mezoTestnet } from '../config/chains';
import BitcoinWalletService, { BitcoinWallet } from '../services/BitcoinWalletService';

// Configure Ethereum chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mezoMainnet, mezoTestnet, mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Create context for Bitcoin wallet
interface BitcoinWalletContextType {
  bitcoinWallet: BitcoinWallet | null;
  connectBitcoin: () => Promise<void>;
  disconnectBitcoin: () => Promise<void>;
  isBitcoinConnected: boolean;
}

const BitcoinWalletContext = createContext<BitcoinWalletContextType>({
  bitcoinWallet: null,
  connectBitcoin: async () => {},
  disconnectBitcoin: async () => {},
  isBitcoinConnected: false,
});

export const useBitcoinWallet = () => useContext(BitcoinWalletContext);

function BitcoinWalletProvider({ children }: { children: React.ReactNode }) {
  const [bitcoinWallet, setBitcoinWallet] = useState<BitcoinWallet | null>(null);
  const bitcoinService = BitcoinWalletService.getInstance();

  const connectBitcoin = async () => {
    try {
      const wallet = await bitcoinService.connectWallet();
      setBitcoinWallet(wallet);
    } catch (error) {
      console.error('Failed to connect Bitcoin wallet:', error);
      throw error;
    }
  };

  const disconnectBitcoin = async () => {
    await bitcoinService.disconnect();
    setBitcoinWallet(null);
  };

  useEffect(() => {
    // Check if Bitcoin wallet is already connected
    const currentWallet = bitcoinService.getCurrentWallet();
    if (currentWallet) {
      setBitcoinWallet(currentWallet);
    }
  }, []);

  return (
    <BitcoinWalletContext.Provider
      value={{
        bitcoinWallet,
        connectBitcoin,
        disconnectBitcoin,
        isBitcoinConnected: bitcoinService.isConnected(),
      }}
    >
      {children}
    </BitcoinWalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <BitcoinWalletProvider>
        {children}
      </BitcoinWalletProvider>
    </WagmiConfig>
  );
}
