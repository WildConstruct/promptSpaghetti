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
 > ;
export const CohortFunnelAnalysis = ({
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    selectedCohorts = [],
    analysisMode = 'comparative',
    showRetention = true,
    showPredictions = false,
    onCohortInsight,
    onExport
});
{
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState(analysisMode);
    const [selectedCohortIds, setSelectedCohortIds] = useState();
    selectedCohorts.map(c => c.id);
    ;
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
                metrics: [,
                    'cohort_conversion_rate',
                    'cohort_retention',
                    'cohort_value',
                    'cohort_behavior',
                    'cohort_progression',
                    'cohort_lifecycle'
                ],
                groupBy: ['funnel_step', 'cohort', 'time_period'],
                filters: selectedCohortIds.map(cohortId => ({}), field, 'userContext.cohortIds', operator, 'contains', value, cohortId)
            };
        }
        finally { }
    }), aggregation;
}
;
const results = await analyticsInfrastructure.queryMetrics(query);
const processedData = await processCohortAnalysisData();
;
funnelDefinition,
    results,
    selectedCohorts,
    timeRange,
    analysisMode;
;
setAnalysisData(processedData);
// Generate insights and notify
processedData.insights
    .filter(insight => insight.severity === 'critical' || insight.severity === 'high')
    .forEach(insight => onCohortInsight?.(insight));
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load cohort analysis');
}
finally {
    setLoading(false);
}
[
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    selectedCohortIds,
    selectedCohorts,
    analysisMode,
    onCohortInsight
];
;
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
            behavior: 'behavior-chart-svg',
        },
        insights: analysisData.insights,
        recommendations: analysisData.healthScores.flatMap(h => h.interventionRecommendations),
        metadata: {
            exportedAt: Date.now(),
            analysisDepth: 'comprehensive',
            dataQuality: 0.95,
        },
        onExport }(exportData);
}, [analysisData, analysisMode, timeRange, selectedCohortIds, onExport]);
if (loading) {
    return _jsx(CohortAnalysisLoadingState, {});
    if (error || !analysisData) {
        return;
        _jsx(CohortAnalysisErrorState, { error: error || 'No data available', onRetry: loadAnalysisData });
        ;
        return;
        _jsxs("div", { className: "cohort-funnel-analysis", ref: analysisRef, children: [_jsx(CohortAnalysisHeader, { funnelDefinition: funnelDefinition, selectedCohorts: selectedCohorts, analysisData: analysisData, activeView: activeView, onViewChange: setActiveView, onCohortSelection: handleCohortSelection, onExport: handleExport }), _jsxs("div", { className: "analysis-content", children: [activeView === 'comparative' && ()
                            < ComparativeAnalysisView, "cohortPerformance=", analysisData.cohortPerformance, "comparativeAnalysis=", analysisData.comparativeAnalysis, "funnelDefinition=", funnelDefinition, "/> )}", activeView === 'retention' && showRetention && ()
                            < RetentionAnalysisView, "retentionAnalysis=", analysisData.retentionAnalysis, "/> )}", activeView === 'lifecycle' && ()
                            < LifecycleAnalysisView, "lifecycleAnalysis=", analysisData.lifecycleAnalysis, "healthScores=", analysisData.healthScores, "/> )}", activeView === 'behavior' && ()
                            < BehaviorAnalysisView, "behaviorPatterns=", analysisData.behaviorPatterns, "/> )}", activeView === 'predictions' && showPredictions && ()
                            < PredictiveAnalysisView, "predictiveModels=", analysisData.predictiveModels, "/> )}", activeView === 'value' && ()
                            < ValueAnalysisView, "valueAnalysis=", analysisData.valueAnalysis, "/> )}"] }), _jsx(CohortInsightsPanel, { insights: analysisData.insights, healthScores: analysisData.healthScores })] });
        ;
    }
    ;
    {
        const views = [];
        {
            key: 'comparative', label;
            'Comparative';
        }
        {
            key: 'retention', label;
            'Retention';
        }
        {
            key: 'lifecycle', label;
            'Lifecycle';
        }
        {
            key: 'behavior', label;
            'Behavior';
        }
        {
            key: 'value', label;
            'Value';
        }
        {
            key: 'predictions', label;
            'Predictions';
        }
        ;
        const averageHealthScore = analysisData.healthScores.length > 0;
        analysisData.healthScores.reduce((sum, h) => sum + h.overallScore, 0) / analysisData.healthScores.length;
        0;
        const criticalInsights = analysisData.insights.filter(i => i.severity === 'critical').length;
        return;
        _jsx("div", { className: "cohort-analysis-header", children: _jsxs("div", { className: "header-info", children: [_jsxs("h3", { children: ["Cohort Analysis: ", funnelDefinition.name] }), _jsx("p", { children: "Comprehensive cohort-based funnel performance analysis" }), _jsxs("div", { className: "cohort-summary", children: [_jsxs("div", { className: "summary-metric", children: [_jsx("span", { className: "label", children: "Active Cohorts" }), _jsx("span", { className: "value", children: selectedCohorts.length })] }), _jsxs("div", { className: "summary-metric", children: [_jsx("span", { className: "label", children: "Avg. Health Score" }), _jsx("span", { className: "value", children: averageHealthScore.toFixed(1) })] }), criticalInsights > 0 && ()
                                < div, " className=\"summary-metric critical\">", _jsx("span", { className: "label", children: "Critical Insights" }), _jsx("span", { className: "value", children: criticalInsights })] }), ")}"] }) })
            ,
                _jsx("div", { className: "header-controls", children: _jsxs("div", { className: "cohort-selector", children: [_jsx("label", { children: "Cohorts:" }), _jsx("div", { className: "cohort-tags", children: selectedCohorts.map(cohort => ()
                                    < span, key = { cohort, : .id }, className = "cohort-tag" >
                                    { cohort, : .name }) }), "))}"] }) })
                    ,
                        _jsxs("div", { className: "view-selector", children: [views.map(view => ()
                                    < button, key = { view, : .key }, onClick = {}()), " => onViewChange(view.key)} className=", `view-button ${activeView === view.key ? 'active' : ''}`, ">", view.label] });
    }
    div >
        _jsx("button", { onClick: onExport, className: "export-button", children: "Export Analysis" });
    div >
    ;
    div >
    ;
    ;
}
;
{
    return;
    _jsx("div", { className: "comparative-analysis-view", children: _jsxs("div", { className: "performance-comparison", children: [_jsx("h4", { children: "Cohort Performance Comparison" }), _jsxs("div", { className: "comparison-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { children: "Cohort" }), _jsx("div", { children: "Conversion Rate" }), _jsx("div", { children: "Avg. Time to Convert" }), _jsx("div", { children: "Value per User" }), _jsx("div", { children: "Health Score" })] }), cohortPerformance.map(cohort => ()
                            < div, key = { cohort, : .cohortId }, className = "table-row" >
                            (_jsxs("div", { className: "cohort-info", children: [_jsx("span", { className: "cohort-name", children: cohort.cohortName }), _jsxs("span", { className: "cohort-size", children: [cohort.cohortDefinition.size, " users"] })] })
                                ,
                                    _jsxs("div", { className: "conversion-rate", children: [cohort.funnelMetrics.overallConversionRate.toFixed(2), "%"] })
                                        ,
                                            _jsx("div", { className: "time-to-convert", children: formatDuration(cohort.funnelMetrics.averageTimeToConvert) })
                                                ,
                                                    _jsxs("div", { className: "value-per-user", children: ["$", cohort.valueMetrics.valuePerUser.toFixed(2)] })
                                                        ,
                                                            _jsx("div", { className: "health-score", children: _jsx("span", { className: `score ${getHealthScoreClass(cohort.valueMetrics.valuePerUser)}`, children: "} 85" }) })))] }), "))}"] }) })
        ,
            _jsxs("div", { className: "step-comparison", children: [_jsx("h4", { children: "Step-by-Step Comparison" }), _jsx(StepComparisonChart, { cohortPerformance: cohortPerformance, funnelSteps: funnelDefinition.steps })] });
    {
        comparativeAnalysis.significantDifferences.length > 0 && ()
            < div;
        className = "significant-differences" >
            _jsx("h4", { children: "Significant Differences" });
        {
            comparativeAnalysis.significantDifferences.slice(0, 5).map((diff, index) => ()
                < CohortDifferenceCard, key = { index }, difference = { diff } /  >
            );
        }
        div >
        ;
    }
    div >
    ;
    ;
}
;
{
    const chartWidth = 800;
    const chartHeight = 300;
    const stepWidth = chartWidth / funnelSteps.length;
    return;
    _jsx("div", { className: "step-comparison-chart", children: _jsxs("svg", { width: chartWidth, height: chartHeight, children: [funnelSteps.map((step, stepIndex) => {
                    const x = stepIndex * stepWidth;
                    return;
                    _jsxs("g", { children: [_jsx("text", { x: x + stepWidth / 2, y: chartHeight - 10, textAnchor: "middle", fontSize: "12", fill: "#666", children: step.name }), cohortPerformance.map((cohort, cohortIndex) => {
                                const stepPerf = cohort.stepPerformance.find(s => s.stepId === step.id);
                                if (!stepPerf)
                                    return null;
                                const barHeight = (stepPerf.conversionRate / 100) * (chartHeight - 40);
                                const barWidth = (stepWidth - 20) / cohortPerformance.length;
                                const barX = x + 10 + cohortIndex * barWidth;
                                const barY = chartHeight - 30 - barHeight;
                                return;
                                _jsxs("g", { children: ["}", _jsx("rect", { x: barX, y: barY, width: barWidth - 2, height: barHeight, fill: getCohortColor(cohortIndex), opacity: 0.8 }), _jsxs("text", { x: barX + barWidth / 2, y: barY - 5, textAnchor: "middle", fontSize: "10", fill: "#666", children: [stepPerf.conversionRate.toFixed(1), "%"] })] }, `${step.id}-${cohort.cohortId}`);
                            }), "; })}"] }, step.id);
                }), "; })}", _jsxs("g", { transform: `translate(${chartWidth - 200}, 20)`, children: ["}", cohortPerformance.map((cohort, index) => ()
                            < g, key = { cohort, : .cohortId }, transform = {} `translate(0, ${index * 20})`), ">}", _jsx("rect", { x: "0", y: "0", width: "12", height: "12", fill: getCohortColor(index) }), _jsx("text", { x: "16", y: "10", fontSize: "12", fill: "#666", children: cohort.cohortName })] }), "))}"] }) });
    div >
    ;
    ;
}
;
div >
;
;
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "lifecycle-analysis-view", children: [_jsxs("div", { className: "lifecycle-overview", children: [_jsx("h4", { children: "Cohort Lifecycle Analysis" }), _jsxs("div", { className: "lifecycle-grid", children: [lifecycleAnalysis.map(analysis => ()
                                < LifecycleCard, key = { analysis, : .cohortId }, analysis = { analysis } /  >
                            ), ")}"] })] }), _jsxs("div", { className: "health-scores", children: [_jsx("h4", { children: "Cohort Health Scores" }), _jsxs("div", { className: "health-scores-grid", children: [healthScores.map(score => ()
                                < HealthScoreCard, key = { score, : .cohortId }, healthScore = { score } /  >
                            ), ")}"] })] })] });
    ;
}
;
div >
;
;
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
const CohortAnalysisLoadingState = () => ()
    < div, className = "cohort-analysis-loading" >
    (_jsx("div", { className: "loading-spinner" })
        ,
            _jsx("p", { children: "Loading cohort analysis..." }));
div >
;
;
className = "cohort-analysis-error" >
    (_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Analysis" }), _jsx("p", { children: error })] })
        ,
            _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry Loading" }));
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
function getCohortColor(index) {
    const colors = [];
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
        '#8b5cf6', '#06b6d4', '#f97316', '#84cc16';
    ;
    return colors[index % colors.length];
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
        metricResults: ConversionMetricResult,
            selectedCohorts;
        ConversionCohort,
            timeRange;
        {
            start: number;
            end: number;
        }
        analysisMode: CohortAnalysisMode;
        Promise < CohortAnalysisData > {
            // Simplified implementation - in production would process actual cohort metrics
            const: cohortPerformance, CohortPerformanceData = selectedCohorts.map((cohort, index) => ({}), cohortId, cohort.id, cohortName, cohort.name, cohortDefinition, {
                criteriaEvent: cohort.definition.criteriaEvent,
                timeWindow: cohort.definition.timeWindow,
                size: cohort.state.currentSize,
                creationDate: cohort.state.creationDate,
                maturity: 'mature',
                characteristics: ['High engagement', 'Premium features usage'],
            }, funnelMetrics, {
                totalEntries: 1000 + (index * 200),
                totalConversions: 180 + (index * 50),
                overallConversionRate: 18 + (index * 3) + (Math.random() * 5),
                averageTimeToConvert: 3600000 + (index * 600000),
                completionRate: 85 + (Math.random() * 10),
                dropOffRate: 15 - (index * 2),
                retentionRate: 75 + (index * 5),
                reactivationRate: 12 + (Math.random() * 8),
            }, stepPerformance, funnelDefinition.steps.map((step, stepIndex) => ({}), stepId, step.id, stepName, step.name, stepOrder, step.order, entries, 1000 - (stepIndex * 150) + (index * 50), conversions, 850 - (stepIndex * 150) + (index * 40), conversionRate, 85 - (stepIndex * 10) + (index * 2), averageTimeSpent, 60000 + (stepIndex * 30000), dropOffCount, 150 - (index * 20), dropOffRate, 15 - (index * 2), retentionToNextStep, 90 - (stepIndex * 5), stepEfficiency, 0.8 + (Math.random() * 0.15), cohortSpecificBehaviors, [,
                {
                    behavior: 'Extended browsing',
                    frequency: 35 + (Math.random() * 20),
                    impact: 12 + (Math.random() * 8),
                    uniqueness: 0.7 + (Math.random() * 0.2),
                    description: 'Users spend more time evaluating options'
                }]))
        };
        temporalPerformance: Array.from({ length: 12 }, (_, period) => ({}), period, period + 1, periodLabel, `Week ${period + 1}`);
    }
}
entries: 100 + Math.floor(Math.random() * 50),
    conversions;
15 + Math.floor(Math.random() * 10),
    conversionRate;
15 + (Math.random() * 10),
    retentionRate;
80 + (Math.random() * 15),
    reactivationCount;
Math.floor(Math.random() * 5),
    valueGenerated;
500 + Math.random() * 300,
    trendDirection;
Math.random() > 0.5 ? 'improving' : 'stable';
progressionMetrics: {
    progressionRate: 75 + (Math.random() * 20),
        averageProgressionTime;
    86400000 * (3 + Math.random() * 4),
        progressionStages;
    [],
        stagnationPoints;
    [],
        accelerationFactors;
    [],
    ;
}
valueMetrics: {
    totalValue: 5000 + (index * 2000),
        valuePerUser;
    25 + (index * 10),
        valuePerConversion;
    150 + (index * 50),
        lifetimeValue;
    500 + (index * 200),
        valueTrajectory;
    [],
        valueDistribution;
    {
        lowValue: {
            threshold: 10, percentage;
            40, totalValue;
            800;
        }
        mediumValue: {
            threshold: 50, percentage;
            35, totalValue;
            1750;
        }
        highValue: {
            threshold: 100, percentage;
            20, totalValue;
            2000;
        }
        topPercentile: {
            threshold: 500, percentage;
            5, totalValue;
            2500;
        }
    }
    moneyGenerationPattern: {
        pattern: 'gradual',
            consistency;
        0.75,
            predictability;
        0.8,
            seasonality;
        {
            hasSeasonality: true,
                pattern;
            'weekly',
                peaks;
            ['Tuesday', 'Wednesday'],
                troughs;
            ['Sunday'],
            ;
        }
        benchmarkComparison: {
            overallPerformance: {
                metric: 'conversion_rate',
                    cohortValue;
                18 + (index * 3),
                    benchmarkValue;
                15,
                    percentile;
                70 + (index * 10),
                    performance;
                'good',
                    improvementPotential;
                5 + (Math.random() * 10),
                ;
            }
            stepComparisons: [],
                peerCohorts;
            [],
                industryBenchmarks;
            [];
        }
        ;
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
                recommendations: [,
                    'Expand premium user acquisition campaigns',
                    'Analyze premium cohort behavior patterns for replication',
                    'Increase investment in premium user experience features'
                ],
                evidence: [,
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
                significantDifferences: selectedCohorts.length > 1 ? [,
                    {
                        metric: 'conversion_rate',
                        cohortA: { id: selectedCohorts[0].id, name: selectedCohorts[0].name, value: 21.5 },
                        cohortB: { id: selectedCohorts[1]?.id || '', name: selectedCohorts[1]?.name || '', value: 18.2 },
                        difference: 3.3,
                        significance: 0.025,
                        possibleReasons: [,
                            'Different user acquisition channels',
                            'Varying engagement patterns',
                            'Cohort maturity differences'
                        ],
                        actionableInsights: [,
                            'Apply high-performing cohort strategies to others',
                            'Investigate acquisition channel quality'
                        ]
                    }
                ] : [],
                convergenceAnalysis: [],
                outlierAnalysis: []
            },
            retentionAnalysis: selectedCohorts.map(cohort => ({}), cohortId, cohort.id, cohortName, cohort.name, retentionCurve, Array.from({ length: 30 }, (_, day) => ({}), period, day + 1, periodLabel, `Day ${day + 1}`))
        };
    }
    retainedUsers: Math.floor(1000 * Math.pow(0.95, day)),
        retentionRate;
    Math.pow(0.95, day) * 100,
        churnedUsers;
    Math.floor(1000 * (1 - Math.pow(0.95, day))),
        churnRate;
    (1 - Math.pow(0.95, day)) * 100,
        reactivatedUsers;
    Math.floor(Math.random() * 20),
        netRetention;
    Math.pow(0.95, day) * 100 + (Math.random() * 5);
}
retentionMetrics: {
    dayOneRetention: 95,
        daySevenRetention;
    75,
        dayThirtyRetention;
    55,
        dayNinetyRetention;
    35,
        halfLife;
    14,
        retentionStability;
    0.8,
        retentionTrend;
    'stable',
    ;
}
retentionFactors: [,
    {
        factor: 'Early engagement',
        impact: 25,
        correlation: 0.82,
        actionability: 'high',
        description: 'Users who engage within first 24 hours show higher retention'
    }],
    churnAnalysis;
{
    overallChurnRate: 45,
        churnPredictors;
    [],
        churnSegments;
    [],
        preventableChurn;
    15,
        churnValue;
    2500,
    ;
}
reactivationAnalysis: {
    reactivationRate: 12,
        averageTimeToReactivation;
    604800000, // 7 days,
        reactivationTriggers;
    [],
        reactivationValue;
    850,
        reactivationROI;
    3.2,
    ;
}
lifecycleAnalysis: selectedCohorts.map(cohort => ({}), cohortId, cohort.id, cohortName, cohort.name, lifecycleStages, [,
    {
        stage: 'onboarding',
        userCount: 250,
        percentage: 25,
        averageTimeInStage: 86400000,
        conversionToNext: 80,
        valueGenerated: 500,
        stageCharacteristics: ['Initial setup', 'First interactions'],
    },
    {
        stage: 'activation',
        userCount: 200,
        percentage: 20,
        averageTimeInStage: 259200000,
        conversionToNext: 75,
        valueGenerated: 1200,
        stageCharacteristics: ['Feature adoption', 'Value realization'],
    },
    {
        stage: 'engagement',
        userCount: 300,
        percentage: 30,
        averageTimeInStage: 604800000,
        conversionToNext: 85,
        valueGenerated: 2500,
        stageCharacteristics: ['Regular usage', 'Pattern establishment'],
    },
    {
        stage: 'retention',
        userCount: 150,
        percentage: 15,
        averageTimeInStage: 2592000000,
        conversionToNext: 60,
        valueGenerated: 1800,
        stageCharacteristics: ['Consistent value', 'Habit formation'],
    },
    {
        stage: 'expansion',
        userCount: 80,
        percentage: 8,
        averageTimeInStage: 1209600000,
        conversionToNext: 40,
        valueGenerated: 3500,
        stageCharacteristics: ['Premium features', 'Higher engagement'],
    },
    {
        stage: 'advocacy',
        userCount: 20,
        percentage: 2,
        averageTimeInStage: 5184000000,
        conversionToNext: 100,
        valueGenerated: 5000,
        stageCharacteristics: ['Referrals', 'Community participation']
    }], stageTransitions, [], maturityMetrics, {
    overallMaturity: 75,
    maturityFactors: [],
    maturityTrajectory: 'steady',
    expectedPeakValue: 15000,
    timeToMaturity: 180,
}, lifecycleHealth, {
    healthScore: 82,
    healthFactors: [],
    riskIndicators: [],
    opportunityAreas: [],
});
behaviorPatterns: selectedCohorts.map(cohort => ({}), cohortId, cohort.id, cohortName, cohort.name, patterns, [,
    {
        pattern: 'Extended evaluation phase',
        frequency: 35,
        conversionImpact: 15,
        valueImpact: 25,
        temporalPattern: 'Weekday evenings',
        predictability: 0.75,
        description: 'Users spend additional time comparing options before converting'
    }], uniqueBehaviors, [,
    {
        behavior: 'Advanced feature exploration',
        uniquenessScore: 0.8,
        cohortSpecific: true,
        competitiveAdvantage: true,
        replicability: 'medium',
        description: 'Early adoption of complex features'
    }], behaviorEvolution, [], crossCohortComparison, []);
valueAnalysis: [],
    predictiveModels;
selectedCohorts.map(cohort => ({}), cohortId, cohort.id, cohortName, cohort.name, modelType, 'conversion', predictions, [,
    {
        timeframe: 7,
        timeframeLabel: '7 days',
        predictedValue: 22.5,
        confidence: 0.85,
        factors: ['Historical performance', 'Seasonal trends'],
        assumptions: ['Consistent traffic patterns', 'No major product changes'],
    },
    {
        timeframe: 30,
        timeframeLabel: '30 days',
        predictedValue: 24.1,
        confidence: 0.78,
        factors: ['Growth trend', 'Optimization initiatives'],
        assumptions: ['Continued improvement efforts', 'Market stability']
    }], modelAccuracy, 85.2, confidenceInterval, 0.8, keyPredictors, [,
    {
        predictor: 'Previous step completion rate',
        importance: 0.35,
        direction: 'positive',
        stability: 0.9,
        actionability: 'high',
    },
    {
        predictor: 'Time spent on step',
        importance: 0.25,
        direction: 'positive',
        stability: 0.75,
        actionability: 'medium'
    }], scenarioAnalysis, []);
insights,
    healthScores;
selectedCohorts.map(cohort => ({}), cohortId, cohort.id, cohortName, cohort.name, overallScore, 75 + (Math.random() * 20), scoreComponents, [,
    {
        component: 'Conversion Performance',
        score: 82,
        weight: 0.3,
        trend: 'improving',
        benchmark: 75,
        contributingFactors: ['High step completion', 'Low drop-off rates'],
    },
    {
        component: 'Retention Quality',
        score: 78,
        weight: 0.25,
        trend: 'stable',
        benchmark: 70,
        contributingFactors: ['Strong day-7 retention', 'Good reactivation'],
    },
    {
        component: 'Value Generation',
        score: 85,
        weight: 0.25,
        trend: 'improving',
        benchmark: 80,
        contributingFactors: ['Above-average LTV', 'Strong monetization'],
    },
    {
        component: 'Behavioral Health',
        score: 72,
        weight: 0.2,
        trend: 'stable',
        benchmark: 75,
        contributingFactors: ['Consistent patterns', 'Predictable behavior']
    }], scoreHistory, [], scoreTrend, 'improving', riskLevel, 'low', interventionRecommendations, [,
    {
        recommendation: 'Optimize step 2 experience for this cohort',
        priority: 'high',
        expectedImpact: 12,
        effort: 'medium',
        timeframe: '2-4 weeks',
        successMetrics: ['Step 2 conversion rate', 'Overall funnel performance']
    }]);
;
export default CohortFunnelAnalysis;
