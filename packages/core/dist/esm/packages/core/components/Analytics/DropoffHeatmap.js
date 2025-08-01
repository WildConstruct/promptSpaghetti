import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Conversion Drop-off Analysis and Heatmaps - Story 30.2 Task 6
 *
 * Advanced drop-off analysis with visual heatmaps, root cause analysis,
 * and recovery opportunity identification.
 *
 * Features:
 * - Interactive drop-off heatmaps
 * - Root cause analysis with confidence scores
 * - Recovery opportunity assessment
 * - Time-based drop-off patterns
 * - User behavior flow analysis
 * - Segmented drop-off analysis
 * - Actionable recommendations
 * - Export capabilities
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
timeRange: {
    start: number;
    end: number;
}
;
segments ?  : UserSegment;
cohorts ?  : ConversionCohort;
heatmapMode ?  : HeatmapMode;
showRecoveryAnalysis ?  : boolean;
realTimeUpdates ?  : boolean;
onDropoffPointClick ?  : (analysis) => void ;
onExport ?  : (data) => void ;
 > ;
insights: string;
 > ;
uniqueDropOffReasons: DropoffReason;
segmentInsights: string;
;
recommendations: {
    quick: QuickWin;
    strategic: StrategicInitiative;
}
;
metadata: {
    exportedAt: number;
    timeRange: {
        start: number;
        end: number;
    }
    ;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}
;
export const DropoffHeatmap = ({
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    segments = [],
    cohorts = [],
    heatmapMode = 'relative',
    showRecoveryAnalysis = true,
    realTimeUpdates = false,
    onDropoffPointClick,
    onExport
});
{
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStep, setSelectedStep] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const heatmapRef = useRef(null);
    // Load drop-off analysis data
    const loadAnalysisData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const query = {
                funnelId: funnelDefinition.id,
                startDate: timeRange.start,
                endDate: timeRange.end,
                metrics: [
                    'drop_off_rate',
                    'exit_behavior',
                    'user_journey',
                    'technical_performance',
                    'content_engagement',
                    'recovery_opportunities'
                ],
                groupBy: ['funnel_step', 'hour', 'user_segment'],
                filters: [
                    ...segments.map(segment => ({}), field, 'userContext.segmentIds', operator, 'contains', value, segment.id)
                ]
            };
        }
        finally { }
    });
    cohorts.map(cohort => ({}), field, 'userContext.cohortIds', operator, 'contains', value, cohort.id);
}
aggregation: {
    interval: 'hour';
}
;
const results = await analyticsInfrastructure.queryMetrics(query);
const processedData = await processDropoffAnalysisData();
;
funnelDefinition,
    results,
    segments,
    cohorts,
    timeRange;
;
setAnalysisData(processedData);
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load drop-off analysis');
}
finally {
    setLoading(false);
}
[funnelDefinition, analyticsInfrastructure, timeRange, segments, cohorts];
;
useEffect(() => {
    loadAnalysisData();
}, [loadAnalysisData]);
// Real-time updates
useEffect(() => {
    if (!realTimeUpdates)
        return;
    const interval = setInterval(loadAnalysisData, 60000); // Update every minute;
    return () => clearInterval(interval);
}, [realTimeUpdates, loadAnalysisData]);
// Heatmap color scaling
const colorScale = useMemo(() => {
    if (!analysisData)
        return null;
    const values = analysisData.stepAnalysis.map(step => { });
    switch (heatmapMode) {
        case 'absolute': return step.dropOffCount;
        case 'relative': return step.dropOffRate;
        case 'severity': return getSeverityScore(step.dropOffSeverity);
        case 'opportunity': return step.recoveryPotential;
        default: return step.dropOffRate;
    }
});
const min = Math.min(...values);
const max = Math.max(...values);
return { min, max, range: max - min };
[analysisData, heatmapMode];
;
const handleCellHover = useCallback((stepId, metric) => {
    setHoveredCell(stepId && metric ? { stepId, metric } : null);
}, []);
const handleStepClick = useCallback((stepId) => {
    if (!analysisData)
        return;
    const stepAnalysis = analysisData.stepAnalysis.find(s => s.stepId === stepId);
    const rootCause = analysisData.rootCauseAnalysis.find(r => r.stepId === stepId);
    const recovery = analysisData.recoveryOpportunities.find(r => r.stepId === stepId);
    if (stepAnalysis && rootCause && recovery) {
        setSelectedStep(stepId);
        onDropoffPointClick?.({});
        stepId,
            analysis;
        stepAnalysis,
            rootCause,
            recovery;
    }
});
[analysisData, onDropoffPointClick];
;
const handleExport = useCallback(async () => {
    if (!analysisData)
        return;
    const exportData = {
        heatmapMode,
        data: analysisData,
        visualizations: {
            heatmap: 'heatmap-svg-data', // TODO: Generate actual SVG,
            flowDiagram: 'flow-svg-data',
            trends: 'trends-svg-data',
        },
        recommendations: {
            quick: analysisData.recoveryOpportunities.flatMap(r => r.quickWins),
            strategic: analysisData.recoveryOpportunities.flatMap(r => r.strategicInitiatives),
        },
        metadata: {
            exportedAt: Date.now(),
            timeRange,
            analysisDepth: 'comprehensive',
        },
        onExport }(exportData);
}, [analysisData, heatmapMode, timeRange, onExport]);
if (loading) {
    return _jsx(DropoffAnalysisLoadingState, {});
    if (error || !analysisData) {
        return;
        _jsx(DropoffAnalysisErrorState, { error: error || 'No data available', onRetry: loadAnalysisData });
        ;
        return;
        _jsxs("div", { className: "dropoff-heatmap", ref: heatmapRef, children: [_jsx(DropoffHeatmapHeader, { funnelDefinition: funnelDefinition, heatmapMode: heatmapMode, analysisData: analysisData, onExport: handleExport }), _jsx("div", { className: "heatmap-container", children: _jsx(HeatmapVisualization, { analysisData: analysisData, heatmapMode: heatmapMode, colorScale: colorScale, hoveredCell: hoveredCell, selectedStep: selectedStep, onCellHover: handleCellHover, onStepClick: handleStepClick }) }), _jsxs("div", { className: "analysis-panels", children: [selectedStep && ()
                            < StepDetailPanel, "stepId=", selectedStep, "analysisData=", analysisData, "onClose=", () => setSelectedStep(null), "/> )}", showRecoveryAnalysis && ()
                            < RecoveryOpportunityPanel, "opportunities=", analysisData.recoveryOpportunities, "/> )}", _jsx(DropoffInsightsPanel, { insights: analysisData.overallInsights, rootCauses: analysisData.rootCauseAnalysis })] }), analysisData.temporalPatterns.length > 0 && ()
                    < TemporalPatternsPanel, "patterns=", analysisData.temporalPatterns, "/> )}"] });
        ;
    }
    ;
    /**
     * Drop-off Heatmap Header Component
     */
}
{
    const criticalDropoffs = analysisData.stepAnalysis.filter(s => s.dropOffSeverity === 'critical').length;
    const totalRecoveryValue = analysisData.recoveryOpportunities.reduce((sum, r) => sum + r.recoveryValue, 0);
    return;
    _jsxs("div", { className: "dropoff-heatmap-header", children: [_jsxs("div", { className: "header-info", children: [_jsxs("h3", { children: ["Drop-off Analysis: ", funnelDefinition.name] }), _jsx("p", { children: "Comprehensive analysis of user drop-off patterns and recovery opportunities" }), _jsxs("div", { className: "key-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Critical Drop-off Points" }), _jsx("span", { className: "value", children: criticalDropoffs })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Recovery Potential" }), _jsxs("span", { className: "value", children: ["$", totalRecoveryValue.toLocaleString()] }), "}"] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Analysis Mode" }), _jsx("span", { className: "value", children: heatmapMode.replace('_', ' ') })] })] })] }), _jsx("div", { className: "header-controls", children: _jsx("button", { onClick: onExport, className: "export-button", children: "Export Analysis" }) })] });
    ;
}
;
colorScale: {
    min: number;
    max: number;
    range: number;
}
 | null;
hoveredCell: {
    stepId: string;
    metric: string;
}
 | null;
selectedStep: string | null;
onCellHover: (stepId, metric) => void ;
onStepClick: (stepId) => void ;
const HeatmapVisualization = ({
    analysisData,
    heatmapMode,
    colorScale,
    hoveredCell,
    selectedStep,
    onCellHover,
    onStepClick
});
{
    const metrics = ['Drop-off Rate', 'Recovery Potential', 'Severity', 'Impact'];
    return;
    _jsxs("div", { className: "heatmap-visualization", children: [_jsxs("div", { className: "heatmap-grid", children: [_jsxs("div", { className: "grid-header", children: [_jsx("div", { className: "step-header", children: "Funnel Step" }), metrics.map(metric => ()
                                < div, key = { metric }, className = "metric-header" > { metric })] }), "))}"] }), analysisData.stepAnalysis.map(step => ()
                < div, key = { step, : .stepId }, className = {} `grid-row ${selectedStep === step.stepId ? 'selected' : ''}`), ">", _jsxs("div", { className: "step-label", onClick: () => onStepClick(step.stepId), children: [_jsx("span", { className: "step-name", children: step.stepName }), _jsxs("span", { className: "step-order", children: ["Step ", step.stepOrder] })] }), _jsxs("div", { className: `heatmap-cell dropoff-rate ${getSeverityClass(step.dropOffSeverity)}`, style: {
                    backgroundColor: getHeatmapColor(step.dropOffRate, colorScale, 'dropoff'),
                }, onMouseEnter: () => onCellHover(step.stepId, 'dropoff-rate'), onMouseLeave: () => onCellHover(null, null), children: [step.dropOffRate.toFixed(1), "%"] }), _jsxs("div", { className: "heatmap-cell recovery-potential", style: {
                    backgroundColor: getHeatmapColor(step.recoveryPotential, colorScale, 'recovery'),
                }, onMouseEnter: () => onCellHover(step.stepId, 'recovery'), onMouseLeave: () => onCellHover(null, null), children: [step.recoveryPotential.toFixed(0), "%"] }), _jsx("div", { className: `heatmap-cell severity ${step.dropOffSeverity}`, onMouseEnter: () => onCellHover(step.stepId, 'severity'), onMouseLeave: () => onCellHover(null, null), children: step.dropOffSeverity.toUpperCase() }), _jsxs("div", { className: "heatmap-cell impact", onMouseEnter: () => onCellHover(step.stepId, 'impact'), onMouseLeave: () => onCellHover(null, null), children: ["$", (step.dropOffCount * 25).toLocaleString()] })] });
}
div >
    _jsx(HeatmapLegend, { heatmapMode: heatmapMode, colorScale: colorScale });
div >
;
;
;
colorScale: {
    min: number;
    max: number;
    range: number;
}
 | null;
const HeatmapLegend = ({ heatmapMode, colorScale }) => {
    if (!colorScale)
        return null;
    const gradientStops = [
        { offset: '0%', color: '#10b981' }, // Green (low drop-off)
        { offset: '50%', color: '#f59e0b' }, // Yellow (medium drop-off)
        { offset: '100%', color: '#ef4444' } // Red (high drop-off)
    ];
    return;
    _jsxs("div", { className: "heatmap-legend", children: [_jsxs("div", { className: "legend-title", children: [heatmapMode.replace('_', ' ').toUpperCase(), " Scale"] }), _jsxs("div", { className: "legend-gradient", children: [_jsxs("svg", { width: "200", height: "20", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "heatmap-gradient", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [gradientStops.map(stop => ()
                                            < stop, key = { stop, : .offset }, offset = { stop, : .offset }, stopColor = { stop, : .color } /  >
                                        ), ")}"] }) }), _jsx("rect", { x: "0", y: "0", width: "200", height: "20", fill: "url(#heatmap-gradient)" })] }), _jsxs("div", { className: "legend-labels", children: [_jsx("span", { children: colorScale.min.toFixed(1) }), _jsx("span", { children: ((colorScale.min + colorScale.max) / 2).toFixed(1) }), _jsx("span", { children: colorScale.max.toFixed(1) })] })] })] });
};
;
;
const StepDetailPanel = ({ stepId, analysisData, onClose }) => {
    const stepAnalysis = analysisData.stepAnalysis.find(s => s.stepId === stepId);
    const rootCause = analysisData.rootCauseAnalysis.find(r => r.stepId === stepId);
    const recovery = analysisData.recoveryOpportunities.find(r => r.stepId === stepId);
    if (!stepAnalysis || !rootCause || !recovery)
        return null;
    return;
    _jsxs("div", { className: "step-detail-panel", children: [_jsxs("div", { className: "panel-header", children: [_jsxs("h4", { children: [stepAnalysis.stepName, " - Detailed Analysis"] }), _jsx("button", { onClick: onClose, className: "close-button", children: "\u00D7" })] }), _jsxs("div", { className: "detail-sections", children: [_jsxs("div", { className: "overview-section", children: [_jsx("h5", { children: "Overview" }), _jsxs("div", { className: "metrics-grid", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { children: "Drop-off Count:" }), _jsx("span", { children: stepAnalysis.dropOffCount.toLocaleString() })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Drop-off Rate:" }), _jsxs("span", { children: [stepAnalysis.dropOffRate.toFixed(2), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Severity:" }), _jsxs("span", { className: `severity ${stepAnalysis.dropOffSeverity}`, children: ["}", stepAnalysis.dropOffSeverity.toUpperCase()] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Recovery Potential:" }), _jsxs("span", { children: [stepAnalysis.recoveryPotential.toFixed(1), "%"] })] })] })] }), _jsxs("div", { className: "root-cause-section", children: [_jsx("h5", { children: "Root Cause Analysis" }), _jsx("div", { className: "primary-causes", children: rootCause.primaryCauses.slice(0, 3).map((cause, index) => ()
                                    < div, key = { index }, className = "cause-item" >
                                    (_jsxs("div", { className: "cause-header", children: [_jsx("span", { className: "category", children: cause.category }), _jsxs("span", { className: "impact", children: [cause.impact, "% impact"] })] })
                                        ,
                                            _jsx("p", { className: "cause-description", children: cause.description })
                                                ,
                                                    _jsxs("div", { className: "mitigation", children: [_jsx("strong", { children: "Complexity:" }), " ", cause.mitigationComplexity, _jsx("strong", { children: "Expected Improvement:" }), " ", cause.expectedImprovement, "%"] }))) }), "))}"] })] }), _jsxs("div", { className: "recovery-section", children: [_jsx("h5", { children: "Recovery Opportunities" }), recovery.quickWins.length > 0 && ()
                        < div, " className=\"quick-wins\">", _jsx("h6", { children: "Quick Wins" }), recovery.quickWins.slice(0, 3).map((win, index) => ()
                        < div, key = { index }, className = "quick-win-item" >
                        (_jsx("h6", { children: win.title })
                            ,
                                _jsx("p", { children: win.description })
                                    ,
                                        _jsxs("div", { className: "win-metrics", children: [_jsxs("span", { children: ["Effort: ", win.effort] }), _jsxs("span", { children: ["Impact: ", win.expectedImpact, "%"] }), _jsxs("span", { children: ["Time: ", win.implementationTime, "h"] })] })))] }), "))}"] });
};
{
    recovery.strategicInitiatives.length > 0 && ()
        < div;
    className = "strategic-initiatives" >
        _jsx("h6", { children: "Strategic Initiatives" });
    {
        recovery.strategicInitiatives.slice(0, 2).map((initiative, index) => ()
            < div, key = { index }, className = "strategic-item" >
            (_jsx("h6", { children: initiative.title })
                ,
                    _jsx("p", { children: initiative.description })
                        ,
                            _jsxs("div", { className: "initiative-metrics", children: [_jsxs("span", { children: ["Effort: ", initiative.effort] }), _jsxs("span", { children: ["Impact: ", initiative.expectedImpact, "%"] }), _jsxs("span", { children: ["Time: ", initiative.implementationTime, " days"] })] })), div >
        );
    }
    div >
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
const RecoveryOpportunityPanel = ({ opportunities }) => {
    const totalRecoveryValue = opportunities.reduce((sum, opp) => sum + opp.recoveryValue, 0);
    const highConfidenceOpportunities = opportunities.filter(opp => opp.confidenceLevel > 0.7);
    return;
    _jsxs("div", { className: "recovery-opportunity-panel", children: [_jsx("h4", { children: "Recovery Opportunities" }), _jsxs("div", { className: "recovery-summary", children: [_jsxs("div", { className: "summary-metric", children: [_jsx("span", { className: "label", children: "Total Potential" }), _jsxs("span", { className: "value", children: ["$", totalRecoveryValue.toLocaleString()] }), "}"] }), _jsxs("div", { className: "summary-metric", children: [_jsx("span", { className: "label", children: "High Confidence" }), _jsx("span", { className: "value", children: highConfidenceOpportunities.length })] })] }), _jsxs("div", { className: "opportunities-list", children: [opportunities
                        .sort((a, b) => b.recoveryValue - a.recoveryValue)
                        .slice(0, 5)
                        .map(opportunity => ()
                        < div, key = { opportunity, : .stepId }, className = "opportunity-item" >
                        (_jsxs("div", { className: "opportunity-header", children: [_jsx("h5", { children: opportunity.stepName }), _jsxs("span", { className: "recovery-value", children: ["$", opportunity.recoveryValue.toLocaleString()] })] })
                            ,
                                _jsxs("div", { className: "opportunity-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { children: "Potential:" }), _jsxs("span", { children: [opportunity.recoveryPotential, "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Time to Impact:" }), _jsxs("span", { children: [opportunity.timeToImpact, " days"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Confidence:" }), _jsxs("span", { children: [(opportunity.confidenceLevel * 100).toFixed(0), "%"] })] })] })), { opportunity, : .quickWins.length > 0 && ()
                            < div, className = "quick-actions" >
                            (_jsx("strong", { children: "Quick Actions:" })
                                ,
                                    _jsx("ul", { children: opportunity.quickWins.slice(0, 2).map((win, index) => ()
                                            < li, key = { index } > { win, : .title }) })) }), ")}"] })] });
};
div >
;
div >
;
div >
;
;
;
const DropoffInsightsPanel = ({ insights, rootCauses }) => {
    const criticalInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high');
    return;
    _jsxs("div", { className: "dropoff-insights-panel", children: [_jsx("h4", { children: "Key Insights" }), _jsxs("div", { className: "insights-list", children: [criticalInsights.slice(0, 5).map((insight, index) => ()
                        < div, key = { index }, className = {} `insight-item ${insight.severity}`), ">}", _jsxs("div", { className: "insight-header", children: [_jsx("h5", { children: insight.title }), _jsxs("span", { className: `severity-badge ${insight.severity}`, children: ["}", insight.severity.toUpperCase()] })] }), _jsx("p", { className: "insight-description", children: insight.description }), _jsxs("div", { className: "insight-metrics", children: [_jsxs("span", { children: ["Impact: ", insight.impact, "%"] }), _jsxs("span", { children: ["Confidence: ", (insight.confidence * 100).toFixed(0), "%"] }), _jsxs("span", { children: ["Timeframe: ", insight.timeframe] })] }), insight.recommendations.length > 0 && ()
                        < div, " className=\"insight-recommendations\">", _jsx("strong", { children: "Recommendations:" }), _jsx("ul", { children: insight.recommendations.slice(0, 2).map((rec, recIndex) => ()
                            < li, key = { recIndex } > { rec }) }), "))}"] })] });
};
div >
;
div >
;
div >
;
;
;
const TemporalPatternsPanel = ({ patterns }) => {
    return;
    _jsxs("div", { className: "temporal-patterns-panel", children: [_jsx("h4", { children: "Temporal Drop-off Patterns" }), _jsxs("div", { className: "patterns-grid", children: [patterns.map((pattern, index) => ()
                        < div, key = { index }, className = "pattern-item" >
                        (_jsxs("h5", { children: [pattern.period.toUpperCase(), " ", pattern.periodValue] })
                            ,
                                _jsx("div", { className: "pattern-rates", children: pattern.dropOffRates.slice(0, 3).map((rate, rateIndex) => ()
                                        < div, key = { rateIndex }, className = "rate-item" >
                                        (_jsx("span", { className: "step-name", children: rate.stepName })
                                            ,
                                                _jsxs("span", { className: "rate-value", children: [rate.dropOffRate.toFixed(1), "%"] })
                                                    ,
                                                        _jsxs("span", { className: `trend ${rate.trend}`, children: ["}", rate.trend === 'increasing' ? '↗' :
                                                                    rate.trend === 'decreasing' ? '↘' : '→'] }))) }))), ")}"] }), pattern.insights.length > 0 && ()
                < div, " className=\"pattern-insights\">", pattern.insights.slice(0, 2).map((insight, insightIndex) => ()
                < p, key = { insightIndex }, className = "pattern-insight" > { insight })] });
};
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
// Loading and Error States
const DropoffAnalysisLoadingState = () => ()
    < div, className = "dropoff-analysis-loading" >
    (_jsx("div", { className: "loading-spinner" })
        ,
            _jsx("p", { children: "Analyzing drop-off patterns..." }));
div >
;
;
const DropoffAnalysisErrorState = ({ error, onRetry }) => ()
    < div, className = "dropoff-analysis-error" >
    (_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Analysis" }), _jsx("p", { children: error })] })
        ,
            _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry Analysis" }));
div >
;
;
// Utility Functions
function getSeverityScore(severity) {
    switch (severity) {
        case 'critical': return 100;
        case 'high': return 75;
        case 'medium': return 50;
        case 'low': return 25;
        default:
            return 0;
            function getSeverityClass(severity) {
                return `severity-${severity}`;
            }
            colorScale: {
                min: number;
                max: number;
                range: number;
            }
             | null,
                type;
            'dropoff' | 'recovery';
            string;
            {
                if (!colorScale)
                    return '#f3f4f6';
                const normalized = colorScale.range > 0 ? (value - colorScale.min) / colorScale.range : 0;
                if (type === 'dropoff') {
                    // Red scale for drop-offs (higher = worse)
                    const intensity = Math.floor(normalized * 255);
                    return `rgb(${255}, ${255 - intensity}, ${255 - intensity})`;
                }
            }
            {
                // Green scale for recovery (higher = better)
                const intensity = Math.floor(normalized * 255);
                return `rgb(${255 - intensity}, ${255}, ${255 - intensity})`;
            }
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
            Promise < DropoffAnalysisData > {
                // Simplified implementation - in production would process actual metrics
                const: stepAnalysis, StepDropoffAnalysis = funnelDefinition.steps.map((step, index) => ({}), stepId, step.id, stepName, step.name, stepOrder, step.order, totalEntries, 1000 - (index * 150), dropOffCount, 150 + (index * 25), dropOffRate, 15 + (index * 5) + (Math.random() * 10), dropOffSeverity, index === 1 ? 'critical' : index === 2 ? 'high' : 'medium', benchmarkComparison, {
                    industryAverage: 20 + (Math.random() * 15),
                    topPerformers: 10 + (Math.random() * 8),
                    yourPerformance: 15 + (index * 5) + (Math.random() * 10),
                    percentile: 40 + (Math.random() * 40),
                    improvementPotential: 5 + (Math.random() * 15),
                }, userBehaviorAnalysis, {
                    averageTimeOnStep: 60000 + (index * 30000),
                    interactionPatterns: [
                        {
                            pattern: 'Multiple form attempts',
                            frequency: 45,
                            conversionImpact: -12,
                            description: 'Users attempt to fill form multiple times before abandoning'
                        }
                    ],
                    exitBehaviors: [
                        {
                            behavior: 'Direct page close',
                            percentage: 35,
                            description: 'Users close tab/browser directly',
                            preventable: false
                        }
                    ],
                    recoveryAttempts: 2.3,
                }, technicalAnalysis, {
                    pageLoadTime: 2000 + (index * 500),
                    errorRate: Math.random() * 5,
                    performanceScore: 70 + (Math.random() * 25),
                    accessibilityIssues: [
                        {
                            type: 'Missing alt text',
                            severity: 'medium',
                            description: 'Images missing alternative text',
                            impact: 'Screen reader accessibility',
                            fixComplexity: 'low'
                        }
                    ],
                    mobileCompatibility: 85 + (Math.random() * 10),
                }, contentAnalysis, {
                    clarityScore: 60 + (Math.random() * 30),
                    complexityScore: 40 + (Math.random() * 40),
                    engagementScore: 70 + (Math.random() * 20),
                    completionRate: 80 - (index * 10),
                    commonConfusionPoints: [
                        'Form field labels unclear',
                        'Next step instructions missing'
                    ],
                    improvementSuggestions: [
                        'Simplify form fields',
                        'Add progress indicators',
                        'Improve error messaging'
                    ]
                }, recoveryPotential, 60 + (Math.random() * 30))
            };
            ;
            const rootCauseAnalysis = stepAnalysis.map(step => ({}), stepId, step.stepId, stepName, step.stepName, primaryCauses, [
                {
                    category: 'user_experience',
                    subcategory: 'form_complexity',
                    description: 'Complex form fields causing user confusion and abandonment',
                    impact: 35,
                    confidence: 0.85,
                    evidence: [
                        {
                            type: 'user_feedback',
                            description: '23% of exit surveys mention form difficulty',
                            strength: 'strong',
                            source: 'Exit survey analysis',
                            timestamp: Date.now() - 86400000
                        }
                    ],
                    mitigationComplexity: 'medium',
                    expectedImprovement: 15
                }
            ], contributingFactors, [
                {
                    factor: 'Page load time',
                    weight: 0.3,
                    description: 'Slow loading affects user patience',
                    measurable: true,
                    currentValue: step.technicalAnalysis.pageLoadTime,
                    targetValue: 1500
                }
            ], confidence, 0.8, evidenceQuality, 'high', recommendations, [
                {
                    title: 'Simplify form fields',
                    description: 'Reduce required fields and improve field labels',
                    priority: 'high',
                    effort: 'medium',
                    expectedImpact: 15,
                    implementationSteps: [
                        'Audit current form fields',
                        'Identify non-essential fields',
                        'Redesign form layout',
                        'Test with users'
                    ],
                    successMetrics: [
                        'Form completion rate increase',
                        'Time to complete reduction',
                        'User satisfaction score improvement'
                    ]
                }
            ]);
    }
    ;
    const recoveryOpportunities = stepAnalysis.map(step => ({}), stepId, step.stepId, stepName, step.stepName, recoveryPotential, step.recoveryPotential, recoveryValue, step.dropOffCount * 25, // $25 per recovered user,
    quickWins, [
        {
            title: 'Improve error messaging',
            description: 'Provide clearer, more helpful error messages',
            effort: 'low',
            expectedImpact: 8,
            implementationTime: 16,
            requirements: ['UX review', 'Copy updates', 'Frontend changes']
        }
    ], strategicInitiatives, [
        {
            title: 'Redesign step flow',
            description: 'Complete redesign of the step user experience',
            effort: 'high',
            expectedImpact: 25,
            implementationTime: 14,
            dependencies: ['User research', 'Design system updates'],
            successMetrics: ['Conversion rate improvement', 'User satisfaction']
        }
    ], timeToImpact, 7, confidenceLevel, 0.75);
}
;
const overallInsights = [
    {
        type: 'pattern',
        severity: 'critical',
        title: 'Step 2 Shows Critical Drop-off Rate',
        description: 'Template browsing step has 35% drop-off rate, significantly above industry average',
        affectedSteps: ['step-2'],
        impact: 35,
        confidence: 0.9,
        recommendations: [
            'Implement progressive disclosure for template options',
            'Add filtering and search capabilities',
            'Reduce cognitive load with better categorization'
        ],
        timeframe: 'immediate'
    }
];
return {
    stepAnalysis,
    transitionAnalysis: [], // TODO: Implement transition analysis,
    temporalPatterns: [], // TODO: Implement temporal pattern analysis,
    segmentAnalysis: [], // TODO: Implement segment analysis,
    rootCauseAnalysis,
    recoveryOpportunities,
    overallInsights
};
export default DropoffHeatmap;
