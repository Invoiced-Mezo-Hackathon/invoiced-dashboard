import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Wallet, AlertTriangle } from 'lucide-react';
import { useWalletUtils } from '@/hooks/useWalletUtils';
import { toast } from 'react-hot-toast';

interface UserSettings {
  name: string;
  avatar: string; // color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal'
  currency: string;
}

const AVATAR_COLORS = [
  { id: 'blue', bg: 'bg-blue-500', label: 'Blue' },
  { id: 'green', bg: 'bg-green-500', label: 'Green' },
  { id: 'purple', bg: 'bg-purple-500', label: 'Purple' },
  { id: 'orange', bg: 'bg-orange-500', label: 'Orange' },
  { id: 'pink', bg: 'bg-pink-500', label: 'Pink' },
  { id: 'teal', bg: 'bg-teal-500', label: 'Teal' },
];

export function Settings() {
  const { address, isConnected } = useAccount();
  const { formatAddress, getNetworkName, chainId } = useWalletUtils();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('blue');
  const [currency, setCurrency] = useState('USD');

  // Load settings when wallet connects
  useEffect(() => {
    if (address) {
      const savedSettings = loadSettings(address);
      if (savedSettings) {
        setName(savedSettings.name);
        setAvatar(savedSettings.avatar);
        setCurrency(savedSettings.currency);
      }
    } else {
      // Clear settings when wallet disconnects
      setName('');
      setAvatar('blue');
      setCurrency('USD');
    }
  }, [address]);

  const loadSettings = (walletAddress: string): UserSettings | null => {
    try {
      const saved = localStorage.getItem(`invoiced_settings_${walletAddress}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  };

  const saveSettings = (walletAddress: string, settings: UserSettings): void => {
    try {
      localStorage.setItem(`invoiced_settings_${walletAddress}`, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleSave = () => {
    if (address) {
      const settings: UserSettings = {
        name: name.trim(),
        avatar,
        currency,
      };
      saveSettings(address, settings);
      
      // Show success toast notification
      toast.success('Settings saved successfully! 🎉', {
        duration: 3000,
        icon: '✅',
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-title">Settings</h1>
        <p className="text-white/60">Manage your profile and preferences</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold font-title">Profile</h2>
          </div>
          
          <div className="space-y-6">
            {/* Avatar Selection */}
            <div>
              <Label className="text-sm text-foreground/70 mb-3 block">
                Choose Avatar
              </Label>
              <div className="flex gap-3">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAvatar(color.id)}
                    className={`w-12 h-12 rounded-full ${color.bg} flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 ${
                      avatar === color.id 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' 
                        : 'hover:scale-105'
                    }`}
                    title={color.label}
                  >
                    {getInitials(name)}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="name" className="text-sm text-foreground/70 mb-2 block">
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="glass border-border/20 focus:border-border/40"
                placeholder="Enter your display name"
              />
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold font-title">Wallet</h2>
          </div>
          
          <div className="space-y-4">
            {isConnected && address ? (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/20">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Connected Wallet</p>
                    <p className="font-mono text-sm">{formatAddress(address)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/20">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Network</p>
                    <p className="text-sm font-medium">{getNetworkName(chainId)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-muted/50 border border-border/20 text-center">
                <p className="text-sm text-foreground/60">No wallet connected</p>
                <p className="text-xs text-foreground/40 mt-1">Connect your wallet to view settings</p>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold font-title">Preferences</h2>
          </div>
          
          <div>
            <Label htmlFor="currency" className="text-sm text-foreground/70 mb-2 block">
              Default Currency
            </Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-3 rounded-lg glass border border-border/20 focus:border-border/40 bg-background text-foreground"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="BTC">BTC</option>
              <option value="MUSD">MUSD</option>
            </select>
          </div>
        </div>

        {/* Security Warning */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-title text-amber-400 mb-2">Security Notice</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Always use secure wallets and keep your private keys safe. Never share your seed phrase with anyone. 
                Invoiced cannot recover lost funds. Your wallet security is your responsibility.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            disabled={!isConnected}
            className="glass-hover border border-border/20 h-12 px-12 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
