/**
 * Revenue Analytics Dashboard
 * Story 30.1.2 - Revenue Dashboard Implementation
 * 
 * Main revenue dashboard component integrating Epic 1 analytics with Epic 16 marketplace
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RevenueTimeRange, RevenueFilters } from '../../types/revenue';
import { RevenueOverviewPanel } from './RevenueOverviewPanel';
import { RevenueTrendChart } from './RevenueTrendChart';
import { TopPerformersWidget } from './TopPerformersWidget';
import { PaymentMethodBreakdown } from './PaymentMethodBreakdown';
import { GeographicDistribution } from './GeographicDistribution';
import { CreatorPayoutTracker } from './CreatorPayoutTracker';
import { RevenueFiltersPanel } from './RevenueFiltersPanel';
import { RevenueExportManager } from './RevenueExportManager';
import { RealTimeRevenueStream } from './RealTimeRevenueStream';
import { ForecastingWidget } from './ForecastingWidget';
import { useRevenueAnalytics } from '../../hooks/useRevenueAnalytics';
import { useRealtimeRevenue } from '../../hooks/useRealtimeRevenue';
import { useRevenueForecast } from '../../hooks/useRevenueForecast';
import './RevenueDashboard.css';


interface RevenueDashboardProps {
  /** Dashboard scope - global, creator-specific, or template-specific */
  scope: 'global' | 'creator' | 'template';
  /** Entity ID for scoped dashboards */
  entityId?: string;
  /** Initial time range */
  initialTimeRange?: RevenueTimeRange;
  /** Dashboard layout mode */
  layout?: 'compact' | 'detailed' | 'executive';
  /** Real-time updates enabled */
  realtimeEnabled?: boolean;
  /** Export capabilities enabled */
  exportEnabled?: boolean;
  /** Custom CSS class */
  className?: string;
  export const RevenueDashboard: React.FC<RevenueDashboardProps> = ({),
  scope,
  entityId,
  initialTimeRange = RevenueTimeRange.LAST_30D,
  layout = 'detailed',
  realtimeEnabled = true,
  exportEnabled = true,
  className = ''


}) => {
  // State management
  const [timeRange, setTimeRange] = useState<RevenueTimeRange>(initialTimeRange);
  const [customDateRange, setCustomDateRange] = useState<{
  start: Date | null;,
  end: Date | null;
>({ start: null, end: null });
  const [filters, setFilters] = useState<RevenueFilters>({)
  paymentProviders: [],
  licenseTypes: [],
  countries: [],
  templates: [],
  creators: [],
});
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performers' | 'geography' | 'payouts'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Custom hooks for data fetching
  const {
  dashboardData,
  metrics,
  isLoading: analyticsLoading,
  error: analyticsError,
  refreshData,
  exportData
 = useRevenueAnalytics({)
  scope,
  entityId,
  timeRange,
  customDateRange,
  filters,
  refreshInterval: realtimeEnabled ? 30000 : 0 // 30 seconds for real-time,
});
  // Real-time revenue stream
  const {
  realtimeData,
  isConnected: realtimeConnected,
  connect: connectRealtime,
  disconnect: disconnectRealtime,
 = useRealtimeRevenue({)
  enabled: realtimeEnabled,
  scope,
  entityId,
  filters
});
  // Revenue forecasting
  const {
  forecast,
  isLoading: forecastLoading,
  generateForecast,
  forecastAccuracy
 = useRevenueForecast({)
  scope,
  entityId,
  historicalPeriod: 90 // 90 days of historical data,
});
  // Effects
  useEffect(() => {
    setLoading(analyticsLoading);
    setError(analyticsError);
  }, [analyticsLoading, analyticsError]);
  useEffect(() => {
    if (realtimeEnabled) {
      connectRealtime();
      return () => disconnectRealtime();
  }, [realtimeEnabled, connectRealtime, disconnectRealtime]);
  // Event handlers
  const handleTimeRangeChange = useCallback((newTimeRange: RevenueTimeRange) => {
    setTimeRange(newTimeRange);
    if (newTimeRange !== RevenueTimeRange.CUSTOM) {
      setCustomDateRange({ start: null, end: null });
  }, []);
  const handleCustomDateRangeChange = useCallback((start: Date | null, end: Date | null) => {
    setCustomDateRange({ start, end });
    if (start && end) {
      setTimeRange(RevenueTimeRange.CUSTOM);
  }, []);
  const handleFiltersChange = useCallback((newFilters: RevenueFilters) => {
    setFilters(newFilters);
  }, []);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
 catch {
      setError('Failed to refresh dashboard data');
 finally {
      setRefreshing(false);
  }, [refreshData]);
  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'pdf') => {
  try {
  await exportData(format, {)
  scope,
  entityId,
  timeRange,
  customDateRange,
  filters,
  includeForecast: !!forecast,
});
 catch {
      setError('Failed to export dashboard data');
  }, [exportData, scope, entityId, timeRange, customDateRange, filters, forecast]);
  const handleGenerateForecast = useCallback(async () => {
    try {
      await generateForecast();
 catch {
      setError('Failed to generate revenue forecast');
  }, [generateForecast]);
  // Computed values
  const dashboardTitle = useMemo(() => {
  switch (scope) {
  case 'global':,
  return 'Global Revenue Analytics';
  case 'creator':,
  return 'Creator Revenue Dashboard';
  case 'template':,
  return 'Template Revenue Analytics';
  default:,
  return 'Revenue Dashboard';
}, [scope]);
  const isCompactLayout = layout === 'compact';
  const isExecutiveLayout = layout === 'executive';
  // Loading state
  if (loading && !dashboardData) {
    return;
      <div className={`revenue-dashboard revenue-dashboard--loading ${className}`}>}
        <div className="revenue-dashboard__loading">
          <div className="revenue-dashboard__spinner" />
          <p>Loading revenue analytics...</p>
        </div>
      </div>
    );
  // Error state
  if (error && !dashboardData) {
    return;
      <div className={`revenue-dashboard revenue-dashboard--error ${className}`}>}
        <div className="revenue-dashboard__error">
          <h3>Failed to Load Revenue Dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="revenue-dashboard__retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  return;
    <div className={`revenue-dashboard revenue-dashboard--${layout} ${className}`}>}
      {/* Dashboard Header */}
      <div className="revenue-dashboard__header">
        <div className="revenue-dashboard__title-section">
          <h2 className="revenue-dashboard__title">{dashboardTitle}</h2>
          {realtimeEnabled && ()
            <div className={`revenue-dashboard__realtime-indicator ${realtimeConnected ? 'connected' : 'disconnected'}`}>}
              <span className="revenue-dashboard__realtime-dot" />
              {realtimeConnected ? 'Live' : 'Offline'}
            </div>
          )}
        </div>
        <div className="revenue-dashboard__controls">
          {/* Time Range Selector */}
          <div className="revenue-dashboard__time-controls">
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value as RevenueTimeRange)}
              className="revenue-dashboard__time-select"
            >
              <option value={RevenueTimeRange.LAST_7D}>Last 7 days</option>
              <option value={RevenueTimeRange.LAST_30D}>Last 30 days</option>
              <option value={RevenueTimeRange.LAST_90D}>Last 90 days</option>
              <option value={RevenueTimeRange.LAST_YEAR}>Last year</option>
              <option value={RevenueTimeRange.CUSTOM}>Custom range</option>
            </select>
            {timeRange === RevenueTimeRange.CUSTOM && ()
              <div className="revenue-dashboard__custom-range">
                <input 
                  type="date" 
                  value={customDateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleCustomDateRangeChange(new Date(e.target.value), customDateRange.end)}
                  className="revenue-dashboard__date-input"
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={customDateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleCustomDateRangeChange(customDateRange.start, new Date(e.target.value))}
                  className="revenue-dashboard__date-input"
                />
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="revenue-dashboard__actions">
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="revenue-dashboard__refresh-btn"
              title="Refresh data"
            >
              {refreshing ? '⟳' : '↻'}
            </button>
            {exportEnabled && ()
              <RevenueExportManager
                onExport={handleExport}
                disabled={loading}
                className="revenue-dashboard__export"
              />
            )}
          </div>
        </div>
      </div>
      {/* Dashboard Navigation */}
      {!isCompactLayout && ()
        <div className="revenue-dashboard__nav">
          <button 
            className={`revenue-dashboard__nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`revenue-dashboard__nav-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button 
            className={`revenue-dashboard__nav-btn ${activeTab === 'performers' ? 'active' : ''}`}
            onClick={() => setActiveTab('performers')}
          >
            Top Performers
          </button>
          <button 
            className={`revenue-dashboard__nav-btn ${activeTab === 'geography' ? 'active' : ''}`}
            onClick={() => setActiveTab('geography')}
          >
            Geography
          </button>
          {scope !== 'template' && ()
            <button 
              className={`revenue-dashboard__nav-btn ${activeTab === 'payouts' ? 'active' : ''}`}
              onClick={() => setActiveTab('payouts')}
            >
              Payouts
            </button>
          )}
        </div>
      )}
      {/* Filters Panel */}
      {!isExecutiveLayout && ()
        <RevenueFiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          scope={scope}
          className="revenue-dashboard__filters"
        />
      )}
      {/* Real-time Revenue Stream */}
      {realtimeEnabled && realtimeData && ()
        <RealTimeRevenueStream
          data={realtimeData}
          className="revenue-dashboard__realtime-stream"
        />
      )}
      {/* Dashboard Content */}
      <div className="revenue-dashboard__content">
        {(activeTab === 'overview' || isCompactLayout) && ()
          <div className="revenue-dashboard__overview">
            <RevenueOverviewPanel
              metrics={metrics}
              dashboardData={dashboardData}
              layout={layout}
              className="revenue-dashboard__overview-panel"
            />
            {!isExecutiveLayout && ()
              <>
                <RevenueTrendChart
                  data={dashboardData?.trends || []}
                  timeRange={timeRange}
                  className="revenue-dashboard__trends"
                />
                <div className="revenue-dashboard__overview-widgets">
                  <PaymentMethodBreakdown
                    data={dashboardData?.paymentMethods || []}
                    className="revenue-dashboard__payment-methods"
                  />
                  <TopPerformersWidget
                    templates={dashboardData?.topTemplates || []}
                    creators={dashboardData?.topCreators || []}
                    scope={scope}
                    className="revenue-dashboard__top-performers"
                  />
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'trends' && !isCompactLayout && ()
          <div className="revenue-dashboard__trends-detailed">
            <RevenueTrendChart
              data={dashboardData?.trends || []}
              timeRange={timeRange}
              detailed={true}
              className="revenue-dashboard__trends-chart"
            />
            <ForecastingWidget
              forecast={forecast}
              accuracy={forecastAccuracy}
              loading={forecastLoading}
              onGenerateForecast={handleGenerateForecast}
              className="revenue-dashboard__forecasting"
            />
          </div>
        )}
        {activeTab === 'performers' && !isCompactLayout && ()
          <TopPerformersWidget
            templates={dashboardData?.topTemplates || []}
            creators={dashboardData?.topCreators || []}
            scope={scope}
            detailed={true}
            className="revenue-dashboard__performers-detailed"
          />
        )}
        {activeTab === 'geography' && !isCompactLayout && ()
          <GeographicDistribution
            data={dashboardData?.geography || []}
            className="revenue-dashboard__geography"
          />
        )}
        {activeTab === 'payouts' && scope !== 'template' && !isCompactLayout && ()
          <CreatorPayoutTracker
            payouts={dashboardData?.payouts || []}
            scope={scope}
            entityId={entityId}
            className="revenue-dashboard__payouts"
          />
        )}
      </div>
      {/* Dashboard Footer */}
      <div className="revenue-dashboard__footer">
        <div className="revenue-dashboard__last-updated">
          Last updated: {dashboardData?.lastUpdated ? 
            new Date(dashboardData.lastUpdated).toLocaleString() : 
            'Never'
        </div>
        {dashboardData?.dataQuality && ()
          <div className="revenue-dashboard__data-quality">
            Data quality: {Math.round(dashboardData.dataQuality * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};