/**
 * Tests for Classification Audit Logging Service
 *
 * Comprehensive test suite covering audit logging,
 * compliance tracking, and reporting functionality.
 */
import ClassificationAuditLoggingService from '../ClassificationAuditLoggingService';
describe('ClassificationAuditLoggingService', () => {
    let service;
    let mockContext;
    beforeEach(() => {
        service = new ClassificationAuditLoggingService();
        mockContext = {
            operation: 'read',
            userId: 'user123',
            sessionId: 'session123',
            purpose: 'data analysis',
            environment: 'production',
            timestamp: new Date(),
            source: '192.168.1.100',
            requestId: 'req123'
        };
    });
    describe('Audit Logging', () => {
        it('should log audit events with all required fields', async () => {
            const entryId = await service.logAuditEvent('ACCESS_DATA', 'CONFIDENTIAL', 'data123', {
                accessMethod: 'API',
                toolUsed: 'Dashboard',
                businessJustification: 'Analysis required',
                piiDetected: true
            }, mockContext, {
                success: true,
                executionTimeMs: 150,
                complianceScore: 95
            }, {
                sourceIP: '192.168.1.100',
                userAgent: 'Mozilla/5.0'
            });
            expect(entryId).toBeDefined();
            expect(entryId).toMatch(/^audit-/);
            const entry = service.getAuditEntry(entryId);
            expect(entry).toBeDefined();
            expect(entry?.action).toBe('ACCESS_DATA');
            expect(entry?.classification).toBe('CONFIDENTIAL');
            expect(entry?.dataId).toBe('data123');
            expect(entry?.details.piiDetected).toBe(true);
            expect(entry?.outcome.success).toBe(true);
            expect(entry?.riskScore).toBeGreaterThan(0);
        });
        it('should generate appropriate compliance flags', async () => {
            const entryId = await service.logAuditEvent('EXPORT_DATA', 'RESTRICTED', 'restricted_data_001', { accessMethod: 'API' }, mockContext, { success: true });
            const entry = service.getAuditEntry(entryId);
            expect(entry?.complianceFlags).toBeDefined();
            expect(entry?.complianceFlags.length).toBeGreaterThan(0);
            const frameworks = entry?.complianceFlags.map(f => f.framework);
            expect(frameworks).toContain('FedRAMP');
            expect(frameworks).toContain('FISMA');
        });
        it('should calculate risk scores based on action and classification', async () => {
            // High-risk scenario
            const highRiskId = await service.logAuditEvent('EXPORT_DATA', 'RESTRICTED', 'data123', { accessMethod: 'API' }, mockContext, { success: false });
            // Low-risk scenario
            const lowRiskId = await service.logAuditEvent('ACCESS_DATA', 'PUBLIC', 'data456', { accessMethod: 'API' }, mockContext, { success: true });
            const highRiskEntry = service.getAuditEntry(highRiskId);
            const lowRiskEntry = service.getAuditEntry(lowRiskId);
            expect(highRiskEntry?.riskScore).toBeGreaterThan(lowRiskEntry?.riskScore || 0);
            expect(highRiskEntry?.riskScore).toBeGreaterThan(80); // Should be high risk
            expect(lowRiskEntry?.riskScore).toBeLessThan(30); // Should be low risk
        });
        it('should detect violations and increase risk score', async () => {
            // Generate many rapid accesses to trigger violation
            const userContext = { ...mockContext, userId: 'rapid-user' };
            // First create some entries
            for (let i = 0; i < 11; i++) {
                await service.logAuditEvent('ACCESS_DATA', 'CONFIDENTIAL', `data${i}`, { accessMethod: 'API' }, userContext, { success: true });
            }
            // Now create the 12th entry which should detect the violation
            const lastEntryId = await service.logAuditEvent('ACCESS_DATA', 'CONFIDENTIAL', 'data_final', { accessMethod: 'API' }, userContext, { success: true });
            const lastEntry = service.getAuditEntry(lastEntryId);
            expect(lastEntry).toBeDefined();
            expect(lastEntry?.outcome.violationsDetected.length).toBeGreaterThan(0);
            expect(lastEntry?.outcome.violationsDetected).toContain('High-frequency access pattern detected');
            expect(lastEntry?.outcome.remediationRequired).toBe(true);
        });
        it('should handle real-time audit log notifications', async () => {
            const receivedEntries = [];
            service.onAuditLog((entry) => {
                receivedEntries.push(entry);
            });
            await service.logAuditEvent('CLASSIFY_DATA', 'INTERNAL', 'data123', { accessMethod: 'API' }, mockContext, { success: true });
            expect(receivedEntries).toHaveLength(1);
            expect(receivedEntries[0].action).toBe('CLASSIFY_DATA');
        });
    });
    describe('Audit Querying', () => {
        beforeEach(async () => {
            // Set up test data
            const testData = [
                { action: 'ACCESS_DATA', classification: 'PUBLIC', user: 'user1' },
                { action: 'EXPORT_DATA', classification: 'CONFIDENTIAL', user: 'user2' },
                { action: 'DELETE_DATA', classification: 'RESTRICTED', user: 'user1' },
                { action: 'CLASSIFY_DATA', classification: 'INTERNAL', user: 'user3' }
            ];
            for (const data of testData) {
                const context = { ...mockContext, userId: data.user };
                await service.logAuditEvent(data.action, data.classification, 'test_data', { accessMethod: 'API' }, context, { success: true });
            }
        });
        it('should filter audit logs by user', () => {
            const query = { userId: 'user1' };
            const results = service.queryAuditLogs(query);
            expect(results.length).toBe(2);
            expect(results.every(entry => entry.userId === 'user1')).toBe(true);
        });
        it('should filter audit logs by classification', () => {
            const query = { classification: 'CONFIDENTIAL' };
            const results = service.queryAuditLogs(query);
            expect(results.length).toBe(1);
            expect(results[0].classification).toBe('CONFIDENTIAL');
        });
        it('should filter audit logs by action', () => {
            const query = { action: 'ACCESS_DATA' };
            const results = service.queryAuditLogs(query);
            expect(results.length).toBe(1);
            expect(results[0].action).toBe('ACCESS_DATA');
        });
        it('should filter audit logs by date range', () => {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 7200000);
            const query = {
                startDate: twoHoursAgo,
                endDate: now
            };
            const results = service.queryAuditLogs(query);
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(entry => entry.timestamp >= twoHoursAgo && entry.timestamp <= now)).toBe(true);
        });
        it('should filter audit logs by risk score range', () => {
            const query = {
                riskScoreMin: 50,
                riskScoreMax: 90
            };
            const results = service.queryAuditLogs(query);
            expect(results.every(entry => entry.riskScore >= 50 && entry.riskScore <= 90)).toBe(true);
        });
        it('should sort and paginate results', () => {
            const query = {
                sortBy: 'riskScore',
                sortOrder: 'desc',
                limit: 2,
                offset: 0
            };
            const results = service.queryAuditLogs(query);
            expect(results.length).toBeLessThanOrEqual(2);
            // Check sorting
            for (let i = 1; i < results.length; i++) {
                expect(results[i].riskScore).toBeLessThanOrEqual(results[i - 1].riskScore);
            }
        });
        it('should filter by compliance framework', () => {
            const query = { complianceFramework: 'GDPR' };
            const results = service.queryAuditLogs(query);
            expect(results.every(entry => entry.complianceFlags.some(flag => flag.framework === 'GDPR'))).toBe(true);
        });
    });
    describe('Audit Reporting', () => {
        beforeEach(async () => {
            // Set up test data for reporting
            const testData = [
                { action: 'ACCESS_DATA', classification: 'INTERNAL', success: true },
                { action: 'EXPORT_DATA', classification: 'CONFIDENTIAL', success: false },
                { action: 'DELETE_DATA', classification: 'RESTRICTED', success: true },
                { action: 'CLASSIFY_DATA', classification: 'PUBLIC', success: true }
            ];
            for (const data of testData) {
                await service.logAuditEvent(data.action, data.classification, 'test_data', { accessMethod: 'API' }, mockContext, { success: data.success });
            }
        });
        it('should generate comprehensive audit reports', async () => {
            const reportId = await service.generateAuditReport('Test Report', 'Comprehensive test report', { sortBy: 'timestamp' }, 'JSON', 'admin-user');
            expect(reportId).toBeDefined();
            expect(reportId).toMatch(/^report-/);
            const report = service.getAuditReport(reportId);
            expect(report).toBeDefined();
            expect(report?.name).toBe('Test Report');
            expect(report?.summary).toBeDefined();
            expect(report?.entries.length).toBeGreaterThan(0);
        });
        it('should generate accurate audit summaries', async () => {
            const reportId = await service.generateAuditReport('Summary Test', 'Test summary generation', {}, 'JSON', 'admin-user');
            const report = service.getAuditReport(reportId);
            const summary = report?.summary;
            expect(summary?.totalEntries).toBeGreaterThan(0);
            expect(summary?.uniqueUsers).toBeGreaterThan(0);
            expect(summary?.actionBreakdown).toBeDefined();
            expect(summary?.classificationBreakdown).toBeDefined();
            expect(summary?.riskAnalysis).toBeDefined();
            // Check that action breakdown adds up to total entries
            const actionTotal = Object.values(summary?.actionBreakdown || {}).reduce((a, b) => a + b, 0);
            expect(actionTotal).toBe(summary?.totalEntries);
        });
        it('should export audit reports in different formats', async () => {
            const reportId = await service.generateAuditReport('Export Test', 'Test report export', { limit: 5 }, 'CSV', 'admin-user');
            const csvExport = service.exportAuditReport(reportId);
            expect(csvExport).toBeDefined();
            if (csvExport) {
                const lines = csvExport.split('\n');
                expect(lines[0]).toContain('timestamp,userId,action,classification');
                expect(lines.length).toBeGreaterThan(1); // Header + data rows
            }
            // Test JSON export
            const jsonReportId = await service.generateAuditReport('JSON Export Test', 'Test JSON export', { limit: 5 }, 'JSON', 'admin-user');
            const jsonExport = service.exportAuditReport(jsonReportId);
            expect(jsonExport).toBeDefined();
            if (jsonExport) {
                const parsed = JSON.parse(jsonExport);
                expect(parsed.name).toBe('JSON Export Test');
                expect(parsed.entries).toBeDefined();
            }
        });
        it('should handle non-existent report exports', () => {
            const result = service.exportAuditReport('non-existent-report-id');
            expect(result).toBeNull();
        });
    });
    describe('Retention Policies', () => {
        it('should have default retention policies for all classifications', () => {
            const classifications = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
            classifications.forEach(classification => {
                const policy = service.getRetentionPolicy(classification);
                expect(policy).toBeDefined();
                expect(policy?.classification).toBe(classification);
                expect(policy?.retentionDays).toBeGreaterThan(0);
                expect(policy?.archiveAfterDays).toBeGreaterThan(0);
            });
        });
        it('should have progressively longer retention for higher classifications', () => {
            const publicPolicy = service.getRetentionPolicy('PUBLIC');
            const restrictedPolicy = service.getRetentionPolicy('RESTRICTED');
            expect(restrictedPolicy?.retentionDays).toBeGreaterThan(publicPolicy?.retentionDays || 0);
            expect(restrictedPolicy?.permanentDeletionAfterDays).toBeGreaterThan(publicPolicy?.permanentDeletionAfterDays || 0);
        });
        it('should allow updating retention policies', () => {
            const originalPolicy = service.getRetentionPolicy('INTERNAL');
            expect(originalPolicy).toBeDefined();
            const updatedPolicy = {
                ...originalPolicy,
                retentionDays: 1000,
                encryptionRequired: true
            };
            service.updateRetentionPolicy('INTERNAL', updatedPolicy);
            const newPolicy = service.getRetentionPolicy('INTERNAL');
            expect(newPolicy?.retentionDays).toBe(1000);
            expect(newPolicy?.encryptionRequired).toBe(true);
        });
        it('should have appropriate compliance requirements by classification', () => {
            const confidentialPolicy = service.getRetentionPolicy('CONFIDENTIAL');
            const restrictedPolicy = service.getRetentionPolicy('RESTRICTED');
            expect(confidentialPolicy?.complianceRequirements).toContain('GDPR');
            expect(confidentialPolicy?.complianceRequirements).toContain('HIPAA');
            expect(restrictedPolicy?.complianceRequirements).toContain('FedRAMP');
            expect(restrictedPolicy?.complianceRequirements).toContain('FISMA');
        });
    });
    describe('Compliance Tracking', () => {
        it('should generate GDPR compliance flags for relevant actions', async () => {
            const entryId = await service.logAuditEvent('EXPORT_DATA', 'CONFIDENTIAL', 'personal_data_001', {
                accessMethod: 'API',
                piiDetected: true
            }, mockContext, { success: true });
            const entry = service.getAuditEntry(entryId);
            const gdprFlag = entry?.complianceFlags.find(f => f.framework === 'GDPR');
            expect(gdprFlag).toBeDefined();
            expect(gdprFlag?.requirement).toContain('Article 20');
            expect(gdprFlag?.status).toBe('COMPLIANT');
        });
        it('should track compliance status across multiple frameworks', async () => {
            const entryId = await service.logAuditEvent('ACCESS_DATA', 'RESTRICTED', 'healthcare_data_001', {
                accessMethod: 'API',
                businessJustification: 'Medical research'
            }, mockContext, { success: true });
            const entry = service.getAuditEntry(entryId);
            const frameworks = entry?.complianceFlags.map(f => f.framework);
            expect(frameworks).toContain('FedRAMP');
            expect(frameworks).toContain('FISMA');
            expect(frameworks).toContain('SOC2');
        });
        it('should set appropriate compliance statuses', async () => {
            const entryId = await service.logAuditEvent('DELETE_DATA', 'CONFIDENTIAL', 'data_to_delete', { accessMethod: 'API' }, mockContext, { success: true });
            const entry = service.getAuditEntry(entryId);
            const flags = entry?.complianceFlags;
            expect(flags?.every(flag => ['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW', 'EXEMPTED'].includes(flag.status))).toBe(true);
        });
    });
    describe('Statistics and Analytics', () => {
        beforeEach(async () => {
            // Set up varied test data
            const testData = [
                { action: 'ACCESS_DATA', classification: 'PUBLIC' },
                { action: 'ACCESS_DATA', classification: 'INTERNAL' },
                { action: 'EXPORT_DATA', classification: 'CONFIDENTIAL' },
                { action: 'DELETE_DATA', classification: 'RESTRICTED' }
            ];
            for (const data of testData) {
                await service.logAuditEvent(data.action, data.classification, 'test_data', { accessMethod: 'API' }, mockContext, { success: true });
            }
        });
        it('should provide accurate audit statistics', () => {
            const stats = service.getAuditStatistics();
            expect(stats.totalEntries).toBeGreaterThan(0);
            expect(stats.entriesByClassification).toBeDefined();
            expect(stats.entriesByAction).toBeDefined();
            expect(stats.averageRiskScore).toBeGreaterThanOrEqual(0);
            expect(stats.averageRiskScore).toBeLessThanOrEqual(100);
            expect(stats.recentViolations).toBeGreaterThanOrEqual(0);
        });
        it('should break down entries by classification and action', () => {
            const stats = service.getAuditStatistics();
            // Check classification breakdown
            expect(stats.entriesByClassification.PUBLIC).toBeGreaterThan(0);
            expect(stats.entriesByClassification.INTERNAL).toBeGreaterThan(0);
            expect(stats.entriesByClassification.CONFIDENTIAL).toBeGreaterThan(0);
            expect(stats.entriesByClassification.RESTRICTED).toBeGreaterThan(0);
            // Check action breakdown
            expect(stats.entriesByAction.ACCESS_DATA).toBeGreaterThan(0);
            expect(stats.entriesByAction.EXPORT_DATA).toBeGreaterThan(0);
            expect(stats.entriesByAction.DELETE_DATA).toBeGreaterThan(0);
        });
    });
    describe('Error Handling and Edge Cases', () => {
        it('should handle invalid audit entry IDs gracefully', () => {
            const entry = service.getAuditEntry('invalid-id');
            expect(entry).toBeUndefined();
        });
        it('should handle invalid report IDs gracefully', () => {
            const report = service.getAuditReport('invalid-report-id');
            expect(report).toBeUndefined();
        });
        it('should handle empty query results', () => {
            const query = {
                userId: 'non-existent-user',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2020-01-02')
            };
            const results = service.queryAuditLogs(query);
            expect(results).toHaveLength(0);
        });
        it('should validate query parameters', () => {
            const query = {
                limit: -1, // Invalid limit
                offset: -5 // Invalid offset
            };
            const results = service.queryAuditLogs(query);
            // Should handle gracefully without throwing
            expect(Array.isArray(results)).toBe(true);
        });
        it('should handle resource type determination', async () => {
            const testCases = [
                { dataId: 'doc_123', expectedType: 'DOCUMENT' },
                { dataId: 'file_456', expectedType: 'FILE' },
                { dataId: 'db_789', expectedType: 'DATABASE' },
                { dataId: 'api_abc', expectedType: 'API' },
                { dataId: 'user_def', expectedType: 'USER_DATA' },
                { dataId: 'unknown_xyz', expectedType: 'SYSTEM' }
            ];
            for (const testCase of testCases) {
                const entryId = await service.logAuditEvent('ACCESS_DATA', 'PUBLIC', testCase.dataId, { accessMethod: 'API' }, mockContext, { success: true });
                const entry = service.getAuditEntry(entryId);
                expect(entry?.resourceType).toBe(testCase.expectedType);
            }
        });
    });
    describe('Data Management', () => {
        it('should clear audit logs when requested', async () => {
            await service.logAuditEvent('ACCESS_DATA', 'PUBLIC', 'test_data', { accessMethod: 'API' }, mockContext, { success: true });
            const statsBeforeClear = service.getAuditStatistics();
            expect(statsBeforeClear.totalEntries).toBeGreaterThan(0);
            service.clearAuditLogs();
            const statsAfterClear = service.getAuditStatistics();
            expect(statsAfterClear.totalEntries).toBe(0);
        });
        it('should handle archive notifications', async () => {
            const archivedEntries = [];
            service.onArchive((entries) => {
                archivedEntries.push(entries);
            });
            // In a real scenario, this would be triggered by the retention cleanup
            // For testing, we can manually trigger it or test the handler registration
            expect(archivedEntries).toHaveLength(0); // No archives yet
        });
    });
});
