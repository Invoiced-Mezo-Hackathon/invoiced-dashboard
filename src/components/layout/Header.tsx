import { WalletStatus } from '@/components/ui/WalletStatus';

interface HeaderProps {
  onShowNetworkModal?: () => void;
}

export function Header({ onShowNetworkModal }: HeaderProps) {
  return (
    <div className="fixed right-2 sm:right-4 top-4 z-50">
      <div className="glass p-2 sm:p-3 rounded-xl">
        <WalletStatus onShowNetworkModal={onShowNetworkModal} />
      </div>
    </div>
  );
}
