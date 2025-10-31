import { WalletStatus } from '@/components/ui/WalletStatus';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface HeaderProps {
  onShowNetworkModal?: () => void;
}

export function Header({ onShowNetworkModal }: HeaderProps) {
  return (
    <div className="fixed right-2 sm:right-4 top-2 sm:top-4 z-50">
      <div className="flex items-center gap-2">
        <NotificationBell />
      <WalletStatus onShowNetworkModal={onShowNetworkModal} />
      </div>
    </div>
  );
}
