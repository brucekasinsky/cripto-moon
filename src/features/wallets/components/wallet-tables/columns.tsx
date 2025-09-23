'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Wallet } from '@/constants/data';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Eye, EyeOff, Clock, Activity } from 'lucide-react';
import { CellAction } from './cell-action';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export const columns: ColumnDef<Wallet>[] = [
  {
    accessorKey: 'address',
    header: 'ADDRESS',
    cell: ({ row }) => {
      const address = row.getValue('address') as string;
      return (
        <div className="font-mono text-sm">
          {address.slice(0, 8)}...{address.slice(-6)}
        </div>
      );
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div className="font-medium">{cell.getValue<Wallet['name']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search wallets...',
      variant: 'text',
    },
    enableColumnFilter: true
  },
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Account ID' />
    ),
    cell: ({ cell }) => {
      const accountId = cell.getValue<Wallet['accountId']>();
      return accountId ? (
        <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {accountId}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      );
    },
  },
  {
    id: 'chainId',
    accessorKey: 'chainId',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Chain' />
    ),
    cell: ({ cell }) => {
      const chainId = cell.getValue<Wallet['chainId']>();
      if (!chainId) return <div className="text-muted-foreground text-sm">-</div>;
      
      const chainColors = {
        arbitrum: 'bg-blue-100 text-blue-800',
        base: 'bg-orange-100 text-orange-800',
        polygon: 'bg-purple-100 text-purple-800',
      };
      
      return (
        <Badge variant="secondary" className={chainColors[chainId as keyof typeof chainColors] || 'bg-gray-100 text-gray-800'}>
          {chainId}
        </Badge>
      );
    },
  },
  {
    id: 'totalValue',
    accessorKey: 'totalValue',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total Value' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<Wallet['totalValue']>();
      return value ? (
        <div className="font-medium text-green-600">
          {formatCurrency(value)}
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    },
  },
  {
    id: 'pnl24h',
    accessorKey: 'pnl24h',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='24h P&L' />
    ),
    cell: ({ cell }) => {
      const pnl = cell.getValue<Wallet['pnl24h']>();
      if (!pnl) return <div className="text-muted-foreground">-</div>;
      
      const isPositive = pnl > 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      
      return (
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <Icon className="h-4 w-4" />
          <span className="font-medium">
            {formatCurrency(Math.abs(pnl))}
          </span>
        </div>
      );
    },
  },
  {
    id: 'winRate',
    accessorKey: 'winRate',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Win Rate' />
    ),
    cell: ({ cell }) => {
      const winRate = cell.getValue<Wallet['winRate']>();
      return winRate ? (
        <div className="font-medium">
          {formatPercentage(winRate)}
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    },
  },
  {
    id: 'trackRealtime',
    accessorKey: 'trackRealtime',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Real-time' />
    ),
    cell: ({ cell }) => {
      const trackRealtime = cell.getValue<Wallet['trackRealtime']>();
      const Icon = trackRealtime ? Activity : Clock;
      
      return (
        <Badge variant={trackRealtime ? 'default' : 'secondary'} className="capitalize">
          <Icon className="mr-1 h-3 w-3" />
          {trackRealtime ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Real-time Tracking',
      variant: 'multiSelect',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ]
    }
  },
  {
    id: 'isFollowing',
    accessorKey: 'isFollowing',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Following' />
    ),
    cell: ({ cell }) => {
      const isFollowing = cell.getValue<Wallet['isFollowing']>();
      const Icon = isFollowing ? Eye : EyeOff;
      
      return (
        <Badge variant={isFollowing ? 'default' : 'secondary'} className="capitalize">
          <Icon className="mr-1 h-3 w-3" />
          {isFollowing ? 'Following' : 'Not Following'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Following Status',
      variant: 'multiSelect',
      options: [
        { label: 'Following', value: 'true' },
        { label: 'Not Following', value: 'false' },
      ]
    }
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const isActive = cell.getValue<Wallet['isActive']>();
      const Icon = isActive ? CheckCircle2 : XCircle;

      return (
        <Badge variant={isActive ? 'default' : 'destructive'} className='capitalize'>
          <Icon className="mr-1 h-3 w-3" />
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ]
    }
  },
  {
    id: 'lastUpdated',
    accessorKey: 'lastUpdated',
    header: ({ column }: { column: Column<Wallet, unknown> }) => (
      <DataTableColumnHeader column={column} title='Last Updated' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Wallet['lastUpdated']>();
      return (
        <div className="text-sm text-muted-foreground">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
