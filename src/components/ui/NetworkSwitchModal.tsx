import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from './button'
import { X, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'

interface NetworkSwitchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NetworkSwitchModal({ isOpen, onClose }: NetworkSwitchModalProps) {
  const { chain } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitchToMezo = async () => {
    setIsSwitching(true)
    try {
      await switchChain({ chainId: 31611 })
      onClose()
    } catch (error) {
      console.error('Failed to switch to Mezo testnet:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  const handleAddNetwork = () => {
    // Open Mezo testnet documentation for manual network addition
    window.open('https://mezo.org/docs/developers/getting-started/configure-environment', '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Switch to Mezo Testnet</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Mezo Testnet Required</p>
              <p>To use the full functionality of this invoice dashboard, please connect to Mezo Testnet.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">M</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mezo Testnet</p>
                  <p className="text-sm text-gray-500">Chain ID: 31611</p>
                </div>
              </div>
              {chain?.id === 31611 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Button
                  onClick={handleSwitchToMezo}
                  disabled={isPending || isSwitching}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isPending || isSwitching ? 'Switching...' : 'Switch'}
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• RPC URL: https://rpc.test.mezo.org</p>
              <p>• Currency: BTC</p>
              <p>• Explorer: https://explorer.test.mezo.org</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Don't see Mezo Testnet in your wallet? You may need to add it manually.
            </p>
            <Button
              variant="outline"
              onClick={handleAddNetwork}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Setup Instructions
            </Button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            {chain?.id !== 31611 && (
              <Button
                onClick={handleSwitchToMezo}
                disabled={isPending || isSwitching}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isPending || isSwitching ? 'Switching...' : 'Switch Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
