import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { MEZO_CONTRACTS, MUSD_ABI, BORROW_MANAGER_ABI, MezoVault, MezoUtils, MezoError, MEZO_ERRORS } from '@/lib/mezo';
import { paymentMonitor, PaymentEvent } from '@/services/payment-monitor';

export const useMezoVault = () => {
  const { address, isConnected } = useAccount();
  const [vaultData, setVaultData] = useState<MezoVault | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRepayAmount, setPendingRepayAmount] = useState<string | null>(null);

  // Write contract hooks for vault operations
  const { writeContract: depositCollateralWrite, data: depositHash, error: depositError, isPending: isDepositPending } = useWriteContract();
  const { writeContract: borrowMUSDWrite, data: borrowHash, error: borrowError, isPending: isBorrowPending } = useWriteContract();
  const { writeContract: repayMUSDWrite, data: repayHash, error: repayError, isPending: isRepayPending } = useWriteContract();
  const { writeContract: withdrawCollateralWrite, data: withdrawHash, error: withdrawError, isPending: isWithdrawPending } = useWriteContract();
  const { writeContract: approveMUSDWrite, data: approvalHash, isPending: isApprovalPending } = useWriteContract();
  // Send functionality removed

  // Transaction confirmation hooks
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });
  const { isLoading: isBorrowConfirming, isSuccess: isBorrowSuccess } = useWaitForTransactionReceipt({
    hash: borrowHash,
  });
  const { isLoading: isRepayConfirming, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({
    hash: repayHash,
  });
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });
  // Send confirmations removed

  // Get native Bitcoin balance from wallet
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: false, // We'll manually refetch after transactions
    },
  });

  // Read MUSD balance with error handling - using full ABI and aggressive refetching
  const { 
    data: musdBalance, 
    refetch: refetchMusdBalance,
    error: musdBalanceError,
    isLoading: isMusdBalanceLoading
  } = useReadContract({
    address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
    abi: MUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && !!MEZO_CONTRACTS.MUSD_TOKEN,
      refetchInterval: 2000, // Refetch every 2 seconds aggressively
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 0, // Always consider data stale to force refetch
      gcTime: 0, // Don't cache - always fetch fresh
    },
  });

  // Read collateral balance from our custom vault contract
  const { data: collateralBalanceData, refetch: refetchCollateralBalance } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getCollateralBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read borrowed amount from our custom vault contract
  const { data: borrowedAmountData, refetch: refetchBorrowedAmount } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getBorrowedAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read current debt (principal + accrued interest) from vault (read-only)
  const { data: currentDebtData, refetch: refetchCurrentDebt } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getCurrentDebt',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read collateral ratio from our custom vault contract
  const { data: collateralRatioData, refetch: refetchCollateralRatio } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getCollateralRatio',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read interest rate (bps) from vault contract
  const { data: interestRateData, refetch: refetchInterestRate } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getInterestRate',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read maximum withdrawable collateral given current debt and ratio constraints
  const { data: maxWithdrawableData, refetch: refetchMaxWithdrawable } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getMaxWithdrawable',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read MUSD allowance for vault contract
  const { data: musdAllowance, refetch: refetchMusdAllowance } = useReadContract({
    address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
    abi: MUSD_ABI,
    functionName: 'allowance',
    args: address && isConnected ? [address, MEZO_CONTRACTS.MEZO_VAULT] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });


  // Update vault data when contract data changes
  useEffect(() => {
    if (address && collateralBalanceData !== undefined) {
      const vaultCollateral = collateralBalanceData ? MezoUtils.formatAmount(collateralBalanceData as bigint) : '0';
      const vaultBorrowed = borrowedAmountData ? MezoUtils.formatAmount(borrowedAmountData as bigint) : '0';
      const ratio = collateralRatioData ? Number(collateralRatioData) / 100 : 0;
      const healthFactor = ratio > 0 ? ratio / 110 : 0;
      
      setVaultData({
        id: address,
        collateralAmount: vaultCollateral,
        borrowedAmount: vaultBorrowed,
        collateralRatio: ratio,
        healthFactor: healthFactor,
        interestRate: interestRateData ? Number(interestRateData) / 100 : 0,
        liquidationPrice: 0, // Will be calculated based on collateral ratio
      });
    }
  }, [address, collateralBalanceData, borrowedAmountData, collateralRatioData, interestRateData]);

  // Refetch all data
  const refetchAll = useCallback(async () => {
    try {
      await Promise.all([
        refetchMusdBalance(),
        refetchCollateralBalance(),
        refetchBorrowedAmount(),
        refetchCurrentDebt(),
        refetchCollateralRatio(),
        refetchInterestRate(),
        refetchMusdAllowance(),
        refetchNativeBalance?.(), // Refresh wallet BTC balance
      ]);
    } catch (err) {
      console.error('Error refetching vault data:', err);
    }
  }, [refetchMusdBalance, refetchCollateralBalance, refetchBorrowedAmount, refetchCurrentDebt, refetchCollateralRatio, refetchInterestRate, refetchMusdAllowance, refetchNativeBalance]);

  // Watch for errors from writeContract calls
  useEffect(() => {
    if (depositError) {
      setIsLoading(false);
      let errorMessage = 'Deposit failed';
      
      const errorMsg = (depositError as Error).message || String(depositError);
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected') || errorMsg.includes('denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient BTC balance for deposit + gas';
      } else if (errorMsg.includes('gas')) {
        errorMessage = 'Transaction failed - try increasing gas limit';
      } else {
        errorMessage = errorMsg;
      }
      
      setError(errorMessage);
      console.error('Deposit error:', depositError);
    }
  }, [depositError]);

  // Watch for borrow errors
  useEffect(() => {
    if (borrowError) {
      setIsLoading(false);
      let errorMessage = 'Borrow failed';
      
      const errorMsg = (borrowError as Error).message || String(borrowError);
      console.error('Borrow error details:', borrowError);
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected') || errorMsg.includes('denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (errorMsg.includes('Insufficient collateral') || errorMsg.includes('insufficient collateral')) {
        errorMessage = 'Not enough collateral - deposit more BTC first or borrow less';
      } else if (errorMsg.includes('Vault does not exist') || errorMsg.includes('vault does not exist')) {
        errorMessage = 'Please deposit BTC first to create a vault';
      } else if (errorMsg.includes('not a minter') || errorMsg.includes('MUSDToken: not a minter')) {
        errorMessage = 'Vault not authorized to mint MUSD - contact support';
      } else if (errorMsg.includes('gas')) {
        errorMessage = 'Transaction failed - try increasing gas limit';
      } else {
        errorMessage = errorMsg;
      }
      
      setError(errorMessage);
      console.error('❌ Borrow transaction error:', borrowError);
    }
  }, [borrowError]);

  // Watch for repay errors
  useEffect(() => {
    if (repayError) {
      setIsLoading(false);
      let errorMessage = 'Repay failed';
      
      const errorMsg = (repayError as Error).message || String(repayError);
      console.error('Repay error details:', repayError);
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected') || errorMsg.includes('denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (errorMsg.includes('insufficient balance') || errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient MUSD balance - you need more MUSD to repay';
      } else if (errorMsg.includes('allowance') || errorMsg.includes('Allowance')) {
        errorMessage = 'MUSD not approved - please approve first';
      } else if (errorMsg.includes('Vault does not exist')) {
        errorMessage = 'No vault found - deposit BTC first';
      } else if (errorMsg.includes('gas')) {
        errorMessage = 'Transaction failed - try increasing gas limit';
      } else {
        errorMessage = errorMsg;
      }
      
      setError(errorMessage);
      console.error('❌ Repay transaction error:', repayError);
    }
  }, [repayError]);

  // Watch for withdraw errors
  useEffect(() => {
    if (withdrawError) {
      setIsLoading(false);
      let errorMessage = 'Withdraw failed';
      
      const errorMsg = (withdrawError as Error).message || String(withdrawError);
      console.error('Withdraw error details:', withdrawError);
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected') || errorMsg.includes('denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (errorMsg.includes('Insufficient collateral ratio')) {
        errorMessage = 'Cannot withdraw - would make collateral ratio too low. Repay more debt first.';
      } else if (errorMsg.includes('Amount exceeds collateral')) {
        errorMessage = 'Amount exceeds your vault collateral - withdraw less';
      } else if (errorMsg.includes('Vault does not exist')) {
        errorMessage = 'No vault found - deposit BTC first';
      } else if (errorMsg.includes('gas')) {
        errorMessage = 'Transaction failed - try increasing gas limit';
      } else {
        errorMessage = errorMsg;
      }
      
      setError(errorMessage);
      console.error('❌ Withdraw transaction error:', withdrawError);
    }
  }, [withdrawError]);

  // Watch for when transaction is submitted (hash appears) but not yet confirmed
  useEffect(() => {
    if (depositHash && isDepositPending) {
      // Transaction submitted, waiting for confirmation
      console.log('📝 Deposit transaction submitted:', depositHash);
    }
  }, [depositHash, isDepositPending]);

  // Deposit collateral
  const depositCollateral = async (amount: string) => {
    if (!address || !isConnected) {
      throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = MezoUtils.parseAmount(amount);
      
      // Validate amount
      if (amountInWei === 0n) {
        setIsLoading(false);
        throw new MezoError('Amount must be greater than 0', MEZO_ERRORS.INVALID_AMOUNT);
      }
      
      console.log('🔄 Initiating deposit:', {
        amount,
        amountInWei: amountInWei.toString(),
        vaultAddress: MEZO_CONTRACTS.MEZO_VAULT,
        userAddress: address
      });
      
      // Call vault contract's depositCollateral function with ETH value
      // writeContract triggers wallet popup - errors handled via useEffect above
      depositCollateralWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'depositCollateral',
        args: [amountInWei],
        value: amountInWei
      } as any);

      console.log('✅ Deposit writeContract called - wallet popup should appear now');

      // Note: writeContract triggers wallet popup
      // - If user approves: depositHash will be set
      // - If user rejects: depositError will be set
      // - Loading state managed by isDepositPending/isDepositConfirming

    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Deposit failed';
      
      if (err instanceof MezoError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('❌ Deposit error (catch):', err);
      setError(errorMessage);
      throw err;
    }
  };

  // Borrow MUSD
  const borrowMUSD = async (amount: string) => {
    if (!address || !isConnected) {
      throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = MezoUtils.parseAmount(amount);
      
      // Validate amount
      if (amountInWei === 0n) {
        throw new MezoError('Amount must be greater than 0', MEZO_ERRORS.INVALID_AMOUNT);
      }
      
      console.log('🔄 Initiating borrow:', {
        amount,
        amountInWei: amountInWei.toString(),
        vaultAddress: MEZO_CONTRACTS.MEZO_VAULT,
        userAddress: address,
        collateralBalance: vaultData?.collateralAmount || '0'
      });
      
      // Call vault contract's borrowMUSD function
      borrowMUSDWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'borrowMUSD',
        args: [amountInWei]
      } as any);

      console.log('✅ Borrow writeContract called - wallet popup should appear now');
      
    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Borrow failed';
      
      if (err instanceof MezoError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        // Parse common errors
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (err.message.includes('Insufficient collateral')) {
          errorMessage = 'Not enough collateral - deposit more BTC first';
        } else if (err.message.includes('Vault does not exist')) {
          errorMessage = 'Please deposit BTC first to create a vault';
        } else if (err.message.includes('gas')) {
          errorMessage = 'Transaction failed - try increasing gas limit';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

  // Approve MUSD for repayment
  const approveMUSD = async (_amount: string) => {
    if (!address || !isConnected) {
      throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use infinite approval (MAX_UINT256) for better UX
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      
      // Call MUSD token's approve function
      approveMUSDWrite({
        address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
        abi: MUSD_ABI,
        functionName: 'approve',
        args: [MEZO_CONTRACTS.MEZO_VAULT, maxApproval]
      } as any);

    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Approve failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

  // Repay MUSD
  const repayMUSD = async (amount: string) => {
    if (!address || !isConnected) {
      setIsLoading(false);
      setError('Wallet not connected');
      return;
    }

    // Validate amount first
    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setIsLoading(false);
      setError('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert amount to wei
      const amountInWei = MezoUtils.parseAmount(amount);
      
      // Validate amount after conversion
      if (amountInWei === 0n) {
        setIsLoading(false);
        setError('Amount must be greater than 0');
        return;
      }

      // Validate user has enough balance for the repayment amount
      const formattedBalance = musdBalance ? MezoUtils.formatAmount(musdBalance as bigint) : '0';
      const balanceNum = parseFloat(formattedBalance);
      const amountNum = parseFloat(amount);

      if (amountNum > balanceNum) {
        setIsLoading(false);
        setError(`Insufficient MUSD balance. You have ${formattedBalance} MUSD but trying to repay ${amount} MUSD`);
        return;
      }

      // Calculate total due (principal + interest)
      const totalDueNow = currentDebtData ? MezoUtils.formatAmount(currentDebtData as bigint) : (vaultData?.borrowedAmount || '0');
      const totalDueNum = parseFloat(totalDueNow);
      
      // Log repayment type
      if (amountNum < totalDueNum) {
        console.log('⚠️ Partial repayment detected:', {
          repaying: amount,
          totalDue: totalDueNow,
          remaining: (totalDueNum - amountNum).toFixed(8)
        });
      } else {
        console.log('✅ Full repayment - will clear all debt');
      }
      
      // Validate contract address
      if (!MEZO_CONTRACTS.MEZO_VAULT || MEZO_CONTRACTS.MEZO_VAULT === '0x0000000000000000000000000000000000000000') {
        setIsLoading(false);
        setError('Invalid vault contract address');
        return;
      }

      // Check if we have sufficient allowance (with some buffer)
      const currentAllowance = (musdAllowance as bigint) || 0n;
      
      if (currentAllowance < amountInWei) {
        // Auto-approve then auto-repay
        console.log('🔐 Insufficient allowance, auto-approving MUSD...', {
          currentAllowance: currentAllowance.toString(),
          required: amountInWei.toString(),
          amount: amount
        });
        setPendingRepayAmount(amount);
        const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        
        // Call approval - wallet popup will appear
        approveMUSDWrite({
          address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
          abi: MUSD_ABI,
          functionName: 'approve',
          args: [MEZO_CONTRACTS.MEZO_VAULT, maxApproval]
        } as any);
        console.log('✅ Approval writeContract called - wallet popup should appear for approval');
        // Don't reset loading - keep it true so UI shows approval is pending
        // Return without error - this is expected flow
        return;
      }
      
      console.log('🔄 Initiating repay:', {
        amount,
        amountInWei: amountInWei.toString(),
        vaultAddress: MEZO_CONTRACTS.MEZO_VAULT,
        userAddress: address,
        currentMUSDBalance: musdBalance,
        borrowedAmount: vaultData?.borrowedAmount || '0',
        allowance: currentAllowance.toString(),
        hasAllowance: currentAllowance >= amountInWei
      });
      
      // Validate writeContract function exists
      if (!repayMUSDWrite || typeof repayMUSDWrite !== 'function') {
        setIsLoading(false);
        setError('Transaction function not available - please refresh the page');
        console.error('❌ repayMUSDWrite is not a function:', repayMUSDWrite);
        return;
      }

      // Call writeContract - this will trigger wallet popup immediately
      console.log('📤 Calling repayMUSDWrite:', {
        address: MEZO_CONTRACTS.MEZO_VAULT,
        functionName: 'repayMUSD',
        args: [amountInWei.toString()],
        abiType: typeof BORROW_MANAGER_ABI,
        writeFunctionType: typeof repayMUSDWrite
      });
      
      try {
        // Call writeContract - this should trigger wallet popup
        // wrapMUSDWrite might throw if there's an immediate validation error
        repayMUSDWrite({
          address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
          abi: BORROW_MANAGER_ABI,
          functionName: 'repayMUSD',
          args: [amountInWei]
        } as any);

        console.log('✅ Repay writeContract called successfully - wallet popup should appear now');
        // Don't reset loading here - let the wallet popup appear
        // The hash will be set when user confirms, and error will be set if user rejects
      } catch (syncErr) {
        // Only catch synchronous errors - wallet popup should still appear for async errors
        console.error('❌ Synchronous error calling repayMUSDWrite:', syncErr);
        setIsLoading(false);
        const errorMsg = syncErr instanceof Error ? syncErr.message : 'Failed to initiate transaction';
        setError(errorMsg);
      }
      
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Repay failed';
      setError(errorMessage);
      console.error('❌ Repay error (synchronous):', err);
    }
  };

  // Withdraw collateral
  const withdrawCollateral = async (amount: string) => {
    if (!address || !isConnected) {
      throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = MezoUtils.parseAmount(amount);
      
      // Pre-validate against max withdrawable when in debt (use cached value if available, don't block)
      const currentBorrowed = borrowedAmountData ? (borrowedAmountData as bigint) : 0n;
      if (currentBorrowed > 0n) {
        try {
          // Use cached maxWithdrawableData first, only refetch if not available (non-blocking)
          let maxAllowed = (maxWithdrawableData ?? 0n) as bigint;
          if (maxAllowed === 0n) {
            // Try to get latest value with timeout - don't wait too long
            try {
              const { data: latestMax } = await Promise.race([
                refetchMaxWithdrawable(),
                new Promise(resolve => setTimeout(() => resolve({ data: null }), 500)) // Max 500ms wait
              ]) as any;
              maxAllowed = (latestMax ?? 0n) as bigint;
            } catch (refetchErr) {
              // Use cached value or proceed with validation
              console.warn('Max withdrawable refetch timed out, using cached value');
            }
          }
          
          if (maxAllowed > 0n && amountInWei > maxAllowed) {
            setIsLoading(false);
            const maxStr = MezoUtils.formatAmount(maxAllowed);
            const msg = `Amount exceeds max withdrawable while in debt. Max now: ${maxStr} BTC`;
            setError(msg);
            throw new MezoError(msg, MEZO_ERRORS.INSUFFICIENT_COLLATERAL);
          }
        } catch (e) {
          // If refetch fails, fall back to proceed and let contract check
          console.warn('⚠️ Could not refetch maxWithdrawable, proceeding to contract check');
        }
      }

      console.log('🔄 Initiating withdraw:', {
        amount,
        amountInWei: amountInWei.toString(),
        vaultAddress: MEZO_CONTRACTS.MEZO_VAULT,
        userAddress: address,
        collateralBalance: vaultData?.collateralAmount || '0',
        borrowedAmount: vaultData?.borrowedAmount || '0'
      });
      
      // Call vault contract's withdrawCollateral function
      withdrawCollateralWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'withdrawCollateral',
        args: [amountInWei]
      } as any);

      console.log('✅ Withdraw writeContract called - wallet popup should appear now');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

  // Send from vault: BTC (from vault) or MUSD (from wallet)
  // Send functions removed

  // Listen for payment events to refresh balance
  useEffect(() => {
    const handlePaymentReceived = (event: PaymentEvent) => {
      if (event.type === 'payment_detected' || event.type === 'payment_confirmed') {
        console.log('💰 Payment received, refreshing vault balance...');
        // Refresh all vault data when payment is received
        refetchAll();
      }
    };

    // Set up payment monitor callbacks
    paymentMonitor.setCallbacks({
      onPaymentDetected: handlePaymentReceived,
      onPaymentConfirmed: handlePaymentReceived,
    });

    return () => {
      // Clean up callbacks
      paymentMonitor.setCallbacks({});
    };
  }, [refetchAll]);

  // Refetch data after successful transaction (with delay to ensure blockchain state updates)
  useEffect(() => {
    if (isBorrowSuccess) {
      console.log('✅ Borrow successful, immediately refetching MUSD balance and interest rate...');
      setIsLoading(false);
      // Immediate refetch for MUSD balance
      console.log('🔄 Immediate refetch of MUSD balance...');
      refetchMusdBalance();
      refetchInterestRate();
      // Very aggressive refetch attempts to catch blockchain state updates
      const timer1 = setTimeout(() => {
        console.log('🔄 Refetch #1 after 500ms...');
        refetchMusdBalance();
      }, 500);
      const timer2 = setTimeout(() => {
        console.log('🔄 Refetch #2 after 1s...');
        refetchMusdBalance();
      }, 1000);
      const timer3 = setTimeout(() => {
        console.log('🔄 Refetch #3 after 2s...');
        refetchMusdBalance();
        refetchAll();
      }, 2000);
      const timer4 = setTimeout(() => {
        console.log('🔄 Refetch #4 after 3s...');
        refetchMusdBalance();
      }, 3000);
      const timer5 = setTimeout(() => {
        console.log('🔄 Refetch #5 after 5s...');
        refetchMusdBalance();
      }, 5000);
      const timer6 = setTimeout(() => {
        console.log('🔄 Refetch #6 after 10s...');
        refetchMusdBalance();
      }, 10000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
        clearTimeout(timer6);
      };
    }
    if (isRepaySuccess) {
      console.log('✅ Repay successful, immediately refetching MUSD balance...');
      setIsLoading(false);
      // Immediate refetch for MUSD balance
      refetchMusdBalance();
      refetchBorrowedAmount();
      // Then full refetch after delay
      const timer = setTimeout(() => {
        console.log('🔄 Full refetch after repay...');
      refetchAll();
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (isDepositSuccess || isWithdrawSuccess || isApprovalSuccess) {
      console.log('✅ Transaction successful, refetching data in 1 second...');
      setIsLoading(false);
      // Delay refetch slightly to ensure blockchain state has updated
      const timer = setTimeout(() => {
        console.log('🔄 Refetching vault data after transaction confirmation...');
        refetchAll();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDepositSuccess, isBorrowSuccess, isRepaySuccess, isWithdrawSuccess, isApprovalSuccess, refetchAll, refetchMusdBalance, refetchInterestRate, refetchBorrowedAmount]);

  // Also refetch when transaction is confirmed (wait for block confirmation)
  useEffect(() => {
    if (depositHash && isDepositSuccess) {
      console.log('📝 Deposit confirmed, waiting 1.5s then refetching vault balance...');
      const timer = setTimeout(() => {
        refetchCollateralBalance();
        refetchBorrowedAmount();
        refetchCollateralRatio();
        refetchInterestRate();
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (borrowHash && isBorrowSuccess) {
      console.log('📝 Borrow confirmed, immediately refetching MUSD balance...');
      // Immediate refetch
      refetchMusdBalance();
      refetchCollateralBalance();
      refetchBorrowedAmount();
      refetchCurrentDebt();
      refetchCollateralRatio();
      refetchInterestRate();
      // Then refetch again after delay to catch any blockchain lag
      const timer1 = setTimeout(() => {
        console.log('📝 Refetching again after 1s...');
        refetchMusdBalance();
      }, 1000);
      const timer2 = setTimeout(() => {
        console.log('📝 Final refetch after 2s...');
        refetchMusdBalance();
        refetchBorrowedAmount();
      }, 2000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
    if (repayHash && isRepaySuccess) {
      console.log('📝 Repay confirmed, waiting 1.5s then refetching MUSD balance and debt...');
      const timer = setTimeout(() => {
        refetchMusdBalance(); // MUSD balance should decrease
        refetchBorrowedAmount(); // Borrowed amount should decrease
        refetchCurrentDebt();
        refetchCollateralRatio(); // Collateral ratio should improve
        refetchInterestRate();
        refetchMusdAllowance();
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (withdrawHash && isWithdrawSuccess) {
      console.log('📝 Withdraw confirmed, waiting 1.5s then refetching vault and wallet balances...');
      const timer = setTimeout(() => {
        refetchCollateralBalance(); // Vault BTC should decrease
        refetchNativeBalance?.(); // Wallet BTC should increase
        refetchBorrowedAmount();
        refetchCurrentDebt();
        refetchCollateralRatio(); // Ratio might change
        refetchInterestRate();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [depositHash, borrowHash, repayHash, withdrawHash, isDepositSuccess, isBorrowSuccess, isRepaySuccess, isWithdrawSuccess, refetchCollateralBalance, refetchBorrowedAmount, refetchCollateralRatio, refetchInterestRate, refetchMusdBalance, refetchMusdAllowance, refetchNativeBalance]);

  // Proactively refetch MUSD balance and interest rate shortly after borrow transaction is broadcast
  useEffect(() => {
    if (borrowHash && isBorrowConfirming) {
      const timer = setTimeout(() => {
        console.log('⏱️ Borrow transaction pending, proactively refetching MUSD balance and interest rate...');
        refetchMusdBalance();
        refetchInterestRate();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [borrowHash, isBorrowConfirming, refetchMusdBalance, refetchInterestRate]);

  // Also refetch after repay transaction is pending
  useEffect(() => {
    if (repayHash && isRepayConfirming) {
      const timer = setTimeout(() => {
        console.log('⏱️ Repay transaction pending, proactively refetching MUSD balance...');
        refetchMusdBalance();
        refetchBorrowedAmount();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [repayHash, isRepayConfirming, refetchMusdBalance, refetchBorrowedAmount]);

  // After approval success, automatically trigger repay if we were waiting
  useEffect(() => {
    if (isApprovalSuccess && pendingRepayAmount) {
      console.log('✅ Approval confirmed. Refreshing allowance and auto-triggering repay for', pendingRepayAmount, 'MUSD');
      const amount = pendingRepayAmount;
      setPendingRepayAmount(null);
      
      // Trigger repay immediately after approval - no delays
      const triggerRepay = async () => {
        try {
          if (!address || !isConnected) {
            throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
          }

          // Prepare transaction parameters immediately
          const amountInWei = MezoUtils.parseAmount(amount);
          
          // Validate contract address
          if (!MEZO_CONTRACTS.MEZO_VAULT) {
            throw new MezoError('Invalid vault contract address', MEZO_ERRORS.NETWORK_ERROR);
          }
          
          console.log('🔄 Auto-repaying after approval (immediate):', { 
            amount, 
            amountInWei: amountInWei.toString(),
            vaultAddress: MEZO_CONTRACTS.MEZO_VAULT,
            userAddress: address
          });
          
          // Trigger wallet popup immediately - allowance check happens in parallel
          repayMUSDWrite({
            address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
            abi: BORROW_MANAGER_ABI,
            functionName: 'repayMUSD',
            args: [amountInWei]
          });
          
          console.log('✅ Auto-repay writeContract called - wallet popup should appear immediately');
          
          // Refresh allowance in background (non-blocking)
          refetchMusdAllowance().catch(err => {
            console.warn('Allowance refetch failed (non-critical):', err);
          });
        } catch (err) {
          console.error('❌ Auto-repay after approval failed:', err);
          setIsLoading(false);
          setError(err instanceof Error ? err.message : 'Auto-repay failed after approval');
        }
      };
      
      triggerRepay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApprovalSuccess, pendingRepayAmount, refetchMusdAllowance, address, isConnected]);

  // Watch for send collateral (BTC from vault) errors
  // Send error handlers removed

  // Refetch after successful send operations
  // Send success handlers removed

  // Format native BTC balance
  const walletBtcBalance = nativeBalance ? MezoUtils.formatAmount(nativeBalance.value) : '0';

  // Format MUSD balance with debugging
  const formattedMusdBalance = musdBalance !== null && musdBalance !== undefined 
    ? MezoUtils.formatAmount(musdBalance as bigint) 
    : '0';

  // Format max withdrawable
  const maxWithdrawable = maxWithdrawableData ? MezoUtils.formatAmount(maxWithdrawableData as bigint) : '0';
  
  // Debug log balance changes and errors - more aggressive logging
  useEffect(() => {
    if (address && isConnected) {
      if (musdBalanceError) {
        console.error('❌ MUSD Balance query error:', musdBalanceError, {
          contract: MEZO_CONTRACTS.MUSD_TOKEN,
          address,
          errorDetails: musdBalanceError,
          errorMessage: (musdBalanceError as any)?.message,
          errorCode: (musdBalanceError as any)?.code
        });
      } else {
        const rawBalance = musdBalance !== null && musdBalance !== undefined ? musdBalance.toString() : 'null/undefined';
        const balanceBigInt = musdBalance as bigint | null | undefined;
        
        console.log('💰 MUSD Balance update:', {
          raw: rawBalance,
          rawType: typeof musdBalance,
          rawValue: balanceBigInt,
          formatted: formattedMusdBalance,
          contract: MEZO_CONTRACTS.MUSD_TOKEN,
          contractValid: !!MEZO_CONTRACTS.MUSD_TOKEN && MEZO_CONTRACTS.MUSD_TOKEN !== '0x',
          userAddress: address,
          addressValid: !!address && address.length === 42,
          isLoading: isMusdBalanceLoading,
          isEnabled: !!address && isConnected && !!MEZO_CONTRACTS.MUSD_TOKEN,
          // Diagnostic: what wagmi sees
          queryState: 'active'
        });
        
        // If balance is null/undefined but we should have data, log warning
        if (musdBalance === null || musdBalance === undefined) {
          if (!isMusdBalanceLoading) {
            console.warn('⚠️ MUSD Balance is null/undefined but query is not loading.', {
              contract: MEZO_CONTRACTS.MUSD_TOKEN,
              address,
              isConnected,
              enabled: !!address && isConnected && !!MEZO_CONTRACTS.MUSD_TOKEN
            });
            console.warn('⚠️ This might mean: 1) Contract address is wrong 2) Network mismatch 3) Query disabled');
          } else {
            console.log('⏳ MUSD Balance query is loading...');
          }
        } else if (balanceBigInt !== null && balanceBigInt !== undefined && balanceBigInt === 0n) {
          console.log('ℹ️ MUSD Balance is 0 - this is valid if user has no MUSD');
        }
      }
    } else {
      console.log('⏸️ MUSD Balance query disabled:', {
        hasAddress: !!address,
        isConnected,
        hasContract: !!MEZO_CONTRACTS.MUSD_TOKEN
      });
    }
  }, [musdBalance, formattedMusdBalance, musdBalanceError, isMusdBalanceLoading, address, isConnected]);

  return {
    // Data
    vaultData,
    musdBalance: formattedMusdBalance,
    walletBtcBalance, // NEW: Wallet BTC balance
    collateralBalance: vaultData?.collateralAmount || '0',
    borrowedAmount: vaultData?.borrowedAmount || '0',
    totalDueNow: currentDebtData ? MezoUtils.formatAmount(currentDebtData as bigint) : (vaultData?.borrowedAmount || '0'),
    collateralRatio: vaultData?.collateralRatio || 0,
    interestRate: vaultData?.interestRate || 0,
    healthFactor: vaultData?.healthFactor || 0,
    maxWithdrawable,
    
    // State
    isLoading: isLoading || isDepositPending || isDepositConfirming || isBorrowPending || isBorrowConfirming || isRepayPending || isRepayConfirming || isWithdrawPending || isWithdrawConfirming || isApprovalPending || isApprovalConfirming,
    error,
    isConnected,
    isMusdBalanceLoading, // Export loading state for MUSD balance
    
    // Actions
    depositCollateral,
    borrowMUSD,
    repayMUSD,
    approveMUSD,
    withdrawCollateral,
    
    refetchAll,
    
    // Transaction status
    isPending: isDepositConfirming || isBorrowConfirming || isRepayConfirming || isWithdrawConfirming || isApprovalConfirming,
    isConfirming: isDepositConfirming || isBorrowConfirming || isRepayConfirming || isWithdrawConfirming || isApprovalConfirming,
    isSuccess: isDepositSuccess || isBorrowSuccess || isRepaySuccess || isWithdrawSuccess || isApprovalSuccess,
    transactionHash: depositHash || borrowHash || repayHash || withdrawHash || approvalHash,
    
    // Individual transaction statuses
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
    
    // Approval data
    musdAllowance: musdAllowance ? MezoUtils.formatAmount(musdAllowance as bigint) : '0',
    pendingRepayAmount, // Expose for UI to show auto-repay status
  };
};