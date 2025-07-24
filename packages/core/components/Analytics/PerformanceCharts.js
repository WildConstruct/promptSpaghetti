import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select.js';
import { Button } from '../ui/Button.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
/**
 * Time series chart component
 */
const TimeSeriesChart = ({ data, title, metric, unit, color, loading, error }) => {
    const formatValue = (value) => {
        if (unit === 'ms') {
            return value < 1000 ? `${value}ms` : `${(value / 1000).toFixed(1)}s`;
        }
        if (unit === 'currency') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(value);
        }
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString();
    };
    const formatXAxis = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: title }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) }) })] }));
    }
    if (error) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: title }) }), _jsx(CardContent, { children: _jsxs("div", { className: "h-64 flex items-center justify-center text-red-500", children: [_jsx(AlertTriangle, { className: "w-5 h-5 mr-2" }), error] }) })] }));
    }
    if (!data || data.length === 0) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: title }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center text-gray-500", children: "No data available" }) })] }));
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: title }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "timestamp", tickFormatter: formatXAxis, fontSize: 12, tick: { fill: '#6B7280' } }), _jsx(YAxis, { tickFormatter: formatValue, fontSize: 12, tick: { fill: '#6B7280' } }), _jsx(Tooltip, { formatter: (value) => [formatValue(value), metric], labelFormatter: (timestamp) => formatXAxis(timestamp), contentStyle: {
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    } }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: color, strokeWidth: 2, dot: { fill: color, strokeWidth: 2, r: 4 }, activeDot: { r: 6 } })] }) }) }) })] }));
};
/**
 * Performance charts component
 */
export const PerformanceCharts = ({ analyticsClient, timeRange, userId, organizationId }) => {
    const [state, setState] = useState({
        executionsData: [],
        tokensData: [],
        costData: [],
        errorsData: [],
        granularity: 'hour',
        loading: {
            executions: true,
            tokens: true,
            cost: true,
            errors: true
        },
        errors: {}
    });
    /**
     * Load chart data
     */
    const loadChartData = useCallback(async () => {
        const metrics = ['executions', 'tokens', 'cost', 'errors'];
        setState(prev => ({
            ...prev,
            loading: {
                executions: true,
                tokens: true,
                cost: true,
                errors: true
            },
            errors: {}
        }));
        // Load all metrics in parallel
        const results = await Promise.allSettled(metrics.map(metric => analyticsClient.getTimeSeries(metric, {
            ...timeRange,
            granularity: state.granularity
        })));
        const newState = {
            executionsData: [],
            tokensData: [],
            costData: [],
            errorsData: [],
            loading: {
                executions: false,
                tokens: false,
                cost: false,
                errors: false
            },
            errors: {}
        };
        results.forEach((result, index) => {
            const metric = metrics[index];
            if (result.status === 'fulfilled' && result.value.success) {
                const data = result.value.data.dataPoints || [];
                switch (metric) {
                    case 'executions':
                        newState.executionsData = data;
                        break;
                    case 'tokens':
                        newState.tokensData = data;
                        break;
                    case 'cost':
                        newState.costData = data;
                        break;
                    case 'errors':
                        newState.errorsData = data;
                        break;
                }
            }
            else {
                const error = result.status === 'rejected'
                    ? result.reason.message
                    : 'Failed to load data';
                newState.errors[metric] = error;
            }
        });
        setState(prev => ({
            ...prev,
            ...newState
        }));
    }, [analyticsClient, timeRange, state.granularity]);
    /**
     * Handle granularity change
     */
    const handleGranularityChange = useCallback((newGranularity) => {
        setState(prev => ({ ...prev, granularity: newGranularity }));
    }, []);
    /**
     * Calculate trend
     */
    const calculateTrend = useCallback((data) => {
        if (data.length < 2)
            return null;
        const recent = data.slice(-Math.floor(data.length / 2));
        const earlier = data.slice(0, Math.floor(data.length / 2));
        const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, d) => sum + d.value, 0) / earlier.length;
        if (earlierAvg === 0)
            return null;
        const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
        return {
            direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
            value: Math.abs(change),
            isPositive: change > 0
        };
    }, []);
    /**
     * Refresh data
     */
    const handleRefresh = useCallback(() => {
        loadChartData();
    }, [loadChartData]);
    /**
     * Load data on mount and dependency changes
     */
    useEffect(() => {
        loadChartData();
    }, [loadChartData]);
    const executionsTrend = calculateTrend(state.executionsData);
    const tokensTrend = calculateTrend(state.tokensData);
    const costTrend = calculateTrend(state.costData);
    const errorsTrend = calculateTrend(state.errorsData);
    return (_jsxs("div", { className: "performance-charts", children: [_jsxs("div", { className: "charts-header", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Performance Metrics" }), _jsxs("div", { className: "header-controls", children: [_jsxs(Select, { value: state.granularity, onValueChange: handleGranularityChange, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "hour", children: "Hourly" }), _jsx(SelectItem, { value: "day", children: "Daily" })] })] }), _jsx(Button, { variant: "outline", onClick: handleRefresh, children: "Refresh" })] })] }), _jsx("div", { className: "trend-summary", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "trend-card", children: [_jsx("div", { className: "trend-label", children: "Executions" }), _jsx("div", { className: "trend-value", children: state.executionsData.length > 0 && (_jsx(_Fragment, { children: executionsTrend && (_jsxs("div", { className: `trend-indicator ${executionsTrend.direction}`, children: [executionsTrend.direction === 'up' ? _jsx(TrendingUp, { className: "w-4 h-4" }) :
                                                    executionsTrend.direction === 'down' ? _jsx(TrendingDown, { className: "w-4 h-4" }) :
                                                        _jsx(Activity, { className: "w-4 h-4" }), _jsxs("span", { children: [executionsTrend.value.toFixed(1), "%"] })] })) })) })] }), _jsxs("div", { className: "trend-card", children: [_jsx("div", { className: "trend-label", children: "Token Usage" }), _jsx("div", { className: "trend-value", children: state.tokensData.length > 0 && (_jsx(_Fragment, { children: tokensTrend && (_jsxs("div", { className: `trend-indicator ${tokensTrend.direction}`, children: [tokensTrend.direction === 'up' ? _jsx(TrendingUp, { className: "w-4 h-4" }) :
                                                    tokensTrend.direction === 'down' ? _jsx(TrendingDown, { className: "w-4 h-4" }) :
                                                        _jsx(Activity, { className: "w-4 h-4" }), _jsxs("span", { children: [tokensTrend.value.toFixed(1), "%"] })] })) })) })] }), _jsxs("div", { className: "trend-card", children: [_jsx("div", { className: "trend-label", children: "Cost" }), _jsx("div", { className: "trend-value", children: state.costData.length > 0 && (_jsx(_Fragment, { children: costTrend && (_jsxs("div", { className: `trend-indicator ${costTrend.direction}`, children: [costTrend.direction === 'up' ? _jsx(TrendingUp, { className: "w-4 h-4" }) :
                                                    costTrend.direction === 'down' ? _jsx(TrendingDown, { className: "w-4 h-4" }) :
                                                        _jsx(Activity, { className: "w-4 h-4" }), _jsxs("span", { children: [costTrend.value.toFixed(1), "%"] })] })) })) })] }), _jsxs("div", { className: "trend-card", children: [_jsx("div", { className: "trend-label", children: "Errors" }), _jsx("div", { className: "trend-value", children: state.errorsData.length > 0 && (_jsx(_Fragment, { children: errorsTrend && (_jsxs("div", { className: `trend-indicator ${errorsTrend.direction === 'up' ? 'up-bad' : errorsTrend.direction === 'down' ? 'down-good' : 'stable'}`, children: [errorsTrend.direction === 'up' ? _jsx(TrendingUp, { className: "w-4 h-4" }) :
                                                    errorsTrend.direction === 'down' ? _jsx(TrendingDown, { className: "w-4 h-4" }) :
                                                        _jsx(Activity, { className: "w-4 h-4" }), _jsxs("span", { children: [errorsTrend.value.toFixed(1), "%"] })] })) })) })] })] }) }), _jsxs("div", { className: "charts-grid", children: [_jsx(TimeSeriesChart, { data: state.executionsData, title: "Graph Executions", metric: "Executions", unit: "count", color: "#3B82F6", loading: state.loading.executions, error: state.errors.executions }), _jsx(TimeSeriesChart, { data: state.tokensData, title: "Token Usage", metric: "Tokens", unit: "count", color: "#10B981", loading: state.loading.tokens, error: state.errors.tokens }), _jsx(TimeSeriesChart, { data: state.costData, title: "Cost Tracking", metric: "Cost", unit: "currency", color: "#F59E0B", loading: state.loading.cost, error: state.errors.cost }), _jsx(TimeSeriesChart, { data: state.errorsData, title: "Error Rate", metric: "Errors", unit: "count", color: "#EF4444", loading: state.loading.errors, error: state.errors.errors })] })] }));
};
/**
 * Performance charts styles
 */
const styles = `
  .performance-charts {
    space-y: 1.5rem;
  }

  .charts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .trend-summary {
    margin-bottom: 1.5rem;
  }

  .trend-card {
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .trend-label {
    font-size: 0.875rem;
    color: #6B7280;
    margin-bottom: 0.5rem;
  }

  .trend-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .trend-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .trend-indicator.up {
    color: #10B981;
  }

  .trend-indicator.down {
    color: #EF4444;
  }

  .trend-indicator.down-good {
    color: #10B981;
  }

  .trend-indicator.up-bad {
    color: #EF4444;
  }

  .trend-indicator.stable {
    color: #6B7280;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .charts-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .charts-grid {
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
export default PerformanceCharts;
