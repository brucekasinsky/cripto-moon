'use client';

import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { ClickableWalletTable } from './clickable-wallet-table';
import { WalletProvider, useWalletModal } from '../wallet-context';
import { WalletDetailsModal } from '@/components/modals/wallet-details-modal';
import { Wallet } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';

interface WalletTableParams {
  data: Wallet[];
  totalItems: number;
  columns: ColumnDef<Wallet>[];
}

function WalletTableContent({ data, totalItems, columns }: WalletTableParams) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const { selectedWallet, isModalOpen, closeModal } = useWalletModal();

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <>
      <ClickableWalletTable table={table}>
        <DataTableToolbar table={table} />
      </ClickableWalletTable>
      
      <WalletDetailsModal
        wallet={selectedWallet}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

export function WalletTable({ data, totalItems, columns }: WalletTableParams) {
  return (
    <WalletProvider>
      <WalletTableContent 
        data={data} 
        totalItems={totalItems} 
        columns={columns} 
      />
    </WalletProvider>
  );
}
