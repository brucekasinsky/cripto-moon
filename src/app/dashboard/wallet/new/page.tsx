import PageContainer from '@/components/layout/page-container';
import { WalletForm } from '@/features/wallets/components/wallet-form';

export const metadata = {
  title: 'Dashboard: Add New Wallet'
};

export default function NewWalletPage() {
  return (
    <PageContainer>
      <WalletForm />
    </PageContainer>
  );
}
