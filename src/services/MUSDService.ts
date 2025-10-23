import { createPublicClient, http, createWalletClient, custom, parseEther, formatEther } from 'viem'
import { mainnet } from 'viem/chains'
import { MUSD_ABI, MUSD_CONTRACT_ADDRESS } from '../contracts/MUSD'

class MUSDService {
  private static instance: MUSDService
  private publicClient
  private walletClient

  private constructor() {
    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http()
    })

    // Initialize wallet client with window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      this.walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      })
    }
  }

  static getInstance(): MUSDService {
    if (!MUSDService.instance) {
      MUSDService.instance = new MUSDService()
    }
    return MUSDService.instance
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.publicClient.readContract({
        address: MUSD_CONTRACT_ADDRESS,
        abi: MUSD_ABI,
        functionName: 'balanceOf',
        args: [address]
      })

      return formatEther(balance)
    } catch (error) {
      console.error('Error fetching MUSD balance:', error)
      throw error
    }
  }

  async transfer(to: string, amount: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      const [account] = await this.walletClient.getAddresses()
      
      const hash = await this.walletClient.writeContract({
        address: MUSD_CONTRACT_ADDRESS,
        abi: MUSD_ABI,
        functionName: 'transfer',
        args: [to, parseEther(amount)]
      })

      return hash
    } catch (error) {
      console.error('Error transferring MUSD:', error)
      throw error
    }
  }

  async approve(spender: string, amount: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: MUSD_CONTRACT_ADDRESS,
        abi: MUSD_ABI,
        functionName: 'approve',
        args: [spender, parseEther(amount)]
      })

      return hash
    } catch (error) {
      console.error('Error approving MUSD:', error)
      throw error
    }
  }

  async getAllowance(owner: string, spender: string): Promise<string> {
    try {
      const allowance = await this.publicClient.readContract({
        address: MUSD_CONTRACT_ADDRESS,
        abi: MUSD_ABI,
        functionName: 'allowance',
        args: [owner, spender]
      })

      return formatEther(allowance)
    } catch (error) {
      console.error('Error fetching MUSD allowance:', error)
      throw error
    }
  }
}

export default MUSDService
