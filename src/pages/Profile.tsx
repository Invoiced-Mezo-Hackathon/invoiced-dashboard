import { useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { useProfileStore, WalletProfile } from '../store/useProfileStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { formatEther } from 'viem'

export function Profile() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { activeWallet, setActiveWallet } = useProfileStore()

  useEffect(() => {
    if (isConnected && address && balance) {
      const walletProfile: WalletProfile = {
        address,
        chainId: 1, // This should be dynamic based on the connected chain
        type: 'ethereum',
        balance: formatEther(balance.value),
        transactions: [], // This should be populated from an API or blockchain
        connectedAt: Date.now(),
      }
      setActiveWallet(walletProfile)
    }
  }, [address, isConnected, balance, setActiveWallet])

  if (!isConnected || !activeWallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">No Wallet Connected</h2>
        <p className="text-muted-foreground mb-4">
          Please connect your wallet to view your profile
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Wallet Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="font-mono bg-secondary/50 p-2 rounded-md">
                  {activeWallet.address}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Balance
                </label>
                <p className="text-2xl font-bold">
                  {activeWallet.balance} ETH
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Wallet Type
                </label>
                <p className="capitalize">{activeWallet.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Connected Since
                </label>
                <p>
                  {new Date(activeWallet.connectedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {activeWallet.transactions.length === 0 ? (
              <p className="text-muted-foreground">No recent transactions</p>
            ) : (
              <div className="space-y-4">
                {activeWallet.transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                  >
                    <div>
                      <p className="font-mono text-sm">{tx.hash}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={tx.type === 'received' ? 'text-green-500' : 'text-red-500'}>
                        {tx.type === 'received' ? '+' : '-'}{tx.amount} ETH
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
