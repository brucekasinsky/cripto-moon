'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HyperliquidService } from '@/lib/hyperliquid';

interface WalletDetailsContentProps {
  walletAddress: string;
  className?: string;
}

interface WalletData {
  chartData: Array<{
    totalValue: number;
    pnl: number;
    timestamp: string;
  }>;
  transactions: Array<{
    id: string;
    timestamp: string;
    type: string;
    symbol: string;
    side: string;
    size: number;
    price: number;
    pnl: number;
    fee: number;
  }>;
  currentBalance: number;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  avgTradeSize: number;
  maxDrawdown: number;
}

export function WalletDetailsContent({ walletAddress, className }: WalletDetailsContentProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('90d');

  const fetchWalletData = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
    // console.log('Fetching wallet data for:', walletAddress);
      
      // Fetch all data in parallel
      const timeframeDays = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
      const startTime = Date.now() - (timeframeDays * 24 * 60 * 60 * 1000);
      
      const [chartDataResponse, walletDataResponse, tradesResponse] = await Promise.all([
        HyperliquidService.getWalletEquityHistory(walletAddress, startTime),
        HyperliquidService.getWalletData(walletAddress),
        HyperliquidService.getRealtimeTrades(walletAddress, walletAddress)
      ]);

    // console.log('Raw chart data:', chartDataResponse);
    // console.log('Wallet data:', walletDataResponse);
    // console.log('Trades data:', tradesResponse);

      // Extract data from responses
      const chartData: Array<{ totalValue: number; pnl: number; timestamp: string }> = chartDataResponse.success ? chartDataResponse.data || [] : [];
      const walletData = walletDataResponse.success ? walletDataResponse.data : null;
      const trades = tradesResponse.success ? tradesResponse.data : [];

      // Process transactions from trades
      const transactions = Array.isArray(trades) ? trades.map((trade: any) => ({
        id: trade.id || `${trade.timestamp}_${trade.coin}_${trade.side}`,
        timestamp: trade.timestamp || new Date().toISOString(),
        type: 'Trade',
        symbol: trade.coin || 'Unknown',
        side: trade.side || 'Unknown',
        size: trade.size || 0,
        price: trade.price || 0,
        pnl: trade.pnl || 0,
        fee: 0 // Fee not available in current trade data
      })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

      // Calculate metrics
      const currentBalance = walletData?.totalValue || 0;
      const totalPnL = chartData.length > 0 ? chartData[chartData.length - 1].totalValue : 0;
      const totalTrades = transactions.length;
      const winningTrades = transactions.filter((t: any) => t.pnl > 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const avgTradeSize = totalTrades > 0 ? transactions.reduce((sum: number, t: any) => sum + t.size, 0) / totalTrades : 0;
      
      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = 0;
      chartData.forEach((point: any) => {
        if (point.totalValue > peak) {
          peak = point.totalValue;
        }
        const drawdown = peak - point.totalValue;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });

      const processedData: WalletData = {
        chartData,
        transactions,
        currentBalance,
        totalPnL,
        totalTrades,
        winRate,
        avgTradeSize,
        maxDrawdown
      };

    // console.log('Processed wallet data:', processedData);
      setWalletData(processedData);

    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, selectedTimeframe]);

  useEffect(() => {
    if (walletAddress) {
      fetchWalletData();
    }
  }, [walletAddress, selectedTimeframe, fetchWalletData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeframe Selector */}
      <div className="flex justify-end gap-2">
        {(['7d', '30d', '90d'] as const).map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
            className="text-xs"
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dados da carteira...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchWalletData} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      ) : walletData ? (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(walletData.currentBalance)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">PnL Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${walletData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(walletData.totalPnL)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{walletData.totalTrades}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxa de Vitória</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{walletData.winRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Gráfico de PnL</TabsTrigger>
              <TabsTrigger value="transactions">Histórico de Transações</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do PnL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={walletData.chartData}>
                        <defs>
                          <linearGradient id="fillPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="fillPnLRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="timestamp"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => formatDate(value)}
                          axisLine={false}
                          tickLine={false}
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
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value as number;
                              return (
                                <div className="bg-[#1F2937] border border-gray-600 rounded-lg p-3 shadow-lg">
                                  <p className="text-white font-medium">{formatDate(label as string)}</p>
                                  <p className={`text-sm ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    PnL: {formatCurrency(value)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          dataKey="totalValue"
                          type="natural"
                          fill="url(#fillPnL)"
                          stroke="#10B981"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-2 text-gray-400">Data</th>
                          <th className="text-left py-3 px-2 text-gray-400">Tipo</th>
                          <th className="text-left py-3 px-2 text-gray-400">Símbolo</th>
                          <th className="text-left py-3 px-2 text-gray-400">Lado</th>
                          <th className="text-right py-3 px-2 text-gray-400">Tamanho</th>
                          <th className="text-right py-3 px-2 text-gray-400">Preço</th>
                          <th className="text-right py-3 px-2 text-gray-400">PnL</th>
                          <th className="text-right py-3 px-2 text-gray-400">Taxa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletData.transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="py-3 px-2 text-gray-300">
                              {formatDateTime(transaction.timestamp)}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="text-xs">
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-white font-medium">
                              {transaction.symbol}
                            </td>
                            <td className="py-3 px-2">
                              <Badge 
                                variant={transaction.side === 'B' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {transaction.side === 'B' ? 'Compra' : 'Venda'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right text-gray-300">
                              {transaction.size.toFixed(4)}
                            </td>
                            <td className="py-3 px-2 text-right text-gray-300">
                              {formatCurrency(transaction.price)}
                            </td>
                            <td className={`py-3 px-2 text-right font-medium ${
                              transaction.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(transaction.pnl)}
                            </td>
                            <td className="py-3 px-2 text-right text-gray-300">
                              {formatCurrency(transaction.fee)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
