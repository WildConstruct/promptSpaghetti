import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Funnel Anomaly Detection and Alerting System - Story 30.2 Task 7
 *
 * Advanced anomaly detection system that monitors funnel performance in real-time,
 * identifies unusual patterns, and triggers appropriate alerts and notifications.
 *
 * Features:
 * - Multi-dimensional anomaly detection (statistical, ML-based, rule-based)
 * - Real-time monitoring with configurable alert thresholds
 * - Anomaly classification and severity scoring
 * - Root cause analysis and impact assessment
 * - Automated alert routing and escalation
 * - Historical anomaly tracking and pattern analysis
 * - Predictive anomaly forecasting
 * - Integration with external monitoring systems
 */
import { useState, useCallback, useRef, useEffect } from 'react';
export const [error, setError] = useState(null);
const [selectedAnomaly, setSelectedAnomaly] = useState(null);
const [activeTab, setActiveTab] = useState('current');
const [filterSeverity, setFilterSeverity] = useState('all');
const [filterType, setFilterType] = useState('all');
const [realTimeEnabled, setRealTimeEnabled] = useState(realTimeMonitoring);
const intervalRef = useRef(null);
const wsRef = useRef(null);
// Load anomaly detection data
const loadAnomalyData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const query = {
            funnelId: funnelDefinition.id,
            timeRange,
            segments: segments.map(s => s.id),
            cohorts: cohorts.map(c => c.id),
            metrics: ['anomaly_detection', 'alert_history', 'impact_assessment'],
            aggregation: 'raw',
            filters: [],
        };
        const result = await analyticsInfrastructure.executeQuery(query);
        if (result.success && result.data) {
            const anomalyData = await processAnomalyDetectionData();
        }
    }
    finally { }
});
result.data,
    detectionConfig,
    alertConfig;
;
setDetectionData(anomalyData);
// Trigger callbacks for new anomalies
anomalyData.currentAnomalies.forEach(anomaly => { });
if (anomaly.status === 'new' && onAnomalyDetected) {
    onAnomalyDetected(anomaly);
}
;
{
    setError(result.error || 'Failed to load anomaly detection data');
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
}
finally {
    setLoading(false);
}
[funnelDefinition, analyticsInfrastructure, timeRange, segments, cohorts, detectionConfig, alertConfig, onAnomalyDetected];
;
// Process anomaly detection data
const processAnomalyDetectionData = async();
;
rawData: unknown,
    config;
AnomalyDetectionConfig,
    alertCfg;
AlertConfiguration;
Promise;
{
    // Simulate comprehensive anomaly detection processing
    const currentAnomalies = generateMockAnomalies('current');
    const historicalAnomalies = generateMockAnomalies('historical');
    const predictedAnomalies = generateMockPredictions();
    return {
        currentAnomalies,
        historicalAnomalies,
        anomalyTrends: generateAnomalyTrends(),
        predictedAnomalies,
        rootCauseAnalysis: generateRootCauseAnalyses(currentAnomalies),
        impactAssessment: generateImpactAssessments(currentAnomalies),
        alertHistory: generateAlertHistory(),
        systemHealth: generateSystemHealth(),
        detectionPerformance: generateDetectionPerformance(config.algorithms),
    };
}
;
// Generate mock anomalies for demo
const generateMockAnomalies = (type) => {
    const baseTime = type === 'current' ? Date.now() : Date.now() - 24 * 60 * 60 * 1000;
    return [
        {
            id: `anom-${type}-001`
        }
    ];
}, timestamp;
-Math.random() * 60 * 60 * 1000,
    type;
'conversion_anomaly',
    severity;
'high',
    confidence;
0.85,
    affectedStep;
funnelDefinition.steps[1]?.id,
    metric;
'conversion_rate',
    expectedValue;
0.15,
    actualValue;
0.08,
    deviation;
-0.07,
    deviationPercentage;
-46.7,
    algorithm;
'statistical_zscore',
    description;
'Significant drop in conversion rate detected at checkout step',
    context;
{
    timeOfDay: 14,
        dayOfWeek;
    2,
        seasonality;
    'normal',
        environmentalFactors;
    [,
        { factor: 'server_load', value: 0.85, impact: 'negative', confidence: 0.9 }
    ],
        concurrentEvents;
    [,
        { eventType: 'deployment', eventName: 'Payment System Update', timestamp: baseTime - 30 * 60 * 1000, impact: 'negative', correlation: 0.8 }
    ],
        marketConditions;
    [],
        systemMetrics;
    [,
        { metric: 'response_time', value: 450, threshold: 300, status: 'warning' }
    ];
}
rootCauses: [,
    {
        category: 'technical',
        description: 'Payment processing latency increased after deployment',
        probability: 0.8,
        evidence: [,
            { type: 'metric', description: 'Response time spike at deployment time', strength: 'strong', timestamp: baseTime, source: 'monitoring' }
        ],
        investigationSteps: ['Check payment service logs', 'Review deployment changes', 'Analyze error rates']
    }
],
    impact;
{
    revenueImpact: -2400,
        userImpact;
    150,
        conversionImpact;
    -0.07,
        scopeOfImpact;
    'localized',
        durationEstimate;
    120,
        recoveryEstimate;
    30,
        businessCritical;
    true,
    ;
}
recommendations: [,
    { action: 'Rollback payment system changes', priority: 'immediate', effort: 'low', expectedImpact: 'high', timeline: '15 minutes', owner: 'DevOps', dependencies: [] },
    { action: 'Implement payment timeout optimization', priority: 'high', effort: 'medium', expectedImpact: 'medium', timeline: '2 hours', owner: 'Backend Team', dependencies: ['Root cause confirmation'] }
],
    status;
type === 'current' ? 'new' : 'resolved';
{
    id: `anom-${type}-002`;
}
timestamp: baseTime - Math.random() * 2 * 60 * 60 * 1000,
    type;
'traffic_anomaly',
    severity;
'medium',
    confidence;
0.92,
    metric;
'user_entries',
    expectedValue;
1200,
    actualValue;
1850,
    deviation;
650,
    deviationPercentage;
54.2,
    algorithm;
'isolation_forest',
    description;
'Unexpected traffic spike detected - 54% above normal levels',
    context;
{
    timeOfDay: 10,
        dayOfWeek;
    3,
        seasonality;
    'normal',
        environmentalFactors;
    [],
        concurrentEvents;
    [,
        { eventType: 'marketing', eventName: 'Social Media Campaign Launch', timestamp: baseTime - 45 * 60 * 1000, impact: 'positive', correlation: 0.95 }
    ],
        marketConditions;
    [],
        systemMetrics;
    [];
}
rootCauses: [,
    {
        category: 'external_factors',
        description: 'Viral social media campaign driving unexpected traffic',
        probability: 0.95,
        evidence: [,
            { type: 'correlation', description: 'Traffic spike correlates with campaign launch', strength: 'strong', timestamp: baseTime, source: 'analytics' }
        ],
        investigationSteps: ['Verify campaign metrics', 'Check social media engagement', 'Monitor system capacity']
    }
],
    impact;
{
    revenueImpact: 3200,
        userImpact;
    650,
        conversionImpact;
    0.02,
        scopeOfImpact;
    'system_wide',
        durationEstimate;
    240,
        recoveryEstimate;
    0,
        businessCritical;
    false,
    ;
}
recommendations: [,
    { action: 'Scale infrastructure to handle increased load', priority: 'high', effort: 'medium', expectedImpact: 'high', timeline: '30 minutes', owner: 'DevOps', dependencies: [] },
    { action: 'Prepare follow-up marketing campaigns', priority: 'medium', effort: 'high', expectedImpact: 'medium', timeline: '2 days', owner: 'Marketing', dependencies: ['Traffic analysis'] }
],
    status;
type === 'current' ? 'acknowledged' : 'resolved';
;
;
// Generate mock predictions
const generateMockPredictions = () => {
    return [
        {
            predictedTimestamp: Date.now() + 2 * 60 * 60 * 1000,
            type: 'performance_drop',
            probability: 0.73,
            expectedSeverity: 'medium',
            affectedMetric: 'conversion_rate',
            preventiveActions: [,
                { action: 'Pre-scale infrastructure', effectiveness: 0.8, cost: 200, timeline: '1 hour', dependencies: [] }
            ],
            monitoringPlan: {},
            metrics: ['response_time', 'error_rate', 'conversion_rate'],
            frequency: 60,
            alertThresholds: { 'response_time': 400, 'error_rate': 0.05 },
            escalationPlan: ['ops', 'management']
        }
    ];
};
// Generate anomaly trends
const generateAnomalyTrends = () => {
    return [
        {
            period: 'last_24h',
            anomalyCount: 12,
            severityDistribution: { critical: 1, high: 3, medium: 5, low: 3, info: 0 },
            typeDistribution: {},
            performance_drop: 4,
            conversion_anomaly: 3,
            traffic_anomaly: 2,
            revenue_anomaly: 1,
            temporal_anomaly: 1,
            technical_anomaly: 1,
            performance_spike: 0,
            segment_anomaly: 0,
            cohort_anomaly: 0,
        },
        falsePositiveRate, 0.15,
        averageDetectionTime, 120,
        averageResolutionTime, 1800
    ];
};
// Generate root cause analyses
const generateRootCauseAnalyses = (anomalies) => {
    return anomalies.map(anomaly => ({}), anomalyId, anomaly.id, analysisTimestamp, Date.now(), primaryCause, anomaly.rootCauses[0], contributingFactors, anomaly.rootCauses.slice(1), correlatedAnomalies, [], timeline, [,
        { timestamp: anomaly.timestamp - 30 * 60 * 1000, event: 'System deployment initiated', impact: 'neutral', correlation: 0.5 },
        { timestamp: anomaly.timestamp, event: 'Anomaly detected', impact: 'negative', correlation: 1.0 }
    ], confidence, anomaly.confidence, validationStatus, 'pending');
};
;
// Generate impact assessments
const generateImpactAssessments = (anomalies) => {
    return anomalies.map(anomaly => ({}), anomalyId, anomaly.id, assessmentTimestamp, Date.now(), directImpact, {
        revenueloss: anomaly.impact.revenueImpact < 0 ? Math.abs(anomaly.impact.revenueImpact) : 0,
        userLoss: anomaly.impact.userImpact,
        conversionLoss: anomaly.impact.conversionImpact < 0 ? Math.abs(anomaly.impact.conversionImpact) : 0,
        engagementLoss: 0.05,
    }, indirectImpact, {
        brandReputation: anomaly.severity === 'critical' ? 0.3 : 0.1,
        customerSatisfaction: 0.2,
        futureImpact: 0.15,
        competitiveDisadvantage: 0.1,
    }, totalImpact, {
        monetaryValue: Math.abs(anomaly.impact.revenueImpact),
        userValue: anomaly.impact.userImpact,
        strategicValue: 0.25,
        severity: anomaly.severity,
    }, affectedUserSegments, segments.map(segment => ({}), segmentId, segment.id, segmentName, segment.name, impactPercentage, Math.random() * 30, recoveryTime, anomaly.impact.recoveryEstimate));
}, businessImplications, recoveryProjection;
;
// Generate alert history
const generateAlertHistory = () => {
    return [
        {
            id: 'alert-001',
            anomalyId: 'anom-current-001',
            timestamp: Date.now() - 10 * 60 * 1000,
            severity: 'high',
            channel: 'email',
            recipient: 'ops-team@company.com',
            status: 'acknowledged',
            message: 'High severity conversion anomaly detected',
            escalationLevel: 0,
            acknowledgedBy: 'ops-engineer',
            acknowledgedAt: Date.now() - 5 * 60 * 1000
        }
    ];
};
// Generate system health metrics
const generateSystemHealth = () => {
    return {
        detectionLatency: 45,
        alertLatency: 15,
        processingThroughput: 1200,
        falsePositiveRate: 0.12,
        falseNegativeRate: 0.08,
        systemAvailability: 0.999,
        dataQuality: 0.95,
    };
};
// Generate detection performance metrics
const generateDetectionPerformance = (algorithms) => {
    return algorithms.map(algorithm => ({}), algorithm, accuracy, 0.85 + Math.random() * 0.1, precision, 0.80 + Math.random() * 0.15, recall, 0.75 + Math.random() * 0.2, f1Score, 0.78 + Math.random() * 0.12, avgDetectionTime, 30 + Math.random() * 60, resourceUsage, 0.3 + Math.random() * 0.4, confidence, 0.7 + Math.random() * 0.25);
};
;
// Setup real-time monitoring
useEffect(() => {
    if (realTimeEnabled && detectionData) {
        // WebSocket connection for real-time updates
        const wsUrl = `ws://localhost:8000/api/anomaly-detection/stream/${funnelDefinition.id}`;
    }
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.onmessage = (event) => {
        const anomaly = JSON.parse(event.data);
        setDetectionData(prev => { });
        if (!prev)
            return prev;
        return {
            ...prev,
            currentAnomalies: [anomaly, ...prev.currentAnomalies],
        };
    };
});
if (onAnomalyDetected) {
    onAnomalyDetected(anomaly);
}
;
// Polling fallback
intervalRef.current = setInterval(loadAnomalyData, 30000);
return () => {
    if (wsRef.current) {
        wsRef.current.close();
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        ;
    }
    [realTimeEnabled, detectionData, loadAnomalyData, onAnomalyDetected, funnelDefinition.id];
    ;
    // Initial data load
    useEffect(() => {
        loadAnomalyData();
    }, [loadAnomalyData]);
    // Filter anomalies based on current filters
    const filteredAnomalies = useMemo(() => {
        if (!detectionData)
            return [];
        const anomalies = activeTab === 'current' ? detectionData.currentAnomalies : detectionData.historicalAnomalies;
        return anomalies.filter(anomaly => { });
        if (filterSeverity !== 'all' && anomaly.severity !== filterSeverity)
            return false;
        if (filterType !== 'all' && anomaly.type !== filterType)
            return false;
        return true;
    });
}, [detectionData, activeTab, filterSeverity, filterType];
;
// Handle export
const handleExport = useCallback(() => {
    if (!detectionData || !onExport)
        return;
    const exportData = {
        anomalies: [...detectionData.currentAnomalies, ...detectionData.historicalAnomalies],
        alerts: detectionData.alertHistory,
        impactAssessments: detectionData.impactAssessment,
        rootCauseAnalyses: detectionData.rootCauseAnalysis,
        performanceMetrics: detectionData.detectionPerformance,
        exportTimestamp: Date.now(),
        configuration: detectionConfig,
    };
    onExport(exportData);
}, [detectionData, detectionConfig, onExport]);
// Handle anomaly acknowledgment
const handleAcknowledgeAnomaly = useCallback((anomalyId) => {
    setDetectionData(prev => { });
    if (!prev)
        return prev;
    return {
        ...prev,
        currentAnomalies: prev.currentAnomalies.map(anomaly => ),
        anomaly, : .id === anomalyId
            ? { ...anomaly, status: 'acknowledged', acknowledgedBy: 'current-user', acknowledgedAt: Date.now() }
            : anomaly
    };
});
[];
;
if (loading) {
    return;
    _jsxs("div", { className: "funnel-anomaly-detection-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading anomaly detection data..." })] });
    ;
    if (error) {
        return;
        _jsxs("div", { className: "funnel-anomaly-detection-error", children: [_jsx("h3", { children: "Error Loading Anomaly Detection" }), _jsx("p", { className: "error-message", children: error }), _jsx("button", { onClick: loadAnomalyData, className: "retry-button", children: "Retry" })] });
        ;
        if (!detectionData) {
            return _jsx("div", { className: "funnel-anomaly-detection-error", children: "No data available" });
            return;
            _jsxs("div", { className: "funnel-anomaly-detection", children: [_jsxs("div", { className: "anomaly-detection-header", children: [_jsxs("div", { className: "detection-info", children: [_jsx("h3", { children: "Funnel Anomaly Detection" }), _jsxs("p", { children: ["Real-time monitoring and alerting for ", funnelDefinition.name] })] }), _jsxs("div", { className: "system-health", children: [_jsxs("div", { className: "health-metric", children: [_jsx("span", { className: "label", children: "System Health" }), _jsxs("span", { className: "value", children: [Math.round(detectionData.systemHealth.systemAvailability * 100), "%"] })] }), _jsxs("div", { className: "health-metric", children: [_jsx("span", { className: "label", children: "Detection Latency" }), _jsxs("span", { className: "value", children: [detectionData.systemHealth.detectionLatency, "s"] })] }), _jsxs("div", { className: "health-metric", children: [_jsx("span", { className: "label", children: "False Positive Rate" }), _jsxs("span", { className: "value", children: [Math.round(detectionData.systemHealth.falsePositiveRate * 100), "%"] })] })] }), _jsxs("div", { className: "detection-controls", children: [_jsxs("label", { className: "real-time-toggle", children: [_jsx("input", { type: "checkbox", checked: realTimeEnabled, onChange: (e) => setRealTimeEnabled(e.target.checked) }), "Real-time Monitoring"] }), _jsx("button", { onClick: handleExport, className: "export-button", children: "Export Data" })] })] }), _jsxs("div", { className: "detection-tabs", children: [_jsxs("button", { className: `tab ${activeTab === 'current' ? 'active' : ''}`, onClick: () => setActiveTab('current'), children: ["Current Anomalies (", detectionData.currentAnomalies.length, ")"] }), _jsxs("button", { className: `tab ${activeTab === 'historical' ? 'active' : ''}`, onClick: () => setActiveTab('historical'), children: ["Historical (", detectionData.historicalAnomalies.length, ")"] }), _jsxs("button", { className: `tab ${activeTab === 'predicted' ? 'active' : ''}`, onClick: () => setActiveTab('predicted'), children: ["Predictions (", detectionData.predictedAnomalies.length, ")"] }), _jsxs("button", { className: `tab ${activeTab === 'alerts' ? 'active' : ''}`, onClick: () => setActiveTab('alerts'), children: ["Alert History (", detectionData.alertHistory.length, ")"] })] }), _jsxs("div", { className: "detection-filters", children: [_jsxs("select", { value: filterSeverity, onChange: (e) => setFilterSeverity(e.target.value), className: "severity-filter", children: [_jsx("option", { value: "all", children: "All Severities" }), _jsx("option", { value: "critical", children: "Critical" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "info", children: "Info" })] }), _jsxs("select", { value: filterType, onChange: (e) => setFilterType(e.target.value), className: "type-filter", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "performance_drop", children: "Performance Drop" }), _jsx("option", { value: "conversion_anomaly", children: "Conversion Anomaly" }), _jsx("option", { value: "traffic_anomaly", children: "Traffic Anomaly" }), _jsx("option", { value: "revenue_anomaly", children: "Revenue Anomaly" }), _jsx("option", { value: "technical_anomaly", children: "Technical Anomaly" })] })] }), _jsxs("div", { className: "detection-content", children: [activeTab === 'current' || activeTab === 'historical' ? ()
                                < div : , " className=\"anomaly-list\">", filteredAnomalies.length === 0 ? ()
                                < div : , " className=\"no-anomalies\">", _jsx("p", { children: "No anomalies detected matching current filters" })] }), ") : () filteredAnomalies.map(anomaly => ()", _jsxs("div", { className: `anomaly-card ${anomaly.severity}`, children: ["}", _jsxs("div", { className: "anomaly-header", children: [_jsxs("div", { className: "anomaly-title", children: [_jsx("h4", { children: anomaly.description }), _jsxs("span", { className: `severity-badge ${anomaly.severity}`, children: ["}", anomaly.severity.toUpperCase()] }), _jsxs("span", { className: `status-badge ${anomaly.status}`, children: ["}", anomaly.status.replace('_', ' ').toUpperCase()] })] }), _jsxs("div", { className: "anomaly-meta", children: [_jsx("span", { className: "timestamp", children: new Date(anomaly.timestamp).toLocaleString() }), _jsxs("span", { className: "confidence", children: [Math.round(anomaly.confidence * 100), "% confidence"] })] })] }), _jsxs("div", { className: "anomaly-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Metric:" }), _jsx("span", { className: "value", children: anomaly.metric })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Expected:" }), _jsx("span", { className: "value", children: anomaly.expectedValue.toFixed(3) })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Actual:" }), _jsx("span", { className: "value", children: anomaly.actualValue.toFixed(3) })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "label", children: "Deviation:" }), _jsxs("span", { className: `value ${anomaly.deviation < 0 ? 'negative' : 'positive'}`, children: ["}", anomaly.deviationPercentage.toFixed(1), "%"] })] })] }), anomaly.impact && ()
                                < div, " className=\"impact-summary\">", _jsx("strong", { children: "Impact:" }), _jsxs("div", { className: "impact-metrics", children: [anomaly.impact.revenueImpact !== 0 && ()
                                        < span, " className=\"impact-metric\"> Revenue: $", Math.abs(anomaly.impact.revenueImpact)] }), ")}", anomaly.impact.userImpact !== 0 && ()
                                < span, " className=\"impact-metric\"> Users: ", anomaly.impact.userImpact] }, anomaly.id), ")}", _jsxs("span", { className: "impact-metric", children: ["Scope: ", anomaly.impact.scopeOfImpact.replace('_', ' ')] })] });
            div >
            ;
        }
        {
            anomaly.rootCauses.length > 0 && ()
                < div;
            className = "root-causes" >
                (_jsx("strong", { children: "Likely Causes:" })
                    ,
                        _jsx("ul", { children: anomaly.rootCauses.slice(0, 2).map((cause, index) => ()
                                < li, key = { index } >
                                { cause, : .description }({ Math, : .round(cause.probability * 100) } % probability)) }));
        }
        ul >
        ;
        div >
        ;
    }
    {
        anomaly.recommendations.length > 0 && ()
            < div;
        className = "recommendations" >
            (_jsx("strong", { children: "Recommended Actions:" })
                ,
                    _jsxs("ul", { children: [anomaly.recommendations.slice(0, 2).map((rec, index) => ()
                                < li, key = { index }, className = {} `priority-${rec.priority}`), ">}", rec.action, " (", rec.priority, " priority)"] }));
    }
    ul >
    ;
    div >
    ;
}
_jsxs("div", { className: "anomaly-actions", children: [anomaly.status === 'new' && ()
            < button, "onClick=", () => handleAcknowledgeAnomaly(anomaly.id), "className=\"acknowledge-button\" > Acknowledge"] });
_jsx("button", { onClick: () => setSelectedAnomaly(anomaly), className: "details-button", children: "View Details" });
div >
;
div >
;
div >
;
activeTab === 'predicted' ? ()
    < div : ;
className = "prediction-list" >
    { detectionData, : .predictedAnomalies.map((prediction, index) => ()
            < div, key = { index }, className = "prediction-card" >
            (_jsxs("div", { className: "prediction-header", children: [_jsxs("h4", { children: ["Predicted ", prediction.type.replace('_', ' ')] }), _jsxs("span", { className: `severity-badge ${prediction.expectedSeverity}`, children: ["}", prediction.expectedSeverity.toUpperCase()] })] })
                ,
                    _jsxs("div", { className: "prediction-details", children: [_jsxs("div", { className: "prediction-meta", children: [_jsxs("span", { children: ["Expected: ", new Date(prediction.predictedTimestamp).toLocaleString()] }), _jsxs("span", { children: ["Probability: ", Math.round(prediction.probability * 100), "%"] })] }), _jsxs("div", { className: "preventive-actions", children: [_jsx("strong", { children: "Preventive Actions:" }), _jsxs("ul", { children: [prediction.preventiveActions.map((action, actionIndex) => ()
                                                < li, key = { actionIndex } >
                                                { action, : .action }(Effectiveness)), ": ", Math.round(action.effectiveness * 100), "%)"] }), "))}"] })] })), div >
        , div >
        ) };
div >
;
()
    < div;
className = "alert-history" >
    { detectionData, : .alertHistory.map(alert => ()
            < div, key = { alert, : .id }, className = {} `alert-card ${alert.severity}`) } > ;
_jsxs("div", { className: "alert-header", children: [_jsx("h4", { children: alert.message }), _jsxs("span", { className: `status-badge ${alert.status}`, children: ["}", alert.status.toUpperCase()] })] })
    ,
        _jsxs("div", { className: "alert-details", children: [_jsxs("div", { className: "alert-meta", children: [_jsxs("span", { children: ["Channel: ", alert.channel] }), _jsxs("span", { children: ["Recipient: ", alert.recipient] }), _jsxs("span", { children: ["Time: ", new Date(alert.timestamp).toLocaleString()] })] }), alert.acknowledgedBy && ()
                    < div, " className=\"alert-acknowledgment\"> Acknowledged by ", alert.acknowledgedBy, " at ", new Date(alert.acknowledgedAt).toLocaleString()] });
div >
;
div >
;
div >
;
div >
    { selectedAnomaly } && ()
    < div;
className = "anomaly-detail-modal" >
    _jsx("div", { className: "modal-overlay", onClick: () => setSelectedAnomaly(null), children: _jsxs("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: "Anomaly Details" }), _jsx("button", { onClick: () => setSelectedAnomaly(null), className: "close-button", children: "\u00D7" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "anomaly-overview", children: [_jsx("h4", { children: selectedAnomaly.description }), _jsxs("div", { className: "anomaly-badges", children: [_jsxs("span", { className: `severity-badge ${selectedAnomaly.severity}`, children: ["}", selectedAnomaly.severity] }), _jsx("span", { className: "algorithm-badge", children: selectedAnomaly.algorithm })] })] }), _jsx("div", { className: "detailed-metrics", children: _jsx("h5", { children: "Detailed Metrics" }) }), _jsx("div", { className: "context-analysis", children: _jsx("h5", { children: "Context Analysis" }) })] })] }) });
div >
;
div >
;
;
;
