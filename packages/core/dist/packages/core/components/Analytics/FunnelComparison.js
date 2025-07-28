import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Funnel Comparison and A/B Testing Integration - Story 30.2 Task 5
 *
 * Advanced funnel comparison system with A/B testing integration,
 * statistical significance testing, and automated insights generation.
 *
 * Features:
 * - Side-by-side funnel comparison
 * - Time period comparison analysis
 * - A/B test experiment tracking
 * - Statistical significance testing
 * - Automated insights and recommendations
 * - Cohort-based comparison
 * - Segment-based comparison
 * - Export and reporting capabilities
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
export const FunnelComparison = ({
    analyticsInfrastructure,
    primaryFunnel,
    comparisonMode,
    comparisonConfig,
    onInsightGenerated,
    onExportRequest
});
{
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedInsight, setSelectedInsight] = useState(null);
    const [viewMode, setViewMode] = useState('overview');
    // Load comparison data
    const loadComparisonData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await performFunnelComparison();
        }
        finally { }
    });
    analyticsInfrastructure,
        primaryFunnel,
        comparisonConfig;
    ;
    setComparisonResult(result);
    if (comparisonConfig.autoGenerateInsights && result.insights.length > 0) {
        onInsightGenerated?.(result.insights);
    }
    try { }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison data');
    }
    finally {
        setLoading(false);
    }
    [analyticsInfrastructure, primaryFunnel, comparisonConfig, onInsightGenerated];
    ;
    useEffect(() => {
        loadComparisonData();
    }, [loadComparisonData]);
    const handleExport = useCallback(() => {
        if (comparisonResult && onExportRequest) {
            const exportData = {
                comparison: comparisonResult,
                rawData: {
                    baselineEvents: [], // TODO: Include actual raw data,
                    comparisonEvents: [],
                },
                visualizations: generateComparisonVisualizations(comparisonResult),
                reportSummary: generateReportSummary(comparisonResult)
            };
            onExportRequest(exportData);
        }
        [comparisonResult, onExportRequest];
    });
    if (loading) {
        return _jsx(ComparisonLoadingState, {});
        if (error || !comparisonResult) {
            return _jsx(ComparisonErrorState, { error: error || 'No data available', onRetry: loadComparisonData });
            return;
            _jsxs("div", { className: "funnel-comparison", children: [_jsx(ComparisonHeader, { configuration: comparisonConfig, result: comparisonResult, viewMode: viewMode, onViewModeChange: setViewMode, onExport: handleExport }), _jsx(ComparisonSummary, { baseline: comparisonResult.baseline, comparison: comparisonResult.comparison, delta: comparisonResult.delta, mode: comparisonMode }), comparisonResult.insights.length > 0 && ()
                        < InsightsPanel, "insights=", comparisonResult.insights, "selectedInsight=", selectedInsight, "onInsightSelect=", setSelectedInsight, "/> )}", viewMode === 'overview' && ()
                        < OverviewComparison, "baseline=", comparisonResult.baseline, "comparison=", comparisonResult.comparison, "delta=", comparisonResult.delta, "/> )}", viewMode === 'detailed' && ()
                        < DetailedComparison, "baseline=", comparisonResult.baseline, "comparison=", comparisonResult.comparison, "delta=", comparisonResult.delta, "funnelDefinition=", primaryFunnel, "/> )}", viewMode === 'statistical' && ()
                        < StatisticalAnalysis, "statisticalTests=", comparisonResult.statisticalTests, "metadata=", comparisonResult.metadata, "configuration=", comparisonConfig, "/> )}", selectedInsight && ()
                        < InsightDetailModal, "insight=", selectedInsight, "comparisonResult=", comparisonResult, "onClose=", () => setSelectedInsight(null), "/> )}"] });
            ;
        }
        ;
        {
            return;
            _jsxs("div", { className: "comparison-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Funnel Comparison" }), _jsxs("p", { className: "comparison-description", children: [configuration.baseline.name, " vs ", configuration.comparison.name] }), _jsxs("div", { className: "comparison-meta", children: [_jsx("span", { className: "mode-indicator", children: configuration.mode.replace('_', ' ') }), _jsxs("span", { className: "confidence-level", children: [((1 - configuration.significanceLevel) * 100).toFixed(0), "% confidence"] })] })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "view-mode-selector", children: [['overview', 'detailed', 'statistical'].map(mode => ()
                                        < button, key = { mode }, onClick = {}()), " => onViewModeChange(mode)} className=", `mode-button ${viewMode === mode ? 'active' : ''}`, ">", mode.charAt(0).toUpperCase() + mode.slice(1)] }), "))}"] }), _jsx("button", { onClick: onExport, className: "export-button", children: "Export Report" })] });
            div >
            ;
            ;
        }
        ;
        {
            return;
            _jsx("div", { className: "comparison-summary", children: _jsxs("div", { className: "summary-grid", children: [_jsx(MetricComparisonCard, { title: "Overall Conversion Rate", baseline: baseline.overallConversionRate, comparison: comparison.overallConversionRate, delta: delta.overallConversionRate, format: "percentage" }), _jsx(MetricComparisonCard, { title: "Total Conversions", baseline: baseline.totalConversions, comparison: comparison.totalConversions, delta: delta.totalConversions, format: "number" }), _jsx(MetricComparisonCard, { title: "Average Time to Convert", baseline: baseline.averageTimeToConvert, comparison: comparison.averageTimeToConvert, delta: delta.averageTimeToConvert, format: "duration" }), _jsx(MetricComparisonCard, { title: "Total Value", baseline: baseline.totalValue, comparison: comparison.totalValue, delta: delta.totalValue, format: "currency" })] }) });
            ;
        }
        ;
        {
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
    }
    return value.toLocaleString();
}
;
return;
_jsxs("div", { className: "metric-comparison-card", children: [_jsx("h4", { className: "metric-title", children: title }), _jsxs("div", { className: "metric-values", children: [_jsxs("div", { className: "baseline-value", children: [_jsx("span", { className: "label", children: "Baseline" }), _jsx("span", { className: "value", children: formatValue(baseline) })] }), _jsxs("div", { className: "comparison-value", children: [_jsx("span", { className: "label", children: "Comparison" }), _jsx("span", { className: "value", children: formatValue(comparison) })] })] }), _jsxs("div", { className: `metric-delta ${delta.direction}`, children: ["}", _jsxs("span", { className: "delta-value", children: [delta.relative > 0 ? '+' : '', delta.relative.toFixed(1), "%"] }), _jsxs("span", { className: "delta-absolute", children: ["(", delta.absolute > 0 ? '+' : '', formatValue(delta.absolute), ")"] }), _jsxs("span", { className: `delta-indicator ${delta.direction}`, children: ["}", delta.direction === 'improvement' ? '↗' :
                            delta.direction === 'decline' ? '↘' : '→'] })] })] });
;
;
{
    const sortedInsights = useMemo(() => {
        return [...insights].sort((a, b) => {
            // Sort by priority first, then by severity
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            }
        });
    }, [insights]);
    return;
    _jsxs("div", { className: "insights-panel", children: [_jsx("h3", { children: "Key Insights" }), _jsxs("div", { className: "insights-grid", children: [sortedInsights.map((insight, index) => ()
                        < InsightCard, key = { index }, insight = { insight }, isSelected = { selectedInsight } === insight), "onClick=", () => onInsightSelect(insight), "/> ))}"] })] });
    ;
}
;
{
    insight.recommendations && insight.recommendations.length > 0 && ()
        < div;
    className = "insight-recommendations" >
        (_jsx("strong", { children: "Recommendations:" })
            ,
                _jsx("ul", { children: insight.recommendations.slice(0, 2).map((rec, index) => ()
                        < li, key = { index } > { rec }) }));
}
ul >
;
div >
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "overview-comparison", children: [_jsxs("div", { className: "funnel-charts", children: [_jsxs("div", { className: "baseline-funnel", children: [_jsx("h4", { children: "Baseline" }), _jsx(SimpleFunnelChart, { steps: baseline.stepPerformance })] }), _jsxs("div", { className: "comparison-funnel", children: [_jsx("h4", { children: "Comparison" }), _jsx(SimpleFunnelChart, { steps: comparison.stepPerformance })] })] }), _jsx(StepByStepComparison, { baselineSteps: baseline.stepPerformance, comparisonSteps: comparison.stepPerformance, stepDeltas: delta.stepDeltas })] });
    ;
}
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "step-by-step-comparison", children: [_jsx("h4", { children: "Step-by-Step Analysis" }), _jsxs("div", { className: "steps-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { children: "Step" }), _jsx("div", { children: "Baseline Rate" }), _jsx("div", { children: "Comparison Rate" }), _jsx("div", { children: "Change" }), _jsx("div", { children: "Drop-off Change" })] }), baselineSteps.map((baselineStep, index) => {
                        const comparisonStep = comparisonSteps.find(s => s.stepId === baselineStep.stepId);
                        const delta = stepDeltas.find(d => d.stepId === baselineStep.stepId);
                        if (!comparisonStep || !delta)
                            return null;
                        return;
                        _jsxs("div", { className: "table-row", children: [_jsx("div", { className: "step-name", children: baselineStep.stepName }), _jsxs("div", { className: "baseline-rate", children: [baselineStep.conversionRate.toFixed(1), "%"] }), _jsxs("div", { className: "comparison-rate", children: [comparisonStep.conversionRate.toFixed(1), "%"] }), _jsxs("div", { className: `conversion-change ${delta.conversionRate.direction}`, children: ["}", delta.conversionRate.relative > 0 ? '+' : '', delta.conversionRate.relative.toFixed(1), "%"] }), _jsxs("div", { className: `dropoff-change ${delta.dropOffRate.direction}`, children: ["}", delta.dropOffRate.relative > 0 ? '+' : '', delta.dropOffRate.relative.toFixed(1), "%"] })] }, baselineStep.stepId);
                    }), "; })}"] })] });
    ;
}
;
/**
 * Detailed Comparison Component
 */
const DetailedComparison = () => ()
    < div, className = "detailed-comparison" >
    _jsx("p", { children: "Detailed Comparison View (TODO: Implement)" });
div >
;
;
/**
 * Statistical Analysis Component
 */
const StatisticalAnalysis = () => ()
    < div, className = "statistical-analysis" >
    _jsx("p", { children: "Statistical Analysis View (TODO: Implement)" });
div >
;
;
/**
 * Insight Detail Modal Component
 */
const InsightDetailModal = () => ()
    < div, className = "insight-detail-modal" >
    _jsx("p", { children: "Insight Detail Modal (TODO: Implement)" });
div >
;
;
// Loading and Error States
const ComparisonLoadingState = () => ()
    < div, className = "comparison-loading" >
    (_jsx("div", { className: "loading-spinner" })
        ,
            _jsx("p", { children: "Analyzing funnel performance..." }));
div >
;
;
className = "comparison-error" >
    (_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Comparison" }), _jsx("p", { children: error })] })
        ,
            _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry Analysis" }));
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
funnelDefinition: ConversionFunnelDefinition,
    configuration;
ComparisonConfiguration;
Promise < ComparisonResult > {
    // Simplified implementation - in production would perform actual statistical analysis
    const: baselineData, FunnelPerformanceData = {
        targetId: configuration.baseline.id,
        totalEntries: 1000,
        totalConversions: 150,
        overallConversionRate: 15.0,
        averageTimeToConvert: 86400000,
        totalValue: 3750,
        stepPerformance: funnelDefinition.steps.map((step, index) => ({}), stepId, step.id, stepName, step.name, order, step.order, entries, 1000 - (index * 150), conversions, 1000 - ((index + 1) * 150), conversionRate, index < funnelDefinition.steps.length - 1 ? 82.4 : 100, dropOffCount, 150, dropOffRate, 17.6, averageTimeSpent, 120000, value, 500)
    },
    additionalMetrics: {}
};
const comparisonData = {
    targetId: configuration.comparison.id,
    totalEntries: 1200,
    totalConversions: 216,
    overallConversionRate: 18.0,
    averageTimeToConvert: 72000000,
    totalValue: 5400,
    stepPerformance: funnelDefinition.steps.map((step, index) => ({}), stepId, step.id, stepName, step.name, order, step.order, entries, 1200 - (index * 150), conversions, 1200 - ((index + 1) * 150), conversionRate, index < funnelDefinition.steps.length - 1 ? 87.5 : 100, dropOffCount, 150, dropOffRate, 12.5, averageTimeSpent, 100000, value, 600)
}, additionalMetrics;
;
const delta = calculatePerformanceDelta(baselineData, comparisonData);
const statisticalTests = performStatisticalTests(baselineData, comparisonData, configuration);
const insights = generateComparisonInsights(baselineData, comparisonData, delta, statisticalTests);
return {
    baseline: baselineData,
    comparison: comparisonData,
    delta,
    statisticalTests,
    insights,
    metadata: {
        comparisonId: `comparison-${Date.now()}` }
},
    generatedAt;
Date.now(),
    configuration,
    dataQuality;
{
    baselineSampleSize: baselineData.totalEntries,
        comparisonSampleSize;
    comparisonData.totalEntries,
        dataCompleteness;
    0.95,
        outlierCount;
    5,
        confidenceLevel;
    1 - configuration.significanceLevel,
    ;
}
executionTime: 1500,
    cacheHit;
false;
;
function calculatePerformanceDelta() { }
();
baseline: FunnelPerformanceData,
    comparison;
FunnelPerformanceData,
;
PerformanceDelta;
{
    const calculateDelta = (baseValue, compValue) => {
        const absolute = compValue - baseValue;
        const relative = baseValue > 0 ? (absolute / baseValue) * 100 : 0;
        const direction = absolute > 1 ? 'improvement' : absolute < -1 ? 'decline' : 'no_change';
        return { absolute, relative, direction: direction };
    };
    return {
        overallConversionRate: calculateDelta(baseline.overallConversionRate, comparison.overallConversionRate),
        totalConversions: calculateDelta(baseline.totalConversions, comparison.totalConversions),
        averageTimeToConvert: calculateDelta(baseline.averageTimeToConvert, comparison.averageTimeToConvert),
        totalValue: calculateDelta(baseline.totalValue, comparison.totalValue),
        stepDeltas: baseline.stepPerformance.map(baseStep => { }),
        const: compStep = comparison.stepPerformance.find(s => s.stepId === baseStep.stepId),
        return: {
            stepId: baseStep.stepId,
            conversionRate: calculateDelta(baseStep.conversionRate, compStep?.conversionRate || 0),
            dropOffRate: calculateDelta(baseStep.dropOffRate, compStep?.dropOffRate || 0),
        }
    };
}
;
comparison: FunnelPerformanceData,
    configuration;
ComparisonConfiguration;
StatisticalTestResult;
{
    // Simplified statistical test implementation
    return [
        {
            testType: 'z_test',
            metric: 'overall_conversion_rate',
            pValue: 0.023,
            statisticValue: 2.28,
            isSignificant: true,
            confidenceInterval: [0.5, 5.2],
            effectSize: 0.15
        }
    ];
    comparison: FunnelPerformanceData,
        delta;
    PerformanceDelta,
        statisticalTests;
    StatisticalTestResult;
    ComparisonInsight;
    {
        const insights = [];
        // Overall conversion rate insight
        if (delta.overallConversionRate.direction === 'improvement' && Math.abs(delta.overallConversionRate.relative) > 5) {
            insights.push({});
            type: 'significant_improvement',
                severity;
            'high',
                title;
            'Significant Conversion Rate Improvement',
                description;
            `The comparison funnel shows a ${delta.overallConversionRate.relative.toFixed(1)}% relative improvement in conversion rate.`;
        }
    }
    metric: 'overall_conversion_rate',
        evidence;
    {
        statisticalTest: statisticalTests.find(t => t.metric === 'overall_conversion_rate'),
            sampleSizes;
        {
            baseline: baseline.totalEntries, comparison;
            comparison.totalEntries;
        }
        effectSize: 0.15,
            confidenceLevel;
        0.95;
    }
    recommendations: [,
        'Consider implementing the comparison funnel configuration as the new standard',
        'Monitor the performance over time to ensure sustained improvement'
    ],
        priority;
    10;
}
;
return insights;
function generateComparisonVisualizations(result) {
    return [
        {
            type: 'funnel_chart',
            title: 'Funnel Performance Comparison',
            data: { baseline: result.baseline, comparison: result.comparison },
            configuration: { showDelta: true }
        }
    ];
    function generateReportSummary(result) {
        return `Funnel comparison completed with ${result.insights.length} key insights identified.`;
    }
    export default FunnelComparison;
}
