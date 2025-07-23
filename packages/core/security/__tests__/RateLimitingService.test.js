/**
 * Test Suite for Rate Limiting Service
 *
 * Tests comprehensive rate limiting, backoff strategies, threat detection,
 * and adaptive protection mechanisms for authentication endpoints.
 */
import { RateLimitingService, ThreatLevel, RateLimitResult } from '../RateLimitingService';
describe('RateLimitingService', () => {
    let service;
    let mockDate;
    beforeEach(() => {
        mockDate = new Date('2025-01-15T10:00:00Z');
        jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime(as, unknown));
        service = new RateLimitingService();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('Basic Rate Limiting', () => {
        test('should allow requests within limits', async () => {
            const identifier = 'user@example.com';
            const endpoint = '/auth/login';
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.ALLOWED);
            expect(result.remainingRequests).toBeGreaterThan(0);
            expect(result.threatLevel).toBe(ThreatLevel.LOW);
        });
        test('should block requests exceeding per-minute limit', async () => {
            const identifier = 'aggressive-user@example.com';
            const endpoint = '/auth/login';
            // Record 10 failed attempts (exceeds login limit)
            for (let i = 0; i < 10; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.BLOCKED);
            expect(result.remainingRequests).toBe(0);
            expect(result.retryAfter).toBeGreaterThan(0);
        });
        test('should handle different endpoints independently', async () => {
            const identifier = 'multi-endpoint-user@example.com';
            const loginEndpoint = '/auth/login';
            const mfaEndpoint = '/auth/mfa/verify';
            // Exhaust login attempts
            for (let i = 0; i < 10; i++) {
                service.recordAttempt(identifier, loginEndpoint, false);
            }
            const loginResult = await service.checkRateLimit(identifier, loginEndpoint);
            const mfaResult = await service.checkRateLimit(identifier, mfaEndpoint);
            expect(loginResult.result).toBe(RateLimitResult.BLOCKED);
            expect(mfaResult.result).toBe(RateLimitResult.ALLOWED);
        });
    });
    describe('Backoff Strategies', () => {
        test('should implement exponential backoff', async () => {
            const identifier = 'backoff-test-user';
            const endpoint = '/auth/login';
            // First failure
            service.recordAttempt(identifier, endpoint, false);
            await service.checkRateLimit(identifier, endpoint);
            let delay1 = service.getCalculatedBackoffDelay(identifier, endpoint);
            // Second failure
            service.recordAttempt(identifier, endpoint, false);
            await service.checkRateLimit(identifier, endpoint);
            let delay2 = service.getCalculatedBackoffDelay(identifier, endpoint);
            expect(delay2).toBeGreaterThan(delay1);
            expect(delay2).toBeGreaterThanOrEqual(delay1 * 2); // Exponential growth
        });
        test('should reset backoff on successful attempt', async () => {
            const identifier = 'success-reset-user';
            const endpoint = '/auth/login';
            // Create backoff with failures
            service.recordAttempt(identifier, endpoint, false);
            service.recordAttempt(identifier, endpoint, false);
            let delayBefore = service.getBackoffDelay(identifier, endpoint);
            expect(delayBefore).toBeGreaterThan(0);
            // Successful attempt should reset
            service.recordAttempt(identifier, endpoint, true);
            let delayAfter = service.getBackoffDelay(identifier, endpoint);
            expect(delayAfter).toBe(0);
        });
        test('should cap backoff delay at maximum', async () => {
            const identifier = 'max-delay-user';
            const endpoint = '/auth/login';
            // Generate many failures to test max delay
            for (let i = 0; i < 20; i++) {
                service.recordAttempt(identifier, endpoint, false);
                await service.checkRateLimit(identifier, endpoint);
            }
            const delay = service.getBackoffDelay(identifier, endpoint);
            expect(delay).toBeLessThanOrEqual(3600); // Max delay is 1 hour for login
        });
    });
    describe('Threat Detection and Adaptive Limits', () => {
        test('should detect high threat level for rapid failures', async () => {
            const identifier = 'threat-user@example.com';
            const endpoint = '/auth/login';
            // Record many rapid failures
            for (let i = 0; i < 15; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            const result = await service.checkRateLimit(identifier, endpoint);
            expect([ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL]).toContain(result.threatLevel);
            expect(result.adaptiveMultiplier).toBeLessThan(1.0);
        });
        test('should apply adaptive limits based on threat level', async () => {
            const lowThreatUser = 'low-threat@example.com';
            const highThreatUser = 'high-threat@example.com';
            const endpoint = '/auth/login';
            // Create high threat context for second user
            for (let i = 0; i < 10; i++) {
                service.recordAttempt(highThreatUser, endpoint, false);
            }
            const lowThreatResult = await service.checkRateLimit(lowThreatUser, endpoint);
            const highThreatResult = await service.checkRateLimit(highThreatUser, endpoint);
            expect(lowThreatResult.adaptiveMultiplier).toBeGreaterThan(highThreatResult.adaptiveMultiplier);
        });
        test('should escalate threat level with multiple endpoint attacks', async () => {
            const identifier = 'multi-attack@example.com';
            const endpoints = ['/auth/login', '/auth/mfa/verify', '/auth/password/reset'];
            // Attack multiple endpoints
            for (const endpoint of endpoints) {
                for (let i = 0; i < 5; i++) {
                    service.recordAttempt(identifier, endpoint, false);
                }
            }
            const result = await service.checkRateLimit(identifier, '/auth/login');
            expect([ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL]).toContain(result.threatLevel);
        });
    });
    describe('Exemption Management', () => {
        test('should allow exempted identifiers to bypass limits', async () => {
            const identifier = 'exempted-user@example.com';
            const endpoint = '/auth/login';
            // Add exemption
            service.addExemption(identifier, 'testing');
            // Try to exceed limits
            for (let i = 0; i < 20; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.ALLOWED);
        });
        test('should emit exemption events', () => {
            const identifier = 'event-test@example.com';
            let exemptionAdded = false;
            let exemptionRemoved = false;
            service.on('exemptionAdded', () => { exemptionAdded = true; });
            service.on('exemptionRemoved', () => { exemptionRemoved = true; });
            service.addExemption(identifier);
            expect(exemptionAdded).toBe(true);
            service.removeExemption(identifier);
            expect(exemptionRemoved).toBe(true);
        });
        test('should return false when removing non-existent exemption', () => {
            const result = service.removeExemption('non-existent@example.com');
            expect(result).toBe(false);
        });
    });
    describe('Endpoint-Specific Configurations', () => {
        test('should apply stricter limits to MFA endpoints', async () => {
            const identifier = 'mfa-test@example.com';
            const loginEndpoint = '/auth/login';
            const mfaEndpoint = '/auth/mfa/verify';
            // MFA should have stricter limits than login
            // Login allows 10 per minute, MFA allows 5 per minute
            // Test login limit - use successful attempts to avoid threat level increase
            for (let i = 0; i < 8; i++) {
                // Advance time by 2 seconds between attempts to avoid per-second limit (2/sec)
                // Use successful attempts to keep threat level LOW (threat detection reduces limits)
                mockDate = new Date(mockDate.getTime() + 2000);
                jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime(as, unknown));
                service.recordAttempt(identifier, loginEndpoint, true);
            }
            const loginResult = await service.checkRateLimit(identifier, loginEndpoint);
            // Reset time for MFA test
            mockDate = new Date('2025-01-15T10:00:00Z');
            jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime(as, unknown));
            // Test MFA limit - use successful attempts to avoid threat level increase  
            for (let i = 0; i < 4; i++) {
                // Advance time by 2 seconds between attempts to avoid per-second limit (1/sec for MFA)
                // Use successful attempts to keep threat level LOW (threat detection reduces limits)
                mockDate = new Date(mockDate.getTime() + 2000);
                jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime(as, unknown));
                service.recordAttempt(identifier, mfaEndpoint, true);
            }
            const mfaResult = await service.checkRateLimit(identifier, mfaEndpoint);
            expect(loginResult.result).toBe(RateLimitResult.ALLOWED);
            expect(mfaResult.result).toBe(RateLimitResult.ALLOWED);
            // One more MFA attempt should block (5 + 1 = 6 > limit of 5)
            mockDate = new Date(mockDate.getTime() + 2000);
            jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime(as, unknown));
            service.recordAttempt(identifier, mfaEndpoint, true);
            const mfaBlockedResult = await service.checkRateLimit(identifier, mfaEndpoint);
            expect(mfaBlockedResult.result).toBe(RateLimitResult.BLOCKED);
        });
        test('should apply very strict limits to password reset', async () => {
            const identifier = 'reset-test@example.com';
            const endpoint = '/auth/password/reset';
            // Password reset allows only 3 per minute
            for (let i = 0; i < 3; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.BLOCKED);
        });
        test('should apply strictest limits to registration', async () => {
            const identifier = 'register-test@example.com';
            const endpoint = '/auth/register';
            // Registration allows only 2 per minute
            for (let i = 0; i < 2; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.BLOCKED);
        });
    });
    describe('Limit Reset and Statistics', () => {
        test('should reset limits for specific endpoint', async () => {
            const identifier = 'reset-test@example.com';
            const endpoint = '/auth/login';
            // Create blocked state
            for (let i = 0; i < 10; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            let result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.BLOCKED);
            // Reset limits
            service.resetLimits(identifier, endpoint);
            result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.ALLOWED);
        });
        test('should reset all limits for identifier', async () => {
            const identifier = 'reset-all-test@example.com';
            const endpoints = ['/auth/login', '/auth/mfa/verify'];
            // Block both endpoints
            for (const endpoint of endpoints) {
                for (let i = 0; i < 10; i++) {
                    service.recordAttempt(identifier, endpoint, false);
                }
            }
            // Reset all
            service.resetLimits(identifier);
            for (const endpoint of endpoints) {
                const result = await service.checkRateLimit(identifier, endpoint);
                expect(result.result).toBe(RateLimitResult.ALLOWED);
            }
        });
        test('should provide accurate statistics', async () => {
            const identifier = 'stats-test@example.com';
            const endpoint = '/auth/login';
            // Generate some activity
            for (let i = 0; i < 5; i++) {
                service.recordAttempt(identifier, endpoint, true);
                service.recordAttempt(identifier, endpoint, false);
            }
            const stats = service.getStatistics();
            expect(stats.totalAttempts).toBe(10);
            expect(stats.blockedAttempts).toBe(5);
            expect(stats.threatLevels[ThreatLevel.LOW]).toBeGreaterThan(0);
            expect(stats.topEndpoints).toContainEqual(expect.objectContaining({ endpoint: '/auth/login' }));
        });
    });
    describe('Warning Thresholds', () => {
        test('should return warning when approaching limits', async () => {
            const identifier = 'warning-test@example.com';
            const endpoint = '/auth/login';
            // Approach but don't exceed 80% of limit (8 out of 10)
            // Use successful attempts to avoid threat level increase
            for (let i = 0; i < 8; i++) {
                // Advance time by 2 seconds between attempts to avoid per-second limit
                // Use successful attempts to keep threat level LOW (threat detection reduces limits)
                mockDate = new Date(mockDate.getTime() + 2000);
                jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime(as, unknown));
                service.recordAttempt(identifier, endpoint, true);
            }
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.WARNING);
        });
    });
    describe('Per-Second Rate Limiting', () => {
        test('should block rapid requests within same second', async () => {
            const identifier = 'rapid-test@example.com';
            const endpoint = '/auth/login';
            // Login allows 2 per second, so 3rd should be blocked
            service.recordAttempt(identifier, endpoint, false);
            service.recordAttempt(identifier, endpoint, false);
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.BLOCKED);
            expect(result.retryAfter).toBe(1); // Should retry after 1 second
        });
    });
    describe('Event Emission', () => {
        test('should emit rate limit exceeded events', async () => {
            const identifier = 'event-test@example.com';
            const endpoint = '/auth/login';
            let eventEmitted = false;
            service.on('rateLimitExceeded', (data) => {
                eventEmitted = true;
                expect(data.identifier).toBe(identifier);
                expect(data.endpoint).toBe(endpoint);
            });
            // Exceed limits
            for (let i = 0; i < 10; i++) {
                service.recordAttempt(identifier, endpoint, false);
            }
            await service.checkRateLimit(identifier, endpoint);
            expect(eventEmitted).toBe(true);
        });
        test('should emit attempt recorded events', () => {
            const identifier = 'record-test@example.com';
            const endpoint = '/auth/login';
            let attemptRecorded = false;
            service.on('attemptRecorded', (attempt) => {
                attemptRecorded = true;
                expect(attempt.identifier).toBe(identifier);
                expect(attempt.endpoint).toBe(endpoint);
            });
            service.recordAttempt(identifier, endpoint, true);
            expect(attemptRecorded).toBe(true);
        });
    });
    describe('Edge Cases and Error Handling', () => {
        test('should handle unknown endpoints with default config', async () => {
            const identifier = 'unknown-endpoint@example.com';
            const endpoint = '/unknown/endpoint';
            const result = await service.checkRateLimit(identifier, endpoint);
            expect(result.result).toBe(RateLimitResult.ALLOWED);
            expect(result.remainingRequests).toBeGreaterThan(0);
        });
        test('should handle concurrent requests safely', async () => {
            const identifier = 'concurrent-test@example.com';
            const endpoint = '/auth/login';
            // Simulate concurrent requests
            const promises = Array.from({ length: 5 }, () => service.checkRateLimit(identifier, endpoint));
            const results = await Promise.all(promises);
            // All should complete without errors
            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect([
                    RateLimitResult.ALLOWED,
                    RateLimitResult.WARNING,
                    RateLimitResult.BLOCKED
                ]).toContain(result.result);
            });
        });
        test('should handle empty metadata gracefully', async () => {
            const identifier = 'minimal-metadata@example.com';
            const endpoint = '/auth/login';
            const result = await service.checkRateLimit(identifier, endpoint, {});
            expect(result.result).toBe(RateLimitResult.ALLOWED);
        });
    });
});
