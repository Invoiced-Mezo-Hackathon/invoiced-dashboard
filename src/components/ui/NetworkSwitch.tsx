import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from './button'
import { useWalletUtils } from '@/hooks/useWalletUtils'
import { AlertTriangle } from 'lucide-react'

interface NetworkSwitchProps {
  onShowModal?: () => void
}

export function NetworkSwitch({ onShowModal }: NetworkSwitchProps) {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { isMezoTestnet, getNetworkName } = useWalletUtils()

  const handleSwitchToMezo = () => {
    switchChain({ chainId: 31611 })
  }

  const isOnMezo = isMezoTestnet(chain?.id)

  if (isOnMezo) {
    // Avoid duplicate wording since the chain pill already shows the active network
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          {chain ? `On ${getNetworkName(chain.id)}` : 'Unknown Network'}
        </span>
      </div>
      <Button 
        onClick={handleSwitchToMezo}
        variant="outline"
        size="sm"
        className="text-orange-600 border-orange-200 hover:bg-orange-50"
      >
        Switch to Mezo
      </Button>
      {onShowModal && (
        <Button 
          onClick={onShowModal}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          Need Help?
        </Button>
      )}
    </div>
  )
}
