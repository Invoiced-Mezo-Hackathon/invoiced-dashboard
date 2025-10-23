import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WalletProfile {
  address: string
  chainId: number
  type: 'ethereum' | 'bitcoin'
  balance: string
  transactions: Array<{
    hash: string
    amount: string
    timestamp: number
    type: 'sent' | 'received'
  }>
  connectedAt: number
}

interface ProfileState {
  activeWallet: WalletProfile | null
  setActiveWallet: (wallet: WalletProfile | null) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      activeWallet: null,
      setActiveWallet: (wallet) => set({ activeWallet: wallet }),
      clearProfile: () => set({ activeWallet: null }),
    }),
    {
      name: 'profile-storage',
    }
  )
)
