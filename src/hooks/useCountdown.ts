// useCountdown Hook
// Provides countdown timer functionality for invoice expiry

import { useState, useEffect, useCallback } from 'react';

export interface CountdownState {
  remainingMs: number;
  label: string;
  isExpired: boolean;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(expiresAt: string): CountdownState {
  const [remainingMs, setRemainingMs] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const calculateRemaining = useCallback(() => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const remaining = expiry - now;
    
    setRemainingMs(Math.max(0, remaining));
    setIsExpired(remaining <= 0);
  }, [expiresAt]);

  useEffect(() => {
    // Calculate initial remaining time
    calculateRemaining();

    // Set up interval to update every second
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining]);

  // Calculate time components
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  // Format label based on remaining time
  const getLabel = (): string => {
    if (isExpired) {
      return 'Expired';
    }

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    remainingMs,
    label: getLabel(),
    isExpired,
    hours,
    minutes,
    seconds,
  };
}
