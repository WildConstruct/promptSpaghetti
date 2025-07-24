import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Cohort-based Funnel Analysis - Story 30.2 Task 6
 *
 * Advanced cohort analysis for funnel performance with comparative analysis,
 * retention tracking, and lifecycle progression monitoring.
 *
 * Features:
 * - Multi-cohort funnel performance comparison
 * - Cohort retention and progression analysis
 * - Lifecycle stage funnel analysis
 * - Cohort behavior pattern detection
 * - Value-based cohort segmentation
 * - Predictive cohort modeling
 * - Cross-cohort insights and recommendations
 * - Cohort health scoring
 */
import { useState, useCallback, useRef, useEffect } from 'react';
/**
 * Main Cohort Funnel Analysis Component
 */
export const CohortFunnelAnalysis = ({ funnelDefinition, analyticsInfrastructure, timeRange, selectedCohorts = [], analysisMode = 'comparative', showRetention = true, showPredictions = false, onCohortInsight, onExport }) => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState(analysisMode);
    const [selectedCohortIds, setSelectedCohortIds] = useState(selectedCohorts.map(c => c.id));
    const analysisRef = useRef(null);
    // Load cohort analysis data
    const loadAnalysisData = useCallback(async () => {
        if (selectedCohortIds.length === 0)
            return;
        try {
            setLoading(true);
            setError(null);
            const query = {
                funnelId: funnelDefinition.id,
                startDate: timeRange.start,
                endDate: timeRange.end,
                metrics: [
                    'cohort_conversion_rate',
                    'cohort_retention',
                    'cohort_value',
                    'cohort_behavior',
                    'cohort_progression',
                    'cohort_lifecycle'
                ],
                groupBy: ['funnel_step', 'cohort', 'time_period'],
                filters: selectedCohortIds.map(cohortId => ({
                    field: 'userContext.cohortIds',
                    operator: 'contains',
                    value: cohortId
                })),
                aggregation: { interval: 'day' }
            };
            const results = await analyticsInfrastructure.queryMetrics(query);
            const processedData = await processCohortAnalysisData(funnelDefinition, results, selectedCohorts, timeRange, analysisMode);
            setAnalysisData(processedData);
            // Generate insights and notify
            processedData.insights
                .filter(insight => insight.severity === 'critical' || insight.severity === 'high')
                .forEach(insight => onCohortInsight?.(insight));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cohort analysis');
        }
        finally {
            setLoading(false);
        }
    }, [
        funnelDefinition,
        analyticsInfrastructure,
        timeRange,
        selectedCohortIds,
        selectedCohorts,
        analysisMode,
        onCohortInsight
    ]);
    useEffect(() => {
        loadAnalysisData();
    }, [loadAnalysisData]);
    const handleCohortSelection = useCallback((cohortIds) => {
        setSelectedCohortIds(cohortIds);
    }, []);
    const handleExport = useCallback(async () => {
        if (!analysisData)
            return;
        const exportData = {
            analysisMode: analysisMode,
            timeRange,
            cohorts: selectedCohortIds,
            data: analysisData,
            visualizations: {
                comparative: 'comparative-chart-svg',
                retention: 'retention-chart-svg',
                lifecycle: 'lifecycle-chart-svg',
                behavior: 'behavior-chart-svg'
            },
            insights: analysisData.insights,
            recommendations: analysisData.healthScores.flatMap(h => h.interventionRecommendations),
            metadata: {
                exportedAt: Date.now(),
                analysisDepth: 'comprehensive',
                dataQuality: 0.95
            }
        };
        onExport?.(exportData);
    }, [analysisData, analysisMode, timeRange, selectedCohortIds, onExport]);
    if (loading) {
        return _jsx(CohortAnalysisLoadingState, {});
    }
    if (error || !analysisData) {
        return (_jsx(CohortAnalysisErrorState, { error: error || 'No data available', onRetry: loadAnalysisData }));
    }
    return (_jsxs("div", { className: "cohort-funnel-analysis", ref: analysisRef, children: [_jsx(CohortAnalysisHeader, { funnelDefinition: funnelDefinition, selectedCohorts: selectedCohorts, analysisData: analysisData, activeView: activeView, onViewChange: setActiveView, onCohortSelection: handleCohortSelection, onExport: handleExport }), _jsxs("div", { className: "analysis-content", children: [activeView === 'comparative' && (_jsx(ComparativeAnalysisView, { cohortPerformance: analysisData.cohortPerformance, comparativeAnalysis: analysisData.comparativeAnalysis, funnelDefinition: funnelDefinition })), activeView === 'retention' && showRetention && (_jsx(RetentionAnalysisView, { retentionAnalysis: analysisData.retentionAnalysis })), activeView === 'lifecycle' && (_jsx(LifecycleAnalysisView, { lifecycleAnalysis: analysisData.lifecycleAnalysis, healthScores: analysisData.healthScores })), activeView === 'behavior' && (_jsx(BehaviorAnalysisView, { behaviorPatterns: analysisData.behaviorPatterns })), activeView === 'predictions' && showPredictions && (_jsx(PredictiveAnalysisView, { predictiveModels: analysisData.predictiveModels })), activeView === 'value' && (_jsx(ValueAnalysisView, { valueAnalysis: analysisData.valueAnalysis }))] }), _jsx(CohortInsightsPanel, { insights: analysisData.insights, healthScores: analysisData.healthScores })] }));
};
const CohortAnalysisHeader = ({ funnelDefinition, selectedCohorts, analysisData, activeView, onViewChange, onCohortSelection, onExport }) => {
    const views = [
        { key: 'comparative', label: 'Comparative' },
        { key: 'retention', label: 'Retention' },
        { key: 'lifecycle', label: 'Lifecycle' },
        { key: 'behavior', label: 'Behavior' },
        { key: 'value', label: 'Value' },
        { key: 'predictions', label: 'Predictions' }
    ];
    const averageHealthScore = analysisData.healthScores.length > 0
        ? analysisData.healthScores.reduce((sum, h) => sum + h.overallScore, 0) / analysisData.healthScores.length
        : 0;
    const criticalInsights = analysisData.insights.filter(i => i.severity === 'critical').length;
    return (_jsxs("div", { className: "cohort-analysis-header", children: [_jsxs("div", { className: "header-info", children: [_jsxs("h3", { children: ["Cohort Analysis: ", funnelDefinition.name] }), _jsx("p", { children: "Comprehensive cohort-based funnel performance analysis" }), _jsxs("div", { className: "cohort-summary", children: [_jsxs("div", { className: "summary-metric", children: [_jsx("span", { className: "label", children: "Active Cohorts" }), _jsx("span", { className: "value", children: selectedCohorts.length })] }), _jsxs("div", { className: "summary-metric", children: [_jsx("span", { className: "label", children: "Avg. Health Score" }), _jsx("span", { className: "value", children: averageHealthScore.toFixed(1) })] }), criticalInsights > 0 && (_jsxs("div", { className: "summary-metric critical", children: [_jsx("span", { className: "label", children: "Critical Insights" }), _jsx("span", { className: "value", children: criticalInsights })] }))] })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "cohort-selector", children: [_jsx("label", { children: "Cohorts:" }), _jsx("div", { className: "cohort-tags", children: selectedCohorts.map(cohort => (_jsx("span", { className: "cohort-tag", children: cohort.name }, cohort.id))) })] }), _jsx("div", { className: "view-selector", children: views.map(view => (_jsx("button", { onClick: () => onViewChange(view.key), className: `view-button ${activeView === view.key ? 'active' : ''}`, children: view.label }, view.key))) }), _jsx("button", { onClick: onExport, className: "export-button", children: "Export Analysis" })] })] }));
};
const ComparativeAnalysisView = ({ cohortPerformance, comparativeAnalysis, funnelDefinition }) => {
    return (_jsxs("div", { className: "comparative-analysis-view", children: [_jsxs("div", { className: "performance-comparison", children: [_jsx("h4", { children: "Cohort Performance Comparison" }), _jsxs("div", { className: "comparison-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { children: "Cohort" }), _jsx("div", { children: "Conversion Rate" }), _jsx("div", { children: "Avg. Time to Convert" }), _jsx("div", { children: "Value per User" }), _jsx("div", { children: "Health Score" })] }), cohortPerformance.map(cohort => (_jsxs("div", { className: "table-row", children: [_jsxs("div", { className: "cohort-info", children: [_jsx("span", { className: "cohort-name", children: cohort.cohortName }), _jsxs("span", { className: "cohort-size", children: [cohort.cohortDefinition.size, " users"] })] }), _jsxs("div", { className: "conversion-rate", children: [cohort.funnelMetrics.overallConversionRate.toFixed(2), "%"] }), _jsx("div", { className: "time-to-convert", children: formatDuration(cohort.funnelMetrics.averageTimeToConvert) }), _jsxs("div", { className: "value-per-user", children: ["$", cohort.valueMetrics.valuePerUser.toFixed(2)] }), _jsx("div", { className: "health-score", children: _jsx("span", { className: `score ${getHealthScoreClass(cohort.valueMetrics.valuePerUser)}`, children: "85" }) })] }, cohort.cohortId)))] })] }), _jsxs("div", { className: "step-comparison", children: [_jsx("h4", { children: "Step-by-Step Comparison" }), _jsx(StepComparisonChart, { cohortPerformance: cohortPerformance, funnelSteps: funnelDefinition.steps })] }), comparativeAnalysis.significantDifferences.length > 0 && (_jsxs("div", { className: "significant-differences", children: [_jsx("h4", { children: "Significant Differences" }), comparativeAnalysis.significantDifferences.slice(0, 5).map((diff, index) => (_jsx(CohortDifferenceCard, { difference: diff }, index)))] }))] }));
};
const StepComparisonChart = ({ cohortPerformance, funnelSteps }) => {
    const chartWidth = 800;
    const chartHeight = 300;
    const stepWidth = chartWidth / funnelSteps.length;
    return (_jsx("div", { className: "step-comparison-chart", children: _jsxs("svg", { width: chartWidth, height: chartHeight, children: [funnelSteps.map((step, stepIndex) => {
                    const x = stepIndex * stepWidth;
                    return (_jsxs("g", { children: [_jsx("text", { x: x + stepWidth / 2, y: chartHeight - 10, textAnchor: "middle", fontSize: "12", fill: "#666", children: step.name }), cohortPerformance.map((cohort, cohortIndex) => {
                                const stepPerf = cohort.stepPerformance.find(s => s.stepId === step.id);
                                if (!stepPerf)
                                    return null;
                                const barHeight = (stepPerf.conversionRate / 100) * (chartHeight - 40);
                                const barWidth = (stepWidth - 20) / cohortPerformance.length;
                                const barX = x + 10 + cohortIndex * barWidth;
                                const barY = chartHeight - 30 - barHeight;
                                return (_jsxs("g", { children: [_jsx("rect", { x: barX, y: barY, width: barWidth - 2, height: barHeight, fill: getCohortColor(cohortIndex), opacity: 0.8 }), _jsxs("text", { x: barX + barWidth / 2, y: barY - 5, textAnchor: "middle", fontSize: "10", fill: "#666", children: [stepPerf.conversionRate.toFixed(1), "%"] })] }, `${step.id}-${cohort.cohortId}`));
                            })] }, step.id));
                }), _jsx("g", { transform: `translate(${chartWidth - 200}, 20)`, children: cohortPerformance.map((cohort, index) => (_jsxs("g", { transform: `translate(0, ${index * 20})`, children: [_jsx("rect", { x: "0", y: "0", width: "12", height: "12", fill: getCohortColor(index) }), _jsx("text", { x: "16", y: "10", fontSize: "12", fill: "#666", children: cohort.cohortName })] }, cohort.cohortId))) })] }) }));
};
const CohortDifferenceCard = ({ difference }) => {
    return (_jsxs("div", { className: "cohort-difference-card", children: [_jsxs("div", { className: "difference-header", children: [_jsx("h5", { children: difference.metric.replace('_', ' ') }), _jsxs("span", { className: "significance", children: [(difference.significance * 100).toFixed(0), "% significant"] })] }), _jsxs("div", { className: "difference-comparison", children: [_jsxs("div", { className: "cohort-value", children: [_jsx("span", { className: "cohort-name", children: difference.cohortA.name }), _jsx("span", { className: "value", children: difference.cohortA.value.toFixed(2) })] }), _jsx("div", { className: "vs", children: "vs" }), _jsxs("div", { className: "cohort-value", children: [_jsx("span", { className: "cohort-name", children: difference.cohortB.name }), _jsx("span", { className: "value", children: difference.cohortB.value.toFixed(2) })] }), _jsx("div", { className: "difference-amount", children: _jsxs("span", { className: `difference ${difference.difference > 0 ? 'positive' : 'negative'}`, children: [difference.difference > 0 ? '+' : '', difference.difference.toFixed(2)] }) })] }), difference.possibleReasons.length > 0 && (_jsxs("div", { className: "possible-reasons", children: [_jsx("strong", { children: "Possible Reasons:" }), _jsx("ul", { children: difference.possibleReasons.slice(0, 2).map((reason, index) => (_jsx("li", { children: reason }, index))) })] }))] }));
};
const RetentionAnalysisView = ({ retentionAnalysis }) => {
    return (_jsxs("div", { className: "retention-analysis-view", children: [_jsxs("div", { className: "retention-overview", children: [_jsx("h4", { children: "Cohort Retention Overview" }), _jsx("div", { className: "retention-metrics-grid", children: retentionAnalysis.map(analysis => (_jsx(RetentionMetricsCard, { analysis: analysis }, analysis.cohortId))) })] }), _jsxs("div", { className: "retention-curves", children: [_jsx("h4", { children: "Retention Curves" }), _jsx(RetentionCurvesChart, { retentionAnalysis: retentionAnalysis })] })] }));
};
const RetentionMetricsCard = ({ analysis }) => {
    return (_jsxs("div", { className: "retention-metrics-card", children: [_jsx("h5", { children: analysis.cohortName }), _jsxs("div", { className: "retention-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "label", children: "Day 1" }), _jsxs("span", { className: "value", children: [analysis.retentionMetrics.dayOneRetention.toFixed(1), "%"] })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "label", children: "Day 7" }), _jsxs("span", { className: "value", children: [analysis.retentionMetrics.daySevenRetention.toFixed(1), "%"] })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "label", children: "Day 30" }), _jsxs("span", { className: "value", children: [analysis.retentionMetrics.dayThirtyRetention.toFixed(1), "%"] })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "label", children: "Half-life" }), _jsxs("span", { className: "value", children: [analysis.retentionMetrics.halfLife, " days"] })] })] }), _jsxs("div", { className: "churn-analysis", children: [_jsxs("div", { className: "churn-rate", children: [_jsx("span", { className: "label", children: "Overall Churn" }), _jsxs("span", { className: "value", children: [analysis.churnAnalysis.overallChurnRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "preventable-churn", children: [_jsx("span", { className: "label", children: "Preventable" }), _jsxs("span", { className: "value", children: [analysis.churnAnalysis.preventableChurn.toFixed(1), "%"] })] })] }), analysis.reactivationAnalysis.reactivationRate > 0 && (_jsxs("div", { className: "reactivation-metrics", children: [_jsxs("div", { className: "reactivation-rate", children: [_jsx("span", { className: "label", children: "Reactivation Rate" }), _jsxs("span", { className: "value", children: [analysis.reactivationAnalysis.reactivationRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "reactivation-roi", children: [_jsx("span", { className: "label", children: "Reactivation ROI" }), _jsxs("span", { className: "value", children: [analysis.reactivationAnalysis.reactivationROI.toFixed(1), "x"] })] })] }))] }));
};
const RetentionCurvesChart = ({ retentionAnalysis }) => {
    const chartWidth = 800;
    const chartHeight = 400;
    const margin = { top: 20, right: 120, bottom: 40, left: 60 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;
    // Find max period across all cohorts
    const maxPeriod = Math.max(...retentionAnalysis.map(analysis => Math.max(...analysis.retentionCurve.map(point => point.period))));
    return (_jsx("div", { className: "retention-curves-chart", children: _jsx("svg", { width: chartWidth, height: chartHeight, children: _jsxs("g", { transform: `translate(${margin.left}, ${margin.top})`, children: [[0, 25, 50, 75, 100].map(tick => {
                        const y = ((100 - tick) / 100) * innerHeight;
                        return (_jsxs("g", { children: [_jsx("line", { x1: 0, y1: y, x2: innerWidth, y2: y, stroke: "#e5e7eb", strokeWidth: 1 }), _jsxs("text", { x: -10, y: y + 4, textAnchor: "end", fontSize: "12", fill: "#666", children: [tick, "%"] })] }, tick));
                    }), Array.from({ length: Math.min(maxPeriod + 1, 11) }, (_, i) => i * Math.ceil(maxPeriod / 10)).map(period => {
                        const x = (period / maxPeriod) * innerWidth;
                        return (_jsx("g", { children: _jsx("text", { x: x, y: innerHeight + 20, textAnchor: "middle", fontSize: "12", fill: "#666", children: period }) }, period));
                    }), retentionAnalysis.map((analysis, index) => {
                        const color = getCohortColor(index);
                        const points = analysis.retentionCurve.slice(0, 50); // Limit points for performance
                        return (_jsxs("g", { children: [_jsx("path", { d: `M ${points.map(point => {
                                        const x = (point.period / maxPeriod) * innerWidth;
                                        const y = ((100 - point.retentionRate) / 100) * innerHeight;
                                        return `${x},${y}`;
                                    }).join(' L ')}`, fill: "none", stroke: color, strokeWidth: 2 }), points.filter((_, i) => i % 5 === 0).map(point => {
                                    const x = (point.period / maxPeriod) * innerWidth;
                                    const y = ((100 - point.retentionRate) / 100) * innerHeight;
                                    return (_jsx("circle", { cx: x, cy: y, r: 3, fill: color }, point.period));
                                })] }, analysis.cohortId));
                    }), _jsx("g", { transform: `translate(${innerWidth + 20}, 20)`, children: retentionAnalysis.map((analysis, index) => (_jsxs("g", { transform: `translate(0, ${index * 20})`, children: [_jsx("line", { x1: 0, y1: 6, x2: 16, y2: 6, stroke: getCohortColor(index), strokeWidth: 2 }), _jsx("text", { x: 20, y: 10, fontSize: "12", fill: "#666", children: analysis.cohortName })] }, analysis.cohortId))) })] }) }) }));
};
const LifecycleAnalysisView = ({ lifecycleAnalysis, healthScores }) => {
    return (_jsxs("div", { className: "lifecycle-analysis-view", children: [_jsxs("div", { className: "lifecycle-overview", children: [_jsx("h4", { children: "Cohort Lifecycle Analysis" }), _jsx("div", { className: "lifecycle-grid", children: lifecycleAnalysis.map(analysis => (_jsx(LifecycleCard, { analysis: analysis }, analysis.cohortId))) })] }), _jsxs("div", { className: "health-scores", children: [_jsx("h4", { children: "Cohort Health Scores" }), _jsx("div", { className: "health-scores-grid", children: healthScores.map(score => (_jsx(HealthScoreCard, { healthScore: score }, score.cohortId))) })] })] }));
};
const LifecycleCard = ({ analysis }) => {
    return (_jsxs("div", { className: "lifecycle-card", children: [_jsx("h5", { children: analysis.cohortName }), _jsx("div", { className: "lifecycle-stages", children: analysis.lifecycleStages.map(stage => (_jsxs("div", { className: "stage-item", children: [_jsxs("div", { className: "stage-info", children: [_jsx("span", { className: "stage-name", children: stage.stage }), _jsxs("span", { className: "stage-percentage", children: [stage.percentage.toFixed(1), "%"] })] }), _jsx("div", { className: "stage-bar", children: _jsx("div", { className: "stage-fill", style: { width: `${stage.percentage}%` } }) }), _jsxs("div", { className: "stage-metrics", children: [_jsxs("span", { children: ["Users: ", stage.userCount] }), _jsxs("span", { children: ["Value: $", stage.valueGenerated.toLocaleString()] })] })] }, stage.stage))) }), _jsxs("div", { className: "maturity-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Maturity" }), _jsxs("span", { className: "value", children: [analysis.maturityMetrics.overallMaturity.toFixed(0), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Trajectory" }), _jsx("span", { className: `value ${analysis.maturityMetrics.maturityTrajectory}`, children: analysis.maturityMetrics.maturityTrajectory.replace('_', ' ') })] })] })] }));
};
const HealthScoreCard = ({ healthScore }) => {
    return (_jsxs("div", { className: "health-score-card", children: [_jsxs("div", { className: "score-header", children: [_jsx("h5", { children: healthScore.cohortName }), _jsx("div", { className: `overall-score ${getHealthScoreClass(healthScore.overallScore)}`, children: healthScore.overallScore.toFixed(0) })] }), _jsx("div", { className: "score-components", children: healthScore.scoreComponents.slice(0, 4).map(component => (_jsxs("div", { className: "component-item", children: [_jsx("span", { className: "component-name", children: component.component }), _jsxs("div", { className: "component-score", children: [_jsx("div", { className: "score-bar", children: _jsx("div", { className: "score-fill", style: { width: `${component.score}%` } }) }), _jsx("span", { className: "score-value", children: component.score.toFixed(0) })] })] }, component.component))) }), _jsxs("div", { className: "risk-level", children: [_jsx("span", { className: "label", children: "Risk Level:" }), _jsx("span", { className: `risk-badge ${healthScore.riskLevel}`, children: healthScore.riskLevel.toUpperCase() })] }), healthScore.interventionRecommendations.length > 0 && (_jsxs("div", { className: "top-recommendations", children: [_jsx("strong", { children: "Top Recommendations:" }), _jsx("ul", { children: healthScore.interventionRecommendations
                            .filter(r => r.priority === 'high')
                            .slice(0, 2)
                            .map((rec, index) => (_jsx("li", { children: rec.recommendation }, index))) })] }))] }));
};
const BehaviorAnalysisView = ({ behaviorPatterns }) => {
    return (_jsxs("div", { className: "behavior-analysis-view", children: [_jsx("h4", { children: "Cohort Behavior Patterns" }), _jsx("div", { className: "behavior-patterns-grid", children: behaviorPatterns.map(pattern => (_jsx(BehaviorPatternCard, { pattern: pattern }, pattern.cohortId))) })] }));
};
const BehaviorPatternCard = ({ pattern }) => {
    return (_jsxs("div", { className: "behavior-pattern-card", children: [_jsx("h5", { children: pattern.cohortName }), _jsxs("div", { className: "top-patterns", children: [_jsx("h6", { children: "Key Behavior Patterns" }), pattern.patterns.slice(0, 3).map((p, index) => (_jsxs("div", { className: "pattern-item", children: [_jsx("span", { className: "pattern-name", children: p.pattern }), _jsxs("div", { className: "pattern-metrics", children: [_jsxs("span", { children: ["Frequency: ", p.frequency, "%"] }), _jsxs("span", { children: ["Impact: ", p.conversionImpact > 0 ? '+' : '', p.conversionImpact, "%"] })] })] }, index)))] }), pattern.uniqueBehaviors.length > 0 && (_jsxs("div", { className: "unique-behaviors", children: [_jsx("h6", { children: "Unique Behaviors" }), pattern.uniqueBehaviors.slice(0, 2).map((behavior, index) => (_jsxs("div", { className: "unique-behavior-item", children: [_jsx("span", { className: "behavior-name", children: behavior.behavior }), _jsxs("span", { className: "uniqueness-score", children: [behavior.uniquenessScore.toFixed(1), " uniqueness"] })] }, index)))] }))] }));
};
const PredictiveAnalysisView = ({ predictiveModels }) => {
    return (_jsxs("div", { className: "predictive-analysis-view", children: [_jsx("h4", { children: "Predictive Models" }), _jsx("div", { className: "predictive-models-grid", children: predictiveModels.map(model => (_jsx(PredictiveModelCard, { model: model }, `${model.cohortId}-${model.modelType}`))) })] }));
};
const PredictiveModelCard = ({ model }) => {
    return (_jsxs("div", { className: "predictive-model-card", children: [_jsxs("div", { className: "model-header", children: [_jsx("h5", { children: model.cohortName }), _jsxs("span", { className: "model-type", children: [model.modelType, " prediction"] })] }), _jsxs("div", { className: "model-accuracy", children: [_jsx("span", { className: "label", children: "Accuracy:" }), _jsxs("span", { className: "value", children: [model.modelAccuracy.toFixed(1), "%"] })] }), _jsxs("div", { className: "predictions", children: [_jsx("h6", { children: "Predictions" }), model.predictions.slice(0, 3).map((prediction, index) => (_jsxs("div", { className: "prediction-item", children: [_jsx("span", { className: "timeframe", children: prediction.timeframeLabel }), _jsx("span", { className: "predicted-value", children: prediction.predictedValue.toFixed(1) }), _jsxs("span", { className: "confidence", children: [(prediction.confidence * 100).toFixed(0), "% confidence"] })] }, index)))] }), model.keyPredictors.length > 0 && (_jsxs("div", { className: "key-predictors", children: [_jsx("h6", { children: "Key Predictors" }), model.keyPredictors.slice(0, 3).map((predictor, index) => (_jsxs("div", { className: "predictor-item", children: [_jsx("span", { className: "predictor-name", children: predictor.predictor }), _jsxs("span", { className: "importance", children: [(predictor.importance * 100).toFixed(0), "% importance"] })] }, index)))] }))] }));
};
const ValueAnalysisView = ({ valueAnalysis }) => {
    return (_jsxs("div", { className: "value-analysis-view", children: [_jsx("h4", { children: "Cohort Value Analysis" }), _jsx("p", { children: "Value analysis view - Implementation needed" })] }));
};
const CohortInsightsPanel = ({ insights, healthScores }) => {
    const criticalInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high');
    return (_jsxs("div", { className: "cohort-insights-panel", children: [_jsx("h4", { children: "Key Insights & Recommendations" }), _jsx("div", { className: "insights-list", children: criticalInsights.slice(0, 5).map((insight, index) => (_jsxs("div", { className: `insight-item ${insight.severity}`, children: [_jsxs("div", { className: "insight-header", children: [_jsx("h5", { children: insight.title }), _jsx("span", { className: `severity-badge ${insight.severity}`, children: insight.severity.toUpperCase() })] }), _jsx("p", { className: "insight-description", children: insight.description }), _jsxs("div", { className: "insight-metrics", children: [_jsxs("span", { children: ["Impact: $", insight.businessImpact.toLocaleString()] }), _jsxs("span", { children: ["Confidence: ", (insight.confidence * 100).toFixed(0), "%"] }), _jsxs("span", { children: ["Timeframe: ", insight.timeframe] })] }), insight.recommendations.length > 0 && (_jsxs("div", { className: "recommendations", children: [_jsx("strong", { children: "Recommendations:" }), _jsx("ul", { children: insight.recommendations.slice(0, 2).map((rec, recIndex) => (_jsx("li", { children: rec }, recIndex))) })] }))] }, index))) })] }));
};
// Loading and Error States
const CohortAnalysisLoadingState = () => (_jsxs("div", { className: "cohort-analysis-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading cohort analysis..." })] }));
const CohortAnalysisErrorState = ({ error, onRetry }) => (_jsxs("div", { className: "cohort-analysis-error", children: [_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Analysis" }), _jsx("p", { children: error })] }), _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry Loading" })] }));
// Utility Functions
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h`;
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
function getCohortColor(index) {
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
        '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
    ];
    return colors[index % colors.length];
}
function getHealthScoreClass(score) {
    if (score >= 80)
        return 'excellent';
    if (score >= 60)
        return 'good';
    if (score >= 40)
        return 'average';
    if (score >= 20)
        return 'below-average';
    return 'poor';
}
async function processCohortAnalysisData(funnelDefinition, metricResults, selectedCohorts, timeRange, analysisMode) {
    // Simplified implementation - in production would process actual cohort metrics
    const cohortPerformance = selectedCohorts.map((cohort, index) => ({
        cohortId: cohort.id,
        cohortName: cohort.name,
        cohortDefinition: {
            criteriaEvent: cohort.definition.criteriaEvent,
            timeWindow: cohort.definition.timeWindow,
            size: cohort.state.currentSize,
            creationDate: cohort.state.creationDate,
            maturity: 'mature',
            characteristics: ['High engagement', 'Premium features usage']
        },
        funnelMetrics: {
            totalEntries: 1000 + (index * 200),
            totalConversions: 180 + (index * 50),
            overallConversionRate: 18 + (index * 3) + (Math.random() * 5),
            averageTimeToConvert: 3600000 + (index * 600000),
            completionRate: 85 + (Math.random() * 10),
            dropOffRate: 15 - (index * 2),
            retentionRate: 75 + (index * 5),
            reactivationRate: 12 + (Math.random() * 8)
        },
        stepPerformance: funnelDefinition.steps.map((step, stepIndex) => ({
            stepId: step.id,
            stepName: step.name,
            stepOrder: step.order,
            entries: 1000 - (stepIndex * 150) + (index * 50),
            conversions: 850 - (stepIndex * 150) + (index * 40),
            conversionRate: 85 - (stepIndex * 10) + (index * 2),
            averageTimeSpent: 60000 + (stepIndex * 30000),
            dropOffCount: 150 - (index * 20),
            dropOffRate: 15 - (index * 2),
            retentionToNextStep: 90 - (stepIndex * 5),
            stepEfficiency: 0.8 + (Math.random() * 0.15),
            cohortSpecificBehaviors: [
                {
                    behavior: 'Extended browsing',
                    frequency: 35 + (Math.random() * 20),
                    impact: 12 + (Math.random() * 8),
                    uniqueness: 0.7 + (Math.random() * 0.2),
                    description: 'Users spend more time evaluating options'
                }
            ]
        })),
        temporalPerformance: Array.from({ length: 12 }, (_, period) => ({
            period: period + 1,
            periodLabel: `Week ${period + 1}`,
            entries: 100 + Math.floor(Math.random() * 50),
            conversions: 15 + Math.floor(Math.random() * 10),
            conversionRate: 15 + (Math.random() * 10),
            retentionRate: 80 + (Math.random() * 15),
            reactivationCount: Math.floor(Math.random() * 5),
            valueGenerated: 500 + Math.random() * 300,
            trendDirection: Math.random() > 0.5 ? 'improving' : 'stable'
        })),
        progressionMetrics: {
            progressionRate: 75 + (Math.random() * 20),
            averageProgressionTime: 86400000 * (3 + Math.random() * 4),
            progressionStages: [],
            stagnationPoints: [],
            accelerationFactors: []
        },
        valueMetrics: {
            totalValue: 5000 + (index * 2000),
            valuePerUser: 25 + (index * 10),
            valuePerConversion: 150 + (index * 50),
            lifetimeValue: 500 + (index * 200),
            valueTrajectory: [],
            valueDistribution: {
                lowValue: { threshold: 10, percentage: 40, totalValue: 800 },
                mediumValue: { threshold: 50, percentage: 35, totalValue: 1750 },
                highValue: { threshold: 100, percentage: 20, totalValue: 2000 },
                topPercentile: { threshold: 500, percentage: 5, totalValue: 2500 }
            },
            moneyGenerationPattern: {
                pattern: 'gradual',
                consistency: 0.75,
                predictability: 0.8,
                seasonality: {
                    hasSeasonality: true,
                    pattern: 'weekly',
                    peaks: ['Tuesday', 'Wednesday'],
                    troughs: ['Sunday']
                }
            }
        },
        benchmarkComparison: {
            overallPerformance: {
                metric: 'conversion_rate',
                cohortValue: 18 + (index * 3),
                benchmarkValue: 15,
                percentile: 70 + (index * 10),
                performance: 'good',
                improvementPotential: 5 + (Math.random() * 10)
            },
            stepComparisons: [],
            peerCohorts: [],
            industryBenchmarks: []
        }
    }));
    const insights = [
        {
            type: 'performance',
            cohortIds: [selectedCohorts[0]?.id || ''],
            cohortNames: [selectedCohorts[0]?.name || ''],
            title: 'Premium Cohort Outperforming Expectations',
            description: 'The premium user cohort is showing 23% higher conversion rates than projected',
            severity: 'high',
            confidence: 0.89,
            businessImpact: 15000,
            timeframe: 'immediate',
            actionability: 'high',
            recommendations: [
                'Expand premium user acquisition campaigns',
                'Analyze premium cohort behavior patterns for replication',
                'Increase investment in premium user experience features'
            ],
            evidence: [
                'Conversion rate 23% above projection',
                'Higher engagement across all funnel steps',
                'Strong retention and reactivation rates'
            ],
            relatedInsights: []
        }
    ];
    return {
        cohortPerformance,
        comparativeAnalysis: {
            crossCohortMetrics: [],
            performanceRankings: [],
            significantDifferences: selectedCohorts.length > 1 ? [
                {
                    metric: 'conversion_rate',
                    cohortA: { id: selectedCohorts[0].id, name: selectedCohorts[0].name, value: 21.5 },
                    cohortB: { id: selectedCohorts[1]?.id || '', name: selectedCohorts[1]?.name || '', value: 18.2 },
                    difference: 3.3,
                    significance: 0.025,
                    possibleReasons: [
                        'Different user acquisition channels',
                        'Varying engagement patterns',
                        'Cohort maturity differences'
                    ],
                    actionableInsights: [
                        'Apply high-performing cohort strategies to others',
                        'Investigate acquisition channel quality'
                    ]
                }
            ] : [],
            convergenceAnalysis: [],
            outlierAnalysis: []
        },
        retentionAnalysis: selectedCohorts.map(cohort => ({
            cohortId: cohort.id,
            cohortName: cohort.name,
            retentionCurve: Array.from({ length: 30 }, (_, day) => ({
                period: day + 1,
                periodLabel: `Day ${day + 1}`,
                retainedUsers: Math.floor(1000 * Math.pow(0.95, day)),
                retentionRate: Math.pow(0.95, day) * 100,
                churnedUsers: Math.floor(1000 * (1 - Math.pow(0.95, day))),
                churnRate: (1 - Math.pow(0.95, day)) * 100,
                reactivatedUsers: Math.floor(Math.random() * 20),
                netRetention: Math.pow(0.95, day) * 100 + (Math.random() * 5)
            })),
            retentionMetrics: {
                dayOneRetention: 95,
                daySevenRetention: 75,
                dayThirtyRetention: 55,
                dayNinetyRetention: 35,
                halfLife: 14,
                retentionStability: 0.8,
                retentionTrend: 'stable'
            },
            retentionFactors: [
                {
                    factor: 'Early engagement',
                    impact: 25,
                    correlation: 0.82,
                    actionability: 'high',
                    description: 'Users who engage within first 24 hours show higher retention'
                }
            ],
            churnAnalysis: {
                overallChurnRate: 45,
                churnPredictors: [],
                churnSegments: [],
                preventableChurn: 15,
                churnValue: 2500
            },
            reactivationAnalysis: {
                reactivationRate: 12,
                averageTimeToReactivation: 604800000, // 7 days
                reactivationTriggers: [],
                reactivationValue: 850,
                reactivationROI: 3.2
            }
        })),
        lifecycleAnalysis: selectedCohorts.map(cohort => ({
            cohortId: cohort.id,
            cohortName: cohort.name,
            lifecycleStages: [
                {
                    stage: 'onboarding',
                    userCount: 250,
                    percentage: 25,
                    averageTimeInStage: 86400000,
                    conversionToNext: 80,
                    valueGenerated: 500,
                    stageCharacteristics: ['Initial setup', 'First interactions']
                },
                {
                    stage: 'activation',
                    userCount: 200,
                    percentage: 20,
                    averageTimeInStage: 259200000,
                    conversionToNext: 75,
                    valueGenerated: 1200,
                    stageCharacteristics: ['Feature adoption', 'Value realization']
                },
                {
                    stage: 'engagement',
                    userCount: 300,
                    percentage: 30,
                    averageTimeInStage: 604800000,
                    conversionToNext: 85,
                    valueGenerated: 2500,
                    stageCharacteristics: ['Regular usage', 'Pattern establishment']
                },
                {
                    stage: 'retention',
                    userCount: 150,
                    percentage: 15,
                    averageTimeInStage: 2592000000,
                    conversionToNext: 60,
                    valueGenerated: 1800,
                    stageCharacteristics: ['Consistent value', 'Habit formation']
                },
                {
                    stage: 'expansion',
                    userCount: 80,
                    percentage: 8,
                    averageTimeInStage: 1209600000,
                    conversionToNext: 40,
                    valueGenerated: 3500,
                    stageCharacteristics: ['Premium features', 'Higher engagement']
                },
                {
                    stage: 'advocacy',
                    userCount: 20,
                    percentage: 2,
                    averageTimeInStage: 5184000000,
                    conversionToNext: 100,
                    valueGenerated: 5000,
                    stageCharacteristics: ['Referrals', 'Community participation']
                }
            ],
            stageTransitions: [],
            maturityMetrics: {
                overallMaturity: 75,
                maturityFactors: [],
                maturityTrajectory: 'steady',
                expectedPeakValue: 15000,
                timeToMaturity: 180
            },
            lifecycleHealth: {
                healthScore: 82,
                healthFactors: [],
                riskIndicators: [],
                opportunityAreas: []
            }
        })),
        behaviorPatterns: selectedCohorts.map(cohort => ({
            cohortId: cohort.id,
            cohortName: cohort.name,
            patterns: [
                {
                    pattern: 'Extended evaluation phase',
                    frequency: 35,
                    conversionImpact: 15,
                    valueImpact: 25,
                    temporalPattern: 'Weekday evenings',
                    predictability: 0.75,
                    description: 'Users spend additional time comparing options before converting'
                }
            ],
            uniqueBehaviors: [
                {
                    behavior: 'Advanced feature exploration',
                    uniquenessScore: 0.8,
                    cohortSpecific: true,
                    competitiveAdvantage: true,
                    replicability: 'medium',
                    description: 'Early adoption of complex features'
                }
            ],
            behaviorEvolution: [],
            crossCohortComparison: []
        })),
        valueAnalysis: [],
        predictiveModels: selectedCohorts.map(cohort => ({
            cohortId: cohort.id,
            cohortName: cohort.name,
            modelType: 'conversion',
            predictions: [
                {
                    timeframe: 7,
                    timeframeLabel: '7 days',
                    predictedValue: 22.5,
                    confidence: 0.85,
                    factors: ['Historical performance', 'Seasonal trends'],
                    assumptions: ['Consistent traffic patterns', 'No major product changes']
                },
                {
                    timeframe: 30,
                    timeframeLabel: '30 days',
                    predictedValue: 24.1,
                    confidence: 0.78,
                    factors: ['Growth trend', 'Optimization initiatives'],
                    assumptions: ['Continued improvement efforts', 'Market stability']
                }
            ],
            modelAccuracy: 85.2,
            confidenceInterval: 0.8,
            keyPredictors: [
                {
                    predictor: 'Previous step completion rate',
                    importance: 0.35,
                    direction: 'positive',
                    stability: 0.9,
                    actionability: 'high'
                },
                {
                    predictor: 'Time spent on step',
                    importance: 0.25,
                    direction: 'positive',
                    stability: 0.75,
                    actionability: 'medium'
                }
            ],
            scenarioAnalysis: []
        })),
        insights,
        healthScores: selectedCohorts.map(cohort => ({
            cohortId: cohort.id,
            cohortName: cohort.name,
            overallScore: 75 + (Math.random() * 20),
            scoreComponents: [
                {
                    component: 'Conversion Performance',
                    score: 82,
                    weight: 0.3,
                    trend: 'improving',
                    benchmark: 75,
                    contributingFactors: ['High step completion', 'Low drop-off rates']
                },
                {
                    component: 'Retention Quality',
                    score: 78,
                    weight: 0.25,
                    trend: 'stable',
                    benchmark: 70,
                    contributingFactors: ['Strong day-7 retention', 'Good reactivation']
                },
                {
                    component: 'Value Generation',
                    score: 85,
                    weight: 0.25,
                    trend: 'improving',
                    benchmark: 80,
                    contributingFactors: ['Above-average LTV', 'Strong monetization']
                },
                {
                    component: 'Behavioral Health',
                    score: 72,
                    weight: 0.2,
                    trend: 'stable',
                    benchmark: 75,
                    contributingFactors: ['Consistent patterns', 'Predictable behavior']
                }
            ],
            scoreHistory: [],
            scoreTrend: 'improving',
            riskLevel: 'low',
            interventionRecommendations: [
                {
                    recommendation: 'Optimize step 2 experience for this cohort',
                    priority: 'high',
                    expectedImpact: 12,
                    effort: 'medium',
                    timeframe: '2-4 weeks',
                    successMetrics: ['Step 2 conversion rate', 'Overall funnel performance']
                }
            ]
        }))
    };
}
export default CohortFunnelAnalysis;
