import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Health Dashboard Component - Epic 17.4
 *
 * Comprehensive system health monitoring dashboard for backstage admin controls.
 * Integrates with HealthMonitoringService and DiagnosticService for real-time
 * system status, performance metrics, and operational insights.
 *
 * Task: E17-1753114397242-281319 - Design health dashboards
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Activity, Zap, Database, Wifi, HardDrive } from 'lucide-react';
export const HealthDashboard = ({ refreshInterval = 30000, // 30 seconds
autoRefresh = true, showDetails = true, onAlertAction }) => {
    // State management
    const [healthStatus, setHealthStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    // Fetch health status
    const fetchHealthStatus = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch('/api/system/health/dashboard');
            if (!response.ok) {
                throw new Error(`Health API error: ${response.status}`);
            }
            const data = await response.json();
            setHealthStatus(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch health status');
            console.error('Health dashboard fetch error:', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Auto-refresh effect
    useEffect(() => {
        fetchHealthStatus();
        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(fetchHealthStatus, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchHealthStatus, autoRefresh, refreshInterval]);
    // Helper functions
    const getStatusColor = (status) => {
        switch (status.toUpperCase()) {
            case 'HEALTHY': return 'text-green-600 bg-green-100';
            case 'DEGRADED': return 'text-yellow-600 bg-yellow-100';
            case 'UNHEALTHY': return 'text-orange-600 bg-orange-100';
            case 'CRITICAL': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getStatusIcon = (status) => {
        switch (status.toUpperCase()) {
            case 'HEALTHY': return _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" });
            case 'DEGRADED': return _jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-600" });
            case 'UNHEALTHY': return _jsx(AlertCircle, { className: "w-5 h-5 text-orange-600" });
            case 'CRITICAL': return _jsx(XCircle, { className: "w-5 h-5 text-red-600" });
            default: return _jsx(AlertCircle, { className: "w-5 h-5 text-gray-600" });
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'database': return _jsx(Database, { className: "w-5 h-5" });
            case 'system': return _jsx(Activity, { className: "w-5 h-5" });
            case 'cache': return _jsx(Zap, { className: "w-5 h-5" });
            case 'external': return _jsx(Wifi, { className: "w-5 h-5" });
            case 'filesystem': return _jsx(HardDrive, { className: "w-5 h-5" });
            default: return _jsx(Activity, { className: "w-5 h-5" });
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (days > 0)
            return `${days}d ${hours}h`;
        if (hours > 0)
            return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };
    // Handle alert actions
    const handleAlertAction = async (alertId, action) => {
        try {
            await fetch(`/api/system/alerts/${alertId}/${action}`, { method: 'POST' });
            await fetchHealthStatus(); // Refresh data
            onAlertAction?.(alertId, action);
        }
        catch (err) {
            console.error(`Failed to ${action} alert:`, err);
        }
    };
    // Loading state
    if (loading) {
        return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Loading Health Status..." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "bg-gray-200 animate-pulse rounded-lg h-32" }, i))) })] }));
    }
    // Error state
    if (error) {
        return (_jsx("div", { className: "p-6", children: _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(XCircle, { className: "w-6 h-6 text-red-600" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-red-900", children: "Health Dashboard Error" }), _jsx("p", { className: "text-red-700", children: error }), _jsx("button", { onClick: fetchHealthStatus, className: "mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors", children: "Retry" })] })] }) }) }));
    }
    if (!healthStatus)
        return null;
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Activity, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "System Health Dashboard" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Last updated: ", new Date(healthStatus.lastUpdated).toLocaleString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Uptime: ", formatUptime(healthStatus.trends.uptime)] }), _jsx("button", { onClick: fetchHealthStatus, className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors", children: "Refresh" })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Overall System Health" }), _jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(healthStatus.overall.status), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.overall.status)}`, children: healthStatus.overall.status })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Health Score" }), _jsxs("span", { className: "text-2xl font-bold", children: [healthStatus.overall.score, "/100"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: `h-3 rounded-full transition-all duration-300 ${healthStatus.overall.score >= 90 ? 'bg-green-600' :
                                                healthStatus.overall.score >= 70 ? 'bg-yellow-500' :
                                                    healthStatus.overall.score >= 50 ? 'bg-orange-500' : 'bg-red-600'}`, style: { width: `${healthStatus.overall.score}%` } }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "System Message" }), _jsx("p", { className: "text-sm text-gray-600", children: healthStatus.overall.message }), healthStatus.overall.recommendations.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "text-xs font-medium text-gray-700 mb-1", children: "Recommendations:" }), _jsx("ul", { className: "text-xs text-gray-600 space-y-1", children: healthStatus.overall.recommendations.slice(0, 2).map((rec, i) => (_jsxs("li", { className: "flex items-start space-x-1", children: [_jsx("span", { children: "\u2022" }), _jsx("span", { children: rec })] }, i))) })] }))] })] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: [
                        { id: 'overview', label: 'Overview' },
                        { id: 'components', label: 'Components' },
                        { id: 'metrics', label: 'Metrics' },
                        { id: 'alerts', label: `Alerts (${healthStatus.alerts.filter(a => !a.acknowledged).length})` },
                        { id: 'trends', label: 'Trends' }
                    ].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.id), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: tab.label }, tab.id))) }) }), activeTab === 'overview' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Component Status" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: healthStatus.components.slice(0, 6).map((component) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer", onClick: () => setSelectedComponent(component.name), children: [getCategoryIcon(component.category), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: component.name }), _jsx("p", { className: "text-xs text-gray-500", children: component.category })] }), getStatusIcon(component.status)] }, component.name))) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "System Resources" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "CPU Usage" }), _jsxs("span", { children: [healthStatus.metrics.cpu.usage.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${healthStatus.metrics.cpu.usage > 90 ? 'bg-red-600' :
                                                        healthStatus.metrics.cpu.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`, style: { width: `${healthStatus.metrics.cpu.usage}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Memory Usage" }), _jsxs("span", { children: [formatBytes(healthStatus.metrics.memory.used), " / ", formatBytes(healthStatus.metrics.memory.total)] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${healthStatus.metrics.memory.usage > 90 ? 'bg-red-600' :
                                                        healthStatus.metrics.memory.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`, style: { width: `${healthStatus.metrics.memory.usage}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Disk Usage" }), _jsxs("span", { children: [formatBytes(healthStatus.metrics.disk.used), " / ", formatBytes(healthStatus.metrics.disk.total)] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${healthStatus.metrics.disk.usage > 90 ? 'bg-red-600' :
                                                        healthStatus.metrics.disk.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`, style: { width: `${healthStatus.metrics.disk.usage}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Database Connections" }), _jsxs("span", { children: [healthStatus.metrics.database.connections, " / ", healthStatus.metrics.database.maxConnections] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "h-2 rounded-full bg-blue-600", style: { width: `${(healthStatus.metrics.database.connections / healthStatus.metrics.database.maxConnections) * 100}%` } }) })] })] })] })] })), activeTab === 'components' && (_jsx("div", { className: "bg-white rounded-lg shadow-md", children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Component Health Details" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Component" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Score" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Response Time" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Last Check" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Message" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: healthStatus.components.map((component) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [getCategoryIcon(component.category), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: component.name }), _jsx("div", { className: "text-sm text-gray-500", children: component.category })] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [getStatusIcon(component.status), _jsx("span", { className: `ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component.status)}`, children: component.status })] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [component.score, "/100"] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: component.responseTime ? `${component.responseTime}ms` : 'N/A' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: new Date(component.lastCheck).toLocaleTimeString() }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900 max-w-xs truncate", children: component.message || 'Operating normally' })] }, component.name))) })] }) })] }) })), activeTab === 'alerts' && (_jsx("div", { className: "space-y-4", children: healthStatus.alerts.length === 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 text-center", children: [_jsx(CheckCircle, { className: "w-12 h-12 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Active Alerts" }), _jsx("p", { className: "text-gray-600", children: "All systems are operating normally." })] })) : (healthStatus.alerts.map((alert) => (_jsx("div", { className: `bg-white rounded-lg shadow-md p-6 border-l-4 ${alert.severity === 'critical' ? 'border-red-500' :
                        alert.severity === 'high' ? 'border-orange-500' :
                            alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`, children: alert.severity.toUpperCase() }), alert.component && (_jsx("span", { className: "text-xs text-gray-500", children: alert.component })), _jsx("span", { className: "text-xs text-gray-500", children: new Date(alert.timestamp).toLocaleString() })] }), _jsx("h4", { className: "text-lg font-medium text-gray-900 mb-1", children: alert.title }), _jsx("p", { className: "text-gray-600 mb-3", children: alert.message }), alert.acknowledged && (_jsx("div", { className: "text-sm text-green-600", children: "\u2713 Acknowledged" }))] }), _jsxs("div", { className: "flex space-x-2", children: [!alert.acknowledged && (_jsx("button", { onClick: () => handleAlertAction(alert.id, 'acknowledge'), className: "bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700", children: "Acknowledge" })), !alert.resolvedAt && (_jsx("button", { onClick: () => handleAlertAction(alert.id, 'resolve'), className: "bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700", children: "Resolve" }))] })] }) }, alert.id)))) })), activeTab === 'metrics' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "System Performance" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700", children: "CPU Usage" }), _jsxs("span", { className: "text-sm text-gray-600", children: [healthStatus.metrics.cpu.cores, " cores"] })] }), _jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsxs("span", { children: ["Current: ", healthStatus.metrics.cpu.usage.toFixed(1), "%"] }), healthStatus.metrics.cpu.temperature && (_jsxs("span", { children: ["Temp: ", healthStatus.metrics.cpu.temperature, "\u00B0C"] }))] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${healthStatus.metrics.cpu.usage > 90 ? 'bg-red-600' :
                                                        healthStatus.metrics.cpu.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`, style: { width: `${healthStatus.metrics.cpu.usage}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700", children: "Memory Usage" }), _jsxs("span", { className: "text-sm text-gray-600", children: [formatBytes(healthStatus.metrics.memory.available), " available"] })] }), _jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsxs("span", { children: ["Used: ", formatBytes(healthStatus.metrics.memory.used)] }), _jsxs("span", { children: ["Total: ", formatBytes(healthStatus.metrics.memory.total)] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${healthStatus.metrics.memory.usage > 90 ? 'bg-red-600' :
                                                        healthStatus.metrics.memory.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`, style: { width: `${healthStatus.metrics.memory.usage}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700", children: "Disk Usage" }), healthStatus.metrics.disk.iops && (_jsxs("span", { className: "text-sm text-gray-600", children: [healthStatus.metrics.disk.iops, " IOPS"] }))] }), _jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsxs("span", { children: ["Used: ", formatBytes(healthStatus.metrics.disk.used)] }), _jsxs("span", { children: ["Total: ", formatBytes(healthStatus.metrics.disk.total)] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${healthStatus.metrics.disk.usage > 90 ? 'bg-red-600' :
                                                        healthStatus.metrics.disk.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`, style: { width: `${healthStatus.metrics.disk.usage}%` } }) })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Network & Database" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Network Traffic" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-600", children: "Bytes In" }), _jsx("div", { className: "font-medium", children: formatBytes(healthStatus.metrics.network.bytesIn) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-600", children: "Bytes Out" }), _jsx("div", { className: "font-medium", children: formatBytes(healthStatus.metrics.network.bytesOut) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-600", children: "Connections" }), _jsx("div", { className: "font-medium", children: healthStatus.metrics.network.connections })] }), healthStatus.metrics.network.latency && (_jsxs("div", { children: [_jsx("div", { className: "text-gray-600", children: "Latency" }), _jsxs("div", { className: "font-medium", children: [healthStatus.metrics.network.latency, "ms"] })] }))] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Database Performance" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Active Connections" }), _jsxs("span", { children: [healthStatus.metrics.database.connections, " / ", healthStatus.metrics.database.maxConnections] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "h-2 rounded-full bg-blue-600", style: { width: `${(healthStatus.metrics.database.connections / healthStatus.metrics.database.maxConnections) * 100}%` } }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-600", children: "Query Time" }), _jsxs("div", { className: "font-medium", children: [healthStatus.metrics.database.queryTime, "ms"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-600", children: "Queue Size" }), _jsx("div", { className: "font-medium", children: healthStatus.metrics.database.queueSize })] })] })] })] })] })] })] })), activeTab === 'trends' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Health Score Trends" }), _jsx("div", { className: "h-64 flex items-center justify-center", children: healthStatus.trends.healthScore.length > 0 ? (_jsx("div", { className: "w-full h-full bg-gray-50 rounded-lg flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-blue-600 mb-2", children: healthStatus.overall.score }), _jsx("div", { className: "text-gray-600", children: "Current Health Score" }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: ["Trend: ", healthStatus.trends.healthScore.length > 1 ?
                                                        (healthStatus.trends.healthScore[healthStatus.trends.healthScore.length - 1].value >
                                                            healthStatus.trends.healthScore[healthStatus.trends.healthScore.length - 2].value ? 'Improving' : 'Stable') : 'Stable'] })] }) })) : (_jsx("div", { className: "text-gray-500", children: "No trend data available" })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Response Time" }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600 mb-2", children: [healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 1]?.value || 0, "ms"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Average Response Time" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: healthStatus.trends.responseTime.length > 1 && (_jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 1]?.value <=
                                                        healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 2]?.value
                                                        ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`, children: healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 1]?.value <=
                                                        healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 2]?.value
                                                        ? '↓ Improving' : '↑ Slower' })) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "Error Rate" }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-red-600 mb-2", children: [healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 1]?.value || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Current Error Rate" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: healthStatus.trends.errorRate.length > 1 && (_jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 1]?.value <=
                                                        healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 2]?.value
                                                        ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 1]?.value <=
                                                        healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 2]?.value
                                                        ? '↓ Improving' : '↑ Increasing' })) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: "System Uptime" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600 mb-2", children: formatUptime(healthStatus.trends.uptime) }), _jsx("div", { className: "text-sm text-gray-600", children: "Current Uptime" }), _jsx("div", { className: "text-xs text-green-600 mt-1", children: _jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "\u2713 Stable" }) })] })] })] })] }))] }));
};
export default HealthDashboard;
