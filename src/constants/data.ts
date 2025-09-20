import { Icons } from '@/components/icons';
import type { NavItem } from '@/types';

export type Wallet = {
  id: string;
  address: string;
  name: string;
  description?: string;
  isActive: boolean;
  isFollowing: boolean;
  
  // Hyperliquid specific data for real-time tracking
  accountId?: string;
  chainId?: string;
  accountName?: string;
  
  totalValue?: number;
  pnl24h?: number;
  pnl7d?: number;
  pnl30d?: number;
  totalTrades?: number;
  winRate?: number;
  avgTradeSize?: number;
  openPositions?: number;
  totalPositions?: number;
  
  // Real-time tracking settings
  trackRealtime: boolean;
  lastTradeAt?: Date;
  lastPositionUpdate?: Date;
  
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Wallets',
    url: '/dashboard/wallet',
    icon: 'wallet',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'My Wallet',
    url: '/dashboard/account',
    icon: 'myWallet',
    isActive: true,
    shortcut: ['w', 'w'],
    items: [] // Empty array to make it clickable directly
  },
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   items: [] // No child items
  // }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: 'active' | 'inactive';
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleData {
  id: number;
  wallet: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  customer: string;
  paymentMethod: string;
  transactionId: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
  customers: number;
}

export interface TopWallet {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
  image?: string;
}

export interface CustomerData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  orders: number;
  spent: number;
  status: 'active' | 'inactive';
  lastOrder?: string;
}

export interface InventoryData {
  id: number;
  wallet: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  lowStock: boolean;
  lastUpdated: string;
}

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface TaskData {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: TaskData[];
}

export interface KanbanData {
  columns: KanbanColumn[];
}
