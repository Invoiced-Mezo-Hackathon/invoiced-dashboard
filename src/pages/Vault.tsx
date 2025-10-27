import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useMezoVault } from '@/hooks/useMezoVault';
import { MezoUtils } from '@/lib/mezo';

type VaultAction = 'deposit' | 'borrow' | 'repay' | 'withdraw' | 'send' | null;

export function Vault() {
  const { address, isConnected } = useWallet();
  const [activeAction, setActiveAction] = useState<VaultAction>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  
  const { 
    vaultData, 
    isLoading, 
    error,
    musdBalance,
    walletBtcBalance, // Wallet BTC balance
    collateralBalance,
    borrowedAmount,
    collateralRatio,
    interestRate,
    healthFactor,
    depositCollateral,
    borrowMUSD,
    repayMUSD,
    withdrawCollateral,
    sendBitcoin,
    isPending,
    isConfirming,
    isSuccess,
    transactionHash,
    isDepositSuccess,
    isBorrowSuccess,
    isRepaySuccess,
    isWithdrawSuccess,
    depositHash,
    borrowHash,
    repayHash,
    withdrawHash,
    sendBitcoinHash,
  } = useMezoVault();

  const handleAction = async () => {
    if (!activeAction || !actionAmount) return;
    
    // For send action, also require recipient address
    if (activeAction === 'send' && !recipientAddress) return;

    try {
      switch (activeAction) {
        case 'deposit':
          await depositCollateral(actionAmount);
          break;
        case 'borrow':
          await borrowMUSD(actionAmount);
          break;
        case 'repay':
          await repayMUSD(actionAmount);
          break;
        case 'withdraw':
          await withdrawCollateral(actionAmount);
          break;
        case 'send':
          await sendBitcoin(recipientAddress, actionAmount);
          break;
      }
      
      setActionAmount('');
      setRecipientAddress('');
      setActiveAction(null);
    } catch (err) {
      console.error('Vault action failed:', err);
      // Error is handled by the hook
    }
  };

  const getRiskLevel = () => {
    if (!vaultData) return 'safe';
    return MezoUtils.getRiskLevel(vaultData.healthFactor);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActionTitle = () => {
    if (!activeAction) return '';
    return activeAction.charAt(0).toUpperCase() + activeAction.slice(1);
  };

  const getAmountLabel = () => {
    switch (activeAction) {
      case 'deposit':
      case 'withdraw':
      case 'send':
        return 'Amount (BTC)';
      case 'borrow':
      case 'repay':
        return 'Amount (MUSD)';
      default:
        return 'Amount';
    }
  };

  const getBalanceInfo = () => {
    switch (activeAction) {
      case 'deposit':
      case 'withdraw':
      case 'send':
        return {
          label: 'Current BTC Balance',
          value: `${vaultData?.collateralAmount || '0'} BTC`
        };
      case 'borrow':
      case 'repay':
        return {
          label: 'Current MUSD Balance',
          value: `${musdBalance} MUSD`
        };
      default:
        return {
          label: 'Balance',
          value: '0'
        };
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-title">Vault</h1>
        <p className="text-sm sm:text-base text-white/60">Manage your collateral and borrowing</p>
      </div>

      {/* Educational Section */}
      <div className="max-w-2xl mx-auto mb-8 glass p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold mb-3 text-green-400">💰 How the Vault Works</h2>
        <div className="space-y-3 text-sm text-white/80">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-semibold">Deposit BTC</p>
              <p className="text-white/60">Lock your Bitcoin in the vault as collateral (you keep ownership)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-semibold">Borrow MUSD</p>
              <p className="text-white/60">Get stablecoins to spend, trade, or use in DeFi - at 2.5% fixed APR</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-semibold">Spend Your MUSD</p>
              <p className="text-white/60">Use MUSD anywhere - send to anyone, use in other DeFi apps, or convert to cash</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <div>
              <p className="font-semibold">Repay & Withdraw</p>
              <p className="text-white/60">Pay back when you want (no deadlines), get your BTC back</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 font-semibold mb-1">✨ Benefits:</p>
          <ul className="text-sm text-white/70 space-y-1">
            <li>✅ Keep your BTC (HODL) while accessing liquidity</li>
            <li>✅ Low 2.5% fixed interest (vs 8-20% variable rates elsewhere)</li>
            <li>✅ No repayment deadlines - pay back whenever</li>
            <li>✅ 90% of collateral value available to borrow</li>
            <li>✅ Use MUSD anywhere or cash out anytime</li>
          </ul>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Circular Gauge */}
        <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center">
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="rgba(74, 222, 128, 0.8)"
                strokeWidth="12"
                strokeDasharray={`${((vaultData?.collateralRatio || 0) / 200) * 502.4} 502.4`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold">{vaultData?.collateralRatio || 0}%</p>
              <div className="flex items-center gap-1">
                <p className="text-sm text-white/60">Collateral Ratio</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90">This shows how safe your money is. Higher number = safer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-sm text-white/60">Vault BTC</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90">Bitcoin deposited in the vault as collateral.</p>
                  </div>
                </div>
              </div>
              <p className="text-xl font-bold">{collateralBalance} BTC</p>
              <p className="text-xs text-white/50">Wallet: {walletBtcBalance} BTC</p>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-sm text-white/60">MUSD Borrowed</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90">Money you borrowed. More borrowed = more risk.</p>
                  </div>
                </div>
              </div>
              <p className="text-xl font-bold">{vaultData?.borrowedAmount || '0'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-sm text-white/60">Safety</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90">How safe you are. "Healthy" means you are safe.</p>
                  </div>
                </div>
              </div>
              <p className={`text-xl font-bold ${getRiskColor(getRiskLevel())}`}>
                {getRiskLevel().charAt(0).toUpperCase() + getRiskLevel().slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['deposit', 'borrow', 'repay', 'withdraw', 'send'] as const).map((action) => {
            const getActionDescription = (action: string) => {
              switch (action) {
                case 'deposit':
                  return 'Put Bitcoin in to get money';
                case 'borrow':
                  return 'Get money using your Bitcoin';
                case 'repay':
                  return 'Pay back the money you borrowed';
                case 'withdraw':
                  return 'Take out extra Bitcoin';
                case 'send':
                  return 'Send Bitcoin to any address';
                default:
                  return '';
              }
            };

            return (
              <div key={action} className="group relative">
                <Button
                  onClick={() => setActiveAction(action)}
                  className="glass-hover border border-white/20 h-20 flex flex-col items-center justify-center gap-2 w-full"
                >
                  <span className="text-lg font-semibold capitalize">{action}</span>
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <p className="text-white/90">{getActionDescription(action)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Display */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">MUSD Balance</p>
              <p className="text-3xl font-bold">{musdBalance} MUSD</p>
              {parseFloat(musdBalance) > 0 && (
                <p className="text-xs text-green-400 mt-1">✓ Available to spend or withdraw</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60 mb-1">Interest Rate</p>
              <p className="text-2xl font-bold text-green-400">{vaultData?.interestRate || 0}%</p>
            </div>
          </div>
        </div>

        {/* MUSD Usage Guide */}
        {parseFloat(musdBalance) > 0 && (
          <div className="glass p-6 rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <h3 className="text-lg font-bold mb-3 text-blue-400">💡 How to Use Your MUSD</h3>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <p><strong>Send to Others:</strong> Use the "Send" button below to transfer MUSD to any Mezo address</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <p><strong>Use in DeFi:</strong> MUSD works with other Mezo apps, pools, and protocols</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <p><strong>Repay Your Loan:</strong> Click "Repay" to return MUSD and free your BTC collateral</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <p><strong>Keep as Savings:</strong> MUSD is stable (pegged to $1) - safe place to store value</p>
              </div>
              <p className="text-xs text-blue-300 mt-3 pt-3 border-t border-blue-400/20">
                💰 <strong>Tip:</strong> MUSD is Bitcoin-backed stablecoin, as stable as USD but powered by BTC!
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="glass p-4 rounded-2xl border border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Pending Transaction Notifications - Stage-Specific */}
        {depositHash && isPending && (
          <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              <div>
                <p className="text-orange-400 font-semibold">📤 Depositing {actionAmount} BTC...</p>
                <p className="text-orange-300 text-sm">Your BTC is being secured in the vault</p>
                <a href={`https://explorer.test.mezo.org/tx/${depositHash}`} target="_blank" rel="noopener noreferrer" className="text-orange-300 text-xs underline hover:text-orange-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}
        
        {borrowHash && isPending && (
          <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              <div>
                <p className="text-orange-400 font-semibold">💰 Borrowing {actionAmount} MUSD...</p>
                <p className="text-orange-300 text-sm">Minting MUSD tokens for your wallet</p>
                <a href={`https://explorer.test.mezo.org/tx/${borrowHash}`} target="_blank" rel="noopener noreferrer" className="text-orange-300 text-xs underline hover:text-orange-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}
        
        {repayHash && isPending && (
          <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              <div>
                <p className="text-orange-400 font-semibold">💸 Repaying {actionAmount} MUSD...</p>
                <p className="text-orange-300 text-sm">Burning MUSD tokens and clearing your debt</p>
                <a href={`https://explorer.test.mezo.org/tx/${repayHash}`} target="_blank" rel="noopener noreferrer" className="text-orange-300 text-xs underline hover:text-orange-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}
        
        {withdrawHash && isPending && (
          <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              <div>
                <p className="text-orange-400 font-semibold">📥 Withdrawing {actionAmount} BTC...</p>
                <p className="text-orange-300 text-sm">Returning your BTC from vault to wallet</p>
                <a href={`https://explorer.test.mezo.org/tx/${withdrawHash}`} target="_blank" rel="noopener noreferrer" className="text-orange-300 text-xs underline hover:text-orange-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}

        {/* Action-Specific Success Popups */}
        {isDepositSuccess && (
          <div className="glass p-4 rounded-2xl border border-green-500/20 bg-green-500/10 animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">✓ BTC Deposited Successfully!</p>
                <p className="text-green-300 text-sm mt-1">📦 Vault now holds: {collateralBalance} BTC</p>
                <p className="text-green-300 text-sm">💼 Available to borrow: ~{Math.floor(parseFloat(collateralBalance) * 50000 * 0.9)} MUSD</p>
                <p className="text-green-300 text-sm">🔒 Collateral ratio: {collateralRatio.toFixed(2)}% (Safe)</p>
                {depositHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${depositHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-xs underline hover:text-green-200 inline-block mt-1"
                  >
                    📄 View Transaction on Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {isBorrowSuccess && (
          <div className="glass p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-blue-400 font-semibold">✓ MUSD Borrowed Successfully!</p>
                <p className="text-blue-300 text-sm mt-1">💵 You received: {actionAmount} MUSD</p>
                <p className="text-blue-300 text-sm">📊 MUSD in wallet: {musdBalance} MUSD</p>
                <p className="text-blue-300 text-sm">🔒 Collateral ratio: {collateralRatio.toFixed(2)}%</p>
                <p className="text-blue-300 text-sm">💰 Interest rate: {interestRate}% APR (Fixed)</p>
                {borrowHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${borrowHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 text-xs underline hover:text-blue-200 inline-block mt-1"
                  >
                    📄 View Transaction on Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {isRepaySuccess && (
          <div className="glass p-4 rounded-2xl border border-purple-500/20 bg-purple-500/10 animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-purple-400 font-semibold">✓ Loan Repaid Successfully!</p>
                <p className="text-purple-300 text-sm mt-1">🔓 Debt cleared: ~{borrowedAmount} MUSD repaid</p>
                <p className="text-purple-300 text-sm">💼 Your {collateralBalance} BTC collateral is now available</p>
                <p className="text-purple-300 text-sm">✅ You can withdraw your BTC anytime</p>
                <Button
                  onClick={() => setActiveAction('withdraw')}
                  className="mt-2 bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1"
                >
                  🎁 Withdraw BTC Now
                </Button>
                {repayHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${repayHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 text-xs underline hover:text-purple-200 inline-block mt-1"
                  >
                    📄 View Transaction on Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {isWithdrawSuccess && (
          <div className="glass p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-semibold">✓ BTC Withdrawn Successfully!</p>
                <p className="text-yellow-300 text-sm mt-1">📤 Withdrawn: {actionAmount} BTC</p>
                <p className="text-yellow-300 text-sm">💼 Vault balance: {collateralBalance} BTC (remaining)</p>
                <p className="text-yellow-300 text-sm">✨ BTC is now back in your wallet</p>
                {withdrawHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${withdrawHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 text-xs underline hover:text-yellow-200 inline-block mt-1"
                  >
                    📄 View Transaction on Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Send Success Popup - using sendBitcoinHash */}
        {sendBitcoinHash && (
          <div className="glass p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">BTC sent successfully!</p>
                <p className="text-green-300 text-sm">Sent {actionAmount} BTC to {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</p>
                <a 
                  href={`https://explorer.test.mezo.org/tx/${sendBitcoinHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 text-xs underline hover:text-green-200"
                >
                  View on Explorer
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {activeAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-3xl border border-white/20 w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 font-title">{getActionTitle()}</h2>

            <div className="space-y-4 mb-6">
              {/* Recipient Address Field for Send Action */}
              {activeAction === 'send' && (
                <div>
                  <Label htmlFor="recipientAddress" className="text-sm text-white/70 mb-2 block">
                    Recipient Address
                  </Label>
                  <Input
                    id="recipientAddress"
                    type="text"
                    value={recipientAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className="glass border-white/20 focus:border-white/40 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Enter a valid Mezo testnet address
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="actionAmount" className="text-sm text-white/70 mb-2 block">
                  {getAmountLabel()}
                </Label>
                <Input
                  id="actionAmount"
                  type="number"
                  value={actionAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionAmount(e.target.value)}
                  placeholder="0.00"
                  className="glass border-white/20 focus:border-white/40 text-white placeholder:text-white/40"
                />
                {actionAmount && (activeAction === 'borrow' || activeAction === 'repay') && (
                  <p className="text-xs text-white/50 mt-1">
                    ≈ {parseFloat(actionAmount || '0') * 1.02} USD
                  </p>
                )}
              </div>

              <div className="glass border-white/20 px-4 py-3 rounded-lg">
                <p className="text-xs text-white/60 mb-1">Connected Wallet</p>
                <p className="text-sm text-white/80 font-mono">
                  {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </p>
              </div>

              <div className="glass border-white/20 px-4 py-3 rounded-lg">
                <p className="text-xs text-white/60 mb-1">{getBalanceInfo().label}</p>
                <p className="text-sm text-white/80 font-mono">{getBalanceInfo().value}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setActiveAction(null)}
                variant="outline"
                className="flex-1 glass-hover border border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={!actionAmount || isLoading || (activeAction === 'send' && !recipientAddress)}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white border-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {activeAction === 'deposit' && 'Confirming deposit...'}
                    {activeAction === 'borrow' && 'Borrowing MUSD...'}
                    {activeAction === 'repay' && 'Repaying loan...'}
                    {activeAction === 'withdraw' && 'Withdrawing BTC...'}
                    {activeAction === 'send' && 'Sending BTC...'}
                  </>
                ) : (
                  `Confirm ${getActionTitle()}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
