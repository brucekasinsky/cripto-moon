import { HyperliquidWalletData, HyperliquidPortfolio, HyperliquidAPIResponse } from '@/types/hyperliquid';

const HYPERLIQUID_API_BASE = 'https://api.hyperliquid.xyz';

export class HyperliquidService {
  // Cache and rate limiting based on Hyperliquid API limits
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static requestWeights: number[] = []; // Track request weights in last minute
  private static readonly MAX_WEIGHT_PER_MINUTE = 1200; // Hyperliquid limit
  private static readonly CACHE_TTL = 30000; // 30 seconds cache
  
  // Request weights based on Hyperliquid documentation
  private static readonly REQUEST_WEIGHTS = {
    'clearinghouseState': 2,
    'userFills': 20, // Base weight + additional per 20 items
    'userRole': 60,
    'default': 20
  };

  /**
   * Clear cache for a specific address or all cache
   */
  static clearCache(address?: string) {
    if (address) {
      // Clear cache entries for specific address
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.includes(address)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // Clear all cache
      this.cache.clear();
    }
    console.log('Cache cleared for:', address || 'all');
  }

  private static async makeRequest<T>(endpoint: string, body?: any): Promise<HyperliquidAPIResponse<T>> {
    try {
      // Create cache key
      const cacheKey = `${endpoint}_${JSON.stringify(body || {})}`;
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log('Using cached data for:', cacheKey);
        return { success: true, data: cached.data };
      }

      // Calculate request weight
      const requestType = body?.type || 'default';
      let requestWeight = this.REQUEST_WEIGHTS[requestType as keyof typeof this.REQUEST_WEIGHTS] || this.REQUEST_WEIGHTS.default;
      
      // Add additional weight for userFills based on expected items
      if (requestType === 'userFills') {
        // Estimate additional weight based on timeframe
        const startTime = body?.startTime;
        if (startTime) {
          const daysDiff = (Date.now() - startTime) / (24 * 60 * 60 * 1000);
          const estimatedItems = Math.min(daysDiff * 10, 1000); // Estimate 10 trades per day, max 1000
          requestWeight += Math.floor(estimatedItems / 20);
        }
      }

      // Check if we can make this request without exceeding rate limit
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      // Remove old weights (older than 1 minute)
      this.requestWeights = this.requestWeights.filter(weight => weight > oneMinuteAgo);
      
      // Calculate current weight usage
      const currentWeight = this.requestWeights.reduce((sum, weight) => sum + weight, 0);
      
      if (currentWeight + requestWeight > this.MAX_WEIGHT_PER_MINUTE) {
        const waitTime = Math.min(60000 - (now - Math.min(...this.requestWeights)), 10000); // Wait up to 10 seconds
        console.log(`Rate limiting: current weight ${currentWeight}, need ${requestWeight}, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      console.log(`Making API request to: ${endpoint} (weight: ${requestWeight})`);
      const response = await fetch(`${HYPERLIQUID_API_BASE}${endpoint}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limited by API, using cached data if available');
          if (cached) {
            return { success: true, data: cached.data };
          }
          throw new Error('Rate limited and no cached data available');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add this request weight to tracking
      this.requestWeights.push(now);
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Hyperliquid API error:', error);
      
      // Try to return cached data on error
      const cacheKey = `${endpoint}_${JSON.stringify(body || {})}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('Using cached data due to error');
        return { success: true, data: cached.data };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get account information from Hyperliquid
   */
  static async getAccountInfo(address: string): Promise<HyperliquidAPIResponse<any>> {
    try {
      console.log('Fetching account info for:', address);
      
      // Get account state
      const accountStateResponse = await this.makeRequest('/info', {
        type: 'clearinghouseState',
        user: address
      });

      if (accountStateResponse.success && accountStateResponse.data) {
        const accountState = accountStateResponse.data as any;
        
        // Calculate derived values
        const totalValue = parseFloat(accountState.marginSummary?.accountValue || '0');
        const perpValue = parseFloat(accountState.marginSummary?.totalMarginUsed || '0');
        const spotValue = totalValue - perpValue;
        const withdrawable = parseFloat(accountState.marginSummary?.totalNtlPos || '0');
        
        const processedData = {
          totalValue,
          perpValue,
          spotValue,
          withdrawable,
          leverage: perpValue > 0 ? totalValue / perpValue : 1,
          totalPositionValue: perpValue,
          perpEquity: perpValue,
          marginUsage: perpValue > 0 ? (perpValue / totalValue) * 100 : 0,
          directionBias: 'LONG' as const, // This would need to be calculated from positions
          longExposure: 100,
          positionDistribution: 100,
          unrealizedPnL: 0, // This would need to be calculated from positions
          roe: 0 // This would need to be calculated
        };

        return { success: true, data: processedData };
      }

      return { success: false, error: 'No account data received' };
    } catch (error) {
      console.error('Hyperliquid account info error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get account equity and margin information
   */
  static async getAccountEquity(address: string): Promise<HyperliquidAPIResponse<any>> {
    try {
      console.log('Fetching account equity for:', address);
      
      // Get account state for equity information
      const accountStateResponse = await this.makeRequest('/info', {
        type: 'clearinghouseState',
        user: address
      });

      if (accountStateResponse.success && accountStateResponse.data) {
        const accountState = accountStateResponse.data as any;
        
        // Get positions for unrealized PnL calculation
        const positionsResponse = await this.makeRequest('/info', {
          type: 'openOrders',
          user: address
        });

        let unrealizedPnL = 0;
        let directionBias: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        
        if (positionsResponse.success && positionsResponse.data && Array.isArray(positionsResponse.data)) {
          const positions = positionsResponse.data;
          let totalLongValue = 0;
          let totalShortValue = 0;
          
          positions.forEach((position: any) => {
            const value = parseFloat(position.sz) * parseFloat(position.px);
            if (position.side === 'B') {
              totalLongValue += value;
            } else {
              totalShortValue += value;
            }
            // Calculate unrealized PnL (simplified)
            unrealizedPnL += value * 0.02; // Mock 2% gain/loss
          });
          
          if (totalLongValue > totalShortValue) {
            directionBias = 'LONG';
          } else if (totalShortValue > totalLongValue) {
            directionBias = 'SHORT';
          }
        }

        const totalValue = parseFloat(accountState.marginSummary?.accountValue || '0');
        const perpValue = parseFloat(accountState.marginSummary?.totalMarginUsed || '0');
        
        const processedData = {
          perpEquity: perpValue,
          marginUsage: perpValue > 0 ? (perpValue / totalValue) * 100 : 0,
          directionBias,
          longExposure: directionBias === 'LONG' ? 100 : 0,
          positionDistribution: 100,
          unrealizedPnL,
          roe: totalValue > 0 ? (unrealizedPnL / totalValue) * 100 : 0
        };

        return { success: true, data: processedData };
      }

      return { success: false, error: 'No equity data received' };
    } catch (error) {
      console.error('Hyperliquid account equity error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get open positions for a wallet
   */
  static async getOpenPositions(address: string): Promise<HyperliquidAPIResponse<any>> {
    try {
      // Return mock data for now
      console.log('Using mock data for open positions due to API issues');
      
      const mockData = {
        positions: [
          {
            coin: 'BTC',
            size: Math.random() * 10 + 0.1,
            entryPx: Math.random() * 100000 + 30000,
            positionValue: Math.random() * 500000 + 10000,
            unrealizedPnl: (Math.random() - 0.5) * 10000
          },
          {
            coin: 'ETH',
            size: Math.random() * 100 + 1,
            entryPx: Math.random() * 5000 + 2000,
            positionValue: Math.random() * 200000 + 5000,
            unrealizedPnl: (Math.random() - 0.5) * 5000
          }
        ]
      };

      return { success: true, data: mockData };
    } catch (error) {
      console.error('Hyperliquid open positions error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get user transactions (fills) only
   */
  static async getUserTransactions(address: string, startTime?: number): Promise<HyperliquidAPIResponse<any[]>> {
    try {
      console.log('Fetching user transactions for:', address);
      
      const fillsResponse = await this.makeRequest('/info', {
        type: 'userFills',
        user: address,
        startTime: startTime || (Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
      });

      if (fillsResponse.success && fillsResponse.data && Array.isArray(fillsResponse.data)) {
        console.log('User transactions loaded:', fillsResponse.data.length);
        return { success: true, data: fillsResponse.data };
      }

      return { success: false, error: 'No transaction data received' };
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all wallet data with multiple endpoints for better accuracy
   */
  static async getAllWalletData(address: string, startTime?: number): Promise<HyperliquidAPIResponse<any>> {
    try {
      console.log('Fetching all wallet data for:', address);
      
      // Get current user state for real-time data
      const userStateResponse = await this.makeRequest('/info', {
        type: 'clearinghouseState',
        user: address
      });

      if (userStateResponse.success && userStateResponse.data) {
        const accountState = userStateResponse.data as any;
        const currentEquity = parseFloat(accountState.marginSummary?.accountValue || '0');
        
        // Get user fills for historical PnL data
        const fillsResponse = await this.makeRequest('/info', {
          type: 'userFills',
          user: address,
          startTime: startTime || (Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
        });

        // Get open orders for current positions
        const openOrdersResponse = await this.makeRequest('/info', {
          type: 'openOrders',
          user: address
        });

        // Get funding history for more accurate PnL calculation
        const fundingResponse = await this.makeRequest('/info', {
          type: 'fundingHistory',
          user: address,
          startTime: startTime || (Date.now() - 90 * 24 * 60 * 60 * 1000)
        });

        let chartData: any[] = [];
        
        // Process fills and funding for accurate PnL calculation
        const dailyData: { [key: string]: { pnl: number, funding: number, trades: any[] } } = {};
        
        // Process fills data
        if (fillsResponse.success && fillsResponse.data && Array.isArray(fillsResponse.data)) {
          const fills = fillsResponse.data;
          console.log('Processing fills:', fills.length, 'fills');
          
          fills.forEach((fill: any) => {
            const date = new Date(parseInt(fill.time)).toISOString().split('T')[0];
            if (!dailyData[date]) {
              dailyData[date] = { pnl: 0, funding: 0, trades: [] };
            }
            
            // Use closedPnl if available, otherwise calculate from price difference
            let pnl = 0;
            if (fill.closedPnl) {
              pnl = parseFloat(fill.closedPnl);
            } else if (fill.px && fill.sz && fill.side) {
              // Estimate PnL from trade data
              const tradeValue = parseFloat(fill.px) * parseFloat(fill.sz);
              pnl = fill.side === 'B' ? tradeValue : -tradeValue;
            }
            
            dailyData[date].pnl += pnl;
            dailyData[date].trades.push(fill);
          });
        }
        
        // Process funding data
        if (fundingResponse.success && fundingResponse.data && Array.isArray(fundingResponse.data)) {
          const fundingHistory = fundingResponse.data;
          console.log('Processing funding:', fundingHistory.length, 'funding events');
          
          fundingHistory.forEach((funding: any) => {
            const date = new Date(parseInt(funding.time)).toISOString().split('T')[0];
            if (!dailyData[date]) {
              dailyData[date] = { pnl: 0, funding: 0, trades: [] };
            }
            
            dailyData[date].funding += parseFloat(funding.usdc || '0');
          });
        }

        // Create chart data points with more accurate calculations
        const sortedDates = Object.keys(dailyData).sort();
        let runningEquity = currentEquity;
        
        // Calculate total PnL to get starting equity
        const totalPnL = Object.values(dailyData).reduce((sum, day) => sum + day.pnl + day.funding, 0);
        runningEquity = currentEquity - totalPnL;
        
        console.log('Starting equity calculation:', { currentEquity, totalPnL, runningEquity });
        
        // Add data points for each day
        sortedDates.forEach(date => {
          const dayData = dailyData[date];
          const dayPnL = dayData.pnl + dayData.funding; // Include funding in PnL
          runningEquity += dayPnL;
          
          chartData.push({
            date: new Date(date).toLocaleDateString('pt-BR', { 
              month: '2-digit', 
              day: '2-digit' 
            }),
            timestamp: new Date(date).getTime(),
            value: Math.round(runningEquity),
            pnl: Math.round(dayData.pnl),
            accountValue: Math.round(runningEquity),
            spotValue: Math.round(runningEquity * 0.15), // 15% as spot estimate
            trades: dayData.trades.map((fill: any) => ({
              coin: fill.coin,
              side: fill.side === 'B' ? 'LONG' : 'SHORT',
              value: parseFloat(fill.sz || '0') * parseFloat(fill.px || '0'),
              timestamp: new Date(parseInt(fill.time || '0')).toISOString()
            }))
          });
        });
        
        console.log('Generated chart data points:', chartData.length);

        // Calculate derived values with better accuracy
        const totalValue = currentEquity;
        const totalMarginUsed = parseFloat(accountState.marginSummary?.totalMarginUsed || '0');
        const totalNtlPos = parseFloat(accountState.marginSummary?.totalNtlPos || '0');
        const withdrawable = parseFloat(accountState.marginSummary?.withdrawable || '0');
        
        // Calculate 24H PnL from recent data
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentData = chartData.filter(point => point.timestamp && point.timestamp >= last24Hours.getTime());
        const pnl24H = recentData.length > 0 ? 
          recentData.reduce((sum, point) => sum + (point.pnl || 0), 0) : 0;
        
        // Calculate unrealized PnL from current positions
        const unrealizedPnL = parseFloat(accountState.marginSummary?.unrealizedPnl || '0');
        
        // Calculate direction bias from positions
        const positions = accountState.assetPositions || [];
        const longExposure = positions.reduce((sum: number, pos: any) => {
          const size = parseFloat(pos.position?.size || '0');
          return sum + (size > 0 ? size : 0);
        }, 0);
        const shortExposure = positions.reduce((sum: number, pos: any) => {
          const size = parseFloat(pos.position?.size || '0');
          return sum + (size < 0 ? Math.abs(size) : 0);
        }, 0);
        
        const directionBias = longExposure > shortExposure ? 'LONG' : 'SHORT';
        const longExposurePercent = totalNtlPos > 0 ? (longExposure / totalNtlPos) * 100 : 0;
        
        const processedData = {
          accountInfo: {
            totalValue,
            perpValue: totalMarginUsed,
            spotValue: totalValue - totalMarginUsed,
            withdrawable,
            leverage: totalMarginUsed > 0 ? totalValue / totalMarginUsed : 1,
            totalPositionValue: totalNtlPos,
            perpEquity: totalMarginUsed,
            marginUsage: totalValue > 0 ? (totalMarginUsed / totalValue) * 100 : 0
          },
          equity: {
            perpEquity: totalMarginUsed,
            marginUsage: totalValue > 0 ? (totalMarginUsed / totalValue) * 100 : 0,
            directionBias,
            longExposure: longExposurePercent,
            positionDistribution: longExposurePercent,
            unrealizedPnL,
            roe: totalValue > 0 ? (unrealizedPnL / totalValue) * 100 : 0
          },
          chartData: {
            trades: chartData,
            pnl24H: Math.round(pnl24H)
          }
        };

        return { success: true, data: processedData };
      }

      return { success: false, error: 'No account data received' };
    } catch (error) {
      console.error('Hyperliquid getAllWalletData error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get account value history for chart
   */
  static async getAccountValueHistory(address: string, startTime?: number): Promise<HyperliquidAPIResponse<any>> {
    try {
      console.log('Fetching account value history for:', address);
      
      // Try to get account state history - this might give us equity over time
      const accountStateResponse = await this.makeRequest('/info', {
        type: 'clearinghouseState',
        user: address
      });

      if (accountStateResponse.success && accountStateResponse.data) {
        const accountState = accountStateResponse.data as any;
        const currentEquity = parseFloat(accountState.marginSummary?.accountValue || '0');
        
        // Get user fills to calculate historical performance
        const fillsResponse = await this.makeRequest('/info', {
          type: 'userFills',
          user: address,
          startTime: startTime || (Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days if no startTime
        });

        if (fillsResponse.success && fillsResponse.data && Array.isArray(fillsResponse.data)) {
          // Process fills to create realistic chart data
          const fills = fillsResponse.data;
          
          // Group fills by day and calculate daily PnL
          const dailyPnL: { [key: string]: number } = {};
          fills.forEach((fill: any) => {
            const date = new Date(parseInt(fill.time)).toISOString().split('T')[0];
            const pnl = fill.closedPnl ? parseFloat(fill.closedPnl) : 0;
            dailyPnL[date] = (dailyPnL[date] || 0) + pnl;
          });

          // Create chart data points
          const chartData: any[] = [];
          const sortedDates = Object.keys(dailyPnL).sort();
          
          // Start from the earliest date and work forward
          let runningEquity = currentEquity;
          
          // Subtract all PnL to get starting equity
          const totalPnL = Object.values(dailyPnL).reduce((sum, pnl) => sum + pnl, 0);
          runningEquity = currentEquity - totalPnL;
          
          // Add data points for each day
          sortedDates.forEach(date => {
            const dayPnL = dailyPnL[date];
            runningEquity += dayPnL;
            
            chartData.push({
              date: new Date(date).toLocaleDateString('pt-BR', { 
                month: '2-digit', 
                day: '2-digit' 
              }),
              value: Math.round(runningEquity),
              trades: fills
                .filter((fill: any) => fill.time && new Date(parseInt(fill.time)).toISOString().split('T')[0] === date)
                .map((fill: any) => ({
                  coin: fill.coin,
                  side: fill.side === 'B' ? 'LONG' : 'SHORT',
                  value: parseFloat(fill.sz) * parseFloat(fill.px),
                  timestamp: new Date(parseInt(fill.time)).toISOString()
                }))
            });
          });

          // If we have data, return it
          if (chartData.length > 0) {
            return { success: true, data: { trades: chartData } };
          }
        }
      }

      // Fallback: return empty data to trigger mock data generation
      return { success: false, error: 'No historical data available' };
    } catch (error) {
      console.error('Hyperliquid account value history error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get wallet portfolio data from Hyperliquid
   * Note: This is a mock implementation since Hyperliquid doesn't have a public API
   * In a real implementation, you would need to use their actual API endpoints
   */
  static async getWalletData(address: string): Promise<HyperliquidAPIResponse<HyperliquidWalletData>> {
    // Mock data for demonstration purposes
    // In walletion, you would make actual API calls to Hyperliquid
    
    const mockData: HyperliquidWalletData = {
      address,
      totalValue: Math.random() * 1000000 + 10000, // Random value between 10k and 1M
      pnl24h: (Math.random() - 0.5) * 10000, // Random P&L between -5k and 5k
      pnl7d: (Math.random() - 0.5) * 50000, // Random P&L between -25k and 25k
      pnl30d: (Math.random() - 0.5) * 200000, // Random P&L between -100k and 100k
      totalTrades: Math.floor(Math.random() * 1000) + 10, // Random trades between 10 and 1010
      winRate: Math.random() * 100, // Random win rate between 0 and 100
      avgTradeSize: Math.random() * 10000 + 100, // Random avg trade size
      openPositions: Math.floor(Math.random() * 20) + 1, // Random positions between 1 and 21
      totalPositions: Math.floor(Math.random() * 100) + 10, // Random total positions
      lastUpdated: new Date(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, data: mockData };
  }

  /**
   * Get detailed portfolio information
   */
  static async getPortfolio(address: string): Promise<HyperliquidAPIResponse<HyperliquidPortfolio>> {
    // Mock portfolio data
    const mockPortfolio: HyperliquidPortfolio = {
      address,
      totalValue: Math.random() * 1000000 + 10000,
      positions: [
        {
          coin: 'BTC',
          size: Math.random() * 10,
          entryPrice: 45000 + Math.random() * 10000,
          markPrice: 45000 + Math.random() * 10000,
          pnl: (Math.random() - 0.5) * 10000,
          pnlPercent: (Math.random() - 0.5) * 50,
        },
        {
          coin: 'ETH',
          size: Math.random() * 100,
          entryPrice: 3000 + Math.random() * 1000,
          markPrice: 3000 + Math.random() * 1000,
          pnl: (Math.random() - 0.5) * 5000,
          pnlPercent: (Math.random() - 0.5) * 30,
        },
      ],
      trades: [],
      pnl24h: (Math.random() - 0.5) * 10000,
      pnl7d: (Math.random() - 0.5) * 50000,
      pnl30d: (Math.random() - 0.5) * 200000,
    };

    await new Promise(resolve => setTimeout(resolve, 300));

    return { success: true, data: mockPortfolio };
  }

  /**
   * Validate if an address is a valid Hyperliquid wallet
   */
  static async validateAddress(address: string): Promise<boolean> {
    // In a real implementation, you would validate against Hyperliquid's API
    // For now, we'll just check if it looks like a valid address
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get all trades for a wallet (complete history)
   */
  static async getRealtimeTrades(address: string, accountId?: string): Promise<HyperliquidAPIResponse<any>> {
    try {
      // Try to fetch real trades from Hyperliquid API
      // Get all user fills (complete history)
      const response = await this.makeRequest('/info', {
        type: 'userFills',
        user: address,
        startTime: 0 // Get all trades from the beginning
      });

      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform Hyperliquid fills to our format
        const trades = response.data.map((fill: any, index: number) => ({
          id: `${fill.time}-${fill.coin}-${fill.side}-${index}`,
          coin: fill.coin,
          side: fill.side === 'B' ? 'B' : 'A',
          size: parseFloat(fill.sz),
          price: parseFloat(fill.px),
          timestamp: new Date(parseInt(fill.time)).toISOString(),
          pnl: fill.closedPnl ? parseFloat(fill.closedPnl) : undefined,
        }));

        return { success: true, data: trades };
      }
    } catch (error) {
      console.error('Failed to fetch real trades from Hyperliquid API:', error);
      return { 
        success: false, 
        error: `Failed to fetch real trades: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }

    // If we reach here, the API call succeeded but returned no data
    return { 
      success: false, 
      error: 'No trades found for this wallet on Hyperliquid' 
    };
  }

  /**
   * Get real-time positions for a wallet
   */
  static async getRealtimePositions(address: string, accountId?: string): Promise<HyperliquidAPIResponse<any>> {
    // Mock real-time positions
    const mockPositions = [
      {
        coin: 'BTC',
        size: Math.random() * 10,
        entryPrice: 45000 + Math.random() * 1000,
        markPrice: 45000 + Math.random() * 1000,
        pnl: (Math.random() - 0.5) * 5000,
        pnlPercent: (Math.random() - 0.5) * 20,
        timestamp: new Date().toISOString(),
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 200));

    return { success: true, data: mockPositions };
  }
}
