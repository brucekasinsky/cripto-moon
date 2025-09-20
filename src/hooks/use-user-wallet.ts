'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UserWalletData {
  id?: string;
  userId?: string;
  walletAddress?: string;
  accountId?: string;
  privateKey?: string;
  isConnected: boolean;
  lastConnected?: string;
  maxTradeSize: number;
  riskPercentage: number;
  maxOpenPositions: number;
  autoCopyEnabled: boolean;
  stopLossEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UseUserWalletReturn {
  walletData: UserWalletData | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: (walletAddress: string, accountId: string, privateKey: string) => Promise<boolean>;
  disconnectWallet: () => Promise<boolean>;
  updateCopyTradingSettings: (settings: Partial<UserWalletData>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useUserWallet(): UseUserWalletReturn {
  const [walletData, setWalletData] = useState<UserWalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-wallet');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wallet data');
      }

      if (data.success) {
        setWalletData(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch wallet data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWallet = useCallback(async (
    walletAddress: string, 
    accountId: string, 
    privateKey: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          accountId,
          privateKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect wallet');
      }

      if (data.success) {
        setWalletData(data.data);
        toast.success('Wallet connected successfully!');
        return true;
      } else {
        throw new Error(data.error || 'Failed to connect wallet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Failed to connect wallet: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-wallet/connect', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect wallet');
      }

      if (data.success) {
        setWalletData(data.data);
        toast.success('Wallet disconnected successfully!');
        return true;
      } else {
        throw new Error(data.error || 'Failed to disconnect wallet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Failed to disconnect wallet: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCopyTradingSettings = useCallback(async (
    settings: Partial<UserWalletData>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-wallet/copy-trading', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      if (data.success) {
        setWalletData(prev => prev ? { ...prev, ...data.data } : data.data);
        toast.success('Copy trading settings updated successfully!');
        return true;
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Failed to update settings: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch wallet data on mount
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return {
    walletData,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    updateCopyTradingSettings,
    refetch: fetchWalletData
  };
}


