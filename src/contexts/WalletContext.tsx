import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const checkMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      return window.ethereum;
    }
    return null;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const ethereum = await checkMetaMask();
      
      if (!ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get current chain ID
        const currentChainId = await ethereum.request({
          method: 'eth_chainId',
        });
        setChainId(currentChainId);

        // Listen for account changes
        ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
          } else {
            disconnectWallet();
          }
        });

        // Listen for chain changes
        ethereum.on('chainChanged', (newChainId: string) => {
          setChainId(newChainId);
          window.location.reload(); // Reload to ensure proper state
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  // Switch network
  const switchNetwork = async (targetChainId: string) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetChainId,
              chainName: 'Mezo Network', // Replace with your network name
              rpcUrls: ['https://rpc.mezo.xyz'], // Replace with your RPC URL
              nativeCurrency: {
                name: 'MUSD',
                symbol: 'MUSD',
                decimals: 18,
              },
            }],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = await checkMetaMask();
      if (ethereum) {
        try {
          const accounts = await ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            const currentChainId = await ethereum.request({
              method: 'eth_chainId',
            });
            setChainId(currentChainId);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  const value: WalletContextType = {
    isConnected,
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isLoading,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
