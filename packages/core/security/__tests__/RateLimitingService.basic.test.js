/**
 * Basic Test Suite for Rate Limiting Service
 *
 * Tests core rate limiting functionality.
 */
import { RateLimitingService, RateLimitResult, ThreatLevel } from '../RateLimitingService';
describe('RateLimitingService - Basic Tests', () => {
    let service;
    beforeEach(() => {
        service = new RateLimitingService();
    });
    test('should create service instance', () => {
        expect(service).toBeInstanceOf(RateLimitingService);
    });
    test('should allow first request', async () => {
        const result = await service.checkRateLimit('user@test.com', '/auth/login');
        expect(result.result).toBe(RateLimitResult.ALLOWED);
        expect(result.threatLevel).toBe(ThreatLevel.LOW);
        expect(result.remainingRequests).toBeGreaterThan(0);
    });
    test('should block after exceeding limits', async () => {
        const identifier = 'blocked-user@test.com';
        const endpoint = '/auth/login';
        // Record many failed attempts
        for (let i = 0; i < 15; i++) {
            service.recordAttempt(identifier, endpoint, false);
        }
        const result = await service.checkRateLimit(identifier, endpoint);
        expect(result.result).toBe(RateLimitResult.BLOCKED);
    });
    test('should track exemptions correctly', async () => {
        const identifier = 'exempted@test.com';
        const endpoint = '/auth/login';
        service.addExemption(identifier);
        // Try to exceed limits
        for (let i = 0; i < 20; i++) {
            service.recordAttempt(identifier, endpoint, false);
        }
        const result = await service.checkRateLimit(identifier, endpoint);
        expect(result.result).toBe(RateLimitResult.ALLOWED);
    });
    test('should provide statistics', () => {
        const stats = service.getStatistics();
        expect(stats).toHaveProperty('totalAttempts');
        expect(stats).toHaveProperty('blockedAttempts');
        expect(stats).toHaveProperty('activeBackoffs');
        expect(stats).toHaveProperty('threatLevels');
        expect(stats).toHaveProperty('topEndpoints');
    });
    test('should handle backoff delays', async () => {
        const identifier = 'backoff@test.com';
        const endpoint = '/auth/login';
        // Create failure to trigger backoff
        service.recordAttempt(identifier, endpoint, false);
        await service.checkRateLimit(identifier, endpoint);
        const delay = service.getBackoffDelay(identifier, endpoint);
        expect(delay).toBeGreaterThanOrEqual(0);
    });
    test('should reset limits', async () => {
        const identifier = 'reset@test.com';
        const endpoint = '/auth/login';
        // Create blocked state
        for (let i = 0; i < 15; i++) {
            service.recordAttempt(identifier, endpoint, false);
        }
        let result = await service.checkRateLimit(identifier, endpoint);
        expect(result.result).toBe(RateLimitResult.BLOCKED);
        // Reset and verify
        service.resetLimits(identifier, endpoint);
        result = await service.checkRateLimit(identifier, endpoint);
        expect(result.result).toBe(RateLimitResult.ALLOWED);
    });
});
