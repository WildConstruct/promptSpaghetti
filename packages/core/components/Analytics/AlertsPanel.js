import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.js';
import { AlertTriangle, DollarSign, TrendingUp, Clock, X, Check, BellOff, Filter } from 'lucide-react';
/**
 * Alert severity colors
 */
const SEVERITY_COLORS = {
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
};
/**
 * Alert type icons
 */
const ALERT_TYPE_ICONS = {
    threshold: AlertTriangle,
    budget_exceeded: DollarSign,
    unusual_usage: TrendingUp,
    performance: Clock,
    error: X
};
/**
 * Alert item component
 */
const AlertItem = ({ alert, onAcknowledge, onDismiss }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleAcknowledge = useCallback(async () => {
        setIsProcessing(true);
        try {
            await onAcknowledge(alert.id);
        }
        finally {
            setIsProcessing(false);
        }
    }, [alert.id, onAcknowledge]);
    const handleDismiss = useCallback(async () => {
        if (onDismiss) {
            setIsProcessing(true);
            try {
                await onDismiss(alert.id);
            }
            finally {
                setIsProcessing(false);
            }
        }
    }, [alert.id, onDismiss]);
    const IconComponent = ALERT_TYPE_ICONS[alert.alertType] || AlertTriangle;
    const severityClass = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info;
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };
    return (_jsxs(Card, { className: `alert-item ${severityClass} border-l-4`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(IconComponent, { className: "w-5 h-5 mt-1 flex-shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'warning' : 'secondary', children: alert.severity }), _jsx("span", { className: "text-sm text-gray-600", children: alert.alertType.replace('_', ' ') })] }), _jsx("div", { className: "font-medium mt-1", children: alert.message }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: formatTimestamp(alert.timestamp) })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setIsExpanded(!isExpanded), children: isExpanded ? 'Less' : 'More' }) })] }) }), isExpanded && (_jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Budget:" }), " ", alert.budgetAmount ? `$${alert.budgetAmount.toFixed(2)}` : 'N/A'] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Current Usage:" }), " ", alert.currentUsage ? `$${alert.currentUsage.toFixed(2)}` : 'N/A'] }), alert.threshold && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Threshold:" }), " ", alert.threshold, "%"] })), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Status:" }), " ", alert.acknowledged ? 'Acknowledged' : 'Active'] })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [!alert.acknowledged && (_jsxs(Button, { size: "sm", onClick: handleAcknowledge, disabled: isProcessing, className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4" }), isProcessing ? 'Processing...' : 'Acknowledge'] })), onDismiss && (_jsxs(Button, { size: "sm", variant: "outline", onClick: handleDismiss, disabled: isProcessing, className: "flex items-center gap-2", children: [_jsx(X, { className: "w-4 h-4" }), "Dismiss"] }))] })] }) }))] }));
};
/**
 * Alert summary card component
 */
const AlertSummaryCard = ({ alerts, title, icon, color }) => {
    return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [icon, _jsx(CardTitle, { className: "text-sm text-gray-600", children: title })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: `text-2xl font-bold ${color}`, children: alerts.length }), alerts.length > 0 && (_jsxs("div", { className: "text-sm text-gray-600", children: [alerts.filter(a => a.severity === 'critical').length, " critical,", ' ', alerts.filter(a => a.severity === 'warning').length, " warning"] }))] }) })] }));
};
/**
 * Alerts panel component
 */
export const AlertsPanel = ({ alerts, onAcknowledge, onDismiss, showSummary = true, className = '' }) => {
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('timestamp');
    /**
     * Filter alerts based on selected filter
     */
    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all')
            return true;
        return alert.severity === filter;
    });
    /**
     * Sort alerts
     */
    const sortedAlerts = [...filteredAlerts].sort((a, b) => {
        if (sortBy === 'timestamp') {
            return b.timestamp - a.timestamp;
        }
        if (sortBy === 'severity') {
            const severityOrder = { critical: 3, warning: 2, info: 1 };
            return (severityOrder[b.severity] || 0) -
                (severityOrder[a.severity] || 0);
        }
        return 0;
    });
    /**
     * Get alert counts by type
     */
    const getAlertCounts = () => {
        const counts = {
            all: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            warning: alerts.filter(a => a.severity === 'warning').length,
            info: alerts.filter(a => a.severity === 'info').length
        };
        return counts;
    };
    /**
     * Get alerts by type
     */
    const getAlertsByType = () => {
        const budgetAlerts = alerts.filter(a => a.alertType === 'budget_exceeded' || a.alertType === 'threshold');
        const performanceAlerts = alerts.filter(a => a.alertType === 'unusual_usage' || a.alertType === 'performance');
        const errorAlerts = alerts.filter(a => a.alertType === 'error');
        return { budgetAlerts, performanceAlerts, errorAlerts };
    };
    const alertCounts = getAlertCounts();
    const { budgetAlerts, performanceAlerts, errorAlerts } = getAlertsByType();
    if (alerts.length === 0) {
        return (_jsx("div", { className: `alerts-panel ${className}`, children: _jsx(Card, { children: _jsxs(CardContent, { className: "text-center py-8", children: [_jsx(BellOff, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("div", { className: "text-lg font-medium text-gray-600", children: "No Active Alerts" }), _jsx("div", { className: "text-sm text-gray-500", children: "All systems are running normally" })] }) }) }));
    }
    return (_jsxs("div", { className: `alerts-panel ${className}`, children: [showSummary && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsx(AlertSummaryCard, { alerts: budgetAlerts, title: "Budget Alerts", icon: _jsx(DollarSign, { className: "w-5 h-5 text-yellow-600" }), color: "text-yellow-600" }), _jsx(AlertSummaryCard, { alerts: performanceAlerts, title: "Performance Alerts", icon: _jsx(TrendingUp, { className: "w-5 h-5 text-blue-600" }), color: "text-blue-600" }), _jsx(AlertSummaryCard, { alerts: errorAlerts, title: "Error Alerts", icon: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }), color: "text-red-600" })] })), _jsxs(Tabs, { defaultValue: "all", className: "w-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-fit", children: [_jsxs(TabsTrigger, { value: "all", onClick: () => setFilter('all'), children: ["All (", alertCounts.all, ")"] }), _jsxs(TabsTrigger, { value: "critical", onClick: () => setFilter('critical'), children: ["Critical (", alertCounts.critical, ")"] }), _jsxs(TabsTrigger, { value: "warning", onClick: () => setFilter('warning'), children: ["Warning (", alertCounts.warning, ")"] }), _jsxs(TabsTrigger, { value: "info", onClick: () => setFilter('info'), children: ["Info (", alertCounts.info, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-500" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "timestamp", children: "Sort by Time" }), _jsx("option", { value: "severity", children: "Sort by Severity" })] })] })] }), _jsx(TabsContent, { value: "all", className: "space-y-4", children: sortedAlerts.map((alert) => (_jsx(AlertItem, { alert: alert, onAcknowledge: onAcknowledge, onDismiss: onDismiss }, alert.id))) }), _jsx(TabsContent, { value: "critical", className: "space-y-4", children: sortedAlerts.filter(a => a.severity === 'critical').map((alert) => (_jsx(AlertItem, { alert: alert, onAcknowledge: onAcknowledge, onDismiss: onDismiss }, alert.id))) }), _jsx(TabsContent, { value: "warning", className: "space-y-4", children: sortedAlerts.filter(a => a.severity === 'warning').map((alert) => (_jsx(AlertItem, { alert: alert, onAcknowledge: onAcknowledge, onDismiss: onDismiss }, alert.id))) }), _jsx(TabsContent, { value: "info", className: "space-y-4", children: sortedAlerts.filter(a => a.severity === 'info').map((alert) => (_jsx(AlertItem, { alert: alert, onAcknowledge: onAcknowledge, onDismiss: onDismiss }, alert.id))) })] }), alerts.some(a => !a.acknowledged) && (_jsx("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [alerts.filter(a => !a.acknowledged).length, " unacknowledged alerts"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                        alerts.filter(a => !a.acknowledged).forEach(alert => {
                                            onAcknowledge(alert.id);
                                        });
                                    }, children: "Acknowledge All" }), onDismiss && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                        alerts.forEach(alert => {
                                            onDismiss(alert.id);
                                        });
                                    }, children: "Dismiss All" }))] })] }) }))] }));
};
/**
 * Alerts panel styles
 */
const styles = `
  .alerts-panel {
    width: 100%;
  }

  .alert-item {
    transition: all 0.2s ease-in-out;
  }

  .alert-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .alert-item.border-l-4 {
    border-left-width: 4px;
  }

  @media (max-width: 768px) {
    .alerts-panel .grid {
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
export default AlertsPanel;
