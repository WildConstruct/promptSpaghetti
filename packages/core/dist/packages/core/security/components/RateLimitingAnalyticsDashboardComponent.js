import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Rate Limiting Analytics Dashboard React Component
 * Task: E31-1753313263523-692B39 - Create rate limiting analytics dashboard
 * Epic 31: Security Intelligence Platform
 *
 * Advanced React component providing comprehensive security analytics dashboard
 * with real-time monitoring, predictive insights, and actionable intelligence.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ThreatLevel } from '../RateLimitingService';
 > ;
// ========================================
// Main Dashboard Component
// ========================================
export const RateLimitingAnalyticsDashboardComponent = ({
    analyticsDashboard,
    className = '',
    theme = 'light',
    refreshInterval = 10,
    enableRealTimeUpdates = true,
    showAdvancedFeatures = true
});
{
    // Component state
    const [securityAnalytics, setSecurityAnalytics] = useState(null);
    const [predictiveInsights, setPredictiveInsights] = useState(null);
    const [dashboardVisualization, setDashboardVisualization] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [selectedView, setSelectedView] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [error, setError] = useState(null);
    // Refs for cleanup
    const updateTimerRef = useRef(null);
    const mountedRef = useRef(true);
    // ========================================
    // Data Loading and Updates
    // ========================================
    const loadAnalyticsData = useCallback(async () => {
        if (!mountedRef.current)
            return;
        try {
            setIsLoading(true);
            setError(null);
            const summary = analyticsDashboard.getAnalyticsSummary();
            if (mountedRef.current) {
                setSecurityAnalytics(summary.securityAnalytics);
                setPredictiveInsights(summary.predictiveInsights);
                setDashboardVisualization(summary.dashboardVisualization);
                setLastUpdate(new Date());
            }
            try { }
            catch (err) {
                if (mountedRef.current) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
                    setError(errorMessage);
                }
                try { }
                finally {
                    if (mountedRef.current) {
                        setIsLoading(false);
                    }
                    [analyticsDashboard];
                }
            }
        }
        finally { }
    });
    // Set up real-time updates
    useEffect(() => {
        loadAnalyticsData();
        if (enableRealTimeUpdates) {
            updateTimerRef.current = setInterval(loadAnalyticsData, refreshInterval * 1000);
            return () => {
                if (updateTimerRef.current) {
                    clearInterval(updateTimerRef.current);
                }
                ;
            }, [loadAnalyticsData, enableRealTimeUpdates, refreshInterval];
        }
    });
    // Listen for analytics events
    useEffect(() => {
        const handleAnalyticsProcessed = () => {
            if (mountedRef.current) {
                loadAnalyticsData();
            }
            ;
            const handleAnalyticsError = (errorData) => {
                if (mountedRef.current) {
                    const errorMessage = errorData.error instanceof Error ?  : ;
                    errorData.error.message;
                    'Analytics processing error';
                    setError(errorMessage);
                }
                ;
                analyticsDashboard.on('analyticsProcessed', handleAnalyticsProcessed);
                analyticsDashboard.on('analyticsError', handleAnalyticsError);
                return () => {
                    analyticsDashboard.off('analyticsProcessed', handleAnalyticsProcessed);
                    analyticsDashboard.off('analyticsError', handleAnalyticsError);
                };
            }, [analyticsDashboard, loadAnalyticsData];
        };
    });
    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    // ========================================
    // Data Processing and Calculations
    // ========================================
    const metricCards = useMemo(() => {
        if (!securityAnalytics)
            return [];
        const cards = [];
        // System Health Card
        cards.push({});
        id: 'system-health',
            title;
        'System Health',
            value;
        securityAnalytics.performanceAnalytics.systemHealth.overallScore,
            unit;
        '%',
            trend;
        securityAnalytics.performanceAnalytics.systemHealth.overallScore > 85 ? 'up' : 'down',
            trendValue;
        2.3,
            status;
        securityAnalytics.performanceAnalytics.systemHealth.overallScore > 90 ? 'good' : ,
            securityAnalytics.performanceAnalytics.systemHealth.overallScore > 75 ? 'warning' : 'critical',
            description;
        'Overall system health and performance score',
        ;
    });
    // Threat Level Card
    const threatLevelMap = {
        [ThreatLevel.LOW]: { value: 1, color: 'good' },
        [ThreatLevel.MEDIUM]: { value: 2, color: 'warning' },
        [ThreatLevel.HIGH]: { value: 3, color: 'critical' },
        [ThreatLevel.CRITICAL]: { value: 4, color: 'critical' }
    };
    const currentThreat = threatLevelMap[securityAnalytics.threatAnalysis.currentThreatLevel];
    cards.push({});
    id: 'threat-level',
        title;
    'Threat Level',
        value;
    securityAnalytics.threatAnalysis.currentThreatLevel.toUpperCase(),
        trend;
    'stable',
        trendValue;
    0,
        status;
    currentThreat.color,
        description;
    'Current system threat assessment level',
    ;
}
;
// Capacity Utilization Card
cards.push({});
id: 'capacity',
    title;
'Capacity',
    value;
securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity,
    unit;
'%',
    trend;
securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity > 80 ? 'up' : 'stable',
    trendValue;
5.2,
    status;
securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity > 85 ? 'critical' : ,
    securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity > 70 ? 'warning' : 'good',
    description;
'Current system capacity utilization',
;
;
// Revenue Impact Card
cards.push({});
id: 'revenue-impact',
    title;
'Security ROI',
    value;
securityAnalytics.businessIntelligence.revenueImpact.securityROI.toFixed(0),
    unit;
'%',
    trend;
'up',
    trendValue;
12.8,
    status;
securityAnalytics.businessIntelligence.revenueImpact.securityROI > 200 ? 'good' : 'warning',
    description;
'Return on investment from security measures',
;
;
// Attack Patterns Card
cards.push({});
id: 'attack-patterns',
    title;
'Active Threats',
    value;
securityAnalytics.threatAnalysis.attackPatterns.length,
    trend;
securityAnalytics.threatAnalysis.attackPatterns.length > 2 ? 'up' : 'stable',
    trendValue;
securityAnalytics.threatAnalysis.attackPatterns.length,
    status;
securityAnalytics.threatAnalysis.attackPatterns.length > 3 ? 'critical' : ,
    securityAnalytics.threatAnalysis.attackPatterns.length > 1 ? 'warning' : 'good',
    description;
'Number of detected attack patterns',
;
;
// Response Time SLA Card
cards.push({});
id: 'response-sla',
    title;
'Response SLA',
    value;
securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance,
    unit;
'%',
    trend;
securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance > 95 ? 'up' : 'down',
    trendValue;
-1.2,
    status;
securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance > 95 ? 'good' : ,
    securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance > 85 ? 'warning' : 'critical',
    description;
'Response time SLA compliance percentage',
;
;
return cards;
[securityAnalytics];
;
const alertSummary = useMemo(() => {
    if (!dashboardVisualization) {
        return {
            total: 0,
            byType: {},
            bySeverity: {},
            recent: []
        };
        const alerts = dashboardVisualization.alertPanels;
        const byType = {};
        const bySeverity = {};
        alerts.forEach(alert => { });
        byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
        bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    }
});
const recent = alerts;
sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)
    .map(alert => ({}), id, alert.panelId, type, alert.alertType, severity, alert.severity, message, alert.message, timestamp, alert.timestamp);
;
return {
    total: alerts.length,
    byType,
    bySeverity,
    recent
};
[dashboardVisualization];
;
// ========================================
// Event Handlers
// ========================================
const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    loadAnalyticsData();
};
const handleViewChange = (view) => {
    setSelectedView(view);
};
const handleRefresh = () => {
    loadAnalyticsData();
};
const handleExportData = async (format) => {
    try {
        const summary = analyticsDashboard.getAnalyticsSummary();
        let exportData;
        let mimeType;
        let filename;
        switch (format) {
            case 'json':
                exportData = JSON.stringify(summary, null, 2);
                mimeType = 'application/json';
                filename = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        }
        break;
    }
    finally {
    }
};
'csv';
exportData = convertToCSV(summary);
mimeType = 'text/csv';
filename = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
break;
'pdf';
exportData = generatePDFContent(summary);
mimeType = 'application/pdf';
filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
break;
throw new Error('Unsupported format');
const blob = new Blob([exportData], { type: mimeType });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
try { }
catch (error) {
    console.error('Export failed:', error);
    setError('Failed to export data');
}
;
// ========================================
// Render Helpers
// ========================================
const renderMetricCard = (metric) => ();
;
_jsxs("div", { className: `
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6
        ${metric.status === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
        ${metric.status === 'warning' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}
      `, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: metric.title }), _jsxs("div", { className: "flex items-baseline space-x-2 mt-2", children: [_jsx("p", { className: `text-3xl font-semibold ${metric.status === 'critical' ? 'text-red-600 dark:text-red-400' : ,
                                        metric.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ,
                                        'text-gray-900 dark:text-white',
                                    }`, children: metric.value }), metric.unit && ()
                                    < span, " className=\"text-sm text-gray-500 dark:text-gray-400\">", metric.unit] }), ")}"] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: metric.description })] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [_jsxs("div", { className: `
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${metric.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
            ${metric.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
            ${metric.trend === 'stable' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
          `, children: [metric.trend === 'up' && '↗', metric.trend === 'down' && '↘', metric.trend === 'stable' && '→', Math.abs(metric.trendValue), "%"] }), _jsx("div", { className: `
            w-3 h-3 rounded-full
            ${metric.status === 'good' ? 'bg-green-500' : ''}
            ${metric.status === 'warning' ? 'bg-yellow-500' : ''}
            ${metric.status === 'critical' ? 'bg-red-500' : ''}
          ` })] })] }, metric.id);
div >
;
;
const renderAlertPanel = () => ();
;
_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsxs("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: ["Active Alerts (", alertSummary.total, ")"] }) }), _jsxs("div", { className: "p-6", children: [alertSummary.total === 0 ? ()
                    < div : , " className=\"text-center py-8\">", _jsx("div", { className: "text-4xl mb-2", children: "\u2705" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No active alerts" })] }), ") : ()", _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "By Type" }), Object.entries(alertSummary.byType).map(([type, count]) => ()
                                    < div, key = { type }, className = "flex justify-between text-sm" >
                                    (_jsxs("span", { className: "text-gray-600 dark:text-gray-400 capitalize", children: [type.replace('_', ' '), ":"] })
                                        ,
                                            _jsx("span", { className: "font-medium", children: count })))] }), "))}"] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "By Severity" }), Object.entries(alertSummary.bySeverity).map(([severity, count]) => ()
                            < div, key = { severity }, className = "flex justify-between text-sm" >
                            (_jsxs("span", { className: `capitalize ${severity === 'critical' ? 'text-red-600 dark:text-red-400' : ,
                                    severity === 'error' ? 'text-red-500 dark:text-red-400' : ,
                                    severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ,
                                    'text-blue-600 dark:text-blue-400',
                                }`, children: [severity, ":"] })
                                ,
                                    _jsx("span", { className: "font-medium", children: count })))] }), "))}"] })] });
{ /* Recent Alerts */ }
_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Recent Alerts" }), _jsxs("div", { className: "space-y-2", children: [alertSummary.recent.map((alert) => ()
                    < div, key = { alert, : .id }, className = {} `
                      p-3 rounded-lg border-l-4 text-sm
                      ${alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                      ${alert.severity === 'error' ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
                      ${alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${alert.severity === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    `), ">", _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: alert.message }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [alert.type, " \u2022 ", alert.timestamp.toLocaleString()] })] }) })] }), "))}"] });
div >
;
div >
;
div >
;
div >
;
;
const renderThreatAnalysis = () => {
    if (!securityAnalytics)
        return null;
    return;
    _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Attack Patterns" }) }), _jsxs("div", { className: "p-6", children: [securityAnalytics.threatAnalysis.attackPatterns.length === 0 ? ()
                                < p : , " className=\"text-gray-500 dark:text-gray-400\">No attack patterns detected"] }), ") : ()", _jsxs("div", { className: "space-y-4", children: [securityAnalytics.threatAnalysis.attackPatterns.map((pattern) => ()
                                < div, key = { pattern, : .patternId }, className = {} `
                      p-4 rounded-lg border
                      ${pattern.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
                      ${pattern.severity === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : ''}
                      ${pattern.severity === 'medium' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${pattern.severity === 'low' ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''}
                    `), ">", _jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white capitalize", children: pattern.patternType.replace('_', ' ') }), _jsx("span", { className: `
                        px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${pattern.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                        ${pattern.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : ''}
                        ${pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                        ${pattern.severity === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                      `, children: pattern.severity })] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400 space-y-1", children: [_jsxs("div", { children: ["Frequency: ", pattern.frequency, " occurrences"] }), _jsxs("div", { children: ["Affected: ", pattern.affectedEndpoints.join(', ')] }), _jsxs("div", { children: ["Source IPs: ", pattern.sourceIPs.join(', ')] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "text-xs font-medium text-gray-700 dark:text-gray-300 mb-1", children: ", Countermeasures:" }), _jsxs("ul", { className: "text-xs text-gray-600 dark:text-gray-400 space-y-1", children: [pattern.countermeasures.map((measure, index) => ()
                                                < li, key = { index } > ), "\u2022 ", measure] }), "))}"] })] })] }), "))}"] });
};
div >
;
div >
    { /* Geographic Threats */}
    < div;
className = "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" >
    (_jsx("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Geographic Threats" }) })
        ,
            _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "space-y-4", children: securityAnalytics.threatAnalysis.geographicThreats.map((threat, index) => ()
                            < div, key = { index }, className = "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" >
                            (_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: [threat.country, " ", threat.region !== 'Various' && `(${threat.region})`] }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [threat.threatCount, " threats \u2022 ", threat.suspiciousActivities.join(', ')] })] })
                                ,
                                    _jsx("div", { className: `
                    px-2 py-1 rounded-full text-xs font-medium
                    ${threat.threatLevel === ThreatLevel.CRITICAL ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                    ${threat.threatLevel === ThreatLevel.HIGH ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : ''}
                    ${threat.threatLevel === ThreatLevel.MEDIUM ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                    ${threat.threatLevel === ThreatLevel.LOW ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : ''}
                  `, children: threat.threatLevel }))) }), "))}"] }));
div >
;
div >
;
div >
;
;
;
const renderPredictiveInsights = () => {
    if (!predictiveInsights || !showAdvancedFeatures)
        return null;
    return;
    _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Threat Predictions" }) }), _jsxs("div", { className: "p-6", children: [predictiveInsights.threatPredictions.length === 0 ? ()
                                < p : , " className=\"text-gray-500 dark:text-gray-400\">No threat predictions available"] }), ") : ()", _jsxs("div", { className: "space-y-4", children: [predictiveInsights.threatPredictions.map((prediction) => ()
                                < div, key = { prediction, : .predictionId }, className = {} `
                      p-4 rounded-lg border-l-4
                      ${prediction.impactEstimate === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                      ${prediction.impactEstimate === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}
                      ${prediction.impactEstimate === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${prediction.impactEstimate === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    `), ">", _jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white", children: prediction.predictedThreatType }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: [prediction.probability, "% confidence"] }), _jsx("span", { className: `
                          px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${prediction.impactEstimate === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                          ${prediction.impactEstimate === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : ''}
                          ${prediction.impactEstimate === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                          ${prediction.impactEstimate === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                        `, children: prediction.impactEstimate })] })] }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3", children: ["Expected ", prediction.timeframe, " \u2022 Model confidence: ", prediction.modelConfidence, "%"] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Recommended Actions:" }), _jsxs("ul", { className: "text-xs text-gray-600 dark:text-gray-400 space-y-1", children: [prediction.recommendedActions.map((action, index) => ()
                                                < li, key = { index } > ), "\u2022 ", action] }), "))}"] })] })] }), "))}"] });
};
div >
;
div >
    { /* Capacity Forecasts */}
    < div;
className = "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" >
    (_jsx("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Capacity Forecasts" }) })
        ,
            _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: predictiveInsights.capacityForecasts.map((forecast) => ()
                            < div, key = { forecast, : .forecastId }, className = "p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                (_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900 dark:text-white capitalize", children: forecast.metric }), _jsxs("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [forecast.confidence, "% confidence"] })] })
                                    ,
                                        _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400 space-y-1", children: [_jsxs("div", { children: ["Current: ", forecast.currentValue.toFixed(1)] }), _jsxs("div", { children: ["Predicted: ", forecast.predictedValue.toFixed(1)] }), _jsxs("div", { children: ["Horizon: ", forecast.forecastHorizon, " hours"] })] })
                                            ,
                                                _jsx("div", { className: "mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300", children: forecast.scalingRecommendation }))) }), "))}"] }));
div >
;
div >
;
div >
;
;
;
const renderControls = () => ();
;
_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("select", { value: selectedView, onChange: (e) => handleViewChange(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm", children: [_jsx("option", { value: "overview", children: "Overview" }), _jsx("option", { value: "security", children: "Security" }), _jsx("option", { value: "performance", children: "Performance" }), _jsx("option", { value: "business", children: "Business" }), showAdvancedFeatures && _jsx("option", { value: "predictive", children: "Predictive" })] }), _jsxs("select", { value: selectedTimeRange, onChange: (e) => handleTimeRangeChange(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm", children: [_jsx("option", { value: "1h", children: "Last Hour" }), _jsx("option", { value: "6h", children: "Last 6 Hours" }), _jsx("option", { value: "24h", children: "Last 24 Hours" }), _jsx("option", { value: "7d", children: "Last 7 Days" })] }), _jsxs("button", { onClick: handleRefresh, className: "px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-1", children: [_jsx("span", { children: "\uD83D\uDD04" }), _jsx("span", { children: "Refresh" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleExportData('json'), className: "px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md", children: "Export JSON" }), _jsx("button", { onClick: () => handleExportData('csv'), className: "px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md", children: "Export CSV" })] }), _jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2", children: [_jsxs("span", { children: ["Last updated: ", lastUpdate.toLocaleTimeString()] }), enableRealTimeUpdates && ()
                            < div, " className=\"flex items-center\">", _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" }), _jsx("span", { children: "Live" })] }), ")}"] })] });
div >
;
;
// ========================================
// Main Render
// ========================================
if (error) {
    return;
    _jsxs("div", { className: `p-8 ${className}`, children: ["}", _jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-red-800 dark:text-red-200 mb-2", children: "Analytics Dashboard Error" }), _jsx("p", { className: "text-red-700 dark:text-red-300 mb-4", children: error }), _jsx("button", { onClick: () => setError(null), className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm", children: "Dismiss" })] })] });
    ;
    if (isLoading && !securityAnalytics) {
        return;
        _jsxs("div", { className: `p-8 ${className}`, children: ["}", _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Loading analytics dashboard..." })] }) })] });
        ;
        return;
        _jsxs("div", { className: `p-6 ${className} ${theme === 'dark' ? 'dark' : ''}`, children: ["}", _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Security Analytics Dashboard" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mt-2", children: "Comprehensive security intelligence and predictive analytics platform" })] }), renderControls(), selectedView === 'overview' && ()
                            < div, " className=\"space-y-6\">", _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", children: metricCards.map(renderMetricCard) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: renderAlertPanel() }), _jsx("div", { className: "lg:col-span-2", children: renderThreatAnalysis() })] })] }), ")}", selectedView === 'security' && renderThreatAnalysis(), selectedView === 'predictive' && renderPredictiveInsights(), selectedView === 'performance' && ()
                    < div, " className=\"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6\">", _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u26A1" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "Performance Analytics" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Detailed performance metrics and analysis coming soon" })] })] });
    }
    {
        selectedView === 'business' && ()
            < div;
        className = "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6" >
            _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCBC" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "Business Intelligence" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Business impact analysis and ROI metrics coming soon" })] });
        div >
        ;
    }
    div >
    ;
    div >
    ;
    ;
}
;
// ========================================
// Utility Functions
// ========================================
function convertToCSV(data) {
    // Simple CSV conversion - in production, this would be more sophisticated
    const headers = ['Metric', 'Value', 'Status', 'Timestamp'];
    const rows = [];
    ['System Health', data.securityAnalytics?.performanceAnalytics?.systemHealth?.overallScore || 0, 'Active', new Date().toISOString()],
        ['Threat Level', data.securityAnalytics?.threatAnalysis?.currentThreatLevel || 'LOW', 'Active', new Date().toISOString()],
        ['Active Threats', data.securityAnalytics?.threatAnalysis?.attackPatterns?.length || 0, 'Active', new Date().toISOString()];
    ;
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    function generatePDFContent(data) {
        // Simple PDF content generation - in production, this would use a proper PDF library
        return `Analytics Report Generated: ${new Date().toISOString()}\n\nSystem Health: ${data.securityAnalytics?.performanceAnalytics?.systemHealth?.overallScore || 0}%\nThreat Level: ${data.securityAnalytics?.threatAnalysis?.currentThreatLevel || 'LOW'}\nActive Threats: ${data.securityAnalytics?.threatAnalysis?.attackPatterns?.length || 0}`;
    }
    export default RateLimitingAnalyticsDashboardComponent;
}
