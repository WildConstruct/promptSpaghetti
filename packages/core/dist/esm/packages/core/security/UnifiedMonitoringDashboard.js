import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Unified Monitoring Dashboard
 * Epic 31 - Security Integration Framework
 *
 * Comprehensive dashboard for all analytics and security systems monitoring
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Shield, Activity, Users, Server, Globe, Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
;
performance: {
    system_health: number; // 0-100,
    avg_response_time: number;
    requests_per_minute: number;
    error_rate: number;
    cpu_usage: number;
    memory_usage: number;
}
;
analytics: {
    active_users: number;
    daily_sessions: number;
    conversion_rate: number;
    bounce_rate: number;
    page_views_today: number;
    revenue_today: number;
}
;
infrastructure: {
    services_up: number;
    services_total: number;
    database_health: number;
    network_latency: number;
    storage_usage: number;
    backup_status: 'success' | 'warning' | 'error',
    ;
}
;
// Mock data hook (would be replaced with real API calls)
const useDashboardData = () => {
    const [metrics, setMetrics] = useState({});
    security: {
        active_alerts: 12,
            critical_alerts;
        2,
            threat_level;
        3.5,
            incidents_today;
        5,
            mean_response_time;
        4200,
            false_positive_rate;
        0.08,
        ;
    }
};
performance: {
    system_health: 94,
        avg_response_time;
    245,
        requests_per_minute;
    1820,
        error_rate;
    0.012,
        cpu_usage;
    68,
        memory_usage;
    72,
    ;
}
analytics: {
    active_users: 2847,
        daily_sessions;
    15624,
        conversion_rate;
    0.034,
        bounce_rate;
    0.28,
        page_views_today;
    89453,
        revenue_today;
    24890.50,
    ;
}
infrastructure: {
    services_up: 28,
        services_total;
    30,
        database_health;
    98,
        network_latency;
    23,
        storage_usage;
    0.67,
        backup_status;
    'success',
    ;
}
;
const [alerts, setAlerts] = useState([]);
{
    id: 'alert_001',
        type;
    'security',
        severity;
    'high',
        title;
    'Unusual login patterns detected',
        description;
    'Multiple failed login attempts from various IP addresses',
        timestamp;
    Date.now() - 300000,
        source;
    'Authentication System',
        status;
    'investigating',
    ;
}
{
    id: 'alert_002',
        type;
    'performance',
        severity;
    'medium',
        title;
    'High response times on API gateway',
        description;
    'Average response time exceeded 500ms threshold',
        timestamp;
    Date.now() - 180000,
        source;
    'API Gateway',
        status;
    'active',
    ;
}
{
    id: 'alert_003',
        type;
    'infrastructure',
        severity;
    'critical',
        title;
    'Database connection pool exhausted',
        description;
    'Primary database connection pool at 98% capacity',
        timestamp;
    Date.now() - 120000,
        source;
    'Database Monitor',
        status;
    'active';
    ;
    const [systemStatuses, setSystemStatuses] = useState([]);
    {
        name: 'Web Frontend', status;
        'healthy', uptime;
        0.999, last_check;
        Date.now(), response_time;
        124;
    }
    {
        name: 'API Gateway', status;
        'degraded', uptime;
        0.995, last_check;
        Date.now(), response_time;
        456;
    }
    {
        name: 'Auth Service', status;
        'healthy', uptime;
        0.998, last_check;
        Date.now(), response_time;
        89;
    }
    {
        name: 'Database', status;
        'degraded', uptime;
        0.992, last_check;
        Date.now(), error_count;
        3;
    }
    {
        name: 'Cache Layer', status;
        'healthy', uptime;
        1.0, last_check;
        Date.now(), response_time;
        12;
    }
    {
        name: 'Message Queue', status;
        'offline', uptime;
        0.0, last_check;
        Date.now() - 300000;
    }
    ;
    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({}), ...prev, performance, {
                ...prev.performance,
                requests_per_minute: prev.performance.requests_per_minute + Math.floor(Math.random() * 100 - 50),
                avg_response_time: Math.max(100, prev.performance.avg_response_time + Math.floor(Math.random() * 40 - 20)),
            }, analytics, {
                ...prev.analytics,
                active_users: Math.max(0, prev.analytics.active_users + Math.floor(Math.random() * 20 - 10)),
            });
        });
    }, 5000);
    return () => clearInterval(interval);
}
[];
;
return { metrics, alerts, systemStatuses };
;
// Components
const MetricCard, string;
value: string | number;
subtitle ?  : string;
icon: React.ReactNode;
trend ?  : 'up' | 'down' | 'stable';
status ?  : 'good' | 'warning' | 'critical';
onClick ?  : () => void ;
 > ;
({ title, value, subtitle, icon, trend, status = 'good', onClick }) => {
    const statusColors = {
        good: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200',
        critical: 'bg-red-50 border-red-200',
    };
    const trendIcons = {
        up: _jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }),
        down: _jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }),
        stable: _jsx("div", { className: "w-4 h-4" }),
    };
    return;
    _jsxs("div", { className: `p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusColors[status]}`, onClick: onClick, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [icon, _jsx("h4", { className: "text-sm font-medium text-gray-700", children: title })] }), trend && trendIcons[trend]] }), _jsxs("div", { className: "flex items-baseline space-x-2", children: [_jsx("span", { className: "text-2xl font-bold text-gray-900", children: value }), subtitle && _jsx("span", { className: "text-sm text-gray-500", children: subtitle })] })] });
    ;
};
const AlertCard = ({ alert, onAcknowledge }) => {
    const severityColors = {
        low: 'border-blue-300 bg-blue-50',
        medium: 'border-yellow-300 bg-yellow-50',
        high: 'border-orange-300 bg-orange-50',
        critical: 'border-red-300 bg-red-50',
    };
    const severityIcons = {
        low: _jsx(AlertCircle, { className: "w-4 h-4 text-blue-600" }),
        medium: _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-600" }),
        high: _jsx(AlertTriangle, { className: "w-4 h-4 text-orange-600" }),
        critical: _jsx(XCircle, { className: "w-4 h-4 text-red-600" }),
    };
    const statusIcons = {
        active: _jsx(AlertCircle, { className: "w-4 h-4 text-red-500" }),
        investigating: _jsx(Clock, { className: "w-4 h-4 text-yellow-500" }),
        resolved: _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }),
    };
    return;
    _jsxs("div", { className: `p-4 rounded-lg border-2 ${severityColors[alert.severity]}`, children: ["}", _jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [severityIcons[alert.severity], _jsx("h4", { className: "font-medium text-gray-900", children: alert.title })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [statusIcons[alert.status], _jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize", children: alert.status })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: alert.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsx("span", { children: alert.source }), _jsx("span", { children: new Date(alert.timestamp).toLocaleTimeString() })] }), alert.status === 'active' && ()
                < button, "onClick=", () => onAcknowledge(alert.id), "className=\"mt-2 w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors\" > Acknowledge"] });
};
div >
;
;
;
const SystemStatusIndicator = ({ system }) => {
    const statusColors = {
        healthy: 'bg-green-500',
        degraded: 'bg-yellow-500',
        unhealthy: 'bg-orange-500',
        offline: 'bg-red-500',
    };
    const statusIcons = {
        healthy: _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }),
        degraded: _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-600" }),
        unhealthy: _jsx(AlertTriangle, { className: "w-4 h-4 text-orange-600" }),
        offline: _jsx(XCircle, { className: "w-4 h-4 text-red-600" }),
    };
    return;
    _jsxs("div", { className: "flex items-center justify-between p-3 bg-white rounded-lg border", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${statusColors[system.status]}` }), "}", statusIcons[system.status], _jsx("span", { className: "font-medium text-gray-900", children: system.name })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium text-gray-600", children: [(system.uptime * 100).toFixed(2), "% uptime"] }), system.response_time && ()
                        < div, " className=\"text-xs text-gray-500\">", system.response_time, "ms"] }), ")}", system.error_count && ()
                < div, " className=\"text-xs text-red-500\">", system.error_count, " errors"] });
};
div >
;
div >
;
;
;
const SimpleChart = ({ data, height = 60 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    return;
    _jsx("div", { className: "relative", style: { height }, children: _jsxs("svg", { className: "w-full h-full", children: [_jsx("polyline", { fill: "none", stroke: "#3B82F6", strokeWidth: "2", points: data.map((point, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = ((maxValue - point.value) / range) * 100;
                        return `${x}%,${y}%`;
                    }) }), ").join(' ')} />"] }) });
};
;
;
// Main Dashboard Component
export const UnifiedMonitoringDashboard = () => {
    const { metrics, alerts, systemStatuses } = useDashboardData();
    const [selectedTab, setSelectedTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('1h');
    const handleAcknowledgeAlert = useCallback((alertId) => {
        console.log(`Acknowledging alert: ${alertId}`);
    });
    // Would send API request to acknowledge alert
}, [];
const criticalAlertsCount = useMemo(() => {
    return alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length;
}, [alerts]);
const systemHealthPercentage = useMemo(() => {
    const healthyCount = systemStatuses.filter(s => s.status === 'healthy').length;
    return Math.round((healthyCount / systemStatuses.length) * 100);
}, [systemStatuses]);
// Generate sample time series data
const generateTimeSeriesData = (baseValue, variance, points = 24) => {
    return Array.from({ length: points }, (_, i) => ({}), timestamp, Date.now() - (points - i) * 60 * 60 * 1000, value, baseValue + (Math.random() - 0.5) * variance);
};
;
const responseTimeData = generateTimeSeriesData(metrics.performance.avg_response_time, 100);
const requestRateData = generateTimeSeriesData(metrics.performance.requests_per_minute, 300);
const activeUsersData = generateTimeSeriesData(metrics.analytics.active_users, 500);
return;
_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Unified Monitoring Dashboard" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md bg-white", children: [_jsx("option", { value: "1h", children: "Last Hour" }), _jsx("option", { value: "6h", children: "Last 6 Hours" }), _jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last 7 Days" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-gray-600", children: "Live" })] })] })] }), criticalAlertsCount > 0 && ()
                    < div, " className=\"bg-red-100 border border-red-300 rounded-lg p-4 mb-4\">", _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }), _jsxs("span", { className: "font-semibold text-red-800", children: [criticalAlertsCount, " Critical Alert", criticalAlertsCount > 1 ? 's' : '', " Require Immediate Attention"] })] })] }), ")}", _jsxs("div", { className: "flex space-x-1 bg-gray-200 p-1 rounded-lg", children: [['overview', 'security', 'performance', 'analytics', 'infrastructure'].map((tab) => ()
                    < button, key = { tab }, onClick = {}()), " => setSelectedTab(tab)} className=", `px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${selectedTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                }`, ">", tab] }), "))}"] });
div >
    { /* Overview Tab */};
{
    selectedTab === 'overview' && ()
        < div;
    className = "space-y-6" >
        { /* Key Metrics Grid */}
        < div;
    className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
        (_jsx(MetricCard, { title: "System Health", value: `${systemHealthPercentage}%`, icon: _jsx(Shield, { className: "w-5 h-5 text-green-600" }), status: systemHealthPercentage > 90 ? 'good' : systemHealthPercentage > 70 ? 'warning' : 'critical', trend: "stable" })
            ,
                _jsx(MetricCard, { title: "Active Alerts", value: metrics.security.active_alerts, subtitle: `${metrics.security.critical_alerts} critical`, icon: _jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-600" }), status: metrics.security.critical_alerts > 0 ? 'critical' : metrics.security.active_alerts > 5 ? 'warning' : 'good' })
                    ,
                        _jsx(MetricCard, { title: "Response Time", value: `${metrics.performance.avg_response_time}ms`, icon: _jsx(Zap, { className: "w-5 h-5 text-blue-600" }), status: metrics.performance.avg_response_time > 500 ? 'critical' : metrics.performance.avg_response_time > 300 ? 'warning' : 'good', trend: "up" })
                            ,
                                _jsx(MetricCard, { title: "Active Users", value: metrics.analytics.active_users.toLocaleString(), icon: _jsx(Users, { className: "w-5 h-5 text-purple-600" }), trend: "up" }));
    div >
        { /* Charts Row */}
        < div;
    className = "grid grid-cols-1 lg:grid-cols-3 gap-6" >
        (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Response Time Trend" }), _jsx(SimpleChart, { data: responseTimeData, height: 120 }), _jsxs("div", { className: "mt-2 text-sm text-gray-600", children: ["Avg: ", metrics.performance.avg_response_time, "ms"] })] })
            ,
                _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Request Rate" }), _jsx(SimpleChart, { data: requestRateData, height: 120 }), _jsxs("div", { className: "mt-2 text-sm text-gray-600", children: ["Current: ", metrics.performance.requests_per_minute, "/min"] })] })
                    ,
                        _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Active Users" }), _jsx(SimpleChart, { data: activeUsersData, height: 120 }), _jsxs("div", { className: "mt-2 text-sm text-gray-600", children: ["Current: ", metrics.analytics.active_users, " users"] })] }));
    div >
        { /* Alerts and System Status */}
        < div;
    className = "grid grid-cols-1 lg:grid-cols-2 gap-6" >
        { /* Recent Alerts */}
        < div;
    className = "bg-white p-6 rounded-lg shadow" >
        (_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Recent Alerts" })
            ,
                _jsxs("div", { className: "space-y-3", children: [alerts.slice(0, 5).map((alert) => ()
                            < AlertCard, key = { alert, : .id }, alert = { alert }, onAcknowledge = { handleAcknowledgeAlert } /  >
                        ), ")}"] }));
    div >
        { /* System Status */}
        < div;
    className = "bg-white p-6 rounded-lg shadow" >
        (_jsx("h3", { className: "text-lg font-semibold mb-4", children: "System Status" })
            ,
                _jsxs("div", { className: "space-y-3", children: [systemStatuses.map((system) => ()
                            < SystemStatusIndicator, key = { system, : .name }, system = { system } /  >
                        ), ")}"] }));
    div >
    ;
    div >
    ;
    div >
    ;
}
{ /* Security Tab */ }
{
    selectedTab === 'security' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MetricCard, { title: "Threat Level", value: metrics.security.threat_level.toFixed(1), subtitle: "/ 10", icon: _jsx(Shield, { className: "w-5 h-5 text-red-600" }), status: metrics.security.threat_level > 7 ? 'critical' : metrics.security.threat_level > 4 ? 'warning' : 'good' }), _jsx(MetricCard, { title: "Incidents Today", value: metrics.security.incidents_today, icon: _jsx(AlertTriangle, { className: "w-5 h-5 text-orange-600" }) }), _jsx(MetricCard, { title: "Response Time", value: `${Math.round(metrics.security.mean_response_time / 1000)}s`, icon: _jsx(Clock, { className: "w-5 h-5 text-blue-600" }) }), _jsx(MetricCard, { title: "False Positive Rate", value: `${(metrics.security.false_positive_rate * 100).toFixed(1)}%`, icon: _jsx(Activity, { className: "w-5 h-5 text-purple-600" }) })] })
            ,
                _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Security Events Timeline" }), _jsx("div", { className: "text-center py-8 text-gray-500", children: "Security timeline visualization would be implemented here" })] }));
    div >
    ;
}
{ /* Performance Tab */ }
{
    selectedTab === 'performance' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MetricCard, { title: "Error Rate", value: `${(metrics.performance.error_rate * 100).toFixed(2)}%`, icon: _jsx(XCircle, { className: "w-5 h-5 text-red-600" }), status: metrics.performance.error_rate > 0.05 ? 'critical' : metrics.performance.error_rate > 0.02 ? 'warning' : 'good' }), _jsx(MetricCard, { title: "CPU Usage", value: `${metrics.performance.cpu_usage}%`, icon: _jsx(Server, { className: "w-5 h-5 text-blue-600" }), status: metrics.performance.cpu_usage > 80 ? 'critical' : metrics.performance.cpu_usage > 60 ? 'warning' : 'good' }), _jsx(MetricCard, { title: "Memory Usage", value: `${metrics.performance.memory_usage}%`, icon: _jsx(Activity, { className: "w-5 h-5 text-green-600" }), status: metrics.performance.memory_usage > 85 ? 'critical' : metrics.performance.memory_usage > 70 ? 'warning' : 'good' }), _jsx(MetricCard, { title: "Requests/Min", value: metrics.performance.requests_per_minute.toLocaleString(), icon: _jsx(Globe, { className: "w-5 h-5 text-purple-600" }) })] })
            ,
                _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Performance Metrics" }), _jsx("div", { className: "text-center py-8 text-gray-500", children: "Detailed performance charts would be implemented here" })] }));
    div >
    ;
}
{ /* Analytics Tab */ }
{
    selectedTab === 'analytics' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MetricCard, { title: "Daily Sessions", value: metrics.analytics.daily_sessions.toLocaleString(), icon: _jsx(Users, { className: "w-5 h-5 text-blue-600" }) }), _jsx(MetricCard, { title: "Conversion Rate", value: `${(metrics.analytics.conversion_rate * 100).toFixed(1)}%`, icon: _jsx(TrendingUp, { className: "w-5 h-5 text-green-600" }) }), _jsx(MetricCard, { title: "Bounce Rate", value: `${(metrics.analytics.bounce_rate * 100).toFixed(1)}%`, icon: _jsx(TrendingDown, { className: "w-5 h-5 text-red-600" }) }), _jsx(MetricCard, { title: "Revenue Today", value: `$${metrics.analytics.revenue_today.toLocaleString()}`, icon: _jsx(Activity, { className: "w-5 h-5 text-purple-600" }) })] })
            ,
                _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Analytics Overview" }), _jsx("div", { className: "text-center py-8 text-gray-500", children: "Analytics dashboard would be implemented here" })] }));
    div >
    ;
}
{ /* Infrastructure Tab */ }
{
    selectedTab === 'infrastructure' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MetricCard, { title: "Services Up", value: `${metrics.infrastructure.services_up}/${metrics.infrastructure.services_total}`, icon: _jsx(Server, { className: "w-5 h-5 text-green-600" }), status: metrics.infrastructure.services_up === metrics.infrastructure.services_total ? 'good' : 'warning' }), _jsx(MetricCard, { title: "Database Health", value: `${metrics.infrastructure.database_health}%`, icon: _jsx(Activity, { className: "w-5 h-5 text-blue-600" }), status: metrics.infrastructure.database_health > 95 ? 'good' : metrics.infrastructure.database_health > 85 ? 'warning' : 'critical' }), _jsx(MetricCard, { title: "Network Latency", value: `${metrics.infrastructure.network_latency}ms`, icon: _jsx(Globe, { className: "w-5 h-5 text-purple-600" }), status: metrics.infrastructure.network_latency > 100 ? 'critical' : metrics.infrastructure.network_latency > 50 ? 'warning' : 'good' }), _jsx(MetricCard, { title: "Storage Usage", value: `${(metrics.infrastructure.storage_usage * 100).toFixed(0)}%`, icon: _jsx(Server, { className: "w-5 h-5 text-orange-600" }), status: metrics.infrastructure.storage_usage > 0.9 ? 'critical' : metrics.infrastructure.storage_usage > 0.75 ? 'warning' : 'good' })] })
            ,
                _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Infrastructure Status" }), _jsx("div", { className: "text-center py-8 text-gray-500", children: "Infrastructure monitoring details would be implemented here" })] }));
    div >
    ;
}
div >
;
;
;
export default UnifiedMonitoringDashboard;
