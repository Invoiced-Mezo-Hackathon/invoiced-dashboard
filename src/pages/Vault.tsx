import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useMezoVault } from '@/hooks/useMezoVault';
import { MezoUtils } from '@/lib/mezo';

type VaultAction = 'deposit' | 'borrow' | 'repay' | 'withdraw' | null;

export function Vault() {
  const { address, isConnected } = useWallet();
  const [activeAction, setActiveAction] = useState<VaultAction>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionLocked, setActionLocked] = useState(false);
  const [lastBorrowedAmount, setLastBorrowedAmount] = useState<string>(''); // Store borrowed amount before clearing
  const [notifiedDeposit, setNotifiedDeposit] = useState(false);
  const [notifiedBorrow, setNotifiedBorrow] = useState(false);
  const [notifiedRepay, setNotifiedRepay] = useState(false);
  const [notifiedWithdraw, setNotifiedWithdraw] = useState(false);
  
  const { 
    vaultData, 
    isLoading, 
    error,
    musdBalance,
    walletBtcBalance, // Wallet BTC balance
    collateralBalance,
    borrowedAmount,
    totalDueNow,
    collateralRatio,
    interestRate,
    depositCollateral,
    borrowMUSD,
    repayMUSD,
    withdrawCollateral,
    isPending,
    isDepositSuccess,
    isBorrowSuccess,
    isRepaySuccess,
    isWithdrawSuccess,
    isDepositConfirming,
    isBorrowConfirming,
    isRepayConfirming,
    isWithdrawConfirming,
    depositHash,
    borrowHash,
    repayHash,
    withdrawHash,
    approvalHash,
    musdAllowance,
    refetchAll,
    isMusdBalanceLoading,
    maxWithdrawable,
  } = useMezoVault();

  // Refetch balance when repay modal opens (after borrow)
  useEffect(() => {
    if (activeAction === 'repay') {
      console.log('🔄 Repay modal opened - refreshing MUSD balance...');
      refetchAll();
    }
    // reset per-action notification latches when changing action
    setNotifiedDeposit(false);
    setNotifiedBorrow(false);
    setNotifiedRepay(false);
    setNotifiedWithdraw(false);
  }, [activeAction, refetchAll]);

  // Visual configuration for action buttons (colors and icons)
  const actionStyles: Record<Exclude<VaultAction, null>, { bg: string; border: string; hoverBg: string; hoverBorder: string; iconClass: string; }> = {
    deposit: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-400/30',
      hoverBg: 'hover:bg-blue-500/30',
      hoverBorder: 'hover:border-blue-400/50',
      iconClass: 'fa-solid fa-circle-down',
    },
    borrow: {
      bg: 'bg-green-500/20',
      border: 'border-green-400/30',
      hoverBg: 'hover:bg-green-500/30',
      hoverBorder: 'hover:border-green-400/50',
      iconClass: 'fa-solid fa-hand-holding-dollar',
    },
    repay: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-400/30',
      hoverBg: 'hover:bg-yellow-500/30',
      hoverBorder: 'hover:border-yellow-400/50',
      iconClass: 'fa-solid fa-rotate-left',
    },
    withdraw: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-400/30',
      hoverBg: 'hover:bg-orange-500/30',
      hoverBorder: 'hover:border-orange-400/50',
      iconClass: 'fa-solid fa-arrow-up-from-bracket',
    },
  };

  // One-shot notifications per success state
  useEffect(() => {
    if (isDepositSuccess && !notifiedDeposit) {
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { key: `vault_deposit_${depositHash || actionAmount || '0'}`, title: 'Vault: Deposit confirmed', message: `${actionAmount || '0'} BTC deposited` } })); } catch {}
      setNotifiedDeposit(true);
    }
  }, [isDepositSuccess, notifiedDeposit, actionAmount]);

  useEffect(() => {
    if (isBorrowSuccess && !notifiedBorrow) {
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { key: `vault_borrow_${borrowHash || lastBorrowedAmount || actionAmount || '0'}`, title: 'Vault: Borrow confirmed', message: `${lastBorrowedAmount || actionAmount || '0'} MUSD borrowed` } })); } catch {}
      setNotifiedBorrow(true);
    }
  }, [isBorrowSuccess, notifiedBorrow, actionAmount, lastBorrowedAmount]);

  useEffect(() => {
    if (isRepaySuccess && !notifiedRepay) {
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { key: `vault_repay_${repayHash || actionAmount || borrowedAmount || '0'}`, title: 'Vault: Repay confirmed', message: `${actionAmount || borrowedAmount || '0'} MUSD repaid` } })); } catch {}
      setNotifiedRepay(true);
    }
  }, [isRepaySuccess, notifiedRepay, actionAmount, borrowedAmount]);

  useEffect(() => {
    if (isWithdrawSuccess && !notifiedWithdraw) {
      try { window.dispatchEvent(new CustomEvent('notify', { detail: { key: `vault_withdraw_${withdrawHash || actionAmount || '0'}`, title: 'Vault: Withdraw confirmed', message: `${actionAmount || '0'} BTC withdrawn` } })); } catch {}
      setNotifiedWithdraw(true);
    }
  }, [isWithdrawSuccess, notifiedWithdraw, actionAmount]);

  const handleAction = async () => {
    if (!activeAction || !actionAmount) return;
    
    // No send action anymore

    try {
      switch (activeAction) {
        case 'deposit':
          await depositCollateral(actionAmount);
          // Keep modal open to show transaction status and success message
          break;
        case 'borrow':
          setLastBorrowedAmount(actionAmount); // Store before clearing
          await borrowMUSD(actionAmount);
          // Keep modal open to show success message
          break;
        case 'repay': {
          // Call repay - it handles errors internally
          // Don't await or wrap in try-catch to avoid interfering with wallet popup
          repayMUSD(actionAmount).catch(err => {
            console.error('Repay action error:', err);
            // Error is already handled in the repayMUSD function
          });
          // Keep modal open to show transaction status
          break;
        }
        case 'withdraw':
          await withdrawCollateral(actionAmount);
          // Keep modal open to show transaction status and success message
          break;
      }
      
      // Don't clear actionAmount or close modal - let success messages show
      // User will close modal manually via success message buttons
      
      // Modal stays open for all actions to show status/success messages
    } catch (err) {
      console.error('Vault action failed:', err);
      // Error is handled by the hook, but keep modal open so user can see error
      // Don't close the modal on error
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

  // Stabilize collateral ratio display to avoid absurd values when debt is near zero
  // Professional DeFi standard: show actual percentages, cap display at 500% for UI clarity
  const COLLATERAL_RATIO_MAX_DISPLAY = 500; // Standard DeFi display cap
  
  const displayCollateralRatio = useMemo(() => {
    const raw = Number(vaultData?.collateralRatio || 0);
    if (!Number.isFinite(raw) || raw < 0) return 0;
    // If borrowed is repaid (very small or zero), treat as 0% (no applicable ratio)
    if (Number(borrowedAmount || '0') <= 0) return 0;
    // Cap at professional maximum for UI display (DeFi standard: 500%)
    return Math.min(raw, COLLATERAL_RATIO_MAX_DISPLAY);
  }, [vaultData?.collateralRatio, borrowedAmount]);

  const displayCollateralRatioText = useMemo(() => {
    const val = displayCollateralRatio;
    const raw = Number(vaultData?.collateralRatio || 0);
    // If raw value exceeds display cap, show capped value with "+" indicator
    if (raw > COLLATERAL_RATIO_MAX_DISPLAY && val >= COLLATERAL_RATIO_MAX_DISPLAY) {
      return `${COLLATERAL_RATIO_MAX_DISPLAY}+`;
    }
    // Format based on value range for readability
    if (val >= 100) return Math.round(val).toString();
    if (val >= 10) return val.toFixed(1);
    return val.toFixed(2);
  }, [displayCollateralRatio, vaultData?.collateralRatio]);

  const getActionTitle = () => {
    if (!activeAction) return '';
    return activeAction.charAt(0).toUpperCase() + activeAction.slice(1);
  };

  const getAmountLabel = () => {
    switch (activeAction) {
      case 'deposit':
      case 'withdraw':
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
        return {
          label: 'Wallet BTC Balance',
          value: `${walletBtcBalance} BTC`
        };
      case 'withdraw':
        const safeMusdForWithdraw = musdBalance && !isNaN(parseFloat(musdBalance)) && parseFloat(musdBalance) >= 0 
          ? musdBalance 
          : '0';
        return {
          label: 'Vault BTC Balance',
          value: `${collateralBalance} BTC`,
          additionalInfo: `Your MUSD Balance: ${safeMusdForWithdraw} MUSD`
        };
      case 'borrow':
      case 'repay':
        const safeBalance = musdBalance && !isNaN(parseFloat(musdBalance)) && parseFloat(musdBalance) >= 0 
          ? musdBalance 
          : '0';
        return {
          label: 'Current MUSD Balance',
          value: `${safeBalance} MUSD`
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">Vault</h1>
        <p className="text-sm font-navbar text-white/60">Manage your collateral and borrowing</p>
      </div>

      {/* Primary Actions - moved to top */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
            {(['deposit', 'borrow', 'repay', 'withdraw'] as const).map((actionKey) => (
            <button
              key={actionKey}
                onClick={() => { setActiveAction(actionKey); setActionLocked(false); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-navbar text-white min-h-[44px] ${actionStyles[actionKey].bg} border ${actionStyles[actionKey].border} ${actionStyles[actionKey].hoverBg} ${actionStyles[actionKey].hoverBorder} transition-all duration-200 capitalize whitespace-nowrap touch-manipulation active:scale-95`}
            >
              <span className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center bg-white/10">
                <i className={`${actionStyles[actionKey].iconClass} text-white text-xs`}></i>
              </span>
              {actionKey}
            </button>
          ))}
        </div>
        
        {/* Rewards Banner (compact, replaces previous balance chip) */}
          <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30">
            <span className="text-base">🎁</span>
            <span className="text-xs font-navbar text-purple-300">Earn mats rewards coming soon</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Circular Gauge */}
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-8 rounded-3xl border border-green-400/10 flex flex-col items-center">
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
                strokeDasharray={`${(Math.min(displayCollateralRatio, COLLATERAL_RATIO_MAX_DISPLAY) / COLLATERAL_RATIO_MAX_DISPLAY) * 502.4} 502.4`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold font-navbar">{displayCollateralRatioText}%</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-navbar text-white/60">Collateral Ratio</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90">This shows how safe your money is. Higher number = safer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full">
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
              <p className="text-xl font-bold font-navbar">{collateralBalance} BTC</p>
              <p className="text-xs font-navbar text-white/50">Wallet: {walletBtcBalance} BTC</p>
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
              <p className="text-xl font-bold font-navbar">{vaultData?.borrowedAmount || '0'}</p>
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
              <p className={`text-xl font-bold font-navbar ${getRiskColor(getRiskLevel())}`}>
                {getRiskLevel().charAt(0).toUpperCase() + getRiskLevel().slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (removed from here; moved to top) */}

        {/* Value Display */}
        <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-6 rounded-2xl border border-green-400/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-navbar text-white/60 mb-1">MUSD Balance</p>
              <p className="text-3xl font-bold font-navbar">{musdBalance} MUSD</p>
              {parseFloat(musdBalance) > 0 && (
                <p className="text-xs font-navbar text-green-400 mt-1">✓ Available to spend or withdraw</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-navbar text-white/60 mb-1">Interest Rate</p>
              <p className="text-2xl font-bold font-navbar text-green-400">{vaultData?.interestRate || 0}%</p>
            </div>
          </div>

          {/* Borrowed (principal) and Total Due Now (principal + accrued interest) */}
          {parseFloat(borrowedAmount) > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-navbar text-white/60">Borrowed</p>
                <p className="text-lg font-navbar font-semibold">{borrowedAmount} MUSD</p>
              </div>
              <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-navbar text-white/60">Total due now</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-green-400/30 text-green-300 bg-green-500/20">live</span>
                </div>
                <p className="text-lg font-navbar font-semibold text-green-300">{totalDueNow || '0'} MUSD</p>
                <p className="text-[10px] font-navbar text-green-200/70 mt-1">Interest accrues daily at {Number.isFinite(interestRate) ? interestRate : '0'}% APR</p>
              </div>
            </div>
          )}
        </div>

        {/* MUSD Usage Guide */}
        {parseFloat(musdBalance) > 0 && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-6 rounded-2xl border border-green-400/20 bg-green-500/10">
            <h3 className="text-lg font-bold mb-3 font-navbar text-green-400">💡 How to Use Your MUSD</h3>
            <div className="space-y-2 text-sm font-navbar text-white/80">
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
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-navbar">{error}</p>
            </div>
          </div>
        )}

        {/* Pending Transaction Notifications - Stage-Specific */}
        {depositHash && isPending && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              <div>
                <p className="text-green-400 font-semibold font-navbar">📤 Depositing {actionAmount} BTC...</p>
                <p className="text-green-300 text-sm font-navbar">Your BTC is being secured in the vault</p>
                <a href={`https://explorer.test.mezo.org/tx/${depositHash}`} target="_blank" rel="noopener noreferrer" className="text-green-300 text-xs font-navbar underline hover:text-green-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}
        
        {borrowHash && isPending && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              <div>
                <p className="text-green-400 font-semibold font-navbar">💰 Borrowing {actionAmount} MUSD...</p>
                <p className="text-green-300 text-sm font-navbar">Minting MUSD tokens for your wallet</p>
                <a href={`https://explorer.test.mezo.org/tx/${borrowHash}`} target="_blank" rel="noopener noreferrer" className="text-green-300 text-xs font-navbar underline hover:text-green-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}
        
        {repayHash && isPending && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              <div>
                <p className="text-green-400 font-semibold font-navbar">💸 Repaying {actionAmount} MUSD...</p>
                <p className="text-green-300 text-sm font-navbar">Burning MUSD tokens and clearing your debt</p>
                <a href={`https://explorer.test.mezo.org/tx/${repayHash}`} target="_blank" rel="noopener noreferrer" className="text-green-300 text-xs font-navbar underline hover:text-green-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}
        
        {withdrawHash && isPending && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              <div>
                <p className="text-green-400 font-semibold font-navbar">📥 Withdrawing {actionAmount} BTC...</p>
                <p className="text-green-300 text-sm font-navbar">Returning your BTC from vault to wallet</p>
                <a href={`https://explorer.test.mezo.org/tx/${withdrawHash}`} target="_blank" rel="noopener noreferrer" className="text-green-300 text-xs font-navbar underline hover:text-green-200 inline-block mt-1">📄 View Transaction →</a>
              </div>
            </div>
          </div>
        )}

        {/* Action-Specific Success Popups */}
        {isDepositSuccess && (
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-4 rounded-2xl border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold font-navbar">✓ BTC Deposited Successfully!</p>
                <p className="text-green-300 text-sm mt-1">📦 Vault now holds: {collateralBalance} BTC</p>
                <p className="text-green-300 text-sm">💼 Available to borrow: ~{collateralBalance && !isNaN(parseFloat(collateralBalance)) ? Math.floor(parseFloat(collateralBalance) * 50000 * 0.9) : 0} MUSD</p>
                <p className="text-green-300 text-sm">🔒 Collateral ratio: {collateralRatio.toFixed(2)}% (Safe)</p>
                {depositHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${depositHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-xs underline hover:text-green-200 inline-block mt-2"
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
              <div className="flex-1">
                <p className="text-blue-400 font-semibold font-navbar">✓ MUSD Borrowed Successfully!</p>
                <p className="text-blue-300 text-sm mt-1 font-navbar">💵 You received: {lastBorrowedAmount || actionAmount || '0'} MUSD</p>
                <div className="mt-2 p-2 rounded-lg bg-green-500/20 border border-green-400/30">
                  <p className="text-blue-300 text-sm font-navbar font-semibold">
                    📊 Your MUSD Balance: <span className="text-green-300 text-base">{musdBalance} MUSD</span>
                    {parseFloat(musdBalance) === 0 && (
                      <span className="text-blue-400/70 ml-1 text-xs">(refreshing...)</span>
                    )}
                  </p>
                  {parseFloat(musdBalance) > 0 && (
                    <p className="text-green-300 text-xs mt-1 font-navbar">✓ MUSD is confirmed in your wallet - visible everywhere in vault!</p>
                  )}
                  {parseFloat(musdBalance) === 0 && (
                    <p className="text-blue-300 text-xs mt-1 font-navbar">⏳ Balance updating... check console for refresh status</p>
                  )}
                </div>
                <p className="text-blue-300 text-sm">🔒 Collateral ratio: {Number.isFinite(collateralRatio) ? collateralRatio.toFixed(2) : '0.00'}%</p>
                <p className="text-blue-300 text-sm">💰 Interest rate: {Number.isFinite(interestRate) ? interestRate : '0'}% APR (Fixed)</p>
                <p className="text-blue-200 text-xs mt-2 pt-2 border-t border-blue-400/20">
                  ℹ️ Interest accrues over time. Current debt = borrowed amount (interest added incrementally).
                </p>
                <Button
                  onClick={() => {
                    setActionAmount('');
                    setLastBorrowedAmount('');
                    setActiveAction(null);
                  }}
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-2"
                >
                  ✓ Got it
                </Button>
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
              <div className="flex-1">
                <p className="text-purple-400 font-semibold font-navbar">✓ MUSD Repaid Successfully!</p>
                <p className="text-purple-300 text-sm mt-1 font-navbar">💸 Repaid: {actionAmount || borrowedAmount || '0'} MUSD</p>
                {parseFloat(borrowedAmount) > 0 ? (
                  <>
                    <p className="text-purple-300 text-sm font-navbar">📊 Remaining debt: {borrowedAmount} MUSD (will continue to accrue interest)</p>
                    <p className="text-purple-300 text-sm font-navbar">💡 Repay the remaining amount to unlock your BTC</p>
                  </>
                ) : (
                  <>
                    <p className="text-purple-300 text-sm font-navbar">🔓 All debt cleared - Your BTC is now unlocked!</p>
                    <p className="text-purple-300 text-sm font-navbar">💼 You can withdraw your {collateralBalance || '0'} BTC collateral</p>
                  </>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => {
                      setActiveAction('withdraw');
                      setActionAmount(collateralBalance);
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-4 py-2 font-navbar"
                  >
                    🎁 Withdraw BTC Now
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveAction(null);
                      setActionAmount('');
                    }}
                    variant="outline"
                    className="bg-purple-500/20 border-purple-400/30 text-purple-300 text-xs px-4 py-2 font-navbar hover:bg-purple-500/30"
                  >
                    ✓ Done
                  </Button>
                </div>
                {repayHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${repayHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 text-xs underline hover:text-purple-200 inline-block mt-2 font-navbar"
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
                <p className="text-yellow-300 text-sm mt-1">📤 Withdrawn: {actionAmount || '0'} BTC</p>
                <p className="text-yellow-300 text-sm">💼 Vault balance: {collateralBalance || '0'} BTC (remaining)</p>
                <p className="text-yellow-300 text-sm">✨ BTC is now back in your wallet</p>
                <p className="text-yellow-300 text-xs mt-1">💰 Your MUSD Balance: {musdBalance} MUSD</p>
                <div className="mt-3">
                  <Button
                    onClick={() => {
                      setActiveAction(null);
                      setActionAmount('');
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-4 py-2"
                  >
                    ✓ Got it
                  </Button>
                </div>
                {withdrawHash && (
                  <a 
                    href={`https://explorer.test.mezo.org/tx/${withdrawHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 text-xs underline hover:text-yellow-200 inline-block mt-2"
                  >
                    📄 View Transaction on Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        
      </div>

      {/* Action Modal */}
      {activeAction && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 safe-area-inset"
          onClick={(e) => {
            // Close modal when clicking outside (only if not clicking on the modal content)
            if (e.target === e.currentTarget) {
              setActiveAction(null);
              setActionAmount('');
              setActionLocked(false);
            }
          }}
        >
          <div 
            className="bg-[#2C2C2E]/90 backdrop-blur-xl p-5 sm:p-8 rounded-xl sm:rounded-3xl border border-green-400/20 w-full max-w-md mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setActiveAction(null);
                setActionAmount('');
                setLastBorrowedAmount('');
                setActionLocked(false);
              }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center"
            >
              ✕
            </button>
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-6 font-navbar text-white">
              {activeAction === 'deposit' && <span className="text-[#F7931A] text-lg">₿</span>}
              {getActionTitle()}
            </h2>
            
            {/* Compact MUSD Balance Status for repay */}
            {activeAction === 'repay' && (
              <div className="mb-4 p-3 rounded-lg bg-[#2C2C2E]/40 border border-green-400/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {parseFloat(musdBalance) > 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-navbar text-green-300">Wallet Balance:</span>
                        <span className="text-sm font-navbar font-semibold text-green-200">{musdBalance} MUSD</span>
                      </>
                    ) : !isMusdBalanceLoading ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-navbar text-yellow-300">No MUSD in wallet</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        <span className="text-xs font-navbar text-blue-300">Checking balance...</span>
                      </>
                    )}
                  </div>
                  {parseFloat(musdBalance) === 0 && !isMusdBalanceLoading && (
                    <button
                      type="button"
                      onClick={() => refetchAll()}
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-navbar"
                    >
                      🔄 Refresh
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* MUSD Balance Info for other actions */}
            {(activeAction === 'borrow' || activeAction === 'withdraw') && parseFloat(musdBalance) >= 0 && (
              <div className="mb-4 bg-blue-500/5 border border-blue-400/20 rounded-lg p-2">
                <p className="text-xs font-navbar text-blue-300">
                  💰 Your MUSD Balance: <strong className="text-blue-200">{musdBalance} MUSD</strong>
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              
              
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
                  className="bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 focus:border-green-400/40 text-white placeholder:text-white/40"
                />
                {activeAction === 'withdraw' && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-lg border border-purple-400/20 bg-[#2C2C2E]/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-navbar text-white/60">Max withdrawable now</p>
                        <p className="text-sm font-navbar font-semibold text-purple-300">{maxWithdrawable} BTC</p>
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setActionAmount(maxWithdrawable)}
                          disabled={parseFloat(maxWithdrawable || '0') === 0}
                          className="flex-1 text-xs font-navbar px-3 py-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-400/30 hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Withdraw Max
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 mt-2">Based on current debt and repayments</p>
                    </div>
                    {parseFloat(borrowedAmount || '0') > 0 && (
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                        <p className="text-[10px] font-navbar text-yellow-300">
                          Withdrawing while in debt reduces your safety buffer. Remaining debt: {borrowedAmount} MUSD.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeAction === 'repay' && (
                  <div className="mt-3 space-y-3">
                    {/* Debt Summary - Compact */}
                    <div className="rounded-lg border border-green-400/20 bg-[#2C2C2E]/40 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-navbar text-white/60">Total Due:</p>
                        <p className="text-base font-navbar font-semibold text-green-300">{totalDueNow} MUSD</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-navbar pt-2 border-t border-white/10">
                        <div>
                          <span className="text-white/50">Principal:</span>
                          <span className="text-white/70 ml-1">{borrowedAmount} MUSD</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white/50">Interest:</span>
                          <span className="text-green-300/70 ml-1">
                            {parseFloat(totalDueNow) > parseFloat(borrowedAmount) ? (parseFloat(totalDueNow) - parseFloat(borrowedAmount)).toFixed(6) : '0.00'} MUSD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActionAmount(totalDueNow)}
                        className="flex-1 text-xs font-navbar px-3 py-2 rounded-lg bg-green-500/10 text-green-300 border border-green-400/30 hover:bg-green-500/20 transition-colors"
                      >
                        Pay All ({totalDueNow} MUSD)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const balanceNum = parseFloat(musdBalance || '0');
                          const totalDueNum = parseFloat(totalDueNow || '0');
                          if (isNaN(balanceNum) || isNaN(totalDueNum)) return;
                          const maxAvailable = Math.min(balanceNum, totalDueNum);
                          if (maxAvailable > 0) {
                            setActionAmount(maxAvailable.toString());
                          }
                        }}
                        disabled={parseFloat(musdBalance) === 0}
                        className="flex-1 text-xs font-navbar px-3 py-2 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Pay Max Available
                      </button>
                    </div>

                    {/* Partial Payment Warning */}
                    {parseFloat(musdBalance) > 0 && parseFloat(musdBalance) < parseFloat(totalDueNow) && (
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                        <p className="text-[10px] font-navbar text-yellow-300">
                          ⚠️ You can repay {musdBalance} MUSD. Remaining: {(parseFloat(totalDueNow) - parseFloat(musdBalance)).toFixed(6)} MUSD (will accrue interest)
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {actionAmount && (activeAction === 'borrow' || activeAction === 'repay') && (
                  <p className="text-xs text-white/50 mt-1">
                    ≈ {parseFloat(actionAmount || '0') * 1.02} USD
                  </p>
                )}
              </div>

              <div className="bg-[#2C2C2E]/20 border border-green-400/10 px-4 py-3 rounded-lg">
                <p className="text-xs text-white/60 mb-1">Connected Wallet</p>
                <p className="text-sm text-white/80 font-mono">
                  {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </p>
              </div>

              <div className="bg-[#2C2C2E]/20 border border-green-400/10 px-4 py-3 rounded-lg">
                <p className="text-xs text-white/60 mb-1">{getBalanceInfo().label}</p>
                <p className="text-sm text-white/80 font-mono">{getBalanceInfo().value}</p>
                {getBalanceInfo().additionalInfo && (
                  <p className="text-xs text-green-400/70 mt-1">{getBalanceInfo().additionalInfo}</p>
                )}
                {/* MUSD balance for non-deposit actions (but skip for repay since it's shown at top) */}
                {activeAction !== 'deposit' && activeAction !== 'repay' && activeAction !== null && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-blue-300 font-semibold">
                      💰 Your MUSD Balance: <strong className="text-blue-200">{musdBalance || '0'} MUSD</strong>
                      {isMusdBalanceLoading && <span className="text-blue-400/70 ml-1">(updating...)</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setActiveAction(null);
                  setActionAmount('');
                  setLastBorrowedAmount(''); // Clear borrow amount too
                  setActionLocked(false);
                }}
                variant="outline"
                disabled={isLoading && (isDepositConfirming || isBorrowConfirming || isRepayConfirming || isWithdrawConfirming)} // Only disable during actual blockchain confirmation
                className="flex-1 bg-[#2C2C2E]/40 backdrop-blur-xl border border-green-400/20 hover:border-green-400/40 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (actionLocked) return;
                  if (activeAction === 'repay') {
                    // For repay, ensure balance is fresh and trigger wallet popup
                    console.log('🔄 Confirming repay - balance check:', { musdBalance, actionAmount, totalDueNow });
                    if (parseFloat(musdBalance) > 0) {
                      console.log('✅ MUSD balance confirmed:', musdBalance, '- Wallet popup will appear now');
                    } else {
                      console.warn('⚠️ MUSD balance is 0, but proceeding - may need approval first');
                    }
                  }
                  setActionLocked(true);
                  handleAction();
                }}
                disabled={actionLocked || !actionAmount || isLoading || (activeAction === 'repay' && parseFloat(musdBalance) === 0 && !isMusdBalanceLoading)}
                className="flex-1 bg-green-400 hover:bg-green-500 text-white border-0"
              >
                {actionLocked ? (
                  'Submitted — close to continue'
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {activeAction === 'deposit' && 'Confirming deposit...'}
                    {activeAction === 'borrow' && 'Borrowing MUSD...'}
                    {activeAction === 'repay' && (approvalHash ? 'Approving MUSD...' : 'Repaying loan...')}
                    {activeAction === 'withdraw' && 'Withdrawing BTC...'}
                    
                  </>
                ) : (
                  activeAction === 'repay' ? (
                    parseFloat(musdAllowance) < parseFloat(actionAmount || '0') 
                      ? 'Approve MUSD' 
                      : parseFloat(musdBalance) > 0
                        ? 'Confirm Repay'
                        : 'Waiting for Balance...'
                  ) : `Confirm ${getActionTitle()}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
