require('dotenv').config();

console.log('DB_STRING:', process.env.DB_STRING ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

const { PrismaClient } = require('@prisma/client');

async function test() {
  try {
    console.log('Creating Prisma Client...');
    const prisma = new PrismaClient();
    
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Testing query...');
    const result = await prisma.wallet.findMany();
    console.log('Query successful, found', result.length, 'wallets');
    
    await prisma.$disconnect();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();




