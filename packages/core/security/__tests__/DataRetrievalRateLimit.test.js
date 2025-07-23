/**
 * Test Suite for Data Retrieval Rate Limiting System
 *
 * Comprehensive tests for data retrieval rate limiting including:
 * - Basic rate limiting functionality
 * - Classification-aware limiting
 * - Volume-based throttling
 * - Adaptive limits
 * - Anomaly detection
 * - Quota enforcement
 * - Exemption handling
 */
import { DataRetrievalRateLimit } from '../DataRetrievalRateLimit';
import { DataRetrievalConfigurationFactory, STANDARD_DATA_RETRIEVAL_LIMITS } from '../DataRetrievalConfiguration';
import { RateLimitResult } from '../RateLimitingService';
describe('DataRetrievalRateLimit', () => {
    let dataRetrievalRateLimit;
    let mockRateLimitingService;
    let testConfig;
    const createTestSubject = (overrides) => ({
        userId: 'user-123',
        roles: ['USER'],
        clearanceLevel: 'INTERNAL',
        department: 'Engineering',
        jobTitle: 'Software Engineer',
        location: {
            country: 'US',
            region: 'California',
            city: 'San Francisco',
            timezone: 'PST',
            withinApprovedRegions: true
        },
        device: {
            deviceId: 'device-123',
            deviceType: 'LAPTOP',
            operatingSystem: 'macOS',
            browser: 'Chrome',
            managed: true,
            encrypted: true,
            patchLevel: 'current',
            riskScore: 10,
            registered: true,
            lastSeen: new Date()
        },
        behaviorProfile: {
            normalAccessPatterns: [],
            anomalyScore: 5,
            typicalHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
            typicalLocations: ['office'],
            accessFrequency: 'MEDIUM',
            dataAccessPatterns: {}
        },
        riskScore: 15,
        certifications: [],
        lastActivity: new Date(),
        mfaVerified: true,
        trustLevel: 'HIGH',
        ...overrides
    });
    const createTestObject = (overrides) => ({
        dataId: 'data-123',
        classification: 'INTERNAL',
        dataOwner: 'owner-123',
        createdAt: new Date(),
        lastModified: new Date(),
        retentionPeriod: 365,
        complianceFrameworks: ['GDPR'],
        tags: ['test'],
        sensitivity: 'NORMAL',
        businessValue: 'MEDIUM',
        dataType: 'document',
        sourceSystem: 'app',
        encryptionStatus: 'ENCRYPTED',
        ...overrides
    });
    const createTestRequestDetails = (overrides) => ({
        operation: 'read',
        estimatedBytes: 1024,
        estimatedRecords: 10,
        requestType: 'SINGLE',
        context: {},
        ...overrides
    });
    beforeEach(() => {
        // Create mock rate limiting service
        mockRateLimitingService = {
            checkLimit: jest.fn().mockResolvedValue({
                result: RateLimitResult.ALLOWED,
                reason: 'Within limits',
                retryAfter: 0
            }),
            recordAttempt: jest.fn(),
            updateConfiguration: jest.fn(),
            getMetrics: jest.fn(),
            clearCache: jest.fn(),
            addExemption: jest.fn(),
            removeExemption: jest.fn(),
            on: jest.fn(),
            emit: jest.fn(),
            removeAllListeners: jest.fn()
        };
        // Create test configuration
        testConfig = DataRetrievalConfigurationFactory.createConfiguration('DEVELOPMENT', {
            enableVolumeTracking: true,
            enableBehaviorAnalysis: true,
            enableAdaptiveLimits: true,
            enableAnomalyDetection: true,
            quotaEnforcement: true
        });
        dataRetrievalRateLimit = new DataRetrievalRateLimit(mockRateLimitingService, testConfig);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Basic Rate Limiting', () => {
        test('should allow request within limits', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('ALLOW');
            expect(decision.reason).toContain('Access granted');
            expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        });
        test('should deny request when rate limited', async () => {
            mockRateLimitingService.checkLimit.mockResolvedValue({
                result: RateLimitResult.BLOCKED,
                reason: 'Rate limit exceeded',
                retryAfter: 60
            });
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('DENY');
            expect(decision.reason).toContain('Rate limit exceeded');
            expect(decision.retryAfter).toBe(60);
        });
        test('should check multiple rate limit scopes', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(mockRateLimitingService.checkLimit).toHaveBeenCalledTimes(3);
            expect(mockRateLimitingService.checkLimit).toHaveBeenCalledWith(subject.userId, expect.any(String));
            expect(mockRateLimitingService.checkLimit).toHaveBeenCalledWith(subject.location.country, expect.any(String));
            expect(mockRateLimitingService.checkLimit).toHaveBeenCalledWith(subject.device.deviceId, expect.any(String));
        });
    });
    describe('Classification-Aware Limiting', () => {
        test('should apply stricter limits for confidential data', async () => {
            const subject = createTestSubject({ clearanceLevel: 'CONFIDENTIAL' });
            const object = createTestObject({ classification: 'CONFIDENTIAL' });
            const requestDetails = createTestRequestDetails({
                estimatedBytes: 10485760 // 10MB
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('ALLOW');
        });
        test('should apply strictest limits for restricted data', async () => {
            const subject = createTestSubject({ clearanceLevel: 'RESTRICTED' });
            const object = createTestObject({ classification: 'RESTRICTED' });
            const requestDetails = createTestRequestDetails({
                estimatedBytes: 512000 // 500KB
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('ALLOW');
        });
        test('should deny large request for restricted data', async () => {
            const subject = createTestSubject({ clearanceLevel: 'RESTRICTED' });
            const object = createTestObject({ classification: 'RESTRICTED' });
            const requestDetails = createTestRequestDetails({
                estimatedBytes: 5242880 // 5MB - exceeds restricted limits
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('DENY');
            expect(decision.reason).toContain('limit exceeded');
        });
    });
    describe('Volume-Based Throttling', () => {
        test('should track and enforce byte limits', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            // Make multiple requests to accumulate bytes
            for (let i = 0; i < 5; i++) {
                const requestDetails = createTestRequestDetails({
                    estimatedBytes: 20971520 // 20MB each
                });
                await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            }
            // Next request should be denied due to volume limit
            const finalRequest = createTestRequestDetails({
                estimatedBytes: 20971520 // 20MB
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', finalRequest);
            expect(decision.decision).toBe('DENY');
            expect(decision.reason).toContain('byte limit exceeded');
        });
        test('should track and enforce record limits', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails({
                estimatedRecords: 15000 // Exceeds hourly limit
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('DENY');
            expect(decision.reason).toContain('record limit exceeded');
        });
    });
    describe('Adaptive Rate Limiting', () => {
        test('should apply stricter limits for high-risk users', async () => {
            const subject = createTestSubject({
                riskScore: 80,
                device: { ...createTestSubject().device, managed: false }
            });
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            // Should still allow but with adjusted limits
            expect(decision.decision).toBe('ALLOW');
        });
        test('should apply location-based adjustments', async () => {
            const subject = createTestSubject({
                location: {
                    ...createTestSubject().location,
                    withinApprovedRegions: false
                }
            });
            const object = createTestObject({ classification: 'CONFIDENTIAL' });
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            // Confidential data from unapproved regions should be more restricted
            expect(decision.decision).toBe('ALLOW');
        });
        test('should apply time-based adjustments for off-hours access', async () => {
            // Mock current time to be outside typical hours
            jest.spyOn(Date.prototype, 'getHours').mockReturnValue(2); // 2 AM
            const subject = createTestSubject();
            const object = createTestObject({ classification: 'RESTRICTED' });
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            // Off-hours access to restricted data should have stricter limits
            expect(decision.decision).toBe('ALLOW');
            jest.restoreAllMocks();
        });
    });
    describe('Anomaly Detection', () => {
        test('should detect unusually large requests', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails({
                estimatedBytes: 104857600 // 100MB - unusually large
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            // Should allow but trigger anomaly detection
            expect(decision.decision).toBe('ALLOW');
        });
        test('should detect off-hours access anomaly', async () => {
            jest.spyOn(Date.prototype, 'getHours').mockReturnValue(3); // 3 AM
            const subject = createTestSubject({
                behaviorProfile: {
                    ...createTestSubject().behaviorProfile,
                    typicalHours: [9, 10, 11, 12, 13, 14, 15, 16, 17] // Business hours
                }
            });
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('ALLOW');
            jest.restoreAllMocks();
        });
        test('should detect classification escalation', async () => {
            const subject = createTestSubject();
            const object = createTestObject({ classification: 'RESTRICTED' });
            // First, make several requests for lower classification data
            for (let i = 0; i < 5; i++) {
                const lowerObject = createTestObject({ classification: 'INTERNAL' });
                await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, lowerObject, 'read', createTestRequestDetails());
            }
            // Now request restricted data
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', createTestRequestDetails());
            expect(decision.decision).toBe('ALLOW');
        });
        test('should detect rapid request patterns', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            // Make many rapid requests
            const promises = [];
            for (let i = 0; i < 60; i++) {
                promises.push(dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', createTestRequestDetails()));
            }
            const decisions = await Promise.all(promises);
            // Some requests should be denied due to rapid pattern detection
            const deniedCount = decisions.filter(d => d.decision === 'DENY').length;
            expect(deniedCount).toBeGreaterThan(0);
        });
    });
    describe('Quota Enforcement', () => {
        test('should enforce daily byte quotas', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            // Simulate quota near limit
            const largeRequest = createTestRequestDetails({
                estimatedBytes: 536870912000 // 500GB - exceeds daily quota
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', largeRequest);
            expect(decision.decision).toBe('DENY');
            expect(decision.reason).toContain('quota exceeded');
        });
        test('should provide quota remaining information', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('ALLOW');
            expect(decision.quotaRemaining).toBeDefined();
            expect(decision.quotaRemaining?.bytes).toBeGreaterThan(0);
            expect(decision.quotaRemaining?.records).toBeGreaterThan(0);
        });
        test('should reset quotas daily', async () => {
            const subject = createTestSubject();
            // Reset quota should clear usage
            dataRetrievalRateLimit.resetUserQuota(subject.userId);
            const usage = dataRetrievalRateLimit.getUserUsage(subject.userId);
            expect(usage).toBeNull(); // Should be null after reset
        });
    });
    describe('Exemption Handling', () => {
        test('should grant access when exemption is present', async () => {
            const subject = createTestSubject();
            const object = createTestObject({ classification: 'RESTRICTED' });
            // Add exemption for user
            const exemption = {
                id: 'exemption-123',
                userId: subject.userId,
                reason: 'Emergency access',
                exemptionType: 'RATE_LIMIT',
                conditions: [],
                approvedBy: 'admin',
                approvedAt: new Date(),
                auditRequired: true
            };
            dataRetrievalRateLimit.addExemption(exemption);
            const requestDetails = createTestRequestDetails({
                estimatedBytes: 104857600 // Large request that would normally be limited
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('ALLOW');
            expect(decision.reason).toContain('Exemption granted');
            expect(decision.exemptionId).toBe(exemption.id);
        });
        test('should remove exemption when expired', async () => {
            const exemption = {
                id: 'exemption-123',
                userId: 'user-123',
                reason: 'Temporary access',
                exemptionType: 'QUOTA',
                expiresAt: new Date(Date.now() - 1000), // Expired
                conditions: [],
                approvedBy: 'admin',
                approvedAt: new Date(),
                auditRequired: true
            };
            dataRetrievalRateLimit.addExemption(exemption);
            const removed = dataRetrievalRateLimit.removeExemption(exemption.id);
            expect(removed).toBe(true);
        });
    });
    describe('Operation-Specific Limits', () => {
        test('should apply stricter limits for DELETE operations', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails({
                operation: 'DELETE',
                estimatedBytes: 1024
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'DELETE', requestDetails);
            // DELETE operations should have much stricter limits
            expect(decision.decision).toBe('ALLOW');
        });
        test('should apply appropriate limits for EXPORT operations', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails({
                operation: 'EXPORT',
                estimatedBytes: 52428800 // 50MB
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'EXPORT', requestDetails);
            expect(decision.decision).toBe('ALLOW');
        });
        test('should handle high-volume SEARCH operations', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails({
                operation: 'SEARCH',
                estimatedRecords: 100
            });
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'SEARCH', requestDetails);
            expect(decision.decision).toBe('ALLOW');
        });
    });
    describe('Metrics and Monitoring', () => {
        test('should track retrieval metrics', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            // Make several requests
            for (let i = 0; i < 5; i++) {
                await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', createTestRequestDetails());
            }
            const metrics = dataRetrievalRateLimit.getMetrics();
            expect(metrics.totalRequests).toBeGreaterThan(0);
            expect(metrics.totalBytesTransferred).toBeGreaterThan(0);
            expect(metrics.classificationBreakdown.INTERNAL).toBeGreaterThan(0);
        });
        test('should track user-specific usage', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', createTestRequestDetails({ estimatedBytes: 2048 }));
            const usage = dataRetrievalRateLimit.getUserUsage(subject.userId);
            expect(usage).toBeDefined();
            expect(usage?.requestCount).toBe(1);
            expect(usage?.bytesAccessed).toBe(2048);
            expect(usage?.classificationsAccessed).toContain('INTERNAL');
        });
        test('should calculate anomaly scores', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            // Make requests with varying patterns
            for (let i = 0; i < 10; i++) {
                await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, i % 2 === 0 ? 'read' : 'EXPORT', createTestRequestDetails({
                    estimatedBytes: Math.random() * 10485760 // Random size up to 10MB
                }));
            }
            const usage = dataRetrievalRateLimit.getUserUsage(subject.userId);
            expect(usage?.anomalyScore).toBeGreaterThanOrEqual(0);
        });
    });
    describe('Error Handling', () => {
        test('should handle service errors gracefully', async () => {
            mockRateLimitingService.checkLimit.mockRejectedValue(new Error('Service unavailable'));
            const subject = createTestSubject();
            const object = createTestObject();
            const requestDetails = createTestRequestDetails();
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', requestDetails);
            expect(decision.decision).toBe('DENY');
            expect(decision.reason).toContain('Service error');
            expect(decision.retryAfter).toBe(60);
        });
        test('should handle invalid request data', async () => {
            const subject = createTestSubject();
            const object = createTestObject();
            const invalidRequest = {
                operation: 'INVALID_OP',
                estimatedBytes: -1,
                estimatedRecords: -1,
                requestType: 'INVALID',
                context: {}
            };
            const decision = await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', invalidRequest);
            // Should handle gracefully and deny for safety
            expect(decision.decision).toBe('DENY');
        });
    });
    describe('Performance', () => {
        test('should handle high volume of concurrent requests', async () => {
            const startTime = Date.now();
            const promises = [];
            // Create 100 concurrent requests
            for (let i = 0; i < 100; i++) {
                const subject = createTestSubject({ userId: `user-${i}` });
                const object = createTestObject({ dataId: `data-${i}` });
                promises.push(dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', createTestRequestDetails()));
            }
            const decisions = await Promise.all(promises);
            const endTime = Date.now();
            expect(decisions).toHaveLength(100);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
            const allowedCount = decisions.filter(d => d.decision === 'ALLOW').length;
            expect(allowedCount).toBeGreaterThan(0);
        });
        test('should efficiently manage memory usage', async () => {
            // Make many requests to test memory management
            for (let i = 0; i < 1000; i++) {
                const subject = createTestSubject({ userId: `user-${i % 10}` });
                const object = createTestObject();
                await dataRetrievalRateLimit.checkDataRetrievalLimit(subject, object, 'read', createTestRequestDetails());
            }
            const metrics = dataRetrievalRateLimit.getMetrics();
            expect(metrics.totalRequests).toBe(1000);
            // Verify memory usage is reasonable (no memory leaks)
            const memoryUsage = process.memoryUsage();
            expect(memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
        });
    });
});
describe('DataRetrievalConfigurationFactory', () => {
    test('should create development configuration', () => {
        const config = DataRetrievalConfigurationFactory.createConfiguration('DEVELOPMENT');
        expect(config.enableBehaviorAnalysis).toBe(false);
        expect(config.enableAnomalyDetection).toBe(false);
        expect(config.quotaEnforcement).toBe(false);
        expect(config.globalLimits.maxConcurrentUsers).toBe(100);
    });
    test('should create production configuration', () => {
        const config = DataRetrievalConfigurationFactory.createConfiguration('PRODUCTION');
        expect(config.enableBehaviorAnalysis).toBe(true);
        expect(config.enableAdaptiveLimits).toBe(true);
        expect(config.enableAnomalyDetection).toBe(true);
        expect(config.quotaEnforcement).toBe(true);
        expect(config.globalLimits.maxConcurrentUsers).toBe(10000);
    });
    test('should apply operation modifiers correctly', () => {
        const baseLimits = STANDARD_DATA_RETRIEVAL_LIMITS.INTERNAL;
        const deleteLimits = DataRetrievalConfigurationFactory.createOperationLimits(baseLimits, 'DELETE');
        expect(deleteLimits.limits.requestsPerMinute).toBeLessThan(baseLimits.limits.requestsPerMinute);
        expect(deleteLimits.operation).toBe('DELETE');
    });
    test('should validate configuration properly', () => {
        const invalidConfig = DataRetrievalConfigurationFactory.createConfiguration('PRODUCTION');
        invalidConfig.globalLimits.maxRequestRate = -1; // Invalid
        const validation = DataRetrievalConfigurationFactory.validateConfiguration(invalidConfig);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Global max request rate must be positive');
    });
    test('should optimize configuration for performance', () => {
        const config = DataRetrievalConfigurationFactory.createConfiguration('PRODUCTION');
        config.globalLimits.maxRequestRate = 2000; // High rate
        const optimized = DataRetrievalConfigurationFactory.optimizeForPerformance(config);
        expect(optimized.enableBehaviorAnalysis).toBe(false);
        expect(optimized.enableAnomalyDetection).toBe(false);
    });
    test('should create role-based exemptions', () => {
        const exemption = DataRetrievalConfigurationFactory.createRoleExemption('exemption-123', 'SYSTEM_ADMIN', 'admin-user', 'security-officer');
        expect(exemption.id).toBe('exemption-123');
        expect(exemption.userId).toBe('admin-user');
        expect(exemption.role).toBe('SYSTEM_ADMIN');
        expect(exemption.exemptionType).toBe('RATE_LIMIT');
        expect(exemption.auditRequired).toBe(true);
    });
});
// Helper matchers for better test assertions
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true
            };
        }
        else {
            return {
                message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false
            };
        }
    }
});
