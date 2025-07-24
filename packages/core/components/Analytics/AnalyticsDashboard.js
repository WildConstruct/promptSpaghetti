import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select.js';
import { Badge } from '../ui/Badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.js';
import { Alert, AlertDescription } from '../ui/Alert.js';
import { conversionTracker } from '../../analytics/ConversionTracker.js';
import { performanceMonitor } from '../../utils/PerformanceMonitor.js';
import { MetricsOverview } from './MetricsOverview.js';
import { PerformanceCharts } from './PerformanceCharts.js';
import { CostAnalysis } from './CostAnalysis.js';
import { UsagePatterns } from './UsagePatterns.js';
import { AlertsPanel } from './AlertsPanel.js';
import { RecommendationsPanel } from './RecommendationsPanel.js';
import { ExportOptions } from './ExportOptions.js';
import { ConversionFunnelDashboard } from './ConversionFunnelDashboard.js';
import { DirectorAnalyticsView } from './DirectorAnalyticsView.js';
import { RealTimeMetrics } from './RealTimeMetrics.js';
/**
 * Time range options
 */
const TIME_RANGES = [
    { value: 'hour', label: 'Last Hour', duration: 60 * 60 * 1000 },
    { value: '24h', label: 'Last 24 Hours', duration: 24 * 60 * 60 * 1000 },
    { value: '7d', label: 'Last 7 Days', duration: 7 * 24 * 60 * 60 * 1000 },
    { value: '30d', label: 'Last 30 Days', duration: 30 * 24 * 60 * 60 * 1000 },
    { value: '90d', label: 'Last 90 Days', duration: 90 * 24 * 60 * 60 * 1000 }
];
/**
 * Main analytics dashboard component
 */
export const AnalyticsDashboard = ({ analyticsClient, userId, organizationId, className = '', autoRefresh = true, refreshInterval = 30000 // 30 seconds
 }) => {
    const [state, setState] = useState({
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
        userRole: 'director'
    });
    const [_____selectedView, _____setSelectedView] = useState('overview');
    /**
     * Calculate time range based on selected option
     */
    const getTimeRange = useCallback((rangeKey) => {
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
            const [summaryResponse, dashboardResponse, alertsResponse, recommendationsResponse] = await Promise.all([
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
                    keyMetrics: performanceData.keyMetrics
                }
            };
            if (!summaryResponse.success) {
                throw new Error(summaryResponse.error || 'Failed to load summary');
            }
            if (!dashboardResponse.success) {
                throw new Error(dashboardResponse.error || 'Failed to load dashboard data');
            }
            setState(prev => ({
                ...prev,
                loading: false,
                summary: summaryResponse.data,
                dashboardData: dashboardResponse.data,
                alerts: alertsResponse.success ? alertsResponse.data : [],
                recommendations: recommendationsResponse.success ? recommendationsResponse.data : [],
                conversionData,
                realTimeMetrics,
                performanceData,
                lastUpdated: new Date()
            }));
        }
        catch (error) {
            console.error('Failed to load dashboard data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load dashboard data'
            }));
        }
    }, [analyticsClient, userId, organizationId, state.timeRange, getTimeRange]);
    /**
     * Handle time range change
     */
    const handleTimeRangeChange = useCallback((newRange) => {
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
    const handleAcknowledgeAlert = useCallback(async (alertId) => {
        try {
            const response = await analyticsClient.acknowledgeAlert(alertId);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    alerts: prev.alerts.filter(alert => alert.id !== alertId)
                }));
            }
        }
        catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    }, [analyticsClient]);
    /**
     * Setup auto-refresh
     */
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(loadDashboardData, refreshInterval);
            return () => clearInterval(interval);
        }
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
        return (_jsx("div", { className: `analytics-dashboard ${className}`, children: _jsxs("div", { className: "loading-container", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading analytics data..." })] }) }));
    }
    /**
     * Render error state
     */
    if (state.error) {
        return (_jsx("div", { className: `analytics-dashboard ${className}`, children: _jsx(Alert, { variant: "destructive", children: _jsxs(AlertDescription, { children: [state.error, _jsx(Button, { variant: "outline", size: "sm", onClick: handleRefresh, className: "ml-2", children: "Retry" })] }) }) }));
    }
    return (_jsxs("div", { className: `analytics-dashboard ${className}`, children: [_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-title", children: [_jsx("h1", { children: "Analytics Dashboard" }), state.lastUpdated && (_jsxs(Badge, { variant: "secondary", children: ["Last updated: ", state.lastUpdated.toLocaleTimeString()] }))] }), _jsxs("div", { className: "header-controls", children: [_jsxs(Select, { value: state.timeRange, onValueChange: handleTimeRangeChange, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Select time range" }) }), _jsx(SelectContent, { children: TIME_RANGES.map(range => (_jsx(SelectItem, { value: range.value, children: range.label }, range.value))) })] }), _jsx(Button, { variant: "outline", onClick: handleRefresh, disabled: state.loading, children: state.loading ? 'Refreshing...' : 'Refresh' }), _jsx(ExportOptions, { analyticsClient: analyticsClient, timeRange: getTimeRange(state.timeRange) })] })] }), state.alerts.length > 0 && (_jsx("div", { className: "alerts-bar", children: _jsx(AlertsPanel, { alerts: state.alerts, onAcknowledge: handleAcknowledgeAlert }) })), _jsxs(Tabs, { defaultValue: "overview", className: "dashboard-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-7 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "conversions", children: "Conversions" }), _jsx(TabsTrigger, { value: "director", children: "Director" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "costs", children: "Costs" }), _jsx(TabsTrigger, { value: "usage", children: "Usage" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: _jsxs("div", { className: "overview-grid", children: [_jsx(RealTimeMetrics, { metrics: state.realTimeMetrics, loading: state.loading }), _jsx(MetricsOverview, { summary: state.summary, dashboardData: state.dashboardData, conversionData: state.conversionData, performanceData: state.performanceData, loading: state.loading })] }) }), _jsx(TabsContent, { value: "conversions", className: "tab-content", children: _jsx(ConversionFunnelDashboard, { conversionData: state.conversionData, timeRange: getTimeRange(state.timeRange), loading: state.loading }) }), _jsx(TabsContent, { value: "director", className: "tab-content", children: _jsx(DirectorAnalyticsView, { conversionData: state.conversionData, performanceData: state.performanceData, timeRange: getTimeRange(state.timeRange), userId: userId, loading: state.loading }) }), _jsx(TabsContent, { value: "performance", className: "tab-content", children: _jsx(PerformanceCharts, { analyticsClient: analyticsClient, timeRange: getTimeRange(state.timeRange), userId: userId, organizationId: organizationId }) }), _jsx(TabsContent, { value: "costs", className: "tab-content", children: _jsx(CostAnalysis, { analyticsClient: analyticsClient, timeRange: getTimeRange(state.timeRange), userId: userId, organizationId: organizationId }) }), _jsx(TabsContent, { value: "usage", className: "tab-content", children: _jsx(UsagePatterns, { analyticsClient: analyticsClient, timeRange: getTimeRange(state.timeRange), userId: userId, organizationId: organizationId }) }), _jsx(TabsContent, { value: "insights", className: "tab-content", children: _jsx("div", { className: "insights-grid", children: _jsx(RecommendationsPanel, { recommendations: state.recommendations, analyticsClient: analyticsClient, userId: userId, organizationId: organizationId }) }) })] })] }));
};
/**
 * Analytics dashboard styles
 */
const styles = `
  .analytics-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    max-width: 100%;
    overflow: hidden;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-title h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .alerts-bar {
    margin-bottom: 1rem;
  }

  .dashboard-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tab-content {
    flex: 1;
    overflow: auto;
    padding: 1rem 0;
  }

  .overview-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .insights-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .header-controls {
      justify-content: space-between;
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }
  }
`;
// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
export default AnalyticsDashboard;
