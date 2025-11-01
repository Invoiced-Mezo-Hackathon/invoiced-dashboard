import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { MEZO_CONTRACTS, MUSD_ABI, MezoUtils } from '@/lib/mezo';
import { MARKETPLACE_RECEIVER } from '@/types/market';
import toast from 'react-hot-toast';

export const useMarketplace = () => {
  const { address, isConnected } = useAccount();
  const [purchaseHash, setPurchaseHash] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Write contract for MUSD transfer
  const { 
    writeContract: transferMUSD, 
    data: txHash, 
    error: transferError,
    isPending: isTransferPending 
  } = useWriteContract();

  // Wait for transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isPurchaseSuccess 
  } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  // Read MUSD balance
  const { 
    data: musdBalance, 
    refetch: refetchMusdBalance 
  } = useReadContract({
    address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
    abi: MUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Update purchase hash when transaction is submitted
  useEffect(() => {
    if (txHash) {
      setPurchaseHash(txHash);
    }
  }, [txHash]);

  // Handle purchase success
  useEffect(() => {
    if (isPurchaseSuccess && purchaseHash) {
      console.log('✅ Purchase confirmed - refetching MUSD balance');
      setIsPurchasing(false);
      refetchMusdBalance();
      toast.success('Purchase successful! Product will be delivered.');
    }
  }, [isPurchaseSuccess, purchaseHash, refetchMusdBalance]);

  // Handle transfer errors
  useEffect(() => {
    if (transferError) {
      setIsPurchasing(false);
      const errorMsg = (transferError as Error).message || String(transferError);
      
      let userFriendlyError = 'Purchase failed';
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected')) {
        userFriendlyError = 'Transaction cancelled by user';
      } else if (errorMsg.includes('insufficient balance')) {
        userFriendlyError = 'Insufficient MUSD balance';
      } else if (errorMsg.includes('transfer amount exceeds balance')) {
        userFriendlyError = 'Insufficient MUSD balance';
      } else {
        userFriendlyError = errorMsg.length > 100 ? 'Transaction failed' : errorMsg;
      }
      
      setPurchaseError(userFriendlyError);
      toast.error(userFriendlyError);
    }
  }, [transferError]);

  // Purchase product function
  const purchaseProduct = useCallback(async (productId: string, price: number) => {
    if (!address || !isConnected) {
      setPurchaseError('Wallet not connected');
      toast.error('Please connect your wallet');
      return;
    }

    // Check balance
    const balance = musdBalance ? MezoUtils.formatAmount(musdBalance as bigint) : '0';
    const balanceNum = parseFloat(balance);
    
    if (balanceNum < price) {
      setPurchaseError(`Insufficient balance. You have ${balance} MUSD but need ${price} MUSD`);
      toast.error(`Insufficient MUSD balance`);
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchaseHash(null);

    try {
      // Convert price to wei
      const amountInWei = MezoUtils.parseAmount(price.toString());

      // Validate receiver address
      if (!MARKETPLACE_RECEIVER || MARKETPLACE_RECEIVER === '0x0000000000000000000000000000000000000000') {
        setPurchaseError('Marketplace receiver address not configured');
        setIsPurchasing(false);
        toast.error('Marketplace configuration error');
        return;
      }

      console.log('📤 Purchasing product:', productId, 'Amount:', price, 'MUSD');
      
      // Transfer MUSD to marketplace receiver
      transferMUSD({
        address: MEZO_CONTRACTS.MUSD_TOKEN as `0x${string}`,
        abi: MUSD_ABI,
        functionName: 'transfer',
        args: [
          MARKETPLACE_RECEIVER as `0x${string}`,
          amountInWei
        ],
      });

      toast.loading('Processing purchase...', { id: 'purchase' });
    } catch (error) {
      console.error('Purchase error:', error);
      setIsPurchasing(false);
      setPurchaseError('Failed to initiate purchase');
      toast.error('Purchase failed', { id: 'purchase' });
    }
  }, [address, isConnected, musdBalance, transferMUSD]);

  // Reset states
  const resetPurchase = useCallback(() => {
    setPurchaseHash(null);
    setIsPurchasing(false);
    setPurchaseError(null);
  }, []);

  return {
    purchaseProduct,
    isPurchasing: isPurchasing || isTransferPending || isConfirming,
    purchaseHash,
    isPurchaseSuccess,
    purchaseError,
    resetPurchase,
    musdBalance: musdBalance ? MezoUtils.formatAmount(musdBalance as bigint) : '0',
    refetchMusdBalance,
  };
};

