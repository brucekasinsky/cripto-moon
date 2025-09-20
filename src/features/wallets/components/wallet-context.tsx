'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Wallet } from '@/constants/data';

interface WalletContextType {
  selectedWallet: Wallet | null;
  isModalOpen: boolean;
  openModal: (wallet: Wallet) => void;
  closeModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWallet(null);
  };

  return (
    <WalletContext.Provider value={{
      selectedWallet,
      isModalOpen,
      openModal,
      closeModal
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletModal must be used within a WalletProvider');
  }
  return context;
}


