const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserWallet() {
  try {
    console.log('Testing UserWallet model...');
    
    // Try to create a test user wallet
    const testWallet = await prisma.userWallet.create({
      data: {
        userId: 'test-user-123',
        maxTradeSize: 1000,
        riskPercentage: 2,
        maxOpenPositions: 5,
        autoCopyEnabled: true,
        stopLossEnabled: true
      }
    });
    
    console.log('✅ UserWallet created successfully:', testWallet);
    
    // Clean up - delete the test wallet
    await prisma.userWallet.delete({
      where: { id: testWallet.id }
    });
    
    console.log('✅ Test wallet deleted successfully');
    
  } catch (error) {
    console.error('❌ Error testing UserWallet:', error.message);
    
    if (error.message.includes('Unknown field')) {
      console.log('🔧 The UserWallet model might not exist in the database yet.');
      console.log('   You may need to run: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUserWallet();


