import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Monitoring Widgets
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 *
 * Modular monitoring widgets for different views and metrics.
 * Supports configurable layouts, real-time updates, and role-based visibility.
 */
import { useState, useEffect } from 'react';
// System Health Score Widget
export const SystemHealthWidget = ({ data, className }) => {
    const healthScore = data?.healthScore || 0;
    const components = data?.components || [];
    const getHealthColor = (score) => {
        if (score >= 95)
            return '#10b981';
        if (score >= 85)
            return '#f59e0b';
        if (score >= 70)
            return '#ef4444';
        return '#dc2626';
    };
    const getHealthStatus = (score) => {
        if (score >= 95)
            return 'Excellent';
        if (score >= 85)
            return 'Good';
        if (score >= 70)
            return 'Warning';
        return 'Critical';
    };
    return (_jsxs("div", { className: `health-widget ${className}`, style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }, children: "System Health Score" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }, children: [_jsxs("div", { style: { position: 'relative', width: '80px', height: '80px' }, children: [_jsxs("svg", { width: "80", height: "80", viewBox: "0 0 80 80", children: [_jsx("circle", { cx: "40", cy: "40", r: "30", fill: "none", stroke: "#e5e7eb", strokeWidth: "8" }), _jsx("circle", { cx: "40", cy: "40", r: "30", fill: "none", stroke: getHealthColor(healthScore), strokeWidth: "8", strokeLinecap: "round", strokeDasharray: `${(healthScore / 100) * 188.5} 188.5`, transform: "rotate(-90 40 40)" })] }), _jsx("div", { style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: getHealthColor(healthScore)
                                }, children: healthScore })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }, children: getHealthStatus(healthScore) }), _jsxs("div", { style: { fontSize: '14px', color: '#6b7280' }, children: [components.filter((c) => c.status === 'healthy').length, "/", components.length, " components healthy"] })] })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: components.slice(0, 4).map((component, index) => (_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: index < 3 ? '1px solid #f3f4f6' : 'none'
                    }, children: [_jsx("span", { style: { fontSize: '13px', color: '#374151' }, children: component.name }), _jsxs("span", { style: {
                                fontSize: '12px',
                                color: component.status === 'healthy' ? '#10b981' : '#ef4444',
                                fontWeight: '500'
                            }, children: [component.status === 'healthy' ? '●' : '●', " ", component.status] })] }, index))) })] }));
};
// Resource Usage Widget
export const ResourceUsageWidget = ({ data, className }) => {
    const resources = data?.resources || {};
    const ResourceBar = ({ label, value, unit, threshold }) => {
        const getColor = () => {
            if (value >= threshold.critical)
                return '#dc2626';
            if (value >= threshold.warning)
                return '#f59e0b';
            return '#10b981';
        };
        return (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                    }, children: [_jsx("span", { style: { fontSize: '13px', color: '#374151', fontWeight: '500' }, children: label }), _jsxs("span", { style: { fontSize: '13px', color: '#1f2937', fontWeight: '600' }, children: [value.toFixed(1), unit] })] }), _jsx("div", { style: {
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }, children: _jsx("div", { style: {
                            width: `${Math.min(value, 100)}%`,
                            height: '100%',
                            backgroundColor: getColor(),
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                        } }) })] }));
    };
    return (_jsxs("div", { className: `resource-usage-widget ${className}`, style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }, children: [_jsx("h3", { style: { margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }, children: "Resource Usage" }), _jsx(ResourceBar, { label: "CPU", value: resources.cpu || 0, unit: "%", threshold: { warning: 70, critical: 85 } }), _jsx(ResourceBar, { label: "Memory", value: resources.memory || 0, unit: "%", threshold: { warning: 75, critical: 90 } }), _jsx(ResourceBar, { label: "Disk", value: resources.disk || 0, unit: "%", threshold: { warning: 80, critical: 95 } }), _jsx(ResourceBar, { label: "Network I/O", value: resources.network || 0, unit: "% of capacity", threshold: { warning: 80, critical: 95 } })] }));
};
// API Metrics Widget
export const APIMetricsWidget = ({ data, className }) => {
    const metrics = data?.api || {};
    const MetricCard = ({ title, value, unit, trend, trendDirection }) => (_jsxs("div", { style: {
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            padding: '12px',
            textAlign: 'center'
        }, children: [_jsxs("div", { style: { fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }, children: [typeof value === 'number' ? value.toLocaleString() : value, _jsx("span", { style: { fontSize: '12px', fontWeight: '500', color: '#6b7280', marginLeft: '2px' }, children: unit })] }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' }, children: title }), trend !== undefined && (_jsxs("div", { style: {
                    fontSize: '11px',
                    color: trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                }, children: [trendDirection === 'up' && '↗', trendDirection === 'down' && '↘', trendDirection === 'stable' && '→', Math.abs(trend).toFixed(1), "%"] }))] }));
    return (_jsxs("div", { className: `api-metrics-widget ${className}`, style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }, children: "API Performance" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }, children: [_jsx(MetricCard, { title: "Requests/sec", value: metrics.requestsPerSecond || 0, unit: "req/s", trend: 5.2, trendDirection: "up" }), _jsx(MetricCard, { title: "Avg Latency", value: metrics.averageLatency || 0, unit: "ms", trend: -2.1, trendDirection: "down" }), _jsx(MetricCard, { title: "Error Rate", value: metrics.errorRate || 0, unit: "%", trend: -15.3, trendDirection: "down" }), _jsx(MetricCard, { title: "Active Connections", value: metrics.activeConnections || 0, unit: "", trend: 8.7, trendDirection: "up" })] })] }));
};
// Security Overview Widget
export const SecurityOverviewWidget = ({ data, onAction, className }) => {
    const security = data?.security || {};
    const threats = security.threats || [];
    const SecurityMetric = ({ label, value, status }) => {
        const statusColors = {
            good: '#10b981',
            warning: '#f59e0b',
            critical: '#ef4444'
        };
        return (_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f3f4f6'
            }, children: [_jsx("span", { style: { fontSize: '13px', color: '#374151' }, children: label }), _jsx("span", { style: {
                        fontSize: '14px',
                        fontWeight: '600',
                        color: statusColors[status]
                    }, children: value })] }));
    };
    return (_jsxs("div", { className: `security-overview-widget ${className}`, style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                }, children: [_jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }, children: "Security Status" }), _jsx("button", { onClick: () => onAction?.('security-overview', 'view-details'), style: {
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: '#374151'
                        }, children: "View Details" })] }), _jsx(SecurityMetric, { label: "Active Threats", value: security.activeThreats || 0, status: security.activeThreats > 0 ? 'critical' : 'good' }), _jsx(SecurityMetric, { label: "Blocked Attempts", value: `${security.blockedAttempts || 0}/24h`, status: security.blockedAttempts > 100 ? 'warning' : 'good' }), _jsx(SecurityMetric, { label: "Compliance Score", value: `${security.complianceScore || 0}%`, status: security.complianceScore >= 95 ? 'good' : security.complianceScore >= 85 ? 'warning' : 'critical' }), _jsx(SecurityMetric, { label: "Last Security Scan", value: security.lastScan ? new Date(security.lastScan).toLocaleDateString() : 'Never', status: "good" }), threats.length > 0 && (_jsxs("div", { style: { marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px' }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: '500', color: '#dc2626', marginBottom: '4px' }, children: "Recent Threats Detected" }), threats.slice(0, 2).map((threat, index) => (_jsxs("div", { style: { fontSize: '11px', color: '#991b1b', marginBottom: '2px' }, children: ["\u2022 ", threat.type, ": ", threat.source] }, index)))] }))] }));
};
// Real-time Activity Feed Widget
export const ActivityFeedWidget = ({ data, className }) => {
    const [activities, setActivities] = useState(data?.activities || []);
    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            const newActivity = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type: 'info',
                message: 'System health check completed',
                source: 'health-monitor'
            };
            setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const getActivityIcon = (type) => {
        switch (type) {
            case 'error': return '🔴';
            case 'warning': return '🟡';
            case 'success': return '🟢';
            case 'info': return '🔵';
            default: return '⚪';
        }
    };
    return (_jsxs("div", { className: `activity-feed-widget ${className}`, style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }, children: "Recent Activity" }), _jsx("div", { style: {
                    maxHeight: '300px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }, children: activities.slice(0, 10).map((activity, index) => (_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '4px'
                    }, children: [_jsx("span", { style: { fontSize: '12px', marginTop: '2px' }, children: getActivityIcon(activity.type) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: '13px', color: '#374151', marginBottom: '2px' }, children: activity.message }), _jsxs("div", { style: { fontSize: '11px', color: '#6b7280' }, children: [activity.source, " \u2022 ", new Date(activity.timestamp).toLocaleTimeString()] })] })] }, activity.id || index))) })] }));
};
// Configurable Widget Container
export const MonitoringWidget = (props) => {
    const { config, userRole } = props;
    // Check permissions
    if (!config.requiredPermissions.includes(userRole) && !config.requiredPermissions.includes('all')) {
        return null;
    }
    const getSizeStyles = (size) => {
        switch (size) {
            case 'small': return { gridColumn: 'span 1', minHeight: '200px' };
            case 'medium': return { gridColumn: 'span 2', minHeight: '250px' };
            case 'large': return { gridColumn: 'span 3', minHeight: '300px' };
            case 'full-width': return { gridColumn: '1 / -1', minHeight: '200px' };
            default: return { gridColumn: 'span 2', minHeight: '250px' };
        }
    };
    const renderWidget = () => {
        switch (config.type) {
            case 'metric':
                if (config.id === 'system-health')
                    return _jsx(SystemHealthWidget, { ...props });
                if (config.id === 'resource-usage')
                    return _jsx(ResourceUsageWidget, { ...props });
                if (config.id === 'api-metrics')
                    return _jsx(APIMetricsWidget, { ...props });
                break;
            case 'status':
                if (config.id === 'security-overview')
                    return _jsx(SecurityOverviewWidget, { ...props });
                break;
            case 'list':
                if (config.id === 'activity-feed')
                    return _jsx(ActivityFeedWidget, { ...props });
                break;
            default:
                return _jsxs("div", { children: ["Widget type not implemented: ", config.type] });
        }
        return _jsxs("div", { children: ["Unknown widget: ", config.id] });
    };
    return (_jsx("div", { style: getSizeStyles(config.size), children: renderWidget() }));
};
export default MonitoringWidget;
