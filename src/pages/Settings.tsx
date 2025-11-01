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

      <div className="max-w-4xl mx-auto">
        {/* Grid Layout for Better Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Wallet Info - Compact Card */}
          <SettingsSection
            title="Wallet Connection"
            description="Your connected wallet"
            icon={Wallet}
            iconBgColor="bg-green-500/10"
            iconColor="text-green-400"
            defaultOpen={true}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/20">
                <div className="flex-1">
                  <p className="text-xs text-white/50 mb-1.5 font-navbar uppercase tracking-wide">Wallet Address</p>
                  <p className="font-mono text-sm text-white break-all">{formatAddress(address!)}</p>
                </div>
                <div className="ml-4 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-green-300 font-navbar font-medium">Connected</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#2C2C2E]/30 border border-green-400/10">
                <p className="text-xs text-white/50 mb-1.5 font-navbar uppercase tracking-wide">Network</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <p className="text-sm font-medium text-white font-navbar">{getNetworkName(chainId)}</p>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Profile Section */}
          <SettingsSection
            title="Profile"
            description="Your identity and branding"
            icon={User}
            iconBgColor="bg-blue-500/10"
            iconColor="text-blue-400"
            defaultOpen={true}
          >
            <div className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-400/20">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {getInitials(name || businessName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white font-navbar truncate">{name || 'User'}</p>
                  <p className="text-xs text-white/60 font-navbar truncate">{businessName || 'No business name'}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-xs text-white/60 mb-2 block font-navbar uppercase tracking-wide">
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="bg-[#2C2C2E]/50 backdrop-blur-xl border border-green-400/20 focus:border-green-400/50 text-white placeholder:text-white/40 h-10"
                  placeholder="Enter your display name"
                  disabled={!isConnected}
                />
              </div>

              <div>
                <Label htmlFor="businessName" className="text-xs text-white/60 mb-2 block font-navbar uppercase tracking-wide">
                  Business Name <span className="text-white/40">(Optional)</span>
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessName(e.target.value)}
                  className="bg-[#2C2C2E]/50 backdrop-blur-xl border border-green-400/20 focus:border-green-400/50 text-white placeholder:text-white/40 h-10"
                  placeholder="Enter business name"
                  disabled={!isConnected}
                />
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Preferences */}
        <SettingsSection
          title="Preferences"
          description="App settings and notifications"
          icon={Bell}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-400"
          defaultOpen={false}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="currency" className="text-xs text-white/60 mb-2 block font-navbar uppercase tracking-wide">
                Default Currency
              </Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#2C2C2E]/50 backdrop-blur-xl border border-green-400/20 focus:border-green-400/50 text-white h-10 text-sm"
                disabled={!isConnected}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="MUSD">MUSD - Mezo USD</option>
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-400/20">
              <div className="flex-1 mr-4">
                <Label htmlFor="notifications" className="text-sm font-semibold text-white font-navbar block mb-1">
                  Browser Notifications
                </Label>
                <p className="text-xs text-white/60 font-navbar">
                  Receive alerts for payments and invoice updates
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
          title="Data & Backup"
          description="Export, backup, and manage your data"
          icon={Download}
          iconBgColor="bg-orange-500/10"
          iconColor="text-orange-400"
          defaultOpen={false}
        >
          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={!isConnected}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-400/20 hover:border-green-400/40 hover:from-green-500/15 hover:to-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-400/30 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <i className="fa-solid fa-download text-green-400 text-sm"></i>
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-white font-navbar mb-0.5">Export All Data</p>
                <p className="text-xs text-white/60 font-navbar">
                  Download settings and invoices as JSON backup
                </p>
              </div>
              <i className="fa-solid fa-chevron-right text-white/30 text-xs"></i>
            </button>

            <button
              onClick={handleClearData}
              disabled={!isConnected}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 hover:from-red-500/15 hover:to-orange-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <i className="fa-solid fa-trash text-red-400 text-sm"></i>
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-red-300 font-navbar mb-0.5">Clear All Settings</p>
                <p className="text-xs text-white/60 font-navbar">
                  Reset to defaults - This action cannot be undone
                </p>
              </div>
              <i className="fa-solid fa-chevron-right text-white/30 text-xs"></i>
            </button>
          </div>
        </SettingsSection>

        {/* Security Notice */}
        <div className="mt-4 p-4 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="fa-solid fa-shield-halved text-yellow-400 text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-yellow-300 font-navbar mb-1">Security Reminder</p>
              <p className="text-xs text-white/70 leading-relaxed font-navbar">
                Keep your private keys safe and never share your seed phrase. Your wallet security is your responsibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
