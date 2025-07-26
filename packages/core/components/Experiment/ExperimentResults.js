import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 14 Story 14.3 - Results Analysis & Visualization
 * Experiment Results Dashboard Component
 */
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle, Users, Clock, Target, Lightbulb, Download, Refresh } from 'lucide-react';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
export const ExperimentResults = ({ experiment, results, onRefresh, onExport, onStopExperiment, onImplementWinner, className = '' }) => {
    const [state, setState] = useState({
        selectedSegment: 'all',
        selectedMetric: 'primary',
        timeRange: '7d',
        refreshing: false,
        showDetails: false
    });
    const primaryMetric = experiment.metrics.find(m => m.isPrimary);
    const controlVariant = results.variants[0]; // Assume first variant is control
    const winningVariant = results.statistical.primaryMetric.winningVariant;
    /**
     * Handle refresh
     */
    const handleRefresh = useCallback(async () => {
        setState(prev => ({ ...prev, refreshing: true }));
        try {
            await onRefresh();
        }
        finally {
            setState(prev => ({ ...prev, refreshing: false }));
        }
    }, [onRefresh]);
    /**
     * Get variant performance data for charts
     */
    const getVariantComparisonData = useCallback(() => {
        if (!primaryMetric)
            return [];
        return results.variants.map(variant => {
            const metricResult = variant.metrics.find(m => m.metricId === primaryMetric.id);
            const controlMetricResult = controlVariant.metrics.find(m => m.metricId === primaryMetric.id);
            const improvement = controlMetricResult && metricResult
                ? ((metricResult.value - controlMetricResult.value) / controlMetricResult.value) * 100
                : 0;
            return {
                variant: variant.variantId,
                value: metricResult?.value || 0,
                improvement: variant.variantId === controlVariant.variantId ? 0 : improvement,
                sampleSize: variant.sampleSize,
                confidenceInterval: metricResult?.confidenceInterval || [0, 0]
            };
        });
    }, [results.variants, primaryMetric, controlVariant]);
    /**
     * Get time series data for trend chart
     */
    const getTimeSeriesData = useCallback(() => {
        // Mock time series data - in practice, this would come from the results
        const days = 7;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayData = {
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' })
            };
            results.variants.forEach(variant => {
                const metricResult = variant.metrics.find(m => m.metricId === primaryMetric?.id);
                // Add some realistic variance
                const baseValue = metricResult?.value || 0;
                const variance = 0.1 * baseValue * (Math.random() - 0.5);
                dayData[variant.variantId] = Math.max(0, baseValue + variance);
            });
            data.push(dayData);
        }
        return data;
    }, [results.variants, primaryMetric]);
    /**
     * Get funnel data for conversion analysis
     */
    const getFunnelData = useCallback(() => {
        // Mock funnel data based on variants
        return results.variants.map(variant => ({
            name: variant.variantId,
            value: variant.sampleSize,
            conversions: Math.round((variant.conversionRate || 0) * variant.sampleSize)
        }));
    }, [results.variants]);
    /**
     * Format metric value
     */
    const formatMetricValue = useCallback((value, metricType) => {
        switch (metricType) {
            case 'conversion':
                return `${(value * 100).toFixed(2)}%`;
            case 'latency':
                return `${value.toFixed(0)}ms`;
            case 'cost':
                return `$${value.toFixed(4)}`;
            default:
                return value.toFixed(2);
        }
    }, []);
    /**
     * Get confidence interval display
     */
    const getConfidenceInterval = useCallback((ci, metricType) => {
        const [lower, upper] = ci;
        return `[${formatMetricValue(lower, metricType)}, ${formatMetricValue(upper, metricType)}]`;
    }, [formatMetricValue]);
    return (_jsxs("div", { className: `experiment-results ${className}`, children: [_jsxs("div", { className: "results-header", children: [_jsxs("div", { className: "header-info", children: [_jsxs("h1", { className: "text-2xl font-bold", children: [experiment.name, " - Results"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: experiment.status === 'running' ? 'default' : 'secondary', children: experiment.status }), winningVariant && (_jsxs(Badge, { variant: "default", className: "bg-green-500", children: [_jsx(Award, { className: "w-3 h-3 mr-1" }), "Winner Detected"] }))] })] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Select, { value: state.timeRange, onValueChange: (value) => setState(prev => ({ ...prev, timeRange: value })), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1h", children: "Last Hour" }), _jsx(SelectItem, { value: "24h", children: "24 Hours" }), _jsx(SelectItem, { value: "7d", children: "7 Days" }), _jsx(SelectItem, { value: "30d", children: "30 Days" })] })] }), _jsxs(Button, { variant: "outline", onClick: handleRefresh, disabled: state.refreshing, children: [_jsx(Refresh, { className: "w-4 h-4 mr-2" }), state.refreshing ? 'Refreshing...' : 'Refresh'] }), _jsxs(Button, { variant: "outline", onClick: () => onExport('csv'), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] }), experiment.status === 'running' && (_jsx(Button, { variant: "outline", onClick: onStopExperiment, children: "Stop Experiment" })), winningVariant && (_jsxs(Button, { onClick: () => onImplementWinner(winningVariant), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Implement Winner"] }))] })] }), winningVariant && (_jsxs(Alert, { className: "mb-4 border-green-200 bg-green-50", children: [_jsx(Award, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Statistical Winner Detected!" }), " Variant \"", winningVariant, "\" shows statistically significant improvement with ", ((1 - results.statistical.primaryMetric.pValue) * 100).toFixed(1), "% confidence."] })] })), results.insights.length > 0 && (_jsxs(Card, { className: "mb-4", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Lightbulb, { className: "w-5 h-5 mr-2" }), "Key Insights"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: results.insights.slice(0, 3).map((insight, index) => (_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `w-2 h-2 rounded-full mt-2 ${insight.severity === 'high' ? 'bg-red-500' :
                                            insight.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}` }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: insight.title }), _jsx("div", { className: "text-sm text-gray-600", children: insight.description }), insight.recommendations && insight.recommendations.length > 0 && (_jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["\uD83D\uDCA1 ", insight.recommendations[0]] }))] })] }, index))) }) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Total Sample Size" }), _jsx("div", { className: "text-2xl font-bold", children: results.variants.reduce((sum, v) => sum + v.sampleSize, 0).toLocaleString() })] }), _jsx(Users, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Statistical Significance" }), _jsxs("div", { className: "text-2xl font-bold", children: [((1 - results.statistical.primaryMetric.pValue) * 100).toFixed(1), "%"] })] }), _jsx(Target, { className: "w-8 h-8 text-green-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Experiment Duration" }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.ceil((Date.now() - experiment.createdAt.getTime()) / (1000 * 60 * 60 * 24)), " days"] })] }), _jsx(Clock, { className: "w-8 h-8 text-purple-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Guardrail Metrics" }), _jsxs("div", { className: "text-2xl font-bold", children: [results.statistical.guardrailMetrics.filter(g => g.passed).length, "/", results.statistical.guardrailMetrics.length] })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-500" })] }) }) })] }), _jsxs(Tabs, { defaultValue: "overview", className: "results-tabs", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "variants", children: "Variants" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" }), _jsx(TabsTrigger, { value: "segments", children: "Segments" }), _jsx(TabsTrigger, { value: "statistical", children: "Statistical" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Variant Performance" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: getVariantComparisonData(), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "variant" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", fill: "#8884d8" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Relative Improvement vs Control" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: getVariantComparisonData().filter(d => d.variant !== controlVariant.variantId), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "variant" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`${value.toFixed(2)}%`, 'Improvement'] }), _jsx(Bar, { dataKey: "improvement", fill: (entry) => entry > 0 ? '#82ca9d' : '#ff7c7c' })] }) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Detailed Results" }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left p-2", children: "Variant" }), _jsx("th", { className: "text-left p-2", children: "Sample Size" }), _jsx("th", { className: "text-left p-2", children: primaryMetric?.name }), _jsx("th", { className: "text-left p-2", children: "Confidence Interval" }), _jsx("th", { className: "text-left p-2", children: "vs Control" }), _jsx("th", { className: "text-left p-2", children: "Significance" })] }) }), _jsx("tbody", { children: results.variants.map((variant) => {
                                                            const metricResult = variant.metrics.find(m => m.metricId === primaryMetric?.id);
                                                            const controlMetricResult = controlVariant.metrics.find(m => m.metricId === primaryMetric?.id);
                                                            const improvement = controlMetricResult && metricResult && variant.variantId !== controlVariant.variantId
                                                                ? ((metricResult.value - controlMetricResult.value) / controlMetricResult.value) * 100
                                                                : null;
                                                            return (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium", children: variant.variantId }), variant.variantId === controlVariant.variantId && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: "Control" })), variant.variantId === winningVariant && (_jsx(Badge, { variant: "default", className: "text-xs bg-green-500", children: "Winner" }))] }) }), _jsx("td", { className: "p-2", children: variant.sampleSize.toLocaleString() }), _jsx("td", { className: "p-2", children: metricResult && formatMetricValue(metricResult.value, primaryMetric?.type || 'conversion') }), _jsx("td", { className: "p-2 text-xs text-gray-600", children: metricResult && getConfidenceInterval(metricResult.confidenceInterval, primaryMetric?.type || 'conversion') }), _jsx("td", { className: "p-2", children: improvement !== null && (_jsxs("div", { className: `flex items-center ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`, children: [improvement > 0 ? _jsx(TrendingUp, { className: "w-3 h-3 mr-1" }) : _jsx(TrendingDown, { className: "w-3 h-3 mr-1" }), improvement.toFixed(2), "%"] })) }), _jsx("td", { className: "p-2", children: variant.variantId === winningVariant && (_jsx(Badge, { variant: "default", className: "bg-green-500", children: "Significant" })) })] }, variant.variantId));
                                                        }) })] }) }) })] })] }), _jsx(TabsContent, { value: "variants", className: "space-y-4", children: _jsx("div", { className: "grid gap-4", children: results.variants.map((variant) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "flex items-center", children: [variant.variantId, variant.variantId === controlVariant.variantId && (_jsx(Badge, { variant: "secondary", className: "ml-2", children: "Control" })), variant.variantId === winningVariant && (_jsx(Badge, { variant: "default", className: "ml-2 bg-green-500", children: "Winner" }))] }), _jsxs("div", { className: "text-sm text-gray-600", children: [variant.sampleSize.toLocaleString(), " participants"] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Conversion Rate" }), _jsxs("div", { className: "text-lg font-semibold", children: [((variant.conversionRate || 0) * 100).toFixed(2), "%"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Avg Latency" }), _jsxs("div", { className: "text-lg font-semibold", children: [variant.averageLatency?.toFixed(0) || 0, "ms"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Total Cost" }), _jsxs("div", { className: "text-lg font-semibold", children: ["$", variant.totalCost?.toFixed(2) || 0] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Error Rate" }), _jsxs("div", { className: "text-lg font-semibold", children: [((variant.errorRate || 0) * 100).toFixed(2), "%"] })] })] }) })] }, variant.variantId))) }) }), _jsx(TabsContent, { value: "trends", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance Trends" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(LineChart, { data: getTimeSeriesData(), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "day" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), results.variants.map((variant, index) => (_jsx(Line, { type: "monotone", dataKey: variant.variantId, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }, variant.variantId)))] }) }) })] }) }), _jsx(TabsContent, { value: "segments", className: "space-y-6", children: results.segments.length > 0 ? (results.segments.map((segment, index) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Segment: ", segment.segment.name] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-sm text-gray-600 mb-4", children: ["Sample Size: ", segment.sampleSize.toLocaleString(), " | Significant: ", segment.significance ? 'Yes' : 'No'] }) })] }, index)))) : (_jsx(Card, { children: _jsx(CardContent, { className: "text-center py-8", children: _jsx("div", { className: "text-gray-500", children: "No segment analysis available" }) }) })) }), _jsx(TabsContent, { value: "statistical", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Statistical Summary" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "P-Value" }), _jsx("div", { className: "text-lg font-semibold", children: results.statistical.primaryMetric.pValue.toFixed(4) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Confidence Level" }), _jsxs("div", { className: "text-lg font-semibold", children: [(results.statistical.primaryMetric.confidenceLevel * 100).toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Statistical Significance" }), _jsx("div", { className: "text-lg font-semibold", children: results.statistical.primaryMetric.statisticalSignificance ? (_jsx(Badge, { variant: "default", className: "bg-green-500", children: "Significant" })) : (_jsx(Badge, { variant: "secondary", children: "Not Significant" })) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Practical Significance" }), _jsx("div", { className: "text-lg font-semibold", children: results.statistical.primaryMetric.practicalSignificance ? (_jsx(Badge, { variant: "default", className: "bg-green-500", children: "Yes" })) : (_jsx(Badge, { variant: "secondary", children: "No" })) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Guardrail Metrics" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: results.statistical.guardrailMetrics.map((guardrail, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm", children: guardrail.metricId }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [(guardrail.actualValue * 100).toFixed(2), "%"] }), guardrail.passed ? (_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" })) : (_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500" }))] })] }, index))) }) })] })] }) })] })] }));
};
export default ExperimentResults;
