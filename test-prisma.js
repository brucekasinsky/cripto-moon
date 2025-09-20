const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  try {
    const prisma = new PrismaClient();
    console.log('Prisma Client created successfully');
    
    // Test connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Test query
    const wallets = await prisma.wallet.findMany();
    console.log('Wallets found:', wallets.length);
    
    await prisma.$disconnect();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

testPrisma();
