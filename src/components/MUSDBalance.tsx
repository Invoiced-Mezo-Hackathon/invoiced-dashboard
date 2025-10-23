import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import MUSDService from '../services/MUSDService'
import { useToast } from './ui/use-toast'

export function MUSDBalance() {
  const { address, isConnected } = useAccount()
  const [balance, setBalance] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const musdService = MUSDService.getInstance()

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address) return

      try {
        setIsLoading(true)
        const musdBalance = await musdService.getBalance(address)
        setBalance(musdBalance)
      } catch (error: any) {
        toast({
          title: 'Error fetching MUSD balance',
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
    // Set up polling for balance updates
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [address, isConnected])

  if (!isConnected) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">MUSD Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${parseFloat(balance).toFixed(2)} MUSD`
              )}
            </p>
          </div>
          <div className="h-12 w-12">
            <img
              src="https://mezo.network/musd-logo.png"
              alt="MUSD"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
