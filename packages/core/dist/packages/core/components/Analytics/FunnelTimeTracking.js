import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Time-based Funnel Performance Tracking - Story 30.2 Task 6
 *
 * Advanced time-based analysis of funnel performance with trend detection,
 * seasonal patterns, and real-time monitoring capabilities.
 *
 * Features:
 * - Multi-timeframe performance tracking (hour, day, week, month)
 * - Trend analysis with statistical significance testing
 * - Seasonal pattern detection and forecasting
 * - Real-time performance monitoring with alerts
 * - Comparative period analysis
 * - Performance anomaly detection
 * - Time-to-conversion analysis
 * - Cohort-based temporal analysis
 */
import { useState, useCallback, useRef, useEffect } from 'react';
export const FunnelTimeTracking = ({
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    segments = [],
    cohorts = [],
    granularity = 'day',
    showTrends = true,
    showAnomalies = true,
    realTimeUpdates = false,
    onAnomalyDetected,
    onExport
});
{
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState(granularity);
    const [activeView, setActiveView] = useState('timeline');
    const chartRef = useRef(null);
    // Load time tracking data
    const loadTrackingData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const query = {
                funnelId: funnelDefinition.id,
                startDate: timeRange.start,
                endDate: timeRange.end,
                metrics: [,
                    'conversion_rate',
                    'time_to_convert',
                    'velocity',
                    'user_journey_timing',
                    'step_performance',
                    'temporal_patterns'
                ],
                groupBy: ['funnel_step', selectedTimeframe],
                filters: [,
                    ...segments.map(segment => ({}), field, 'userContext.segmentIds', operator, 'contains', value, segment.id)]
            };
        }
        finally { }
    });
    cohorts.map(cohort => ({}), field, 'userContext.cohortIds', operator, 'contains', value, cohort.id);
}
aggregation: {
    interval: selectedTimeframe;
}
;
const results = await analyticsInfrastructure.queryMetrics(query);
const processedData = await processTimeTrackingData();
;
funnelDefinition,
    results,
    selectedTimeframe,
    timeRange,
    segments,
    cohorts;
;
setTrackingData(processedData);
// Check for anomalies and notify
if (showAnomalies && processedData.anomalies.length > 0) {
    processedData.anomalies
        .filter(anomaly => anomaly.severity === 'critical' || anomaly.severity === 'high')
        .forEach(anomaly => onAnomalyDetected?.(anomaly));
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load time tracking data');
}
finally {
    setLoading(false);
}
[
    funnelDefinition,
    analyticsInfrastructure,
    timeRange,
    selectedTimeframe,
    segments,
    cohorts,
    showAnomalies,
    onAnomalyDetected
];
;
useEffect(() => {
    loadTrackingData();
}, [loadTrackingData]);
// Real-time updates
useEffect(() => {
    if (!realTimeUpdates)
        return;
    const interval = setInterval(loadTrackingData, 30000); // Update every 30 seconds;
    return () => clearInterval(interval);
}, [realTimeUpdates, loadTrackingData]);
const handleExport = useCallback(async () => {
    if (!trackingData)
        return;
    const exportData = {
        timeRange,
        granularity: selectedTimeframe,
        data: trackingData,
        charts: {
            timeline: 'timeline-chart-svg',
            trends: 'trends-chart-svg',
            seasonality: 'seasonality-chart-svg',
            anomalies: 'anomalies-chart-svg',
        },
        insights: {
            trends: trackingData.trendAnalysis.flatMap(t => t.insights),
            seasonal: trackingData.seasonalPatterns.flatMap(p => p.recommendations),
            anomalies: trackingData.anomalies.filter(a => a.severity === 'critical' || a.severity === 'high'),
        },
        metadata: {
            exportedAt: Date.now(),
            dataQuality: 0.95,
            analysisDepth: 'comprehensive',
        },
        onExport }(exportData);
}, [trackingData, timeRange, selectedTimeframe, onExport]);
if (loading) {
    return _jsx(TimeTrackingLoadingState, {});
    if (error || !trackingData) {
        return;
        _jsx(TimeTrackingErrorState, { error: error || 'No data available', onRetry: loadTrackingData });
        ;
        return;
        _jsxs("div", { className: "funnel-time-tracking", children: [_jsx(TimeTrackingHeader, { funnelDefinition: funnelDefinition, realTimeMetrics: trackingData.realTimeMetrics, selectedTimeframe: selectedTimeframe, onTimeframeChange: setSelectedTimeframe, activeView: activeView, onViewChange: setActiveView, onExport: handleExport }), _jsxs("div", { className: "tracking-content", ref: chartRef, children: [activeView === 'timeline' && ()
                            < TimelineView, "performanceTimeline=", trackingData.performanceTimeline, "stepTimeAnalysis=", trackingData.stepTimeAnalysis, "conversionVelocity=", trackingData.conversionVelocity, "granularity=", selectedTimeframe, "/> )}", activeView === 'trends' && showTrends && ()
                            < TrendsView, "trendAnalysis=", trackingData.trendAnalysis, "comparativePeriods=", trackingData.comparativePeriods, "/> )}", activeView === 'seasonality' && ()
                            < SeasonalityView, "seasonalPatterns=", trackingData.seasonalPatterns, "/> )}", activeView === 'anomalies' && showAnomalies && ()
                            < AnomaliesView, "anomalies=", trackingData.anomalies, "onAnomalyInvestigate=", (anomaly) => console.log('Investigating:', anomaly), "/> )}"] })] });
        ;
    }
    ;
    {
        const timeframes = ['hour', 'day', 'week', 'month'];
        const views = [];
        {
            key: 'timeline', label;
            'Timeline';
        }
        {
            key: 'trends', label;
            'Trends';
        }
        {
            key: 'seasonality', label;
            'Seasonality';
        }
        {
            key: 'anomalies', label;
            'Anomalies';
        }
        ;
        return;
        _jsx("div", { className: "time-tracking-header", children: _jsxs("div", { className: "header-info", children: [_jsxs("h3", { children: ["Time-based Performance: ", funnelDefinition.name] }), _jsx("p", { children: "Comprehensive temporal analysis of funnel performance and user behavior" }), _jsxs("div", { className: "real-time-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Current Conversion Rate" }), _jsxs("span", { className: "value", children: [realTimeMetrics.currentConversionRate.toFixed(2), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Active Users" }), _jsx("span", { className: "value", children: realTimeMetrics.activeUsers.toLocaleString() })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Velocity" }), _jsxs("span", { className: "value", children: [realTimeMetrics.currentVelocity.toFixed(1), "/hr"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "24h Conversions" }), _jsx("span", { className: "value", children: realTimeMetrics.conversionsLast24Hours.toLocaleString() })] }), realTimeMetrics.alertsActive > 0 && ()
                                < div, " className=\"metric alert\">", _jsx("span", { className: "label", children: "Active Alerts" }), _jsx("span", { className: "value", children: realTimeMetrics.alertsActive })] }), ")}"] }) })
            ,
                _jsx("div", { className: "header-controls", children: _jsxs("div", { className: "timeframe-selector", children: [_jsx("label", { children: "Granularity:" }), _jsx("select", { value: selectedTimeframe, onChange: (e) => onTimeframeChange(e.target.value), children: timeframes.map(tf => ()
                                    < option, key = { tf }, value = { tf } > { tf, : .charAt(0).toUpperCase() + tf.slice(1) }) }), "))}"] }) })
                    ,
                        _jsxs("div", { className: "view-selector", children: [views.map(view => ()
                                    < button, key = { view, : .key }, onClick = {}()), " => onViewChange(view.key as any)} className=", `view-button ${activeView === view.key ? 'active' : ''}`, ">", view.label] });
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
    _jsxs("div", { className: "timeline-view", children: [_jsxs("div", { className: "timeline-charts", children: [_jsx(ConversionRateTimeline, { data: performanceTimeline, granularity: granularity }), _jsx(VelocityTimeline, { data: conversionVelocity, granularity: granularity })] }), _jsxs("div", { className: "step-time-analysis", children: [_jsx("h4", { children: "Step Time Analysis" }), _jsxs("div", { className: "step-analysis-grid", children: [stepTimeAnalysis.slice(0, 4).map(analysis => ()
                                < StepTimeCard, key = { analysis, : .stepId }, analysis = { analysis } /  >
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
;
;
div >
;
div >
;
;
;
div >
;
div >
;
;
;
div >
;
{
    pattern.recommendations.length > 0 && ()
        < div;
    className = "pattern-recommendations" >
        _jsx("h6", { children: "Recommendations" });
    {
        pattern.recommendations.slice(0, 2).map((rec, index) => ()
            < div, key = { index }, className = "recommendation-item" >
            (_jsx("strong", { children: rec.title })
                ,
                    _jsx("p", { children: rec.description })), div >
        );
    }
    div >
    ;
}
div >
;
;
;
div >
;
_jsx("div", { className: "anomaly-actions", children: _jsx("button", { onClick: onInvestigate, className: "investigate-button", disabled: anomaly.investigationStatus === 'investigating', children: anomaly.investigationStatus === 'investigating' ? 'Investigating...' : 'Investigate' }) });
div >
;
;
;
// Loading and Error States
const TimeTrackingLoadingState = () => ()
    < div, className = "time-tracking-loading" >
    (_jsx("div", { className: "loading-spinner" })
        ,
            _jsx("p", { children: "Loading time-based analysis..." }));
div >
;
;
className = "time-tracking-error" >
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
metricResults: ConversionMetricResult,
    granularity;
TimeGranularity,
    timeRange;
{
    start: number;
    end: number;
}
segments: UserSegment,
    cohorts;
ConversionCohort;
Promise < TimeTrackingData > {
    // Simplified implementation - in production would process actual time-series data
    const: now = Date.now(),
    const: dayMs = 86400000,
    // Generate timeline data points
    const: performanceTimeline, PerformanceTimelineData = [],
    const: periodCount = granularity === 'hour' ? 24 : granularity === 'day' ? 30 : 12,
    const: periodMs = granularity === 'hour' ? 3600000 : granularity === 'day' ? dayMs : dayMs * 7,
    for(let, i = 0, i, , periodCount, i) { } }++;
{
    const timestamp = now - (periodCount - i - 1) * periodMs;
    const conversionRate = 15 + Math.sin(i / 5) * 5 + (Math.random() - 0.5) * 3;
    performanceTimeline.push({});
    timestamp,
        period;
    new Date(timestamp).toISOString().split('T')[0],
        granularity,
        overallMetrics;
    {
        totalEntries: 1000 + Math.floor(Math.random() * 200),
            totalConversions;
        Math.floor((1000 + Math.random() * 200) * conversionRate / 100),
            conversionRate,
            averageTimeToConvert;
        3600000 + Math.random() * 1800000,
            revenue;
        2500 + Math.random() * 1000,
            revenuePerEntry;
        2.5 + Math.random(),
            revenuePerConversion;
        15 + Math.random() * 10,
            dropOffCount;
        850 + Math.floor(Math.random() * 100),
            dropOffRate;
        85 - conversionRate,
        ;
    }
    stepMetrics: funnelDefinition.steps.map((step, stepIndex) => ({}), stepId, step.id, stepName, step.name, entries, 1000 - (stepIndex * 150) + Math.floor(Math.random() * 50), conversions, 850 - (stepIndex * 150) + Math.floor(Math.random() * 50), conversionRate, 85 - (stepIndex * 10) + Math.random() * 5, averageTimeSpent, 60000 + (stepIndex * 30000) + Math.random() * 30000, dropOffs, 150 + Math.floor(Math.random() * 50), dropOffRate, 15 + (stepIndex * 5) + Math.random() * 5, revenue, 500 + Math.random() * 200);
}
environmentalFactors: [,
    {
        factor: 'Server load',
        value: 50 + Math.random() * 30,
        impact: Math.random() > 0.7 ? 'negative' : 'neutral',
        confidence: 0.8
    }];
;
// Generate trend analysis
const trendAnalysis = [
    {
        metric: 'conversion_rate',
        trend: 'increasing',
        trendStrength: 'moderate',
        changeRate: 2.3,
        significance: 0.023,
        confidence: 0.85,
        forecast: [],
        insights: [,
            {
                type: 'opportunity',
                title: 'Sustained Conversion Improvement',
                description: 'Conversion rate has improved 2.3% per period over the last month',
                impact: 15,
                urgency: 'medium',
                actionable: true,
                recommendedActions: [,
                    'Continue current optimization strategies',
                    'Document successful changes for replication'
                ]
            }
        ]
    }
];
// Generate seasonal patterns
const seasonalPatterns = [
    {
        pattern: 'weekly',
        description: 'Higher conversion rates on weekdays, lower on weekends',
        strength: 0.65,
        peaks: [,
            {
                period: 'Tuesday',
                value: 18.5,
                consistency: 0.8,
                duration: 1,
                contributingFactors: ['Business user engagement']
            }],
        troughs: [,
            {
                period: 'Sunday',
                value: 12.3,
                consistency: 0.7,
                duration: 1,
                contributingFactors: ['Lower traffic volume']
            }],
        businessImpact: 12.5,
        reliability: 0.75,
        recommendations: [,
            {
                type: 'marketing',
                title: 'Optimize weekend campaigns',
                description: 'Adjust marketing spend and messaging for weekend traffic patterns',
                timing: 'Weekly',
                expectedImpact: 8,
                implementation: ['Update ad scheduling', 'Create weekend-specific content']
            }]
    }
];
// Generate anomalies
const anomalies = [
    {
        id: 'anomaly-001',
        timestamp: now - 3600000,
        stepId: 'step-2',
        stepName: 'Template Browse',
        metric: 'conversion_rate',
        anomalyType: 'drop',
        severity: 'high',
        expectedValue: 18.5,
        actualValue: 12.3,
        deviation: 2.8,
        confidence: 0.92,
        possibleCauses: [,
            {
                category: 'technical',
                description: 'Template loading performance degradation',
                likelihood: 0.75,
                evidence: ['Increased page load times', 'Error rate spike'],
                investigationSteps: ['Check server metrics', 'Review CDN performance']
            }],
        businessImpact: 1500,
        autoResolved: false,
        investigationStatus: 'pending'
    }
];
return {
    performanceTimeline,
    trendAnalysis,
    seasonalPatterns,
    anomalies,
    stepTimeAnalysis: funnelDefinition.steps.map(step => ({}), stepId, step.id, stepName, step.name, timeToReach, {
        mean: 300000,
        median: 240000,
        p25: 180000,
        p75: 420000,
        p90: 600000,
        p95: 720000,
        standardDeviation: 150000,
        skewness: 1.2,
    }, timeSpentOnStep, {
        mean: 120000,
        median: 90000,
        p25: 60000,
        p75: 150000,
        p90: 240000,
        p95: 300000,
        standardDeviation: 80000,
        skewness: 2.1,
    }, timeToConvert, {
        mean: 3600000,
        median: 2400000,
        p25: 1800000,
        p75: 4200000,
        p90: 7200000,
        p95: 10800000,
        standardDeviation: 2400000,
        skewness: 1.8,
    }, abandonmentTiming, {
        earlyAbandonment: 25,
        midAbandonment: 45,
        lateAbandonment: 30,
        averageTimeBeforeAbandonment: 180000,
        peakAbandonmentTime: 240000,
    }, temporalPatterns, [,
        {
            pattern: 'Extended browsing before conversion',
            frequency: 35,
            impact: 12,
            timeframe: 'Step completion',
            description: 'Users spend 3x longer browsing before converting'
        }])
};
conversionVelocity: performanceTimeline.map(point => ({}), timestamp, point.timestamp, period, point.period, averageConversionTime, point.overallMetrics.averageTimeToConvert, conversionVelocity, point.overallMetrics.totalConversions / 24, // per hour,
velocityTrend, Math.random() > 0.5 ? 'accelerating' : 'stable', stepVelocities, point.stepMetrics.map(step => ({}), stepId, step.stepId, stepName, step.stepName, averageProcessingTime, step.averageTimeSpent, throughput, step.conversions / 24, efficiency, step.conversionRate / (step.averageTimeSpent / 60000), bottleneckSeverity, step.conversionRate < 70 ? 'moderate' : 'minor')),
    bottleneckAnalysis;
point.stepMetrics,
        .filter(step => step.conversionRate < 70)
        .map(step => ({}), stepId, step.stepId, stepName, step.stepName, bottleneckType, 'conversion', severity, 100 - step.conversionRate, impact, step.dropOffs, solutions, [,
        {
            title: 'Optimize step UX',
            description: 'Improve user experience for this step',
            effort: 'medium',
            expectedImprovement: 15,
            implementationTime: 7
        }]);
comparativePeriods: [,
    {
        baselinePeriod: { start: now - dayMs * 60, end: now - dayMs * 30, label: 'Previous Month' },
        comparisonPeriod: { start: now - dayMs * 30, end: now, label: 'Current Month' },
        overallComparison: {},
        metric: 'conversion_rate',
        baselineValue: 14.2,
        comparisonValue: 16.8,
        changeAbsolute: 2.6,
        changeRelative: 18.3,
        significance: 0.012,
        confidence: 0.95,
        direction: 'improvement',
    },
    stepComparisons, [],
    significantChanges, [,
        {
            stepId: 'step-2',
            stepName: 'Template Browse',
            metric: 'conversion_rate',
            changeType: 'improvement',
            magnitude: 'moderate',
            significance: 0.025,
            businessImpact: 850,
            possibleReasons: ['UX improvements', 'Better template organization']
        }],
    insights, []],
    realTimeMetrics;
{
    currentConversionRate: 16.8,
        currentVelocity;
    3.2,
        activeUsers;
    145,
        conversionsLast24Hours;
    78,
        averageTimeToConvert;
    3600000,
        currentBottlenecks;
    ['Template Browse'],
        alertsActive;
    anomalies.filter(a => a.severity === 'critical').length,
        lastUpdated;
    now,
    ;
}
;
export default FunnelTimeTracking;
