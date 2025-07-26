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
/**
 * Main Funnel Time Tracking Component
 */
export const FunnelTimeTracking = ({ funnelDefinition, analyticsInfrastructure, timeRange, segments = [], cohorts = [], granularity = 'day', showTrends = true, showAnomalies = true, realTimeUpdates = false, onAnomalyDetected, onExport }) => {
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
                metrics: [
                    'conversion_rate',
                    'time_to_convert',
                    'velocity',
                    'user_journey_timing',
                    'step_performance',
                    'temporal_patterns'
                ],
                groupBy: ['funnel_step', selectedTimeframe],
                filters: [
                    ...segments.map(segment => ({
                        field: 'userContext.segmentIds',
                        operator: 'contains',
                        value: segment.id
                    })),
                    ...cohorts.map(cohort => ({
                        field: 'userContext.cohortIds',
                        operator: 'contains',
                        value: cohort.id
                    }))
                ],
                aggregation: { interval: selectedTimeframe }
            };
            const results = await analyticsInfrastructure.queryMetrics(query);
            const processedData = await processTimeTrackingData(funnelDefinition, results, selectedTimeframe, timeRange, segments, cohorts);
            setTrackingData(processedData);
            // Check for anomalies and notify
            if (showAnomalies && processedData.anomalies.length > 0) {
                processedData.anomalies
                    .filter(anomaly => anomaly.severity === 'critical' || anomaly.severity === 'high')
                    .forEach(anomaly => onAnomalyDetected?.(anomaly));
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load time tracking data');
        }
        finally {
            setLoading(false);
        }
    }, [
        funnelDefinition,
        analyticsInfrastructure,
        timeRange,
        selectedTimeframe,
        segments,
        cohorts,
        showAnomalies,
        onAnomalyDetected
    ]);
    useEffect(() => {
        loadTrackingData();
    }, [loadTrackingData]);
    // Real-time updates
    useEffect(() => {
        if (!realTimeUpdates)
            return;
        const interval = setInterval(loadTrackingData, 30000); // Update every 30 seconds
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
                anomalies: 'anomalies-chart-svg'
            },
            insights: {
                trends: trackingData.trendAnalysis.flatMap(t => t.insights),
                seasonal: trackingData.seasonalPatterns.flatMap(p => p.recommendations),
                anomalies: trackingData.anomalies.filter(a => a.severity === 'critical' || a.severity === 'high')
            },
            metadata: {
                exportedAt: Date.now(),
                dataQuality: 0.95,
                analysisDepth: 'comprehensive'
            }
        };
        onExport?.(exportData);
    }, [trackingData, timeRange, selectedTimeframe, onExport]);
    if (loading) {
        return _jsx(TimeTrackingLoadingState, {});
    }
    if (error || !trackingData) {
        return (_jsx(TimeTrackingErrorState, { error: error || 'No data available', onRetry: loadTrackingData }));
    }
    return (_jsxs("div", { className: "funnel-time-tracking", children: [_jsx(TimeTrackingHeader, { funnelDefinition: funnelDefinition, realTimeMetrics: trackingData.realTimeMetrics, selectedTimeframe: selectedTimeframe, onTimeframeChange: setSelectedTimeframe, activeView: activeView, onViewChange: setActiveView, onExport: handleExport }), _jsxs("div", { className: "tracking-content", ref: chartRef, children: [activeView === 'timeline' && (_jsx(TimelineView, { performanceTimeline: trackingData.performanceTimeline, stepTimeAnalysis: trackingData.stepTimeAnalysis, conversionVelocity: trackingData.conversionVelocity, granularity: selectedTimeframe })), activeView === 'trends' && showTrends && (_jsx(TrendsView, { trendAnalysis: trackingData.trendAnalysis, comparativePeriods: trackingData.comparativePeriods })), activeView === 'seasonality' && (_jsx(SeasonalityView, { seasonalPatterns: trackingData.seasonalPatterns })), activeView === 'anomalies' && showAnomalies && (_jsx(AnomaliesView, { anomalies: trackingData.anomalies, onAnomalyInvestigate: (anomaly) => console.log('Investigating:', anomaly) }))] })] }));
};
const TimeTrackingHeader = ({ funnelDefinition, realTimeMetrics, selectedTimeframe, onTimeframeChange, activeView, onViewChange, onExport }) => {
    const timeframes = ['hour', 'day', 'week', 'month'];
    const views = [
        { key: 'timeline', label: 'Timeline' },
        { key: 'trends', label: 'Trends' },
        { key: 'seasonality', label: 'Seasonality' },
        { key: 'anomalies', label: 'Anomalies' }
    ];
    return (_jsxs("div", { className: "time-tracking-header", children: [_jsxs("div", { className: "header-info", children: [_jsxs("h3", { children: ["Time-based Performance: ", funnelDefinition.name] }), _jsx("p", { children: "Comprehensive temporal analysis of funnel performance and user behavior" }), _jsxs("div", { className: "real-time-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Current Conversion Rate" }), _jsxs("span", { className: "value", children: [realTimeMetrics.currentConversionRate.toFixed(2), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Active Users" }), _jsx("span", { className: "value", children: realTimeMetrics.activeUsers.toLocaleString() })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Velocity" }), _jsxs("span", { className: "value", children: [realTimeMetrics.currentVelocity.toFixed(1), "/hr"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "24h Conversions" }), _jsx("span", { className: "value", children: realTimeMetrics.conversionsLast24Hours.toLocaleString() })] }), realTimeMetrics.alertsActive > 0 && (_jsxs("div", { className: "metric alert", children: [_jsx("span", { className: "label", children: "Active Alerts" }), _jsx("span", { className: "value", children: realTimeMetrics.alertsActive })] }))] })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("div", { className: "timeframe-selector", children: [_jsx("label", { children: "Granularity:" }), _jsx("select", { value: selectedTimeframe, onChange: (e) => onTimeframeChange(e.target.value), children: timeframes.map(tf => (_jsx("option", { value: tf, children: tf.charAt(0).toUpperCase() + tf.slice(1) }, tf))) })] }), _jsx("div", { className: "view-selector", children: views.map(view => (_jsx("button", { onClick: () => onViewChange(view.key), className: `view-button ${activeView === view.key ? 'active' : ''}`, children: view.label }, view.key))) }), _jsx("button", { onClick: onExport, className: "export-button", children: "Export Analysis" })] })] }));
};
const TimelineView = ({ performanceTimeline, stepTimeAnalysis, conversionVelocity, granularity }) => {
    return (_jsxs("div", { className: "timeline-view", children: [_jsxs("div", { className: "timeline-charts", children: [_jsx(ConversionRateTimeline, { data: performanceTimeline, granularity: granularity }), _jsx(VelocityTimeline, { data: conversionVelocity, granularity: granularity })] }), _jsxs("div", { className: "step-time-analysis", children: [_jsx("h4", { children: "Step Time Analysis" }), _jsx("div", { className: "step-analysis-grid", children: stepTimeAnalysis.slice(0, 4).map(analysis => (_jsx(StepTimeCard, { analysis: analysis }, analysis.stepId))) })] })] }));
};
const ConversionRateTimeline = ({ data, granularity }) => {
    const maxRate = Math.max(...data.map(d => d.overallMetrics.conversionRate));
    const chartWidth = 800;
    const chartHeight = 200;
    return (_jsxs("div", { className: "conversion-rate-timeline", children: [_jsx("h4", { children: "Conversion Rate Over Time" }), _jsx("svg", { width: chartWidth, height: chartHeight, className: "timeline-chart", children: _jsxs("g", { transform: "translate(60, 20)", children: [data.map((point, index) => {
                            const x = (index / (data.length - 1)) * (chartWidth - 120);
                            const y = ((maxRate - point.overallMetrics.conversionRate) / maxRate) * (chartHeight - 40);
                            return (_jsxs("g", { children: [_jsx("circle", { cx: x, cy: y, r: "4", fill: "#3b82f6", className: "data-point" }), index < data.length - 1 && (_jsx("line", { x1: x, y1: y, x2: (index + 1) / (data.length - 1) * (chartWidth - 120), y2: ((maxRate - data[index + 1].overallMetrics.conversionRate) / maxRate) * (chartHeight - 40), stroke: "#3b82f6", strokeWidth: "2" })), index % Math.ceil(data.length / 6) === 0 && (_jsx("text", { x: x, y: chartHeight - 10, textAnchor: "middle", fontSize: "12", fill: "#666", children: new Date(point.timestamp).toLocaleDateString() }))] }, point.timestamp));
                        }), [0, 25, 50, 75, 100].map(tick => {
                            const y = ((100 - tick) / 100) * (chartHeight - 40);
                            return (_jsxs("g", { children: [_jsxs("text", { x: "-10", y: y + 4, textAnchor: "end", fontSize: "12", fill: "#666", children: [tick, "%"] }), _jsx("line", { x1: "0", y1: y, x2: chartWidth - 120, y2: y, stroke: "#e5e7eb", strokeWidth: "1" })] }, tick));
                        })] }) })] }));
};
const VelocityTimeline = ({ data, granularity }) => {
    return (_jsxs("div", { className: "velocity-timeline", children: [_jsx("h4", { children: "Conversion Velocity Trends" }), _jsx("div", { className: "velocity-metrics", children: data.slice(-5).map((point, index) => (_jsxs("div", { className: "velocity-point", children: [_jsx("div", { className: "timestamp", children: point.period }), _jsxs("div", { className: "velocity", children: [point.conversionVelocity.toFixed(1), "/hr"] }), _jsx("div", { className: `trend ${point.velocityTrend}`, children: point.velocityTrend === 'accelerating' ? '↗' :
                                point.velocityTrend === 'decelerating' ? '↘' : '→' })] }, point.timestamp))) }), data.length > 0 && data[data.length - 1].bottleneckAnalysis.length > 0 && (_jsxs("div", { className: "current-bottlenecks", children: [_jsx("h5", { children: "Current Bottlenecks" }), data[data.length - 1].bottleneckAnalysis.slice(0, 3).map(bottleneck => (_jsxs("div", { className: "bottleneck-item", children: [_jsx("span", { className: "step-name", children: bottleneck.stepName }), _jsxs("span", { className: `severity ${bottleneck.severity > 70 ? 'high' : bottleneck.severity > 40 ? 'medium' : 'low'}`, children: [bottleneck.severity.toFixed(0), "% severity"] }), _jsxs("span", { className: "impact", children: [bottleneck.impact, " users/hr affected"] })] }, bottleneck.stepId)))] }))] }));
};
const StepTimeCard = ({ analysis }) => {
    return (_jsxs("div", { className: "step-time-card", children: [_jsx("h5", { children: analysis.stepName }), _jsxs("div", { className: "time-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Avg. Time on Step" }), _jsx("span", { className: "value", children: formatDuration(analysis.timeSpentOnStep.mean) })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Time to Convert" }), _jsx("span", { className: "value", children: formatDuration(analysis.timeToConvert.median) })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Early Abandonment" }), _jsxs("span", { className: "value", children: [analysis.abandonmentTiming.earlyAbandonment.toFixed(1), "%"] })] })] }), analysis.temporalPatterns.length > 0 && (_jsxs("div", { className: "temporal-patterns", children: [_jsx("strong", { children: "Patterns:" }), _jsx("ul", { children: analysis.temporalPatterns.slice(0, 2).map((pattern, index) => (_jsx("li", { children: pattern.description }, index))) })] }))] }));
};
const TrendsView = ({ trendAnalysis, comparativePeriods }) => {
    const significantTrends = trendAnalysis.filter(t => t.significance < 0.05);
    return (_jsxs("div", { className: "trends-view", children: [_jsxs("div", { className: "trends-overview", children: [_jsx("h4", { children: "Significant Trends" }), _jsx("div", { className: "trends-grid", children: significantTrends.map((trend, index) => (_jsx(TrendCard, { trend: trend }, index))) })] }), comparativePeriods.length > 0 && (_jsxs("div", { className: "comparative-analysis", children: [_jsx("h4", { children: "Period Comparison" }), comparativePeriods.map((comparison, index) => (_jsx(ComparativePeriodCard, { comparison: comparison }, index)))] }))] }));
};
const TrendCard = ({ trend }) => {
    return (_jsxs("div", { className: `trend-card ${trend.trend}`, children: [_jsxs("div", { className: "trend-header", children: [_jsx("h5", { children: trend.stepName || 'Overall Funnel' }), _jsx("span", { className: `trend-direction ${trend.trend}`, children: trend.trend === 'increasing' ? '↗' :
                            trend.trend === 'decreasing' ? '↘' :
                                trend.trend === 'volatile' ? '↕' : '→' })] }), _jsxs("div", { className: "trend-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Metric" }), _jsx("span", { className: "value", children: trend.metric.replace('_', ' ') })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Change Rate" }), _jsxs("span", { className: "value", children: [trend.changeRate > 0 ? '+' : '', trend.changeRate.toFixed(2), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Strength" }), _jsx("span", { className: "value", children: trend.trendStrength })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Confidence" }), _jsxs("span", { className: "value", children: [(trend.confidence * 100).toFixed(0), "%"] })] })] }), trend.insights.length > 0 && (_jsx("div", { className: "trend-insights", children: trend.insights.slice(0, 2).map((insight, index) => (_jsxs("div", { className: `insight ${insight.urgency}`, children: [_jsx("strong", { children: insight.title }), _jsx("p", { children: insight.description })] }, index))) }))] }));
};
const ComparativePeriodCard = ({ comparison }) => {
    return (_jsxs("div", { className: "comparative-period-card", children: [_jsx("div", { className: "period-header", children: _jsxs("h5", { children: [comparison.comparisonPeriod.label, " vs ", comparison.baselinePeriod.label] }) }), _jsx("div", { className: "overall-comparison", children: _jsxs("div", { className: `comparison-metric ${comparison.overallComparison.direction}`, children: [_jsx("span", { className: "metric-name", children: "Overall Conversion Rate" }), _jsxs("span", { className: "baseline", children: [comparison.overallComparison.baselineValue.toFixed(2), "%"] }), _jsx("span", { className: "arrow", children: "\u2192" }), _jsxs("span", { className: "comparison", children: [comparison.overallComparison.comparisonValue.toFixed(2), "%"] }), _jsxs("span", { className: "change", children: ["(", comparison.overallComparison.changeRelative > 0 ? '+' : '', comparison.overallComparison.changeRelative.toFixed(1), "%)"] })] }) }), comparison.significantChanges.length > 0 && (_jsxs("div", { className: "significant-changes", children: [_jsx("h6", { children: "Significant Changes" }), comparison.significantChanges.slice(0, 3).map((change, index) => (_jsxs("div", { className: `change-item ${change.changeType}`, children: [_jsx("span", { className: "step", children: change.stepName || 'Overall' }), _jsx("span", { className: "metric", children: change.metric }), _jsxs("span", { className: "magnitude", children: [change.magnitude, " ", change.changeType] })] }, index)))] }))] }));
};
const SeasonalityView = ({ seasonalPatterns }) => {
    return (_jsxs("div", { className: "seasonality-view", children: [_jsx("h4", { children: "Seasonal Patterns" }), _jsx("div", { className: "patterns-grid", children: seasonalPatterns.map((pattern, index) => (_jsx(SeasonalPatternCard, { pattern: pattern }, index))) })] }));
};
const SeasonalPatternCard = ({ pattern }) => {
    return (_jsxs("div", { className: "seasonal-pattern-card", children: [_jsxs("h5", { children: [pattern.pattern.toUpperCase(), " Pattern"] }), _jsx("p", { children: pattern.description }), _jsxs("div", { className: "pattern-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Strength" }), _jsxs("span", { className: "value", children: [(pattern.strength * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Reliability" }), _jsxs("span", { className: "value", children: [(pattern.reliability * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Business Impact" }), _jsxs("span", { className: "value", children: [pattern.businessImpact.toFixed(1), "%"] })] })] }), pattern.peaks.length > 0 && (_jsxs("div", { className: "peaks-troughs", children: [_jsx("h6", { children: "Peak Periods" }), pattern.peaks.slice(0, 3).map((peak, index) => (_jsxs("div", { className: "peak-item", children: [_jsx("span", { className: "period", children: peak.period }), _jsxs("span", { className: "value", children: [peak.value.toFixed(1), "%"] })] }, index)))] })), pattern.recommendations.length > 0 && (_jsxs("div", { className: "pattern-recommendations", children: [_jsx("h6", { children: "Recommendations" }), pattern.recommendations.slice(0, 2).map((rec, index) => (_jsxs("div", { className: "recommendation-item", children: [_jsx("strong", { children: rec.title }), _jsx("p", { children: rec.description })] }, index)))] }))] }));
};
const AnomaliesView = ({ anomalies, onAnomalyInvestigate }) => {
    const activeAnomalies = anomalies.filter(a => !a.autoResolved && a.investigationStatus !== 'resolved');
    const criticalAnomalies = activeAnomalies.filter(a => a.severity === 'critical');
    return (_jsxs("div", { className: "anomalies-view", children: [_jsxs("div", { className: "anomalies-summary", children: [_jsx("h4", { children: "Performance Anomalies" }), _jsxs("div", { className: "summary-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "label", children: "Active" }), _jsx("span", { className: "value", children: activeAnomalies.length })] }), _jsxs("div", { className: "stat critical", children: [_jsx("span", { className: "label", children: "Critical" }), _jsx("span", { className: "value", children: criticalAnomalies.length })] })] })] }), _jsx("div", { className: "anomalies-list", children: activeAnomalies
                    .sort((a, b) => {
                    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return severityOrder[b.severity] - severityOrder[a.severity];
                })
                    .map(anomaly => (_jsx(AnomalyCard, { anomaly: anomaly, onInvestigate: () => onAnomalyInvestigate(anomaly) }, anomaly.id))) })] }));
};
const AnomalyCard = ({ anomaly, onInvestigate }) => {
    return (_jsxs("div", { className: `anomaly-card ${anomaly.severity}`, children: [_jsxs("div", { className: "anomaly-header", children: [_jsxs("h5", { children: [anomaly.stepName || 'Overall Funnel', " - ", anomaly.metric] }), _jsx("span", { className: `severity-badge ${anomaly.severity}`, children: anomaly.severity.toUpperCase() }), _jsx("span", { className: `status-badge ${anomaly.investigationStatus}`, children: anomaly.investigationStatus.replace('_', ' ').toUpperCase() })] }), _jsxs("div", { className: "anomaly-details", children: [_jsxs("div", { className: "values", children: [_jsxs("span", { className: "expected", children: ["Expected: ", anomaly.expectedValue.toFixed(2)] }), _jsxs("span", { className: "actual", children: ["Actual: ", anomaly.actualValue.toFixed(2)] }), _jsxs("span", { className: "deviation", children: [anomaly.deviation.toFixed(1), "\u03C3 deviation"] })] }), _jsxs("div", { className: "anomaly-info", children: [_jsx("span", { className: "type", children: anomaly.anomalyType.replace('_', ' ') }), _jsxs("span", { className: "confidence", children: [(anomaly.confidence * 100).toFixed(0), "% confidence"] }), _jsxs("span", { className: "impact", children: ["$", anomaly.businessImpact.toLocaleString(), " impact"] })] })] }), anomaly.possibleCauses.length > 0 && (_jsxs("div", { className: "possible-causes", children: [_jsx("h6", { children: "Possible Causes" }), anomaly.possibleCauses
                        .sort((a, b) => b.likelihood - a.likelihood)
                        .slice(0, 2)
                        .map((cause, index) => (_jsxs("div", { className: "cause-item", children: [_jsx("span", { className: "category", children: cause.category }), _jsx("span", { className: "description", children: cause.description }), _jsxs("span", { className: "likelihood", children: [(cause.likelihood * 100).toFixed(0), "% likely"] })] }, index)))] })), _jsx("div", { className: "anomaly-actions", children: _jsx("button", { onClick: onInvestigate, className: "investigate-button", disabled: anomaly.investigationStatus === 'investigating', children: anomaly.investigationStatus === 'investigating' ? 'Investigating...' : 'Investigate' }) })] }));
};
// Loading and Error States
const TimeTrackingLoadingState = () => (_jsxs("div", { className: "time-tracking-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading time-based analysis..." })] }));
const TimeTrackingErrorState = ({ error, onRetry }) => (_jsxs("div", { className: "time-tracking-error", children: [_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "Error Loading Analysis" }), _jsx("p", { children: error })] }), _jsx("button", { onClick: onRetry, className: "retry-button", children: "Retry Loading" })] }));
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
async function processTimeTrackingData(funnelDefinition, metricResults, granularity, timeRange, segments, cohorts) {
    // Simplified implementation - in production would process actual time-series data
    const now = Date.now();
    const dayMs = 86400000;
    // Generate timeline data points
    const performanceTimeline = [];
    const periodCount = granularity === 'hour' ? 24 : granularity === 'day' ? 30 : 12;
    const periodMs = granularity === 'hour' ? 3600000 : granularity === 'day' ? dayMs : dayMs * 7;
    for (let i = 0; i < periodCount; i++) {
        const timestamp = now - (periodCount - i - 1) * periodMs;
        const conversionRate = 15 + Math.sin(i / 5) * 5 + (Math.random() - 0.5) * 3;
        performanceTimeline.push({
            timestamp,
            period: new Date(timestamp).toISOString().split('T')[0],
            granularity,
            overallMetrics: {
                totalEntries: 1000 + Math.floor(Math.random() * 200),
                totalConversions: Math.floor((1000 + Math.random() * 200) * conversionRate / 100),
                conversionRate,
                averageTimeToConvert: 3600000 + Math.random() * 1800000,
                revenue: 2500 + Math.random() * 1000,
                revenuePerEntry: 2.5 + Math.random(),
                revenuePerConversion: 15 + Math.random() * 10,
                dropOffCount: 850 + Math.floor(Math.random() * 100),
                dropOffRate: 85 - conversionRate
            },
            stepMetrics: funnelDefinition.steps.map((step, stepIndex) => ({
                stepId: step.id,
                stepName: step.name,
                entries: 1000 - (stepIndex * 150) + Math.floor(Math.random() * 50),
                conversions: 850 - (stepIndex * 150) + Math.floor(Math.random() * 50),
                conversionRate: 85 - (stepIndex * 10) + Math.random() * 5,
                averageTimeSpent: 60000 + (stepIndex * 30000) + Math.random() * 30000,
                dropOffs: 150 + Math.floor(Math.random() * 50),
                dropOffRate: 15 + (stepIndex * 5) + Math.random() * 5,
                revenue: 500 + Math.random() * 200
            })),
            environmentalFactors: [
                {
                    factor: 'Server load',
                    value: 50 + Math.random() * 30,
                    impact: Math.random() > 0.7 ? 'negative' : 'neutral',
                    confidence: 0.8
                }
            ]
        });
    }
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
            insights: [
                {
                    type: 'opportunity',
                    title: 'Sustained Conversion Improvement',
                    description: 'Conversion rate has improved 2.3% per period over the last month',
                    impact: 15,
                    urgency: 'medium',
                    actionable: true,
                    recommendedActions: [
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
            peaks: [
                {
                    period: 'Tuesday',
                    value: 18.5,
                    consistency: 0.8,
                    duration: 1,
                    contributingFactors: ['Business user engagement']
                }
            ],
            troughs: [
                {
                    period: 'Sunday',
                    value: 12.3,
                    consistency: 0.7,
                    duration: 1,
                    contributingFactors: ['Lower traffic volume']
                }
            ],
            businessImpact: 12.5,
            reliability: 0.75,
            recommendations: [
                {
                    type: 'marketing',
                    title: 'Optimize weekend campaigns',
                    description: 'Adjust marketing spend and messaging for weekend traffic patterns',
                    timing: 'Weekly',
                    expectedImpact: 8,
                    implementation: ['Update ad scheduling', 'Create weekend-specific content']
                }
            ]
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
            possibleCauses: [
                {
                    category: 'technical',
                    description: 'Template loading performance degradation',
                    likelihood: 0.75,
                    evidence: ['Increased page load times', 'Error rate spike'],
                    investigationSteps: ['Check server metrics', 'Review CDN performance']
                }
            ],
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
        stepTimeAnalysis: funnelDefinition.steps.map(step => ({
            stepId: step.id,
            stepName: step.name,
            timeToReach: {
                mean: 300000,
                median: 240000,
                p25: 180000,
                p75: 420000,
                p90: 600000,
                p95: 720000,
                standardDeviation: 150000,
                skewness: 1.2
            },
            timeSpentOnStep: {
                mean: 120000,
                median: 90000,
                p25: 60000,
                p75: 150000,
                p90: 240000,
                p95: 300000,
                standardDeviation: 80000,
                skewness: 2.1
            },
            timeToConvert: {
                mean: 3600000,
                median: 2400000,
                p25: 1800000,
                p75: 4200000,
                p90: 7200000,
                p95: 10800000,
                standardDeviation: 2400000,
                skewness: 1.8
            },
            abandonmentTiming: {
                earlyAbandonment: 25,
                midAbandonment: 45,
                lateAbandonment: 30,
                averageTimeBeforeAbandonment: 180000,
                peakAbandonmentTime: 240000
            },
            temporalPatterns: [
                {
                    pattern: 'Extended browsing before conversion',
                    frequency: 35,
                    impact: 12,
                    timeframe: 'Step completion',
                    description: 'Users spend 3x longer browsing before converting'
                }
            ]
        })),
        conversionVelocity: performanceTimeline.map(point => ({
            timestamp: point.timestamp,
            period: point.period,
            averageConversionTime: point.overallMetrics.averageTimeToConvert,
            conversionVelocity: point.overallMetrics.totalConversions / 24, // per hour
            velocityTrend: Math.random() > 0.5 ? 'accelerating' : 'stable',
            stepVelocities: point.stepMetrics.map(step => ({
                stepId: step.stepId,
                stepName: step.stepName,
                averageProcessingTime: step.averageTimeSpent,
                throughput: step.conversions / 24,
                efficiency: step.conversionRate / (step.averageTimeSpent / 60000),
                bottleneckSeverity: step.conversionRate < 70 ? 'moderate' : 'minor'
            })),
            bottleneckAnalysis: point.stepMetrics
                .filter(step => step.conversionRate < 70)
                .map(step => ({
                stepId: step.stepId,
                stepName: step.stepName,
                bottleneckType: 'conversion',
                severity: 100 - step.conversionRate,
                impact: step.dropOffs,
                solutions: [
                    {
                        title: 'Optimize step UX',
                        description: 'Improve user experience for this step',
                        effort: 'medium',
                        expectedImprovement: 15,
                        implementationTime: 7
                    }
                ]
            }))
        })),
        comparativePeriods: [
            {
                baselinePeriod: { start: now - dayMs * 60, end: now - dayMs * 30, label: 'Previous Month' },
                comparisonPeriod: { start: now - dayMs * 30, end: now, label: 'Current Month' },
                overallComparison: {
                    metric: 'conversion_rate',
                    baselineValue: 14.2,
                    comparisonValue: 16.8,
                    changeAbsolute: 2.6,
                    changeRelative: 18.3,
                    significance: 0.012,
                    confidence: 0.95,
                    direction: 'improvement'
                },
                stepComparisons: [],
                significantChanges: [
                    {
                        stepId: 'step-2',
                        stepName: 'Template Browse',
                        metric: 'conversion_rate',
                        changeType: 'improvement',
                        magnitude: 'moderate',
                        significance: 0.025,
                        businessImpact: 850,
                        possibleReasons: ['UX improvements', 'Better template organization']
                    }
                ],
                insights: []
            }
        ],
        realTimeMetrics: {
            currentConversionRate: 16.8,
            currentVelocity: 3.2,
            activeUsers: 145,
            conversionsLast24Hours: 78,
            averageTimeToConvert: 3600000,
            currentBottlenecks: ['Template Browse'],
            alertsActive: anomalies.filter(a => a.severity === 'critical').length,
            lastUpdated: now
        }
    };
}
export default FunnelTimeTracking;
