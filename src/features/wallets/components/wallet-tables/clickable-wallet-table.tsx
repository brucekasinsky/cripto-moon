'use client';

import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Wallet } from '@/constants/data';
import { useWalletModal } from '../wallet-context';
import { cn } from '@/lib/utils';

interface ClickableWalletTableProps {
  table: TanstackTable<Wallet>;
  actionBar?: React.ReactNode;
  children?: React.ReactNode;
}

export function ClickableWalletTable({
  table,
  actionBar,
  children
}: ClickableWalletTableProps) {
  const { openModal } = useWalletModal();

  const handleRowClick = (wallet: Wallet, event: React.MouseEvent) => {
    // Don't trigger row click if clicking on action buttons or other interactive elements
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest('button') || 
                                target.closest('[role="button"]') || 
                                target.closest('a') ||
                                target.closest('[data-no-row-click]');
    
    if (!isInteractiveElement) {
      openModal(wallet);
    }
  };

  return (
    <div className='space-y-4'>
      {children}
      <div className='rounded-md border'>
        <div className='relative w-full overflow-auto'>
          <ScrollArea className='h-[calc(80vh-220px)] w-full'>
            <Table className='relative'>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles({ column: header.column })
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        row.getIsSelected() && "bg-muted"
                      )}
                      onClick={(event) => handleRowClick(row.original, event)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column })
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </div>
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
