/**
 * Rate Limiting Metrics Dashboard Component
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 * 
 * Interactive React dashboard for visualizing rate limiting performance metrics
 * with real-time updates, customizable widgets, and alert management.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RateLimitingPerformanceMetrics,
  PerformanceMetrics,
  MetricsVisualizationData,
  AlertCondition,
  DashboardWidget
} from '../RateLimitingPerformanceMetrics';
import { ThreatLevel } from '../RateLimitingService';

// ========================================
// Component Props and Types
// ========================================
interface RateLimitingMetricsDashboardProps {
  metricsService: RateLimitingPerformanceMetrics;
  className?: string;
  theme?: 'light' | 'dark';
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds,
  interface ChartData {
  labels: string;
  datasets: Array<{,
  label: string;
  data: number;
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
}>;
interface MetricStat {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  severity?: 'normal' | 'warning' | 'critical';
  // ========================================
  // Dashboard Component
  // ========================================
  export const RateLimitingMetricsDashboard: React.FC<RateLimitingMetricsDashboardProps> = ({,)
  metricsService,
  className = '',
  theme = 'light',
  autoRefresh = true,
  refreshInterval = 5
}) => {
  // State management
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [visualizationData, setVisualizationData] = useState<MetricsVisualizationData | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<AlertCondition>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  // ========================================
  // Data Loading and Updates
  // ========================================
  const loadMetricsData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get current metrics
      const systemStatus = metricsService.getSystemStatus();
      setCurrentMetrics(systemStatus.metrics);
      setActiveAlerts(systemStatus.alerts);
      // Get visualization data
      const vizData = metricsService.getVisualizationData(selectedTimeRange);
      setVisualizationData(vizData);
      setLastUpdate(new Date());
    } catch (error) {
  console.error('Error loading metrics data:', error);
} finally {
      setIsLoading(false);
  }, [metricsService, selectedTimeRange]);
  // Set up auto-refresh
  useEffect(() => {
    loadMetricsData();
    if (autoRefresh) {
      const interval = setInterval(loadMetricsData, refreshInterval * 1000);
      return () => clearInterval(interval);
  }, [loadMetricsData, autoRefresh, refreshInterval]);
  // Listen for real-time updates
  useEffect(() => {
    const handleMetricsUpdate = () => {
      loadMetricsData();
    };
    const handleAlertCreated = (alert: AlertCondition) => {
      setActiveAlerts(prev => [...prev, alert]);
    };
    metricsService.on('metricsUpdated', handleMetricsUpdate);
    metricsService.on('alertCreated', handleAlertCreated);
    return () => {
      metricsService.off('metricsUpdated', handleMetricsUpdate);
      metricsService.off('alertCreated', handleAlertCreated);
    };
  }, [metricsService, loadMetricsData]);
  // ========================================
  // Data Processing and Formatting
  // ========================================
  const formatNumber = useCallback((value: number, decimals: number = 1): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;}
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;}
    return value.toFixed(decimals);
  }, []);
  const formatDuration = useCallback((milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(0)}ms`;}
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;}
    } else {
      return `${(milliseconds / 60000).toFixed(1)}m`;}
  }, []);
  const getMetricStats = useMemo((): MetricStat => {
  if (!currentMetrics) return [];
  return [
  {
  label: 'Requests/sec',
  value: formatNumber(currentMetrics.throughput.requestsPerSecond),
  unit: 'rps',
  trend: 'stable',
  severity: currentMetrics.throughput.requestsPerSecond > 1000 ? 'normal' : 'warning',
}
      {
  label: 'Avg Response Time',
  value: formatDuration(currentMetrics.responseTime.average),
  trend: 'stable',
  severity: currentMetrics.responseTime.average > 200 ? 'critical' : ,
  currentMetrics.responseTime.average > 100 ? 'warning' : 'normal',
}
      {
  label: 'Block Rate',
  value: currentMetrics.errorRates.blockRate.toFixed(1),
  unit: '%',
  trend: 'down',
  severity: currentMetrics.errorRates.blockRate > 25 ? 'critical' : ,
  currentMetrics.errorRates.blockRate > 10 ? 'warning' : 'normal',
}
      {
  label: 'Error Rate',
  value: currentMetrics.errorRates.errorRate.toFixed(1),
  unit: '%',
  trend: 'stable',
  severity: currentMetrics.errorRates.errorRate > 10 ? 'critical' : ,
  currentMetrics.errorRates.errorRate > 5 ? 'warning' : 'normal',
}
      {
  label: 'Memory Usage',
  value: formatNumber(currentMetrics.resourceUtilization.memoryUsage),
  unit: 'MB',
  trend: 'up',
  severity: currentMetrics.resourceUtilization.memoryUsage > 1000 ? 'warning' : 'normal',
}
      {
  label: 'Active Connections',
  value: formatNumber(currentMetrics.resourceUtilization.activeConnections),
  trend: 'stable',
  severity: 'normal'];
}, [currentMetrics, formatNumber, formatDuration]);
  const getTimeSeriesChartData = useMemo((): ChartData | null => {
    if (!visualizationData) return null;
    const { timeSeriesData } = visualizationData;
    return {
      labels: timeSeriesData.timestamps.map(ts => ),
        new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ),
      datasets: [,
        {
  label: 'Response Time (ms)',
  data: timeSeriesData.responseTime,
  borderColor: theme === 'dark' ? '#60A5FA' : '#2563EB',
  backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
  fill: true,
}
        {
  label: 'Requests/sec',
  data: timeSeriesData.throughput,
  borderColor: theme === 'dark' ? '#34D399' : '#059669',
  backgroundColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(5, 150, 105, 0.1)',
  fill: false];
  };
  }, [visualizationData, theme]);
    return {
  labels: Object.keys(distribution),
  datasets: [{,
  data: Object.values(distribution),
  backgroundColor: [,
  '#10B981', // LOW - Green
  '#F59E0B', // MEDIUM - Yellow
  '#EF4444', // HIGH - Red
  '#DC2626'  // CRITICAL - Dark Red
  ]
}]
    };
  }, [visualizationData]);
  // ========================================
  // Event Handlers
  // ========================================
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
  };
  const handleAlertAcknowledge = (alertId: string) => {
    metricsService.acknowledgeAlert(alertId);
    setActiveAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
  };
  const handleExportData = (format: 'json' | 'csv') => {
  const exportData = metricsService.exportMetrics(format);
  const blob = new Blob([exportData], { )
  type: format === 'json' ? 'application/json' : 'text/csv',
});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rate-limiting-metrics-${new Date().toISOString().split('T')[0]}.${format}`;}
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // ========================================
  // Render Methods
  // ========================================
  const renderMetricCard = (stat: MetricStat, index: number) => (;);
    <div
      key={index}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4
        ${stat.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
        ${stat.severity === 'warning' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>
          <div className="flex items-baseline space-x-1">
            <p className={`text-2xl font-semibold ${
  stat.severity === 'critical' ? 'text-red-600 dark:text-red-400' :,
  stat.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :,
  'text-gray-900 dark:text-white',
}`}>
              {stat.value}
            </p>
            {stat.unit && ()
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stat.unit}
              </span>
            )}
          </div>
        </div>
        {stat.trend && ()
          <div className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${stat.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
            ${stat.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
            ${stat.trend === 'stable' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
          `}>
            {stat.trend === 'up' && '↗'}
            {stat.trend === 'down' && '↘'}
            {stat.trend === 'stable' && '→'}
            {stat.trend}
          </div>
        )}
      </div>
    </div>
  );
  const renderAlerts = () => (;);
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Active Alerts ({activeAlerts.length})
        </h3>
      </div>
      <div className="p-4">
        {activeAlerts.length === 0 ? ()
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No active alerts
          </p>
        ) : ()
          <div className="space-y-3">
            {activeAlerts.map((alert) => ()
              <div
                key={alert.alertId}
                className={`
                  p-3 rounded-lg border-l-4 
                  ${alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                  ${alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}
                  ${alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                  ${alert.severity === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alert.condition}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">,
  Current: {alert.currentValue.toFixed(2)} | Threshold: {alert.threshold}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAlertAcknowledge(alert.alertId)}
                    className="ml-3 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  const renderTimeSeriesChart = () => {
    if (!getTimeSeriesChartData) return null;
    return;
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Performance Trends
          </h3>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Time Series Chart</p>
              <p className="text-sm">
                {getTimeSeriesChartData?.datasets[0]?.data.length || 0} data points
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderHeatmap = () => {
    if (!visualizationData) return null;
    const { heatmapData } = visualizationData;
    return;
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Endpoint Activity Heatmap
          </h3>
        </div>
        <div className="p-4">
          <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p>Activity Heatmap</p>
              <p className="text-sm">
                {heatmapData.endpoints.length} endpoints × {heatmapData.timeSlots.length} time slots
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderControls = () => (;);
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <select
          value={selectedTimeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportData('json')}
            className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExportData('csv')}
            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdate.toLocaleTimeString()}
        {autoRefresh && ()
          <span className="ml-2 inline-flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
            Live
          </span>
        )}
      </div>
    </div>
  );
  // ========================================
  // Main Render
  // ========================================
  if (isLoading && !currentMetrics) {
    return;
      <div className={`p-8 ${className}`}>}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
          </div>
        </div>
      </div>
    );
  return;
    <div className={`p-6 ${className} ${theme === 'dark' ? 'dark' : ''}`}>}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rate Limiting Performance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time monitoring and analytics for API rate limiting performance
          </p>
        </div>
        {/* Controls */}
        {renderControls()}
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {getMetricStats.map((stat, index) => renderMetricCard(stat, index))}
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Chart */}
          {renderTimeSeriesChart()}
          {/* Alerts Panel */}
          {renderAlerts()}
        </div>
        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap */}
          {renderHeatmap()}
          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                System Information
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-medium ${
  activeAlerts.length === 0 ? 'text-green-600 dark:text-green-400' :,
  activeAlerts.length < 3 ? 'text-yellow-600 dark:text-yellow-400' :,
  'text-red-600 dark:text-red-400',
}`}>
                    {activeAlerts.length === 0 ? 'Healthy' :
                     activeAlerts.length < 3 ? 'Warning' : 'Critical'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDuration(Date.now() - metricsService.getSystemStatus().uptime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Data Points</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metricsService.getSystemStatus().systemInfo.metricsCollected}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metricsService.getSystemStatus().systemInfo.environment}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitingMetricsDashboard;