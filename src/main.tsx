import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { WalletProvider } from './contexts/WalletContext'
import App from './App.tsx'
import './index.css'

// Configure RainbowKit
const config = getDefaultConfig({
  appName: 'Invoiced Dashboard',
  projectId: '0978b2a5b70fad28244046b25a0a1f50',
  chains: [mainnet, polygon, optimism, arbitrum, base],
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletProvider>
            <App />
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
