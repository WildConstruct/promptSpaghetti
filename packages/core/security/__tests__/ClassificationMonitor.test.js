/**
 * Test Suite for Classification Monitor
 *
 * Tests the monitoring service for data classification operations,
 * including performance tracking, compliance monitoring, and anomaly detection.
 */
import { ClassificationMonitor, MonitoringEventType, AlertSeverity } from '../ClassificationMonitor';
import { ClassificationLevel, DataCategory, ComplianceFramework } from '../DataClassifier';
describe('ClassificationMonitor', () => {
    let monitor;
    let testConfig;
    const createTestDataElement = (overrides) => ({
        id: 'data-123',
        fieldName: 'email',
        value: 'test@example.com',
        dataType: 'string',
        context: { userId: 'user-456' },
        source: 'api',
        timestamp: new Date(),
        ...overrides
    });
    const createTestClassificationResult = (overrides) => ({
        level: ClassificationLevel.CONFIDENTIAL,
        category: DataCategory.PII,
        confidence: 95,
        matchedRules: ['pii-email'],
        complianceRequirements: [ComplianceFramework.GDPR],
        encryptionRequired: true,
        retentionPeriod: '7 years',
        accessControls: ['mfa-required', 'role-based-access'],
        reasoning: ['Email address detected'],
        ...overrides
    });
    beforeEach(() => {
        jest.useFakeTimers();
        testConfig = {
            enableRealTimeMonitoring: true,
            enablePerformanceTracking: true,
            enableAnomalyDetection: true,
            enableComplianceMonitoring: true,
            retentionPeriodDays: 30,
            aggregationIntervalMinutes: 5,
            alertConfig: {
                enabled: true,
                thresholds: {
                    errorRate: 5,
                    responseTime: 100,
                    violationCount: 10,
                    anomalyConfidence: 80
                },
                channels: {
                    email: true,
                    webhook: true,
                    syslog: false
                },
                recipients: ['security@example.com'],
                webhookUrl: 'https://example.com/webhook'
            },
            dashboardRefreshIntervalSeconds: 30
        };
        monitor = new ClassificationMonitor(testConfig);
    });
    afterEach(() => {
        monitor.destroy();
        jest.useRealTimers();
    });
    describe('Classification Recording', () => {
        test('should record classification events', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            monitor.recordClassification(dataElement, result, 25);
            const events = monitor.getRecentEvents(10);
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                type: MonitoringEventType.CLASSIFICATION_PERFORMED,
                dataId: dataElement.id,
                classification: result,
                metadata: expect.objectContaining({
                    fieldName: dataElement.fieldName,
                    responseTime: 25,
                    confidence: result.confidence
                }),
                severity: AlertSeverity.INFO
            });
        });
        test('should update performance metrics', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record multiple classifications
            for (let i = 0; i < 10; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 20 + i * 5);
            }
            const metrics = monitor.getPerformanceMetrics();
            expect(metrics.totalClassifications).toBe(10);
            expect(metrics.averageResponseTime).toBeCloseTo(42.5, 1); // Average of 20-65
            expect(metrics.p95ResponseTime).toBeGreaterThanOrEqual(60);
            expect(metrics.throughput).toBe(10); // All within 1 minute
        });
        test('should update statistics correctly', () => {
            const dataElement = createTestDataElement();
            // Record different classification levels
            monitor.recordClassification(dataElement, createTestClassificationResult({ level: ClassificationLevel.PUBLIC }), 20);
            monitor.recordClassification({ ...dataElement, id: 'data-2' }, createTestClassificationResult({ level: ClassificationLevel.CONFIDENTIAL }), 25);
            monitor.recordClassification({ ...dataElement, id: 'data-3' }, createTestClassificationResult({ level: ClassificationLevel.RESTRICTED }), 30);
            const stats = monitor.getStatistics();
            expect(stats.byLevel[ClassificationLevel.PUBLIC]).toBe(1);
            expect(stats.byLevel[ClassificationLevel.CONFIDENTIAL]).toBe(1);
            expect(stats.byLevel[ClassificationLevel.RESTRICTED]).toBe(1);
            expect(stats.totalClassified).toBe(3);
            expect(stats.encryptionRequired).toBe(3);
        });
        test('should track unique data elements', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record same element multiple times
            monitor.recordClassification(dataElement, result, 20);
            monitor.recordClassification(dataElement, result, 25);
            monitor.recordClassification(dataElement, result, 30);
            // Record different element
            monitor.recordClassification({ ...dataElement, id: 'data-456' }, result, 35);
            const stats = monitor.getStatistics();
            expect(stats.totalClassified).toBe(4);
            expect(stats.uniqueDataElements).toBe(2);
        });
    });
    describe('Compliance Monitoring', () => {
        test('should detect compliance violations', () => {
            const eventHandler = jest.fn();
            monitor.on('monitoringEvent', eventHandler);
            monitor.recordComplianceViolation('data-123', ComplianceFramework.GDPR, 'Missing data retention policy', AlertSeverity.WARNING);
            const metrics = monitor.getComplianceMetrics();
            expect(metrics.totalViolations).toBe(1);
            expect(metrics.violationsByFramework[ComplianceFramework.GDPR]).toBe(1);
            expect(metrics.violationTypes['Missing data retention policy']).toBe(1);
            expect(metrics.pendingRemediation).toBe(1);
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
                type: MonitoringEventType.COMPLIANCE_VIOLATION,
                metadata: expect.objectContaining({
                    framework: ComplianceFramework.GDPR,
                    violation: 'Missing data retention policy'
                })
            }));
        });
        test('should calculate compliance rate', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record successful classifications
            for (let i = 0; i < 95; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 20);
            }
            // Record violations
            for (let i = 0; i < 5; i++) {
                monitor.recordComplianceViolation(`data-${i}`, ComplianceFramework.GDPR, 'Test violation', AlertSeverity.WARNING);
            }
            const metrics = monitor.getComplianceMetrics();
            expect(metrics.complianceRate).toBeCloseTo(95, 1);
        });
        test('should trigger alerts for critical violations', () => {
            const alertHandler = jest.fn();
            monitor.on('alert', alertHandler);
            monitor.recordComplianceViolation('data-123', ComplianceFramework.PCI_DSS, 'Unencrypted credit card data', AlertSeverity.CRITICAL);
            expect(alertHandler).toHaveBeenCalledWith(expect.objectContaining({
                event: expect.objectContaining({
                    type: MonitoringEventType.COMPLIANCE_VIOLATION,
                    severity: AlertSeverity.CRITICAL
                }),
                channels: testConfig.alertConfig.channels
            }));
            const metrics = monitor.getComplianceMetrics();
            expect(metrics.criticalViolations).toBe(1);
        });
        test('should detect missing encryption on restricted data', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult({
                level: ClassificationLevel.RESTRICTED,
                encryptionRequired: false // Should be true for restricted
            });
            monitor.recordClassification(dataElement, result, 20);
            const events = monitor.getRecentEvents(10, [MonitoringEventType.COMPLIANCE_VIOLATION]);
            expect(events).toHaveLength(1);
            expect(events[0].metadata).toMatchObject({
                framework: ComplianceFramework.NIST,
                violation: 'Restricted data must have encryption enabled'
            });
        });
    });
    describe('Performance Monitoring', () => {
        test('should track response time percentiles', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Generate response times with known distribution
            const responseTimes = [
                10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
                60, 65, 70, 75, 80, 85, 90, 95, 100, 105
            ];
            responseTimes.forEach((time, index) => {
                monitor.recordClassification({ ...dataElement, id: `data-${index}` }, result, time);
            });
            const metrics = monitor.getPerformanceMetrics();
            expect(metrics.p95ResponseTime).toBeCloseTo(100, 0);
            expect(metrics.p99ResponseTime).toBeCloseTo(105, 0);
        });
        test('should detect performance warnings', () => {
            const eventHandler = jest.fn();
            monitor.on('monitoringEvent', eventHandler);
            monitor.recordPerformanceWarning('responseTime', 150, 100);
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
                type: MonitoringEventType.PERFORMANCE_WARNING,
                metadata: expect.objectContaining({
                    metric: 'responseTime',
                    value: 150,
                    threshold: 100,
                    percentageOver: 50
                }),
                severity: AlertSeverity.WARNING
            }));
        });
        test('should calculate throughput correctly', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record classifications
            for (let i = 0; i < 30; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 20);
            }
            // Advance time by 30 seconds
            jest.advanceTimersByTime(30000);
            // Record more classifications
            for (let i = 30; i < 50; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 25);
            }
            const metrics = monitor.getPerformanceMetrics();
            // Should only count recent classifications (last minute)
            expect(metrics.throughput).toBe(20);
        });
    });
    describe('Anomaly Detection', () => {
        test('should detect volume anomalies', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Establish baseline
            for (let i = 0; i < 5; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 20);
            }
            // Wait and then spike
            jest.advanceTimersByTime(60000);
            // Record many classifications quickly
            for (let i = 100; i < 150; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 25);
            }
            const anomalies = monitor.getAnomalies();
            expect(anomalies).toHaveLength(1);
            expect(anomalies[0]).toMatchObject({
                type: 'volume',
                description: 'Unusual spike in classification volume',
                confidence: 85
            });
        });
        test('should detect pattern anomalies', () => {
            const dataElement = createTestDataElement();
            // Create normal distribution
            const levels = [
                ClassificationLevel.PUBLIC,
                ClassificationLevel.INTERNAL,
                ClassificationLevel.CONFIDENTIAL
            ];
            levels.forEach((level, idx) => {
                for (let i = 0; i < 10; i++) {
                    monitor.recordClassification({ ...dataElement, id: `data-${idx}-${i}` }, createTestClassificationResult({ level }), 20);
                }
            });
            // Add unusual concentration of restricted data
            for (let i = 0; i < 40; i++) {
                monitor.recordClassification({ ...dataElement, id: `restricted-${i}` }, createTestClassificationResult({
                    level: ClassificationLevel.RESTRICTED,
                    category: DataCategory.AUTHENTICATION
                }), 25);
            }
            const anomalies = monitor.getAnomalies();
            const patternAnomaly = anomalies.find(a => a.type === 'pattern');
            expect(patternAnomaly).toBeDefined();
            expect(patternAnomaly?.confidence).toBeGreaterThanOrEqual(75);
        });
        test('should trigger alerts for high-confidence anomalies', () => {
            const alertHandler = jest.fn();
            monitor.on('alert', alertHandler);
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Create volume spike to trigger high-confidence anomaly
            for (let i = 0; i < 100; i++) {
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, result, 20);
            }
            const alerts = alertHandler.mock.calls
                .map(call => call[0])
                .filter(alert => alert.event.type === MonitoringEventType.ANOMALY_DETECTED &&
                alert.event.metadata.confidence > 80);
            expect(alerts.length).toBeGreaterThan(0);
        });
    });
    describe('Dashboard and Reporting', () => {
        test('should provide comprehensive dashboard metrics', () => {
            const dataElement = createTestDataElement();
            // Generate diverse data
            for (let i = 0; i < 50; i++) {
                const level = Object.values(ClassificationLevel)[i % 4];
                const category = Object.values(DataCategory)[i % 5];
                monitor.recordClassification({ ...dataElement, id: `data-${i}` }, createTestClassificationResult({ level, category }), 20 + (i % 30));
            }
            // Add some violations
            monitor.recordComplianceViolation('data-10', ComplianceFramework.GDPR, 'Test violation', AlertSeverity.WARNING);
            const dashboard = monitor.getDashboardMetrics();
            expect(dashboard).toMatchObject({
                performance: expect.objectContaining({
                    totalClassifications: 50,
                    averageResponseTime: expect.any(Number)
                }),
                statistics: expect.objectContaining({
                    totalClassified: 50
                }),
                compliance: expect.objectContaining({
                    totalViolations: 1
                }),
                healthStatus: 'healthy'
            });
            expect(dashboard.recentAnomalies).toBeInstanceOf(Array);
            expect(dashboard.alerts).toBeInstanceOf(Array);
        });
        test('should calculate health status correctly', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Healthy state
            monitor.recordClassification(dataElement, result, 20);
            let dashboard = monitor.getDashboardMetrics();
            expect(dashboard.healthStatus).toBe('healthy');
            // Warning state - add violations
            for (let i = 0; i < 15; i++) {
                monitor.recordComplianceViolation(`data-${i}`, ComplianceFramework.GDPR, 'Test violation', AlertSeverity.WARNING);
            }
            dashboard = monitor.getDashboardMetrics();
            expect(dashboard.healthStatus).toBe('warning');
            // Critical state - add critical violation
            monitor.recordComplianceViolation('data-critical', ComplianceFramework.PCI_DSS, 'Critical violation', AlertSeverity.CRITICAL);
            dashboard = monitor.getDashboardMetrics();
            expect(dashboard.healthStatus).toBe('critical');
        });
        test('should export data in JSON format', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            monitor.recordClassification(dataElement, result, 20);
            monitor.recordComplianceViolation(dataElement.id, ComplianceFramework.GDPR, 'Test violation', AlertSeverity.WARNING);
            const exportedJson = monitor.exportData('json');
            const parsed = JSON.parse(exportedJson);
            expect(parsed).toMatchObject({
                exportedAt: expect.any(String),
                events: expect.arrayContaining([
                    expect.objectContaining({
                        type: MonitoringEventType.CLASSIFICATION_PERFORMED
                    }),
                    expect.objectContaining({
                        type: MonitoringEventType.COMPLIANCE_VIOLATION
                    })
                ]),
                performance: expect.any(Object),
                statistics: expect.any(Object),
                compliance: expect.any(Object)
            });
        });
        test('should export data in CSV format', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            monitor.recordClassification(dataElement, result, 20);
            const csvData = monitor.exportData('csv');
            const lines = csvData.split('\n');
            expect(lines[0]).toContain('id,type,timestamp,dataId,severity,level,category');
            expect(lines[1]).toContain('CLASSIFICATION_PERFORMED');
            expect(lines[1]).toContain(dataElement.id);
        });
    });
    describe('Event Management', () => {
        test('should filter events by type', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record different event types
            monitor.recordClassification(dataElement, result, 20);
            monitor.recordRuleTrigger('rule-1', dataElement.id, { matched: true });
            monitor.recordComplianceViolation(dataElement.id, ComplianceFramework.GDPR, 'Test violation');
            monitor.recordPerformanceWarning('errorRate', 10, 5);
            const classificationEvents = monitor.getRecentEvents(10, [
                MonitoringEventType.CLASSIFICATION_PERFORMED
            ]);
            expect(classificationEvents).toHaveLength(1);
            expect(classificationEvents[0].type).toBe(MonitoringEventType.CLASSIFICATION_PERFORMED);
            const violationEvents = monitor.getRecentEvents(10, [
                MonitoringEventType.COMPLIANCE_VIOLATION,
                MonitoringEventType.PERFORMANCE_WARNING
            ]);
            expect(violationEvents).toHaveLength(2);
        });
        test('should maintain event order', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record events with time gaps
            monitor.recordClassification({ ...dataElement, id: 'data-1' }, result, 20);
            jest.advanceTimersByTime(1000);
            monitor.recordClassification({ ...dataElement, id: 'data-2' }, result, 25);
            jest.advanceTimersByTime(1000);
            monitor.recordClassification({ ...dataElement, id: 'data-3' }, result, 30);
            const events = monitor.getRecentEvents(10);
            expect(events[0].dataId).toBe('data-3'); // Most recent first
            expect(events[1].dataId).toBe('data-2');
            expect(events[2].dataId).toBe('data-1');
        });
    });
    describe('Cleanup and Maintenance', () => {
        test('should clean up old data based on retention period', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            // Record old event
            monitor.recordClassification(dataElement, result, 20);
            // Advance time past retention period
            jest.advanceTimersByTime(testConfig.retentionPeriodDays * 24 * 60 * 60 * 1000 + 1000);
            // Record new event
            monitor.recordClassification({ ...dataElement, id: 'data-new' }, result, 25);
            // Trigger cleanup
            jest.advanceTimersByTime(3600000); // 1 hour to trigger cleanup
            const events = monitor.getRecentEvents(100);
            expect(events).toHaveLength(1);
            expect(events[0].dataId).toBe('data-new');
        });
        test('should emit cleanup event', () => {
            const cleanupHandler = jest.fn();
            monitor.on('cleanupCompleted', cleanupHandler);
            // Trigger cleanup
            jest.advanceTimersByTime(3600000); // 1 hour
            expect(cleanupHandler).toHaveBeenCalledWith(expect.objectContaining({
                remainingEvents: expect.any(Number),
                remainingAnomalies: expect.any(Number),
                timestamp: expect.any(Date)
            }));
        });
    });
    describe('Configuration', () => {
        test('should respect monitoring toggles', () => {
            const disabledConfig = {
                ...testConfig,
                enableRealTimeMonitoring: false,
                enablePerformanceTracking: false,
                enableAnomalyDetection: false,
                enableComplianceMonitoring: false
            };
            const disabledMonitor = new ClassificationMonitor(disabledConfig);
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            disabledMonitor.recordClassification(dataElement, result, 20);
            // Should not record events when monitoring is disabled
            const events = disabledMonitor.getRecentEvents(10);
            expect(events).toHaveLength(0);
            disabledMonitor.destroy();
        });
        test('should handle destroy gracefully', () => {
            const dataElement = createTestDataElement();
            const result = createTestClassificationResult();
            monitor.recordClassification(dataElement, result, 20);
            monitor.destroy();
            // Should clear all data
            const events = monitor.getRecentEvents(10);
            expect(events).toHaveLength(0);
            const metrics = monitor.getPerformanceMetrics();
            expect(metrics.totalClassifications).toBe(0);
        });
    });
});
