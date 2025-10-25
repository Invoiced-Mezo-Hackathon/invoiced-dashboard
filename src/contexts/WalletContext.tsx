import { createContext, useContext, ReactNode } from 'react'
import { useAccount, useBalance } from 'wagmi'

interface WalletContextType {
  address: string | undefined
  isConnected: boolean
  balance: string | undefined
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: balance, isLoading } = useBalance({
    address: address,
  })

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        balance: balance?.formatted,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
