import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserWalletService } from '@/lib/user-wallet-service';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await UserWalletService.getUserWallet(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    // console.error('Error in GET /api/user-wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(_request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await _request.json();
    const { 
      walletAddress, 
      accountId, 
      privateKey,
      maxTradeSize,
      riskPercentage,
      maxOpenPositions,
      autoCopyEnabled,
      stopLossEnabled
    } = body;

    // Validate input data
    if (walletAddress && !UserWalletService.validateWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    if (riskPercentage && !UserWalletService.validateRiskPercentage(riskPercentage)) {
      return NextResponse.json(
        { error: 'Risk percentage must be between 0.1 and 100' },
        { status: 400 }
      );
    }

    if (maxTradeSize && !UserWalletService.validateTradeSize(maxTradeSize)) {
      return NextResponse.json(
        { error: 'Trade size must be between 0 and 1,000,000 USDC' },
        { status: 400 }
      );
    }

    const result = await UserWalletService.updateUserWallet(userId, {
      walletAddress,
      accountId,
      privateKey,
      maxTradeSize,
      riskPercentage,
      maxOpenPositions,
      autoCopyEnabled,
      stopLossEnabled
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    // console.error('Error in PUT /api/user-wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



