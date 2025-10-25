import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Wallet, Bell, Shield, Palette, Globe } from 'lucide-react';

export function Settings() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const connectedWallet = 'mezo1x...7k9p';

  const handleSave = () => {
    console.log('Settings saved');
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-title">Settings</h1>
        <p className="text-white/60">Manage your account and preferences</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold font-title">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm text-foreground/70 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="glass border-border/20 focus:border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm text-foreground/70 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="glass border-border/20 focus:border-border/40"
                />
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wallet className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold font-title">Wallet Connection</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/20">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Connected Wallet</p>
                  <p className="font-mono text-sm">{connectedWallet}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full glass-hover border border-border/20"
              >
                Reconnect Wallet
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold font-title">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-foreground/60">Use dark theme interface</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto Save</p>
                  <p className="text-xs text-foreground/60">Automatically save changes</p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
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
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold font-title">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-foreground/60">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Payment Alerts</p>
                  <p className="text-xs text-foreground/60">Get notified of new payments</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Vault Warnings</p>
                  <p className="text-xs text-foreground/60">Alerts for vault health</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold font-title">Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="glass-hover border border-border/20 justify-start"
            >
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="glass-hover border border-border/20 justify-start"
            >
              <Globe className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            className="glass-hover border border-border/20 h-12 px-12 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
