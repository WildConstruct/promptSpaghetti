/**
 * Revenue Analytics Types
 * Story 30.1.2 - Revenue Dashboard Implementation
 * 
 * TypeScript type definitions for revenue analytics and dashboard components
 */
import { LicenseType, PaymentProvider } from '../../../server/src/marketplace/transaction.types';

// Time Range Options
export type RevenueTimeRange = 
  | 'last_7d'
  | 'last_30d'
  | 'last_90d'
  | 'last_year'
  | 'custom';

// Legacy enum values for backwards compatibility
export const RevenueTimeRange = {
  LAST_7D: 'last_7d' as const,
  LAST_30D: 'last_30d' as const,
  LAST_90D: 'last_90d' as const,
  LAST_YEAR: 'last_year' as const,
  CUSTOM: 'custom' as const,
} as const;

// Revenue Metrics Summary
export interface RevenueMetrics {
  // Core Revenue Metrics
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  totalCommissions: number;
  totalRefunds: number;
  // Growth Metrics
  revenueGrowth: number; // Percentage change from previous period
  transactionGrowth: number;
  customerGrowth: number;
  // Performance Metrics
  transactionCount: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;
  // Forecasting
  projectedRevenue?: number;
  forecastConfidence?: number;
}

// Revenue Trend Data Point
export interface RevenueTrendPoint {
  date: string; // ISO date string
  revenue: number;
  transactions: number;
  customers: number;
  averageOrderValue: number;
  refunds: number;
}

// Geographic Revenue Distribution
export interface GeographicRevenueData {
  countryCode: string;
  countryName: string;
  revenue: number;
  transactions: number;
  customers: number;
  marketShare: number; // Percentage of total revenue
}

// Payment Method Performance
export interface PaymentMethodData {
  provider: PaymentProvider;
  revenue: number;
  transactions: number;
  successRate: number;
  averageProcessingTime: number;
  fees: number;
}

// Top Performing Template
export interface TopTemplate {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  revenue: number;
  transactions: number;
  conversionRate: number;
  licenseBreakdown: Array<{,
    licenseType: LicenseType;
    count: number;
    revenue: number;
  }>;
}

// Top Performing Creator
export interface TopCreator {
  id: string;
  name: string;
  email: string;
  revenue: number;
  commissions: number;
  templates: number;
  transactions: number;
  averageTemplateRevenue: number;
}

// Creator Payout Information
export interface CreatorPayout {
  id: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledDate: Date;
  processedDate?: Date;
  paymentMethod: string;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
}

// Revenue Dashboard Filters
export interface RevenueFilters {
  paymentProviders: PaymentProvider[];
  licenseTypes: LicenseType[];
  countries: string[];
  templates: string[];
  creators: string[];
  minAmount?: number;
  maxAmount?: number;
  excludeRefunds?: boolean;
}

// Revenue Forecast Data
export interface RevenueForecast {
  id: string;
  forecastType: 'template' | 'creator' | 'global';
  targetId?: string;
  forecastHorizonDays: number;
  confidenceLevel: number;
  // Forecast Results
  forecastedRevenue: number;
  upperBound: number;
  lowerBound: number;
  // Daily Breakdown
  dailyForecast: Array<{,
    date: Date;
    predictedRevenue: number;
    confidenceIntervalUpper: number;
    confidenceIntervalLower: number;
  }>;
  // Model Performance
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  rSquared: number;
  generatedAt: Date;
  validUntil: Date;
}

// Real-time Revenue Data
export interface RealtimeRevenueData {
  timestamp: Date;
  totalRevenueToday: number;
  transactionsToday: number;
  recentTransactions: Array<{,
    id: string;
    amount: number;
    currency: string;
    templateName?: string;
    creatorName?: string;
    country?: string;
    timestamp: Date;
  }>;
  hourlyTrend: Array<{,
    hour: number;
    revenue: number;
    transactions: number;
  }>;
}

// Complete Dashboard Data Structure
export interface RevenueDashboardData {
  // Summary Metrics
  metrics: RevenueMetrics;
  // Time Series Data
  trends: RevenueTrendPoint[];
  // Breakdown Data
  paymentMethods: PaymentMethodData[];
  geography: GeographicRevenueData[];
  // Top Performers
  topTemplates: TopTemplate[];
  topCreators: TopCreator[];
  // Payout Information
  payouts: CreatorPayout[];
  // Real-time Data
  realtime?: RealtimeRevenueData;
  // Forecast Data
  forecast?: RevenueForecast;
  // Metadata
  lastUpdated: Date;
  dataQuality: number; // 0-1 score
  timeRange: {,
    start: Date;
    end: Date;
  };
  filters: RevenueFilters;
}

// Chart Configuration
export interface RevenueChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut';
  showTrendline?: boolean;
  showForecast?: boolean;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  compareToPeriodsAgo?: number;
  colors?: string[];
  responsive?: boolean;
}

// Export Options
export interface RevenueExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  scope: 'global' | 'creator' | 'template';
  entityId?: string;
  timeRange: RevenueTimeRange;
  customDateRange?: {
    start: Date | null;
    end: Date | null;
  };
  filters: RevenueFilters;
  includeForecast?: boolean;
  includeCharts?: boolean;
  includeRawData?: boolean;
}

// Widget Configuration
export interface RevenueWidgetConfig {
  id: string;
  type: 'overview' | 'trend' | 'breakdown' | 'leaderboard' | 'forecast' | 'realtime';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full-width';
  refreshInterval?: number; // milliseconds
  autoRefresh?: boolean;
  chartConfig?: RevenueChartConfig;
  filters?: Partial<RevenueFilters>;
}

// Dashboard Layout Configuration
export interface RevenueDashboardLayout {
  name: string;
  description: string;
  widgets: RevenueWidgetConfig[];
  columns: number;
  autoLayout?: boolean;
  responsive?: boolean;
}

// Analytics Event Tracking
export interface RevenueAnalyticsEvent {
  eventType: 'view_dashboard' | 'export_data' | 'apply_filters' | 'generate_forecast' | 'view_details';
  timestamp: Date;
  userId: string;
  dashboardScope: 'global' | 'creator' | 'template';
  entityId?: string;
  metadata?: Record<string, unknown>;
}

// API Response Types
export interface RevenueAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: {
    totalCount?: number;
    pageSize?: number;
    currentPage?: number;
    hasNextPage?: boolean;
    executionTime?: number;
    cacheHit?: boolean;
  };
}

// Revenue Service Configuration
export interface RevenueServiceConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  realtimeEnabled: boolean;
  forecastingEnabled: boolean;
}

// Cohort Analysis Data
export interface RevenueCohortData {
  cohortMonth: string; // YYYY-MM format
  customerCount: number;
  revenueByPeriod: Array<{,
    period: number; // 0-based months since cohort
    revenue: number;
    customers: number;
    retentionRate: number;
  }>;
}

// Revenue Attribution Data
export interface RevenueAttributionData {
  channel: string;
  source: string;
  medium: string;
  campaign?: string;
  revenue: number;
  transactions: number;
  customers: number;
  costPerAcquisition?: number;
  returnOnAdSpend?: number;
}

// Template Revenue Analytics
export interface TemplateRevenueAnalytics {
  templateId: string;
  templateName: string;
  creatorId: string;
  creatorName: string;
  // Revenue Metrics
  totalRevenue: number;
  averageRevenue: number;
  revenueGrowth: number;
  // Sales Metrics
  totalSales: number;
  uniqueCustomers: number;
  repeatPurchaseRate: number;
  conversionRate: number;
  // License Performance
  licenseBreakdown: Array<{,
    licenseType: LicenseType;
    count: number;
    revenue: number;
    averagePrice: number;
  }>;
  // Geographic Performance
  topCountries: Array<{,
    countryCode: string;
    countryName: string;
    revenue: number;
    sales: number;
  }>;
  // Trend Data
  dailyRevenue: RevenueTrendPoint[];
  // Performance Rankings
  revenueRank: number;
  salesRank: number;
  categoryRank?: number;
}

// Error Types
export interface RevenueError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  retryable: boolean;
}

export type {
  RevenueTimeRange,
  RevenueMetrics,
  RevenueTrendPoint,
  GeographicRevenueData,
  PaymentMethodData,
  TopTemplate,
  TopCreator,
  CreatorPayout,
  RevenueFilters,
  RevenueForecast,
  RealtimeRevenueData,
  RevenueDashboardData,
  RevenueChartConfig,
  RevenueExportOptions,
  RevenueWidgetConfig,
  RevenueDashboardLayout,
  RevenueAnalyticsEvent,
  RevenueAPIResponse,
  RevenueServiceConfig,
  RevenueCohortData,
  RevenueAttributionData,
  TemplateRevenueAnalytics,
  RevenueError
};