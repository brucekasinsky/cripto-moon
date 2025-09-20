import { fakeWallets, Wallet } from '@/constants/mock-api';
import { notFound } from 'next/navigation';
import { WalletForm } from './wallet-form';

type TWalletViewPageProps = {
  walletId: string;
};

export default async function WalletViewPage({
  walletId
}: TWalletViewPageProps) {
  let wallet = null;
  let pageTitle = 'Create New Wallet';

  if (walletId !== 'new') {
    const data = await fakeWallets.getWalletById(Number(walletId));
    wallet = data.wallet as Wallet;
    if (!wallet) {
      notFound();
    }
    pageTitle = `Edit Wallet`;
  }

  return <WalletForm />;
}
