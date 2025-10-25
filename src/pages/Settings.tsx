import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, ExternalLink, AlertCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const { 
    isConnected, 
    account, 
    chainId, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork, 
    isLoading, 
    error 
  } = useWallet();

  const handleSave = () => {
    console.log('Settings saved');
    toast.success('Settings saved successfully!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: string) => {
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x89':
        return 'Polygon';
      case '0x38':
        return 'BSC';
      default:
        return 'Unknown Network';
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-title">Settings</h1>
        <p className="text-white/60">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Information */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-6 font-title">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm text-white/70 mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="glass border-white/20 focus:border-white/40 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm text-white/70 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="glass border-white/20 focus:border-white/40 text-white"
              />
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-6 font-title">Wallet Connection</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {isConnected && account ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">Connected Wallet</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{formatAddress(account)}</p>
                    <button
                      onClick={() => copyToClipboard(account)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-white/60" />
                    </button>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>

              {chainId && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Network</p>
                  <p className="text-sm text-white/80">{getNetworkName(chainId)}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="flex-1 glass-hover border border-white/20"
                >
                  Disconnect
                </Button>
                <Button
                  onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                  variant="outline"
                  className="glass-hover border border-white/20"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white/60 mb-4">Connect your MetaMask wallet to get started</p>
              <Button
                onClick={connectWallet}
                disabled={isLoading}
                className="glass-hover border border-white/20"
              >
                {isLoading ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
            </div>
          )}
        </div>


        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            className="glass-hover border border-white/20 h-12 px-12 text-base font-medium"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
