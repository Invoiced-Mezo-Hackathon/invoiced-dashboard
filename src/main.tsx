import React from 'react'
import ReactDOM from 'react-dom/client'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { getConfig } from '@mezo-org/passport'
import { WalletProvider } from './contexts/WalletContext'
import App from './App.tsx'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// Configure Mezo Passport for Mezo Testnet (Chain ID: 31611)
const mezoConfig = getConfig({ 
  appName: 'Invoiced Dashboard',
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={mezoConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={31611}>
          <WalletProvider>
            <App />
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
