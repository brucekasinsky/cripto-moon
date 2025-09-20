////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter'; // For filtering

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Define the shape of Wallet data
export type Wallet = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

// Mock wallet data store
export const fakeWallets = {
  records: [] as Wallet[], // Holds the list of wallet objects

  // Initialize with sample data
  initialize() {
    const sampleWallets: Wallet[] = [];
    function generateRandomWalletData(id: number): Wallet {
      const categories = [
        'Electronics',
        'Furniture',
        'Clothing',
        'Toys',
        'Groceries',
        'Books',
        'Jewelry',
        'Beauty Wallets'
      ];

      return {
        id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        created_at: faker.date
          .between({ from: '2022-01-01', to: '2023-12-31' })
          .toISOString(),
        price: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
        photo_url: `https://api.slingacademy.com/public/sample-wallets/${id}.png`,
        category: faker.helpers.arrayElement(categories),
        updated_at: faker.date.recent().toISOString()
      };
    }

    // Generate remaining records
    for (let i = 1; i <= 20; i++) {
      sampleWallets.push(generateRandomWalletData(i));
    }

    this.records = sampleWallets;
  },

  // Get all wallets with optional category filtering and search
  async getAll({
    categories = [],
    search
  }: {
    categories?: string[];
    search?: string;
  }) {
    let wallets = [...this.records];

    // Filter wallets based on selected categories
    if (categories.length > 0) {
      wallets = wallets.filter((wallet) =>
        categories.includes(wallet.category)
      );
    }

    // Search functionality across multiple fields
    if (search) {
      wallets = matchSorter(wallets, search, {
        keys: ['name', 'description', 'category']
      });
    }

    return wallets;
  },

  // Get paginated results with optional category filtering and search
  async getWallets({
    page = 1,
    limit = 10,
    categories,
    search
  }: {
    page?: number;
    limit?: number;
    categories?: string;
    search?: string;
  }) {
    await delay(1000);
    const categoriesArray = categories ? categories.split('.') : [];
    const allWallets = await this.getAll({
      categories: categoriesArray,
      search
    });
    const totalWallets = allWallets.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedWallets = allWallets.slice(offset, offset + limit);

    // Mock current time
    const currentTime = new Date().toISOString();

    // Return paginated response
    return {
      success: true,
      time: currentTime,
      message: 'Sample data for testing and learning purposes',
      total_wallets: totalWallets,
      offset,
      limit,
      wallets: paginatedWallets
    };
  },

  // Get a specific wallet by its ID
  async getWalletById(id: number) {
    await delay(1000); // Simulate a delay

    // Find the wallet by its ID
    const wallet = this.records.find((wallet) => wallet.id === id);

    if (!wallet) {
      return {
        success: false,
        message: `Wallet with ID ${id} not found`
      };
    }

    // Mock current time
    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Wallet with ID ${id} found`,
      wallet
    };
  }
};

// Initialize sample wallets
fakeWallets.initialize();
