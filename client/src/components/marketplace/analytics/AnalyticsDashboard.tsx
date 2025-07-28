import React, { useState, useEffect, useCallback } from 'react';
import { TimeRange, CreatorDashboard, AnalyticsInsight } from '../../../types/analytics';
import { DashboardOverview } from './DashboardOverview';
import { PerformanceSummary } from './PerformanceSummary';
import { TrafficMetrics } from './TrafficMetrics';
import { FinancialMetrics } from './FinancialMetrics';
import { InsightsPanel } from './InsightsPanel';
import { TimeRangeSelector } from './TimeRangeSelector';
import { analyticsService } from '../../../services/analyticsService';
import './AnalyticsDashboard.css';
interface AnalyticsDashboardProps {
  creatorId: string;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({)
  creatorId,
  className = ''
}) => {
  const [dashboard, setDashboard] = useState<CreatorDashboard | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.LAST_30D);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'traffic' | 'financial'>('overview');
  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, insightsData] = await Promise.all([)
        analyticsService.getCreatorDashboard()
          creatorId,
          timeRange,
          customStartDate,
          customEndDate
        ),
        analyticsService.generateInsights(creatorId)
      ]);
      setDashboard(dashboardData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [creatorId, timeRange, customStartDate, customEndDate]);
  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboard]);
  // Handle time range change
  const handleTimeRangeChange = (;)
    newTimeRange: TimeRange,
    startDate?: Date,
    endDate?: Date
  ) => {
    setTimeRange(newTimeRange);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };
  // Load data on mount and when time range changes
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        refreshDashboard();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading, refreshing, refreshDashboard]);
  if (loading) {
    return ()
      <div className={`analytics-dashboard loading ${className}`}>}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="title-section">
              <h1>Analytics Dashboard</h1>
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Loading dashboard data...</span>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="loading-skeleton">
            <div className="skeleton-row">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
            <div className="skeleton-row">
              <div className="skeleton-chart"></div>
              <div className="skeleton-chart"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return ()
      <div className={`analytics-dashboard error ${className}`}>}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="title-section">
              <h1>Analytics Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to Load Dashboard</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={loadDashboard}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!dashboard) {
    return ()
      <div className={`analytics-dashboard empty ${className}`}>}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="title-section">
              <h1>Analytics Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Analytics Data Available</h3>
            <p>Start creating templates to see your analytics data here.</p>
          </div>
        </div>
      </div>
    );
  }
  return ()
    <div className={`analytics-dashboard ${className}`}>}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Analytics Dashboard</h1>
            <p className="subtitle">
              {dashboard.period_start.toLocaleDateString()} - {dashboard.period_end.toLocaleDateString()}
            </p>
          </div>
          <div className="header-controls">
            <TimeRangeSelector
              value={timeRange}
              startDate={customStartDate}
              endDate={customEndDate}
              onChange={handleTimeRangeChange}
            />
            <button
              className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
              onClick={refreshDashboard}
              disabled={refreshing}
              title="Refresh dashboard data"
            >
              <span className="refresh-icon">🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">🏠</span>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <span className="tab-icon">📈</span>
            Performance
          </button>
          <button
            className={`tab-button ${activeTab === 'traffic' ? 'active' : ''}`}
            onClick={() => setActiveTab('traffic')}
          >
            <span className="tab-icon">🌐</span>
            Traffic
          </button>
          <button
            className={`tab-button ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            <span className="tab-icon">💰</span>
            Financial
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="main-content">
          {activeTab === 'overview' && ()
            <DashboardOverview 
              dashboard={dashboard}
              insights={insights}
              onRefresh={refreshDashboard}
            />
          )}
          {activeTab === 'performance' && ()
            <PerformanceSummary 
              performanceData={dashboard.performance_summary}
              overview={dashboard.overview}
              timeRange={timeRange}
              onRefresh={refreshDashboard}
            />
          )}
          {activeTab === 'traffic' && ()
            <TrafficMetrics 
              trafficData={dashboard.traffic_metrics}
              timeRange={timeRange}
              onRefresh={refreshDashboard}
            />
          )}
          {activeTab === 'financial' && ()
            <FinancialMetrics 
              financialData={dashboard.financial_metrics}
              timeRange={timeRange}
              onRefresh={refreshDashboard}
            />
          )}
        </div>
        <div className="sidebar-content">
          <InsightsPanel 
            insights={insights}
            onInsightDismiss={(insightId) => {
              setInsights(insights.filter(i => i.id !== insightId));
            }}
            onRefresh={refreshDashboard}
          />
        </div>
      </div>
    </div>
  );
};