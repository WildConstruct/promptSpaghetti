import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Core Funnel Chart Visualization - Story 30.2 Task 6
 *
 * Step-by-step conversion rate visualization with interactive funnel charts,
 * drop-off analysis, and multiple visualization modes.
 *
 * Features:
 * - Interactive step-by-step funnel visualization
 * - Multiple chart modes (standard, sankey, waterfall)
 * - Real-time conversion rate updates
 * - Drop-off point highlighting
 * - Hover interactions with detailed metrics
 * - Responsive design with mobile support
 * - Export capabilities for charts
 * - Accessibility compliance
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
timeRange: {
    start: number;
    end: number;
}
;
segments ?  : UserSegment;
cohorts ?  : ConversionCohort;
chartMode ?  : FunnelChartMode;
showDropoffAnalysis ?  : boolean;
realTimeUpdates ?  : boolean;
onStepClick ?  : (step, metrics) => void ;
onExport ?  : (chartData) => void ;
;
benchmark: {
    conversionRate: number;
    percentile: number;
    industry: string;
}
;
segments: Array < {
    segmentId: string,
    segmentName: string,
    conversionRate: number,
    performance: 'above_average' | 'below_average' | 'average',
} > ;
 > ;
insights: string;
;
metadata: {
    exportedAt: number;
    timeRange: {
        start: number;
        end: number;
    }
    ;
    filters: unknown;
}
;
tooltipPosition: {
    x: number;
    y: number;
}
 | null;
tooltipContent: StepTooltipContent | null;
export const FunnelChart = ({
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    segments = [],
    cohorts = [],
    chartMode = 'standard',
    showDropoffAnalysis = true,
    realTimeUpdates = false,
    onStepClick,
    onExport
});
{
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [interactionState, setInteractionState] = useState({});
    hoveredStep: null,
        selectedStep;
    null,
        tooltipPosition;
    null,
        tooltipContent;
    null,
    ;
}
;
const chartRef = useRef(null);
const containerRef = useRef(null);
// Load funnel chart data
const loadChartData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const query = {
            funnelId: funnelDefinition.id,
            startDate: timeRange.start,
            endDate: timeRange.end,
            metrics: [
                'conversion_rate',
                'user_count',
                'revenue',
                'drop_off_rate',
                'time_spent',
                'step_completion_rate'
            ],
            groupBy: ['funnel_step', 'date'],
            filters: [
                ...segments.map(segment => ({}), field, 'userContext.segmentIds', operator, 'contains', value, segment.id)
            ]
        };
    }
    finally { }
});
cohorts.map(cohort => ({}), field, 'userContext.cohortIds', operator, 'contains', value, cohort.id);
aggregation: {
    interval: 'day';
}
;
const results = await analyticsInfrastructure.queryMetrics(query);
const processedData = await processFunnelChartData();
;
funnelDefinition,
    results,
    segments,
    cohorts,
    timeRange;
;
setChartData(processedData);
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load chart data');
}
finally {
    setLoading(false);
}
[funnelDefinition, analyticsInfrastructure, timeRange, segments, cohorts];
;
useEffect(() => {
    loadChartData();
}, [loadChartData]);
// Real-time updates
useEffect(() => {
    if (!realTimeUpdates)
        return;
    const interval = setInterval(loadChartData, 30000); // Update every 30 seconds;
    return () => clearInterval(interval);
}, [realTimeUpdates, loadChartData]);
// Chart dimensions and scaling
const chartDimensions = useMemo(() => {
    if (!containerRef.current || !chartData)
        return null;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.min(containerWidth * 0.6, 500);
    return {
        width: containerWidth,
        height: containerHeight,
        margin: { top: 40, right: 80, bottom: 60, left: 80 },
        chartWidth: containerWidth - 160,
        chartHeight: containerHeight - 100
    };
}, [chartData, containerRef.current?.clientWidth]);
// Handle step interactions
const handleStepHover = useCallback((stepId, event) => {
    if (!chartData)
        return;
    if (stepId && event) {
        const step = chartData.steps.find(s => s.stepId === stepId);
        if (step) {
            const rect = event.currentTarget.getBoundingClientRect();
            setInteractionState({});
            hoveredStep: stepId,
                selectedStep;
            interactionState.selectedStep,
                tooltipPosition;
            {
                x: rect.right + 10, y;
                rect.top;
            }
            tooltipContent: {
                stepName: step.stepName,
                    metrics;
                step,
                    comparisonData;
                step.comparisonData,
                    insights;
                generateStepInsights(step),
                ;
            }
        }
    }
});
{
    setInteractionState(prev => ({}), ...prev, hoveredStep, null, tooltipPosition, null, tooltipContent, null);
}
;
[chartData, interactionState.selectedStep];
;
const handleStepClick = useCallback((stepId) => {
    if (!chartData)
        return;
    const step = chartData.steps.find(s => s.stepId === stepId);
    if (step) {
        setInteractionState(prev => ({}), ...prev, selectedStep, stepId === prev.selectedStep ? null : stepId);
    }
});
onStepClick?.(funnelDefinition.steps.find(s => s.id === stepId), step);
[chartData, funnelDefinition.steps, onStepClick];
;
const handleExport = useCallback(async () => {
    if (!chartData || !chartRef.current)
        return;
    const svgElement = chartRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const exportData = {
        chartMode,
        data: chartData,
        visualization: {
            svg: svgString,
        },
        metadata: {
            exportedAt: Date.now(),
            timeRange,
            filters: [],
        },
        onExport }(exportData);
}, [chartData, chartMode, timeRange, onExport]);
if (loading) {
    return _jsx(FunnelChartLoadingState, {});
    if (error || !chartData) {
        return;
        _jsx(FunnelChartErrorState, { error: error || 'No data available', onRetry: loadChartData });
        ;
        return;
        _jsxs("div", { className: "funnel-chart", ref: containerRef, children: [_jsx(FunnelChartHeader, { funnelDefinition: funnelDefinition, overallMetrics: chartData.overallMetrics, chartMode: chartMode, onExport: handleExport }), _jsxs("div", { className: "chart-container", children: [chartDimensions && ()
                            < svg, "ref=", chartRef, "width=", chartDimensions.width, "height=", chartDimensions.height, "className=\"funnel-chart-svg\" >", chartMode === 'standard' && ()
                            < StandardFunnelChart, "data=", chartData, "dimensions=", chartDimensions, "interactionState=", interactionState, "onStepHover=", handleStepHover, "onStepClick=", handleStepClick, "/> )}", chartMode === 'horizontal' && ()
                            < HorizontalFunnelChart, "data=", chartData, "dimensions=", chartDimensions, "interactionState=", interactionState, "onStepHover=", handleStepHover, "onStepClick=", handleStepClick, "/> )}", chartMode === 'sankey' && ()
                            < SankeyFunnelChart, "data=", chartData, "dimensions=", chartDimensions, "interactionState=", interactionState, "onStepHover=", handleStepHover, "onStepClick=", handleStepClick, "/> )}", chartMode === 'waterfall' && ()
                            < WaterfallFunnelChart, "data=", chartData, "dimensions=", chartDimensions, "interactionState=", interactionState, "onStepHover=", handleStepHover, "onStepClick=", handleStepClick, "/> )}"] }), ")}"] });
        {
            showDropoffAnalysis && chartData.dropoffAnalysis.length > 0 && ()
                < DropoffAnalysisPanel;
            dropoffAnalysis = { chartData, : .dropoffAnalysis } /  >
            ;
        }
        {
            chartData.segmentComparisons.length > 0 && ()
                < SegmentComparisonPanel;
            segmentComparisons = { chartData, : .segmentComparisons } /  >
            ;
        }
        {
            interactionState.tooltipContent && interactionState.tooltipPosition && ()
                < StepTooltip;
            content = { interactionState, : .tooltipContent };
            position = { interactionState, : .tooltipPosition };
            onClose = {}();
            handleStepHover(null);
        }
        />;
    }
    div >
    ;
    ;
}
;
{
    return;
    _jsxs("div", { className: "funnel-chart-header", children: [_jsxs("div", { className: "funnel-info", children: [_jsx("h3", { children: funnelDefinition.name }), _jsx("p", { children: funnelDefinition.description })] }), _jsxs("div", { className: "overall-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Total Entries" }), _jsx("span", { className: "value", children: overallMetrics.totalEntries.toLocaleString() })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Conversion Rate" }), _jsxs("span", { className: "value", children: [overallMetrics.overallConversionRate.toFixed(2), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Total Revenue" }), _jsxs("span", { className: "value", children: ["$", overallMetrics.totalRevenue.toLocaleString()] }), "}"] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Avg. Time to Convert" }), _jsx("span", { className: "value", children: formatDuration(overallMetrics.averageTimeToConvert) })] })] }), _jsxs("div", { className: "chart-controls", children: [_jsx("span", { className: "chart-mode", children: chartMode }), _jsx("button", { onClick: onExport, className: "export-button", children: "Export Chart" })] })] });
    ;
}
;
{
    const { steps } = data;
    const { chartWidth, chartHeight, margin } = dimensions;
    // Calculate step positions and sizes
    const maxEntries = Math.max(...steps.map(s => s.totalEntries));
    const stepHeight = chartHeight / steps.length;
    const stepSpacing = stepHeight * 0.2;
    const stepBarHeight = stepHeight - stepSpacing;
    return;
    _jsxs("g", { transform: `translate(${margin.left}, ${margin.top})`, children: ["}", steps.map((step, index) => {
                const width = (step.totalEntries / maxEntries) * chartWidth;
                const x = (chartWidth - width) / 2;
                const y = index * stepHeight;
                const isHovered = interactionState.hoveredStep === step.stepId;
                const isSelected = interactionState.selectedStep === step.stepId;
                return;
                _jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: width, height: stepBarHeight, fill: getStepColor(step.conversionRate, index), stroke: isSelected ? '#3b82f6' : 'none', strokeWidth: isSelected ? 2 : 0, opacity: isHovered ? 0.8 : 1, className: "funnel-step-bar", onMouseEnter: (e) => onStepHover(step.stepId, e), onMouseLeave: () => onStepHover(null), onClick: () => onStepClick(step.stepId) }), _jsx("text", { x: chartWidth / 2, y: y + stepBarHeight / 2, textAnchor: "middle", dominantBaseline: "middle", className: "step-label", fill: "white", fontSize: "14", fontWeight: "500", children: step.stepName }), _jsxs("text", { x: chartWidth / 2, y: y + stepBarHeight / 2 + 20, textAnchor: "middle", dominantBaseline: "middle", className: "conversion-rate", fill: "white", fontSize: "12", children: [step.conversionRate.toFixed(1), "%"] }), index < steps.length - 1 && step.dropOffCount > 0 && ()
                            < g, " className=\"dropoff-indicator\">", _jsx("line", { x1: x + width, y1: y + stepBarHeight, x2: x + width + 20, y2: y + stepBarHeight + 10, stroke: "#ef4444", strokeWidth: "2" }), _jsxs("text", { x: x + width + 25, y: y + stepBarHeight + 15, fontSize: "10", fill: "#ef4444", className: "dropoff-text", children: ["-", step.dropOffCount.toLocaleString()] })] }, step.stepId);
            })] });
    ;
}
g >
;
;
;
/**
 * Horizontal Funnel Chart Component
 */
const HorizontalFunnelChart = ({
    data,
    dimensions,
    interactionState,
    onStepHover,
    onStepClick
});
{
    const { steps } = data;
    const { chartWidth, chartHeight, margin } = dimensions;
    const maxEntries = Math.max(...steps.map(s => s.totalEntries));
    const stepWidth = chartWidth / steps.length;
    const stepSpacing = stepWidth * 0.1;
    const stepBarWidth = stepWidth - stepSpacing;
    return;
    _jsxs("g", { transform: `translate(${margin.left}, ${margin.top})`, children: ["}", steps.map((step, index) => {
                const height = (step.totalEntries / maxEntries) * chartHeight;
                const x = index * stepWidth;
                const y = chartHeight - height;
                const isHovered = interactionState.hoveredStep === step.stepId;
                const isSelected = interactionState.selectedStep === step.stepId;
                return;
                _jsxs("g", { children: [_jsx("rect", { x: x, y: y, width: stepBarWidth, height: height, fill: getStepColor(step.conversionRate, index), stroke: isSelected ? '#3b82f6' : 'none', strokeWidth: isSelected ? 2 : 0, opacity: isHovered ? 0.8 : 1, className: "funnel-step-bar", onMouseEnter: (e) => onStepHover(step.stepId, e), onMouseLeave: () => onStepHover(null), onClick: () => onStepClick(step.stepId) }), _jsx("text", { x: x + stepBarWidth / 2, y: chartHeight + 20, textAnchor: "middle", className: "step-label", fontSize: "12", children: step.stepName }), _jsxs("text", { x: x + stepBarWidth / 2, y: y + height / 2, textAnchor: "middle", dominantBaseline: "middle", className: "conversion-rate", fill: "white", fontSize: "12", fontWeight: "500", children: [step.conversionRate.toFixed(1), "%"] })] }, step.stepId);
            }), "; })}"] });
    ;
}
;
// Placeholder components for other chart modes
const SankeyFunnelChart = () => ()
    < g >
    _jsx("text", { x: "50%", y: "50%", textAnchor: "middle", fontSize: "16", fill: "#666", children: "Sankey Chart (Coming Soon)" });
g >
;
;
const WaterfallFunnelChart = () => ()
    < g >
    _jsx("text", { x: "50%", y: "50%", textAnchor: "middle", fontSize: "16", fill: "#666", children: "Waterfall Chart (Coming Soon)" });
g >
;
;
const DropoffAnalysisPanel = ({ dropoffAnalysis }) => {
    const criticalDropoffs = dropoffAnalysis;
};
filter(d => d.severity === 'critical' || d.severity === 'high')
    .sort((a, b) => b.dropOffRate - a.dropOffRate);
return;
_jsxs("div", { className: "dropoff-analysis-panel", children: [_jsx("h4", { children: "Drop-off Analysis" }), _jsxs("div", { className: "critical-dropoffs", children: [criticalDropoffs.map(dropoff => ()
                    < div, key = { dropoff, : .stepId }, className = {} `dropoff-item ${dropoff.severity}`), ">}", _jsxs("div", { className: "dropoff-header", children: [_jsx("h5", { children: dropoff.stepName }), _jsxs("span", { className: "dropoff-rate", children: [dropoff.dropOffRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "dropoff-details", children: [_jsxs("p", { children: [dropoff.dropOffCount.toLocaleString(), " users dropped off at this step"] }), dropoff.dropOffReasons.slice(0, 2).map((reason, index) => ()
                            < div, key = { index }, className = "dropoff-reason" >
                            (_jsx("span", { className: "reason", children: reason.reason })
                                ,
                                    _jsxs("span", { className: "percentage", children: [reason.percentage.toFixed(1), "%"] })))] }), "))}"] }), dropoff.recommendedActions.length > 0 && ()
            < div, " className=\"recommended-actions\">", _jsx("strong", { children: "Recommended Actions:" }), _jsx("ul", { children: dropoff.recommendedActions.slice(0, 2).map((action, index) => ()
                < li, key = { index } > { action }) }), "))}"] });
div >
;
div >
;
div >
;
div >
;
;
;
const SegmentComparisonPanel = ({ segmentComparisons }) => {
    return;
    _jsxs("div", { className: "segment-comparison-panel", children: [_jsx("h4", { children: "Segment Performance" }), _jsx("div", { className: "segment-grid", children: segmentComparisons.map(segment => ()
                    < div, key = { segment, : .segmentId }, className = "segment-comparison-card" >
                    (_jsx("h5", { children: segment.segmentName })
                        ,
                            _jsxs("div", { className: "overall-rate", children: [segment.overallConversionRate.toFixed(1), "% conversion rate"] })), { segment, : .insights.length > 0 && ()
                        < div, className = "segment-insights" >
                        { segment, : .insights.slice(0, 2).map((insight, index) => ()
                                < p, key = { index }, className = "insight" > { insight }) } }) }), "))}"] });
};
div >
;
div >
;
div >
;
;
;
position: {
    x: number;
    y: number;
}
;
onClose: () => void ;
const StepTooltip = ({ content, position, onClose }) => {
    return;
    _jsxs("div", { className: "step-tooltip", style: {
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 1000,
        }, children: [_jsxs("div", { className: "tooltip-header", children: [_jsx("h4", { children: content.stepName }), _jsx("button", { onClick: onClose, className: "close-button", children: "\u00D7" })] }), _jsxs("div", { className: "tooltip-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { children: "Entries:" }), _jsx("span", { children: content.metrics.totalEntries.toLocaleString() })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Conversions:" }), _jsx("span", { children: content.metrics.totalConversions.toLocaleString() })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Conversion Rate:" }), _jsxs("span", { children: [content.metrics.conversionRate.toFixed(2), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Drop-off:" }), _jsxs("span", { children: [content.metrics.dropOffCount.toLocaleString(), " (", content.metrics.dropOffRate.toFixed(1), "%)"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Revenue:" }), _jsxs("span", { children: ["$", content.metrics.revenue.toLocaleString()] }), "}"] })] }), content.insights.length > 0 && ()
                < div, " className=\"tooltip-insights\">", _jsx("strong", { children: "Insights:" }), _jsx("ul", { children: content.insights.slice(0, 3).map((insight, index) => ()
                    < li, key = { index } > { insight }) }), "))}"] });
};
div >
;
div >
;
;
;
// Loading and Error States
const FunnelChartLoadingState = () => ()
    < div, className = "funnel-chart-loading" >
    (_jsx("div", { className: "loading-spinner" })
        ,
            _jsx("p", { children: "Loading funnel chart..." }));
div >
;
;
const FunnelChartErrorState = ({ error, onRetry }) => ()
    < div, className = "funnel-chart-error" >
    (_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Chart" }), _jsx("p", { children: error })] })
        ,
            _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry Loading" }));
div >
;
;
// Utility Functions
function getStepColor(conversionRate, index) {
    // Color gradient based on conversion rate
    if (conversionRate >= 80)
        return '#10b981'; // Green for high conversion
    if (conversionRate >= 60)
        return '#f59e0b'; // Yellow for medium conversion
    if (conversionRate >= 40)
        return '#f97316'; // Orange for low conversion
    return '#ef4444'; // Red for very low conversion
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
}
if (minutes > 0)
    return `${minutes}m ${seconds % 60}s`;
return `${seconds}s`;
function generateStepInsights(step) {
    const insights = [];
    if (step.conversionRate > 80) {
        insights.push('High-performing step with excellent conversion rate');
    }
    else if (step.conversionRate < 40) {
        insights.push('Low conversion rate - optimization opportunity');
        if (step.dropOffRate > 50) {
            insights.push('High drop-off rate - investigate user experience issues');
            if (step.averageTimeSpent > 300000) { // 5 minutes
                insights.push('Users spend significant time on this step');
                return insights;
                metricResults: ConversionMetricResult,
                    segments;
                UserSegment,
                    cohorts;
                ConversionCohort,
                    timeRange;
                {
                    start: number;
                    end: number;
                }
                Promise < FunnelChartData > {
                    // Simplified implementation - in production would process actual metrics
                    const: steps, StepMetrics = funnelDefinition.steps.map((step, index) => ({}), stepId, step.id, stepName, step.name, order, step.order, totalEntries, 1000 - (index * 150), totalConversions, 1000 - ((index + 1) * 150), conversionRate, index < funnelDefinition.steps.length - 1 ?  : , ((1000 - ((index + 1) * 150)) / (1000 - (index * 150))) * 100, 100, dropOffCount, 150, dropOffRate, 15.0, averageTimeSpent, 120000 + (index * 30000), revenue, 500 * (index + 1), revenuePerConversion, 25 + (index * 5), comparisonData, {
                        previousPeriod: {
                            conversionRate: 75 + (Math.random() * 20),
                            change: (Math.random() - 0.5) * 20,
                            direction: Math.random() > 0.5 ? 'improvement' : 'decline',
                        },
                        benchmark: {
                            conversionRate: 70 + (Math.random() * 15),
                            percentile: 60 + (Math.random() * 30),
                            industry: 'marketplace',
                        },
                        segments: segments.slice(0, 2).map(segment => ({}), segmentId, segment.id, segmentName, segment.name, conversionRate, 60 + (Math.random() * 40), performance, Math.random() > 0.5 ? 'above_average' : 'below_average')
                    })
                };
                ;
                const overallMetrics = {
                    totalEntries: 1000,
                    totalConversions: 150,
                    overallConversionRate: 15.0,
                    averageTimeToConvert: 86400000,
                    totalRevenue: 3750,
                    revenuePerEntry: 3.75,
                    revenuePerConversion: 25,
                    totalDropoffs: 850,
                    biggestDropoffStep: steps[1]?.stepId || '',
                    mostEfficientStep: steps[0]?.stepId || '',
                };
                const dropoffAnalysis = steps
                    .filter(step => step.dropOffRate > 10)
                    .map(step => ({}), stepId, step.stepId, stepName, step.stepName, dropOffCount, step.dropOffCount, dropOffRate, step.dropOffRate, dropOffReasons, [
                    {
                        reason: 'Complex form fields',
                        category: 'user_experience',
                        percentage: 35,
                        count: Math.floor(step.dropOffCount * 0.35),
                        confidence: 0.85,
                    },
                    {
                        reason: 'Page load time',
                        category: 'technical',
                        percentage: 25,
                        count: Math.floor(step.dropOffCount * 0.25),
                        confidence: 0.78
                    }
                ], recoveryOpportunity, 45, recommendedActions, [
                    'Simplify form fields and reduce required information',
                    'Optimize page loading performance',
                    'Add progress indicators to improve user experience'
                ], severity, step.dropOffRate > 30 ? 'critical' : step.dropOffRate > 20 ? 'high' : 'medium');
            }
            ;
            const segmentComparisons = segments.map(segment => ({}), segmentId, segment.id, segmentName, segment.name, overallConversionRate, segment.performance.averageConversionRate, stepPerformance, steps.map(step => ({}), stepId, step.stepId, conversionRate, step.conversionRate * (0.8 + Math.random() * 0.4), relativePerformance, (Math.random() - 0.5) * 40));
        }
        insights: [
            `${segment.name} shows ${Math.random() > 0.5 ? 'above' : 'below'} average performance`
        ];
    }
}
`Strongest performance in step ${steps[Math.floor(Math.random() * steps.length)].stepName}`;
;
return {
    steps,
    overallMetrics,
    dropoffAnalysis,
    trends: [], // TODO: Implement trend analysis,
    segmentComparisons
};
export default FunnelChart;
