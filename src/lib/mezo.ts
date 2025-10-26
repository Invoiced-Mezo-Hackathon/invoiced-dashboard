// Mezo Integration Library
// Based on Mezo's MUSD protocol for Bitcoin-backed stablecoin lending

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
  MUSD_TOKEN: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503', // MUSD Token (verified)
  BORROW_MANAGER: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  STABILITY_POOL: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  TROVE_MANAGER: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  MEZO_VAULT: '0x1234567890123456789012345678901234567890', // Our custom vault contract - will be updated after deployment
};

// Contract ABIs for Mezo integration
export const MUSD_ABI = [
  // ERC20 standard functions
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  // MUSD specific functions
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

export const BORROW_MANAGER_ABI = [
  // Borrowing functions
  "function depositCollateral(uint256 amount)",
  "function borrowMUSD(uint256 amount)",
  "function repayMUSD(uint256 amount)",
  "function withdrawCollateral(uint256 amount)",
  // View functions
  "function getCollateralRatio(address user) view returns (uint256)",
  "function getHealthFactor(address user) view returns (uint256)",
  "function getCollateralBalance(address user) view returns (uint256)",
  "function getBorrowedAmount(address user) view returns (uint256)",
  "function getInterestRate() view returns (uint256)",
  "function getLiquidationPrice(address user) view returns (uint256)",
  // Events
  "event CollateralDeposited(address indexed user, uint256 amount)",
  "event MUSDBorrowed(address indexed user, uint256 amount)",
  "event MUSDRepaid(address indexed user, uint256 amount)",
  "event CollateralWithdrawn(address indexed user, uint256 amount)",
] as const;

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
    public details?: any
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