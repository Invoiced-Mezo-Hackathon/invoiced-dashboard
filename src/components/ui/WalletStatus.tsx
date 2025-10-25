import { useWallet } from '@/contexts/WalletContext';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const WalletStatus = () => {
  const { isConnected, isLoading, error } = useWallet();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return null;
};
