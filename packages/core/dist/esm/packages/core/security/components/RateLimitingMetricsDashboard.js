import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Rate Limiting Metrics Dashboard Component
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * Interactive React dashboard for visualizing rate limiting performance metrics
 * with real-time updates, customizable widgets, and alert management.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
 > ;
{
    // State management
    const [currentMetrics, setCurrentMetrics] = useState(null);
    const [visualizationData, setVisualizationData] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
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
        }
        catch (error) {
            console.error('Error loading metrics data:', error);
        }
        finally {
            setIsLoading(false);
        }
        [metricsService, selectedTimeRange];
    });
    // Set up auto-refresh
    useEffect(() => {
        loadMetricsData();
        if (autoRefresh) {
            const interval = setInterval(loadMetricsData, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
        [loadMetricsData, autoRefresh, refreshInterval];
    });
    // Listen for real-time updates
    useEffect(() => {
        const handleMetricsUpdate = () => {
            loadMetricsData();
        };
        const handleAlertCreated = (alert) => {
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
    const formatNumber = useCallback((value, decimals = 1) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(decimals)}M`;
        }
    });
    if (value >= 1000) {
        return `${(value / 1000).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
}
[];
;
const formatDuration = useCallback((milliseconds) => {
    if (milliseconds < 1000) {
        return `${milliseconds.toFixed(0)}ms`;
    }
});
if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
}
{
    return `${(milliseconds / 60000).toFixed(1)}m`;
}
[];
;
const getMetricStats = useMemo(() => {
    if (!currentMetrics)
        return [];
    return [
        {
            label: 'Requests/sec',
            value: formatNumber(currentMetrics.throughput.requestsPerSecond),
            unit: 'rps',
            trend: 'stable',
            severity: currentMetrics.throughput.requestsPerSecond > 1000 ? 'normal' : 'warning',
        },
        {
            label: 'Avg Response Time',
            value: formatDuration(currentMetrics.responseTime.average),
            trend: 'stable',
            severity: currentMetrics.responseTime.average > 200 ? 'critical' : ,
            currentMetrics, : .responseTime.average > 100 ? 'warning' : 'normal',
        },
        {
            label: 'Block Rate',
            value: currentMetrics.errorRates.blockRate.toFixed(1),
            unit: '%',
            trend: 'down',
            severity: currentMetrics.errorRates.blockRate > 25 ? 'critical' : ,
            currentMetrics, : .errorRates.blockRate > 10 ? 'warning' : 'normal',
        },
        {
            label: 'Error Rate',
            value: currentMetrics.errorRates.errorRate.toFixed(1),
            unit: '%',
            trend: 'stable',
            severity: currentMetrics.errorRates.errorRate > 10 ? 'critical' : ,
            currentMetrics, : .errorRates.errorRate > 5 ? 'warning' : 'normal',
        },
        {
            label: 'Memory Usage',
            value: formatNumber(currentMetrics.resourceUtilization.memoryUsage),
            unit: 'MB',
            trend: 'up',
            severity: currentMetrics.resourceUtilization.memoryUsage > 1000 ? 'warning' : 'normal',
        },
        {
            label: 'Active Connections',
            value: formatNumber(currentMetrics.resourceUtilization.activeConnections),
            trend: 'stable',
            severity: 'normal'
        }
    ];
}, [currentMetrics, formatNumber, formatDuration]);
const getTimeSeriesChartData = useMemo(() => {
    if (!visualizationData)
        return null;
    const { timeSeriesData } = visualizationData;
    return {
        labels: timeSeriesData.timestamps.map(ts => ),
        new: Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}), datasets;
 === 'dark' ? '#60A5FA' : '#2563EB',
    backgroundColor;
theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
    fill;
true,
;
{
    label: 'Requests/sec',
        data;
    timeSeriesData.throughput,
        borderColor;
    theme === 'dark' ? '#34D399' : '#059669',
        backgroundColor;
    theme === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        fill;
    false;
    ;
}
;
[visualizationData, theme];
;
return {
    labels: Object.keys(distribution),
    datasets: [{},
        data, Object.values(distribution),
        backgroundColor, [
            '#10B981', // LOW - Green
            '#F59E0B', // MEDIUM - Yellow
            '#EF4444', // HIGH - Red
            '#DC2626' // CRITICAL - Dark Red
        ]]
};
;
[visualizationData];
;
// ========================================
// Event Handlers
// ========================================
const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
};
const handleAlertAcknowledge = (alertId) => {
    metricsService.acknowledgeAlert(alertId);
    setActiveAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
};
const handleExportData = (format) => {
    const exportData = metricsService.exportMetrics(format);
    const blob = new Blob([exportData], {});
    type: format === 'json' ? 'application/json' : 'text/csv',
    ;
};
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `rate-limiting-metrics-${new Date().toISOString().split('T')[0]}.${format}`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
;
// ========================================
// Render Methods
// ========================================
const renderMetricCard = (stat, index) => ();
;
_jsxs("div", { className: `
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4
        ${stat.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
        ${stat.severity === 'warning' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}
      `, children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: stat.label }), _jsxs("div", { className: "flex items-baseline space-x-1", children: [_jsx("p", { className: `text-2xl font-semibold ${stat.severity === 'critical' ? 'text-red-600 dark:text-red-400' : ,
                                    stat.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ,
                                    'text-gray-900 dark:text-white',
                                }`, children: stat.value }), stat.unit && ()
                                < span, " className=\"text-sm text-gray-500 dark:text-gray-400\">", stat.unit] }), ")}"] }) }), stat.trend && ()
            < div, " className=", `
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${stat.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
            ${stat.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
            ${stat.trend === 'stable' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
          `, ">", stat.trend === 'up' && '↗', stat.trend === 'down' && '↘', stat.trend === 'stable' && '→', stat.trend] }, index);
div >
;
div >
;
;
const renderAlerts = () => ();
;
_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: _jsxs("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: ["Active Alerts (", activeAlerts.length, ")"] }) }), _jsxs("div", { className: "p-4", children: [activeAlerts.length === 0 ? ()
                    < p : , " className=\"text-sm text-gray-500 dark:text-gray-400\"> No active alerts"] }), ") : ()", _jsxs("div", { className: "space-y-3", children: [activeAlerts.map((alert) => ()
                    < div, key = { alert, : .alertId }, className = {} `
                  p-3 rounded-lg border-l-4 
                  ${alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                  ${alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}
                  ${alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                  ${alert.severity === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                `), ">", _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: alert.condition }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: [", Current: ", alert.currentValue.toFixed(2), " | Threshold: ", alert.threshold] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: alert.timestamp.toLocaleString() })] }), _jsx("button", { onClick: () => handleAlertAcknowledge(alert.alertId), className: "ml-3 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300", children: "Acknowledge" })] })] }), "))}"] });
div >
;
div >
;
;
const renderTimeSeriesChart = () => {
    if (!getTimeSeriesChartData)
        return null;
    return;
    _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Performance Trends" }) }), _jsx("div", { className: "p-4", children: _jsx("div", { className: "h-64 flex items-center justify-center text-gray-500 dark:text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDCCA" }), _jsx("p", { children: "Time Series Chart" }), _jsxs("p", { className: "text-sm", children: [getTimeSeriesChartData?.datasets[0]?.data.length || 0, " data points"] })] }) }) })] });
};
;
;
const renderHeatmap = () => {
    if (!visualizationData)
        return null;
    const { heatmapData } = visualizationData;
    return;
    _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Endpoint Activity Heatmap" }) }), _jsx("div", { className: "p-4", children: _jsx("div", { className: "h-48 flex items-center justify-center text-gray-500 dark:text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDD25" }), _jsx("p", { children: "Activity Heatmap" }), _jsxs("p", { className: "text-sm", children: [heatmapData.endpoints.length, " endpoints \u00D7 ", heatmapData.timeSlots.length, " time slots"] })] }) }) })] });
};
;
;
const renderControls = () => ();
;
_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("select", { value: selectedTimeRange, onChange: (e) => handleTimeRangeChange(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm", children: [_jsx("option", { value: "1h", children: "Last Hour" }), _jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last 7 Days" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleExportData('json'), className: "px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md", children: "Export JSON" }), _jsx("button", { onClick: () => handleExportData('csv'), className: "px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md", children: "Export CSV" })] })] }), _jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Last updated: ", lastUpdate.toLocaleTimeString(), autoRefresh && ()
                    < span, " className=\"ml-2 inline-flex items-center\">", _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" }), "Live"] }), ")}"] });
div >
;
;
// ========================================
// Main Render
// ========================================
if (isLoading && !currentMetrics) {
    return;
    _jsxs("div", { className: `p-8 ${className}`, children: ["}", _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Loading metrics..." })] }) })] });
    ;
    return;
    _jsxs("div", { className: `p-6 ${className} ${theme === 'dark' ? 'dark' : ''}`, children: ["}", _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Rate Limiting Performance Dashboard" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mt-2", children: "Real-time monitoring and analytics for API rate limiting performance" })] }), renderControls(), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6", children: getMetricStats.map((stat, index) => renderMetricCard(stat, index)) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [renderTimeSeriesChart(), renderAlerts()] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [renderHeatmap(), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "System Information" }) }), _jsx("div", { className: "p-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Status" }), _jsx("span", { className: `text-sm font-medium ${activeAlerts.length === 0 ? 'text-green-600 dark:text-green-400' : ,
                                                                activeAlerts.length < 3 ? 'text-yellow-600 dark:text-yellow-400' : ,
                                                                'text-red-600 dark:text-red-400',
                                                            }`, children: activeAlerts.length === 0 ? 'Healthy' :
                                                                activeAlerts.length < 3 ? 'Warning' : 'Critical' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Uptime" }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: formatDuration(Date.now() - metricsService.getSystemStatus().uptime) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Data Points" }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: metricsService.getSystemStatus().systemInfo.metricsCollected })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Environment" }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: metricsService.getSystemStatus().systemInfo.environment })] })] }) })] })] })] })] });
    ;
}
;
export default RateLimitingMetricsDashboard;
