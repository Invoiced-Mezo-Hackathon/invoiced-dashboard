import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, useSendTransaction } from 'wagmi';
import { MEZO_CONTRACTS, MUSD_ABI, BORROW_MANAGER_ABI, MezoVault, MezoUtils, MezoError, MEZO_ERRORS } from '@/lib/mezo';
import { paymentMonitor, PaymentEvent } from '@/services/payment-monitor';

export const useMezoVault = () => {
  const { address, isConnected } = useAccount();
  const [vaultData, setVaultData] = useState<MezoVault | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Write contract hooks for vault operations
  const { writeContract: depositCollateralWrite, data: depositHash } = useWriteContract();
  const { writeContract: borrowMUSDWrite, data: borrowHash } = useWriteContract();
  const { writeContract: repayMUSDWrite, data: repayHash } = useWriteContract();
  const { writeContract: withdrawCollateralWrite, data: withdrawHash } = useWriteContract();
  const { writeContract: approveMUSDWrite, data: approvalHash } = useWriteContract();

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

  // Get native Bitcoin balance from wallet
  const { data: nativeBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read MUSD balance
  const { data: musdBalance, refetch: refetchMusdBalance } = useReadContract({
    address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
    abi: MUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
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
        interestRate: 2.5, // Mezo's interest rate (1-5%)
        liquidationPrice: 0, // Will be calculated based on collateral ratio
      });
    }
  }, [address, collateralBalanceData, borrowedAmountData, collateralRatioData]);

  // Refetch all data
  const refetchAll = async () => {
    try {
      await Promise.all([
        refetchMusdBalance(),
        refetchCollateralBalance(),
        refetchBorrowedAmount(),
        refetchCollateralRatio(),
        refetchMusdAllowance(),
        // Note: Native balance will automatically refresh when wallet state changes
        // Contract balances will be added when we integrate with official Mezo system
      ]);
    } catch (err) {
      console.error('Error refetching vault data:', err);
    }
  };

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
        throw new MezoError('Amount must be greater than 0', MEZO_ERRORS.INVALID_AMOUNT);
      }
      
      // Call vault contract's depositCollateral function with ETH value
      depositCollateralWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'depositCollateral',
        args: [amountInWei],
        value: amountInWei
      });

    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Deposit failed';
      
      if (err instanceof MezoError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        // Parse common wallet errors
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient BTC balance for deposit + gas';
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
      
      // Call vault contract's borrowMUSD function
      borrowMUSDWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'borrowMUSD',
        args: [amountInWei]
      });
      
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
  const approveMUSD = async (amount: string) => {
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
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Approve failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

  // Repay MUSD
  const repayMUSD = async (amount: string) => {
    if (!address || !isConnected) {
      throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = MezoUtils.parseAmount(amount);
      
      // Check if we have sufficient allowance
      const currentAllowance = musdAllowance as bigint || 0n;
      
      if (currentAllowance < amountInWei) {
        // Need to approve first
        console.log('Insufficient allowance, requesting approval...');
        throw new MezoError('APPROVAL_NEEDED', MEZO_ERRORS.TRANSACTION_FAILED);
      }
      
      // Call vault contract's repayMUSD function
      repayMUSDWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'repayMUSD',
        args: [amountInWei]
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Repay failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
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
      
      // Call vault contract's withdrawCollateral function
      withdrawCollateralWrite({
        address: MEZO_CONTRACTS.MEZO_VAULT as `0x${string}`,
        abi: BORROW_MANAGER_ABI,
        functionName: 'withdrawCollateral',
        args: [amountInWei]
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

  // Send Bitcoin to external address
  const { sendTransaction: sendBitcoinTx, data: sendBitcoinHash } = useSendTransaction();
  
  const sendBitcoin = async (recipientAddress: string, amount: string) => {
    if (!address || !isConnected) {
      throw new MezoError('Wallet not connected', MEZO_ERRORS.NETWORK_ERROR);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = MezoUtils.parseAmount(amount);
      
      // Send native BTC transfer
      sendBitcoinTx({
        to: recipientAddress as `0x${string}`,
        value: amountInWei
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

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

  // Refetch data after successful transaction
  useEffect(() => {
    if (isDepositSuccess || isBorrowSuccess || isRepaySuccess || isWithdrawSuccess || isApprovalSuccess) {
      console.log('✅ Transaction successful, refetching data...');
      refetchAll();
      setIsLoading(false);
    }
  }, [isDepositSuccess, isBorrowSuccess, isRepaySuccess, isWithdrawSuccess, isApprovalSuccess, refetchAll]);

  // Also refetch when transaction hash is available (pending state)
  useEffect(() => {
    if (depositHash || borrowHash || repayHash || withdrawHash || approvalHash) {
      console.log('📝 Transaction pending, refetching...');
      refetchAll();
    }
  }, [depositHash, borrowHash, repayHash, withdrawHash, approvalHash, refetchAll]);

  // Format native BTC balance
  const walletBtcBalance = nativeBalance ? MezoUtils.formatAmount(nativeBalance.value) : '0';

  return {
    // Data
    vaultData,
    musdBalance: musdBalance ? MezoUtils.formatAmount(musdBalance as bigint) : '0',
    walletBtcBalance, // NEW: Wallet BTC balance
    collateralBalance: vaultData?.collateralAmount || '0',
    borrowedAmount: vaultData?.borrowedAmount || '0',
    collateralRatio: vaultData?.collateralRatio || 0,
    interestRate: vaultData?.interestRate || 0,
    healthFactor: vaultData?.healthFactor || 0,
    
    // State
    isLoading: isLoading || isDepositConfirming || isBorrowConfirming || isRepayConfirming || isWithdrawConfirming || isApprovalConfirming,
    error,
    isConnected,
    
    // Actions
    depositCollateral,
    borrowMUSD,
    repayMUSD,
    withdrawCollateral,
    sendBitcoin,
    refetchAll,
    
    // Transaction status
    isPending: isDepositConfirming || isBorrowConfirming || isRepayConfirming || isWithdrawConfirming || isApprovalConfirming,
    isConfirming: isDepositConfirming || isBorrowConfirming || isRepayConfirming || isWithdrawConfirming || isApprovalConfirming,
    isSuccess: isDepositSuccess || isBorrowSuccess || isRepaySuccess || isWithdrawSuccess || isApprovalSuccess,
    transactionHash: depositHash || borrowHash || repayHash || withdrawHash || sendBitcoinHash || approvalHash,
    
    // Individual transaction statuses
    isDepositSuccess,
    isBorrowSuccess,
    isRepaySuccess,
    isWithdrawSuccess,
    isApprovalSuccess,
    depositHash,
    borrowHash,
    repayHash,
    withdrawHash,
    sendBitcoinHash,
    approvalHash,
    
    // Approval data
    musdAllowance: musdAllowance ? MezoUtils.formatAmount(musdAllowance as bigint) : '0',
  };
};