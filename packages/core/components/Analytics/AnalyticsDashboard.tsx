import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
import { conversionTracker } from '../../analytics/ConversionTracker';
import { performanceMonitor } from '../../utils/PerformanceMonitor';
import { MetricsOverview } from './MetricsOverview';
import { PerformanceCharts } from './PerformanceCharts';
import { CostAnalysis } from './CostAnalysis';
import { UsagePatterns } from './UsagePatterns';
import { AlertsPanel } from './AlertsPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { ExportOptions } from './ExportOptions';
import { ConversionFunnelDashboard } from './ConversionFunnelDashboard';
import { DirectorAnalyticsView } from './DirectorAnalyticsView';
import { RealTimeMetrics } from './RealTimeMetrics';
/**
 * Time range options
 */
const TIME_RANGES = [;
  { value: 'hour', label: 'Last Hour', duration: 60 * 60 * 1000 },
  { value: '24h', label: 'Last 24 Hours', duration: 24 * 60 * 60 * 1000 },
  { value: '7d', label: 'Last 7 Days', duration: 7 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: 'Last 30 Days', duration: 30 * 24 * 60 * 60 * 1000 },
  { value: '90d', label: 'Last 90 Days', duration: 90 * 24 * 60 * 60 * 1000 }
];
/**
 * Analytics dashboard props
 */

}
export interface AnalyticsDashboardProps {
  analyticsClient: AnalyticsClient;
  userId?: number;
  organizationId?: number;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  /**
  * Analytics dashboard state
  */
  interface DashboardState {
  loading: boolean;
  error: string | null;
  summary: unknown;
  dashboardData: unknown;
  alerts: unknown;
  recommendations: unknown;
  timeRange: string;
  lastUpdated: Date | null;
  conversionData: unknown;
  realTimeMetrics: unknown;
  performanceData: unknown;
  userRole: 'director' | 'producer' | 'admin' | 'user';
  /**
  * Main analytics dashboard component
  */
}
}
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({)
  analyticsClient,
  userId,
  organizationId,
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [state, setState] = useState<DashboardState>({)
  loading: true,
  error: null,
  summary: null,
  dashboardData: null,
  alerts: [],
  recommendations: [],
  timeRange: '24h',
  lastUpdated: null,
  conversionData: null,
  realTimeMetrics: null,
  performanceData: null,
  userRole: 'director',
});
  const [_____selectedView, _____setSelectedView] = useState<'overview' | 'conversions' | 'director' | 'performance' | 'costs' | 'usage' | 'insights'>('overview');
  /**
   * Calculate time range based on selected option
   */
  const getTimeRange = useCallback((rangeKey: string) => {
    const range = TIME_RANGES.find(r => r.value === rangeKey);
    const endTime = Date.now();
    const startTime = endTime - (range?.duration || 24 * 60 * 60 * 1000);
    return { startTime, endTime };
  }, []);
  /**
   * Load dashboard data
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const timeRange = getTimeRange(state.timeRange);
      const query = {
        ...timeRange,
        userId,
        organizationId
      };
      // Load data in parallel
      const [summaryResponse, dashboardResponse, alertsResponse, recommendationsResponse] = await Promise.all([)
        analyticsClient.getSummary(query),
        analyticsClient.getDashboardData(),
        analyticsClient.getAlerts(),
        analyticsClient.getRecommendations(userId, organizationId)
      ]);
      // Load conversion tracking data
      const conversionData = conversionTracker.getDashboardData();
      // Load performance monitoring data
      const performanceData = performanceMonitor.getDashboardData();
      // Combine real-time metrics
      const realTimeMetrics = {
  ...conversionData.realTimeMetrics,
  performance: {
  healthScore: performanceData.overview.healthScore,
  activeAlerts: performanceData.overview.activeAlerts,
  keyMetrics: performanceData.keyMetrics,
};
      if (!summaryResponse.success) {
  throw new Error(summaryResponse.error || 'Failed to load summary');
  if (!dashboardResponse.success) {
  throw new Error(dashboardResponse.error || 'Failed to load dashboard data');
  setState(prev => ({)
  ...prev,
  loading: false,
  summary: summaryResponse.data,
  dashboardData: dashboardResponse.data,
  alerts: alertsResponse.success ? alertsResponse.data : [],
  recommendations: recommendationsResponse.success ? recommendationsResponse.data : [],
  conversionData,
  realTimeMetrics,
  performanceData,
  lastUpdated: new Date(),
}));
    } catch (error) {
  console.error('Failed to load dashboard data:', error);
  setState(prev => ({)
  ...prev,
  loading: false,
  error: error instanceof Error ? error.message : 'Failed to load dashboard data',
}));
  }, [analyticsClient, userId, organizationId, state.timeRange, getTimeRange]);
  /**
   * Handle time range change
   */
  const handleTimeRangeChange = useCallback((newRange: string) => {
    setState(prev => ({ ...prev, timeRange: newRange }));
  }, []);
  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  /**
   * Handle alert acknowledgment
   */
  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
  try {
  const response = await analyticsClient.acknowledgeAlert(alertId);
  if (response.success) {
  setState(prev => ({)
  ...prev,
  alerts: prev.alerts.filter(alert => alert.id !== alertId),
}));
    } catch (error) {
  console.error('Failed to acknowledge alert:', error);
}, [analyticsClient]);
  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDashboardData]);
  /**
   * Initial data load
   */
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  /**
   * Render loading state
   */
  if (state.loading && !state.summary) {
    return;
      <div className={`analytics-dashboard ${className}`}>}
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  /**
   * Render error state
   */
  if (state.error) {
    return;
      <div className={`analytics-dashboard ${className}`}>}
        <Alert variant="destructive">
          <AlertDescription>
            {state.error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  return;
    <div className={`analytics-dashboard ${className}`}>}
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Analytics Dashboard</h1>
          {state.lastUpdated && ()
            <Badge variant="secondary">
              Last updated: {state.lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <div className="header-controls">
          <Select value={state.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => ()
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={state.loading}
          >
            {state.loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <ExportOptions
            analyticsClient={analyticsClient}
            timeRange={getTimeRange(state.timeRange)}
          />
        </div>
      </div>
      {/* Alerts Bar */}
      {state.alerts.length > 0 && ()
        <div className="alerts-bar">
          <AlertsPanel
            alerts={state.alerts}
            onAcknowledge={handleAcknowledgeAlert}
          />
        </div>
      )}
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="dashboard-tabs">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="director">Director</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="tab-content">
          <div className="overview-grid">
            <RealTimeMetrics
              metrics={state.realTimeMetrics}
              loading={state.loading}
            />
            <MetricsOverview
              summary={state.summary}
              dashboardData={state.dashboardData}
              conversionData={state.conversionData}
              performanceData={state.performanceData}
              loading={state.loading}
            />
          </div>
        </TabsContent>
        <TabsContent value="conversions" className="tab-content">
          <ConversionFunnelDashboard
            conversionData={state.conversionData}
            timeRange={getTimeRange(state.timeRange)}
            loading={state.loading}
          />
        </TabsContent>
        <TabsContent value="director" className="tab-content">
          <DirectorAnalyticsView
            conversionData={state.conversionData}
            performanceData={state.performanceData}
            timeRange={getTimeRange(state.timeRange)}
            userId={userId}
            loading={state.loading}
          />
        </TabsContent>
        <TabsContent value="performance" className="tab-content">
          <PerformanceCharts
            analyticsClient={analyticsClient}
            timeRange={getTimeRange(state.timeRange)}
            userId={userId}
            organizationId={organizationId}
          />
        </TabsContent>
        <TabsContent value="costs" className="tab-content">
          <CostAnalysis
            analyticsClient={analyticsClient}
            timeRange={getTimeRange(state.timeRange)}
            userId={userId}
            organizationId={organizationId}
          />
        </TabsContent>
        <TabsContent value="usage" className="tab-content">
          <UsagePatterns
            analyticsClient={analyticsClient}
            timeRange={getTimeRange(state.timeRange)}
            userId={userId}
            organizationId={organizationId}
          />
        </TabsContent>
        <TabsContent value="insights" className="tab-content">
          <div className="insights-grid">
            <RecommendationsPanel
              recommendations={state.recommendations}
              analyticsClient={analyticsClient}
              userId={userId}
              organizationId={organizationId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
/**
 * Analytics dashboard styles
 */
const styles = `;
  .analytics-dashboard {
    display: flex;
    flex-direction: column;
  gap: 1rem;
    padding: 1rem;
    max-width: 100%;
  overflow: hidden;
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  .header-title {
    display: flex;
    align-items: center;
  gap: 1rem;
  .header-title h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  color: #1f2937;
  .header-controls {
    display: flex;
    align-items: center;
  gap: 0.5rem;
  .alerts-bar {
    margin-bottom: 1rem;
  .dashboard-tabs {
    flex: 1;
  display: flex;
    flex-direction: column;
  overflow: hidden;
  .tab-content {
    flex: 1;
  overflow: auto;
    padding: 1rem 0;
  .overview-grid {
    display: grid;
  gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  .insights-grid {
    display: grid;
  gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  padding: 4rem;
    gap: 1rem;
  .loading-spinner {
    width: 2rem;
  height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
  gap: 1rem;
      align-items: stretch;
    .header-controls {
      justify-content: space-between;
    .overview-grid {
      grid-template-columns: 1fr;
    .insights-grid {
      grid-template-columns: 1fr;
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

export default AnalyticsDashboard;