
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SpendingApi } from './spending-api';
import { CUSTOMER_ID } from '../data/mock-spending-data';

import {
  CustomerProfile,
  SpendingSummary,
  CategoriesResponse,
  TransactionsResponse,
  DashboardFiltersResponse,
  SpendingTrendsResponse,
  SpendingGoalsResponse,
} from '../models/dashboard.model';

describe('SpendingApi', () => {
  let service: SpendingApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpendingApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Profile
  describe('getProfile', () => {
    it('should return the customer profile', async () => {
      const result: CustomerProfile = await firstValueFrom(
        service.getProfile(CUSTOMER_ID),
      );

      expect(result).toBeDefined();
      expect(result.customerId).toBe(CUSTOMER_ID);
      expect(result.name).toBeTruthy();
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getProfile('INVALID_ID')),
      ).rejects.toThrow('INVALID_ID');
    });
  });

  // Summary
  describe('getSummary', () => {
    it('should return a spending summary for the selected period', async () => {
      const result: SpendingSummary = await firstValueFrom(
        service.getSummary(CUSTOMER_ID, '30d'),
      );

      expect(result.period).toBe('30d');
      expect(result.totalSpent).toBeGreaterThanOrEqual(0);
      expect(result.transactionCount).toBeGreaterThanOrEqual(0);
      expect(result.averageTransaction).toBeGreaterThanOrEqual(0);
      expect(result.topCategory).toBeTruthy();
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getSummary('INVALID_ID', '30d')),
      ).rejects.toThrow('INVALID_ID');
    });

    it('should calculate the average transaction amount correctly', async () => {
      const result: SpendingSummary = await firstValueFrom(
        service.getSummary(CUSTOMER_ID, '30d'),
      );

      expect(result.transactionCount).toBeGreaterThan(0);

      expect(result.averageTransaction).toBeCloseTo(
        result.totalSpent / result.transactionCount,
        2,
      );
    });
  });

  // Categories
  describe('getCategories', () => {
    it('should return spending categories', async () => {
      const result: CategoriesResponse = await firstValueFrom(
        service.getCategories(CUSTOMER_ID, '30d'),
      );

      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.totalAmount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate category percentages correctly', async () => {
      const result: CategoriesResponse = await firstValueFrom(
        service.getCategories(CUSTOMER_ID, '30d'),
      );

      const percentageTotal = result.categories.reduce(
        (total, category) => total + category.percentage,
        0,
      );

      expect(percentageTotal).toBeCloseTo(100, 0);
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getCategories('INVALID_ID', '30d')),
      ).rejects.toThrow('INVALID_ID');
    });
  });

  // Transactions
  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          limit: 5,
          offset: 0,
        }),
      );

      expect(result.transactions.length).toBeLessThanOrEqual(5);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.total).toBeGreaterThanOrEqual(
        result.transactions.length,
      );
    });

    it('should sort transactions by highest amount', async () => {
      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          sortBy: 'amount_desc',
        }),
      );

      for (let index = 1; index < result.transactions.length; index++) {
        expect(result.transactions[index - 1].amount).toBeGreaterThanOrEqual(
          result.transactions[index].amount,
        );
      }
    });

    it('should sort transactions by oldest date first', async () => {
      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          sortBy: 'date_asc',
        }),
      );

      for (let index = 1; index < result.transactions.length; index++) {
        expect(result.transactions[index - 1].date <= result.transactions[index].date).toBe(true);
      }
    });

    it('should filter transactions by category', async () => {
      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          category: 'Groceries',
        }),
      );

      expect(result.transactions.length).toBeGreaterThan(0);

      result.transactions.forEach((transaction) => {
        expect(transaction.category).toBe('Groceries');
      });
    });

    it('should filter transactions by date range', async () => {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 29);

      const start = startDate.toISOString().slice(0, 10);
      const end = endDate.toISOString().slice(0, 10);

      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          startDate: start,
          endDate: end,
        }),
      );

      expect(result.transactions.length).toBeGreaterThan(0);

      result.transactions.forEach((transaction) => {
        expect(transaction.date >= start).toBe(true);
        expect(transaction.date <= end).toBe(true);
      });
    });

    it('should return no transactions when the offset exceeds available records', async () => {
      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          limit: 5,
          offset: 10000,
        }),
      );

      expect(result.transactions).toHaveLength(0);
      expect(result.pagination.total).toBeGreaterThan(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should indicate when more transactions are available', async () => {
      const result: TransactionsResponse = await firstValueFrom(
        service.getTransactions(CUSTOMER_ID, {
          limit: 5,
          offset: 0,
        }),
      );

      expect(result.transactions).toHaveLength(5);
      expect(result.pagination.total).toBeGreaterThan(5);
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.limit).toBe(5);
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getTransactions('INVALID_ID')),
      ).rejects.toThrow('INVALID_ID');
    });
  });

  // Filters
  describe('getFilters', () => {
    it('should return category and date range filter options', async () => {
      const result: DashboardFiltersResponse = await firstValueFrom(
        service.getFilters(CUSTOMER_ID),
      );

      expect(result.categories.length).toBeGreaterThan(0);

      expect(
        result.categories.some((category) => category.name === 'Groceries'),
      ).toBe(true);

      expect(result.dateRangePresets).toHaveLength(4);
      expect(result.dateRangePresets.map((preset) => preset.value)).toEqual([
        '7d',
        '30d',
        '90d',
        '1y',
      ]);
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getFilters('INVALID_ID')),
      ).rejects.toThrow('INVALID_ID');
    });
  });

  // Trends
  describe('getTrends', () => {
    it('should return spending trends for the requested number of months', async () => {
      const result: SpendingTrendsResponse = await firstValueFrom(
        service.getTrends(CUSTOMER_ID, 6),
      );

      expect(result.trends).toHaveLength(6);
    });

    it('should return at least one month of trends', async () => {
      const result: SpendingTrendsResponse = await firstValueFrom(
        service.getTrends(CUSTOMER_ID, 0),
      );

      expect(result.trends).toHaveLength(1);
    });

    it('should limit trends to a maximum of 24 months', async () => {
      const result: SpendingTrendsResponse = await firstValueFrom(
        service.getTrends(CUSTOMER_ID, 30),
      );

      expect(result.trends).toHaveLength(24);
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getTrends('INVALID_ID', 6)),
      ).rejects.toThrow('INVALID_ID');
    });
  });

  // Goals
  describe('getGoals', () => {
    it('should return the customer spending goals', async () => {
      const result: SpendingGoalsResponse = await firstValueFrom(
        service.getGoals(CUSTOMER_ID),
      );

      expect(result.goals.length).toBeGreaterThan(0);
      expect(result.goals[0].category).toBeTruthy();
      expect(result.goals[0].monthlyBudget).toBeGreaterThan(0);
    });

    it('should reject an unknown customer ID', async () => {
      await expect(
        firstValueFrom(service.getGoals('INVALID_ID')),
      ).rejects.toThrow('INVALID_ID');
    });
  });
});
