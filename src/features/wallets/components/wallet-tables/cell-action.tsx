'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet } from '@/constants/data';
import { useWalletModal } from '../wallet-context';
import { MoreHorizontal, Edit, Trash2, RefreshCw, Eye, EyeOff, ExternalLink, Activity } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Wallet;
}

export function CellAction({ data }: CellActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useWalletModal();

  const handleToggleFollowing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wallets/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle-following' }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle following status');
      }

      toast.success(
        data.isFollowing ? 'Stopped following wallet' : 'Started following wallet'
      );
      
      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update following status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wallets/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wallet data');
      }

      toast.success('Wallet data updated successfully');
      
      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this wallet?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/wallets/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete wallet');
      }

      toast.success('Wallet deleted successfully');
      
      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to delete wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOnHyperliquid = () => {
    window.open(`https://app.hyperliquid.xyz/address/${data.address}`, '_blank');
  };

  const handleViewDetails = () => {
    openModal(data);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" data-no-row-click>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleViewDetails} data-no-row-click>
            <Activity className="mr-2 h-4 w-4" />
            View Transactions
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleViewOnHyperliquid}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Hyperliquid
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleUpdateData} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Data
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleToggleFollowing} disabled={isLoading}>
            {data.isFollowing ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Stop Following
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Start Following
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDelete} disabled={isLoading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
