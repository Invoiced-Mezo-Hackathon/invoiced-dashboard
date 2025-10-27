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
  MUSD_TOKEN: '0x7654b902c802438D55dd8C242e7d8535506D89BD', // MUSD Token (verified)
  BORROW_MANAGER: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  STABILITY_POOL: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  TROVE_MANAGER: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated after deployment
  MEZO_VAULT: '0x773530c39Ff8B8DD8ad961086EA9E9DBB9B84BfF', // Our custom vault contract - deployed ✅
  INVOICE_CONTRACT: '0xEAB6C13EFCFaD2e40EA72F66d1AAA6058B7DDEE9', // Invoice contract - deployed ✅
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

export const INVOICE_CONTRACT_ABI = [
  // Invoice management functions
  "function createInvoice(address _recipient, uint256 _amount, string memory _description, string memory _bitcoinAddress, string memory _clientName, string memory _clientCode) returns (uint256)",
  "function confirmPayment(uint256 _id)",
  "function cancelInvoice(uint256 _id)",
  // View functions
  "function getInvoice(uint256 _id) view returns (tuple(uint256 id, address creator, address recipient, uint256 amount, string description, string bitcoinAddress, string clientName, string clientCode, bool paid, bool cancelled, uint256 createdAt, uint256 paidAt))",
  "function getUserInvoices(address _user) view returns (uint256[])",
  "function getPaidInvoices(address _user) view returns (uint256[])",
  "function getPendingInvoices(address _user) view returns (uint256[])",
  "function getTotalRevenue(address _user) view returns (uint256)",
  "function getPendingAmount(address _user) view returns (uint256)",
  "function getUserInvoiceCount(address _user) view returns (uint256)",
  "function getAllInvoices() view returns (tuple(uint256 id, address creator, address recipient, uint256 amount, string description, string bitcoinAddress, string clientName, string clientCode, bool paid, bool cancelled, uint256 createdAt, uint256 paidAt)[])",
  "function getInvoicesByStatus(bool includePaid, bool includeCancelled) view returns (uint256[])",
  "function invoiceCount() view returns (uint256)",
  // Events
  "event InvoiceCreated(uint256 indexed id, address indexed creator, address indexed recipient, uint256 amount, string bitcoinAddress, string clientName)",
  "event InvoicePaid(uint256 indexed id, uint256 amount, uint256 timestamp)",
  "event InvoiceCancelled(uint256 indexed id, uint256 timestamp)",
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