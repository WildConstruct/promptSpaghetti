import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Real-time Monitoring Dashboard Component
 * Displays system health, performance metrics, and alerts
 */
import { useEffect, useState } from 'react';
import { monitoring, analytics, errorTracker } from './MonitoringService';
import { apm } from './APMService';
/**
 * Monitoring Dashboard Component
 */
export const MonitoringDashboard = ({ refreshInterval = 5, compactView = false, }) => {
    const [metrics, setMetrics] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [uptimeChecks, setUptimeChecks] = useState([]);
    const [performanceReport, setPerformanceReport] = useState(null);
    const [errorStats, setErrorStats] = useState(null);
    const [funnelConversions, setFunnelConversions] = useState({});
    useEffect(() => {
        const updateData = () => {
            // Get performance metrics
            const pageLoadStats = monitoring.getMetricStats('page.load.time', 5);
            const apiResponseStats = monitoring.getMetricStats('api.response.time', 5);
            const errorRateStats = monitoring.getMetricStats('error.rate', 5);
            const memoryStats = monitoring.getMetricStats('memory.usage', 5);
            // Build metric cards
            const newMetrics = [
                {
                    title: 'Page Load Time',
                    value: pageLoadStats?.avg.toFixed(0) || '0',
                    unit: 'ms',
                    status: getMetricStatus(pageLoadStats?.avg || 0, 2000, 3000),
                    trend: getTrend(pageLoadStats),
                },
                {
                    title: 'API Response Time',
                    value: apiResponseStats?.avg.toFixed(0) || '0',
                    unit: 'ms',
                    status: getMetricStatus(apiResponseStats?.avg || 0, 200, 500),
                    trend: getTrend(apiResponseStats),
                },
                {
                    title: 'Error Rate',
                    value: errorRateStats?.avg.toFixed(2) || '0',
                    unit: '%',
                    status: getMetricStatus(errorRateStats?.avg || 0, 0.1, 1, true),
                    trend: getTrend(errorRateStats),
                },
                {
                    title: 'Memory Usage',
                    value: formatBytes(memoryStats?.avg || 0),
                    unit: '',
                    status: getMetricStatus(memoryStats?.avg || 0, 512 * 1024 * 1024, 768 * 1024 * 1024),
                    trend: getTrend(memoryStats),
                },
            ];
            setMetrics(newMetrics);
            // Get active alerts
            setAlerts(monitoring.getActiveAlerts());
            // Get uptime status
            setUptimeChecks(apm.getUptimeStatus());
            // Get performance report
            setPerformanceReport(apm.getPerformanceReport());
            // Get error statistics
            setErrorStats(errorTracker.getErrorStats(1));
            // Get funnel conversions
            setFunnelConversions(analytics.getFunnelConversion('epic1-demo', [
                'view',
                'interact',
                'complete',
            ], 24));
        };
        updateData();
        const interval = setInterval(updateData, refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [refreshInterval]);
    const getMetricStatus = (value, warningThreshold, criticalThreshold, reverse = false) => {
        if (reverse) {
            if (value >= criticalThreshold)
                return 'critical';
            if (value >= warningThreshold)
                return 'warning';
            return 'good';
        }
        else {
            if (value >= criticalThreshold)
                return 'critical';
            if (value >= warningThreshold)
                return 'warning';
            return 'good';
        }
    };
    const getTrend = (stats) => {
        if (!stats)
            return 'stable';
        // Simple trend: compare current avg to previous period
        // In production, would use more sophisticated trending
        return 'stable';
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const statusColors = {
        good: '#10b981',
        warning: '#f59e0b',
        critical: '#ef4444',
    };
    if (compactView) {
        return (_jsxs("div", { style: {
                backgroundColor: '#1f2937',
                color: '#f3f4f6',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
            }, children: [_jsx("div", { style: { marginBottom: '8px', fontWeight: 'bold' }, children: "System Status" }), _jsx("div", { style: { display: 'flex', gap: '16px', flexWrap: 'wrap' }, children: metrics.map((metric, index) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("div", { style: {
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: statusColors[metric.status],
                                } }), _jsxs("span", { children: [metric.title, ":"] }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [metric.value, metric.unit] })] }, index))) }), alerts.length > 0 && (_jsxs("div", { style: {
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#dc2626',
                        borderRadius: '4px',
                        fontSize: '12px',
                    }, children: [alerts.length, " active alert", alerts.length > 1 ? 's' : ''] }))] }));
    }
    return (_jsxs("div", { style: {
            backgroundColor: '#1f2937',
            color: '#f3f4f6',
            padding: '24px',
            borderRadius: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }, children: [_jsx("h2", { style: { marginTop: 0, marginBottom: '24px' }, children: "Monitoring Dashboard" }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px',
                }, children: metrics.map((metric, index) => (_jsxs("div", { style: {
                        backgroundColor: '#374151',
                        padding: '16px',
                        borderRadius: '8px',
                        border: `2px solid ${statusColors[metric.status]}`,
                    }, children: [_jsx("div", { style: { fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }, children: metric.title }), _jsxs("div", { style: { fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'baseline' }, children: [metric.value, metric.unit && _jsx("span", { style: { fontSize: '16px', marginLeft: '4px' }, children: metric.unit })] }), _jsx("div", { style: { fontSize: '12px', color: statusColors[metric.status], marginTop: '4px' }, children: metric.status.toUpperCase() })] }, index))) }), alerts.length > 0 && (_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Active Alerts" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: alerts.map((alert) => (_jsxs("div", { style: {
                                backgroundColor: '#dc2626',
                                padding: '12px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 'bold' }, children: alert.metric }), _jsxs("div", { style: { fontSize: '14px' }, children: ["Value: ", alert.value, " ", alert.condition, " ", alert.threshold] })] }), _jsx("div", { style: { fontSize: '12px', color: '#fca5a5' }, children: new Date(alert.timestamp).toLocaleTimeString() })] }, alert.id))) })] })), uptimeChecks.length > 0 && (_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Uptime Monitoring" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }, children: uptimeChecks.map((check) => (_jsxs("div", { style: {
                                backgroundColor: '#374151',
                                padding: '12px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 'bold' }, children: check.name }), _jsx("div", { style: { fontSize: '14px', color: '#9ca3af' }, children: check.responseTime ? `${check.responseTime}ms` : 'N/A' })] }), _jsx("div", { style: {
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: check.status === 'up' ? '#10b981' : '#ef4444',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }, children: check.status.toUpperCase() })] }, check.id))) })] })), performanceReport && performanceReport.baselines.length > 0 && (_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Performance Baselines" }), _jsx("div", { style: { backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { borderBottom: '1px solid #4b5563' }, children: [_jsx("th", { style: { textAlign: 'left', padding: '8px' }, children: "Metric" }), _jsx("th", { style: { textAlign: 'right', padding: '8px' }, children: "Target" }), _jsx("th", { style: { textAlign: 'right', padding: '8px' }, children: "Current" }), _jsx("th", { style: { textAlign: 'right', padding: '8px' }, children: "Deviation" }), _jsx("th", { style: { textAlign: 'center', padding: '8px' }, children: "Status" })] }) }), _jsx("tbody", { children: performanceReport.baselines.map((baseline, index) => (_jsxs("tr", { style: { borderBottom: '1px solid #4b5563' }, children: [_jsx("td", { style: { padding: '8px' }, children: baseline.metric }), _jsxs("td", { style: { textAlign: 'right', padding: '8px' }, children: [baseline.target, baseline.unit] }), _jsxs("td", { style: { textAlign: 'right', padding: '8px' }, children: [baseline.current.toFixed(2), baseline.unit] }), _jsxs("td", { style: { textAlign: 'right', padding: '8px' }, children: [baseline.deviation > 0 ? '+' : '', baseline.deviation.toFixed(1), "%"] }), _jsx("td", { style: { textAlign: 'center', padding: '8px' }, children: _jsx("span", { style: {
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: statusColors[baseline.status],
                                                        fontSize: '12px',
                                                    }, children: baseline.status.toUpperCase() }) })] }, index))) })] }) }), performanceReport.recommendations.length > 0 && (_jsxs("div", { style: { marginTop: '16px' }, children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "Recommendations" }), _jsx("ul", { style: { margin: 0, paddingLeft: '20px' }, children: performanceReport.recommendations.map((rec, index) => (_jsx("li", { style: { marginBottom: '4px', color: '#fbbf24' }, children: rec }, index))) })] }))] })), errorStats && errorStats.total > 0 && (_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Error Statistics (Last Hour)" }), _jsxs("div", { style: { backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }, children: [_jsxs("div", { style: { marginBottom: '12px' }, children: ["Total Errors: ", _jsx("span", { style: { fontWeight: 'bold', color: '#ef4444' }, children: errorStats.total })] }), errorStats.topErrors.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: '8px', fontWeight: 'bold' }, children: "Top Errors:" }), errorStats.topErrors.slice(0, 5).map((error, index) => (_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '4px 0',
                                            borderBottom: '1px solid #4b5563',
                                        }, children: [_jsx("span", { style: { fontSize: '14px' }, children: error.message }), _jsx("span", { style: { color: '#ef4444' }, children: error.count })] }, index)))] }))] })] })), Object.keys(funnelConversions).length > 0 && (_jsxs("div", { children: [_jsx("h3", { style: { marginBottom: '16px' }, children: "Epic 1 Demo Funnel (Last 24h)" }), _jsx("div", { style: { backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }, children: Object.entries(funnelConversions).map(([step, rate]) => (_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                borderBottom: '1px solid #4b5563',
                            }, children: [_jsx("span", { children: step.replace(/_/g, ' → ') }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [(rate * 100).toFixed(1), "%"] })] }, step))) })] }))] }));
};
