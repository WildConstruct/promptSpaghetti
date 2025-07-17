import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { TrendingUp, TrendingDown, Activity, Users, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
/**
 * Metric card component
 */
const MetricCard = ({ title, value, subtitle, trend, progress, icon, className = '' }) => {
    const formatValue = (val) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            }
            else if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString();
        }
        return val;
    };
    const getTrendIcon = () => {
        if (!trend)
            return null;
        switch (trend.direction) {
            case 'up':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-green-500" });
            case 'down':
                return _jsx(TrendingDown, { className: "w-4 h-4 text-red-500" });
            default:
                return _jsx(Activity, { className: "w-4 h-4 text-gray-500" });
        }
    };
    const getTrendColor = () => {
        if (!trend)
            return 'text-gray-500';
        switch (trend.direction) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };
    const getProgressColor = () => {
        if (!progress)
            return 'bg-blue-500';
        switch (progress.color) {
            case 'green':
                return 'bg-green-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'red':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };
    return (_jsxs(Card, { className: `metric-card ${className}`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: title }), icon && _jsx("div", { className: "text-gray-400", children: icon })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-baseline justify-between", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: formatValue(value) }), trend && (_jsxs("div", { className: `flex items-center gap-1 text-sm ${getTrendColor()}`, children: [getTrendIcon(), _jsxs("span", { children: [trend.value > 0 ? '+' : '', trend.value, "%"] })] }))] }), subtitle && (_jsx("div", { className: "text-sm text-gray-500", children: subtitle })), trend && (_jsx("div", { className: "text-xs text-gray-400", children: trend.label })), progress && (_jsxs("div", { className: "space-y-1", children: [_jsx(Progress, { value: (progress.value / progress.max) * 100, className: `h-2 ${getProgressColor()}` }), _jsxs("div", { className: "text-xs text-gray-500", children: [progress.value, " / ", progress.max, " (", ((progress.value / progress.max) * 100).toFixed(1), "%)"] })] }))] }) })] }));
};
/**
 * Metrics overview component
 */
export const MetricsOverview = ({ summary, dashboardData, loading }) => {
    if (loading) {
        return (_jsx("div", { className: "metrics-overview", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(8)].map((_, i) => (_jsxs(Card, { className: "animate-pulse", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx("div", { className: "h-4 bg-gray-200 rounded w-24" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-16 mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-20" })] })] }, i))) }) }));
    }
    if (!summary || !dashboardData) {
        return (_jsx("div", { className: "metrics-overview", children: _jsx("div", { className: "text-center py-8 text-gray-500", children: "No metrics data available" }) }));
    }
    const formatDuration = (ms) => {
        if (ms < 1000)
            return `${ms}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };
    const analytics = dashboardData.analytics || {};
    const executions = analytics.executions || {};
    const usage = analytics.usage || {};
    const costs = analytics.costs || {};
    return (_jsxs("div", { className: "metrics-overview", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MetricCard, { title: "Total Executions", value: executions.total || 0, subtitle: `${executions.successful || 0} successful`, trend: {
                            direction: executions.total > 0 ? 'up' : 'stable',
                            value: 12.5,
                            label: 'vs last period'
                        }, progress: {
                            value: executions.successful || 0,
                            max: executions.total || 1,
                            color: executions.total > 0 && (executions.successful / executions.total) > 0.9 ? 'green' : 'yellow'
                        }, icon: _jsx(CheckCircle, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Success Rate", value: `${summary.successRate ? summary.successRate.toFixed(1) : 0}%`, subtitle: `${executions.failed || 0} failed`, trend: {
                            direction: summary.successRate > 90 ? 'up' : summary.successRate < 80 ? 'down' : 'stable',
                            value: 2.3,
                            label: 'vs last period'
                        }, icon: summary.successRate > 90 ? _jsx(CheckCircle, { className: "w-5 h-5" }) : _jsx(XCircle, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Active Users", value: usage.totalUsers || 0, subtitle: `${usage.activeSessions || 0} active sessions`, trend: {
                            direction: 'up',
                            value: 8.2,
                            label: 'vs last period'
                        }, icon: _jsx(Users, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Avg Execution Time", value: formatDuration(executions.averageTime || 0), subtitle: "Per execution", trend: {
                            direction: 'down',
                            value: -5.1,
                            label: 'vs last period'
                        }, icon: _jsx(Clock, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Total Cost", value: formatCurrency(costs.totalSpent || 0), subtitle: `${formatCurrency(costs.dailyAverage || 0)}/day avg`, trend: {
                            direction: 'up',
                            value: 15.3,
                            label: 'vs last period'
                        }, icon: _jsx(DollarSign, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Token Usage", value: summary.totalTokenUsage || 0, subtitle: "Total tokens consumed", trend: {
                            direction: 'up',
                            value: 22.1,
                            label: 'vs last period'
                        }, icon: _jsx(Activity, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Top Provider", value: costs.topProviders?.[0]?.provider || 'N/A', subtitle: costs.topProviders?.[0] ? formatCurrency(costs.topProviders[0].cost) : 'No data', icon: _jsx(Activity, { className: "w-5 h-5" }) }), _jsx(MetricCard, { title: "Budget Alerts", value: costs.budgetAlerts?.length || 0, subtitle: costs.budgetAlerts?.length > 0 ? 'Require attention' : 'All good', progress: costs.budgetAlerts?.length > 0 ? {
                            value: costs.budgetAlerts.length,
                            max: 5,
                            color: costs.budgetAlerts.length > 3 ? 'red' : costs.budgetAlerts.length > 1 ? 'yellow' : 'green'
                        } : undefined, icon: costs.budgetAlerts?.length > 0 ? _jsx(XCircle, { className: "w-5 h-5" }) : _jsx(CheckCircle, { className: "w-5 h-5" }) })] }), usage.popularNodes && usage.popularNodes.length > 0 && (_jsxs(Card, { className: "mt-6", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Popular Node Types" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: usage.popularNodes.slice(0, 5).map((node, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "outline", children: index + 1 }), _jsx("span", { className: "font-medium", children: node.type })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [node.count, " uses"] }), _jsx("div", { className: "w-20 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: {
                                                        width: `${Math.min(100, (node.count / Math.max(...usage.popularNodes.map((n) => n.count))) * 100)}%`
                                                    } }) })] })] }, node.type))) }) })] }))] }));
};
/**
 * Metrics overview styles
 */
const styles = `
  .metrics-overview {
    width: 100%;
  }

  .metric-card {
    transition: all 0.2s ease-in-out;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .metric-card .progress {
    transition: all 0.3s ease-in-out;
  }

  @media (max-width: 768px) {
    .metrics-overview .grid {
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
export default MetricsOverview;
