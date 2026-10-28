import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import {
  CategoriesResponse,
  CustomerProfile,
  DashboardFiltersResponse,
  SpendingGoal,
  SpendingPeriod,
  SpendingSummary,
  SpendingTrend,
  SpendingTrendsResponse,
  Transaction,
  TransactionQuery,
  TransactionsResponse,
} from '../models/dashboard.model';

import {
  CATEGORY_CONFIG,
  CUSTOMER_ID,
  MOCK_CUSTOMER,
  MOCK_GOALS,
  MOCK_TRANSACTIONS,
} from '../data/mock-spending-data';

@Injectable({
  providedIn: 'root',
})
export class SpendingApi {
  private readonly simulatedLatencyMs = 100;

  private respond<T>(data: T): Observable<T> {
    return of(data).pipe(delay(this.simulatedLatencyMs));
  }

  private assertCustomer(customerId: string): void {
    if (customerId !== CUSTOMER_ID) {
      throw new Error(`Customer ${customerId} was not found.`);
    }
  }

  private dateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private startOfPeriod(period: SpendingPeriod, reference = new Date()): Date {
    const start = new Date(reference);

    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 6);
        break;
      case '30d':
        start.setDate(start.getDate() - 29);
        break;
      case '90d':
        start.setDate(start.getDate() - 89);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    start.setHours(0, 0, 0, 0);
    return start;
  }

  private filterByDates(
    transactions: Transaction[],
    startDate: string,
    endDate: string,
  ): Transaction[] {
    return transactions.filter(
      (transaction) =>
        transaction.date >= startDate && transaction.date <= endDate,
    );
  }

  private filterByPeriod(
    transactions: Transaction[],
    period: SpendingPeriod,
  ): Transaction[] {
    return this.filterByDates(
      transactions,
      this.dateOnly(this.startOfPeriod(period)),
      this.dateOnly(new Date()),
    );
  }

  private sum(transactions: Transaction[]): number {
    return Number(
      transactions.reduce((total, transaction) => total + transaction.amount, 0)
        .toFixed(2),
    );
  }

  private average(transactions: Transaction[]): number {
    return transactions.length
      ? Number((this.sum(transactions) / transactions.length).toFixed(2))
      : 0;
  }

  getProfile(customerId: string): Observable<CustomerProfile> {
    this.assertCustomer(customerId);
    return this.respond(MOCK_CUSTOMER);
  }

  getSummary(
    customerId: string,
    period: SpendingPeriod = '30d',
  ): Observable<SpendingSummary> {
    this.assertCustomer(customerId);

    const current = this.filterByPeriod(MOCK_TRANSACTIONS, period);
    const start = this.startOfPeriod(period);
    const duration = new Date().getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    const previous = this.filterByDates(
      MOCK_TRANSACTIONS,
      this.dateOnly(previousStart),
      this.dateOnly(previousEnd),
    );

    const categoryTotals = this.aggregateCategories(current);
    const topCategory = [...categoryTotals].sort(
      (a, b) => b.amount - a.amount,
    )[0]?.name ?? 'None';

    const currentTotal = this.sum(current);
    const previousTotal = this.sum(previous);

    return this.respond({
      period,
      totalSpent: currentTotal,
      transactionCount: current.length,
      averageTransaction: this.average(current),
      topCategory,
      comparedToPrevious: {
        spentChange: previousTotal
          ? Number(
              (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1),
            )
          : 0,
        transactionChange: previous.length
          ? Number(
              (((current.length - previous.length) / previous.length) * 100).toFixed(1),
            )
          : 0,
      },
    });
  }

  getCategories(
    customerId: string,
    period: SpendingPeriod = '30d',
    startDate?: string,
    endDate?: string,
  ): Observable<CategoriesResponse> {
    this.assertCustomer(customerId);

    const start = startDate ?? this.dateOnly(this.startOfPeriod(period));
    const end = endDate ?? this.dateOnly(new Date());

    const filtered = this.filterByDates(MOCK_TRANSACTIONS, start, end);
    const totalAmount = this.sum(filtered);

    const categories = this.aggregateCategories(filtered).map((category) => ({
      ...category,
      percentage: totalAmount
        ? Number(((category.amount / totalAmount) * 100).toFixed(1))
        : 0,
    }));

    return this.respond({
      dateRange: { startDate: start, endDate: end },
      totalAmount,
      categories,
    });
  }

  getTrends(
    customerId: string,
    months = 12,
  ): Observable<SpendingTrendsResponse> {
    this.assertCustomer(customerId);

    const monthCount = Math.min(24, Math.max(1, Math.floor(months)));
    const trends: SpendingTrend[] = [];
    const now = new Date();

    for (let offset = monthCount - 1; offset >= 0; offset--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1,
      );

      const monthTransactions = MOCK_TRANSACTIONS.filter((transaction) => {
        const date = new Date(`${transaction.date}T00:00:00`);
        return date >= monthDate && date < nextMonth;
      });

      trends.push({
        month: `${monthDate.getFullYear()}-${String(
          monthDate.getMonth() + 1,
        ).padStart(2, '0')}`,
        totalSpent: this.sum(monthTransactions),
        transactionCount: monthTransactions.length,
        averageTransaction: this.average(monthTransactions),
      });
    }

    return this.respond({ trends });
  }

  getTransactions(
    customerId: string,
    query: TransactionQuery = {},
  ): Observable<TransactionsResponse> {
    this.assertCustomer(customerId);

    const limit = Math.max(1, Math.min(100, Math.floor(query.limit ?? 10)));
    const offset = Math.max(0, Math.floor(query.offset ?? 0));

    let filtered = [...MOCK_TRANSACTIONS];

    if (query.category) {
      filtered = filtered.filter(
        (transaction) => transaction.category === query.category,
      );
    }

    if (query.startDate) {
      filtered = filtered.filter(
        (transaction) => transaction.date >= query.startDate!,
      );
    }

    if (query.endDate) {
      filtered = filtered.filter(
        (transaction) => transaction.date <= query.endDate!,
      );
    }

    const sortBy = query.sortBy ?? 'date_desc';

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return a.date.localeCompare(b.date);
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'date_desc':
        default:
          return b.date.localeCompare(a.date);
      }
    });

    const total = filtered.length;
    const transactions = filtered.slice(offset, offset + limit);

    return this.respond({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + transactions.length < total,
      },
    });
  }

  getGoals(customerId: string): Observable<{ goals: SpendingGoal[] }> {
    this.assertCustomer(customerId);
    return this.respond({ goals: MOCK_GOALS });
  }

  getFilters(customerId: string): Observable<DashboardFiltersResponse> {
    this.assertCustomer(customerId);

    return this.respond({
      categories: CATEGORY_CONFIG.map((category) => ({ ...category })),
      dateRangePresets: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'Last year', value: '1y' },
      ],
    });
  }

  private aggregateCategories(
    transactions: Transaction[],
  ): Array<{
    name: string;
    amount: number;
    transactionCount: number;
    color: string;
    icon: string;
  }> {
    return CATEGORY_CONFIG.map((category) => {
      const matching = transactions.filter(
        (transaction) => transaction.category === category.name,
      );

      return {
        name: category.name,
        amount: this.sum(matching),
        transactionCount: matching.length,
        color: category.color,
        icon: category.icon,
      };
    })
      .filter((category) => category.transactionCount > 0)
      .sort((a, b) => b.amount - a.amount);
  }
}