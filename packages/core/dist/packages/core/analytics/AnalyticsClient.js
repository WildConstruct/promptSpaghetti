import { EventEmitter } from 'events';
/**
 * Analytics API client
 */
export class AnalyticsClient extends EventEmitter {
    config;
    cache = new Map();
    requestQueue = new Map();
    constructor(config) {
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
    async getSummary(query) {
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
    async getTimeSeries(metric, timeRange) {
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
    async getHeatMap(timeRange) {
        const params = new URLSearchParams({
            startTime: timeRange.startTime.toString(),
            endTime: timeRange.endTime.toString()
        });
        return this.makeRequest(`/analytics/heatmap?${params}`);
    }
    /**
     * Get usage patterns
     */
    async getUsagePatterns(type) {
        return this.makeRequest(`/analytics/patterns/${type}`);
    }
    /**
     * Get dashboard data
     */
    async getDashboardData() {
        return this.makeRequest('/analytics/dashboard');
    }
    /**
     * Get dashboard HTML
     */
    async getDashboardHTML() {
        const response = await this.makeRequest('/analytics/dashboard/html', {
            responseType: 'text'
        });
        return response.data || '';
    }
    /**
     * Get cost summary
     */
    async getCostSummary(timeRange, userId, organizationId) {
        const params = new URLSearchParams({
            startTime: timeRange.startTime.toString(),
            endTime: timeRange.endTime.toString()
        });
        if (userId)
            params.append('userId', userId.toString());
        if (organizationId)
            params.append('organizationId', organizationId.toString());
        return this.makeRequest(`/analytics/costs/summary?${params}`);
    }
    /**
     * Get cost forecast
     */
    async getCostForecast(days, userId, organizationId) {
        const params = new URLSearchParams({
            days: days.toString()
        });
        if (userId)
            params.append('userId', userId.toString());
        if (organizationId)
            params.append('organizationId', organizationId.toString());
        return this.makeRequest(`/analytics/costs/forecast?${params}`);
    }
    /**
     * Create budget
     */
    async createBudget(config) {
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
    async getBudgets(userId, organizationId) {
        const params = new URLSearchParams();
        if (userId)
            params.append('userId', userId.toString());
        if (organizationId)
            params.append('organizationId', organizationId.toString());
        return this.makeRequest(`/analytics/budgets?${params}`);
    }
    /**
     * Update budget
     */
    async updateBudget(budgetId, updates) {
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
    async getBudgetUsage(budgetId) {
        return this.makeRequest(`/analytics/budgets/${budgetId}/usage`);
    }
    /**
     * Get active alerts
     */
    async getAlerts() {
        return this.makeRequest('/analytics/alerts');
    }
    /**
     * Acknowledge alert
     */
    async acknowledgeAlert(alertId) {
        return this.makeRequest(`/analytics/alerts/${alertId}/acknowledge`, {
            method: 'POST'
        });
    }
    /**
     * Get efficiency recommendations
     */
    async getRecommendations(userId, organizationId) {
        const params = new URLSearchParams();
        if (userId)
            params.append('userId', userId.toString());
        if (organizationId)
            params.append('organizationId', organizationId.toString());
        return this.makeRequest(`/analytics/recommendations?${params}`);
    }
    /**
     * Generate analytics report
     */
    async generateReport(config) {
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
    async exportData(timeRange, format = 'json') {
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
    subscribeToUpdates(callback) {
        // This would implement WebSocket subscription
        // For now, return a no-op unsubscribe function
        return () => { };
    }
    /**
     * Clear analytics cache
     */
    clearCache() {
        this.cache.clear();
        this.emit('cache_cleared');
    }
    /**
     * Make HTTP request with caching and retry logic
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const cacheKey = `${url}-${JSON.stringify(options)}`;
        // Check cache first
        if (this.config.enableCaching && options.method !== 'POST' && options.method !== 'PUT') {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
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
        }
        finally {
            this.requestQueue.delete(cacheKey);
        }
    }
    /**
     * Execute HTTP request with retry logic
     */
    async executeRequest(url, options) {
        const { responseType = 'json', ...fetchOptions } = options;
        const requestOptions = {
            ...fetchOptions,
            headers: {
                'Accept': responseType === 'json' ? 'application/json' : 'text/plain',
                ...this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` },
                ...fetchOptions.headers
            },
            signal: AbortSignal.timeout(this.config.timeout)
        };
        let lastError = null;
        for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
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
                }
                else {
                    return { success: true, data };
                }
            }
            catch (error) {
                lastError = error;
                this.emit('request_failed', { url, attempt, error: lastError.message });
                if (attempt < this.config.retryCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)));
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
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, cached] of this.cache.entries()) {
                if (now - cached.timestamp > this.config.cacheTimeout) {
                    this.cache.delete(key);
                }
            }
        }, this.config.cacheTimeout / 2);
    }
}
;
