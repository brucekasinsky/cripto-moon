'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from '@/constants/data';
import { X } from 'lucide-react';
import { TransactionTable } from './transaction-table';
import { transactionColumns } from './transaction-columns';
import { WalletChart } from './wallet-chart';

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export function WalletDetailsModal({ isOpen, onClose, wallet }: WalletDetailsModalProps) {

  if (!wallet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {wallet.name.charAt(0).toUpperCase()}
            </div>
            {wallet.name} - Transactions
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Chart */}
          <WalletChart />

          {/* Wallet Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-mono text-sm break-all">{wallet.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-semibold">${wallet.totalValue?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24H PnL</p>
                  <p className={`font-semibold ${(wallet.pnl24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${wallet.pnl24h?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Transaction history
              </p>
            </CardHeader>
            <CardContent>
              <TransactionTable 
                walletAddress={wallet.address}
                columns={transactionColumns} 
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}