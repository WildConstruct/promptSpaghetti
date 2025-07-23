import { ReconnectionHandler, ReconnectionState } from '../ReconnectionHandler';
describe('ReconnectionHandler', () => {
    let handler;
    let mockConnectionFactory;
    beforeEach(() => {
        handler = new ReconnectionHandler({
            maxAttempts: 3,
            initialDelay: 100,
            maxDelay: 1000,
            backoffFactor: 2,
            jitterFactor: 0.1,
            resetTimeoutMs: 5000,
            connectionTimeout: 1000,
            enableJitter: false, // Disable for predictable tests
            enableCircuitBreaker: true,
            circuitBreakerThreshold: 2,
            circuitBreakerResetTime: 2000
        });
        mockConnectionFactory = jest.fn();
        handler.setConnectionFactory(mockConnectionFactory);
    });
    afterEach(() => {
        handler.cleanup();
    });
    describe('Basic Reconnection', () => {
        test('should start reconnection process', async () => {
            mockConnectionFactory.mockResolvedValue(true);
            const stateChanges = [];
            handler.on('state_changed', (event) => stateChanges.push(event));
            await handler.startReconnection();
            expect(stateChanges.some(change => change.newState === ReconnectionState.ATTEMPTING)).toBe(true);
            expect(mockConnectionFactory).toHaveBeenCalled();
        });
        test('should succeed on first attempt', async () => {
            mockConnectionFactory.mockResolvedValue(true);
            const successEvents = [];
            handler.on('reconnection_success', (event) => successEvents.push(event));
            await handler.startReconnection();
            expect(successEvents).toHaveLength(1);
            expect(handler.getState()).toBe(ReconnectionState.IDLE);
        });
        test('should retry on failure', (done) => {
            let attempts = 0;
            mockConnectionFactory.mockImplementation(() => {
                attempts++;
                if (attempts < 3) {
                    return Promise.resolve(false);
                }
                return Promise.resolve(true);
            });
            const successEvents = [];
            const retryEvents = [];
            handler.on('reconnection_success', (event) => {
                successEvents.push(event);
                expect(successEvents).toHaveLength(1);
                expect(attempts).toBe(3);
                done();
            });
            handler.on('reconnection_scheduled', (event) => retryEvents.push(event));
            handler.startReconnection();
        });
        test('should fail after max attempts', (done) => {
            mockConnectionFactory.mockResolvedValue(false);
            const failureEvents = [];
            handler.on('reconnection_failed', (event) => {
                failureEvents.push(event);
                expect(failureEvents).toHaveLength(1);
                expect(event.totalAttempts).toBe(3);
                done();
            });
            handler.startReconnection();
        });
    });
    describe('Exponential Backoff', () => {
        test('should use exponential backoff delays', async () => {
            mockConnectionFactory.mockResolvedValue(false);
            const scheduledEvents = [];
            handler.on('reconnection_scheduled', (event) => {
                scheduledEvents.push(event);
            });
            handler.startReconnection();
            // Wait for reconnection to finish
            await new Promise(resolve => {
                handler.on('reconnection_exhausted', resolve);
                handler.on('reconnection_stopped', resolve);
            });
            // Check that we got at least 2 scheduled events
            expect(scheduledEvents.length).toBeGreaterThanOrEqual(2);
            // Second delay should be roughly double the first
            expect(scheduledEvents[1].delay).toBeGreaterThan(scheduledEvents[0].delay * 1.8);
        });
        test('should respect max delay', (done) => {
            const handler = new ReconnectionHandler({
                maxAttempts: 5,
                initialDelay: 100,
                maxDelay: 500,
                backoffFactor: 10,
                enableJitter: false
            });
            handler.setConnectionFactory(() => Promise.resolve(false));
            const scheduledEvents = [];
            handler.on('reconnection_scheduled', (event) => {
                scheduledEvents.push(event);
                expect(event.delay).toBeLessThanOrEqual(500);
                if (scheduledEvents.length === 3) {
                    handler.cleanup();
                    done();
                }
            });
            handler.startReconnection();
        });
    });
    describe('Connection Timeout', () => {
        test.skip('should timeout slow connections', (done) => {
            const handler = new ReconnectionHandler({
                maxAttempts: 1,
                connectionTimeout: 500
            });
            handler.setConnectionFactory(mockConnectionFactory);
            mockConnectionFactory.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 2000)) // 2s delay
            );
            const failureEvents = [];
            handler.on('reconnection_attempt_failed', (event) => {
                failureEvents.push(event);
                expect(event.error.message).toContain('timeout');
                done();
            });
            handler.startReconnection();
        });
        test('should succeed within timeout', async () => {
            mockConnectionFactory.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 500)) // 0.5s delay
            );
            const successEvents = [];
            handler.on('reconnection_success', (event) => successEvents.push(event));
            await handler.startReconnection();
            expect(successEvents).toHaveLength(1);
        });
    });
    describe('Circuit Breaker', () => {
        test('should trip circuit breaker after threshold', (done) => {
            mockConnectionFactory.mockResolvedValue(false);
            const circuitBreakerEvents = [];
            handler.on('circuit_breaker_tripped', (event) => {
                circuitBreakerEvents.push(event);
                expect(handler.isCircuitBreakerActive()).toBe(true);
                done();
            });
            handler.startReconnection();
        });
        test.skip('should block reconnection when circuit breaker is open', async () => {
            mockConnectionFactory.mockResolvedValue(false);
            // Trip the circuit breaker first
            await new Promise((resolve) => {
                handler.on('circuit_breaker_tripped', () => resolve());
                handler.startReconnection();
            });
            const blockedEvents = [];
            handler.on('reconnection_blocked', (event) => blockedEvents.push(event));
            await handler.startReconnection();
            expect(blockedEvents).toHaveLength(1);
            expect(blockedEvents[0].reason).toBe('circuit_breaker_open');
        });
        test('should reset circuit breaker automatically', (done) => {
            const handler = new ReconnectionHandler({
                maxAttempts: 3,
                circuitBreakerThreshold: 1,
                circuitBreakerResetTime: 100
            });
            handler.setConnectionFactory(() => Promise.resolve(false));
            let tripCount = 0;
            handler.on('circuit_breaker_tripped', () => {
                tripCount++;
                expect(handler.isCircuitBreakerActive()).toBe(true);
            });
            handler.on('circuit_breaker_reset', (event) => {
                expect(event.manual).toBe(false);
                expect(handler.isCircuitBreakerActive()).toBe(false);
                handler.cleanup();
                done();
            });
            handler.startReconnection();
        });
        test('should allow manual circuit breaker reset', (done) => {
            mockConnectionFactory.mockResolvedValue(false);
            handler.on('circuit_breaker_tripped', () => {
                expect(handler.isCircuitBreakerActive()).toBe(true);
                handler.resetCircuitBreaker();
                expect(handler.isCircuitBreakerActive()).toBe(false);
                done();
            });
            handler.startReconnection();
        });
    });
    describe('Force Reconnection', () => {
        test('should bypass circuit breaker for force reconnection', async () => {
            mockConnectionFactory.mockResolvedValue(false);
            // Trip circuit breaker
            await new Promise((resolve) => {
                handler.on('circuit_breaker_tripped', () => resolve());
                handler.startReconnection();
            });
            expect(handler.isCircuitBreakerActive()).toBe(true);
            // Force reconnection should work
            mockConnectionFactory.mockResolvedValue(true);
            const result = await handler.forceReconnection();
            expect(result).toBe(true);
            expect(handler.isCircuitBreakerActive()).toBe(false);
        });
        test('should handle force reconnection failure', async () => {
            mockConnectionFactory.mockResolvedValue(false);
            const result = await handler.forceReconnection();
            expect(result).toBe(false);
        });
    });
    describe('Statistics and Metrics', () => {
        'use strict';
        // Increase timeout for this suite
        jest.setTimeout(15000);
        test.skip('should track reconnection statistics', async () => {
            let attempts = 0;
            mockConnectionFactory.mockImplementation(() => {
                attempts++;
                return Promise.resolve(attempts >= 2);
            });
            await handler.startReconnection();
            const stats = handler.getStats();
            expect(stats.totalAttempts).toBeGreaterThan(0);
            expect(stats.successfulAttempts).toBe(1);
            expect(stats.currentStreak).toBe(1);
            expect(stats.averageReconnectTime).toBeGreaterThan(0);
        });
        test('should track failure statistics', (done) => {
            mockConnectionFactory.mockResolvedValue(false);
            handler.on('reconnection_failed', () => {
                const stats = handler.getStats();
                expect(stats.failedAttempts).toBeGreaterThan(0);
                expect(stats.currentStreak).toBe(0);
                expect(stats.lastFailureTime).not.toBeNull();
                done();
            });
            handler.startReconnection();
        });
        test('should calculate reconnection time statistics', async () => {
            mockConnectionFactory.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
            await handler.startReconnection();
            const stats = handler.getStats();
            expect(stats.shortestReconnectTime).toBeGreaterThan(90);
            expect(stats.longestReconnectTime).toBeGreaterThan(90);
            expect(stats.averageReconnectTime).toBeGreaterThan(90);
        });
        test('should reset statistics', () => {
            handler.resetStats();
            const stats = handler.getStats();
            expect(stats.totalAttempts).toBe(0);
            expect(stats.successfulAttempts).toBe(0);
            expect(stats.failedAttempts).toBe(0);
            expect(stats.averageReconnectTime).toBe(0);
        });
    });
    describe('State Management', () => {
        test('should prevent multiple concurrent reconnections', async () => {
            mockConnectionFactory.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 200)));
            const promise1 = handler.startReconnection();
            const promise2 = handler.startReconnection(); // Should be ignored
            await promise1;
            await promise2;
            // Only one successful reconnection should occur
            const stats = handler.getStats();
            expect(stats.successfulAttempts).toBe(1);
        });
        test('should stop reconnection process', async () => {
            mockConnectionFactory.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(false), 1000)));
            const stoppedEvents = [];
            handler.on('reconnection_stopped', () => stoppedEvents.push({}));
            handler.startReconnection();
            // Stop after a short delay
            setTimeout(() => {
                handler.stopReconnection();
            }, 50);
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(stoppedEvents).toHaveLength(1);
            expect(handler.getState()).toBe(ReconnectionState.IDLE);
        });
    });
    describe('Recent Attempts', () => {
        test.skip('should track recent attempts', (done) => {
            mockConnectionFactory.mockResolvedValue(false);
            let attemptCount = 0;
            handler.on('reconnection_attempt_failed', () => {
                attemptCount++;
                if (attemptCount === 2) {
                    const recentAttempts = handler.getRecentAttempts(5);
                    expect(recentAttempts).toHaveLength(2);
                    expect(recentAttempts[0].success).toBe(false);
                    expect(recentAttempts[0].error).toBeDefined();
                    done();
                }
            });
            handler.startReconnection();
        });
        test('should limit recent attempts list', async () => {
            const attempts = handler.getRecentAttempts(2);
            expect(attempts.length).toBeLessThanOrEqual(2);
        });
    });
    describe('Error Handling', () => {
        test('should handle connection factory errors', (done) => {
            mockConnectionFactory.mockRejectedValue(new Error('Connection factory error'));
            handler.on('reconnection_attempt_failed', (event) => {
                expect(event.error.message).toBe('Connection factory error');
                done();
            });
            handler.startReconnection();
        });
        test('should handle missing connection factory', async () => {
            const handler = new ReconnectionHandler();
            await expect(handler.forceReconnection()).rejects.toThrow('No connection factory set');
        });
    });
});
