import {
  CustomerProfile,
  SpendingGoal,
  Transaction,
} from '../models/dashboard.model';

export const CUSTOMER_ID = '12345';

export const MOCK_CUSTOMER: CustomerProfile = {
  customerId: CUSTOMER_ID,
  name: 'Lwando Nodume',
  email: 'lwando.nodume@icloud.com',
  joinDate: '2022-03-14',
  accountType: 'Premium',
  totalSpent: 15420.5,
  currency: 'ZAR',
};

export const CATEGORY_CONFIG = [
  { name: 'Groceries', color: '#E07A5F', icon: 'shopping-cart' },
  { name: 'Entertainment', color: '#81B29A', icon: 'film' },
  { name: 'Transportation', color: '#3D85C6', icon: 'car' },
  { name: 'Dining', color: '#F2CC8F', icon: 'utensils' },
  { name: 'Shopping', color: '#9B8AC4', icon: 'shopping-bag' },
  { name: 'Utilities', color: '#6D9FAD', icon: 'zap' },
] as const;

const MERCHANTS: Record<string, string[]> = {
  Groceries: ['Checkers', 'Shoprite', 'Pick n Pay', 'Woolworths Food'],
  Entertainment: ['Ster-Kinekor', 'Netflix', 'Showmax', 'Nu Metro'],
  Transportation: ['Shell', 'Engen', 'Uber', 'Bolt'],
  Dining: ['Nando’s', 'KFC', 'Mugg & Bean', 'Chicken Licken'],
  Shopping: ['Takealot', 'Mr Price', 'Truworths', 'Makro'],
  Utilities: ['City of Tshwane', 'Eskom', 'Telkom', 'Vodacom'],
};

const DESCRIPTIONS: Record<string, string[]> = {
  Groceries: ['Weekly groceries', 'Household essentials', 'Food supplies'],
  Entertainment: ['Subscription', 'Movie tickets', 'Entertainment purchase'],
  Transportation: ['Fuel payment', 'Trip fare', 'Transport expense'],
  Dining: ['Restaurant payment', 'Takeaway meal', 'Lunch'],
  Shopping: ['Retail purchase', 'Online order', 'Clothing purchase'],
  Utilities: ['Monthly bill', 'Account payment', 'Utility expense'],
};

function createMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const categories = CATEGORY_CONFIG;
  const now = new Date();

  for (let i = 0; i < 180; i++) {
    const category = categories[i % categories.length];
    const date = new Date(now);
    date.setDate(now.getDate() - i * 2);

    const merchants = MERCHANTS[category.name];
    const descriptions = DESCRIPTIONS[category.name];

    transactions.push({
      id: `TXN-${String(i + 1).padStart(4, '0')}`,
      date: date.toISOString().slice(0, 10),
      merchant: merchants[i % merchants.length],
      category: category.name,
      amount: Number((80 + ((i * 137) % 920) + (i % 3) * 0.45).toFixed(2)),
      description: descriptions[i % descriptions.length],
      paymentMethod: i % 3 === 0 ? 'Debit card' : 'Online banking',
      icon: category.icon,
      categoryColor: category.color,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export const MOCK_TRANSACTIONS = createMockTransactions();

export const MOCK_GOALS: SpendingGoal[] = [
  {
    id: 'goal-1',
    category: 'Groceries',
    monthlyBudget: 3500,
    currentSpent: 2450,
    percentageUsed: 70,
    daysRemaining: 11,
    status: 'on_track',
  },
  {
    id: 'goal-2',
    category: 'Entertainment',
    monthlyBudget: 1200,
    currentSpent: 1020,
    percentageUsed: 85,
    daysRemaining: 11,
    status: 'warning',
  },
];