import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NetworkSwitch } from './NetworkSwitch';
import { useWalletUtils } from '@/hooks/useWalletUtils';

interface WalletStatusProps {
  onShowNetworkModal?: () => void;
}

export const WalletStatus = ({ onShowNetworkModal }: WalletStatusProps) => {
  const { isMezoTestnet, chainId } = useWalletUtils();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain;

        return (
          <div className="flex items-center gap-3">
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-yellow-400/20 border border-yellow-400/50 text-white font-title font-bold hover:bg-yellow-400/30 transition-all shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-yellow-400/20 border border-yellow-300/50 flex items-center justify-center">
                  <i className="fa-solid fa-wallet text-yellow-300"></i>
                </span>
                <span className="tracking-wide">Connect Wallet</span>
                <span className="ml-1 inline-flex items-center text-yellow-300 animate-pulse">
                  <i className="fa-solid fa-arrow-right-long"></i>
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <NetworkSwitch onShowModal={onShowNetworkModal} />
                {!isMezoTestnet(chainId) && (
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    Switch to Mezo Testnet for full functionality
                  </div>
                )}
                <button
                  onClick={openChainModal}
                  className="px-3 py-2 rounded-full bg-white text-black border border-white/10 font-navbar flex items-center gap-2 hover:bg-white/90"
                >
                  <i className="fa-solid fa-network-wired text-black/70"></i>
                  <span>{chain?.name}</span>
                </button>
                <button
                  onClick={openAccountModal}
                  className="px-3 py-2 rounded-full bg-white text-black border border-white/10 font-navbar flex items-center gap-2 hover:bg-white/90"
                >
                  <i className="fa-solid fa-user text-black/70"></i>
                  <span>{account?.displayName}</span>
                  {account?.displayBalance && (
                    <span className="text-xs text-gray-600">{account.displayBalance}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
