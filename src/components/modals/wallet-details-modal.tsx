'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WalletDashboard } from './wallet-dashboard';
import { TransactionTable } from './transaction-table';
import { transactionColumns } from './transaction-columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-[#141414] text-white border-0 rounded-none shadow-none m-0 flex flex-col">
        <DialogHeader className="p-6 border-b border-neutral-800/50 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-white">
            Wallet Details: {wallet.name} ({wallet.address.slice(0, 6)}...{wallet.address.slice(-4)})
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="dashboard" className="text-white">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions" className="text-white">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-0">
              <WalletDashboard walletAddress={wallet.address} />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
                <TransactionTable 
                  columns={transactionColumns} 
                  walletAddress={wallet.address}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}