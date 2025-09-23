'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { HyperliquidService } from '@/lib/hyperliquid';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { toast } from 'sonner';

interface WalletChartProps {
  className?: string;
  walletAddress?: string;
}

interface ChartDataPoint {
  date: string;
  totalValue: number;
  pnl: number;
}

interface WalletStats {
  totalValue: number;
  pnl24h: number;
  pnlPercentage: number;
  openPositions: number;
  winRate: number;
  avgTrade: number;
  totalVolume: number;
}

type TimeFilter = '24H' | '1W' | '1M' | 'All';

export function WalletChart({ className, walletAddress }: WalletChartProps) {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('1W');
  const [allChartData, setAllChartData] = useState<ChartDataPoint[]>([]);
  const [filteredChartData, setFilteredChartData] = useState<ChartDataPoint[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalValue: 0,
    pnl24h: 0,
    pnlPercentage: 0,
    openPositions: 0,
    winRate: 0,
    avgTrade: 0,
    totalVolume: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const filters: TimeFilter[] = ['24H', '1W', '1M', 'All'];

  const getFilterTime = (filter: TimeFilter): number => {
    const now = Date.now();
    switch (filter) {
      case '24H':
        return now - (24 * 60 * 60 * 1000);
      case '1W':
        return now - (7 * 24 * 60 * 60 * 1000);
      case '1M':
        return now - (30 * 24 * 60 * 60 * 1000);
      case 'All':
        return 0; // All data
      default:
        return now - (7 * 24 * 60 * 60 * 1000);
    }
  };

  const filterChartData = useCallback((data: ChartDataPoint[], filter: TimeFilter) => {
    if (filter === 'All') {
      return data;
    }
    
    const filterTime = getFilterTime(filter);
    return data.filter(point => {
      const pointTime = new Date(point.date).getTime();
      return pointTime >= filterTime;
    });
  }, []);

  const fetchWalletData = useCallback(async () => {
    if (!walletAddress || hasLoadedData) return;
    
    setIsLoading(true);
    try {
    // console.log('Fetching ALL wallet chart data for:', walletAddress);
      
      // Fetch ALL data (90 days) only once
      const startTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days
      
      // Fetch data in parallel with specific methods
      const [equityHistoryResponse, balanceResponse, statsResponse] = await Promise.all([
        HyperliquidService.getWalletEquityHistory(walletAddress, startTime),
        HyperliquidService.getWalletBalance(walletAddress),
        HyperliquidService.getWalletStats(walletAddress, startTime)
      ]);

      // Process chart data from equity history
      if (equityHistoryResponse.success && equityHistoryResponse.data && Array.isArray(equityHistoryResponse.data)) {
        const processedChartData: ChartDataPoint[] = equityHistoryResponse.data.map((item: any) => ({
          date: new Date(item.timestamp || item.time || Date.now()).toISOString(),
          totalValue: parseFloat(item.pnl || 0), // Use pnl which contains normalized PnL
          pnl: parseFloat(item.pnl || 0)
        }));
        
        setAllChartData(processedChartData);
    // console.log('All chart data processed:', processedChartData.length, 'points');
    // console.log('Sample processed data:', processedChartData.slice(0, 5));
    // console.log('PnL range:', {
    //   min: Math.min(...processedChartData.map(d => d.totalValue)),
    //   max: Math.max(...processedChartData.map(d => d.totalValue)),
    //   first: processedChartData[0]?.totalValue,
    //   last: processedChartData[processedChartData.length - 1]?.totalValue
    // });
      }

      // Process balance data
      if (balanceResponse.success && balanceResponse.data) {
        const balance = balanceResponse.data;
        setWalletStats(prev => ({
          ...prev,
          totalValue: balance.totalValue,
          pnl24h: balance.pnl24h,
          pnlPercentage: balance.pnlPercentage
        }));
    // console.log('Balance data loaded:', balance);
      }

      // Process stats data
      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data;
        setWalletStats(prev => ({
          ...prev,
          openPositions: stats.openPositions,
          winRate: stats.winRate,
          avgTrade: stats.avgTrade,
          totalVolume: stats.totalVolume
        }));
    // console.log('Stats data loaded:', stats);
      }

      setHasLoadedData(true);

      // Check if at least one request succeeded
      if (equityHistoryResponse.success || balanceResponse.success || statsResponse.success) {
        toast.success('Wallet data loaded successfully');
      } else {
    // console.log('All requests failed');
        toast.error('Failed to load wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, hasLoadedData]);

  useEffect(() => {
    if (walletAddress) {
      fetchWalletData();
    }
  }, [walletAddress, fetchWalletData]);

  // Filter data when filter changes or when data is loaded
  useEffect(() => {
    if (allChartData.length > 0) {
      const filtered = filterChartData(allChartData, selectedFilter);
      setFilteredChartData(filtered);
    // console.log(`Filtered data for ${selectedFilter}:`, filtered.length, 'points');
    }
  }, [allChartData, selectedFilter, filterChartData]);

  // Handle filter change
  const handleFilterChange = (filter: TimeFilter) => {
    setSelectedFilter(filter);
    // No API call needed - just filter existing data
  };

  // Dynamic color based on current PnL
  const getChartColor = () => {
    if (filteredChartData.length === 0) return '#10B981';
    const lastValue = filteredChartData[filteredChartData.length - 1]?.totalValue || 0;
    return lastValue >= 0 ? '#10B981' : '#EF4444'; // emerald-500 or red-500
  };

  const chartConfig = {
    totalValue: {
      label: 'PnL',
      color: getChartColor()
    }
  } satisfies ChartConfig;

  return (
    <div className={cn('rounded-[18px] relative z-10 border border-white/[0.02] bg-[#141414] backdrop-blur-sm transition-all duration-500 overflow-hidden', className)}>
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Wallet Stats */}
          <div className="lg:w-72 space-y-2">
            {/* Total Value */}
            <div className="border-b border-neutral-800/50 p-4 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-neutral-400">Total Value</h3>
              </div>
              <p className="text-xl font-bold text-white mt-1">
                ${walletStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">24H Change</span>
                  <span className={`${walletStats.pnlPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {walletStats.pnlPercentage >= 0 ? '+' : ''}{walletStats.pnlPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${walletStats.pnlPercentage >= 0 ? 'bg-emerald-400/50' : 'bg-red-400/50'}`} 
                    style={{ width: `${Math.min(Math.abs(walletStats.pnlPercentage) * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* PnL */}
            <div className="border-b border-neutral-800/50 p-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-neutral-400">24H P&L</h3>
                <div className={`text-sm font-medium flex items-center gap-1.5 ${walletStats.pnl24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {walletStats.pnl24h >= 0 ? <IconTrendingUp className="w-4 h-4" /> : <IconTrendingDown className="w-4 h-4" />}
                  {walletStats.pnl24h >= 0 ? 'PROFIT' : 'LOSS'}
                </div>
              </div>
              <p className={`text-lg font-bold ${walletStats.pnl24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {walletStats.pnl24h >= 0 ? '+' : ''}${walletStats.pnl24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Open Positions */}
            <div className="border-b border-neutral-800/50 p-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-neutral-400">Open Positions</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                    <span className="text-xs text-emerald-400/90 font-medium">Long</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500"></div>
                    <span className="text-xs text-rose-400/90 font-medium">Short</span>
                  </div>
                </div>
              </div>
              <div className="h-12 border border-neutral-800/50 rounded-xl overflow-hidden flex">
                <div className="relative bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 hover:brightness-110 transition-all flex items-center justify-center px-3 sm:px-4 border-r border-neutral-800" style={{ width: '60%' }}>
                  <span className="relative text-sm text-emerald-400">{walletStats.openPositions}</span>
                </div>
                <div className="relative bg-gradient-to-r from-rose-500/5 via-rose-500/10 to-rose-500/5 hover:brightness-110 transition-all flex items-center justify-center px-3 sm:px-4" style={{ width: '40%' }}>
                  <span className="relative text-sm text-rose-400">0</span>
                </div>
              </div>
            </div>

            {/* Trading Stats */}
            <div className="p-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-neutral-400">Trading Stats</h3>
                <div className="flex items-center gap-1 text-sm text-emerald-400">
                  <IconTrendingUp className="w-3.5 h-3.5" />
                  <span className="text-sm text-emerald-400">{walletStats.winRate.toFixed(1)}% Win Rate</span>
                </div>
              </div>
              <p className="text-lg font-bold text-emerald-400">${walletStats.avgTrade.toFixed(0)}</p>
              <p className="text-xs text-neutral-400 mt-1">Avg Trade Size</p>
            </div>
          </div>

          {/* Right Side - Chart */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              {/* Time Filters */}
              <div className="inline-flex w-full sm:w-fit overflow-x-auto hide-scrollbar bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-0.5">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={cn(
                      'flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl whitespace-nowrap text-xs sm:text-sm transition-all duration-200 relative mx-0.5 first:ml-0 last:mr-0',
                      selectedFilter === filter
                        ? 'text-emerald-400 bg-emerald-400/[0.08] shadow-sm shadow-emerald-400/10'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              {/* Chart Type Filters */}
              <div className="flex gap-2">
                <div className="inline-flex w-full sm:w-fit overflow-x-auto hide-scrollbar bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-0.5">
                  <button className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl whitespace-nowrap text-xs sm:text-sm transition-all duration-200 relative mx-0.5 first:ml-0 last:mr-0 text-emerald-400 bg-emerald-400/[0.08] shadow-sm shadow-emerald-400/10">
                    PnL
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[64px] font-semibold text-white/[0.03]">cripto-moon</span>
              </div>
              <div className="relative">
                <div className="absolute text-right -top-5 right-4 z-10">
                  <div className="text-sm text-neutral-400">{selectedFilter} PnL</div>
                  <div className={`text-xl font-bold ${filteredChartData.length > 0 && filteredChartData[filteredChartData.length - 1]?.totalValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {filteredChartData.length > 0 
                      ? `${filteredChartData[filteredChartData.length - 1].totalValue >= 0 ? '+' : ''}$${filteredChartData[filteredChartData.length - 1].totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '$0.00'
                    }
                  </div>
                </div>
                
                {/* Our Chart */}
                <div style={{ minHeight: '365px' }}>
                  {isLoading ? (
                    <div className="h-64 bg-neutral-900/30 rounded-xl border border-neutral-800/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-neutral-400 text-sm">Loading chart data...</p>
                      </div>
                    </div>
                  ) : filteredChartData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-64 w-full"
                    >
                      <AreaChart data={filteredChartData} margin={{ left: 12, right: 12 }}>
                        <defs>
                          <linearGradient id="fillPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={getChartColor()} stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillPnLRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          domain={['dataMin', 'dataMax']}
                          ticks={[-1000000, -500000, 0, 500000, 1000000]}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                          dataKey="totalValue"
                          type="natural"
                          fill="url(#fillPnL)"
                          stroke={getChartColor()}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-64 bg-neutral-900/30 rounded-xl border border-neutral-800/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-400/10 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-neutral-400 text-sm">No chart data available</p>
                        <p className="text-neutral-500 text-xs mt-1">Selected: {selectedFilter}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
