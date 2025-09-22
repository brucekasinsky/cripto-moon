'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WalletChart } from './wallet-chart';
import { TransactionTable } from './transaction-table';
import { transactionColumns } from './transaction-columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Wallet {
  id: string;
  name: string;
  address: string;
}

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
}

export function WalletDetailsModal({ isOpen, onClose, wallet }: WalletDetailsModalProps) {
  if (!wallet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] p-0 bg-[#141414] text-white border border-white/[0.02] rounded-[18px] shadow-lg">
        <DialogHeader className="p-6 border-b border-neutral-800/50">
          <DialogTitle className="text-xl font-bold text-white">
            Wallet Details: {wallet.name} ({wallet.address.slice(0, 6)}...{wallet.address.slice(-4)})
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <WalletChart walletAddress={wallet.address} className="h-[400px]" />

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable walletAddress={wallet.address} columns={transactionColumns} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}