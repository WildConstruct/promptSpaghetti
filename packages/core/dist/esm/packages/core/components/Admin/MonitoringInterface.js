import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Monitoring Interface
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 *
 * Unified monitoring dashboard that brings together health, performance,
 * API, and security monitoring with role-based views and real-time updates.
 */
import { useState, useEffect, useCallback } from 'react';
import { HealthDashboard } from './HealthDashboard';
import { UsageQuotaDashboard } from './UsageQuotaDashboard';
export const MonitoringInterface = ({
    userRole,
    userId,
    onAlertAction,
    onExport,
    className = ''
});
{
    // State Management
    const [currentView, setCurrentView] = useState('executive');
    const [metrics, setMetrics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('connected');
    // View Configurations
    const viewConfigs = {
        executive: {
            layout: 'executive',
            refreshInterval: 30000,
            widgets: ['system-overview', 'alert-summary', 'key-metrics', 'health-score'],
            rolePermissions: ['admin', 'executive', 'manager'],
        },
        operational: {
            layout: 'operational',
            refreshInterval: 5000,
            widgets: ['system-details', 'real-time-logs', 'performance-charts', 'alert-management'],
            rolePermissions: ['admin', 'operator', 'engineer'],
        },
        analytics: {
            layout: 'analytics',
            refreshInterval: 60000,
            widgets: ['trend-analysis', 'usage-patterns', 'performance-benchmarks', 'capacity-planning'],
            rolePermissions: ['admin', 'analyst', 'manager'],
        },
        compliance: {
            layout: 'compliance',
            refreshInterval: 300000,
            widgets: ['audit-trail', 'policy-enforcement', 'regulatory-status', 'evidence-collection'],
            rolePermissions: ['admin', 'compliance', 'auditor'],
        },
        // Available views based on user role
        const: availableViews = Object.entries(viewConfigs),
        : 
            .filter(([config]) => config.rolePermissions.includes(userRole))
            .map(([key]) => key),
        // Real-time data fetching
        const: fetchMetrics = useCallback(async () => {
            try {
                setConnectionStatus('connected');
                // Simulate API calls - replace with actual endpoints
                const [systemResponse, apiResponse, securityResponse, performanceResponse] = await Promise.all([]);
                fetch('/api/system/health/metrics').then(r => r.json()),
                    fetch('/api/system/api/metrics').then(r => r.json()),
                    fetch('/api/system/security/metrics').then(r => r.json()),
                    fetch('/api/system/performance/metrics').then(r => r.json());
            }
            finally {
            }
        }) };
    ;
    const metricsData = {
        system: systemResponse,
        api: apiResponse,
        security: securityResponse,
        performance: performanceResponse,
    };
    setMetrics(metricsData);
    setLastUpdated(new Date().toISOString());
    setIsLoading(false);
}
try { }
catch (error) {
    console.error('Failed to fetch metrics:', error);
    setConnectionStatus('disconnected');
    setIsLoading(false);
}
[];
;
// Fetch alerts
const fetchAlerts = useCallback(async () => {
    try {
        const response = await fetch('/api/system/alerts/active');
        const alertsData = await response.json();
        setAlerts(alertsData);
    }
    catch (error) {
        console.error('Failed to fetch alerts:', error);
    }
    [];
});
// Handle alert actions
const handleAlertAction = useCallback((alertId, action) => {
    onAlertAction?.(alertId, action);
    // Update local state optimistically
    setAlerts(prev => prev.map(alert => ), alert.id === alertId
        ? {
            ...alert,
            acknowledged: action === 'acknowledge' ? true : alert.acknowledged,
            resolved: action === 'resolve' ? true : alert.resolved,
            assignee: action === 'assign' ? userId : alert.assignee,
        }
        : alert);
});
[onAlertAction, userId];
;
// Auto-refresh effect
useEffect(() => {
    const config = viewConfigs[currentView];
    const interval = setInterval(() => {
        fetchMetrics();
        fetchAlerts();
    }, config.refreshInterval);
    // Initial fetch
    fetchMetrics();
    fetchAlerts();
    return () => clearInterval(interval);
}, [currentView, fetchMetrics, fetchAlerts]);
// Alert severity colors
const getSeverityColor = (severity) => {
    switch (severity) {
        case 'critical': return '#dc2626';
        case 'high': return '#ea580c';
        case 'medium': return '#d97706';
        case 'low': return '#65a30d';
        case 'info': return '#2563eb';
        default: return '#6b7280';
    }
    ;
    // Header component
    const MonitoringHeader = () => ();
    ;
    _jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '16px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }, children: _jsxs("div", { children: [_jsx("h1", { style: { margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }, children: "System Monitoring" }), _jsxs("p", { style: { margin: 0, fontSize: '14px', color: '#6b7280' }, children: ["Last updated: ", lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never', " \u2022 Status: ", _jsx("span", { style: ({},
                                color) }), ": connectionStatus === 'connected' ? '#10b981' : '#ef4444', fontWeight: '500', }}>", connectionStatus] })] }) })
        ,
            _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'center' }, children: [_jsx("select", { value: currentView, onChange: (e) => setCurrentView(e.target.value), style: {
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                        }, children: availableViews.map(view => ()
                            < option, key = { view }, value = { view } >
                            { view, : .charAt(0).toUpperCase() + view.slice(1) }, View) }), "))}"] });
    { /* Export Button */ }
    _jsx("button", { onClick: () => onExport?.('metrics', '24h'), style: {
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
        }, children: "Export Report" });
};
div >
;
div >
;
;
// Alert Summary Component
const AlertSummary = () => {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    const highAlerts = alerts.filter(a => a.severity === 'high' && !a.resolved).length;
    const unacknowledged = alerts.filter(a => !a.acknowledged && !a.resolved).length;
    return;
    _jsxs("div", { style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }, children: "Alert Overview" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '700', color: '#dc2626' }, children: criticalAlerts }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Critical" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '700', color: '#ea580c' }, children: highAlerts }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "High Priority" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '700', color: '#2563eb' }, children: unacknowledged }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Unacknowledged" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '700', color: '#059669' }, children: alerts.filter(a => a.resolved).length }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Resolved Today" })] })] })] });
};
;
;
// Key Metrics Component
const KeyMetrics = () => {
    if (!metrics)
        return _jsx("div", { children: "Loading metrics..." });
    return;
    _jsxs("div", { style: {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }, children: "System Performance" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', color: '#6b7280', marginBottom: '4px' }, children: "CPU Usage" }), _jsxs("div", { style: { fontSize: '20px', fontWeight: '600', color: '#1f2937' }, children: [metrics.system.cpu.toFixed(1), "%"] }), _jsxs("div", { style: {
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    marginTop: '8px',
                                }, children: [_jsx("div", { style: {
                                            width: `${Math.min(metrics.system.cpu, 100)}%`
                                        } }), ", height: '100%', backgroundColor: metrics.system.cpu > 80 ? '#dc2626' : metrics.system.cpu > 60 ? '#f59e0b' : '#10b981', borderRadius: '2px' }} />"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', color: '#6b7280', marginBottom: '4px' }, children: "Memory Usage" }), _jsxs("div", { style: { fontSize: '20px', fontWeight: '600', color: '#1f2937' }, children: [metrics.system.memory.toFixed(1), "%"] }), _jsxs("div", { style: {
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    marginTop: '8px',
                                }, children: [_jsx("div", { style: {
                                            width: `${Math.min(metrics.system.memory, 100)}%`
                                        } }), ", height: '100%', backgroundColor: metrics.system.memory > 80 ? '#dc2626' : metrics.system.memory > 60 ? '#f59e0b' : '#10b981', borderRadius: '2px' }} />"] })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', color: '#6b7280', marginBottom: '4px' }, children: "API Latency" }), _jsxs("div", { style: { fontSize: '20px', fontWeight: '600', color: '#1f2937' }, children: [metrics.api.averageLatency.toFixed(0), "ms"] }), _jsxs("div", { style: { fontSize: '12px', color: '#6b7280', marginTop: '4px' }, children: [metrics.api.requestsPerSecond.toFixed(1), " req/s"] })] })] })] });
};
;
;
// Recent Alerts Component
const RecentAlerts = () => ();
;
_jsxs("div", { style: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }, children: "Recent Alerts" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [alerts.slice(0, 5).map(alert => ()
                    < div, key = { alert, : .id }, style = {}, {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                }), ", borderRadius: '4px' }} >", _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '2px' }, children: alert.title }), _jsxs("div", { style: { fontSize: '12px', color: '#6b7280' }, children: [alert.source, " \u2022 ", new Date(alert.timestamp).toLocaleString()] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [!alert.acknowledged && ()
                            < button, "onClick=", () => handleAlertAction(alert.id, 'acknowledge'), "style=", {
                            padding: '4px 8px',
                            backgroundColor: '#3b82f6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }, "> Acknowledge"] }), ")}", !alert.resolved && ()
                    < button, "onClick=", () => handleAlertAction(alert.id, 'resolve'), "style=", {
                    padding: '4px 8px',
                    backgroundColor: '#10b981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                }, "> Resolve"] }), ")}"] });
div >
;
div >
;
div >
;
;
if (isLoading && !metrics) {
    return;
    _jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
        }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px',
                    } }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Loading monitoring data..." })] }) });
    ;
    return;
    _jsx("div", { className: `monitoring-interface ${className}`, style: ({}, ), "padding:": true });
    '20px',
        backgroundColor;
    '#f9fafb',
        minHeight;
    '100vh';
}
 >
    _jsx(MonitoringHeader, {});
{ /* Executive View */ }
{
    currentView === 'executive' && ()
        < div;
    style = {};
    {
        display: 'grid', gridTemplateColumns;
        '1fr 1fr', gap;
        '20px', marginBottom;
        '20px';
    }
}
 >
    (_jsx(AlertSummary, {})
        ,
            _jsx(KeyMetrics, {}));
div >
;
{ /* All Views Show Recent Alerts */ }
_jsx("div", { style: { marginBottom: '20px' }, children: _jsx(RecentAlerts, {}) });
{ /* Embed existing monitoring components based on view */ }
{
    currentView === 'operational' && ()
        < div;
    style = {};
    {
        display: 'grid', gridTemplateColumns;
        '1fr 1fr', gap;
        '20px';
    }
}
 >
    (_jsx("div", { style: { backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '20px' }, children: _jsx(HealthDashboard, {}) })
        ,
            _jsx("div", { style: { backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '20px' }, children: _jsx(UsageQuotaDashboard, {}) }));
div >
;
_jsx("style", { children: `
        @keyframes spin {
          to {
            transform: rotate(360deg);
      ` });
div >
;
;
;
export default MonitoringInterface;
