export type SpendingPeriod = '7d' | '30d' | '90d' | '1y';

export type TransactionSort =
  | 'date_desc'
  | 'date_asc'
  | 'amount_desc'
  | 'amount_asc';

export type GoalStatus = 'on_track' | 'warning' | 'exceeded';

export interface CustomerProfile {
  customerId: string;
  name: string;
  email: string;
  joinDate: string;
  accountType: string;
  totalSpent: number;
  currency: string;
}

export interface SpendingSummary {
  period: SpendingPeriod;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  comparedToPrevious: {
    spentChange: number;
    transactionChange: number;
  };
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
  icon: string;
}

export interface CategoriesResponse {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalAmount: number;
  categories: SpendingCategory[];
}

export interface SpendingTrend {
  month: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface SpendingTrendsResponse {
  trends: SpendingTrend[];
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  icon: string;
  categoryColor: string;
}

export interface TransactionQuery {
  limit?: number;
  offset?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: TransactionSort;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SpendingGoal {
  id: string;
  category: string;
  monthlyBudget: number;
  currentSpent: number;
  percentageUsed: number;
  daysRemaining: number;
  status: GoalStatus;
}

export interface SpendingGoalsResponse {
  goals: SpendingGoal[];
}

export interface DashboardFiltersResponse {
  categories: Array<{
    name: string;
    color: string;
    icon: string;
  }>;
  dateRangePresets: Array<{
    label: string;
    value: SpendingPeriod;
  }>;
}