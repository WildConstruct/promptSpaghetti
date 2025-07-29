import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Personalization A/B Testing and Optimization Framework - Story 30.2 Task 11
 *
 * Comprehensive framework for running A/B tests on personalization strategies,
 * measuring effectiveness, and optimizing personalization algorithms based on results.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
// Mock data generators
const generatePersonalizationABTest = () => {
    const testId = `test_${Math.random().toString(36).substr(2, 8)}`;
};
const variants = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({}), variantId, `variant_${i}`);
name: i === 0 ? 'Control' : `Variant ${String.fromCharCode(65 + i)}`;
description: i === 0 ? 'Current personalization' : `Enhanced personalization strategy ${i}`;
trafficAllocation: i === 0 ? 0.5 : 0.5 / (Math.floor(Math.random() * 3) + 1),
    personalizationStrategy;
{
    strategyId: `strategy_${i}`;
}
name: ['Content-Based', 'Collaborative', 'Hybrid', 'Contextual'][Math.floor(Math.random() * 4)],
    type;
['content_based', 'collaborative_filtering', 'hybrid', 'contextual'][Math.floor(Math.random() * 4)],
    parameters;
{
    threshold: Math.random() * 0.5 + 0.5,
        learningRate;
    Math.random() * 0.01 + 0.001,
        regularization;
    Math.random() * 0.1,
    ;
}
targetSegments: ['new_users', 'returning_users', 'premium_users'].slice(0, Math.floor(Math.random() * 3) + 1),
    adaptationRules;
[];
configuration: {
    maxRecommendations: Math.floor(Math.random() * 10) + 5,
        diversityWeight;
    Math.random(),
        noveltyWeight;
    Math.random(),
        freshnessBias;
    Math.random(),
    ;
}
performance: {
    clickThroughRate: Math.random() * 0.15 + 0.05,
        conversionRate;
    Math.random() * 0.08 + 0.02,
        engagementScore;
    Math.random() * 40 + 60,
        userSatisfaction;
    Math.random() * 2 + 3,
    ;
}
;
return {
    testId,
    name: `Personalization Test ${testId.slice(-4)}`
};
description: 'Testing enhanced personalization algorithms for improved user experience',
    status;
['draft', 'running', 'completed'][Math.floor(Math.random() * 3)],
    variants,
    metrics;
[,
    {
        metricId: 'click_through_rate',
        name: 'Click Through Rate',
        type: 'primary',
        target: 0.1,
        minimumDetectableEffect: 0.02,
    },
    {
        metricId: 'conversion_rate',
        name: 'Conversion Rate',
        type: 'primary',
        target: 0.05,
        minimumDetectableEffect: 0.01
    }],
    targeting;
{
    audience: 'all_users',
        segments;
    ['new_users', 'returning_users'],
        filters;
    [],
        sampleSize;
    Math.floor(Math.random() * 10000) + 5000,
    ;
}
results: Math.random() > 0.5 ? {
    testId,
    startDate: Date.now() - Math.random() * 30 * 86400000,
    endDate: Date.now() - Math.random() * 7 * 86400000,
    participants: Math.floor(Math.random() * 8000) + 2000,
    results: variants.map(variant => ({}), variantId, variant.variantId, participants, Math.floor(Math.random() * 2000) + 500, metrics, [,
        {
            metricId: 'click_through_rate',
            value: Math.random() * 0.15 + 0.05,
            standardError: Math.random() * 0.01 + 0.005,
            confidenceInterval: {
                lower: Math.random() * 0.05 + 0.05,
                upper: Math.random() * 0.05 + 0.15,
            }
        },
        {
            metricId: 'conversion_rate',
            value: Math.random() * 0.08 + 0.02,
            standardError: Math.random() * 0.005 + 0.002,
            confidenceInterval: {
                lower: Math.random() * 0.02 + 0.02,
                upper: Math.random() * 0.02 + 0.08
            }
        }], confidence, Math.random() * 0.3 + 0.7, statisticalPower, Math.random() * 0.2 + 0.8)
} : ;
statisticalSignificance: {
    pValue: Math.random() * 0.05,
        confidence;
    Math.random() * 0.05 + 0.95,
        effect;
    Math.random() * 0.3 + 0.1,
        significance;
    Math.random() < 0.7,
    ;
}
winningVariant: Math.random() > 0.3 ? variants[Math.floor(Math.random() * variants.length)].variantId : null,
    insights;
[],
    recommendations;
[];
null,
    timeline;
{
    plannedStart: Date.now() + Math.random() * 7 * 86400000,
        plannedEnd;
    Date.now() + Math.random() * 21 * 86400000,
        actualStart;
    Date.now() - Math.random() * 14 * 86400000,
        actualEnd;
    Math.random() > 0.5 ? Date.now() - Math.random() * 7 * 86400000 : null,
    ;
}
configuration: {
    confidenceLevel: 0.95,
        minimumSampleSize;
    Math.floor(Math.random() * 5000) + 1000,
        maximumDuration;
    Math.floor(Math.random() * 30) + 14,
        earlyStoppingEnabled;
    Math.random() > 0.5,
        multipleTestingCorrection;
    Math.random() > 0.5,
        sequentialTesting;
    Math.random() > 0.7,
    ;
}
;
;
export const PersonalizationABTestingFramework = ({
    analyticsInfrastructure,
    testingConfig,
    onTestResult,
    onOptimizationRecommendation,
    onExport
});
{
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedView, setSelectedView] = useState('overview');
    const [loading, setLoading] = useState(false);
    // Generate mock data
    useEffect(() => {
        const mockTests = Array.from({ length: 8 }, generatePersonalizationABTest);
        setTests(mockTests);
        setSelectedTest(mockTests[0]?.testId || null);
    }, []);
    const handleAnalyzeResults = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const completedTests = tests.filter(t => t.status === 'completed' && t.results);
            if (completedTests.length > 0 && onTestResult) {
                const randomTest = completedTests[Math.floor(Math.random() * completedTests.length)];
                if (randomTest.results) {
                    onTestResult(randomTest.results);
                    if (onOptimizationRecommendation) {
                        onOptimizationRecommendation({});
                        recommendationId: `rec_${Math.random().toString(36).substr(2, 8)}`;
                    }
                }
                type: 'algorithm_optimization',
                    title;
                'Hybrid Personalization Shows Best Performance',
                    description;
                'Hybrid algorithms consistently outperform single-strategy approaches',
                    priority;
                'high',
                    expectedImpact;
                {
                    conversionIncrease: 15.3,
                        engagementIncrease;
                    22.1,
                        revenueIncrease;
                    18750,
                        confidenceLevel;
                    0.94,
                    ;
                }
                implementation: {
                    complexity: 'medium',
                        estimatedTime;
                    '2-3 weeks',
                        resources;
                    ['ML Engineer', 'Data Scientist'],
                        steps;
                    [,
                        'Implement hybrid recommendation engine',
                        'Configure content-based and collaborative filtering',
                        'Set up real-time adaptation rules',
                        'Deploy with gradual rollout'
                    ];
                }
                testEvidence: completedTests.slice(0, 3).map(t => t.testId);
            }
        });
    }, 2500);
}
[tests, onTestResult, onOptimizationRecommendation];
;
const handleExport = useCallback(() => {
    if (onExport) {
        const exportData = {
            tests,
            summary: {
                totalTests: tests.length,
                runningTests: tests.filter(t => t.status === 'running').length,
                completedTests: tests.filter(t => t.status === 'completed').length,
                significantResults: tests.filter(t => t.results?.statisticalSignificance.significance).length,
                averageUplift: tests,
                : 
                    .filter(t => t.results?.statisticalSignificance.significance)
                    .reduce((sum, t) => sum + (t.results?.statisticalSignificance.effect || 0), 0) /
                    Math.max(1, tests.filter(t => t.results?.statisticalSignificance.significance).length)
            },
            exportTimestamp: Date.now()
        };
        onExport(exportData);
    }
    [tests, onExport];
});
const testStats = useMemo(() => ({}), total, tests.length, running, tests.filter(t => t.status === 'running').length, completed, tests.filter(t => t.status === 'completed').length, significant, tests.filter(t => t.results?.statisticalSignificance.significance).length, avgParticipants, tests.reduce(), (sum), t);
sum + (t.results?.participants || 0), 0;
/ Math.max(1, tests.filter(t => t.results).length);
[tests];
;
const selectedTestData = useMemo(() => {
    return selectedTest ? tests.find(t => t.testId === selectedTest) : null;
}, [selectedTest, tests]);
return;
_jsxs("div", { className: "personalization-ab-testing", children: [_jsxs("div", { className: "testing-header", children: [_jsxs("div", { className: "header-section", children: [_jsx("h2", { children: "Personalization A/B Testing Framework" }), _jsxs("div", { className: "test-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: testStats.total }), _jsx("span", { className: "stat-label", children: "Total Tests" })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: testStats.running }), _jsx("span", { className: "stat-label", children: "Running" })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: testStats.completed }), _jsx("span", { className: "stat-label", children: "Completed" })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: testStats.significant }), _jsx("span", { className: "stat-label", children: "Significant" })] })] })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "view-selector", children: [_jsx("button", { className: selectedView === 'overview' ? 'active' : '', onClick: () => setSelectedView('overview'), children: "Test Overview" }), _jsx("button", { className: selectedView === 'results' ? 'active' : '', onClick: () => setSelectedView('results'), children: "Results Analysis" }), _jsx("button", { className: selectedView === 'optimization' ? 'active' : '', onClick: () => setSelectedView('optimization'), children: "Optimization" }), _jsx("button", { className: selectedView === 'create' ? 'active' : '', onClick: () => setSelectedView('create'), children: "Create Test" })] }), _jsx("button", { className: "analyze-btn", onClick: handleAnalyzeResults, disabled: loading, children: loading ? '📊 Analyzing...' : '🔬 Analyze Results' }), _jsx("button", { className: "export-btn", onClick: handleExport, children: "\uD83D\uDCCB Export Tests" })] })] }), _jsxs("div", { className: "testing-content", children: [loading && ()
                    < div, " className=\"loading-overlay\">", _jsx("div", { className: "loading-spinner", children: "\uD83D\uDD2C" }), _jsx("div", { className: "loading-text", children: "Analyzing A/B test results..." })] }), ")}", selectedView === 'overview' && ()
            < div, " className=\"overview-view\">", _jsxs("div", { className: "tests-list", children: [_jsx("h3", { children: "Active A/B Tests" }), _jsxs("div", { className: "test-items", children: [tests.map(test => ()
                            < div, key = { test, : .testId }, className = {} `test-item ${selectedTest === test.testId ? 'active' : ''} status-${test.status}`), "onClick=", () => setSelectedTest(test.testId), ">", _jsxs("div", { className: "test-header", children: [_jsx("div", { className: "test-name", children: test.name }), _jsx("div", { className: `test-status ${test.status}`, children: test.status.toUpperCase() }), "}"] }), _jsx("div", { className: "test-description", children: test.description }), _jsxs("div", { className: "test-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { children: "Variants:" }), _jsx("span", { children: test.variants.length })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { children: "Participants:" }), _jsx("span", { children: test.results?.participants?.toLocaleString() || 'TBD' })] }), test.results?.statisticalSignificance && ()
                                    < div, " className=\"metric\">", _jsx("span", { children: "Significance:" }), _jsx("span", { className: test.results.statisticalSignificance.significance ? 'significant' : 'not-significant', children: test.results.statisticalSignificance.significance ? '✅ Yes' : '❌ No' })] }), ")}"] }), _jsxs("div", { className: "test-timeline", children: [test.timeline.actualStart && ()
                            < span > Started, ": ", new Date(test.timeline.actualStart).toLocaleDateString()] }), ")}", test.timeline.actualEnd && ()
                    < span > Ended, ": ", new Date(test.timeline.actualEnd).toLocaleDateString()] }), ")}"] });
div >
;
div >
;
div >
    { selectedTestData } && ()
    < div;
className = "test-details" >
    (_jsxs("h3", { children: ["Test Details: ", selectedTestData.name] })
        ,
            _jsxs("div", { className: "test-overview", children: [_jsxs("div", { className: "overview-section", children: [_jsx("h4", { children: "Test Configuration" }), _jsxs("div", { className: "config-grid", children: [_jsxs("div", { className: "config-item", children: [_jsx("span", { children: "Confidence Level:" }), _jsxs("span", { children: [Math.round(selectedTestData.configuration.confidenceLevel * 100), "%"] })] }), _jsxs("div", { className: "config-item", children: [_jsx("span", { children: "Min Sample Size:" }), _jsx("span", { children: selectedTestData.configuration.minimumSampleSize.toLocaleString() })] }), _jsxs("div", { className: "config-item", children: [_jsx("span", { children: "Max Duration:" }), _jsxs("span", { children: [selectedTestData.configuration.maximumDuration, " days"] })] }), _jsxs("div", { className: "config-item", children: [_jsx("span", { children: "Early Stopping:" }), _jsx("span", { children: selectedTestData.configuration.earlyStoppingEnabled ? '✅ Enabled' : '❌ Disabled' })] })] })] }), _jsxs("div", { className: "overview-section", children: [_jsxs("h4", { children: ["Variants (", selectedTestData.variants.length, ")"] }), _jsx("div", { className: "variants-list", children: selectedTestData.variants.map(variant => ()
                                    < div, key = { variant, : .variantId }, className = "variant-item" >
                                    (_jsxs("div", { className: "variant-header", children: [_jsx("span", { className: "variant-name", children: variant.name }), _jsxs("span", { className: "traffic-allocation", children: [Math.round(variant.trafficAllocation * 100), "%"] })] })
                                        ,
                                            _jsxs("div", { className: "variant-strategy", children: ["Strategy: ", variant.personalizationStrategy.name] })
                                                ,
                                                    _jsxs("div", { className: "variant-performance", children: [_jsxs("span", { children: ["CTR: ", (variant.performance.clickThroughRate * 100).toFixed(2), "%"] }), _jsxs("span", { children: ["Conv: ", (variant.performance.conversionRate * 100).toFixed(2), "%"] }), _jsxs("span", { children: ["Engagement: ", Math.round(variant.performance.engagementScore)] })] }))) }), "))}"] })] })
                ,
                    _jsxs("div", { className: "overview-section", children: [_jsx("h4", { children: "Primary Metrics" }), _jsxs("div", { className: "metrics-list", children: [selectedTestData.metrics.map(metric => ()
                                        < div, key = { metric, : .metricId }, className = "metric-item" >
                                        (_jsx("span", { className: "metric-name", children: metric.name })
                                            ,
                                                _jsx("span", { className: `metric-type ${metric.type}`, children: metric.type }))), _jsxs("span", { className: "metric-target", children: ["Target: ", (metric.target * 100).toFixed(1), "%"] }), _jsxs("span", { className: "metric-mde", children: ["MDE: ", (metric.minimumDetectableEffect * 100).toFixed(1), "%"] })] }), "))}"] }));
div >
;
div >
;
div >
;
div >
;
{
    selectedView === 'results' && selectedTestData?.results && ()
        < div;
    className = "results-view" >
        (_jsxs("div", { className: "results-summary", children: [_jsxs("h3", { children: ["Test Results: ", selectedTestData.name] }), _jsxs("div", { className: "summary-cards", children: [_jsxs("div", { className: "summary-card", children: [_jsx("h4", { children: "Participants" }), _jsx("div", { className: "card-value", children: selectedTestData.results.participants.toLocaleString() })] }), _jsxs("div", { className: "summary-card", children: [_jsx("h4", { children: "Statistical Significance" }), _jsxs("div", { className: `card-value ${selectedTestData.results.statisticalSignificance.significance ? 'significant' : 'not-significant'}`, children: ["}", selectedTestData.results.statisticalSignificance.significance ? 'Yes' : 'No'] }), _jsxs("div", { className: "card-detail", children: ["p-value: ", selectedTestData.results.statisticalSignificance.pValue.toFixed(4)] })] }), _jsxs("div", { className: "summary-card", children: [_jsx("h4", { children: "Effect Size" }), _jsxs("div", { className: "card-value", children: [(selectedTestData.results.statisticalSignificance.effect * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "summary-card", children: [_jsx("h4", { children: "Winning Variant" }), _jsx("div", { className: "card-value", children: selectedTestData.results.winningVariant ?
                                        selectedTestData.variants.find(v => v.variantId === selectedTestData.results?.winningVariant)?.name || 'Unknown' :
                                        'No Winner' })] })] })] })
            ,
                _jsxs("div", { className: "variant-results", children: [_jsx("h4", { children: "Variant Performance" }), _jsxs("div", { className: "results-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { children: "Variant" }), _jsx("div", { children: "Participants" }), _jsx("div", { children: "CTR" }), _jsx("div", { children: "Conversion Rate" }), _jsx("div", { children: "Confidence" }), _jsx("div", { children: "Statistical Power" })] }), selectedTestData.results.results.map(result => { }), "const variant = selectedTestData.variants.find(v => v.variantId === result.variantId); const ctrMetric = result.metrics.find(m => m.metricId === 'click_through_rate'); const convMetric = result.metrics.find(m => m.metricId === 'conversion_rate'); return;", _jsxs("div", { className: "table-row", children: [_jsx("div", { children: variant?.name || result.variantId }), _jsx("div", { children: result.participants.toLocaleString() }), _jsxs("div", { children: [ctrMetric ? `${(ctrMetric.value * 100).toFixed(2)}%` : 'N/A', ctrMetric && ()
                                                    < span, " className=\"confidence-interval\"> \u00B1", ((ctrMetric.confidenceInterval.upper - ctrMetric.confidenceInterval.lower) * 50).toFixed(2), "%"] }), ")}"] }, result.variantId), _jsxs("div", { children: [convMetric ? `${(convMetric.value * 100).toFixed(2)}%` : 'N/A', convMetric && ()
                                            < span, " className=\"confidence-interval\"> \u00B1", ((convMetric.confidenceInterval.upper - convMetric.confidenceInterval.lower) * 50).toFixed(2), "%"] }), ")}"] }), _jsxs("div", { children: [Math.round(result.confidence * 100), "%"] }), _jsxs("div", { children: [Math.round(result.statisticalPower * 100), "%"] })] }));
    ;
}
div >
;
div >
;
div >
;
{
    selectedView === 'optimization' && ()
        < div;
    className = "optimization-view" >
        _jsxs("div", { className: "optimization-placeholder", children: [_jsx("h3", { children: "Personalization Optimization" }), _jsx("p", { children: "Advanced optimization features will be implemented here, including:" }), _jsxs("ul", { children: [_jsx("li", { children: "Multi-armed bandit optimization" }), _jsx("li", { children: "Bayesian optimization for hyperparameters" }), _jsx("li", { children: "Sequential testing and early stopping" }), _jsx("li", { children: "Multi-objective optimization" }), _jsx("li", { children: "Contextual bandits for dynamic personalization" }), _jsx("li", { children: "Real-time adaptation based on test results" })] })] });
    div >
    ;
}
{
    selectedView === 'create' && ()
        < div;
    className = "create-view" >
        _jsxs("div", { className: "create-placeholder", children: [_jsx("h3", { children: "Create New A/B Test" }), _jsx("p", { children: "Test creation interface will be implemented here, including:" }), _jsxs("ul", { children: [_jsx("li", { children: "Test configuration wizard" }), _jsx("li", { children: "Variant setup and personalization strategy selection" }), _jsx("li", { children: "Audience targeting and segmentation" }), _jsx("li", { children: "Success metrics definition" }), _jsx("li", { children: "Statistical power calculation" }), _jsx("li", { children: "Timeline and resource planning" })] })] });
    div >
    ;
}
div >
;
div >
;
;
;
export default PersonalizationABTestingFramework;
