import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserWalletService } from '@/lib/user-wallet-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { walletAddress, accountId, privateKey } = body;

    // Validate required fields
    if (!walletAddress || !accountId || !privateKey) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, accountId, privateKey' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!UserWalletService.validateWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const result = await UserWalletService.connectWallet(
      userId,
      walletAddress,
      accountId,
      privateKey
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Wallet connected successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/user-wallet/connect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await UserWalletService.disconnectWallet(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Wallet disconnected successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/user-wallet/connect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


