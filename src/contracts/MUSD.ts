import { Address } from 'viem'

export const MUSD_ABI = [
  // ERC20 Standard Interface
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',
  
  // MUSD Specific Functions
  'function mint(uint256 amount) returns (bool)',
  'function burn(uint256 amount) returns (bool)',
  'function redeem(uint256 amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event Mint(address indexed to, uint256 amount)',
  'event Burn(address indexed from, uint256 amount)',
  'event Redeem(address indexed from, uint256 amount)'
] as const

// Mezo Network MUSD Contract Addresses
export const MUSD_CONTRACT_ADDRESSES = {
  mainnet: '0x2880aB155794e7179c9eE2e38200202908C17B43' as Address,
  testnet: '0x2880aB155794e7179c9eE2e38200202908C17B43' as Address
}

export interface MUSD {
  address: Address
  abi: typeof MUSD_ABI
  name: string
  symbol: string
  decimals: number
}

export const MUSD_CONFIG: MUSD = {
  address: MUSD_CONTRACT_ADDRESS,
  abi: MUSD_ABI,
  name: 'Mezo USD',
  symbol: 'MUSD',
  decimals: 18
}
