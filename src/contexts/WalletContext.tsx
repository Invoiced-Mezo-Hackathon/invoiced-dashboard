import { createContext, useContext, ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

interface WalletContextType {
  address: string | undefined
  isConnected: boolean
  balance: string | undefined
  isLoading: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] })
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        balance: undefined, // You can add balance fetching logic here
        isLoading: isPending,
        connect: handleConnect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}