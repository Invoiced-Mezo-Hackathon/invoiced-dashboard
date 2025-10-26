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
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-title">Vault</h1>
        <p className="text-white/60">Manage your collateral and borrowing</p>
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
                <p className="text-sm text-white/60">BTC Balance</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90">Your Bitcoin that you put in. This keeps your loan safe.</p>
                  </div>
                </div>
              </div>
              <p className="text-xl font-bold">{vaultData?.collateralAmount || '0'} BTC</p>
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
        <div className="grid grid-cols-5 gap-4">
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
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60 mb-1">Interest Rate</p>
              <p className="text-2xl font-bold text-green-400">{vaultData?.interestRate || 0}%</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass p-4 rounded-2xl border border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Action-Specific Success Popups */}
        {isDepositSuccess && (
          <div className="glass p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">BTC deposited successfully!</p>
                <p className="text-green-300 text-sm">Collateral: {actionAmount} BTC</p>
                {depositHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${depositHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-xs underline hover:text-green-200"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {isBorrowSuccess && (
          <div className="glass p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">MUSD borrowed successfully!</p>
                <p className="text-green-300 text-sm">{actionAmount} MUSD sent to your wallet</p>
                {borrowHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${borrowHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-xs underline hover:text-green-200"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {isRepaySuccess && (
          <div className="glass p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Loan repaid successfully!</p>
                <p className="text-green-300 text-sm">Your collateral is now available.</p>
                <Button
                  onClick={() => setActiveAction('withdraw')}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                >
                  Withdraw Now
                </Button>
                {repayHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${repayHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-xs underline hover:text-green-200 block mt-1"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {isWithdrawSuccess && (
          <div className="glass p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">BTC withdrawn successfully!</p>
                <p className="text-green-300 text-sm">{actionAmount} BTC sent to your wallet</p>
                {withdrawHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${withdrawHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-xs underline hover:text-green-200"
                  >
                    View on Explorer
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
