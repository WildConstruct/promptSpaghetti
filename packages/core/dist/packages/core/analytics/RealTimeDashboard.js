import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Real-time Analytics Dashboard - Story 1.5 Task 4
 *
 * Consolidated real-time dashboard integrating all 12+ analytics systems
 * through the unified event bus with WebSocket streaming and performance widgets.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnalyticsEventType, EventCategory } from './UnifiedEventBus';
import './RealTimeDashboard.css';
// Widget Types
export var WidgetType;
(function (WidgetType) {
    WidgetType["EVENT_STREAM"] = "event_stream";
    WidgetType["METRICS_SUMMARY"] = "metrics_summary";
    WidgetType["TIME_SERIES_CHART"] = "time_series_chart";
    WidgetType["HEAT_MAP"] = "heat_map";
    WidgetType["TOP_SOURCES"] = "top_sources";
    WidgetType["ERROR_RATE"] = "error_rate";
    WidgetType["PERFORMANCE_METRICS"] = "performance_metrics";
    WidgetType["USER_ACTIVITY"] = "user_activity";
    WidgetType["SYSTEM_HEALTH"] = "system_health";
    WidgetType["COST_TRACKING"] = "cost_tracking";
    WidgetType["INTEGRATION_STATUS"] = "integration_status";
    WidgetType["SECURITY_EVENTS"] = "security_events";
})(WidgetType || (WidgetType = {}));
/**
 * Real-time Analytics Dashboard Component
 */
export const RealTimeDashboard = ({ eventBus, eventRepository, authService, authContext, config: configOverride = {}, onWidgetError }) => {
    // Configuration
    const config = useMemo(() => ({
        refreshInterval: 5000,
        maxEventsDisplay: 100,
        enableWebSocket: true,
        enableAutoRefresh: true,
        defaultTimeRange: 24,
        widgetLayout: 'grid',
        theme: 'light',
        ...configOverride
    }), [configOverride]);
    // State
    const [dashboardMetrics, setDashboardMetrics] = useState({
        totalEvents: 0,
        eventsPerSecond: 0,
        activeUsers: 0,
        activeSessions: 0,
        errorRate: 0,
        systemHealth: 100,
        integrationStatus: {},
        topSources: [],
        recentEvents: []
    });
    const [widgets, setWidgets] = useState([]);
    const [timeSeriesData, setTimeSeriesData] = useState({});
    const [heatMapData, setHeatMapData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // WebSocket connection for real-time updates
    const [eventStream, setEventStream] = useState(null);
    /**
     * Initialize dashboard
     */
    useEffect(() => {
        initializeDashboard();
        return () => {
            if (eventStream) {
                eventStream.removeEventListener('event', handleRealTimeEvent);
            }
        };
    }, []);
    /**
     * Initialize dashboard configuration and widgets
     */
    const initializeDashboard = async () => {
        try {
            setLoading(true);
            // Check dashboard access authorization
            const dashboardAuth = await authService.authorizeDashboardAccess('user', authContext);
            if (!dashboardAuth.allowed) {
                setError(`Dashboard access denied: ${dashboardAuth.reason}`);
                return;
            }
            // Initialize default widgets based on user permissions
            const defaultWidgets = await createDefaultWidgets();
            setWidgets(defaultWidgets);
            // Setup real-time event stream if enabled
            if (config.enableWebSocket) {
                await setupEventStream();
            }
            // Initial data load
            await refreshDashboardData();
            setLoading(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize dashboard');
            setLoading(false);
        }
    };
    /**
     * Create default widgets based on user permissions
     */
    const createDefaultWidgets = async () => {
        const authSummary = authService.getAuthorizationSummary(authContext);
        const widgets = [];
        // Event Stream Widget (always available if user can view events)
        if (authSummary.capabilities.canViewEvents) {
            widgets.push({
                id: 'event-stream',
                type: WidgetType.EVENT_STREAM,
                title: 'Recent Events',
                position: { x: 0, y: 0, width: 6, height: 8 },
                enabled: true,
                collapsed: false,
                refreshRate: 2000
            });
        }
        // Metrics Summary Widget
        if (authSummary.capabilities.canViewAnalytics) {
            widgets.push({
                id: 'metrics-summary',
                type: WidgetType.METRICS_SUMMARY,
                title: 'Analytics Summary',
                position: { x: 6, y: 0, width: 6, height: 4 },
                enabled: true,
                collapsed: false
            });
        }
        // Performance Metrics Widget
        widgets.push({
            id: 'performance-metrics',
            type: WidgetType.PERFORMANCE_METRICS,
            title: 'Performance Metrics',
            position: { x: 0, y: 8, width: 4, height: 6 },
            filter: { categories: [EventCategory.PERFORMANCE] },
            enabled: true,
            collapsed: false,
            chartType: 'line',
            timeGranularity: 'minute'
        });
        // Error Rate Widget
        widgets.push({
            id: 'error-rate',
            type: WidgetType.ERROR_RATE,
            title: 'Error Rate',
            position: { x: 4, y: 8, width: 4, height: 6 },
            enabled: true,
            collapsed: false,
            chartType: 'area'
        });
        // User Activity Widget
        widgets.push({
            id: 'user-activity',
            type: WidgetType.USER_ACTIVITY,
            title: 'User Activity',
            position: { x: 8, y: 8, width: 4, height: 6 },
            filter: { categories: [EventCategory.USER] },
            enabled: true,
            collapsed: false,
            chartType: 'bar'
        });
        // System Health Widget (admin only)
        if (authSummary.capabilities.canViewAdminDashboard) {
            widgets.push({
                id: 'system-health',
                type: WidgetType.SYSTEM_HEALTH,
                title: 'System Health',
                position: { x: 6, y: 4, width: 6, height: 4 },
                enabled: true,
                collapsed: false
            });
        }
        // Integration Status Widget
        widgets.push({
            id: 'integration-status',
            type: WidgetType.INTEGRATION_STATUS,
            title: 'Integration Status',
            position: { x: 0, y: 14, width: 6, height: 4 },
            filter: { categories: [EventCategory.INTEGRATION] },
            enabled: true,
            collapsed: false
        });
        // Security Events Widget (if user has security permissions)
        if (authSummary.capabilities.canViewEvents) {
            widgets.push({
                id: 'security-events',
                type: WidgetType.SECURITY_EVENTS,
                title: 'Security Events',
                position: { x: 6, y: 14, width: 6, height: 4 },
                filter: {
                    types: [AnalyticsEventType.SECURITY_EVENT, AnalyticsEventType.FRAUD_DETECTION],
                    categories: [EventCategory.SECURITY]
                },
                enabled: true,
                collapsed: false
            });
        }
        return widgets;
    };
    /**
     * Setup real-time event stream
     */
    const setupEventStream = async () => {
        try {
            // Get authorized filter for user
            const queryAuth = await authService.authorizeAnalyticsQuery({}, authContext);
            if (!queryAuth.allowed) {
                console.warn('Real-time stream access denied');
                return;
            }
            // Create event stream with user's authorized filter
            const stream = eventBus.getEventStream(queryAuth.filteredQuery || {});
            setEventStream(stream);
            stream.addEventListener('event', handleRealTimeEvent);
            setIsConnected(true);
            console.log('Real-time event stream connected');
        }
        catch (err) {
            console.error('Failed to setup event stream:', err);
            setIsConnected(false);
        }
    };
    /**
     * Handle real-time event updates
     */
    const handleRealTimeEvent = useCallback((event) => {
        const analyticsEvent = event.detail;
        // Update dashboard metrics with new event
        setDashboardMetrics(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            recentEvents: [analyticsEvent, ...prev.recentEvents.slice(0, config.maxEventsDisplay - 1)]
        }));
        // Update time series data for relevant widgets
        updateTimeSeriesData(analyticsEvent);
        setLastUpdate(Date.now());
    }, [config.maxEventsDisplay]);
    /**
     * Update time series data with new event
     */
    const updateTimeSeriesData = (event) => {
        const timestamp = event.timestamp;
        setTimeSeriesData(prev => {
            const updated = { ...prev };
            // Update data for each widget that tracks time series
            widgets.forEach(widget => {
                if (widget.type === WidgetType.TIME_SERIES_CHART ||
                    widget.type === WidgetType.PERFORMANCE_METRICS ||
                    widget.type === WidgetType.ERROR_RATE) {
                    if (!updated[widget.id])
                        updated[widget.id] = [];
                    // Add new data point
                    updated[widget.id] = [
                        ...updated[widget.id],
                        { timestamp, value: 1, label: event.type }
                    ].slice(-100); // Keep last 100 points
                }
            });
            return updated;
        });
    };
    /**
     * Refresh dashboard data
     */
    const refreshDashboardData = async () => {
        try {
            const now = Date.now();
            const timeRange = config.defaultTimeRange * 60 * 60 * 1000; // Convert hours to milliseconds
            const startTime = now - timeRange;
            // Get authorized filter for queries
            const queryAuth = await authService.authorizeAnalyticsQuery({
                startTime,
                endTime: now
            }, authContext);
            if (!queryAuth.allowed) {
                setError('Analytics query access denied');
                return;
            }
            const filter = queryAuth.filteredQuery;
            // Get dashboard statistics
            const [events, statistics] = await Promise.all([
                eventRepository.findMany({
                    filter,
                    limit: config.maxEventsDisplay,
                    sortBy: 'timestamp',
                    sortOrder: 'desc'
                }),
                eventRepository.getStatistics(filter)
            ]);
            // Calculate metrics
            const eventsPerSecond = statistics.totalEvents / (timeRange / 1000);
            const errorEvents = events.filter(e => e.severity === 'error' || e.severity === 'critical');
            const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;
            const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
            const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;
            // Calculate top sources
            const sourceCounts = statistics.eventsBySource;
            const totalSourceEvents = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
            const topSources = Object.entries(sourceCounts)
                .map(([source, count]) => ({
                source,
                count,
                percentage: totalSourceEvents > 0 ? (count / totalSourceEvents) * 100 : 0
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            // Calculate integration status
            const integrationEvents = events.filter(e => e.category === EventCategory.INTEGRATION);
            const integrationStatus = {};
            const integrationSources = new Set(integrationEvents.map(e => e.source));
            integrationSources.forEach(source => {
                const sourceEvents = integrationEvents.filter(e => e.source === source);
                const errorCount = sourceEvents.filter(e => e.severity === 'error' || e.severity === 'critical').length;
                const errorRate = sourceEvents.length > 0 ? (errorCount / sourceEvents.length) * 100 : 0;
                if (errorRate < 1)
                    integrationStatus[source] = 'healthy';
                else if (errorRate < 10)
                    integrationStatus[source] = 'degraded';
                else
                    integrationStatus[source] = 'failing';
            });
            // Calculate system health score
            const systemHealth = Math.max(0, 100 - errorRate - (eventsPerSecond > 1000 ? 10 : 0));
            // Update dashboard metrics
            setDashboardMetrics({
                totalEvents: statistics.totalEvents,
                eventsPerSecond: Math.round(eventsPerSecond * 100) / 100,
                activeUsers: uniqueUsers,
                activeSessions: uniqueSessions,
                errorRate: Math.round(errorRate * 100) / 100,
                systemHealth: Math.round(systemHealth),
                integrationStatus,
                topSources,
                recentEvents: events
            });
            // Update time series data for widgets
            await updateWidgetTimeSeriesData(filter);
            setLastUpdate(now);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh dashboard data');
            if (onWidgetError) {
                onWidgetError('dashboard', err instanceof Error ? err : new Error(String(err)));
            }
        }
    };
    /**
     * Update time series data for widgets
     */
    const updateWidgetTimeSeriesData = async (filter) => {
        const timeSeriesPromises = widgets
            .filter(widget => widget.type === WidgetType.TIME_SERIES_CHART ||
            widget.type === WidgetType.PERFORMANCE_METRICS ||
            widget.type === WidgetType.ERROR_RATE)
            .map(async (widget) => {
            try {
                const widgetFilter = { ...filter, ...widget.filter };
                const data = await eventRepository.getTimeSeriesData('count', widget.timeGranularity || 'hour', widgetFilter);
                return {
                    widgetId: widget.id,
                    data: data.map(point => ({
                        timestamp: point.timestamp,
                        value: point.value,
                        label: widget.title
                    }))
                };
            }
            catch (err) {
                console.error(`Failed to update time series for widget ${widget.id}:`, err);
                return { widgetId: widget.id, data: [] };
            }
        });
        const results = await Promise.all(timeSeriesPromises);
        setTimeSeriesData(prev => {
            const updated = { ...prev };
            results.forEach(result => {
                updated[result.widgetId] = result.data;
            });
            return updated;
        });
    };
    /**
     * Auto-refresh effect
     */
    useEffect(() => {
        if (!config.enableAutoRefresh)
            return;
        const interval = setInterval(() => {
            refreshDashboardData();
        }, config.refreshInterval);
        return () => clearInterval(interval);
    }, [config.enableAutoRefresh, config.refreshInterval]);
    /**
     * Widget management functions
     */
    const toggleWidget = (widgetId) => {
        setWidgets(prev => prev.map(widget => widget.id === widgetId
            ? { ...widget, collapsed: !widget.collapsed }
            : widget));
    };
    const removeWidget = (widgetId) => {
        setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    };
    const updateWidgetPosition = (widgetId, position) => {
        setWidgets(prev => prev.map(widget => widget.id === widgetId
            ? { ...widget, position }
            : widget));
    };
    /**
     * Render loading state
     */
    if (loading) {
        return (_jsxs("div", { className: "dashboard-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading dashboard..." })] }));
    }
    /**
     * Render error state
     */
    if (error) {
        return (_jsxs("div", { className: "dashboard-error", children: [_jsx("h3", { children: "Dashboard Error" }), _jsx("p", { children: error }), _jsx("button", { onClick: () => {
                        setError(null);
                        initializeDashboard();
                    }, children: "Retry" })] }));
    }
    /**
     * Main dashboard render
     */
    return (_jsxs("div", { className: `real-time-dashboard theme-${config.theme}`, children: [_jsx(DashboardHeader, { metrics: dashboardMetrics, isConnected: isConnected, lastUpdate: lastUpdate, onRefresh: refreshDashboardData }), _jsx("div", { className: `dashboard-grid layout-${config.widgetLayout}`, children: widgets.map(widget => (_jsx(DashboardWidget, { config: widget, metrics: dashboardMetrics, timeSeriesData: timeSeriesData[widget.id] || [], heatMapData: heatMapData, onToggle: () => toggleWidget(widget.id), onRemove: () => removeWidget(widget.id), onPositionChange: (position) => updateWidgetPosition(widget.id, position), onError: (error) => onWidgetError?.(widget.id, error) }, widget.id))) }), _jsx(DashboardFooter, { totalEvents: dashboardMetrics.totalEvents, systemHealth: dashboardMetrics.systemHealth, lastUpdate: lastUpdate })] }));
};
/**
 * Dashboard Header Component
 */
const DashboardHeader = ({ metrics, isConnected, lastUpdate, onRefresh }) => (_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-left", children: [_jsx("h1", { children: "Analytics Dashboard" }), _jsxs("div", { className: "connection-status", children: [_jsx("span", { className: `status-indicator ${isConnected ? 'connected' : 'disconnected'}` }), isConnected ? 'Live' : 'Offline'] })] }), _jsx("div", { className: "header-center", children: _jsxs("div", { className: "metric-badges", children: [_jsxs("div", { className: "metric-badge", children: [_jsx("span", { className: "metric-value", children: metrics.totalEvents.toLocaleString() }), _jsx("span", { className: "metric-label", children: "Total Events" })] }), _jsxs("div", { className: "metric-badge", children: [_jsx("span", { className: "metric-value", children: metrics.eventsPerSecond }), _jsx("span", { className: "metric-label", children: "Events/sec" })] }), _jsxs("div", { className: "metric-badge", children: [_jsx("span", { className: "metric-value", children: metrics.activeUsers }), _jsx("span", { className: "metric-label", children: "Active Users" })] }), _jsxs("div", { className: "metric-badge error-rate", children: [_jsxs("span", { className: "metric-value", children: [metrics.errorRate, "%"] }), _jsx("span", { className: "metric-label", children: "Error Rate" })] })] }) }), _jsxs("div", { className: "header-right", children: [_jsxs("div", { className: "last-update", children: ["Last update: ", lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'] }), _jsx("button", { className: "refresh-button", onClick: onRefresh, children: "Refresh" })] })] }));
/**
 * Dashboard Widget Component
 */
const DashboardWidget = ({ config, metrics, timeSeriesData, heatMapData, onToggle, onRemove, onError }) => {
    const renderWidgetContent = () => {
        try {
            switch (config.type) {
                case WidgetType.EVENT_STREAM:
                    return _jsx(EventStreamWidget, { events: metrics.recentEvents });
                case WidgetType.METRICS_SUMMARY:
                    return _jsx(MetricsSummaryWidget, { metrics: metrics });
                case WidgetType.TIME_SERIES_CHART:
                case WidgetType.PERFORMANCE_METRICS:
                case WidgetType.ERROR_RATE:
                    return _jsx(TimeSeriesWidget, { data: timeSeriesData, chartType: config.chartType });
                case WidgetType.TOP_SOURCES:
                    return _jsx(TopSourcesWidget, { sources: metrics.topSources });
                case WidgetType.INTEGRATION_STATUS:
                    return _jsx(IntegrationStatusWidget, { status: metrics.integrationStatus });
                case WidgetType.SYSTEM_HEALTH:
                    return _jsx(SystemHealthWidget, { health: metrics.systemHealth });
                case WidgetType.USER_ACTIVITY:
                    return _jsx(UserActivityWidget, { activeUsers: metrics.activeUsers, activeSessions: metrics.activeSessions });
                case WidgetType.SECURITY_EVENTS:
                    return _jsx(SecurityEventsWidget, { events: metrics.recentEvents.filter(e => e.category === EventCategory.SECURITY) });
                default:
                    return _jsx("div", { className: "widget-placeholder", children: "Widget type not implemented" });
            }
        }
        catch (error) {
            onError(error instanceof Error ? error : new Error(String(error)));
            return _jsx("div", { className: "widget-error", children: "Error loading widget" });
        }
    };
    return (_jsxs("div", { className: `dashboard-widget ${config.collapsed ? 'collapsed' : ''}`, style: {
            gridColumn: `${config.position.x + 1} / span ${config.position.width}`,
            gridRow: `${config.position.y + 1} / span ${config.position.height}`
        }, children: [_jsxs("div", { className: "widget-header", children: [_jsx("h3", { children: config.title }), _jsxs("div", { className: "widget-controls", children: [_jsx("button", { onClick: onToggle, children: config.collapsed ? '▼' : '▲' }), _jsx("button", { onClick: onRemove, children: "\u00D7" })] })] }), !config.collapsed && (_jsx("div", { className: "widget-content", children: renderWidgetContent() }))] }));
};
/**
 * Individual Widget Components
 */
const EventStreamWidget = ({ events }) => (_jsx("div", { className: "event-stream", children: events.map(event => (_jsxs("div", { className: `event-item severity-${event.severity}`, children: [_jsx("div", { className: "event-time", children: new Date(event.timestamp).toLocaleTimeString() }), _jsx("div", { className: "event-type", children: event.type }), _jsx("div", { className: "event-source", children: event.source }), _jsx("div", { className: "event-message", children: event.data.message || event.data.operation || 'Event occurred' })] }, event.id))) }));
const MetricsSummaryWidget = ({ metrics }) => (_jsx("div", { className: "metrics-summary", children: _jsxs("div", { className: "summary-grid", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-value", children: metrics.totalEvents.toLocaleString() }), _jsx("span", { className: "summary-label", children: "Total Events" })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-value", children: metrics.eventsPerSecond }), _jsx("span", { className: "summary-label", children: "Events/Second" })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-value", children: metrics.activeUsers }), _jsx("span", { className: "summary-label", children: "Active Users" })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-value", children: metrics.activeSessions }), _jsx("span", { className: "summary-label", children: "Active Sessions" })] }), _jsxs("div", { className: "summary-item error", children: [_jsxs("span", { className: "summary-value", children: [metrics.errorRate, "%"] }), _jsx("span", { className: "summary-label", children: "Error Rate" })] }), _jsxs("div", { className: "summary-item health", children: [_jsxs("span", { className: "summary-value", children: [metrics.systemHealth, "%"] }), _jsx("span", { className: "summary-label", children: "System Health" })] })] }) }));
const TimeSeriesWidget = ({ data, chartType = 'line' }) => (_jsx("div", { className: "time-series-widget", children: _jsx("div", { className: "chart-placeholder", children: _jsxs("div", { className: "chart-info", children: [_jsxs("p", { children: ["Chart Type: ", chartType] }), _jsxs("p", { children: ["Data Points: ", data.length] }), data.length > 0 && (_jsxs("p", { children: ["Latest Value: ", data[data.length - 1]?.value] }))] }) }) }));
const TopSourcesWidget = ({ sources }) => (_jsx("div", { className: "top-sources", children: sources.map(source => (_jsxs("div", { className: "source-item", children: [_jsx("div", { className: "source-name", children: source.source }), _jsx("div", { className: "source-bar", children: _jsx("div", { className: "source-fill", style: { width: `${source.percentage}%` } }) }), _jsx("div", { className: "source-count", children: source.count })] }, source.source))) }));
const IntegrationStatusWidget = ({ status }) => (_jsx("div", { className: "integration-status", children: Object.entries(status).map(([integration, health]) => (_jsxs("div", { className: `integration-item status-${health}`, children: [_jsx("span", { className: "integration-name", children: integration }), _jsx("span", { className: `status-badge ${health}`, children: health })] }, integration))) }));
const SystemHealthWidget = ({ health }) => (_jsxs("div", { className: "system-health", children: [_jsxs("div", { className: "health-circle", children: [_jsxs("div", { className: "health-percentage", children: [health, "%"] }), _jsx("div", { className: "health-label", children: "System Health" })] }), _jsx("div", { className: `health-status ${health > 90 ? 'healthy' : health > 70 ? 'warning' : 'critical'}`, children: health > 90 ? 'Healthy' : health > 70 ? 'Warning' : 'Critical' })] }));
const UserActivityWidget = ({ activeUsers, activeSessions }) => (_jsxs("div", { className: "user-activity", children: [_jsxs("div", { className: "activity-metric", children: [_jsx("span", { className: "metric-number", children: activeUsers }), _jsx("span", { className: "metric-text", children: "Active Users" })] }), _jsxs("div", { className: "activity-metric", children: [_jsx("span", { className: "metric-number", children: activeSessions }), _jsx("span", { className: "metric-text", children: "Active Sessions" })] }), _jsx("div", { className: "activity-ratio", children: _jsxs("span", { className: "ratio-text", children: ["Avg ", activeSessions > 0 ? (activeSessions / Math.max(activeUsers, 1)).toFixed(1) : 0, " sessions per user"] }) })] }));
const SecurityEventsWidget = ({ events }) => (_jsx("div", { className: "security-events", children: events.length === 0 ? (_jsx("div", { className: "no-events", children: "No security events" })) : (events.slice(0, 5).map(event => (_jsxs("div", { className: `security-event severity-${event.severity}`, children: [_jsx("div", { className: "event-type", children: event.type }), _jsx("div", { className: "event-time", children: new Date(event.timestamp).toLocaleTimeString() }), _jsx("div", { className: "event-details", children: event.data.riskLevel && (_jsx("span", { className: `risk-level ${event.data.riskLevel}`, children: event.data.riskLevel })) })] }, event.id)))) }));
/**
 * Dashboard Footer Component
 */
const DashboardFooter = ({ totalEvents, systemHealth, lastUpdate }) => (_jsx("div", { className: "dashboard-footer", children: _jsxs("div", { className: "footer-info", children: [_jsxs("span", { children: ["Total Events: ", totalEvents.toLocaleString()] }), _jsxs("span", { children: ["System Health: ", systemHealth, "%"] }), _jsxs("span", { children: ["Last Updated: ", new Date(lastUpdate).toLocaleString()] })] }) }));
export default RealTimeDashboard;
