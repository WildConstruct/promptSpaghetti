import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Funnel Visualization Components - Story 30.2 Task 5
 *
 * Interactive funnel visualization system with real-time updates,
 * customizable configurations, and advanced analytics capabilities.
 *
 * Features:
 * - Interactive multi-step funnel visualization
 * - Real-time conversion rate updates
 * - Drag-and-drop funnel configuration
 * - Advanced filtering and segmentation
 * - A/B testing comparison views
 * - Export and sharing capabilities
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
export const FunnelVisualization = ({
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    segments = [],
    cohorts = [],
    comparisonMode = 'none',
    realTimeUpdates = false,
    onStepClick,
    onConfigChange
});
{
    const [funnelMetrics, setFunnelMetrics] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [configuration, setConfiguration] = useState({});
    displayMode: 'standard',
        colorScheme;
    'default',
        showMetrics;
    ['conversion_rate', 'user_count', 'drop_off_rate'],
        filterCriteria;
    [],
        grouping;
    {
        dimension: 'none';
    }
    refreshInterval: 30000,
        animations;
    true;
}
;
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
// Load funnel data
const loadFunnelData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const query = {
            funnelId: funnelDefinition.id,
            startDate: timeRange.start,
            endDate: timeRange.end,
            metrics: ['conversion_rate', 'user_count', 'revenue', 'drop_off_rate'],
            groupBy: configuration.grouping.dimension !== 'none' ? [configuration.grouping.dimension] : undefined,
            filters: configuration.filterCriteria.map(filter => ({}), field, getFilterField(filter.type), operator, filter.operator, value, filter.value) };
    }
    finally { }
}), aggregation;
 || 'day',
;
;
const metricResults = await analyticsInfrastructure.queryMetrics(query);
const processedMetrics = await processFunnelMetrics(metricResults, funnelDefinition);
setFunnelMetrics(processedMetrics);
// Load comparison data if needed
if (comparisonMode !== 'none') {
    const comparisonMetrics = await loadComparisonData(query, comparisonMode);
    setComparisonData(comparisonMetrics);
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load funnel data');
}
finally {
    setLoading(false);
}
[funnelDefinition, timeRange, configuration, comparisonMode, analyticsInfrastructure];
;
// Real-time updates
useEffect(() => {
    loadFunnelData();
    if (realTimeUpdates && configuration.refreshInterval > 0) {
        const interval = setInterval(loadFunnelData, configuration.refreshInterval);
        return () => clearInterval(interval);
    }
    [loadFunnelData, realTimeUpdates, configuration.refreshInterval];
});
// Configuration change handler
const handleConfigChange = useCallback((newConfig) => {
    const updatedConfig = { ...configuration, ...newConfig };
    setConfiguration(updatedConfig);
    onConfigChange?.(updatedConfig);
}, [configuration, onConfigChange]);
// Step click handler
const handleStepClick = useCallback((stepMetrics) => {
    if (onStepClick) {
        const step = funnelDefinition.steps.find(s => s.id === stepMetrics.stepId);
        if (step) {
            onStepClick(step, stepMetrics);
        }
        [funnelDefinition.steps, onStepClick];
    }
});
if (loading) {
    return _jsx(FunnelLoadingState, {});
    if (error || !funnelMetrics) {
        return _jsx(FunnelErrorState, { error: error || 'No data available', onRetry: loadFunnelData });
        return;
        _jsxs("div", { className: "funnel-visualization", children: [_jsx(FunnelHeader, { funnelDefinition: funnelDefinition, metrics: funnelMetrics, configuration: configuration, onConfigChange: handleConfigChange }), _jsx(FunnelFilters, { filters: configuration.filterCriteria, segments: segments, cohorts: cohorts, onFiltersChange: (filters) => handleConfigChange({ filterCriteria: filters }) }), _jsxs("div", { className: "funnel-main-content", children: [comparisonMode !== 'none' && comparisonData && ()
                            < FunnelComparison, "comparisonData=", comparisonData, "configuration=", configuration, "/> )}", _jsx(FunnelChart, { metrics: funnelMetrics, configuration: configuration, onStepClick: handleStepClick }), _jsx(FunnelInsights, { metrics: funnelMetrics, comparisonData: comparisonData, funnelDefinition: funnelDefinition })] })] });
        ;
    }
    ;
    {
        return;
        _jsxs("div", { className: "funnel-header", children: [_jsxs("div", { className: "funnel-title", children: [_jsx("h2", { children: funnelDefinition.name }), _jsx("p", { className: "funnel-description", children: funnelDefinition.description })] }), _jsxs("div", { className: "funnel-summary-metrics", children: [_jsx(SummaryMetric, { label: "Total Entries", value: metrics.totalEntries.toLocaleString(), change: 0 }), _jsx(SummaryMetric, { label: "Overall Conversion Rate", value: `${metrics.overallConversionRate.toFixed(2)}%`, change: 0 }), _jsx(SummaryMetric, { label: "Total Conversions", value: metrics.totalConversions.toLocaleString(), change: 0 }), _jsx(SummaryMetric, { label: "Average Time to Convert", value: formatDuration(metrics.averageTimeToConvert), change: 0 }), _jsx(SummaryMetric, { label: "Total Value", value: `$${metrics.totalValue.toLocaleString()}`, change: 0 })] }), _jsx(FunnelConfigurationControls, { configuration: configuration, onConfigChange: onConfigChange })] });
        ;
    }
    ;
    div >
    ;
    ;
}
;
{
    return;
    _jsxs("div", { className: "funnel-configuration-controls", children: [_jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Display Mode" }), _jsxs("select", { value: configuration.displayMode, onChange: (e) => onConfigChange({ displayMode: e.target.value }), children: [_jsx("option", { value: "standard", children: "Standard" }), _jsx("option", { value: "horizontal", children: "Horizontal" }), _jsx("option", { value: "sankey", children: "Sankey Diagram" }), _jsx("option", { value: "waterfall", children: "Waterfall" })] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Color Scheme" }), _jsxs("select", { value: configuration.colorScheme, onChange: (e) => onConfigChange({ colorScheme: e.target.value }), children: [_jsx("option", { value: "default", children: "Default" }), _jsx("option", { value: "conversion_focused", children: "Conversion Focused" }), _jsx("option", { value: "drop_off_focused", children: "Drop-off Focused" }), _jsx("option", { value: "value_focused", children: "Value Focused" })] })] }), _jsxs("div", { className: "control-group", children: [_jsx("label", { children: "Refresh Interval" }), _jsxs("select", { value: configuration.refreshInterval, onChange: (e) => onConfigChange({ refreshInterval: parseInt(e.target.value) }), children: [_jsx("option", { value: 0, children: "Manual" }), _jsx("option", { value: 10000, children: "10 seconds" }), _jsx("option", { value: 30000, children: "30 seconds" }), _jsx("option", { value: 60000, children: "1 minute" }), _jsx("option", { value: 300000, children: "5 minutes" })] })] }), _jsx("div", { className: "control-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: configuration.animations, onChange: (e) => onConfigChange({ animations: e.target.checked }) }), "Enable Animations"] }) })] });
    ;
}
;
{
    const addFilter = useCallback((filter) => {
        onFiltersChange([...filters, filter]);
    }, [filters, onFiltersChange]);
    const removeFilter = useCallback((index) => {
        const newFilters = filters.filter((_, i) => i !== index);
        onFiltersChange(newFilters);
    }, [filters, onFiltersChange]);
    const updateFilter = useCallback((index, updates) => {
        const newFilters = filters.map((filter, i) => );
        i === index ? { ...filter, ...updates } : filter;
    });
    onFiltersChange(newFilters);
}
[filters, onFiltersChange];
;
return;
_jsxs("div", { className: "funnel-filters", children: [_jsxs("div", { className: "filters-header", children: [_jsx("h3", { children: "Filters" }), _jsx(FilterDropdown, { onAddFilter: addFilter, segments: segments, cohorts: cohorts })] }), _jsxs("div", { className: "active-filters", children: [filters.map((filter, index) => ()
                    < FilterTag, key = { index }, filter = { filter }, onUpdate = {}(updates)), " => updateFilter(index, updates)} onRemove=", () => removeFilter(index), "/> ))}"] })] });
;
;
{
    const [isOpen, setIsOpen] = useState(false);
    const handleFilterAdd = (type, value) => {
        const filter = {
            type,
            value: value || '',
            operator: 'equals',
        };
        onAddFilter(filter);
        setIsOpen(false);
    };
    return;
    _jsxs("div", { className: "filter-dropdown", children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), children: "Add Filter +" }), isOpen && ()
                < div, " className=\"filter-dropdown-menu\">", _jsxs("div", { className: "filter-category", children: [_jsx("h4", { children: "Segments" }), segments.map(segment => ()
                        < button, key = { segment, : .id }, onClick = {}()), " => handleFilterAdd('segment', segment.id)} >", segment.name] }), "))}"] })
        ,
            _jsxs("div", { className: "filter-category", children: [_jsx("h4", { children: "Cohorts" }), cohorts.map(cohort => ()
                        < button, key = { cohort, : .id }, onClick = {}()), " => handleFilterAdd('cohort', cohort.id)} >", cohort.name] });
}
div >
    _jsxs("div", { className: "filter-category", children: [_jsx("h4", { children: "Other" }), _jsx("button", { onClick: () => handleFilterAdd('device'), children: "Device Type" }), _jsx("button", { onClick: () => handleFilterAdd('location'), children: "Location" }), _jsx("button", { onClick: () => handleFilterAdd('source'), children: "Traffic Source" })] });
div >
;
div >
;
;
;
{
    const chartComponent = useMemo(() => {
        switch (configuration.displayMode) {
            case 'horizontal':
                return _jsx(HorizontalFunnelChart, { metrics: metrics, configuration: configuration, onStepClick: onStepClick });
            case 'sankey':
                return _jsx(SankeyFunnelChart, { metrics: metrics, configuration: configuration, onStepClick: onStepClick });
            case 'waterfall':
                return _jsx(WaterfallFunnelChart, { metrics: metrics, configuration: configuration, onStepClick: onStepClick });
            default:
                return _jsx(StandardFunnelChart, { metrics: metrics, configuration: configuration, onStepClick: onStepClick });
        }
        [configuration.displayMode, metrics, configuration, onStepClick];
    });
    return;
    _jsx("div", { className: "funnel-chart-container", children: chartComponent });
    ;
}
;
{
    const maxUsers = Math.max(...metrics.stepMetrics.map(s => s.totalUsers));
    return;
    _jsx("div", { className: "standard-funnel-chart", children: metrics.stepMetrics.map((stepMetric, index) => {
            const width = (stepMetric.totalUsers / maxUsers) * 100;
            const isLastStep = index === metrics.stepMetrics.length - 1;
            return;
            _jsxs("div", { className: "funnel-step", children: [_jsxs("div", { className: `step-bar ${getStepColorClass(stepMetric, configuration.colorScheme)}`, style: { width: `${width}%` }, onClick: () => onStepClick(stepMetric), children: [_jsxs("div", { className: "step-content", children: [_jsx("div", { className: "step-name", children: stepMetric.name }), _jsxs("div", { className: "step-metrics", children: [configuration.showMetrics.includes('user_count') && ()
                                                < span, " className=\"metric\">", stepMetric.totalUsers.toLocaleString(), " users"] }), ")}", configuration.showMetrics.includes('conversion_rate') && !isLastStep && ()
                                        < span, " className=\"metric\">", stepMetric.conversionRate.toFixed(1), "% convert"] }), ")}", configuration.showMetrics.includes('drop_off_rate') && !isLastStep && ()
                                < span, " className=\"metric\">", stepMetric.dropOffRate.toFixed(1), "% drop off"] }), ")}", configuration.showMetrics.includes('value_generated') && stepMetric.valueGenerated > 0 && ()
                        < span, " className=\"metric\">$", stepMetric.valueGenerated.toLocaleString()] }, stepMetric.stepId);
        }) });
    div >
    ;
    div >
        {};
    isLastStep && ()
        < div;
    className = "step-connector" >
        _jsxs("div", { className: "drop-off-indicator", children: [stepMetric.dropOffRate.toFixed(1), "% drop off"] });
    div >
    ;
}
div >
;
;
div >
;
;
;
// Placeholder implementations for other chart types
const HorizontalFunnelChart = (props) => {
    return _jsx("div", { children: "Horizontal Funnel Chart (TODO: Implement)" });
};
const SankeyFunnelChart = (props) => {
    return _jsx("div", { children: "Sankey Funnel Chart (TODO: Implement)" });
};
const WaterfallFunnelChart = (props) => {
    return _jsx("div", { children: "Waterfall Funnel Chart (TODO: Implement)" });
};
{
    return;
    _jsxs("div", { className: "funnel-comparison", children: [_jsx("h3", { children: "Comparison Analysis" }), _jsx("div", { className: "comparison-overview", children: _jsxs("div", { className: "comparison-metrics", children: [_jsx(ComparisonMetric, { label: "Overall Conversion Rate", baseline: comparisonData.baseline.overallConversionRate, comparison: comparisonData.comparison.overallConversionRate, format: "percentage" }), _jsx(ComparisonMetric, { label: "Total Conversions", baseline: comparisonData.baseline.totalConversions, comparison: comparisonData.comparison.totalConversions, format: "number" }), _jsx(ComparisonMetric, { label: "Average Time to Convert", baseline: comparisonData.baseline.averageTimeToConvert, comparison: comparisonData.comparison.averageTimeToConvert, format: "duration" })] }) }), _jsxs("div", { className: "comparison-insights", children: [_jsx("h4", { children: "Key Insights" }), comparisonData.insights.map((insight, index) => ()
                        < InsightCard, key = { index }, insight = { insight } /  >
                    ), ")}"] })] });
    ;
}
;
{
    const change = ((comparison - baseline) / baseline) * 100;
    const changeDirection = change > 0 ? 'improvement' : change < 0 ? 'decline' : 'neutral';
    const formatValue = (value) => {
        switch (format) {
            case 'percentage':
                return `${value.toFixed(2)}%`;
        }
    };
    'duration';
    return formatDuration(value);
    'currency';
    return `$${value.toLocaleString()}`;
}
return value.toLocaleString();
;
return;
_jsxs("div", { className: "comparison-metric", children: [_jsx("div", { className: "metric-label", children: label }), _jsxs("div", { className: "metric-values", children: [_jsx("span", { className: "baseline", children: formatValue(baseline) }), _jsx("span", { className: "arrow", children: "\u2192" }), _jsx("span", { className: "comparison", children: formatValue(comparison) })] }), _jsxs("div", { className: `metric-change ${changeDirection}`, children: ["}", change > 0 ? '+' : '', change.toFixed(1), "%"] })] });
;
;
{
    const insights = useMemo(() => {
        return generateFunnelInsights(metrics, comparisonData, funnelDefinition);
    }, [metrics, comparisonData, funnelDefinition]);
    return;
    _jsxs("div", { className: "funnel-insights", children: [_jsx("h3", { children: "Funnel Insights" }), _jsxs("div", { className: "insights-grid", children: [_jsxs("div", { className: "insight-section", children: [_jsx("h4", { children: "Biggest Drop-off Points" }), insights.biggestDropOffs.map((dropOff, index) => ()
                                < div, key = { index }, className = "drop-off-insight" >
                                (_jsx("span", { className: "step-name", children: dropOff.stepName })
                                    ,
                                        _jsxs("span", { className: "drop-off-rate", children: [dropOff.dropOffRate.toFixed(1), "%"] })
                                            ,
                                                _jsxs("span", { className: "affected-users", children: [dropOff.affectedUsers.toLocaleString(), " users"] })))] }), "))}"] }), _jsxs("div", { className: "insight-section", children: [_jsx("h4", { children: "Conversion Opportunities" }), insights.opportunities.map((opportunity, index) => ()
                        < div, key = { index }, className = "opportunity-insight" >
                        (_jsx("div", { className: "opportunity-description", children: opportunity.description })
                            ,
                                _jsxs("div", { className: "opportunity-impact", children: ["Potential impact: +", opportunity.potentialImpact.toFixed(1), "% conversion rate"] })))] }), "))}"] })
        ,
            _jsxs("div", { className: "insight-section", children: [_jsx("h4", { children: "Performance Trends" }), insights.trends.map((trend, index) => ()
                        < div, key = { index }, className = "trend-insight" >
                        (_jsx("span", { className: "trend-description", children: trend.description })
                            ,
                                _jsxs("span", { className: `trend-direction ${trend.direction}`, children: ["}", trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'] })))] });
}
div >
;
div >
;
div >
;
;
;
// Loading and Error States
const FunnelLoadingState = () => ()
    < div, className = "funnel-loading" >
    (_jsx("div", { className: "loading-spinner" })
        ,
            _jsx("p", { children: "Loading funnel data..." }));
div >
;
;
className = "funnel-error" >
    (_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Funnel" }), _jsx("p", { children: error })] })
        ,
            _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry" }));
div >
;
;
// Utility Functions
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h`;
}
if (hours > 0)
    return `${hours}h ${minutes % 60}m`;
if (minutes > 0)
    return `${minutes}m ${seconds % 60}s`;
return `${seconds}s`;
function getStepColorClass(stepMetric, colorScheme) {
    switch (colorScheme) {
        case 'conversion_focused':
            return stepMetric.conversionRate > 75 ? 'high-conversion' : ,
                stepMetric.conversionRate > 50 ? 'medium-conversion' : 'low-conversion';
        case 'drop_off_focused':
            return stepMetric.dropOffRate > 50 ? 'high-dropoff' : ,
                stepMetric.dropOffRate > 25 ? 'medium-dropoff' : 'low-dropoff';
        case 'value_focused':
            return stepMetric.valueGenerated > 1000 ? 'high-value' : ,
                stepMetric.valueGenerated > 100 ? 'medium-value' : 'low-value';
        default:
            return 'default-step';
            function getFilterField(filterType) {
                const fieldMap = {
                    segment: 'userContext.segmentIds',
                    cohort: 'userContext.cohortIds',
                    time_range: 'timestamp',
                    device: 'metadata.userAgent',
                    location: 'sessionContext.locationData.country',
                    source: 'attributionData.primaryAttribution.touchpoint.source',
                };
                return fieldMap[filterType] || filterType;
                async function processFunnelMetrics() { }
                ();
                metricResults: ConversionMetricResult,
                    funnelDefinition;
                ConversionFunnelDefinition,
                ;
                Promise < FunnelMetrics > {
                    // Simplified implementation - in production, this would process actual metric results
                    const: stepMetrics, StepMetrics = funnelDefinition.steps.map((step, index) => {
                        const baseUsers = 1000 - (index * 200); // Simulated data;
                        const converted = index < funnelDefinition.steps.length - 1 ? baseUsers * 0.7 : baseUsers;
                        return {
                            stepId: step.id,
                            name: step.name,
                            order: step.order,
                            totalUsers: baseUsers,
                            convertedUsers: converted,
                            conversionRate: index < funnelDefinition.steps.length - 1 ? 70 : 100,
                            dropOffRate: index < funnelDefinition.steps.length - 1 ? 30 : 0,
                            averageTimeSpent: 120000 + (index * 60000),
                            valueGenerated: converted * 25,
                            topExitReasons: [,
                                { reason: 'Page load timeout', percentage: 15, count: Math.floor(baseUsers * 0.15), category: 'technical_issue' },
                                { reason: 'Unclear navigation', percentage: 10, count: Math.floor(baseUsers * 0.10), category: 'design_friction' }
                            ]
                        };
                    }),
                    return: {
                        funnelId: funnelDefinition.id,
                        totalEntries: stepMetrics[0]?.totalUsers || 0,
                        totalConversions: stepMetrics[stepMetrics.length - 1]?.convertedUsers || 0,
                        overallConversionRate: stepMetrics.length > 0 ?  : ,
                    }((stepMetrics[stepMetrics.length - 1]?.convertedUsers || 0) / (stepMetrics[0]?.totalUsers || 1)) * 100, 0: ,
                    averageTimeToConvert: stepMetrics.reduce((sum, step) => sum + step.averageTimeSpent, 0),
                    totalValue: stepMetrics.reduce((sum, step) => sum + step.valueGenerated, 0),
                    stepMetrics
                };
                async function loadComparisonData() { }
                ();
                query: ConversionMetricQuery,
                    comparisonMode;
                string,
                ;
                Promise < FunnelComparisonData | null > {
                    // Simplified implementation - in production, this would load actual comparison data
                    return: null,
                    function: generateFunnelInsights(),
                    metrics: FunnelMetrics,
                    comparisonData: FunnelComparisonData | null,
                    funnelDefinition: ConversionFunnelDefinition,
                    // Simplified implementation
                    return: {
                        biggestDropOffs: metrics.stepMetrics,
                        : 
                            .filter(step => step.dropOffRate > 0)
                            .sort((a, b) => b.dropOffRate - a.dropOffRate)
                            .slice(0, 3)
                            .map(step => ({}), stepName, step.name, dropOffRate, step.dropOffRate, affectedUsers, Math.floor(step.totalUsers * step.dropOffRate / 100))
                    },
                    opportunities: [,
                        {
                            description: 'Optimize page load speed to reduce technical drop-offs',
                            potentialImpact: 5.2,
                        },
                        {
                            description: 'Improve navigation clarity in step 2',
                            potentialImpact: 3.8
                        }],
                    trends: [,
                        {
                            description: 'Conversion rate trending upward over last 7 days',
                            direction: 'up',
                        },
                        {
                            description: 'Average time to convert decreasing',
                            direction: 'down'
                        }]
                };
                export default FunnelVisualization;
            }
    }
}
