import { WalletProvider } from './providers/WalletProvider'
import { Toaster } from './components/ui/toaster'
import { Profile } from './pages/Profile'
import { useProfileStore } from './store/useProfileStore'
import { Button } from './components/ui/button'
import { MUSDBalance } from './components/MUSDBalance'
import { User } from './components/User'
import { useState } from 'react'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard')
  const { activeWallet } = useProfileStore()

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background p-4">
          <div className="flex flex-col h-full">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Invoiced</h2>
              <User />
              <nav className="space-y-2">
                <Button
                  variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setCurrentPage('dashboard')}
                >
                  Dashboard
                </Button>
                {activeWallet && (
                  <Button
                    variant={currentPage === 'profile' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setCurrentPage('profile')}
                  >
                    Profile
                  </Button>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <header className="border-b">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold">
                {currentPage === 'dashboard' ? 'Dashboard' : 'Profile'}
              </h1>
            </div>
          </header>
          <main className="p-6">
            {currentPage === 'profile' ? (
              <Profile />
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Welcome to your Dashboard</h2>
                {activeWallet ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <MUSDBalance />
                      {/* Add more dashboard components here */}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Please connect your wallet to get started.
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </WalletProvider>
  )
}

export default App