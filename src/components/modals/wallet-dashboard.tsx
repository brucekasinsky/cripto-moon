'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HyperliquidService } from '@/lib/hyperliquid';
import { 
  ArrowLeft, 
  Star, 
  Copy, 
  Search, 
  CheckCircle, 
  HelpCircle
} from 'lucide-react';

interface WalletDashboardProps {
  walletAddress: string;
  className?: string;
}

interface DashboardData {
  // Header Data
  walletAddress: string;
  
  // Performance Metrics
  perpsBalance: number;
  allPnL: number;
  traderAge: string;
  maxDrawdown: number;
  directionBias: string;
  lastTrade: string;
  winRate: number;
  marginUsage: number;
  profitFactor: number;
  sharpe: number;
  avgHoldTime: string;
  positionLS: number;
  positionSize: number;
  uPNL: number;
  
  // ROE Data
  roe1D: number;
  roe7D: number;
  roe30D: number;
  roeAllTime: number;
  
  // Backtest Data
  backtestInvestment: number;
  backtestPnL: number;
  copyRatio: number;
  
  // Chart Data
  chartData: Array<{
    date: string;
    balance: number;
    pnl: number;
  }>;
}

export function WalletDashboard({ walletAddress, className }: WalletDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '7D' | '30D' | 'All'>('All');
  const [selectedChartType, setSelectedChartType] = useState<'Balance' | 'PNL'>('PNL');
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [copyRatio, setCopyRatio] = useState(1);

  const fetchDashboardData = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // console.log('Fetching dashboard data for:', walletAddress);
      
      // Fetch all data in parallel
      const [chartDataResponse] = await Promise.all([
        HyperliquidService.getWalletEquityHistory(walletAddress),
        HyperliquidService.getWalletData(walletAddress),
        HyperliquidService.getRealtimeTrades(walletAddress, walletAddress)
      ]);

      // Extract data from responses
      const chartData: Array<{ date: string; balance: number; pnl: number }> = chartDataResponse.success ? chartDataResponse.data || [] : [];

      // Mock data based on reference image (replace with real calculations)
      const mockDashboardData: DashboardData = {
        walletAddress,
        perpsBalance: 190036.73,
        allPnL: 168606.20,
        traderAge: "9 months",
        maxDrawdown: 28.29,
        directionBias: "Short 16%",
        lastTrade: "1 minute",
        winRate: 56.31,
        marginUsage: 56.74,
        profitFactor: 3.28,
        sharpe: 0.05,
        avgHoldTime: "1.89 days",
        positionLS: 0.93,
        positionSize: 972300,
        uPNL: 43500,
        roe1D: 36.85,
        roe7D: 33.57,
        roe30D: 50.81,
        roeAllTime: 249.84,
        backtestInvestment: investmentAmount,
        backtestPnL: 1080.22,
        copyRatio,
        chartData
      };

      // console.log('Dashboard data loaded:', mockDashboardData);
      setDashboardData(mockDashboardData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, copyRatio, investmentAmount]);

  useEffect(() => {
    if (walletAddress) {
      fetchDashboardData();
    }
  }, [walletAddress, selectedTimeframe, fetchDashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatLargeCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const runBacktest = () => {
    // Mock backtest calculation
    const mockBacktestPnL = investmentAmount * 0.108; // 10.8% return
    setDashboardData(prev => prev ? { ...prev, backtestPnL: mockBacktestPnL } : null);
  };

  if (!walletAddress) return null;

  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {/* Header Bar - Compact layout matching reference */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 text-sm">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-gray-300">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <Button variant="ghost" size="sm" className="p-0.5 h-auto">
              <Star className="w-3 h-3 text-yellow-400" />
            </Button>
            <Button variant="ghost" size="sm" className="p-0.5 h-auto" onClick={() => copyToClipboard(walletAddress)}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium">
          Copy Trade
        </Button>
        
        <div className="flex items-center gap-1">
          <Search className="w-3 h-3 text-gray-400" />
          <Input 
            placeholder="Q Search by address" 
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 w-40 h-7 text-xs"
          />
        </div>
      </div>

      {/* Backtest Section - Compact layout */}
      <div className="px-6 py-3 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-medium">Run Backtest:</span>
            <Input 
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-20 h-7 bg-gray-800 border-gray-700 text-white text-xs"
            />
            <span className="text-gray-400 text-xs">$</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">Copy Ratio:</span>
            <Input 
              value={copyRatio}
              onChange={(e) => setCopyRatio(Number(e.target.value))}
              className="w-12 h-7 bg-gray-800 border-gray-700 text-white text-xs"
            />
            <span className="text-gray-400 text-xs">X</span>
            <select className="bg-gray-800 border border-gray-700 text-white rounded px-1 py-0.5 text-xs">
              <option>30D</option>
            </select>
          </div>
          
          <Button onClick={runBacktest} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs">
            Run
          </Button>
          
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-white text-sm">
              Backtest PnL: {formatCurrency(dashboardData?.backtestPnL || 0)}
            </span>
            <HelpCircle className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : dashboardData ? (
          <>
            {/* Performance Metrics Grid - Exact layout from reference image */}
            <div className="grid grid-cols-7 gap-3">
              {/* First Row - 7 cards */}
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Perps Balance</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(dashboardData.perpsBalance)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">All PnL</div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(dashboardData.allPnL)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Trader Age</div>
                  <div className="text-lg font-bold text-white">{dashboardData.traderAge}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Max Drawdown</div>
                  <div className="text-lg font-bold text-white">{formatPercentage(dashboardData.maxDrawdown)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Direction Bias</div>
                  <div className="text-lg font-bold text-white">{dashboardData.directionBias}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Last Trade</div>
                  <div className="text-lg font-bold text-white">{dashboardData.lastTrade}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                  <div className="text-lg font-bold text-white">{formatPercentage(dashboardData.winRate)}</div>
                </CardContent>
              </Card>
              
              {/* Second Row - 7 cards with larger card on the right */}
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Margin Usage</div>
                  <div className="text-lg font-bold text-white mb-1">{formatPercentage(dashboardData.marginUsage)}</div>
                  <Progress value={dashboardData.marginUsage} className="h-1.5" />
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Profit Factor</div>
                  <div className="text-lg font-bold text-green-400">{dashboardData.profitFactor.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Sharpe</div>
                  <div className="text-lg font-bold text-red-400">{dashboardData.sharpe.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Avg Hold time</div>
                  <div className="text-lg font-bold text-white">{dashboardData.avgHoldTime}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Position L/S</div>
                  <div className="text-lg font-bold text-white">{dashboardData.positionLS.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">Position Size</div>
                  <div className="text-lg font-bold text-green-400">{formatLargeCurrency(dashboardData.positionSize)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 h-20">
                <CardContent className="p-3 flex flex-col justify-center h-full">
                  <div className="text-xs text-gray-400 mb-1">uPNL</div>
                  <div className="text-lg font-bold text-green-400">{formatLargeCurrency(dashboardData.uPNL)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section - Chart and ROE */}
            <div className="grid grid-cols-4 gap-4">
              {/* Performance Chart Section */}
              <Card className="col-span-3 bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="space-y-2">
                    {/* Timeframe Filters */}
                    <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
                      <TabsList className="grid w-full grid-cols-4 bg-gray-700 h-8">
                        <TabsTrigger value="1D" className="data-[state=active]:bg-green-500 text-xs">1D</TabsTrigger>
                        <TabsTrigger value="7D" className="data-[state=active]:bg-green-500 text-xs">7D</TabsTrigger>
                        <TabsTrigger value="30D" className="data-[state=active]:bg-green-500 text-xs">30D</TabsTrigger>
                        <TabsTrigger value="All" className="data-[state=active]:bg-green-500 text-xs">All</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    {/* Chart Type Filters */}
                    <Tabs value={selectedChartType} onValueChange={(value) => setSelectedChartType(value as any)}>
                      <TabsList className="grid w-full grid-cols-2 bg-gray-700 h-8">
                        <TabsTrigger value="Balance" className="data-[state=active]:bg-green-500 text-xs">Balance</TabsTrigger>
                        <TabsTrigger value="PNL" className="data-[state=active]:bg-green-500 text-xs">PNL</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    {/* Display Value */}
                    <div className="text-xl font-bold text-green-400">
                      {selectedChartType === 'PNL' ? formatCurrency(dashboardData.allPnL) : formatCurrency(dashboardData.perpsBalance)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.chartData}>
                        <defs>
                          <linearGradient id="fillChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date"
                          tick={{ fill: '#9CA3AF', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#9CA3AF', fontSize: 10 }}
                          tickFormatter={(value) => formatLargeCurrency(value)}
                          axisLine={false}
                          tickLine={false}
                          domain={[-600000, 200000]}
                          ticks={[-600000, -400000, -200000, 0, 200000, 400000, 600000]}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg">
                                  <p className="text-white font-medium text-xs">{label}</p>
                                  <p className="text-green-400 text-xs">
                                    {selectedChartType}: {formatCurrency(payload[0].value as number)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          dataKey={selectedChartType === 'PNL' ? 'pnl' : 'balance'}
                          type="natural"
                          fill="url(#fillChart)"
                          stroke="#10B981"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-600 text-base font-bold opacity-20">Apexliquid.bot</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ROE Section */}
              <Card className="col-span-1 bg-gray-800 border-gray-700">
                 <CardContent className="pt-0">
                 
                    <Card className="bg-gray-700 border-gray-600 h-20 mb-4">
                      <CardContent className="p-3 flex flex-col justify-center h-full">
                        <div className="text-xs text-gray-400 mb-1">1D ROE</div>
                        <div className="text-lg font-bold text-green-400">{formatPercentage(dashboardData.roe1D)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700 border-gray-600 h-20 mb-4">
                      <CardContent className="p-3 flex flex-col justify-center h-full">
                        <div className="text-xs text-gray-400 mb-1">7D ROE</div>
                        <div className="text-lg font-bold text-green-400">{formatPercentage(dashboardData.roe7D)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700 border-gray-600 h-20 mb-4">
                      <CardContent className="p-3 flex flex-col justify-center h-full">
                        <div className="text-xs text-gray-400 mb-1">30D ROE</div>
                        <div className="text-lg font-bold text-green-400">{formatPercentage(dashboardData.roe30D)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700 border-gray-600 h-20 mb-4">
                      <CardContent className="p-3 flex flex-col justify-center h-full">
                        <div className="text-xs text-gray-400 mb-1">ALL TIME ROE</div>
                        <div className="text-lg font-bold text-green-400">{formatPercentage(dashboardData.roeAllTime)}</div>
                      </CardContent>
                    </Card>
                 
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
