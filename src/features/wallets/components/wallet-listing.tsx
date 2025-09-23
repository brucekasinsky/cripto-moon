import { Wallet } from '@/constants/data';
import { searchParamsCache } from '@/lib/searchparams';
import { WalletTable } from './wallet-tables';
import { columns } from './wallet-tables/columns';

type WalletListingPage = {};

export default async function WalletListingPage({}: WalletListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const isFollowing = searchParamsCache.get('isFollowing');
  const isActive = searchParamsCache.get('isActive');

  // Fetch wallets from API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = new URL('/api/wallets', baseUrl);
  apiUrl.searchParams.set('page', page?.toString() || '1');
  apiUrl.searchParams.set('limit', pageLimit?.toString() || '10');
  if (search) apiUrl.searchParams.set('search', search);
  if (isFollowing) apiUrl.searchParams.set('isFollowing', isFollowing);
  if (isActive) apiUrl.searchParams.set('isActive', isActive);

  try {
    const response = await fetch(apiUrl.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallets');
    }

    const data = await response.json();
    const totalWallets = data.total;
    const wallets: Wallet[] = data.wallets;

    return (
      <WalletTable
        data={wallets}
        totalItems={totalWallets}
        columns={columns}
      />
    );
  } catch (error) {
    console.error('Error fetching wallets:', error);
    
    // Return empty state if API fails
    return (
      <WalletTable
        data={[]}
        totalItems={0}
        columns={columns}
      />
    );
  }
}
