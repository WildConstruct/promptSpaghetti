/**
 * Payment Analytics Hook
 * Story 30.1.3 - Payment Integration Analytics
 * 
 * Custom React hook for fetching and managing payment analytics data
 */
import { useState, useEffect, useCallback } from 'react';
import { PaymentProvider } from '../../../server/src/marketplace/transaction.types';
import { RevenueTimeRange } from '../types/revenue';
import { PaymentAnalyticsData } from '../components/payment/PaymentAnalyticsDashboard';


export interface UsePaymentAnalyticsParams {
  timeRange: RevenueTimeRange;
  customDateRange?: {,
  start: Date | null;,
  end: Date | null;


};
  providers: PaymentProvider;
  autoRefresh?: boolean;
  refreshInterval?: number;



export interface UsePaymentAnalyticsReturn {
  data: PaymentAnalyticsData | null;,
  loading: boolean;,
  error: string | null;,
  refresh: () => Promise<void>;



export const usePaymentAnalytics = ({)
  timeRange,
  customDateRange,
  providers,
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
: UsePaymentAnalyticsParams): UsePaymentAnalyticsReturn => {
  const [data, setData] = useState<PaymentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Calculate date range based on timeRange parameter
  const getDateRange = useCallback(() => {
  if (timeRange === RevenueTimeRange.CUSTOM && customDateRange) {
  return {
  start: customDateRange.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  end: customDateRange.end || new Date(),
};
    const end = new Date();
    let start: Date;
    switch (timeRange) {
      case RevenueTimeRange.LAST_7D:
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case RevenueTimeRange.LAST_30D:
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case RevenueTimeRange.LAST_90D:
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case RevenueTimeRange.LAST_YEAR:
        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  }, [timeRange, customDateRange]);
  // Fetch payment analytics data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = getDateRange();
      // Parallel requests for different data types
      const [providerMetricsRes, methodMetricsRes, failureAnalysisRes] = await Promise.all([)
        fetch('/api/payment-analytics/provider-metrics', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  providers,
  startDate: start.toISOString(),
  endDate: end.toISOString(),

        }),
        fetch('/api/payment-analytics/method-metrics', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  providers,
  startDate: start.toISOString(),
  endDate: end.toISOString(),

        }),
        fetch('/api/payment-analytics/failure-analysis', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  providers,
  startDate: start.toISOString(),
  endDate: end.toISOString(),


      ]);
      // Check for API errors
      if (!providerMetricsRes.ok || !methodMetricsRes.ok || !failureAnalysisRes.ok) {
        throw new Error('Failed to fetch payment analytics data');
      // Parse responses
      const [providerMetrics, methodMetrics, failureAnalysis] = await Promise.all([)
        providerMetricsRes.json(),
        methodMetricsRes.json(),
        failureAnalysisRes.json()
      ]);
      // Combine data
      const analyticsData: PaymentAnalyticsData = {,
  providerMetrics: providerMetrics.data || [],
        methodMetrics: methodMetrics.data || [],
        failureAnalysis: failureAnalysis.data || [],
        lastUpdated: new Date(),
        timeRange: { start, end }
      };
      setData(analyticsData);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment analytics';
  setError(errorMessage);
  console.error('Payment analytics fetch error:', err);
  // Fallback to mock data for development
  if (process.env.NODE_ENV === 'development') {
  setData(generateMockPaymentAnalytics(getDateRange(), providers));
 finally {
      setLoading(false);
  }, [providers, getDateRange]);
  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);
  return {
    data,
    loading,
    error,
    refresh
  };
};

// Mock data generator for development
function generateMockPaymentAnalytics(((
    dateRange: { start: Date; end: Date },
    providers: PaymentProvider
  ): PaymentAnalyticsData {
  const mockProviderMetrics = providers.map(provider => ({)
  provider,
  totalAttempts: Math.floor(Math.random() * 10000) + 5000,
  successfulPayments: Math.floor(Math.random() * 8000) + 4000,
  failedPayments: Math.floor(Math.random() * 1000) + 200,
  successRate: 85 + Math.random() * 10,
  averageProcessingTime: Math.floor(Math.random() * 800) + 200,
  p95ProcessingTime: Math.floor(Math.random() * 1500) + 500,
  totalVolume: Math.floor(Math.random() * 1000000) + 500000,
  totalFees: Math.floor(Math.random() * 30000) + 15000,
  averageFeeRate: 2.9 + Math.random() * 0.5,
  failuresByReason: {,
  'card_declined': Math.floor(Math.random() * 100) + 20,
  'insufficient_funds': Math.floor(Math.random() * 50) + 10,
  'processing_error': Math.floor(Math.random() * 30) + 5,
  'expired_card': Math.floor(Math.random() * 20) + 3,
},
  retrySuccessRate: 60 + Math.random() * 25,
    performanceByCountry: [
      { countryCode: 'US', successRate: 92 + Math.random() * 5, averageProcessingTime: 300 + Math.random() * 200 },
      { countryCode: 'CA', successRate: 90 + Math.random() * 6, averageProcessingTime: 350 + Math.random() * 150 },
      { countryCode: 'GB', successRate: 88 + Math.random() * 7, averageProcessingTime: 400 + Math.random() * 200 },
      { countryCode: 'DE', successRate: 91 + Math.random() * 5, averageProcessingTime: 320 + Math.random() * 180 }
    ],
    performanceByHour: Array.from({ length: 24 }, (_, hour) => ({)
  hour,
  successRate: 85 + Math.random() * 10,
  volume: Math.floor(Math.random() * 50000) + 10000,
}))
  }));
  const mockMethodMetrics = providers.flatMap(provider => [);
    {
      methodType: 'card' as const,
      provider,
      successRate: 88 + Math.random() * 8,
      averageProcessingTime: 400 + Math.random() * 200,
      totalVolume: Math.floor(Math.random() * 500000) + 200000,
      userPreferenceRank: 1,
      conversionRate: 85 + Math.random() * 10,
      ageGroupPerformance: [
        { ageGroup: '18-24', successRate: 85 + Math.random() * 10, usage: Math.floor(Math.random() * 1000) + 500 },
        { ageGroup: '25-34', successRate: 90 + Math.random() * 8, usage: Math.floor(Math.random() * 1500) + 800 },
        { ageGroup: '35-44', successRate: 92 + Math.random() * 6, usage: Math.floor(Math.random() * 1200) + 600 },
        { ageGroup: '45-54', successRate: 89 + Math.random() * 8, usage: Math.floor(Math.random() * 800) + 400 },
        { ageGroup: '55+', successRate: 87 + Math.random() * 9, usage: Math.floor(Math.random() * 600) + 300 }
      ],
      devicePerformance: [
        { deviceType: 'mobile' as const, successRate: 86 + Math.random() * 8, usage: Math.floor(Math.random() * 2000) + 1000 },
        { deviceType: 'desktop' as const, successRate: 91 + Math.random() * 6, usage: Math.floor(Math.random() * 1500) + 800 },
        { deviceType: 'tablet' as const, successRate: 89 + Math.random() * 7, usage: Math.floor(Math.random() * 500) + 200 }
      ]

    {
      methodType: 'digital_wallet' as const,
      provider,
      successRate: 92 + Math.random() * 6,
      averageProcessingTime: 250 + Math.random() * 150,
      totalVolume: Math.floor(Math.random() * 300000) + 150000,
      userPreferenceRank: 2,
      conversionRate: 90 + Math.random() * 8,
      ageGroupPerformance: [
        { ageGroup: '18-24', successRate: 94 + Math.random() * 5, usage: Math.floor(Math.random() * 800) + 400 },
        { ageGroup: '25-34', successRate: 95 + Math.random() * 4, usage: Math.floor(Math.random() * 1000) + 600 },
        { ageGroup: '35-44', successRate: 93 + Math.random() * 5, usage: Math.floor(Math.random() * 600) + 300 },
        { ageGroup: '45-54', successRate: 90 + Math.random() * 7, usage: Math.floor(Math.random() * 400) + 200 },
        { ageGroup: '55+', successRate: 88 + Math.random() * 8, usage: Math.floor(Math.random() * 200) + 100 }
      ],
      devicePerformance: [
        { deviceType: 'mobile' as const, successRate: 94 + Math.random() * 5, usage: Math.floor(Math.random() * 1200) + 600 },
        { deviceType: 'desktop' as const, successRate: 92 + Math.random() * 6, usage: Math.floor(Math.random() * 800) + 400 },
        { deviceType: 'tablet' as const, successRate: 93 + Math.random() * 5, usage: Math.floor(Math.random() * 300) + 150 }
      ]
  ]);
  const mockFailureAnalysis = providers.flatMap(provider => [);
    {
      failureCode: 'card_declined',
      provider,
      frequency: Math.floor(Math.random() * 150) + 50,
      percentage: 35 + Math.random() * 15,
      description: 'Card was declined by the issuing bank',
      suggestedAction: 'Ask customer to try a different payment method or contact their bank',
      isRetryable: true,
      averageRetrySuccess: 45 + Math.random() * 20,
      timePattern: Array.from({ length: 24 }, (_, hour) => ({)
  hour,
  frequency: Math.floor(Math.random() * 20) + 5,
})),
      geographicPattern: [
        { countryCode: 'US', frequency: Math.floor(Math.random() * 50) + 20 },
        { countryCode: 'CA', frequency: Math.floor(Math.random() * 30) + 10 },
        { countryCode: 'GB', frequency: Math.floor(Math.random() * 25) + 8 }
      ],
      amountPattern: [
        { amountRange: '$0-$10', frequency: Math.floor(Math.random() * 20) + 5 },
        { amountRange: '$10-$50', frequency: Math.floor(Math.random() * 40) + 15 },
        { amountRange: '$50-$100', frequency: Math.floor(Math.random() * 30) + 10 },
        { amountRange: '$100-$250', frequency: Math.floor(Math.random() * 20) + 8 },
        { amountRange: '$250+', frequency: Math.floor(Math.random() * 15) + 5 }
      ]

    {
      failureCode: 'insufficient_funds',
      provider,
      frequency: Math.floor(Math.random() * 80) + 30,
      percentage: 20 + Math.random() * 10,
      description: 'Customer has insufficient funds in their account',
      suggestedAction: 'Suggest customer checks their account balance or uses a different payment method',
      isRetryable: true,
      averageRetrySuccess: 25 + Math.random() * 15,
      timePattern: Array.from({ length: 24 }, (_, hour) => ({)
  hour,
  frequency: Math.floor(Math.random() * 15) + 3,
})),
      geographicPattern: [
        { countryCode: 'US', frequency: Math.floor(Math.random() * 30) + 12 },
        { countryCode: 'CA', frequency: Math.floor(Math.random() * 20) + 8 },
        { countryCode: 'GB', frequency: Math.floor(Math.random() * 15) + 5 }
      ],
      amountPattern: [
        { amountRange: '$0-$10', frequency: Math.floor(Math.random() * 10) + 2 },
        { amountRange: '$10-$50', frequency: Math.floor(Math.random() * 25) + 8 },
        { amountRange: '$50-$100', frequency: Math.floor(Math.random() * 20) + 6 },
        { amountRange: '$100-$250', frequency: Math.floor(Math.random() * 15) + 4 },
        { amountRange: '$250+', frequency: Math.floor(Math.random() * 10) + 2 }
      ]

    {
      failureCode: 'processing_error',
      provider,
      frequency: Math.floor(Math.random() * 40) + 15,
      percentage: 10 + Math.random() * 8,
      description: 'Technical error occurred during payment processing',
      suggestedAction: 'Retry payment or contact technical support',
      isRetryable: true,
      averageRetrySuccess: 70 + Math.random() * 20,
      timePattern: Array.from({ length: 24 }, (_, hour) => ({)
  hour,
  frequency: Math.floor(Math.random() * 8) + 1,
})),
      geographicPattern: [
        { countryCode: 'US', frequency: Math.floor(Math.random() * 15) + 6 },
        { countryCode: 'CA', frequency: Math.floor(Math.random() * 10) + 4 },
        { countryCode: 'GB', frequency: Math.floor(Math.random() * 8) + 3 }
      ],
      amountPattern: [
        { amountRange: '$0-$10', frequency: Math.floor(Math.random() * 5) + 1 },
        { amountRange: '$10-$50', frequency: Math.floor(Math.random() * 12) + 4 },
        { amountRange: '$50-$100', frequency: Math.floor(Math.random() * 10) + 3 },
        { amountRange: '$100-$250', frequency: Math.floor(Math.random() * 8) + 2 },
        { amountRange: '$250+', frequency: Math.floor(Math.random() * 5) + 1 }
      ]
  ]);
  return {
  providerMetrics: mockProviderMetrics,
  methodMetrics: mockMethodMetrics,
  failureAnalysis: mockFailureAnalysis,
  lastUpdated: new Date(),
  timeRange: dateRange,
};

export default usePaymentAnalytics;