import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Wallet, Download, Bell } from 'lucide-react';
import { useWalletUtils } from '@/hooks/useWalletUtils';
import { toast } from 'react-hot-toast';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { AutoSaveIndicator } from '@/components/settings/AutoSaveIndicator';

interface UserSettings {
  name: string;
  avatar: string;
  currency: string;
  businessName?: string;
  defaultPaymentTerms: number;
  defaultTaxRate: number;
  notificationsEnabled: boolean;
  lastBackupDate?: string;
}

export function Settings() {
  const { address, isConnected } = useAccount();
  const { formatAddress, getNetworkName, chainId } = useWalletUtils();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('gradient');
  const [currency, setCurrency] = useState('USD');
  const [businessName, setBusinessName] = useState('');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(30);
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load settings when wallet connects
  useEffect(() => {
    if (address) {
      const savedSettings = loadSettings(address);
      if (savedSettings) {
        setName(savedSettings.name || '');
        setAvatar(savedSettings.avatar || 'gradient');
        setCurrency(savedSettings.currency || 'USD');
        setBusinessName(savedSettings.businessName || '');
        setDefaultPaymentTerms(savedSettings.defaultPaymentTerms || 30);
        setDefaultTaxRate(savedSettings.defaultTaxRate || 0);
        setNotificationsEnabled(savedSettings.notificationsEnabled || false);
      }
    } else {
      // Clear settings when wallet disconnects
      setName('');
      setAvatar('gradient');
      setCurrency('USD');
      setBusinessName('');
      setDefaultPaymentTerms(30);
      setDefaultTaxRate(0);
      setNotificationsEnabled(false);
    }
  }, [address]);

  // Request notification permission when enabled
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

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

  const autoSave = useCallback(() => {
    if (!address) return;

    setSaveStatus('saving');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const settings: UserSettings = {
        name: name.trim(),
        avatar,
        currency,
        businessName: businessName.trim(),
        defaultPaymentTerms,
        defaultTaxRate,
        notificationsEnabled,
      };
      saveSettings(address, settings);
      setSaveStatus('saved');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);
  }, [address, name, avatar, currency, businessName, defaultPaymentTerms, defaultTaxRate, notificationsEnabled]);

  // Auto-save when settings change
  useEffect(() => {
    if (address) {
      autoSave();
    }
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [address, name, avatar, currency, businessName, defaultPaymentTerms, defaultTaxRate, notificationsEnabled, autoSave]);

  const handleExport = () => {
    if (!address) return;

    try {
      // Get all invoices
      const invoices = localStorage.getItem(`invoiced_invoices_${address}`);
      const settings = localStorage.getItem(`invoiced_settings_${address}`);

      const data = {
        exportedAt: new Date().toISOString(),
        walletAddress: address,
        settings: settings ? JSON.parse(settings) : null,
        invoices: invoices ? JSON.parse(invoices) : null,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoiced-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup date
      const currentSettings = loadSettings(address);
      if (currentSettings) {
        currentSettings.lastBackupDate = new Date().toISOString();
        saveSettings(address, currentSettings);
      }

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const handleClearData = () => {
    if (!window.confirm('Are you sure you want to clear all settings? This cannot be undone.')) {
      return;
    }

    if (address) {
      localStorage.removeItem(`invoiced_settings_${address}`);
      setName('');
      setBusinessName('');
      setDefaultPaymentTerms(30);
      setDefaultTaxRate(0);
      setNotificationsEnabled(false);
      toast.success('Settings cleared');
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  if (!isConnected) {
    return (
      <div className="flex-1 h-screen overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-12 rounded-2xl border border-green-400/10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center">
              <i className="fa-solid fa-wallet text-green-400 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold font-navbar mb-2 text-white">Connect Your Wallet</h2>
            <p className="text-white/60 mb-6 font-navbar">
              Please connect your wallet to access settings and customize your profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">Settings</h1>
          <p className="text-sm font-navbar text-white/60">Manage your profile and preferences</p>
        </div>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Wallet Info - Now First */}
        <SettingsSection
          title="Wallet"
          description="Your connected wallet information"
          icon={Wallet}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-400"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10">
              <div>
                <p className="text-sm text-white/60 mb-1 font-navbar">Connected Wallet</p>
                <p className="font-mono text-sm text-white">{formatAddress(address!)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-green-400 font-navbar">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10">
              <div>
                <p className="text-sm text-white/60 mb-1 font-navbar">Network</p>
                <p className="text-sm font-medium text-white font-navbar">{getNetworkName(chainId)}</p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Profile Section */}
        <SettingsSection
          title="Profile"
          description="Customize your identity"
          icon={User}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-400"
        >
          <div className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4 pb-4 border-b border-green-400/10">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {getInitials(name || businessName)}
              </div>
              <div>
                <p className="text-sm font-medium text-white font-navbar">{name || 'User'}</p>
                <p className="text-xs text-white/60 font-navbar">{businessName || 'No business name set'}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm text-white/70 mb-2 block font-navbar">
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 focus:border-green-400/40 text-white placeholder:text-white/40"
                placeholder="Enter your display name"
                disabled={!isConnected}
              />
            </div>

            <div>
              <Label htmlFor="businessName" className="text-sm text-white/70 mb-2 block font-navbar">
                Business/Company Name (Optional)
              </Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessName(e.target.value)}
                className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 focus:border-green-400/40 text-white placeholder:text-white/40"
                placeholder="Enter business name"
                disabled={!isConnected}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Wallet Info */}
        <SettingsSection
          title="Wallet"
          description="Your connected wallet information"
          icon={Wallet}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-400"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10">
            <div>
                <p className="text-sm text-white/60 mb-1 font-navbar">Connected Wallet</p>
                <p className="font-mono text-sm text-white">{formatAddress(address!)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-green-400 font-navbar">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10">
            <div>
                <p className="text-sm text-white/60 mb-1 font-navbar">Network</p>
                <p className="text-sm font-medium text-white font-navbar">{getNetworkName(chainId)}</p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection
          title="Preferences"
          description="Configure your app preferences"
          icon={Bell}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-400"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="currency" className="text-sm text-white/70 mb-2 block font-navbar">
                Default Currency
              </Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 focus:border-green-400/40 text-white"
                disabled={!isConnected}
              >
                <option value="USD">USD</option>
                <option value="MUSD">MUSD</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10">
              <div className="flex-1">
                <Label htmlFor="notifications" className="text-sm font-medium text-white font-navbar">
                  Browser Notifications
                </Label>
                <p className="text-xs text-white/60 mt-1 font-navbar">
                  Get notified about payments and invoice updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                disabled={!isConnected}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection
          title="Data Management"
          description="Export or manage your data"
          icon={Download}
          iconBgColor="bg-orange-500/10"
          iconColor="text-orange-400"
          defaultOpen={false}
        >
          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={!isConnected}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2C2C2E]/20 border border-green-400/10 hover:border-green-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-download text-green-400"></i>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-white font-navbar">Export All Data</p>
                <p className="text-xs text-white/60 font-navbar">
                  Download your settings and invoices as JSON
                </p>
              </div>
            </button>

            <button
              onClick={handleClearData}
              disabled={!isConnected}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2C2C2E]/20 border border-red-500/20 hover:border-red-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-trash text-red-400"></i>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-red-400 font-navbar">Clear All Settings</p>
                <p className="text-xs text-white/60 font-navbar">
                  Reset all settings to default (cannot be undone)
                </p>
              </div>
            </button>
          </div>
        </SettingsSection>

        {/* Security Notice */}
        <div className="p-4 rounded-xl border border-green-400/20 bg-green-500/5">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-green-400 flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-white/70 leading-relaxed font-navbar">
              Keep your private keys safe and never share your seed phrase. Your wallet security is your responsibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
