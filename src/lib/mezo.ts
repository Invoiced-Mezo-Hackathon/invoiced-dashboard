// Mezo Integration Library
// Based on Mezo's MUSD protocol for Bitcoin-backed stablecoin lending

// Import full ABI from compiled artifacts for better compatibility
import MezoVaultABI from '../../artifacts/contracts/MezoVaultContract.sol/MezoVaultContract.json';
import MUSDTokenABI from '../../artifacts/contracts/MUSDToken.sol/MUSDToken.json';
import InvoiceContractABI from '../../artifacts/contracts/InvoiceContract.sol/InvoiceContract.json';

export interface MezoVault {
  id: string;
  collateralAmount: string; // BTC amount
  borrowedAmount: string;   // MUSD amount
  collateralRatio: number;  // Must be >110%
  healthFactor: number;
  interestRate: number;     // 1-5% fixed
  liquidationPrice: number;
}

export interface MezoTransaction {
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw';
  amount: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Mezo Testnet Contract Addresses
// These are the actual deployed addresses on Mezo testnet
export const MEZO_CONTRACTS = {
  MUSD_TOKEN: '0x5987aA39B41E961c9683901BfF50f87C88C839a9', // MUSD Token (verified)
  BORROW_MANAGER: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  STABILITY_POOL: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  TROVE_MANAGER: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  MEZO_VAULT: '0xE4e18d7AED75FCB48ee20822B5880086DcA0724a', // Our custom vault contract - will be updated after deployment
  INVOICE_CONTRACT: '0x2992a9765D1c95684BB8167cA82970Bf69a94675', // Latest deployment on Mezo testnet
};

// Contract ABIs for Mezo integration - using full compiled ABI for better compatibility
export const MUSD_ABI = MUSDTokenABI.abi;

export const BORROW_MANAGER_ABI = MezoVaultABI.abi;

// Use full compiled ABI from artifact for InvoiceContract
export const INVOICE_CONTRACT_ABI = InvoiceContractABI.abi;

// Utility functions for Mezo integration
export class MezoUtils {
  static formatAmount(amount: bigint, decimals: number = 18): string {
    const divisor = BigInt(10 ** decimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === 0n) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
  }

  static parseAmount(amount: string, decimals: number = 18): bigint {
    const [whole, fractional = ''] = amount.split('.');
    const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFractional);
  }

  static calculateCollateralRatio(collateralValue: bigint, borrowedAmount: bigint): number {
    if (borrowedAmount === 0n) return 0;
    return Number((collateralValue * 10000n) / borrowedAmount) / 100; // Returns percentage with 2 decimal places
  }

  static calculateHealthFactor(collateralRatio: number): number {
    // Health factor is typically collateral ratio / minimum required ratio
    // For Mezo, minimum is 110%, so health factor = collateral ratio / 110
    return collateralRatio / 110;
  }

  static isHealthy(healthFactor: number): boolean {
    return healthFactor >= 1.0;
  }

  static getRiskLevel(healthFactor: number): 'safe' | 'warning' | 'danger' {
    if (healthFactor >= 1.5) return 'safe';
    if (healthFactor >= 1.2) return 'warning';
    return 'danger';
  }
}

// Error handling for Mezo operations
export class MezoError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MezoError';
  }
}

export const MEZO_ERRORS = {
  INSUFFICIENT_COLLATERAL: 'INSUFFICIENT_COLLATERAL',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  LIQUIDATION_RISK: 'LIQUIDATION_RISK',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;