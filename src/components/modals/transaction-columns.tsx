'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

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

export const transactionColumns: ColumnDef<TransactionData>[] = [
  {
    accessorKey: 'coin',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="Coin" />
    ),
    cell: ({ row }) => {
      const coin = row.getValue('coin') as string;
      return (
        <div className="font-medium font-mono">
          {coin}
        </div>
      );
    },
  },
  {
    accessorKey: 'side',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="Side" />
    ),
    cell: ({ row }) => {
      const side = row.getValue('side') as string;
      const isBuy = side === 'B';
      return (
        <Badge variant={isBuy ? 'default' : 'secondary'}>
          {isBuy ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {isBuy ? 'BUY' : 'SELL'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('size') as number;
      return (
        <div className="font-mono text-sm">
          {size.toFixed(4)}
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      return (
        <div className="font-mono text-sm">
          ${price.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: 'pnl',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="P&L" />
    ),
    cell: ({ row }) => {
      const pnl = row.getValue('pnl') as number | undefined;
      if (pnl === undefined || pnl === null) {
        return <div className="text-muted-foreground text-sm">-</div>;
      }
      const isProfit = pnl >= 0;
      return (
        <div className={`font-mono text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
          {isProfit ? '+' : ''}${pnl.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as string;
      const date = new Date(timestamp);
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }: { column: Column<TransactionData, unknown> }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'copied':
            return {
              variant: 'default' as const,
              icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
              label: 'Copied',
              className: 'bg-green-500 text-white'
            };
          case 'pending':
            return {
              variant: 'secondary' as const,
              icon: <Clock className="h-3 w-3 mr-1" />,
              label: 'Pending',
              className: 'bg-yellow-500 text-white'
            };
          case 'failed':
            return {
              variant: 'destructive' as const,
              icon: <XCircle className="h-3 w-3 mr-1" />,
              label: 'Failed',
              className: 'bg-red-500 text-white'
            };
          default:
            return {
              variant: 'secondary' as const,
              icon: <Clock className="h-3 w-3 mr-1" />,
              label: 'Unknown',
              className: 'bg-gray-500 text-white'
            };
        }
      };

      const config = getStatusConfig(status);
      return (
        <Badge variant={config.variant} className={config.className}>
          {config.icon}
          {config.label}
        </Badge>
      );
    },
  },
];


