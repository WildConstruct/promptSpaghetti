import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Recommendation System Effectiveness Tracking - Story 30.2 Task 11
 *
 * Comprehensive tracking and analysis system for measuring recommendation system
 * performance, effectiveness, and business impact across multiple algorithms and contexts.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
// Mock data generators
const generateRecommendationMetrics = () => {
    const algorithmTypes = ['collaborative_filtering', 'content_based', 'deep_learning', 'hybrid', 'matrix_factorization'];
    const algorithmType = algorithmTypes[Math.floor(Math.random() * algorithmTypes.length)];
    return {
        algorithmId: `algo_${Math.random().toString(36).substr(2, 8)}`
    };
}, algorithmName;
('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    version;
`v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`;
timestamp: Date.now(),
    metrics;
[,
    {
        metricId: 'click_through_rate',
        name: 'Click Through Rate',
        value: Math.random() * 0.15 + 0.05,
        benchmark: 0.08,
        variance: (Math.random() - 0.5) * 0.02,
        trend: {},
        direction: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        strength: Math.random(),
        duration: Math.floor(Math.random() * 30) + 7,
    },
    confidence, Math.random() * 0.2 + 0.8,
    {
        metricId: 'conversion_rate',
        name: 'Conversion Rate',
        value: Math.random() * 0.1 + 0.02,
        benchmark: 0.05,
        variance: (Math.random() - 0.5) * 0.01,
        trend: {},
        direction: Math.random() > 0.5 ? 'increasing' : 'stable',
        strength: Math.random(),
        duration: Math.floor(Math.random() * 30) + 7,
    },
    confidence, Math.random() * 0.2 + 0.8,
    {
        metricId: 'ndcg_at_10',
        name: 'NDCG@10',
        value: Math.random() * 0.3 + 0.7,
        benchmark: 0.75,
        variance: (Math.random() - 0.5) * 0.05,
        trend: {},
        direction: 'increasing',
        strength: Math.random(),
        duration: Math.floor(Math.random() * 30) + 7,
    },
    confidence, Math.random() * 0.2 + 0.8,
    {
        metricId: 'diversity_score',
        name: 'Diversity Score',
        value: Math.random() * 0.4 + 0.6,
        benchmark: 0.7,
        variance: (Math.random() - 0.5) * 0.1,
        trend: {},
        direction: 'stable',
        strength: Math.random() * 0.3,
        duration: Math.floor(Math.random() * 30) + 7,
    },
    confidence, Math.random() * 0.2 + 0.8],
    contextualMetrics;
[],
    businessImpact;
{
    revenueImpact: (Math.random() - 0.3) * 50000,
        conversionLift;
    Math.random() * 25 + 5,
        engagementIncrease;
    Math.random() * 30 + 10,
        retentionImprovement;
    Math.random() * 20 + 5,
        costEfficiency;
    Math.random() * 40 + 20,
        customerSatisfaction;
    Math.random() + 3.5,
    ;
}
userSegmentPerformance: [];
;
;
export const RecommendationEffectivenessTracking = ({
    analyticsInfrastructure,
    trackingConfig,
    onEffectivenessAlert,
    onPerformanceInsight,
    onExport
});
{
    const [algorithmMetrics, setAlgorithmMetrics] = useState([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
    const [selectedView, setSelectedView] = useState('overview');
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(false);
    // Generate mock data
    useEffect(() => {
        const mockMetrics = Array.from({ length: 6 }, generateRecommendationMetrics);
        setAlgorithmMetrics(mockMetrics);
        setSelectedAlgorithm(mockMetrics[0]?.algorithmId || null);
    }, []);
    const handleAnalyzeEffectiveness = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (onPerformanceInsight) {
                const bestAlgorithm = algorithmMetrics.reduce((best, current) => {
                    const bestCTR = best.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
                    const currentCTR = current.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
                    return currentCTR > bestCTR ? current : best;
                });
                onPerformanceInsight({});
                insightId: `insight_${Math.random().toString(36).substr(2, 8)}`;
            }
        }, type, 'algorithm_performance', message, `${bestAlgorithm.algorithmName} shows best overall performance with ${((bestAlgorithm.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0) * 100).toFixed(2)}% CTR`);
    });
}
algorithms: [bestAlgorithm.algorithmId],
    impact;
'high',
    confidence;
0.89,
    recommendations;
[,
    'Consider increasing traffic allocation',
    'Investigate success factors',
    'Scale to more user segments'
];
;
if (onEffectivenessAlert) {
    const underperformingAlgorithm = algorithmMetrics.find(algo => { });
    const ctr = algo.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
    return ctr < 0.06; // Below threshold
}
;
if (underperformingAlgorithm) {
    onEffectivenessAlert({});
    alertId: `alert_${Math.random().toString(36).substr(2, 8)}`;
}
algorithmId: underperformingAlgorithm.algorithmId,
    type;
'performance_degradation',
    severity;
'medium',
    message;
`${underperformingAlgorithm.algorithmName} performance below threshold`;
metrics: ['click_through_rate'],
    threshold;
0.06,
    actualValue;
underperformingAlgorithm.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0,
    timestamp;
Date.now(),
    actionRequired;
true;
;
2000;
;
[algorithmMetrics, onPerformanceInsight, onEffectivenessAlert];
;
const handleExport = useCallback(() => {
    if (onExport) {
        const exportData = {
            algorithmMetrics,
            timeRange: { start: Date.now() - 7 * 86400000, end: Date.now() },
            summary: {
                totalAlgorithms: algorithmMetrics.length,
                bestPerforming: algorithmMetrics.reduce((best, current) => {
                    const bestScore = best.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
                    const currentScore = current.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
                    return currentScore > bestScore ? current : best;
                }).algorithmId,
                averageCTR: algorithmMetrics.reduce((sum, algo) => {
                    const ctr = algo.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
                    return sum + ctr;
                }, 0) / algorithmMetrics.length,
                totalRevenueImpact: algorithmMetrics.reduce((sum, algo) => sum + algo.businessImpact.revenueImpact, 0)
            },
            exportTimestamp: Date.now()
        };
        onExport(exportData);
    }
    [algorithmMetrics, onExport];
});
const overallStats = useMemo(() => {
    if (!algorithmMetrics.length)
        return null;
    const avgCTR = algorithmMetrics.reduce((sum, algo) => {
        const ctr = algo.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
        return sum + ctr;
    }, 0) / algorithmMetrics.length;
    const avgConversion = algorithmMetrics.reduce((sum, algo) => {
        const conv = algo.metrics.find(m => m.metricId === 'conversion_rate')?.value || 0;
        return sum + conv;
    }, 0) / algorithmMetrics.length;
    const totalRevenueImpact = algorithmMetrics.reduce((sum, algo) => sum + algo.businessImpact.revenueImpact, 0);
    return {
        totalAlgorithms: algorithmMetrics.length,
        avgCTR: Math.round(avgCTR * 10000) / 100, // Percentage with 2 decimals,
        avgConversion: Math.round(avgConversion * 10000) / 100,
        totalRevenueImpact: Math.round(totalRevenueImpact),
        bestAlgorithm: algorithmMetrics.reduce((best, current) => {
            const bestCTR = best.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
            const currentCTR = current.metrics.find(m => m.metricId === 'click_through_rate')?.value || 0;
            return currentCTR > bestCTR ? current : best;
        })
    };
}, [algorithmMetrics]);
const selectedAlgorithmData = useMemo(() => {
    return selectedAlgorithm ? algorithmMetrics.find(a => a.algorithmId === selectedAlgorithm) : null;
}, [selectedAlgorithm, algorithmMetrics]);
return;
_jsxs("div", { className: "recommendation-effectiveness-tracking", children: [_jsxs("div", { className: "tracking-header", children: [_jsxs("div", { className: "header-section", children: [_jsx("h2", { children: "Recommendation System Effectiveness" }), overallStats && ()
                            < div, " className=\"overall-stats\">", _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: overallStats.totalAlgorithms }), _jsx("span", { className: "stat-label", children: "Algorithms" })] }), _jsxs("div", { className: "stat", children: [_jsxs("span", { className: "stat-value", children: [overallStats.avgCTR, "%"] }), _jsx("span", { className: "stat-label", children: "Avg CTR" })] }), _jsxs("div", { className: "stat", children: [_jsxs("span", { className: "stat-value", children: [overallStats.avgConversion, "%"] }), _jsx("span", { className: "stat-label", children: "Avg Conversion" })] }), _jsxs("div", { className: "stat", children: [_jsxs("span", { className: "stat-value", children: ["$", overallStats.totalRevenueImpact.toLocaleString()] }), "}", _jsx("span", { className: "stat-label", children: "Revenue Impact" })] })] }), ")}"] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "view-selector", children: [_jsx("button", { className: selectedView === 'overview' ? 'active' : '', onClick: () => setSelectedView('overview'), children: "Overview" }), _jsx("button", { className: selectedView === 'detailed' ? 'active' : '', onClick: () => setSelectedView('detailed'), children: "Detailed" }), _jsx("button", { className: selectedView === 'comparison' ? 'active' : '', onClick: () => setSelectedView('comparison'), children: "Comparison" }), _jsx("button", { className: selectedView === 'insights' ? 'active' : '', onClick: () => setSelectedView('insights'), children: "Insights" })] }), _jsx("div", { className: "time-range-selector", children: _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), children: [_jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last 7 Days" }), _jsx("option", { value: "30d", children: "Last 30 Days" }), _jsx("option", { value: "90d", children: "Last 90 Days" })] }) }), _jsx("button", { className: "analyze-btn", onClick: handleAnalyzeEffectiveness, disabled: loading, children: loading ? '📊 Analyzing...' : '🔍 Analyze Effectiveness' }), _jsx("button", { className: "export-btn", onClick: handleExport, children: "\uD83D\uDCCB Export Results" })] })] })
    ,
        _jsxs("div", { className: "tracking-content", children: [loading && ()
                    < div, " className=\"loading-overlay\">", _jsx("div", { className: "loading-spinner", children: "\uD83D\uDCCA" }), _jsx("div", { className: "loading-text", children: "Analyzing recommendation effectiveness..." })] });
{
    selectedView === 'overview' && ()
        < div;
    className = "overview-view" >
        (_jsxs("div", { className: "algorithms-grid", children: [algorithmMetrics.map(algo => ()
                    < div, key = { algo, : .algorithmId }, className = {} `algorithm-card ${selectedAlgorithm === algo.algorithmId ? 'selected' : ''}`), "onClick=", () => setSelectedAlgorithm(algo.algorithmId), ">", _jsxs("div", { className: "algo-header", children: [_jsx("h4", { children: algo.algorithmName }), _jsx("span", { className: "algo-version", children: algo.version })] }), _jsx("div", { className: "key-metrics", children: algo.metrics.slice(0, 3).map(metric => ()
                        < div, key = { metric, : .metricId }, className = "metric-row" >
                        (_jsx("span", { className: "metric-name", children: metric.name })
                            ,
                                _jsxs("span", { className: "metric-value", children: [metric.metricId.includes('rate') ?
                                            `${(metric.value * 100).toFixed(2)}%` : , "metric.value.toFixed(3)}"] })
                                    ,
                                        _jsxs("span", { className: `metric-trend ${metric.trend.direction}`, children: ["}", metric.trend.direction === 'increasing' ? '↗️' :
                                                    metric.trend.direction === 'decreasing' ? '↘️' : '➡️'] }))) }), "))}"] })
            ,
                _jsxs("div", { className: "business-impact", children: [_jsxs("div", { className: "impact-item", children: [_jsx("span", { children: "Revenue Impact:" }), _jsxs("span", { className: algo.businessImpact.revenueImpact >= 0 ? 'positive' : 'negative', children: ["$", Math.round(algo.businessImpact.revenueImpact).toLocaleString()] })] }), _jsxs("div", { className: "impact-item", children: [_jsx("span", { children: "Conversion Lift:" }), _jsxs("span", { className: "positive", children: ["+", algo.businessImpact.conversionLift.toFixed(1), "%"] })] })] }));
    div >
    ;
}
div >
;
div >
;
{
    selectedView === 'detailed' && selectedAlgorithmData && ()
        < div;
    className = "detailed-view" >
        (_jsxs("div", { className: "algorithm-details", children: [_jsxs("h3", { children: [selectedAlgorithmData.algorithmName, " - Detailed Analysis"] }), _jsxs("div", { className: "metrics-breakdown", children: [_jsx("h4", { children: "Performance Metrics" }), _jsxs("div", { className: "metrics-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { children: "Metric" }), _jsx("div", { children: "Current Value" }), _jsx("div", { children: "Benchmark" }), _jsx("div", { children: "Variance" }), _jsx("div", { children: "Trend" }), _jsx("div", { children: "Confidence" })] }), selectedAlgorithmData.metrics.map(metric => ()
                                    < div, key = { metric, : .metricId }, className = "table-row" >
                                    (_jsx("div", { children: metric.name })
                                        ,
                                            _jsxs("div", { children: [metric.metricId.includes('rate') ?
                                                        `${(metric.value * 100).toFixed(2)}%` : , "metric.value.toFixed(3)}"] })
                                                ,
                                                    _jsxs("div", { children: [metric.metricId.includes('rate') ?
                                                                `${(metric.benchmark * 100).toFixed(2)}%` : , "metric.benchmark.toFixed(3)}"] })
                                                        ,
                                                            _jsxs("div", { className: metric.variance >= 0 ? 'positive' : 'negative', children: [metric.variance >= 0 ? '+' : '', (metric.variance * 100).toFixed(2), "%"] })
                                                                ,
                                                                    _jsxs("div", { className: `trend ${metric.trend.direction}`, children: ["}", metric.trend.direction, " (", metric.trend.duration, "d)"] })
                                                                        ,
                                                                            _jsxs("div", { children: [Math.round(metric.confidence * 100), "%"] })))] }), "))}"] })] })
            ,
                _jsxs("div", { className: "business-impact-details", children: [_jsx("h4", { children: "Business Impact Analysis" }), _jsxs("div", { className: "impact-grid", children: [_jsxs("div", { className: "impact-card", children: [_jsx("h5", { children: "Revenue Impact" }), _jsxs("div", { className: `impact-value ${selectedAlgorithmData.businessImpact.revenueImpact >= 0 ? 'positive' : 'negative'}`, children: ["} $", Math.round(selectedAlgorithmData.businessImpact.revenueImpact).toLocaleString()] })] }), _jsxs("div", { className: "impact-card", children: [_jsx("h5", { children: "Conversion Lift" }), _jsxs("div", { className: "impact-value positive", children: ["+", selectedAlgorithmData.businessImpact.conversionLift.toFixed(1), "%"] })] }), _jsxs("div", { className: "impact-card", children: [_jsx("h5", { children: "Engagement Increase" }), _jsxs("div", { className: "impact-value positive", children: ["+", selectedAlgorithmData.businessImpact.engagementIncrease.toFixed(1), "%"] })] }), _jsxs("div", { className: "impact-card", children: [_jsx("h5", { children: "Retention Improvement" }), _jsxs("div", { className: "impact-value positive", children: ["+", selectedAlgorithmData.businessImpact.retentionImprovement.toFixed(1), "%"] })] }), _jsxs("div", { className: "impact-card", children: [_jsx("h5", { children: "Cost Efficiency" }), _jsxs("div", { className: "impact-value positive", children: ["+", selectedAlgorithmData.businessImpact.costEfficiency.toFixed(1), "%"] })] }), _jsxs("div", { className: "impact-card", children: [_jsx("h5", { children: "Customer Satisfaction" }), _jsxs("div", { className: "impact-value", children: [selectedAlgorithmData.businessImpact.customerSatisfaction.toFixed(1), "/5.0"] })] })] })] }));
    div >
    ;
    div >
    ;
}
{
    selectedView === 'comparison' && ()
        < div;
    className = "comparison-view" >
        _jsxs("div", { className: "comparison-placeholder", children: [_jsx("h3", { children: "Algorithm Comparison" }), _jsx("p", { children: "Comparative analysis features will be implemented here, including:" }), _jsxs("ul", { children: [_jsx("li", { children: "Side-by-side metric comparison" }), _jsx("li", { children: "Statistical significance testing" }), _jsx("li", { children: "Performance ranking and scoring" }), _jsx("li", { children: "Cost-benefit analysis" }), _jsx("li", { children: "A/B test result comparison" }), _jsx("li", { children: "Recommendation for optimal algorithm selection" })] })] });
    div >
    ;
}
{
    selectedView === 'insights' && ()
        < div;
    className = "insights-view" >
        _jsxs("div", { className: "insights-placeholder", children: [_jsx("h3", { children: "Performance Insights" }), _jsx("p", { children: "Advanced performance insights will be displayed here, including:" }), _jsxs("ul", { children: [_jsx("li", { children: "Algorithm performance trends and forecasts" }), _jsx("li", { children: "User segment effectiveness analysis" }), _jsx("li", { children: "Contextual performance variations" }), _jsx("li", { children: "Optimization recommendations" }), _jsx("li", { children: "Anomaly detection and root cause analysis" }), _jsx("li", { children: "Business impact attribution" })] })] });
    div >
    ;
}
div >
;
div >
;
;
;
export default RecommendationEffectivenessTracking;
