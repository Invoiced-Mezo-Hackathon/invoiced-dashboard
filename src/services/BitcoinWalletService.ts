import * as bitcoin from 'bitcoinjs-lib';
import { initEccLib } from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import { mempoolJS } from '@mempool/mempool.js';

// Initialize the Bitcoin library with the required elliptic curve implementation
initEccLib(ecc);

// Initialize mempool client for Bitcoin network interaction
const { bitcoin: mempoolClient } = mempoolJS({
  hostname: 'mempool.space'
});

export interface BitcoinWallet {
  address: string;
  publicKey: string;
  network: 'mainnet' | 'testnet';
  balance: number;
}

class BitcoinWalletService {
  private static instance: BitcoinWalletService;
  private currentWallet: BitcoinWallet | null = null;

  private constructor() {}

  static getInstance(): BitcoinWalletService {
    if (!BitcoinWalletService.instance) {
      BitcoinWalletService.instance = new BitcoinWalletService();
    }
    return BitcoinWalletService.instance;
  }

  private checkWalletProvider(): void {
    if (typeof window === 'undefined') {
      throw new Error('Window object not available. Are you running in a browser environment?');
    }

    if (typeof window.btc === 'undefined') {
      throw new Error('No Bitcoin wallet found. Please install a compatible Bitcoin wallet.');
    }

    if (typeof window.btc.request !== 'function' || typeof window.btc.connect !== 'function') {
      throw new Error('Incompatible Bitcoin wallet. Please install a supported wallet.');
    }
  }

  async connectWallet(): Promise<BitcoinWallet | null> {
    try {
      this.checkWalletProvider();

      // First try to connect
      await window.btc.connect();

      // Then get addresses
      const accounts = await window.btc.getAddresses();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No Bitcoin accounts found. Please make sure your wallet is unlocked and has at least one account.');
      }

      const address = accounts[0];
      
      // Get network type
      const network = await window.btc.getNetwork();
      
      // Get balance
      const balance = await this.getBalance(address);

      this.currentWallet = {
        address,
        publicKey: address,
        network: network === 'testnet' ? 'testnet' : 'mainnet',
        balance
      };

      return this.currentWallet;
    } catch (error: any) {
      console.error('Error connecting Bitcoin wallet:', error);
      
      // Provide more user-friendly error messages
      if (error.message.includes('User rejected')) {
        throw new Error('Connection rejected. Please approve the connection request in your wallet.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Connection timed out. Please try again.');
      }
      
      throw error;
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const addressInfo = await mempoolClient.addresses.getAddress({ address });
      // Convert satoshis to BTC
      return addressInfo.chain_stats.funded_txo_sum / 100000000;
    } catch (error) {
      console.error('Error fetching Bitcoin balance:', error);
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    this.currentWallet = null;
  }

  getCurrentWallet(): BitcoinWallet | null {
    return this.currentWallet;
  }

  isConnected(): boolean {
    return this.currentWallet !== null;
  }
}

export default BitcoinWalletService;
