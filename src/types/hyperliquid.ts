// Types for Hyperliquid API responses

export interface HyperliquidWalletData {
  address: string;
  totalValue?: number;
  pnl24h?: number;
  pnl7d?: number;
  pnl30d?: number;
  totalTrades?: number;
  winRate?: number;
  avgTradeSize?: number;
  openPositions?: number;
  totalPositions?: number;
  lastUpdated: Date;
}

export interface HyperliquidPosition {
  coin: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface HyperliquidTrade {
  coin: string;
  side: 'B' | 'A'; // B = Buy, A = Sell
  size: number;
  price: number;
  timestamp: number;
}

export interface HyperliquidPortfolio {
  address: string;
  totalValue: number;
  positions: HyperliquidPosition[];
  trades: HyperliquidTrade[];
  pnl24h: number;
  pnl7d: number;
  pnl30d: number;
}

// API Response types
export interface HyperliquidAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
