import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating UserWallet collection...');
    
    // Try to create a test user wallet to trigger collection creation
    const testWallet = await prisma.userWallet.create({
      data: {
        userId: 'test-user-' + Date.now(),
        maxTradeSize: 1000,
        riskPercentage: 2,
        maxOpenPositions: 5,
        autoCopyEnabled: true,
        stopLossEnabled: true
      }
    });
    
    console.log('✅ UserWallet collection created successfully');
    
    // Clean up - delete the test wallet
    await prisma.userWallet.delete({
      where: { id: testWallet.id }
    });
    
    console.log('✅ Test wallet deleted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'UserWallet collection created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating UserWallet collection:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}


