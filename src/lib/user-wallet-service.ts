import { prisma } from '@/lib/db';

export interface UserWalletData {
  walletAddress?: string;
  accountId?: string;
  privateKey?: string;
  maxTradeSize?: number;
  riskPercentage?: number;
  maxOpenPositions?: number;
  autoCopyEnabled?: boolean;
  stopLossEnabled?: boolean;
}

export interface UserWalletResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class UserWalletService {
  /**
   * Get user wallet configuration
   */
  static async getUserWallet(userId: string): Promise<UserWalletResponse> {
    try {
      const userWallet = await prisma.userWallet.findUnique({
        where: { userId }
      });

      if (!userWallet) {
        // Create default user wallet if doesn't exist
        const newUserWallet = await prisma.userWallet.create({
          data: {
            userId,
            maxTradeSize: 1000,
            riskPercentage: 2,
            maxOpenPositions: 5,
            autoCopyEnabled: true,
            stopLossEnabled: true
          }
        });

        return {
          success: true,
          data: newUserWallet
        };
      }

      return {
        success: true,
        data: userWallet
      };
    } catch (error) {
      console.error('Error getting user wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user wallet configuration
   */
  static async updateUserWallet(userId: string, data: UserWalletData): Promise<UserWalletResponse> {
    try {
      // Check if user wallet exists
      const existingWallet = await prisma.userWallet.findUnique({
        where: { userId }
      });

      let userWallet;

      if (existingWallet) {
        // Update existing wallet
        userWallet = await prisma.userWallet.update({
          where: { userId },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new wallet
        userWallet = await prisma.userWallet.create({
          data: {
            userId,
            ...data
          }
        });
      }

      return {
        success: true,
        data: userWallet
      };
    } catch (error) {
      console.error('Error updating user wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Connect Hyperliquid wallet
   */
  static async connectWallet(
    userId: string, 
    walletAddress: string, 
    accountId: string, 
    privateKey: string
  ): Promise<UserWalletResponse> {
    try {
      // TODO: Add encryption for private key
      const encryptedPrivateKey = privateKey; // Placeholder - implement encryption

      const userWallet = await prisma.userWallet.upsert({
        where: { userId },
        update: {
          walletAddress,
          accountId,
          privateKey: encryptedPrivateKey,
          isConnected: true,
          lastConnected: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          walletAddress,
          accountId,
          privateKey: encryptedPrivateKey,
          isConnected: true,
          lastConnected: new Date(),
          maxTradeSize: 1000,
          riskPercentage: 2,
          maxOpenPositions: 5,
          autoCopyEnabled: true,
          stopLossEnabled: true
        }
      });

      return {
        success: true,
        data: userWallet
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Disconnect Hyperliquid wallet
   */
  static async disconnectWallet(userId: string): Promise<UserWalletResponse> {
    try {
      const userWallet = await prisma.userWallet.update({
        where: { userId },
        data: {
          walletAddress: null,
          accountId: null,
          privateKey: null,
          isConnected: false,
          lastConnected: null,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: userWallet
      };
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update copy trading settings
   */
  static async updateCopyTradingSettings(
    userId: string,
    settings: {
      maxTradeSize?: number;
      riskPercentage?: number;
      maxOpenPositions?: number;
      autoCopyEnabled?: boolean;
      stopLossEnabled?: boolean;
    }
  ): Promise<UserWalletResponse> {
    try {
      const userWallet = await prisma.userWallet.upsert({
        where: { userId },
        update: {
          ...settings,
          updatedAt: new Date()
        },
        create: {
          userId,
          maxTradeSize: 1000,
          riskPercentage: 2,
          maxOpenPositions: 5,
          autoCopyEnabled: true,
          stopLossEnabled: true,
          ...settings
        }
      });

      return {
        success: true,
        data: userWallet
      };
    } catch (error) {
      console.error('Error updating copy trading settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate wallet address format
   */
  static validateWalletAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Validate risk percentage
   */
  static validateRiskPercentage(percentage: number): boolean {
    return percentage >= 0.1 && percentage <= 100;
  }

  /**
   * Validate trade size
   */
  static validateTradeSize(size: number): boolean {
    return size > 0 && size <= 1000000; // Max 1M USDC
  }
}
