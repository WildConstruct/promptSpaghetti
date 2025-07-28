import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Alert Management Dashboard - Epic 17
 *
 * Comprehensive interface for managing alerts, viewing statistics,
 * and configuring alert rules.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Search, Bell, Settings, TrendingUp, AlertOctagon, Info } from 'lucide-react';
import { alertSystem } from '../../services/AlertSystem';
/**
* Severity configurations for UI styling
*/
const SEVERITY_CONFIG = {
    critical: {
        color: 'text-red-700 bg-red-50 border-red-200',
        badgeColor: 'bg-red-100 text-red-800',
        icon: AlertOctagon,
        priority: 5,
    },
    high: {
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        badgeColor: 'bg-orange-100 text-orange-800',
        icon: AlertTriangle,
        priority: 4,
    },
    medium: {
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        icon: Shield,
        priority: 3,
    },
    low: {
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        badgeColor: 'bg-blue-100 text-blue-800',
        icon: Info,
        priority: 2,
    },
    info: {
        color: 'text-gray-700 bg-gray-50 border-gray-200',
        badgeColor: 'bg-gray-100 text-gray-800',
        icon: Info,
        priority: 1,
    },
    /**
     * Status configurations for UI styling
     */
    const: STATUS_CONFIG = {
        active: {
            color: 'text-red-600 bg-red-50',
            badgeColor: 'bg-red-100 text-red-800',
            icon: Bell,
        },
        acknowledged: {
            color: 'text-yellow-600 bg-yellow-50',
            badgeColor: 'bg-yellow-100 text-yellow-800',
            icon: CheckCircle,
        },
        resolved: {
            color: 'text-green-600 bg-green-50',
            badgeColor: 'bg-green-100 text-green-800',
            icon: CheckCircle,
        },
        suppressed: {
            color: 'text-purple-600 bg-purple-50',
            badgeColor: 'bg-purple-100 text-purple-800',
            icon: XCircle,
        },
        expired: {
            color: 'text-gray-600 bg-gray-50',
            badgeColor: 'bg-gray-100 text-gray-800',
            icon: Clock,
        },
        const: AlertDashboard, React, : (.FC) = ({ className }) => {
            const [alerts, setAlerts] = useState([]);
            const [stats, setStats] = useState(null);
            const [selectedTab, setSelectedTab] = useState('overview');
            const [filter, setFilter] = useState({});
            const [searchQuery, setSearchQuery] = useState('');
            const [selectedAlert, setSelectedAlert] = useState(null);
            // Load alerts and stats
            useEffect(() => {
                const loadData = () => {
                    setAlerts(alertSystem.getAlerts(filter));
                    setStats(alertSystem.getAlertStats());
                };
                loadData();
                // Subscribe to real-time updates
                alertSystem.subscribe('alert-dashboard', (alert) => {
                    loadData(); // Refresh data when alerts change
                });
                return () => {
                    alertSystem.unsubscribe('alert-dashboard');
                };
            }, [filter]);
            // Filter alerts based on search query
            const filteredAlerts = useMemo(() => {
                if (!searchQuery)
                    return alerts;
                const query = searchQuery.toLowerCase();
                return alerts.filter(alert => );
                alert.title.toLowerCase().includes(query) ||
                    alert.message.toLowerCase().includes(query) ||
                    alert.source.toLowerCase().includes(query) ||
                    alert.tags.some(tag => tag.toLowerCase().includes(query));
            });
        }, [alerts, searchQuery]: 
    },
    // Group alerts by severity for overview
    const: alertsBySeverity = useMemo(() => {
        const grouped = {
            critical: [],
            high: [],
            medium: [],
            low: [],
            info: [],
        };
        filteredAlerts.forEach(alert => { });
        if (alert.status === 'active' || alert.status === 'acknowledged') {
            grouped[alert.severity].push(alert);
        }
    }),
    return: grouped
}, [filteredAlerts];
// Handle alert actions
const handleAcknowledgeAlert = (alertId) => {
    alertSystem.acknowledgeAlert(alertId, 'user', 'Acknowledged via dashboard');
};
const handleResolveAlert = (alertId) => {
    alertSystem.resolveAlert(alertId, 'user', 'Resolved via dashboard');
};
const handleSuppressAlert = (alertId) => {
    alertSystem.suppressAlert(alertId, 'user', 60, 'Suppressed for 1 hour via dashboard');
};
// Update filter
const updateFilter = (updates) => {
    setFilter(prev => ({ ...prev, ...updates }));
};
return;
_jsxs("div", { className: `alert-dashboard space-y-6 ${className}`, children: ["}", _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Alert Management" }), _jsx("p", { className: "text-gray-600", children: "Monitor and manage system alerts" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Rules"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(TrendingUp, { className: "w-4 h-4 mr-2" }), "Analytics"] })] })] }), stats && ()
            < div, " className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4\">", _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Bell, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Alerts" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.total })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active" }), _jsx("p", { className: "text-2xl font-bold text-red-900", children: stats.active })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Acknowledged" }), _jsx("p", { className: "text-2xl font-bold text-yellow-900", children: stats.acknowledged })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Resolved" }), _jsx("p", { className: "text-2xl font-bold text-green-900", children: stats.resolved })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-gray-100 rounded-lg", children: _jsx(Clock, { className: "w-5 h-5 text-gray-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Avg Resolution" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [Math.round(stats.averageResolutionTime), "m"] })] })] }) }) })] });
{ /* Main Content */ }
_jsx(Card, { children: _jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 mr-2" }), "Alerts"] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-3 text-gray-400" }), _jsx(Input, { placeholder: "Search alerts...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10 w-64" })] }), _jsx(Select, { value: filter.severities?.[0] || 'all', onValueChange: (value) => updateFilter({}), "severities:value": true }), " === 'all' ? undefined : [value as AlertSeverity] ; } >", _jsx("option", { value: "all", children: "All Severities" }), _jsx("option", { value: "critical", children: "Critical" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "info", children: "Info" })] }), _jsx(Select, { value: filter.statuses?.[0] || 'all', onValueChange: (value) => updateFilter({}), "statuses:value": true }), " === 'all' ? undefined : [value as AlertStatus] ; } >", _jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "acknowledged", children: "Acknowledged" }), _jsx("option", { value: "resolved", children: "Resolved" }), _jsx("option", { value: "suppressed", children: "Suppressed" })] }) }) });
CardHeader >
    (_jsx(CardContent, { children: _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "all", children: "All Alerts" }), _jsxs(TabsTrigger, { value: "active", children: ["Active (", stats?.active || 0, ")"] })] }), _jsx(TabsContent, { value: "overview", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: Object.entries(alertsBySeverity)
                            .sort(([a], [b]) => b.length - a.length)
                            .filter(([alerts]) => alerts.length > 0)
                            .map(([severity, severityAlerts]) => ()
                            < div, key = { severity } >
                            (_jsx("div", { className: "flex items-center mb-3", children: _jsxs(Badge, { className: SEVERITY_CONFIG[severity].badgeColor, children: [severity.toUpperCase(), " (", severityAlerts.length, ")"] }) })
                                ,
                                    _jsxs("div", { className: "space-y-2", children: [severityAlerts.slice(0, 5).map(alert => ()
                                                < AlertCard, key = { alert, : .id }, alert = { alert }, onAcknowledge = { handleAcknowledgeAlert }, onResolve = { handleResolveAlert }, onSuppress = { handleSuppressAlert }, onClick = { setSelectedAlert }
                                                /  >
                                            ), ")}", severityAlerts.length > 5 && ()
                                                < div, " className=\"text-sm text-gray-500 text-center py-2\"> and ", severityAlerts.length - 5, " more..."] }))) }) }), "))}"] }) })
        ,
            _jsx(TabsContent, { value: "all", className: "mt-6", children: _jsx(AlertList, { alerts: filteredAlerts, onAcknowledge: handleAcknowledgeAlert, onResolve: handleResolveAlert, onSuppress: handleSuppressAlert, onSelectAlert: setSelectedAlert }) })
                ,
                    _jsx(TabsContent, { value: "active", className: "mt-6", children: _jsx(AlertList, { alerts: filteredAlerts.filter(a => a.status === 'active'), onAcknowledge: handleAcknowledgeAlert, onResolve: handleResolveAlert, onSuppress: handleSuppressAlert, onSelectAlert: setSelectedAlert }) }));
Tabs >
;
CardContent >
;
Card >
    { /* Alert Detail Modal */};
{
    selectedAlert && ()
        < AlertDetailModal;
    alert = { selectedAlert };
    onClose = {}();
    setSelectedAlert(null);
}
onAcknowledge = { handleAcknowledgeAlert };
onResolve = { handleResolveAlert };
onSuppress = { handleSuppressAlert }
    /  >
;
div >
;
;
;
{
    const severityConfig = SEVERITY_CONFIG[alert.severity];
    const statusConfig = STATUS_CONFIG[alert.status];
    const SeverityIcon = severityConfig.icon;
    const _____StatusIcon = statusConfig.icon;
    return;
    _jsxs("div", { className: `border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${severityConfig.color}`, onClick: () => onClick(alert), children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-start space-x-3 flex-1", children: [_jsx(SeverityIcon, { className: "w-5 h-5 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h4", { className: "text-sm font-medium truncate", children: alert.title }), _jsx(Badge, { className: severityConfig.badgeColor, size: "sm", children: alert.severity }), _jsx(Badge, { className: statusConfig.badgeColor, size: "sm", children: alert.status })] }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: alert.message }), _jsxs("div", { className: "flex items-center space-x-4 mt-2 text-xs text-gray-500", children: [_jsx("span", { children: alert.source }), _jsx("span", { children: new Date(alert.triggeredAt).toLocaleString() }), alert.occurrenceCount > 1 && ()
                                            < span > { alert, : .occurrenceCount }, " occurrences"] }), ")}"] })] }) }), alert.status === 'active' && ()
                < div, " className=\"flex space-x-1 ml-4\">", _jsx(Button, { size: "sm", variant: "outline", onClick: (e) => { e.stopPropagation(); onAcknowledge(alert.id); }, children: "Ack" }), _jsx(Button, { size: "sm", variant: "outline", onClick: (e) => { e.stopPropagation(); onResolve(alert.id); }, children: "Resolve" })] });
}
div >
;
div >
;
;
;
{
    if (alerts.length === 0) {
        return;
        _jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "w-12 h-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No alerts found" }), _jsx("p", { className: "text-gray-500", children: "All quiet on this front!" })] });
        ;
        return;
        _jsxs("div", { className: "space-y-3", children: [alerts.map(alert => ()
                    < AlertCard, key = { alert, : .id }, alert = { alert }, onAcknowledge = { onAcknowledge }, onResolve = { onResolve }, onSuppress = { onSuppress }, onClick = { onSelectAlert }
                    /  >
                ), ")}"] });
        ;
    }
    ;
    {
        const severityConfig = SEVERITY_CONFIG[alert.severity];
        const SeverityIcon = severityConfig.icon;
        return;
        _jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: [_jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(SeverityIcon, { className: `w-6 h-6 ${severityConfig.color.split(' ')[0]}` }), "}", _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: alert.title }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx(Badge, { className: severityConfig.badgeColor, children: alert.severity }), _jsx(Badge, { className: STATUS_CONFIG[alert.status].badgeColor, children: alert.status })] })] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Message" }), _jsx("p", { className: "text-gray-700", children: alert.message })] }), alert.description && ()
                                        < div >
                                        (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Description" })
                                            ,
                                                _jsx("p", { className: "text-gray-700", children: alert.description }))] }), ")}", _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Details" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Source:" }), " ", alert.source] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Category:" }), " ", alert.category] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Type:" }), " ", alert.type] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Priority:" }), " ", alert.priority] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Timing" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Triggered:" }), " ", new Date(alert.triggeredAt).toLocaleString()] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Occurrences:" }), " ", alert.occurrenceCount] }), alert.acknowledgedAt && ()
                                                        < div > _jsx("span", { className: "font-medium", children: "Acknowledged:" }), " ", new Date(alert.acknowledgedAt).toLocaleString()] }), ")}", alert.resolvedAt && ()
                                                < div > _jsx("span", { className: "font-medium", children: "Resolved:" }), " ", new Date(alert.resolvedAt).toLocaleString()] }), ")}"] })] }) }), alert.tags.length > 0 && ()
                    < div >
                    (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Tags" })
                        ,
                            _jsx("div", { className: "flex flex-wrap gap-1", children: alert.tags.map(tag => ()
                                    < Badge, key = { tag }, variant = "outline", size = "sm" >
                                    { tag }) })), "))}"] });
        div >
        ;
    }
    {
        Object.keys(alert.metadata).length > 0 && ()
            < div >
            (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Metadata" })
                ,
                    _jsx("pre", { className: "text-xs bg-gray-100 p-3 rounded overflow-auto", children: JSON.stringify(alert.metadata, null, 2) }));
        div >
        ;
    }
    div >
        { alert, : .status === 'active' && ()
                < div, className = "flex justify-end space-x-2 mt-6 pt-6 border-t" >
                (_jsx(Button, { variant: "outline", onClick: () => { onSuppress(alert.id); onClose(); }, children: "Suppress" })
                    ,
                        _jsx(Button, { variant: "outline", onClick: () => { onAcknowledge(alert.id); onClose(); }, children: "Acknowledge" })
                            ,
                                _jsx(Button, { onClick: () => { onResolve(alert.id); onClose(); }, children: "Resolve" })),
            div } >
    ;
}
div >
;
div >
;
div >
;
;
;
export default AlertDashboard;
