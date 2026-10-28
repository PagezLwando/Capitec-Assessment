import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartOptions } from 'chart.js';

import {
  CategoriesResponse,
  CustomerProfile,
  DashboardFiltersResponse,
  SpendingGoalsResponse,
  SpendingPeriod,
  SpendingSummary,
  SpendingTrendsResponse,
  TransactionsResponse,
  TransactionSort,
} from '../../../../core/models/dashboard.model';
import { SpendingApi } from '../../../../core/services/spending-api';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, BaseChartDirective],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly spendingApi = inject(SpendingApi);
  private readonly customerId = '12345';
  readonly Math = Math;

  loading = true;
  errorMessage = '';

  period: SpendingPeriod = '30d';
  selectedCategory = '';
  sortBy: TransactionSort = 'date_desc';
  
pageSize = 8;
currentPage = 0;


  profile?: CustomerProfile;
  summary?: SpendingSummary;
  categories?: CategoriesResponse;
  trends?: SpendingTrendsResponse;
  goals?: SpendingGoalsResponse;
  filters?: DashboardFiltersResponse;
  transactions?: TransactionsResponse;

  readonly periods = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
    { label: '1 year', value: '1y' },
  ] as const;

  readonly trendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R${Number(value).toLocaleString('en-ZA')}`,
        },
      },
    },
  };

  readonly categoryOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  trendData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Monthly spending',
        borderColor: '#2457C5',
        backgroundColor: 'rgba(36, 87, 197, 0.12)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  categoryData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  
private getPeriodStartDate(): string {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (this.period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 6);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 29);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 89);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return [
    startDate.getFullYear(),
    String(startDate.getMonth() + 1).padStart(2, '0'),
    String(startDate.getDate()).padStart(2, '0'),
  ].join('-');
}

private getPeriodEndDate(): string {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
}


get totalPages(): number {
  return Math.ceil(
    (this.transactions?.pagination.total ?? 0) / this.pageSize,
  );
}

get firstVisibleTransaction(): number {
  if (!this.transactions?.pagination.total) {
    return 0;
  }

  return this.currentPage * this.pageSize + 1;
}

get lastVisibleTransaction(): number {
  return Math.min(
    (this.currentPage + 1) * this.pageSize,
    this.transactions?.pagination.total ?? 0,
  );
}

previousPage(): void {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadDashboard();
  }
}

nextPage(): void {
  if (this.currentPage + 1 < this.totalPages) {
    this.currentPage++;
    this.loadDashboard();
  }
}


  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      profile: this.spendingApi.getProfile(this.customerId),
      summary: this.spendingApi.getSummary(this.customerId, this.period),
      categories: this.spendingApi.getCategories(this.customerId, this.period),
      trends: this.spendingApi.getTrends(this.customerId, 12),
      

transactions: this.spendingApi.getTransactions(this.customerId, {
  limit: this.pageSize,
  offset: this.currentPage * this.pageSize,
  category: this.selectedCategory || undefined,
  startDate: this.getPeriodStartDate(),
  endDate: this.getPeriodEndDate(),
  sortBy: this.sortBy,
}),


      goals: this.spendingApi.getGoals(this.customerId),
      filters: this.spendingApi.getFilters(this.customerId),
    }).subscribe({
      next: (data) => {
        this.profile = data.profile;
        this.summary = data.summary;
        this.categories = data.categories;
        this.trends = data.trends;
        this.transactions = data.transactions;
        this.goals = data.goals;
        this.filters = data.filters;

        this.trendData = {
          labels: data.trends.trends.map((item) => item.month),
          datasets: [
            {
              label: 'Monthly spending',
              data: data.trends.trends.map((item) => item.totalSpent),
              borderColor: '#2457C5',
              backgroundColor: 'rgba(36, 87, 197, 0.12)',
              fill: true,
              tension: 0.35,
            },
          ],
        };

        this.categoryData = {
          labels: data.categories.categories.map((item) => item.name),
          datasets: [
            {
              data: data.categories.categories.map((item) => item.amount),
              backgroundColor: data.categories.categories.map(
                (item) => item.color,
              ),
              borderWidth: 0,
            },
          ],
        };

        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Unable to load dashboard', error);
        this.errorMessage =
          'We could not load your spending information. Please try again.';
        this.loading = false;
      },
    });
  }

changePeriod(value: string): void {
  if (['7d', '30d', '90d', '1y'].includes(value)) {
    this.period = value as SpendingPeriod;
    this.currentPage = 0;
    this.loadDashboard();
  }
}

changeCategory(value: string): void {
  this.selectedCategory = value;
  this.currentPage = 0;
  this.loadDashboard();
}

changeSort(value: string): void {
  if (
    ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'].includes(value)
  ) {
    this.sortBy = value as TransactionSort;
    this.currentPage = 0;
    this.loadDashboard();
  }
}


  retry(): void {
    this.loadDashboard();
  }

  trackByTransactionId(
    _index: number,
    transaction: { id: string },
  ): string {
    return transaction.id;
  }
}