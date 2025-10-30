import { WalletStatus } from '@/components/ui/WalletStatus';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface HeaderProps {
  onShowNetworkModal?: () => void;
}

export function Header({ onShowNetworkModal }: HeaderProps) {
  return (
    <div className="fixed right-2 sm:right-4 top-4 z-50">
      <WalletStatus onShowNetworkModal={onShowNetworkModal} />
    </div>
  );
}
