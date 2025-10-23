import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { useConnect, useAccount, useBalance } from "wagmi"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { useToast } from "./ui/use-toast"
import { useProfileStore, WalletProfile } from "../store/useProfileStore"
import { formatEther } from "viem"
import { useBitcoinWallet } from "../providers/WalletProvider"

interface WalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { connect } = useConnect()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { setActiveWallet } = useProfileStore()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null)

  const updateProfile = async (type: 'ethereum' | 'bitcoin') => {
    if (isConnected && address && balance) {
      const walletProfile: WalletProfile = {
        address,
        chainId: 1, // This should be dynamic based on the connected chain
        type,
        balance: formatEther(balance.value),
        transactions: [], // This should be populated from an API or blockchain
        connectedAt: Date.now(),
      }
      setActiveWallet(walletProfile)
    }
  }

  const handleEthereumConnect = async () => {
    try {
      setIsConnecting('ethereum')
      if (!window.ethereum) {
        window.open('https://metamask.io/download/', '_blank')
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to connect with Ethereum",
          variant: "destructive",
        })
        return
      }

      // Check if on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x1') { // Mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            toast({
              title: "Network Error",
              description: "Please add Ethereum Mainnet to your wallet",
              variant: "destructive",
            });
          }
          throw switchError;
        }
      }

      await connect({ connector: new MetaMaskConnector() })
      await updateProfile('ethereum')
      toast({
        title: "Connected",
        description: "Successfully connected to Ethereum wallet",
      })
      onOpenChange(false)
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Handle common MetaMask errors
      if (error.code === 4001) {
        errorMessage = "Connection rejected. Please approve the connection request.";
      } else if (error.code === -32002) {
        errorMessage = "Please check MetaMask. A connection request is pending.";
      } else if (error.code === 4902) {
        errorMessage = "Network not available. Please add the network to your wallet.";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(null)
    }
  }

  const { connectBitcoin, bitcoinWallet } = useBitcoinWallet()

  const handleBitcoinConnect = async () => {
    try {
      setIsConnecting('bitcoin')
      await connectBitcoin()
      
      if (bitcoinWallet) {
        const walletProfile: WalletProfile = {
          address: bitcoinWallet.address,
          chainId: 1, // Bitcoin mainnet
          type: 'bitcoin',
          balance: bitcoinWallet.balance.toString(),
          transactions: [], // This will be populated from mempool.space API
          connectedAt: Date.now(),
        }
        setActiveWallet(walletProfile)
        toast({
          title: "Connected",
          description: "Successfully connected to Bitcoin wallet",
        })
        onOpenChange(false)
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Bitcoin wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Ethereum Wallets</h3>
              <Button
                onClick={handleEthereumConnect}
                disabled={isConnecting !== null}
                className="w-full h-14 text-lg relative bg-[#F6851B] hover:bg-[#E2761B] text-white"
              >
                {isConnecting === 'ethereum' ? (
                  <div className="animate-pulse">Connecting...</div>
                ) : (
                  <>
                    <img
                      src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
                      alt="MetaMask"
                      className="w-8 h-8 absolute left-4"
                    />
                    <span>MetaMask</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Bitcoin Wallets</h3>
              <Button
                onClick={handleBitcoinConnect}
                disabled={isConnecting !== null}
                className="w-full h-14 text-lg relative bg-[#F7931A] hover:bg-[#E88A16] text-white"
              >
                {isConnecting === 'bitcoin' ? (
                  <div className="animate-pulse">Connecting...</div>
                ) : (
                  <>
                    <img
                      src="https://bitcoin.org/img/icons/opengraph.png"
                      alt="Bitcoin"
                      className="w-8 h-8 absolute left-4"
                    />
                    <span>Bitcoin Wallet</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
