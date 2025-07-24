import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Compliance Baseline Dashboard Component
 * Provides comprehensive compliance monitoring with baseline tracking for directors
 */
import { useState, useEffect } from 'react';
import { enhancedComplianceMonitor } from '../services/ComplianceMonitor.js';
const ComplianceDashboard = ({ className = '', autoRefresh = true, refreshInterval = 300000 // 5 minutes
 }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedFramework, setSelectedFramework] = useState('overview');
    const [selectedTimeRange, setSelectedTimeRange] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [frameworkTrends, setFrameworkTrends] = useState({});
    useEffect(() => {
        loadDashboardData();
        if (autoRefresh) {
            const interval = setInterval(loadDashboardData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);
    useEffect(() => {
        if (selectedFramework !== 'overview') {
            loadFrameworkTrends(selectedFramework);
        }
    }, [selectedFramework, selectedTimeRange]);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const data = await enhancedComplianceMonitor.generateEnhancedDashboard();
            setDashboardData(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        }
        finally {
            setLoading(false);
        }
    };
    const loadFrameworkTrends = async (framework) => {
        try {
            const trends = await enhancedComplianceMonitor.getFrameworkTrendAnalysis(framework, selectedTimeRange);
            setFrameworkTrends(prev => ({ ...prev, [framework]: trends }));
        }
        catch (err) {
            console.error('Failed to load framework trends:', err);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
            case 'ready':
            case 'compliant':
                return 'text-green-600 bg-green-100';
            case 'warning':
            case 'needs_preparation':
                return 'text-yellow-600 bg-yellow-100';
            case 'critical':
            case 'not_ready':
            case 'non_compliant':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };
    const getHealthScoreColor = (score) => {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 70)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    if (loading) {
        return (_jsx("div", { className: `compliance-dashboard ${className}`, children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-300 rounded mb-4" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "h-24 bg-gray-300 rounded" }, i))) }), _jsx("div", { className: "h-64 bg-gray-300 rounded" })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: `compliance-dashboard ${className}`, children: _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-red-400", children: "\u26A0\uFE0F" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Dashboard Error" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error }), _jsx("div", { className: "mt-4", children: _jsx("button", { onClick: loadDashboardData, className: "bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium", children: "Retry" }) })] })] }) }) }));
    }
    if (!dashboardData)
        return null;
    return (_jsxs("div", { className: `compliance-dashboard ${className} space-y-6`, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Compliance Dashboard" }), _jsx("p", { className: "text-sm text-gray-600", children: "Real-time compliance monitoring with baseline tracking" })] }), _jsxs("div", { className: "flex space-x-4", children: [_jsxs("select", { value: selectedTimeRange, onChange: (e) => setSelectedTimeRange(Number(e.target.value)), className: "border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: 7, children: "Last 7 days" }), _jsx("option", { value: 30, children: "Last 30 days" }), _jsx("option", { value: 90, children: "Last 90 days" })] }), _jsx("button", { onClick: loadDashboardData, className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium", children: "Refresh" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-2xl", children: "\uD83C\uDFAF" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Overall Health" }), _jsxs("p", { className: `text-2xl font-bold ${getHealthScoreColor(dashboardData.overallScore)}`, children: [dashboardData.overallScore, "%"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDCCA" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Baseline Health" }), _jsxs("p", { className: `text-2xl font-bold ${getHealthScoreColor(dashboardData.baselineTracking.overallBaselineHealth)}`, children: [dashboardData.baselineTracking.overallBaselineHealth, "%"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-2xl", children: "\u2705" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Baselines Met" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [dashboardData.baselineTracking.baselinesMet, " / ", dashboardData.baselineTracking.totalBaselines] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDEA8" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Critical Issues" }), _jsx("p", { className: `text-2xl font-bold ${dashboardData.baselineTracking.criticalDeviations > 0 ? 'text-red-600' : 'text-green-600'}`, children: dashboardData.baselineTracking.criticalDeviations })] })] }) })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: ['overview', 'GDPR', 'SOC2', 'MPA', 'INTERNAL'].map((framework) => (_jsx("button", { onClick: () => setSelectedFramework(framework), className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${selectedFramework === framework
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: framework === 'overview' ? 'Overview' : framework }, framework))) }) }), selectedFramework === 'overview' ? (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Framework Health" }) }), _jsx("div", { className: "p-6 space-y-4", children: Object.entries(dashboardData.baselineTracking.frameworkBaselines).map(([framework, data]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "font-medium text-gray-900 w-20", children: framework }), _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.status)}`, children: data.status })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [data.baselinesMet, "/", data.totalBaselines, " baselines"] }), _jsxs("span", { className: `font-semibold ${getHealthScoreColor(data.averagePerformance)}`, children: [data.averagePerformance, "%"] })] })] }, framework))) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Trend Analysis" }) }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Improving Metrics" }), _jsxs("span", { className: "text-green-600 font-semibold", children: ["\u2197\uFE0F ", dashboardData.historicalTrends.improvingMetrics] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Stable Metrics" }), _jsxs("span", { className: "text-blue-600 font-semibold", children: ["\u27A1\uFE0F ", dashboardData.historicalTrends.stableMetrics] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Declining Metrics" }), _jsxs("span", { className: "text-red-600 font-semibold", children: ["\u2198\uFE0F ", dashboardData.historicalTrends.decliningMetrics] })] })] })] }), dashboardData.historicalTrends.forecastAlerts.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow lg:col-span-2", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Forecast Alerts" }) }), _jsx("div", { className: "p-6 space-y-4", children: dashboardData.historicalTrends.forecastAlerts.map((alert, index) => (_jsx("div", { className: `p-4 rounded-lg border ${alert.risk === 'high' ? 'bg-red-50 border-red-200' :
                                        alert.risk === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-blue-50 border-blue-200'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900", children: [alert.metric, " (", alert.framework, ")"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: alert.predictedIssue })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${alert.risk === 'high' ? 'text-red-800 bg-red-100' :
                                                            alert.risk === 'medium' ? 'text-yellow-800 bg-yellow-100' :
                                                                'text-blue-800 bg-blue-100'}`, children: [alert.risk, " risk"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: alert.timeframe })] })] }) }, index))) })] })), _jsxs("div", { className: "bg-white rounded-lg shadow lg:col-span-2", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Audit Readiness" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Overall readiness: ", dashboardData.auditReadiness.overallReadiness, "%"] })] }), _jsx("div", { className: "p-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(dashboardData.auditReadiness.frameworkReadiness).map(([framework, readiness]) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: framework }), _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(readiness.status)}`, children: readiness.status.replace('_', ' ') })] }), _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Readiness Score" }), _jsxs("span", { className: `font-semibold ${getHealthScoreColor(readiness.score)}`, children: [readiness.score, "%"] })] }), readiness.nextAuditDue && (_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Next Audit" }), _jsx("span", { className: "text-sm text-gray-900", children: formatDate(new Date(readiness.nextAuditDue)) })] })), readiness.missingEvidence.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-xs text-gray-600 mb-1", children: "Missing Evidence:" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [readiness.missingEvidence.slice(0, 2).map((evidence, idx) => (_jsx("span", { className: "inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded", children: evidence }, idx))), readiness.missingEvidence.length > 2 && (_jsxs("span", { className: "inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded", children: ["+", readiness.missingEvidence.length - 2, " more"] }))] })] }))] }, framework))) }) })] })] })) : (
            /* Framework-specific view */
            _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("h3", { className: "text-lg font-medium text-gray-900", children: [selectedFramework, " Detailed Analysis"] }) }), _jsx("div", { className: "p-6", children: frameworkTrends[selectedFramework] ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [frameworkTrends[selectedFramework].summary.averageCompliance, "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Average Compliance" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: frameworkTrends[selectedFramework].summary.totalDataPoints }), _jsx("p", { className: "text-sm text-gray-600", children: "Data Points" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("p", { className: `text-2xl font-bold ${frameworkTrends[selectedFramework].summary.improvementTrend === 'positive' ? 'text-green-600' :
                                                        frameworkTrends[selectedFramework].summary.improvementTrend === 'negative' ? 'text-red-600' :
                                                            'text-blue-600'}`, children: frameworkTrends[selectedFramework].summary.improvementTrend === 'positive' ? '↗️' :
                                                        frameworkTrends[selectedFramework].summary.improvementTrend === 'negative' ? '↘️' : '➡️' }), _jsxs("p", { className: "text-sm text-gray-600", children: [frameworkTrends[selectedFramework].summary.improvementTrend.charAt(0).toUpperCase() +
                                                            frameworkTrends[selectedFramework].summary.improvementTrend.slice(1), " Trend"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Metrics Performance" }), _jsx("div", { className: "space-y-3", children: frameworkTrends[selectedFramework].metrics.map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: metric.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Current: ", metric.currentValue, "% | Average: ", metric.historicalAverage, "%"] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `text-lg ${metric.trendDirection === 'up' ? 'text-green-600' :
                                                                        metric.trendDirection === 'down' ? 'text-red-600' : 'text-blue-600'}`, children: metric.trendDirection === 'up' ? '↗️' :
                                                                        metric.trendDirection === 'down' ? '↘️' : '➡️' }), _jsxs("span", { className: "text-sm text-gray-600", children: [metric.complianceRate, "% compliant"] })] }) })] }, index))) })] })] })) : (_jsx("div", { className: "text-center py-8", children: _jsxs("p", { className: "text-gray-600", children: ["Loading ", selectedFramework, " analysis..."] }) })) })] }))] }));
};
export default ComplianceDashboard;
