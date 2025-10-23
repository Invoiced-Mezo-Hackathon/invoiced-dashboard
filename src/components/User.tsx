import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from './ui/button'
import { WalletModal } from './WalletModal'
import { useProfileStore } from '../store/useProfileStore'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useState } from 'react'

export function User() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { activeWallet } = useProfileStore()

  if (!activeWallet) {
    return (
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span>Connect Wallet</span>
        </Button>
        <WalletModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {activeWallet.address.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}
            </span>
            <span className="text-xs text-muted-foreground">
              {activeWallet.type === 'ethereum' ? 'ETH' : 'BTC'}: {parseFloat(activeWallet.balance).toFixed(4)}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Wallet</p>
            <p className="text-xs leading-none text-muted-foreground">
              {activeWallet.type === 'ethereum' ? 'Ethereum' : 'Bitcoin'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={() => {
            // This will trigger the disconnect in ConnectWallet component
            useProfileStore.setState({ activeWallet: null })
          }}
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
