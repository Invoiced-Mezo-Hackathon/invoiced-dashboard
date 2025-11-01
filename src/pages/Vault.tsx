import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useMezoVault } from '@/hooks/useMezoVault';
import { MezoUtils } from '@/lib/mezo';
import { MatsDisplay } from '@/components/MatsDisplay';
import { matsRewards } from '@/services/mats-rewards';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

type VaultAction = 'deposit' | 'borrow' | 'repay' | 'withdraw' | null;

export function Vault() {
  const { address: walletAddress, isConnected } = useWallet();
  const { address } = useAccount();
  const [activeAction, setActiveAction] = useState<VaultAction>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionLocked, setActionLocked] = useState(false);
  const [lastBorrowedAmount, setLastBorrowedAmount] = useState<string>(''); // Store borrowed amount before clearing
  const [notifiedDeposit, setNotifiedDeposit] = useState(false);
  const [notifiedBorrow, setNotifiedBorrow] = useState(false);
  const [notifiedRepay, setNotifiedRepay] = useState(false);
  const [notifiedWithdraw, setNotifiedWithdraw] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{type: string; message: string; hash: string | null} | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  
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
    isApprovalSuccess,
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

  // Fetch Bitcoin price for USD conversion
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBitcoinPrice(data.bitcoin.usd || 65000);
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        setBitcoinPrice(65000); // Fallback price
      }
    };
    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  // Auto-close modal when transaction is confirmed (like invoice form) and add MATS rewards
  useEffect(() => {
    if (isDepositSuccess && depositHash && activeAction === 'deposit') {
      console.log('✅ Deposit confirmed - auto-closing modal');
      
      // Add MATS rewards and send notification
      if (address && actionAmount) {
        const matsEarned = matsRewards.calculateVaultRewards('deposit', actionAmount);
        matsRewards.addReward(address, {
          amount: matsEarned,
          source: 'vault',
          action: 'deposit',
          description: `Deposited ${actionAmount} BTC`,
          metadata: { amount: actionAmount },
        });
        if (matsEarned > 0) {
          toast.success(`🎉 Earned ${matsEarned} MATS!`, { duration: 3000 });
        }
        // Send notification
        try {
          window.dispatchEvent(new CustomEvent('notify', {
            detail: {
              title: 'Deposit Confirmed',
              message: matsEarned > 0 ? `Deposited ${actionAmount} BTC • +${matsEarned} MATS` : `Deposited ${actionAmount} BTC`,
              key: `deposit-${depositHash}-${Date.now()}`,
            }
          }));
        } catch {}
      }
      
      // Show success message at top
      setSuccessMessage({
        type: 'deposit',
        message: `✓ BTC Deposited! Vault: ${collateralBalance} BTC`,
        hash: depositHash,
      });
      
      // Auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      // Small delay to show success briefly before closing
      const timer = setTimeout(() => {
        setActiveAction(null);
        setActionAmount('');
        setActionLocked(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [isDepositSuccess, depositHash, activeAction, address, actionAmount, collateralBalance]);

  useEffect(() => {
    if (isBorrowSuccess && borrowHash && activeAction === 'borrow') {
      console.log('✅ Borrow confirmed - auto-closing modal');
      
      // Add MATS rewards and send notification
      if (address && actionAmount) {
        const matsEarned = matsRewards.calculateVaultRewards('borrow', actionAmount);
        matsRewards.addReward(address, {
          amount: matsEarned,
          source: 'vault',
          action: 'borrow',
          description: `Borrowed ${actionAmount} MUSD`,
          metadata: { amount: actionAmount },
        });
        if (matsEarned > 0) {
          toast.success(`🎉 Earned ${matsEarned} MATS!`, { duration: 3000 });
        }
        // Send notification
        try {
          window.dispatchEvent(new CustomEvent('notify', {
            detail: {
              title: 'Borrow Successful',
              message: matsEarned > 0 ? `Borrowed ${actionAmount} MUSD • +${matsEarned} MATS` : `Borrowed ${actionAmount} MUSD`,
              key: `borrow-${borrowHash}-${Date.now()}`,
            }
          }));
        } catch {}
      }
      
      // Show success message at top
      setSuccessMessage({
        type: 'borrow',
        message: `✓ MUSD Borrowed! Balance: ${musdBalance} MUSD`,
        hash: borrowHash,
      });
      
      // Auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      const timer = setTimeout(() => {
        setActiveAction(null);
        setActionAmount('');
        setLastBorrowedAmount('');
        setActionLocked(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [isBorrowSuccess, borrowHash, activeAction, address, actionAmount, musdBalance]);

  useEffect(() => {
    if (isRepaySuccess && repayHash && activeAction === 'repay') {
      console.log('✅ Repay confirmed - auto-closing modal');
      
      // Add MATS rewards and send notification
      if (address && actionAmount) {
        const matsEarned = matsRewards.calculateVaultRewards('repay', actionAmount);
        matsRewards.addReward(address, {
          amount: matsEarned,
          source: 'vault',
          action: 'repay',
          description: `Repaid ${actionAmount} MUSD`,
          metadata: { amount: actionAmount },
        });
        if (matsEarned > 0) {
          toast.success(`🎉 Earned ${matsEarned} MATS!`, { duration: 3000 });
        }
        // Send notification
        try {
          window.dispatchEvent(new CustomEvent('notify', {
            detail: {
              title: 'Repay Confirmed',
              message: matsEarned > 0 ? `Repaid ${actionAmount} MUSD • +${matsEarned} MATS` : `Repaid ${actionAmount} MUSD`,
              key: `repay-${repayHash}-${Date.now()}`,
            }
          }));
        } catch {}
      }
      
      // Show success message at top
      setSuccessMessage({
        type: 'repay',
        message: `✓ MUSD Repaid! Remaining: ${borrowedAmount} MUSD`,
        hash: repayHash,
      });
      
      // Auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      const timer = setTimeout(() => {
        setActiveAction(null);
        setActionAmount('');
        setActionLocked(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [isRepaySuccess, repayHash, activeAction, address, actionAmount, borrowedAmount]);

  useEffect(() => {
    if (isWithdrawSuccess && withdrawHash && activeAction === 'withdraw') {
      console.log('✅ Withdraw confirmed - auto-closing modal');
      
      // Add MATS rewards and send notification
      if (address && actionAmount) {
        const matsEarned = matsRewards.calculateVaultRewards('withdraw', actionAmount);
        matsRewards.addReward(address, {
          amount: matsEarned,
          source: 'vault',
          action: 'withdraw',
          description: `Withdrew ${actionAmount} BTC`,
          metadata: { amount: actionAmount },
        });
        if (matsEarned > 0) {
          toast.success(`🎉 Earned ${matsEarned} MATS!`, { duration: 3000 });
        }
        // Send notification
        try {
          window.dispatchEvent(new CustomEvent('notify', {
            detail: {
              title: 'Withdraw Confirmed',
              message: matsEarned > 0 ? `Withdrew ${actionAmount} BTC • +${matsEarned} MATS` : `Withdrew ${actionAmount} BTC`,
              key: `withdraw-${withdrawHash}-${Date.now()}`,
            }
          }));
        } catch {}
      }
      
      // Show success message at top
      setSuccessMessage({
        type: 'withdraw',
        message: `✓ BTC Withdrawn! Vault: ${collateralBalance} BTC`,
        hash: withdrawHash,
      });
      
      // Auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      const timer = setTimeout(() => {
        setActiveAction(null);
        setActionAmount('');
        setActionLocked(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [isWithdrawSuccess, withdrawHash, activeAction, address, actionAmount, collateralBalance]);

  // Reset actionLocked when errors occur (so user can try again)
  useEffect(() => {
    if (error && activeAction) {
      console.log('⚠️ Error occurred - resetting action lock so user can retry');
      setActionLocked(false);
      // Clear success message on error
      setSuccessMessage(null);
    }
  }, [error, activeAction]);

  // Clear success message when starting a new action
  useEffect(() => {
    if (activeAction) {
      setSuccessMessage(null);
    }
  }, [activeAction]);

  // Reset actionLocked when approval succeeds (for repay flow - user can now proceed)
  useEffect(() => {
    if (isApprovalSuccess && activeAction === 'repay') {
      console.log('✅ Approval confirmed - unlocking button for repay');
      setActionLocked(false);
    }
  }, [isApprovalSuccess, activeAction]);

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

  const COLLATERAL_RATIO_MAX_DISPLAY = 300;

  const getRiskLevel = (): 'healthy' | 'moderate' | 'risky' => {
    const ratio = vaultData?.collateralRatio || 0;
    if (ratio >= 150) return 'healthy';
    if (ratio >= 120) return 'moderate';
    return 'risky';
  };

  const getRiskColor = (level: 'healthy' | 'moderate' | 'risky'): string => {
    switch (level) {
      case 'healthy':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'risky':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const displayCollateralRatio = useMemo(() => {
    const raw = Number(vaultData?.collateralRatio || 0);
    if (raw > COLLATERAL_RATIO_MAX_DISPLAY) {
      return COLLATERAL_RATIO_MAX_DISPLAY;
    }
    return Math.max(0, Math.min(raw, COLLATERAL_RATIO_MAX_DISPLAY));
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
      case 'withdraw': {
        const safeMusdForWithdraw = musdBalance && !isNaN(parseFloat(musdBalance)) && parseFloat(musdBalance) >= 0 
          ? musdBalance 
          : '0';
        return {
          label: 'Vault BTC Balance',
          value: `${collateralBalance} BTC`,
          additionalInfo: `Your MUSD Balance: ${safeMusdForWithdraw} MUSD`
        };
      }
      case 'borrow':
      case 'repay': {
        const safeBalance = musdBalance && !isNaN(parseFloat(musdBalance)) && parseFloat(musdBalance) >= 0 
          ? musdBalance 
          : '0';
        return {
          label: 'Current MUSD Balance',
          value: `${safeBalance} MUSD`
        };
      }
      default:
        return {
          label: 'Balance',
          value: '0'
        };
    }
  };

  const handleAction = () => {
    if (!actionAmount || parseFloat(actionAmount) <= 0) return;
    
    // Clear any existing success message when starting new action
    setSuccessMessage(null);

    switch (activeAction) {
      case 'deposit':
        depositCollateral(actionAmount);
        break;
      case 'borrow':
        borrowMUSD(actionAmount);
        setLastBorrowedAmount(actionAmount);
        break;
      case 'repay':
        repayMUSD(actionAmount);
        break;
      case 'withdraw':
        withdrawCollateral(actionAmount);
        break;
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-navbar text-white">Vault</h1>
        <p className="text-sm font-navbar text-white/60">Manage your collateral and borrowing</p>
      </div>

      {/* Sticky Success Message - Always Visible */}
      {successMessage && (
        <div className="sticky top-4 z-40 max-w-2xl mx-auto mb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-green-500/90 to-green-600/90 backdrop-blur-xl p-4 rounded-xl border border-green-400/50 shadow-lg shadow-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold font-navbar">{successMessage.message}</p>
                  {successMessage.hash && (
                    <a 
                      href={`https://explorer.test.mezo.org/tx/${successMessage.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 text-xs underline hover:text-white inline-block mt-1 font-navbar"
                    >
                      View Transaction →
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Transaction - Sticky */}
      {(depositHash && isPending) || (borrowHash && isPending) || (repayHash && isPending) || (withdrawHash && isPending) ? (
        <div className="sticky top-4 z-40 max-w-2xl mx-auto mb-4">
          <div className="bg-[#2C2C2E]/90 backdrop-blur-xl p-4 rounded-xl border border-green-500/20 bg-green-500/10 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-green-400 animate-spin flex-shrink-0" />
              <div className="flex-1">
                {depositHash && isPending && (
                  <>
                    <p className="text-green-400 font-semibold font-navbar">📤 Depositing {actionAmount} BTC...</p>
                    <p className="text-green-300 text-sm font-navbar">Transaction pending confirmation</p>
                  </>
                )}
                {borrowHash && isPending && (
                  <>
                    <p className="text-green-400 font-semibold font-navbar">💰 Borrowing {actionAmount} MUSD...</p>
                    <p className="text-green-300 text-sm font-navbar">Transaction pending confirmation</p>
                  </>
                )}
                {repayHash && isPending && (
                  <>
                    <p className="text-green-400 font-semibold font-navbar">💸 Repaying {actionAmount} MUSD...</p>
                    <p className="text-green-300 text-sm font-navbar">Transaction pending confirmation</p>
                  </>
                )}
                {withdrawHash && isPending && (
                  <>
                    <p className="text-green-400 font-semibold font-navbar">📥 Withdrawing {actionAmount} BTC...</p>
                    <p className="text-green-300 text-sm font-navbar">Transaction pending confirmation</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Primary Actions */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar flex-1">
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
          
          {/* MATS Rewards Display - aligned with actions */}
          {address && (
            <div className="flex-shrink-0">
              <MatsDisplay compact />
            </div>
          )}
        </div>
      </div>

      {/* Error Display - Compact */}
      {error && (
        <div className="max-w-2xl mx-auto mb-4">
          <div className="bg-red-500/10 backdrop-blur-xl p-3 rounded-xl border border-red-500/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 font-navbar text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid - Compact */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vault BTC - Compact */}
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-5 rounded-xl border border-green-400/10">
            <p className="text-xs font-navbar text-white/60 mb-1.5">Vault BTC</p>
            <p className="text-2xl font-bold font-navbar text-green-400">{collateralBalance} BTC</p>
            {bitcoinPrice > 0 && parseFloat(collateralBalance) > 0 && (
              <p className="text-xs font-navbar text-white/40 mt-0.5">
                ≈ ${(parseFloat(collateralBalance) * bitcoinPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </p>
            )}
            <p className="text-xs font-navbar text-white/40 mt-1">Wallet: {walletBtcBalance} BTC</p>
          </div>

          {/* MUSD Balance - Compact */}
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-5 rounded-xl border border-green-400/10">
            <p className="text-xs font-navbar text-white/60 mb-1.5">MUSD Balance</p>
            <p className="text-2xl font-bold font-navbar text-green-400">{musdBalance} MUSD</p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs font-navbar text-white/40">{vaultData?.interestRate || 0}% APR</p>
              <div className="group relative">
                <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-52 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <p className="text-white/90 font-navbar">Annual interest rate on borrowed MUSD. Interest accrues daily and increases your total debt over time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Collateral Ratio - Compact */}
          <div className="bg-[#2C2C2E]/40 backdrop-blur-xl p-5 rounded-xl border border-green-400/10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-navbar text-white/60">Collateral Ratio</p>
                <div className="group relative">
                  <Info className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-52 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/90 font-navbar">How much collateral vs debt you have. Higher = safer. Below 120% is risky - you may get liquidated.</p>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-navbar px-2 py-0.5 rounded-full ${
                getRiskLevel() === 'healthy' ? 'bg-green-500/20 text-green-300' :
                getRiskLevel() === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {getRiskLevel()}
              </span>
            </div>
            <p className={`text-2xl font-bold font-navbar ${getRiskColor(getRiskLevel())}`}>
              {displayCollateralRatioText}%
            </p>
            {parseFloat(borrowedAmount) > 0 && (
              <p className="text-xs font-navbar text-white/40 mt-1">Borrowed: {borrowedAmount} MUSD</p>
            )}
          </div>
        </div>
      </div>

      {/* Debt Info - Only show if there's debt */}
      {parseFloat(borrowedAmount) > 0 && (
        <div className="max-w-2xl mx-auto mb-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 backdrop-blur-xl p-5 rounded-xl border border-purple-400/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-navbar text-white/60 mb-1.5">Borrowed</p>
                <p className="text-lg font-navbar font-semibold text-white">{borrowedAmount} MUSD</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-navbar text-white/60">Total Due</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-green-400/30 text-green-300 bg-green-500/20">live</span>
                </div>
                <p className="text-lg font-navbar font-semibold text-green-300">{totalDueNow || '0'} MUSD</p>
                <p className="text-[10px] font-navbar text-green-200/70 mt-1">Interest: {(parseFloat(totalDueNow) - parseFloat(borrowedAmount)).toFixed(6)} MUSD</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  'Transaction submitted...'
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
