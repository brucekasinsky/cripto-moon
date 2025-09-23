import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    // console.log('Testing UserWallet model...');
    
    // Try to find any user wallet
    const userWallets = await prisma.userWallet.findMany({
      take: 1
    });
    
    // console.log('✅ UserWallet model exists and is accessible');
    
    return NextResponse.json({
      success: true,
      message: 'UserWallet model is working',
      count: userWallets.length
    });
    
  } catch (error) {
    // console.error('❌ Error testing UserWallet:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}



