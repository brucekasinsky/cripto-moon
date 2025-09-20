import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserWalletService } from '@/lib/user-wallet-service';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      maxTradeSize,
      riskPercentage,
      maxOpenPositions,
      autoCopyEnabled,
      stopLossEnabled
    } = body;

    // Validate input data
    if (riskPercentage !== undefined && !UserWalletService.validateRiskPercentage(riskPercentage)) {
      return NextResponse.json(
        { error: 'Risk percentage must be between 0.1 and 100' },
        { status: 400 }
      );
    }

    if (maxTradeSize !== undefined && !UserWalletService.validateTradeSize(maxTradeSize)) {
      return NextResponse.json(
        { error: 'Trade size must be between 0 and 1,000,000 USDC' },
        { status: 400 }
      );
    }

    if (maxOpenPositions !== undefined && (maxOpenPositions < 1 || maxOpenPositions > 50)) {
      return NextResponse.json(
        { error: 'Maximum open positions must be between 1 and 50' },
        { status: 400 }
      );
    }

    const result = await UserWalletService.updateCopyTradingSettings(userId, {
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
      data: result.data,
      message: 'Copy trading settings updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/user-wallet/copy-trading:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


