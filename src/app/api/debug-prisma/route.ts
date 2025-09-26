import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // console.log('Debugging Prisma...');
    // console.log('Prisma object:', typeof prisma);
    // console.log('Prisma keys:', Object.keys(prisma));
    // console.log('UserWallet exists:', 'userWallet' in prisma);
    
    // Try to access the userWallet property
    if ('userWallet' in prisma) {
    // console.log('✅ userWallet property exists');
      
      // Try to call findMany
      const result = await (prisma as any).userWallet.findMany();
    // console.log('✅ findMany works, result:', result);
      
      return NextResponse.json({
        success: true,
        message: 'UserWallet model is accessible',
        result: result
      });
    } else {
    // console.log('❌ userWallet property does not exist');
      return NextResponse.json({
        success: false,
        error: 'userWallet property does not exist in prisma client',
        availableModels: Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_'))
      });
    }
    
  } catch (error) {
    // console.error('❌ Error debugging Prisma:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}



