import { prisma } from '@/lib/db';
import { HyperliquidService } from '@/lib/hyperliquid';
// import { HyperliquidWalletData } from '@/types/hyperliquid';

export class WalletService {
  /**
   * Add a new wallet to the database
   */
  static async addWallet(address: string, name?: string, description?: string, userId?: string) {
    try {
      // Validate the address
      const isValid = await HyperliquidService.validateAddress(address);
      if (!isValid) {
        throw new Error('Invalid wallet address');
      }

      // Check if wallet already exists
      const existingWallet = await prisma.wallet.findUnique({
        where: { address },
      });

      if (existingWallet) {
        throw new Error('Wallet already exists');
      }

      // Get initial data from Hyperliquid API
      const apiResponse = await HyperliquidService.getWalletData(address);
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Failed to fetch wallet data from Hyperliquid');
      }

      const walletData = apiResponse.data;

      // Create wallet in database
      const wallet = await prisma.wallet.create({
        data: {
          address,
          name: name || `Wallet ${address.slice(0, 8)}...`,
          description,
          userId,
          totalValue: walletData.totalValue,
          pnl24h: walletData.pnl24h,
          pnl7d: walletData.pnl7d,
          pnl30d: walletData.pnl30d,
          totalTrades: walletData.totalTrades,
          winRate: walletData.winRate,
          avgTradeSize: walletData.avgTradeSize,
          openPositions: walletData.openPositions,
          totalPositions: walletData.totalPositions,
          lastUpdated: walletData.lastUpdated,
        },
      });

      return { success: true, data: wallet };
    } catch (error) {
      console.error('Error adding wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all wallets with pagination and filtering
   */
  static async getWallets({
    page = 1,
    limit = 10,
    search,
    isFollowing,
    isActive,
    userId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    isFollowing?: boolean;
    isActive?: boolean;
    userId?: string;
  }) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isFollowing !== undefined) {
        where.isFollowing = isFollowing;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (userId) {
        where.userId = userId;
      }

      // Get wallets with pagination
      const [wallets, total] = await Promise.all([
        prisma.wallet.findMany({
          where,
          skip,
          take: limit,
          orderBy: { lastUpdated: 'desc' },
        }),
        prisma.wallet.count({ where }),
      ]);

      return {
        success: true,
        data: {
          wallets,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting wallets:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a specific wallet by ID
   */
  static async getWalletById(id: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id },
      });

      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      return { success: true, data: wallet };
    } catch (error) {
      console.error('Error getting wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update wallet data from Hyperliquid API
   */
  static async updateWalletData(id: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id },
      });

      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      // Get updated data from Hyperliquid API
      const apiResponse = await HyperliquidService.getWalletData(wallet.address);
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Failed to fetch updated wallet data');
      }

      const walletData = apiResponse.data;

      // Update wallet in database
      const updatedWallet = await prisma.wallet.update({
        where: { id },
        data: {
          totalValue: walletData.totalValue,
          pnl24h: walletData.pnl24h,
          pnl7d: walletData.pnl7d,
          pnl30d: walletData.pnl30d,
          totalTrades: walletData.totalTrades,
          winRate: walletData.winRate,
          avgTradeSize: walletData.avgTradeSize,
          openPositions: walletData.openPositions,
          totalPositions: walletData.totalPositions,
          lastUpdated: walletData.lastUpdated,
        },
      });

      return { success: true, data: updatedWallet };
    } catch (error) {
      console.error('Error updating wallet data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Toggle following status for a wallet
   */
  static async toggleFollowing(id: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id },
      });

      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      const updatedWallet = await prisma.wallet.update({
        where: { id },
        data: { isFollowing: !wallet.isFollowing },
      });

      return { success: true, data: updatedWallet };
    } catch (error) {
      console.error('Error toggling following:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a wallet
   */
  static async deleteWallet(id: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id },
      });

      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      await prisma.wallet.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
