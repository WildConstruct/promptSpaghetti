/**
 * Classification Monitoring Service
 *
 * Real-time monitoring and analytics for data classification operations,
 * providing insights into classification patterns, performance metrics,
 * compliance violations, and security trends.
 *
 * Features:
 * - Real-time classification event monitoring
 * - Performance metrics tracking
 * - Compliance violation detection
 * - Anomaly detection for classification patterns
 * - Trend analysis and reporting
 * - Alert management for critical events
 * - Dashboard metrics aggregation
 * - Historical data analysis
 */
import { EventEmitter } from 'events';
import { ClassificationLevel, DataCategory, ComplianceFramework } from './DataClassifier';
// Monitoring Event Types
export var MonitoringEventType;
(function (MonitoringEventType) {
    MonitoringEventType["CLASSIFICATION_PERFORMED"] = "classification_performed";
    MonitoringEventType["RULE_TRIGGERED"] = "rule_triggered";
    MonitoringEventType["COMPLIANCE_VIOLATION"] = "compliance_violation";
    MonitoringEventType["PERFORMANCE_WARNING"] = "performance_warning";
    MonitoringEventType["ANOMALY_DETECTED"] = "anomaly_detected";
    MonitoringEventType["THRESHOLD_EXCEEDED"] = "threshold_exceeded";
    MonitoringEventType["ERROR_OCCURRED"] = "error_occurred";
    // Alert Severity Levels
    MonitoringEventType[MonitoringEventType["export"] = void 0] = "export";
    MonitoringEventType[MonitoringEventType["enum"] = void 0] = "enum";
    MonitoringEventType[MonitoringEventType["AlertSeverity"] = void 0] = "AlertSeverity";
})(MonitoringEventType || (MonitoringEventType = {}));
{
    INFO = 'info',
        WARNING = 'warning',
        ERROR = 'error',
        CRITICAL = 'critical';
    export class ClassificationMonitor extends EventEmitter {
        config;
        events = [];
        performanceMetrics;
        statistics;
        complianceMetrics;
        anomalies = new Map();
        alertQueue = [];
        metricsTimer;
        anomalyDetectionTimer;
        cleanupTimer;
        // Performance tracking
        responseTimes = [];
        classificationCounts = new Map();
        errorCounts = new Map();
        constructor(config) {
            super();
            this.config = config;
            this.initializeMetrics();
            this.startMonitoring();
            /**
            * Record a classification event
            */
        }
        result;
        responseTime;
    }
    void {
        : .config.enableRealTimeMonitoring, return: ,
        const: event, MonitoringEvent = {
            id: this.generateEventId(),
            type: MonitoringEventType.CLASSIFICATION_PERFORMED,
            timestamp: new Date(),
            dataId: dataElement.id,
            classification: result,
            metadata: {
                fieldName: dataElement.fieldName,
                dataType: dataElement.dataType,
                source: dataElement.source,
                responseTime,
                matchedRuleCount: result.matchedRules.length,
                confidence: result.confidence,
            },
            severity: AlertSeverity.INFO,
            source: 'classification_engine',
            userId: dataElement.context?.userId
        },
        this: .addEvent(event),
        this: .updatePerformanceMetrics(responseTime),
        this: .updateStatistics(result),
        : .config.enableAnomalyDetection };
    {
        this.checkForAnomalies(event);
        // Check for compliance violations
        if (this.config.enableComplianceMonitoring) {
            this.checkComplianceViolations(result, dataElement);
            recordRuleTrigger(ruleId, string);
            dataId: string,
                metadata;
            Record;
            void {
                const: event, MonitoringEvent = {
                    id: this.generateEventId(),
                    type: MonitoringEventType.RULE_TRIGGERED,
                    timestamp: new Date(),
                    dataId,
                    metadata: {
                        ruleId,
                        ...metadata
                    },
                    severity: AlertSeverity.INFO,
                    source: 'classification_rules'
                },
                this: .addEvent(event),
                framework: ComplianceFramework,
                violation: string,
                severity: AlertSeverity = AlertSeverity.WARNING, void: {
                    const: event, MonitoringEvent = {
                        id: this.generateEventId(),
                        type: MonitoringEventType.COMPLIANCE_VIOLATION,
                        timestamp: new Date(),
                        dataId,
                        metadata: {
                            framework,
                            violation,
                            requiresRemediation: true,
                        },
                        severity,
                        source: 'compliance_monitor'
                    },
                    this: .addEvent(event),
                    this: .updateComplianceMetrics(framework, violation),
                    if(severity) { } } === AlertSeverity.CRITICAL };
            {
                this.triggerAlert(event);
                recordPerformanceWarning(metric, string);
                value: number,
                    threshold;
                number;
                void {
                    const: event, MonitoringEvent = {
                        id: this.generateEventId(),
                        type: MonitoringEventType.PERFORMANCE_WARNING,
                        timestamp: new Date(),
                        dataId: 'system',
                        metadata: {
                            metric,
                            value,
                            threshold,
                            percentageOver: ((value - threshold) / threshold) * 100,
                        },
                        severity: AlertSeverity.WARNING,
                        source: 'performance_monitor'
                    },
                    this: .addEvent(event),
                    this: .triggerAlert(event),
                    /**
                     * Get current performance metrics
                     */
                    getPerformanceMetrics() {
                        return { ...this.performanceMetrics };
                        /**
                         * Get classification statistics
                         */
                    }
                    /**
                     * Get classification statistics
                     */
                    ,
                    /**
                     * Get classification statistics
                     */
                    getStatistics(timeRangeMinutes) {
                        if (!timeRangeMinutes) {
                            return { ...this.statistics };
                            // Calculate statistics for specific time range
                            const cutoff = new Date(Date.now() - timeRangeMinutes * 60000);
                            const filteredEvents = this.events.filter();
                            ;
                            event => event.timestamp >= cutoff &&
                                event.type === MonitoringEventType.CLASSIFICATION_PERFORMED;
                            ;
                            return this.calculateStatistics(filteredEvents);
                            /**
                             * Get compliance metrics
                             */
                        }
                        /**
                         * Get compliance metrics
                         */
                    }
                    /**
                     * Get compliance metrics
                     */
                    ,
                    /**
                     * Get compliance metrics
                     */
                    getComplianceMetrics() {
                        return { ...this.complianceMetrics };
                        /**
                         * Get detected anomalies
                         */
                    }
                    /**
                     * Get detected anomalies
                     */
                    ,
                    /**
                     * Get detected anomalies
                     */
                    getAnomalies(limit) {
                        const anomalies = Array.from(this.anomalies.values());
                    },
                    : 
                        .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()),
                    return: limit ? anomalies.slice(0, limit) : anomalies,
                    types: MonitoringEventType, MonitoringEvent };
                {
                    let events = this.events;
                    if (types && types.length > 0) {
                        events = events.filter(event => types.includes(event.type));
                        return events
                            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                            .slice(0, limit);
                        getDashboardMetrics();
                        {
                            performance: ClassificationPerformanceMetrics;
                            statistics: ClassificationStatistics;
                            compliance: ComplianceMetrics;
                            recentAnomalies: ClassificationAnomaly;
                            alerts: MonitoringEvent;
                            healthStatus: 'healthy' | 'warning' | 'critical';
                            const healthStatus = this.calculateHealthStatus();
                            return {
                                performance: this.getPerformanceMetrics(),
                                statistics: this.getStatistics(),
                                compliance: this.getComplianceMetrics(),
                                recentAnomalies: this.getAnomalies(5),
                                alerts: this.alertQueue.slice(-10),
                                healthStatus
                            };
                            exportData(format, 'json' | 'csv', 'json');
                            string;
                            {
                                const exportData = {
                                    exportedAt: new Date(),
                                    timeRange: {
                                        start: this.events[0]?.timestamp || new Date(),
                                        end: this.events[this.events.length - 1]?.timestamp || new Date(),
                                    },
                                    events: this.events,
                                    performance: this.performanceMetrics,
                                    statistics: this.statistics,
                                    compliance: this.complianceMetrics,
                                    anomalies: Array.from(this.anomalies.values())
                                };
                                if (format === 'json') {
                                    return JSON.stringify(exportData, null, 2);
                                }
                                else {
                                    // CSV export would be implemented here
                                    return this.convertToCSV(exportData);
                                    initializeMetrics();
                                    void {
                                        this: .performanceMetrics = {
                                            totalClassifications: 0,
                                            averageResponseTime: 0,
                                            p95ResponseTime: 0,
                                            p99ResponseTime: 0,
                                            throughput: 0,
                                            errorRate: 0,
                                            cacheHitRate: 0,
                                            queueDepth: 0,
                                            lastUpdated: new Date(),
                                        },
                                        this: .statistics = {
                                            byLevel: {
                                                [ClassificationLevel.PUBLIC]: 0,
                                                [ClassificationLevel.INTERNAL]: 0,
                                                [ClassificationLevel.CONFIDENTIAL]: 0,
                                                [ClassificationLevel.RESTRICTED]: 0,
                                            },
                                            byCategory: {
                                                [DataCategory.PII]: 0,
                                                [DataCategory.AUTHENTICATION]: 0,
                                                [DataCategory.SYSTEM_CONFIG]: 0,
                                                [DataCategory.OPERATIONAL]: 0,
                                                [DataCategory.BUSINESS]: 0,
                                            },
                                            byComplianceFramework: {
                                                [ComplianceFramework.GDPR]: 0,
                                                [ComplianceFramework.NIST]: 0,
                                                [ComplianceFramework.HIPAA]: 0,
                                                [ComplianceFramework.PCI_DSS]: 0,
                                            },
                                            encryptionRequired: 0,
                                            totalClassified: 0,
                                            uniqueDataElements: 0,
                                            timeRange: {
                                                start: new Date(),
                                                end: new Date(),
                                            },
                                            this: .complianceMetrics = {
                                                totalViolations: 0,
                                                violationsByFramework: {
                                                    [ComplianceFramework.GDPR]: 0,
                                                    [ComplianceFramework.NIST]: 0,
                                                    [ComplianceFramework.HIPAA]: 0,
                                                    [ComplianceFramework.PCI_DSS]: 0,
                                                },
                                                violationTypes: {},
                                                complianceRate: 100,
                                                criticalViolations: 0,
                                                resolvedViolations: 0,
                                                pendingRemediation: 0
                                            },
                                            startMonitoring() {
                                                // Performance metrics aggregation
                                                if (this.config.enablePerformanceTracking) {
                                                    this.metricsTimer = setInterval()();
                                                    this.aggregateMetrics(),
                                                        this.config.aggregationIntervalMinutes * 60000;
                                                    ;
                                                    // Anomaly detection
                                                    if (this.config.enableAnomalyDetection) {
                                                        this.anomalyDetectionTimer = setInterval()();
                                                        this.runAnomalyDetection(),
                                                            300000; // Every 5 minutes
                                                        ;
                                                        // Cleanup old data
                                                        this.cleanupTimer = setInterval()();
                                                        this.cleanupOldData(),
                                                            3600000; // Every hour
                                                        ;
                                                    }
                                                }
                                            },
                                            addEvent(event) {
                                                this.events.push(event);
                                                // Emit real-time event
                                                this.emit('monitoringEvent', event);
                                                // Check if alert is needed
                                                if (event.severity === AlertSeverity.ERROR || )
                                                    event.severity === AlertSeverity.CRITICAL;
                                                {
                                                    this.alertQueue.push(event);
                                                }
                                            },
                                            updatePerformanceMetrics(responseTime) {
                                                this.responseTimes.push(responseTime);
                                                // Keep only recent response times (last 1000)
                                                if (this.responseTimes.length > 1000) {
                                                    this.responseTimes.shift();
                                                    // Update metrics
                                                    this.performanceMetrics.totalClassifications++;
                                                    this.performanceMetrics.averageResponseTime =
                                                        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
                                                    // Calculate percentiles
                                                    const sorted = [...this.responseTimes].sort((a, b) => a - b);
                                                    this.performanceMetrics.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)] || 0;
                                                    this.performanceMetrics.p99ResponseTime = sorted[Math.floor(sorted.length * 0.99)] || 0;
                                                    // Calculate throughput (classifications per minute)
                                                    const recentEvents = this.events.filter();
                                                    ;
                                                    e => e.timestamp.getTime() > Date.now() - 60000 &&
                                                        e.type === MonitoringEventType.CLASSIFICATION_PERFORMED;
                                                    ;
                                                    this.performanceMetrics.throughput = recentEvents.length;
                                                    this.performanceMetrics.lastUpdated = new Date();
                                                }
                                            },
                                            updateStatistics(result) {
                                                this.statistics.byLevel[result.level]++;
                                                this.statistics.byCategory[result.category]++;
                                                result.complianceRequirements.forEach(framework => { });
                                                this.statistics.byComplianceFramework[framework]++;
                                            },
                                            if(result) { }, : .encryptionRequired
                                        } };
                                    {
                                        this.statistics.encryptionRequired++;
                                        this.statistics.totalClassified++;
                                        this.classificationCounts.set();
                                        result.level + ':' + result.category,
                                            (this.classificationCounts.get(result.level + ':' + result.category) || 0) + 1;
                                        ;
                                        updateComplianceMetrics((), framework, ComplianceFramework, violation, string);
                                        void {
                                            this: .complianceMetrics.totalViolations++,
                                            this: .complianceMetrics.violationsByFramework[framework]++,
                                            this: .complianceMetrics.violationTypes[violation] =
                                                (this.complianceMetrics.violationTypes[violation] || 0) + 1,
                                            this: .complianceMetrics.pendingRemediation++,
                                            // Recalculate compliance rate
                                            const: totalChecks = this.statistics.totalClassified,
                                            const: violations = this.complianceMetrics.totalViolations,
                                            this: .complianceMetrics.complianceRate =
                                                totalChecks > 0 ? ((totalChecks - violations) / totalChecks) * 100 : 100,
                                            checkForAnomalies(event) {
                                                // Volume anomaly detection
                                                const recentCount = this.events.filter();
                                                ;
                                                e => e.timestamp.getTime() > Date.now() - 300000 && // Last 5 minutes
                                                    e.type === MonitoringEventType.CLASSIFICATION_PERFORMED;
                                            }, : .length,
                                            if(recentCount) { }
                                        } > this.performanceMetrics.throughput * 2;
                                        {
                                            this.detectAnomaly({});
                                            id: this.generateAnomalyId(),
                                                type;
                                            'volume',
                                                description;
                                            'Unusual spike in classification volume',
                                                detectedAt;
                                            new Date(),
                                                confidence;
                                            85,
                                                affectedDataIds;
                                            [event.dataId],
                                                expectedPattern;
                                            {
                                                rate: this.performanceMetrics.throughput;
                                            }
                                            actualPattern: {
                                                rate: recentCount;
                                            }
                                            recommendation: 'Investigate source of increased classification requests';
                                        }
                                        ;
                                        // Pattern anomaly detection
                                        if (event.classification) {
                                            const patternKey = `${event.classification.level}:${event.classification.category}`;
                                        }
                                        const expectedCount = this.classificationCounts.get(patternKey) || 0;
                                        const averageCount = Array.from(this.classificationCounts.values());
                                        reduce((a, b) => a + b, 0) / this.classificationCounts.size;
                                        if (expectedCount > averageCount * 3) {
                                            this.detectAnomaly({});
                                            id: this.generateAnomalyId(),
                                                type;
                                            'pattern',
                                                description;
                                            `Unusual concentration of ${patternKey} classifications`;
                                        }
                                    }
                                    detectedAt: new Date(),
                                        confidence;
                                    75,
                                        affectedDataIds;
                                    [event.dataId],
                                        expectedPattern;
                                    {
                                        averageCount;
                                    }
                                    actualPattern: {
                                        count: expectedCount;
                                    }
                                    recommendation: 'Review classification rules and data sources';
                                }
                                ;
                                checkComplianceViolations((), result, ClassificationResult, dataElement, DataElement);
                                void {
                                    // Check for missing encryption on sensitive data
                                    if(result) { }, : .level === ClassificationLevel.RESTRICTED && !result.encryptionRequired
                                };
                                {
                                    this.recordComplianceViolation();
                                    dataElement.id,
                                        ComplianceFramework.NIST,
                                        'Restricted data must have encryption enabled',
                                        AlertSeverity.CRITICAL;
                                    ;
                                    // Check for PII without GDPR compliance
                                    if (result.category === DataCategory.PII && )
                                        !result.complianceRequirements.includes(ComplianceFramework.GDPR);
                                    {
                                        this.recordComplianceViolation();
                                        dataElement.id,
                                            ComplianceFramework.GDPR,
                                            'PII data must include GDPR compliance requirements',
                                            AlertSeverity.WARNING;
                                        ;
                                        detectAnomaly(anomaly, ClassificationAnomaly);
                                        void {
                                            this: .anomalies.set(anomaly.id, anomaly),
                                            const: event, MonitoringEvent = {
                                                id: this.generateEventId(),
                                                type: MonitoringEventType.ANOMALY_DETECTED,
                                                timestamp: new Date(),
                                                dataId: anomaly.affectedDataIds[0] || 'system',
                                                metadata: {
                                                    anomalyType: anomaly.type,
                                                    confidence: anomaly.confidence,
                                                    description: anomaly.description,
                                                },
                                                severity: anomaly.confidence > 80 ? AlertSeverity.WARNING : AlertSeverity.INFO,
                                                source: 'anomaly_detector'
                                            },
                                            this: .addEvent(event),
                                            if(anomaly) { }, : .confidence > this.config.alertConfig.thresholds.anomalyConfidence };
                                        {
                                            this.triggerAlert(event);
                                            triggerAlert(event, MonitoringEvent);
                                            void {
                                                : .config.alertConfig.enabled, return: ,
                                                this: .emit('alert', {}),
                                                event,
                                                timestamp: new Date(),
                                                channels: this.config.alertConfig.channels, };
                                            ;
                                            // Send to configured channels
                                            if (this.config.alertConfig.channels.webhook && this.config.alertConfig.webhookUrl) {
                                                this.sendWebhookAlert(event);
                                                sendWebhookAlert(event, MonitoringEvent);
                                                void {
                                                    // Webhook implementation would go here
                                                    console, : .log('Sending webhook alert:', event),
                                                    aggregateMetrics() {
                                                        // Aggregate performance metrics
                                                        const errors = this.events.filter();
                                                        ;
                                                        e => e.type === MonitoringEventType.ERROR_OCCURRED &&
                                                            e.timestamp.getTime() > Date.now() - this.config.aggregationIntervalMinutes * 60000;
                                                        ;
                                                        const total = this.events.filter();
                                                        ;
                                                        e => e.type === MonitoringEventType.CLASSIFICATION_PERFORMED &&
                                                            e.timestamp.getTime() > Date.now() - this.config.aggregationIntervalMinutes * 60000;
                                                        ;
                                                        this.performanceMetrics.errorRate = total.length > 0 ?
                                                            (errors.length / total.length) * 100 : 0;
                                                        // Check thresholds
                                                        if (this.performanceMetrics.errorRate > this.config.alertConfig.thresholds.errorRate) {
                                                            this.recordPerformanceWarning();
                                                            'errorRate',
                                                                this.performanceMetrics.errorRate,
                                                                this.config.alertConfig.thresholds.errorRate;
                                                            ;
                                                            if (this.performanceMetrics.averageResponseTime > this.config.alertConfig.thresholds.responseTime) {
                                                                this.recordPerformanceWarning();
                                                                'responseTime',
                                                                    this.performanceMetrics.averageResponseTime,
                                                                    this.config.alertConfig.thresholds.responseTime;
                                                                ;
                                                            }
                                                        }
                                                    },
                                                    runAnomalyDetection() {
                                                        // Advanced anomaly detection logic would go here
                                                        // For now, basic implementation is in checkForAnomalies
                                                    }
                                                    // Advanced anomaly detection logic would go here
                                                    // For now, basic implementation is in checkForAnomalies
                                                    ,
                                                    // Advanced anomaly detection logic would go here
                                                    // For now, basic implementation is in checkForAnomalies
                                                    calculateHealthStatus() {
                                                        if (this.complianceMetrics.criticalViolations > 0 || )
                                                            this.performanceMetrics.errorRate > 5;
                                                        {
                                                            return 'critical';
                                                            if (this.complianceMetrics.totalViolations > 10 || )
                                                                this.performanceMetrics.errorRate > 2 ||
                                                                    this.anomalies.size > 5;
                                                            {
                                                                return 'warning';
                                                                return 'healthy';
                                                            }
                                                        }
                                                    },
                                                    calculateStatistics(events) {
                                                        const stats = { ...this.statistics };
                                                        // Reset counters
                                                        Object.keys(stats.byLevel).forEach(level => { });
                                                        stats.byLevel[level] = 0;
                                                    },
                                                    Object, : .keys(stats.byCategory).forEach(category => { }),
                                                    stats, : .byCategory[category] = 0
                                                };
                                                ;
                                                Object.keys(stats.byComplianceFramework).forEach(framework => { });
                                                stats.byComplianceFramework[framework] = 0;
                                            }
                                            ;
                                            // Recalculate from filtered events
                                            events.forEach(event => { });
                                            if (event.classification) {
                                                stats.byLevel[event.classification.level]++;
                                                stats.byCategory[event.classification.category]++;
                                                event.classification.complianceRequirements.forEach(framework => { });
                                                stats.byComplianceFramework[framework]++;
                                            }
                                            ;
                                            if (event.classification.encryptionRequired) {
                                                stats.encryptionRequired++;
                                            }
                                            ;
                                            stats.totalClassified = events.length;
                                            stats.uniqueDataElements = new Set(events.map(e => e.dataId)).size;
                                            if (events.length > 0) {
                                                stats.timeRange = {
                                                    start: events[0].timestamp,
                                                    end: events[events.length - 1].timestamp,
                                                };
                                                return stats;
                                                convertToCSV(data, any);
                                                string;
                                                {
                                                    // Simplified CSV conversion
                                                    const events = data.events.map((e) => ({}), id, e.id, type, e.type, timestamp, e.timestamp.toISOString(), dataId, e.dataId, severity, e.severity, level, e.classification?.level || '', category, e.classification?.category || '');
                                                }
                                                ;
                                                const headers = Object.keys(events[0] || {}).join(',');
                                                const rows = events.map((e) => Object.values(e).join(','));
                                                return [headers, ...rows].join('\n');
                                                cleanupOldData();
                                                void {
                                                    const: cutoff = new Date(),
                                                    Date, : .now() - this.config.retentionPeriodDays * 24 * 60 * 60 * 1000,
                                                    // Remove old events
                                                    this: .events = this.events.filter(event => event.timestamp > cutoff),
                                                    : .anomalies
                                                };
                                                {
                                                    if (anomaly.detectedAt < cutoff) {
                                                        this.anomalies.delete(id);
                                                        // Clear old alerts
                                                        this.alertQueue = this.alertQueue.filter(alert => alert.timestamp > cutoff);
                                                        this.emit('cleanupCompleted', {});
                                                        remainingEvents: this.events.length,
                                                            remainingAnomalies;
                                                        this.anomalies.size,
                                                            timestamp;
                                                        new Date(),
                                                        ;
                                                    }
                                                    ;
                                                    generateEventId();
                                                    string;
                                                    {
                                                        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                                    }
                                                    generateAnomalyId();
                                                    string;
                                                    {
                                                        return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                                    }
                                                    destroy();
                                                    void {
                                                        : .metricsTimer, : .metricsTimer,
                                                        : .anomalyDetectionTimer, : .anomalyDetectionTimer,
                                                        : .cleanupTimer, : .cleanupTimer,
                                                        this: .events = [],
                                                        this: .anomalies.clear(),
                                                        this: .alertQueue = [],
                                                        this: .responseTimes = [],
                                                        this: .classificationCounts.clear(),
                                                        this: .errorCounts.clear(),
                                                        this: .removeAllListeners(),
                                                        export: , default: ClassificationMonitor
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
