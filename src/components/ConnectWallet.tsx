import { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { WalletModal } from './WalletModal'
import { useToast } from './ui/use-toast'
import { mezoTestnet } from '../config/chains'
import { useBitcoinWallet } from '../providers/WalletProvider'
import { useProfileStore } from '../store/useProfileStore'

export function ConnectWallet() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect: disconnectEth } = useDisconnect()
  const { toast } = useToast()
  const { bitcoinWallet, disconnectBitcoin } = useBitcoinWallet()
  const { activeWallet } = useProfileStore()

  const addMezoNetwork = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension",
        variant: "destructive",
      })
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${mezoTestnet.id.toString(16)}`,
          chainName: mezoTestnet.name,
          nativeCurrency: mezoTestnet.nativeCurrency,
          rpcUrls: mezoTestnet.rpcUrls.default.http,
          blockExplorerUrls: [mezoTestnet.blockExplorers.default.url],
        }],
      })
      
      toast({
        title: "Network Added",
        description: "Mezo Testnet has been added to your wallet",
      })
    } catch (error: any) {
      toast({
        title: "Error adding network",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {activeWallet ? (
          <>
            <div className="bg-secondary/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <p className="text-sm mb-2">Connected {activeWallet.type === 'ethereum' ? 'Ethereum' : 'Bitcoin'} Wallet</p>
              <p className="text-xs font-mono bg-secondary p-1 rounded">
                {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}
              </p>
              <p className="text-xs mt-2">
                Balance: {parseFloat(activeWallet.balance).toFixed(4)} {activeWallet.type === 'ethereum' ? 'ETH' : 'BTC'}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                if (activeWallet.type === 'ethereum') {
                  disconnectEth();
                } else {
                  disconnectBitcoin();
                }
              }}
              className="w-full"
            >
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Connect Wallet
            </Button>
            <Button 
              variant="outline" 
              onClick={addMezoNetwork}
              className="w-full"
            >
              Add Mezo Network
            </Button>
          </>
        )}
      </div>

      <WalletModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  )
}