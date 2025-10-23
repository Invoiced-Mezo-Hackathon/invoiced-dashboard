import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Settings() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
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
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Connected Wallet</p>
              <p className="font-mono">{connectedWallet}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <Button
            variant="outline"
            className="w-full glass-hover border border-white/20"
          >
            Reconnect Wallet
          </Button>
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
