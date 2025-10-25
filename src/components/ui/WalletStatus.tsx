import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NetworkSwitch } from './NetworkSwitch';
import { useWalletUtils } from '@/hooks/useWalletUtils';

interface WalletStatusProps {
  onShowNetworkModal?: () => void;
}

export const WalletStatus = ({ onShowNetworkModal }: WalletStatusProps) => {
  const { isConnected } = useAccount();
  const { isMezoTestnet, chainId } = useWalletUtils();

  return (
    <div className="flex items-center gap-4">
      {isConnected && (
        <div className="flex items-center gap-2">
          <NetworkSwitch onShowModal={onShowNetworkModal} />
          {!isMezoTestnet(chainId) && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Switch to Mezo Testnet for full functionality
            </div>
          )}
        </div>
      )}
      <ConnectButton />
    </div>
  );
};
