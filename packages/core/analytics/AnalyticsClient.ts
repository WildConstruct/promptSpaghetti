import { EventEmitter } from 'events';

/**
 * Analytics API response wrapper
 */
export interface AnalyticsResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  meta?: {
    period?: {
      startTime: number;
      endTime: number;
    };
    generatedAt?: number;
    totalDataPoints?: number;
    [key: string]: any;
  };
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  startTime?: number;
  endTime?: number;
  userId?: number;
  organizationId?: number;
  limit?: number;
  offset?: number;
}

/**
 * Time range parameters
 */
export interface TimeRange {
  startTime: number;
  endTime: number;
  granularity?: 'hour' | 'day';
}

/**
 * Budget configuration
 */
export interface BudgetConfig {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  alertThresholds?: number[];
  userId?: number;
  organizationId?: number;
}

/**
 * Report configuration
 */
export interface ReportConfig {
  startTime: number;
  endTime: number;
  format?: 'json' | 'csv' | 'html' | 'pdf';
  includeHeatMap?: boolean;
  includeCostAnalysis?: boolean;
  includePatterns?: boolean;
}

/**
 * Analytics client configuration
 */
export interface AnalyticsClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

/**
 * Analytics API client
 */
export class AnalyticsClient extends EventEmitter {
  private config: AnalyticsClientConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config: AnalyticsClientConfig) {
    super();
    this.config = {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 60000, // 1 minute
      ...config
    };
  }

  /**
   * Get analytics summary
   */
  async getSummary(query?: AnalyticsQuery): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return this.makeRequest(`/analytics/summary?${params}`);
  }

  /**
   * Get time series data
   */
  async getTimeSeries(
    metric: 'executions' | 'tokens' | 'cost' | 'errors',
    timeRange: TimeRange
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({
      startTime: timeRange.startTime.toString(),
      endTime: timeRange.endTime.toString(),
      granularity: timeRange.granularity || 'hour'
    });

    return this.makeRequest(`/analytics/timeseries/${metric}?${params}`);
  }

  /**
   * Get heat map data
   */
  async getHeatMap(timeRange: TimeRange): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({
      startTime: timeRange.startTime.toString(),
      endTime: timeRange.endTime.toString()
    });

    return this.makeRequest(`/analytics/heatmap?${params}`);
  }

  /**
   * Get usage patterns
   */
  async getUsagePatterns(
    type: 'hourly' | 'daily' | 'weekly'
  ): Promise<AnalyticsResponse> {
    return this.makeRequest(`/analytics/patterns/${type}`);
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<AnalyticsResponse> {
    return this.makeRequest('/analytics/dashboard');
  }

  /**
   * Get dashboard HTML
   */
  async getDashboardHTML(): Promise<string> {
    const response = await this.makeRequest('/analytics/dashboard/html', {
      responseType: 'text'
    });
    return response.data || '';
  }

  /**
   * Get cost summary
   */
  async getCostSummary(
    timeRange: TimeRange,
    userId?: number,
    organizationId?: number
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({
      startTime: timeRange.startTime.toString(),
      endTime: timeRange.endTime.toString()
    });

    if (userId) params.append('userId', userId.toString());
    if (organizationId) params.append('organizationId', organizationId.toString());

    return this.makeRequest(`/analytics/costs/summary?${params}`);
  }

  /**
   * Get cost forecast
   */
  async getCostForecast(
    days: number,
    userId?: number,
    organizationId?: number
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({
      days: days.toString()
    });

    if (userId) params.append('userId', userId.toString());
    if (organizationId) params.append('organizationId', organizationId.toString());

    return this.makeRequest(`/analytics/costs/forecast?${params}`);
  }

  /**
   * Create budget
   */
  async createBudget(config: BudgetConfig): Promise<AnalyticsResponse> {
    return this.makeRequest('/analytics/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
  }

  /**
   * Get budgets
   */
  async getBudgets(
    userId?: number,
    organizationId?: number
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (organizationId) params.append('organizationId', organizationId.toString());

    return this.makeRequest(`/analytics/budgets?${params}`);
  }

  /**
   * Update budget
   */
  async updateBudget(
    budgetId: string,
    updates: Partial<BudgetConfig>
  ): Promise<AnalyticsResponse> {
    return this.makeRequest(`/analytics/budgets/${budgetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
  }

  /**
   * Get budget usage
   */
  async getBudgetUsage(budgetId: string): Promise<AnalyticsResponse> {
    return this.makeRequest(`/analytics/budgets/${budgetId}/usage`);
  }

  /**
   * Get active alerts
   */
  async getAlerts(): Promise<AnalyticsResponse> {
    return this.makeRequest('/analytics/alerts');
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<AnalyticsResponse> {
    return this.makeRequest(`/analytics/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
  }

  /**
   * Get efficiency recommendations
   */
  async getRecommendations(
    userId?: number,
    organizationId?: number
  ): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (organizationId) params.append('organizationId', organizationId.toString());

    return this.makeRequest(`/analytics/recommendations?${params}`);
  }

  /**
   * Generate analytics report
   */
  async generateReport(config: ReportConfig): Promise<string> {
    const response = await this.makeRequest('/analytics/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config),
      responseType: 'text'
    });

    return response.data || '';
  }

  /**
   * Export analytics data
   */
  async exportData(
    timeRange: TimeRange,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const params = new URLSearchParams({
      startTime: timeRange.startTime.toString(),
      endTime: timeRange.endTime.toString(),
      format
    });

    const response = await this.makeRequest(`/analytics/export?${params}`, {
      responseType: 'text'
    });

    return response.data || '';
  }

  /**
   * Subscribe to real-time analytics updates
   */
  subscribeToUpdates(callback: (data: any) => void): () => void {
    // This would implement WebSocket subscription
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  /**
   * Clear analytics cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache_cleared');
  }

  /**
   * Make HTTP request with caching and retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit & { responseType?: 'json' | 'text' } = {}
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // Check cache first
    if (this.config.enableCaching && options.method !== 'POST' && options.method !== 'PUT') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout!) {
        return cached.data;
      }
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    const requestPromise = this.executeRequest(url, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful responses
      if (this.config.enableCaching && result.success) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest(
    url: string,
    options: RequestInit & { responseType?: 'json' | 'text' }
  ): Promise<any> {
    const { responseType = 'json', ...fetchOptions } = options;
    
    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers: {
        'Accept': responseType === 'json' ? 'application/json' : 'text/plain',
        ...this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` },
        ...fetchOptions.headers
      },
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryCount!; attempt++) {
      try {
        this.emit('request_started', { url, attempt });

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = responseType === 'json' ? await response.json() : await response.text();
        
        this.emit('request_completed', { url, attempt, status: response.status });

        if (responseType === 'json') {
          return data;
        } else {
          return { success: true, data };
        }
      } catch (error) {
        lastError = error as Error;
        
        this.emit('request_failed', { url, attempt, error: lastError.message });

        if (attempt < this.config.retryCount! - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay! * (attempt + 1)));
        }
      }
    }

    // Return error response
    return {
      success: false,
      error: 'Request failed after retries',
      details: lastError?.message || 'Unknown error'
    };
  }

  /**
   * Setup periodic cache cleanup
   */
  private setupCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.cache.entries()) {
        if (now - cached.timestamp > this.config.cacheTimeout!) {
          this.cache.delete(key);
        }
      }
    }, this.config.cacheTimeout! / 2);
  }
}

/**
 * Default analytics client instance
 */
export const defaultAnalyticsClient = new AnalyticsClient();