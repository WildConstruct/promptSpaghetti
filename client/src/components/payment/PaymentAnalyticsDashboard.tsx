/**
 * Payment Analytics Dashboard
 * Story 30.1.3 - Payment Integration Analytics
 * 
 * Main dashboard component for payment provider performance and analytics
 */

import React, { useState, useCallback } from 'react';
import { PaymentProvider, PaymentMethodType } from '../../../../server/src/marketplace/transaction.types';
import { RevenueTimeRange } from '../../types/revenue';
import { usePaymentAnalytics } from '../../hooks/usePaymentAnalytics';
import './PaymentAnalyticsDashboard.css';

// Payment Analytics Types
export interface PaymentProviderMetrics {
  provider: PaymentProvider;
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  averageProcessingTime: number;
  p95ProcessingTime: number;
  totalVolume: number;
  totalFees: number;
  averageFeeRate: number;
  failuresByReason: Record<string, number>;
  retrySuccessRate: number;
  performanceByCountry: Array<{
    countryCode: string;
    successRate: number;
    averageProcessingTime: number;
  }>;
  performanceByHour: Array<{
    hour: number;
    successRate: number;
    volume: number;
  }>;
}

export interface PaymentMethodMetrics {
  methodType: PaymentMethodType;
  provider: PaymentProvider;
  successRate: number;
  averageProcessingTime: number;
  totalVolume: number;
  userPreferenceRank: number;
  conversionRate: number;
  ageGroupPerformance: Array<{
    ageGroup: string;
    successRate: number;
    usage: number;
  }>;
  devicePerformance: Array<{
    deviceType: 'mobile' | 'desktop' | 'tablet';
    successRate: number;
    usage: number;
  }>;
}

export interface PaymentFailureAnalysis {
  failureCode: string;
  provider: PaymentProvider;
  frequency: number;
  percentage: number;
  description: string;
  suggestedAction: string;
  isRetryable: boolean;
  averageRetrySuccess: number;
  timePattern: Array<{
    hour: number;
    frequency: number;
  }>;
  geographicPattern: Array<{
    countryCode: string;
    frequency: number;
  }>;
  amountPattern: Array<{
    amountRange: string;
    frequency: number;
  }>;
}

export interface PaymentAnalyticsData {
  providerMetrics: PaymentProviderMetrics[];
  methodMetrics: PaymentMethodMetrics[];
  failureAnalysis: PaymentFailureAnalysis[];
  lastUpdated: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface PaymentAnalyticsDashboardProps {
  className?: string;
  timeRange?: RevenueTimeRange;
  customDateRange?: {
    start: Date | null;
    end: Date | null;
  };
  providers?: PaymentProvider[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({
  className = '',
  timeRange = RevenueTimeRange.LAST_30D,
  customDateRange,
  providers = [PaymentProvider.STRIPE, PaymentProvider.PAYPAL],
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(providers[0]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'methods' | 'failures' | 'optimization'>('overview');
  const [isExporting, setIsExporting] = useState(false);

  const {
    data,
    loading,
    error,
    refresh
  } = usePaymentAnalytics({
    timeRange,
    customDateRange,
    providers,
    autoRefresh,
    refreshInterval
  });

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Export payment analytics data
      const exportData = {
        providerMetrics: data?.providerMetrics || [],
        timeRange: data?.timeRange,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-analytics-${selectedProvider}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [data, selectedProvider]);

  const selectedProviderMetrics = data?.providerMetrics.find(
    m => m.provider === selectedProvider
  );

  const selectedMethodMetrics = data?.methodMetrics.filter(
    m => m.provider === selectedProvider
  ) || [];

  const selectedFailureAnalysis = data?.failureAnalysis.filter(
    f => f.provider === selectedProvider
  ) || [];

  if (loading) {
    return (
      <div className={`payment-analytics-dashboard payment-analytics-dashboard--loading ${className}`}>
        <div className="payment-analytics__skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-metrics"></div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`payment-analytics-dashboard payment-analytics-dashboard--error ${className}`}>
        <div className="error-message">
          <h3>Failed to load payment analytics</h3>
          <p>{error}</p>
          <button onClick={refresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="payment-analytics__header">
        <div className="header-content">
          <h2>Payment Analytics</h2>
          <p className="header-subtitle">
            Monitor payment provider performance and optimize payment processing
          </p>
        </div>
        
        <div className="header-actions">
          <select 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value as PaymentProvider)}
            className="provider-selector"
          >
            {providers.map(provider => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="export-button"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          
          <button onClick={refresh} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      {/* Provider Overview */}
      {selectedProviderMetrics && (
        <div className="payment-provider-overview">
          <div className="provider-metrics">
            <div className="metric-card metric-card--primary">
              <div className="metric-label">Success Rate</div>
              <div className="metric-value">
                {selectedProviderMetrics.successRate.toFixed(1)}%
              </div>
              <div className={`metric-change ${selectedProviderMetrics.successRate >= 95 ? 'good' : selectedProviderMetrics.successRate >= 90 ? 'warning' : 'poor'}`}>
                {selectedProviderMetrics.successRate >= 95 ? '✓ Excellent' : 
                 selectedProviderMetrics.successRate >= 90 ? '⚠ Good' : '✗ Needs Attention'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Volume</div>
              <div className="metric-value">
                ${(selectedProviderMetrics.totalVolume / 100).toLocaleString()}
              </div>
              <div className="metric-subtitle">
                {selectedProviderMetrics.totalAttempts.toLocaleString()} attempts
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Avg Processing Time</div>
              <div className="metric-value">
                {selectedProviderMetrics.averageProcessingTime}ms
              </div>
              <div className="metric-subtitle">
                P95: {selectedProviderMetrics.p95ProcessingTime}ms
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Fee Rate</div>
              <div className="metric-value">
                {selectedProviderMetrics.averageFeeRate.toFixed(2)}%
              </div>
              <div className="metric-subtitle">
                ${(selectedProviderMetrics.totalFees / 100).toLocaleString()} total fees
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="payment-analytics__tabs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'methods', label: 'Payment Methods' },
          { id: 'failures', label: 'Failure Analysis' },
          { id: 'optimization', label: 'Optimization' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id as 'overview' | 'methods' | 'failures' | 'optimization')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="payment-analytics__content">
        {selectedTab === 'overview' && selectedProviderMetrics && (
          <PaymentOverviewPanel 
            metrics={selectedProviderMetrics}
            timeRange={timeRange}
          />
        )}

        {selectedTab === 'methods' && (
          <PaymentMethodsPanel 
            methods={selectedMethodMetrics}
            provider={selectedProvider}
          />
        )}

        {selectedTab === 'failures' && (
          <PaymentFailuresPanel 
            failures={selectedFailureAnalysis}
            provider={selectedProvider}
          />
        )}

        {selectedTab === 'optimization' && selectedProviderMetrics && (
          <PaymentOptimizationPanel 
            metrics={selectedProviderMetrics}
            methods={selectedMethodMetrics}
            failures={selectedFailureAnalysis}
          />
        )}
      </div>

      {/* Footer */}
      <div className="payment-analytics__footer">
        <div className="footer-info">
          Last updated: {data?.lastUpdated.toLocaleString()}
        </div>
        <div className="footer-actions">
          <span className="data-range">
            {data?.timeRange.start.toLocaleDateString()} - {data?.timeRange.end.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Sub-components for different tabs
const PaymentOverviewPanel: React.FC<{
  metrics: PaymentProviderMetrics;
  timeRange: RevenueTimeRange;
}> = ({ metrics }) => (
  <div className="payment-overview-panel">
    <div className="overview-charts">
      <div className="chart-container">
        <h4>Performance by Hour</h4>
        <div className="hourly-performance">
          {metrics.performanceByHour.map(hour => (
            <div key={hour.hour} className="hour-bar">
              <div className="hour-label">{hour.hour}:00</div>
              <div className="hour-metrics">
                <div className="success-rate">{hour.successRate.toFixed(1)}%</div>
                <div className="volume">${(hour.volume / 100).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <h4>Geographic Performance</h4>
        <div className="country-performance">
          {metrics.performanceByCountry.slice(0, 10).map(country => (
            <div key={country.countryCode} className="country-row">
              <span className="country-code">{country.countryCode}</span>
              <span className="success-rate">{country.successRate.toFixed(1)}%</span>
              <span className="processing-time">{country.averageProcessingTime}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PaymentMethodsPanel: React.FC<{
  methods: PaymentMethodMetrics[];
  provider: PaymentProvider;
}> = ({ methods }) => (
  <div className="payment-methods-panel">
    <div className="methods-grid">
      {methods.map(method => (
        <div key={method.methodType} className="method-card">
          <h4>{method.methodType}</h4>
          <div className="method-metrics">
            <div className="metric">
              <span className="label">Success Rate:</span>
              <span className="value">{method.successRate.toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="label">Processing Time:</span>
              <span className="value">{method.averageProcessingTime}ms</span>
            </div>
            <div className="metric">
              <span className="label">Volume:</span>
              <span className="value">${(method.totalVolume / 100).toLocaleString()}</span>
            </div>
            <div className="metric">
              <span className="label">Preference Rank:</span>
              <span className="value">#{method.userPreferenceRank}</span>
            </div>
          </div>
          
          <div className="device-breakdown">
            <h5>Device Performance</h5>
            {method.devicePerformance.map(device => (
              <div key={device.deviceType} className="device-metric">
                <span>{device.deviceType}:</span>
                <span>{device.successRate.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentFailuresPanel: React.FC<{
  failures: PaymentFailureAnalysis[];
  provider: PaymentProvider;
}> = ({ failures }) => (
  <div className="payment-failures-panel">
    <div className="failures-list">
      {failures.map(failure => (
        <div key={failure.failureCode} className="failure-card">
          <div className="failure-header">
            <h4>{failure.failureCode}</h4>
            <span className="frequency">{failure.frequency} occurrences ({failure.percentage.toFixed(1)}%)</span>
          </div>
          
          <div className="failure-details">
            <p className="description">{failure.description}</p>
            <p className="suggestion">
              <strong>Suggested Action:</strong> {failure.suggestedAction}
            </p>
            <div className="failure-metrics">
              <span className={`retryable ${failure.isRetryable ? 'yes' : 'no'}`}>
                {failure.isRetryable ? 'Retryable' : 'Non-retryable'}
              </span>
              {failure.isRetryable && (
                <span className="retry-success">
                  {failure.averageRetrySuccess.toFixed(1)}% retry success
                </span>
              )}
            </div>
          </div>

          <div className="failure-patterns">
            <div className="pattern">
              <h5>Time Pattern</h5>
              <div className="time-chart">
                {failure.timePattern.map(time => (
                  <div key={time.hour} className="time-bar" style={{height: `${time.frequency}px`}}>
                    <span>{time.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pattern">
              <h5>Geographic Pattern</h5>
              <div className="geo-list">
                {failure.geographicPattern.slice(0, 5).map(geo => (
                  <div key={geo.countryCode} className="geo-item">
                    <span>{geo.countryCode}:</span>
                    <span>{geo.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pattern">
              <h5>Amount Pattern</h5>
              <div className="amount-list">
                {failure.amountPattern.map(amount => (
                  <div key={amount.amountRange} className="amount-item">
                    <span>{amount.amountRange}:</span>
                    <span>{amount.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentOptimizationPanel: React.FC<{
  metrics: PaymentProviderMetrics;
  methods: PaymentMethodMetrics[];
  failures: PaymentFailureAnalysis[];
}> = ({ metrics, methods, failures }) => {
  const recommendations = generateOptimizationRecommendations(metrics, methods, failures);

  return (
    <div className="payment-optimization-panel">
      <div className="optimization-recommendations">
        <h3>Optimization Recommendations</h3>
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation ${rec.priority}`}>
            <h4>{rec.title}</h4>
            <p>{rec.description}</p>
            <div className="recommendation-actions">
              <span className="impact">Impact: {rec.impact}</span>
              <span className="effort">Effort: {rec.effort}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="optimization-metrics">
        <h3>Key Performance Indicators</h3>
        <div className="kpi-grid">
          <div className="kpi-card">
            <h4>Success Rate Target</h4>
            <div className="kpi-value">&gt;95%</div>
            <div className="kpi-current">
              Current: {metrics.successRate.toFixed(1)}%
            </div>
          </div>
          
          <div className="kpi-card">
            <h4>Processing Time Target</h4>
            <div className="kpi-value">&lt;500ms</div>
            <div className="kpi-current">
              Current: {metrics.averageProcessingTime}ms
            </div>
          </div>
          
          <div className="kpi-card">
            <h4>Retry Success Target</h4>
            <div className="kpi-value">&gt;60%</div>
            <div className="kpi-current">
              Current: {metrics.retrySuccessRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate optimization recommendations
function generateOptimizationRecommendations(
  metrics: PaymentProviderMetrics,
  methods: PaymentMethodMetrics[],
  failures: PaymentFailureAnalysis[]
): Array<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
}> {
  const recommendations = [];

  // Success rate analysis
  if (metrics.successRate < 95) {
    recommendations.push({
      title: 'Improve Payment Success Rate',
      description: `Current success rate of ${metrics.successRate.toFixed(1)}% is below the 95% target. Consider implementing retry logic and payment method fallbacks.`,
      priority: 'high' as const,
      impact: 'High',
      effort: 'Medium'
    });
  }

  // Processing time analysis
  if (metrics.averageProcessingTime > 1000) {
    recommendations.push({
      title: 'Optimize Payment Processing Time',
      description: `Average processing time of ${metrics.averageProcessingTime}ms is above recommended threshold. Consider optimizing API calls and implementing caching.`,
      priority: 'medium' as const,
      impact: 'Medium',
      effort: 'High'
    });
  }

  // Retry analysis
  if (metrics.retrySuccessRate < 60) {
    recommendations.push({
      title: 'Enhance Retry Strategy',
      description: `Retry success rate of ${metrics.retrySuccessRate.toFixed(1)}% indicates room for improvement in retry logic and timing.`,
      priority: 'medium' as const,
      impact: 'Medium',
      effort: 'Low'
    });
  }

  // Method-specific recommendations
  const lowPerformingMethods = methods.filter(m => m.successRate < 90);
  if (lowPerformingMethods.length > 0) {
    recommendations.push({
      title: 'Address Low-Performing Payment Methods',
      description: `The following payment methods have success rates below 90%: ${lowPerformingMethods.map(m => m.methodType).join(', ')}`,
      priority: 'high' as const,
      impact: 'High',
      effort: 'Medium'
    });
  }

  // Failure analysis
  const highFrequencyFailures = failures.filter(f => f.percentage > 10);
  if (highFrequencyFailures.length > 0) {
    recommendations.push({
      title: 'Address High-Frequency Payment Failures',
      description: `Focus on resolving the top failure reasons: ${highFrequencyFailures.map(f => f.failureCode).join(', ')}`,
      priority: 'high' as const,
      impact: 'High',
      effort: 'Medium'
    });
  }

  return recommendations;
}

export default PaymentAnalyticsDashboard;