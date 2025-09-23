'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { HyperliquidService } from '@/lib/hyperliquid';
import { toast } from 'sonner';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

interface TransactionData {
  id: string;
  coin: string;
  side: 'B' | 'A';
  size: number;
  price: number;
  timestamp: string;
  pnl?: number;
  status: 'pending' | 'copied' | 'failed';
}

interface TransactionTableProps {
  data?: TransactionData[];
  columns: ColumnDef<TransactionData>[];
  walletAddress?: string;
}

export function TransactionTable({ data: externalData, columns, walletAddress }: TransactionTableProps) {
  const [internalData, setInternalData] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use external data if provided, otherwise use internal data
  const data = externalData || internalData;
  
  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
    // console.log('Fetching transactions for wallet:', walletAddress);
      
      const startTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
      const fillsResponse = await HyperliquidService.getUserTransactions(walletAddress, startTime);

      if (fillsResponse.success && fillsResponse.data) {
        const fills = fillsResponse.data;
    // console.log('Raw fills data:', fills);
        
        const transactionData: TransactionData[] = fills.map((fill: any, index: number) => ({
          id: `${fill.coin}-${fill.time}-${index}`,
          coin: fill.coin || 'UNKNOWN',
          side: fill.side || 'B',
          size: parseFloat(fill.sz || '0'),
          price: parseFloat(fill.px || '0'),
          timestamp: new Date(parseInt(fill.time || '0')).toISOString(),
          pnl: fill.closedPnl ? parseFloat(fill.closedPnl) : undefined,
          status: 'copied' as const
        }));

    // console.log('Processed transactions:', transactionData.length);
        setInternalData(transactionData);
        
        toast.success(`Loaded ${transactionData.length} transactions`);
      } else {
    // console.log('API failed, no transaction data available. Error:', fillsResponse.error);
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress && !externalData) {
      fetchTransactions();
    }
  }, [walletAddress, externalData, fetchTransactions]);

    // console.log('TransactionTable received data:', data.length, 'rows');
    // console.log('TransactionTable first row:', data[0]);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

    // console.log('TransactionTable table rows:', table.getRowModel().rows.length);
    // console.log('TransactionTable table data:', table.getRowModel().rows[0]?.original);

  if (isLoading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
