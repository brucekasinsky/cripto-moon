'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface TransactionData {
  id: string;
  coin: string;
  side: 'B' | 'A';
  size: number;
  price: number;
  timestamp: string;
  pnl?: number;
  status: 'pending' | 'copied' | 'failed';
}

interface UseRealtimeTransactionsProps {
  walletId: string | null;
  enabled: boolean;
  intervalMs?: number;
}

interface UseRealtimeTransactionsReturn {
  transactions: TransactionData[];
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
  refetch: () => Promise<void>;
  toggleAutoRefresh: () => void;
  isAutoRefreshEnabled: boolean;
}

export function useRealtimeTransactions({
  walletId,
  enabled,
  intervalMs = 5000
}: UseRealtimeTransactionsProps): UseRealtimeTransactionsReturn {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!walletId) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallets/${walletId}/transactions`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch transactions`);
      }

      const data = await response.json();
      
      if (data.success !== false) {
        // API returned data successfully
        console.log('Received transactions:', data.transactions?.length || 0);
        console.log('First transaction sample:', data.transactions?.[0]);
        setTransactions(data.transactions || []);
        setLastUpdate(new Date());
        setError(null);
      } else {
        // API returned an error (no real data available)
        setTransactions([]);
        setError(data.error || 'Failed to fetch real transactions from Hyperliquid API');
        setLastUpdate(new Date());
      }
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
      
      // Only show toast on manual refresh or first load
      if (!intervalRef.current) {
        toast.error('Failed to load transactions');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [walletId]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (walletId && isAutoRefreshEnabled) {
      // Initial fetch immediately
      fetchTransactions();
      
      // Set up polling for subsequent calls
      intervalRef.current = setInterval(fetchTransactions, intervalMs);
    }
  }, [walletId, isAutoRefreshEnabled, intervalMs, fetchTransactions]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(prev => !prev);
  }, []);

  const refetch = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  // Initial fetch when modal opens - ALWAYS fetch when enabled changes to true
  useEffect(() => {
    if (enabled && walletId) {
      console.log('Modal opened, fetching transactions for wallet:', walletId);
      fetchTransactions();
    }
  }, [enabled, walletId]); // Remove fetchTransactions from deps to avoid re-runs

  // Start/stop polling based on auto-refresh setting
  useEffect(() => {
    if (enabled && walletId && isAutoRefreshEnabled) {
      // Set up polling (initial fetch already done above)
      intervalRef.current = setInterval(fetchTransactions, intervalMs);
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, walletId, isAutoRefreshEnabled, intervalMs, fetchTransactions, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Reset state when walletId changes or modal opens
  useEffect(() => {
    if (walletId && enabled) {
      setTransactions([]);
      setLastUpdate(null);
      setError(null);
      setIsAutoRefreshEnabled(true);
    }
  }, [walletId, enabled]);

  return {
    transactions,
    isLoading,
    lastUpdate,
    error,
    refetch,
    toggleAutoRefresh,
    isAutoRefreshEnabled
  };
}
