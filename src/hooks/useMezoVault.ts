import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { MEZO_CONTRACTS, MUSD_ABI, BORROW_MANAGER_ABI, MezoVault, MezoUtils, MezoError, MEZO_ERRORS } from '@/lib/mezo';

export const useMezoVault = () => {
  const { address, isConnected } = useAccount();
  const [vaultData, setVaultData] = useState<MezoVault | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get native Bitcoin balance from wallet
  const { data: nativeBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read MUSD balance
  const { data: musdBalance, refetch: refetchMusdBalance } = useReadContract({
    address: MEZO_CONTRACTS.MUSD_TOKEN,
    abi: MUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read collateral balance from our custom vault contract
  const { data: collateralBalance, refetch: refetchCollateralBalance } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getCollateralBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read borrowed amount from our custom vault contract
  const { data: borrowedAmount, refetch: refetchBorrowedAmount } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getBorrowedAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read collateral ratio from our custom vault contract
  const { data: collateralRatio, refetch: refetchCollateralRatio } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getCollateralRatio',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read interest rate from our custom vault contract
  const { data: interestRate } = useReadContract({
    address: MEZO_CONTRACTS.MEZO_VAULT,
    abi: BORROW_MANAGER_ABI,
    functionName: 'getInterestRate',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Write contract for vault operations
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update vault data when native balance changes
  useEffect(() => {
    if (nativeBalance !== undefined) {
      // For now, we'll show the native balance as available collateral
      // Once we integrate with official Mezo borrowing system, this will be updated
      const walletBitcoinBalance = nativeBalance ? MezoUtils.formatAmount(nativeBalance.value) : '0';
      
      setVaultData({
        id: address || '',
        collateralAmount: walletBitcoinBalance,
        borrowedAmount: '0', // Will be updated when we integrate with Mezo borrowing
        collateralRatio: 0, // Will be calculated when we have real borrowing data
        healthFactor: 0, // Will be calculated when we have real borrowing data
        interestRate: 2.5, // Mezo's interest rate (1-5%)
        liquidationPrice: 0, // Will be calculated based on collateral ratio
      });
    }
  }, [nativeBalance, address]);

  // Refetch all data
  const refetchAll = async () => {
    try {
      await Promise.all([
        refetchMusdBalance(),
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

      // For now, this is a placeholder that shows the user's intent
      // Once we integrate with official Mezo borrowing system, this will call the real contracts
      console.log('Depositing collateral:', amount, 'BTC');
      
      // TODO: Integrate with official Mezo borrowing contracts
      // This will call the official Mezo borrowing system to deposit BTC as collateral
      
      // Simulate success for now
      setTimeout(() => {
        setIsLoading(false);
        console.log('Collateral deposit simulated successfully');
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
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

      // For now, this is a placeholder that shows the user's intent
      // Once we integrate with official Mezo borrowing system, this will call the real contracts
      console.log('Borrowing MUSD:', amount);
      
      // TODO: Integrate with official Mezo borrowing contracts
      // This will call the official Mezo borrowing system to mint MUSD against BTC collateral
      
      // Simulate success for now
      setTimeout(() => {
        setIsLoading(false);
        console.log('MUSD borrowing simulated successfully');
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Borrow failed';
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

      // For now, this is a placeholder that shows the user's intent
      // Once we integrate with official Mezo borrowing system, this will call the real contracts
      console.log('Repaying MUSD:', amount);
      
      // TODO: Integrate with official Mezo borrowing contracts
      // This will call the official Mezo borrowing system to repay MUSD debt
      
      // Simulate success for now
      setTimeout(() => {
        setIsLoading(false);
        console.log('MUSD repayment simulated successfully');
      }, 1000);
      
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

      // For now, this is a placeholder that shows the user's intent
      // Once we integrate with official Mezo borrowing system, this will call the real contracts
      console.log('Withdrawing collateral:', amount, 'BTC');
      
      // TODO: Integrate with official Mezo borrowing contracts
      // This will call the official Mezo borrowing system to withdraw BTC collateral
      
      // Simulate success for now
      setTimeout(() => {
        setIsLoading(false);
        console.log('Collateral withdrawal simulated successfully');
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      throw new MezoError(errorMessage, MEZO_ERRORS.TRANSACTION_FAILED, err);
    }
  };

  // Refetch data after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetchAll();
    }
  }, [isSuccess, refetchAll]);

  return {
    // Data
    vaultData,
    musdBalance: musdBalance ? MezoUtils.formatAmount(musdBalance as bigint) : '0',
    collateralBalance: vaultData?.collateralAmount || '0', // Now shows native Bitcoin balance
    borrowedAmount: vaultData?.borrowedAmount || '0',
    collateralRatio: vaultData?.collateralRatio || 0,
    interestRate: vaultData?.interestRate || 0,
    healthFactor: vaultData?.healthFactor || 0,
    
    // State
    isLoading: isLoading || isPending || isConfirming,
    error,
    isConnected,
    
    // Actions
    depositCollateral,
    borrowMUSD,
    repayMUSD,
    withdrawCollateral,
    refetchAll,
    
    // Transaction status
    isPending,
    isConfirming,
    isSuccess,
    transactionHash: hash,
  };
};