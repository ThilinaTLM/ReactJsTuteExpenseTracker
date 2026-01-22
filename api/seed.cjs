/**
 * Seed Data Generator for React Finance Tracker Tutorial
 * Run with: node api/seed.js
 *
 * This script generates realistic sample data for the mock API.
 */

const fs = require('fs');
const path = require('path');

// Helper to generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to format date to ISO string
function formatDate(date) {
  return date.toISOString();
}

// Categories with their properties
const categories = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#ef4444', type: 'expense' },
  { id: '2', name: 'Transportation', icon: 'car', color: '#f97316', type: 'expense' },
  { id: '3', name: 'Entertainment', icon: 'film', color: '#a855f7', type: 'expense' },
  { id: '4', name: 'Shopping', icon: 'shopping-bag', color: '#ec4899', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: 'file-text', color: '#6366f1', type: 'expense' },
  { id: '6', name: 'Health', icon: 'heart-pulse', color: '#14b8a6', type: 'expense' },
  { id: '7', name: 'Education', icon: 'graduation-cap', color: '#0ea5e9', type: 'expense' },
  { id: '8', name: 'Other', icon: 'more-horizontal', color: '#64748b', type: 'expense' },
  { id: '9', name: 'Salary', icon: 'briefcase', color: '#22c55e', type: 'income' },
  { id: '10', name: 'Freelance', icon: 'laptop', color: '#10b981', type: 'income' },
  { id: '11', name: 'Investments', icon: 'trending-up', color: '#059669', type: 'income' },
  { id: '12', name: 'Other Income', icon: 'plus-circle', color: '#84cc16', type: 'income' },
];

// Sample expense descriptions by category
const expenseDescriptions = {
  '1': ['Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Lunch meeting', 'Weekly groceries', 'Fast food', 'Food delivery'],
  '2': ['Gas fill-up', 'Uber ride', 'Bus pass', 'Car maintenance', 'Parking', 'Train ticket'],
  '3': ['Netflix subscription', 'Spotify premium', 'Movie tickets', 'Concert tickets', 'Video games', 'Books'],
  '4': ['Amazon purchase', 'Clothing', 'Electronics', 'Home goods', 'Gifts'],
  '5': ['Rent payment', 'Electric bill', 'Internet bill', 'Phone bill', 'Water bill', 'Insurance'],
  '6': ['Gym membership', 'Doctor visit', 'Pharmacy', 'Vitamins', 'Dental checkup'],
  '7': ['Online course', 'Books', 'Workshop fee', 'Certification exam'],
  '8': ['Miscellaneous', 'ATM withdrawal', 'Bank fee'],
};

// Sample income descriptions by category
const incomeDescriptions = {
  '9': ['Monthly salary', 'Paycheck', 'Bonus'],
  '10': ['Freelance project', 'Consulting fee', 'Side gig payment'],
  '11': ['Stock dividends', 'Interest income', 'Investment returns'],
  '12': ['Gift received', 'Refund', 'Cashback reward'],
};

// Generate transactions for a given month
function generateMonthTransactions(year, month, userId, startId) {
  const transactions = [];
  let id = startId;

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  // Add salary at the beginning of the month
  transactions.push({
    id: String(id++),
    userId,
    type: 'income',
    amount: 5000,
    categoryId: '9',
    description: 'Monthly salary',
    date: formatDate(new Date(year, month, 1, 9, 0)),
    createdAt: formatDate(new Date(year, month, 1, 9, 0)),
  });

  // Add rent on the 2nd
  transactions.push({
    id: String(id++),
    userId,
    type: 'expense',
    amount: 1200,
    categoryId: '5',
    description: 'Rent payment',
    date: formatDate(new Date(year, month, 2, 10, 0)),
    createdAt: formatDate(new Date(year, month, 2, 10, 0)),
  });

  // Generate random expenses throughout the month
  const numExpenses = 15 + Math.floor(Math.random() * 10);

  for (let i = 0; i < numExpenses; i++) {
    const categoryId = String(Math.floor(Math.random() * 8) + 1);
    const descriptions = expenseDescriptions[categoryId];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    let amount;
    switch (categoryId) {
      case '1': amount = 15 + Math.random() * 100; break;
      case '2': amount = 10 + Math.random() * 80; break;
      case '3': amount = 10 + Math.random() * 60; break;
      case '4': amount = 20 + Math.random() * 200; break;
      case '5': amount = 50 + Math.random() * 150; break;
      case '6': amount = 20 + Math.random() * 150; break;
      case '7': amount = 50 + Math.random() * 300; break;
      default: amount = 10 + Math.random() * 50;
    }

    const date = randomDate(startDate, endDate);

    transactions.push({
      id: String(id++),
      userId,
      type: 'expense',
      amount: Math.round(amount * 100) / 100,
      categoryId,
      description,
      date: formatDate(date),
      createdAt: formatDate(date),
    });
  }

  // Add 1-3 additional income sources
  const numIncomes = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numIncomes; i++) {
    const categoryId = String(10 + Math.floor(Math.random() * 3));
    const descriptions = incomeDescriptions[categoryId];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    let amount;
    switch (categoryId) {
      case '10': amount = 200 + Math.random() * 800; break;
      case '11': amount = 50 + Math.random() * 300; break;
      default: amount = 50 + Math.random() * 200;
    }

    const date = randomDate(startDate, endDate);

    transactions.push({
      id: String(id++),
      userId,
      type: 'income',
      amount: Math.round(amount * 100) / 100,
      categoryId,
      description,
      date: formatDate(date),
      createdAt: formatDate(date),
    });
  }

  return { transactions, nextId: id };
}

// Generate budgets for a month
function generateMonthBudgets(year, month, userId, startId) {
  const budgets = [];
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const budgetAmounts = {
    '1': 600,  // Food
    '2': 200,  // Transportation
    '3': 150,  // Entertainment
    '4': 300,  // Shopping
    '5': 1500, // Bills
    '6': 250,  // Health
  };

  let id = startId;
  for (const [categoryId, amount] of Object.entries(budgetAmounts)) {
    budgets.push({
      id: String(id++),
      userId,
      categoryId,
      amount,
      month: monthStr,
    });
  }

  return { budgets, nextId: id };
}

// Main seed function
function generateSeedData() {
  const userId = '1';

  const users = [
    {
      id: '1',
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
      avatar: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  let allTransactions = [];
  let allBudgets = [];
  let transactionId = 1;
  let budgetId = 1;

  // Generate data for January, February, March 2024
  for (let month = 0; month < 3; month++) {
    const { transactions, nextId } = generateMonthTransactions(2024, month, userId, transactionId);
    allTransactions = allTransactions.concat(transactions);
    transactionId = nextId;

    const { budgets, nextId: nextBudgetId } = generateMonthBudgets(2024, month, userId, budgetId);
    allBudgets = allBudgets.concat(budgets);
    budgetId = nextBudgetId;
  }

  // Sort transactions by date
  allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Re-assign IDs after sorting
  allTransactions = allTransactions.map((t, i) => ({ ...t, id: String(i + 1) }));

  const db = {
    users,
    categories,
    transactions: allTransactions,
    budgets: allBudgets,
  };

  return db;
}

// Write to file
const data = generateSeedData();
const outputPath = path.join(__dirname, 'db.json');

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('✅ Seed data generated successfully!');
console.log(`📊 Created:`);
console.log(`   - ${data.users.length} users`);
console.log(`   - ${data.categories.length} categories`);
console.log(`   - ${data.transactions.length} transactions`);
console.log(`   - ${data.budgets.length} budgets`);
console.log(`\n📁 Output: ${outputPath}`);
