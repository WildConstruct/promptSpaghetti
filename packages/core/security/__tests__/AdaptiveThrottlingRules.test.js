/**
 * Tests for Adaptive Throttling Rules System
 * Task: E17-1753114397229-D69134 - Implement throttling rules
 */
import { AdaptiveThrottlingRulesEngine, ThrottlingMode, SystemCondition } from '../AdaptiveThrottlingRules';
import { RateLimitingService, ThreatLevel } from '../RateLimitingService';
// Mock RateLimitingService
jest.mock('../RateLimitingService', () => ({
    RateLimitingService: jest.fn().mockImplementation(() => ({
        checkRateLimit: jest.fn(),
        recordAttempt: jest.fn(),
        addExemption: jest.fn(),
        removeExemption: jest.fn(),
        resetLimits: jest.fn(),
        getStatistics: jest.fn()
    })),
    ThreatLevel: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    }
}));
describe('AdaptiveThrottlingRulesEngine', () => {
    let engine;
    let mockRateLimitingService;
    beforeEach(() => {
        mockRateLimitingService = new RateLimitingService();
        engine = new AdaptiveThrottlingRulesEngine(mockRateLimitingService, false); // Don't initialize default rules
    });
    afterEach(() => {
        engine.cleanup();
    });
    describe('Rule Management', () => {
        test('should add and retrieve rules', () => {
            const rule = {
                id: 'test-rule',
                name: 'Test Rule',
                description: 'Test throttling rule',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/test'
                    }
                ],
                baseDelay: 100,
                maxDelay: 1000,
                adaptiveMultiplier: 1.5,
                escalationSteps: [],
                failureThreshold: 5,
                recoveryTimeout: 30000,
                halfOpenRequests: 3,
                loadThreshold: 80,
                shedPercentage: 25,
                tokensPerSecond: 10,
                burstSize: 50,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            const retrieved = engine.getRule('test-rule');
            expect(retrieved).toEqual(rule);
        });
        test('should remove rules', () => {
            const rule = {
                id: 'test-rule',
                name: 'Test Rule',
                description: 'Test throttling rule',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [],
                baseDelay: 100,
                maxDelay: 1000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: false,
                alertThreshold: 0,
                logViolations: false
            };
            engine.addRule(rule);
            expect(engine.getRule('test-rule')).toBeDefined();
            const removed = engine.removeRule('test-rule');
            expect(removed).toBe(true);
            expect(engine.getRule('test-rule')).toBeUndefined();
        });
        test('should validate rules on addition', () => {
            const invalidRule = {
                id: '', // Invalid: empty ID
                name: 'Invalid Rule',
                description: 'Invalid rule',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [],
                baseDelay: 1000,
                maxDelay: 100, // Invalid: max < base
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: false,
                alertThreshold: 0,
                logViolations: false
            };
            expect(() => engine.addRule(invalidRule)).toThrow();
        });
    });
    describe('System Condition Assessment', () => {
        test('should correctly assess normal condition', () => {
            engine.updateSystemMetrics({
                cpuUsage: 30,
                memoryUsage: 40,
                errorRate: 2
            });
            expect(engine.getSystemCondition()).toBe(SystemCondition.NORMAL);
        });
        test('should correctly assess elevated condition', () => {
            engine.updateSystemMetrics({
                cpuUsage: 60,
                memoryUsage: 50,
                errorRate: 7
            });
            // Average load is (60 + 50) / 2 = 55, errorRate is 7
            // Should be ELEVATED since avgLoad (55) > 50 OR errorRate (7) > 5
            expect(engine.getSystemCondition()).toBe(SystemCondition.ELEVATED);
        });
        test('should correctly assess high load condition', () => {
            engine.updateSystemMetrics({
                cpuUsage: 75,
                memoryUsage: 70,
                errorRate: 20
            });
            expect(engine.getSystemCondition()).toBe(SystemCondition.HIGH_LOAD);
        });
        test('should correctly assess overload condition', () => {
            engine.updateSystemMetrics({
                cpuUsage: 90,
                memoryUsage: 85,
                errorRate: 30
            });
            expect(engine.getSystemCondition()).toBe(SystemCondition.OVERLOAD);
        });
        test('should correctly assess under attack condition', () => {
            engine.updateSystemMetrics({
                cpuUsage: 98,
                memoryUsage: 95,
                errorRate: 60
            });
            expect(engine.getSystemCondition()).toBe(SystemCondition.UNDER_ATTACK);
        });
    });
    describe('Adaptive Throttling', () => {
        test('should apply adaptive throttling based on system condition', async () => {
            const rule = {
                id: 'adaptive-test',
                name: 'Adaptive Test',
                description: 'Test adaptive throttling',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/api'
                    }
                ],
                baseDelay: 100,
                maxDelay: 5000,
                adaptiveMultiplier: 2.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            // Test normal condition
            engine.updateSystemMetrics({ cpuUsage: 30, memoryUsage: 40, errorRate: 2 });
            const context = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 35,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            const normalResult = await engine.applyThrottling(context);
            expect(normalResult.action).toBe('throttle');
            // Calculate expected delay based on actual system condition
            const systemCondition = engine.getSystemCondition();
            const conditionMultipliers = {
                'normal': 1.0,
                'elevated': 1.5,
                'high_load': 2.5,
                'overload': 4.0,
                'under_attack': 8.0
            };
            const expectedDelay = 100 * (conditionMultipliers[systemCondition] || 1.0) * 1.0 * 2.0;
            expect(normalResult.delay).toBe(expectedDelay);
            // Test high load condition
            engine.updateSystemMetrics({ cpuUsage: 80, memoryUsage: 75, errorRate: 20 });
            const highLoadResult = await engine.applyThrottling(context);
            expect(highLoadResult.action).toBe('throttle');
            // Calculate expected delay based on actual system condition
            const highLoadCondition = engine.getSystemCondition();
            const highLoadExpectedDelay = 100 * (conditionMultipliers[highLoadCondition] || 1.0) * 1.0 * 2.0;
            expect(highLoadResult.delay).toBe(highLoadExpectedDelay);
        });
        test('should respect maximum delay limits', async () => {
            const rule = {
                id: 'max-delay-test',
                name: 'Max Delay Test',
                description: 'Test maximum delay limits',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/api'
                    }
                ],
                baseDelay: 100,
                maxDelay: 500,
                adaptiveMultiplier: 10.0, // High multiplier to test max delay
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            engine.updateSystemMetrics({ cpuUsage: 98, memoryUsage: 95, errorRate: 60 });
            const context = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 95,
                threatLevel: ThreatLevel.CRITICAL,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            const result = await engine.applyThrottling(context);
            expect(result.delay).toBeLessThanOrEqual(500);
        });
    });
    describe('Circuit Breaker', () => {
        let circuitBreakerRule;
        beforeEach(() => {
            circuitBreakerRule = {
                id: 'circuit-breaker-test',
                name: 'Circuit Breaker Test',
                description: 'Test circuit breaker',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.CIRCUIT_BREAKER,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/auth'
                    }
                ],
                baseDelay: 0,
                maxDelay: 0,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 3,
                recoveryTimeout: 5000,
                halfOpenRequests: 2,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 90,
                logViolations: true
            };
            engine.addRule(circuitBreakerRule);
        });
        test('should allow requests when circuit is closed', async () => {
            const context = {
                requestId: 'test-1',
                endpoint: '/auth/login',
                method: 'POST',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            const result = await engine.applyThrottling(context);
            expect(result.action).toBe('allow');
        });
        test('should open circuit after failure threshold', async () => {
            const context = {
                requestId: 'test-1',
                endpoint: '/auth/login',
                method: 'POST',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 4 // Above threshold
            };
            // Record failures to trigger circuit breaker
            for (let i = 0; i < 3; i++) {
                engine.recordFailure(circuitBreakerRule.id);
            }
            const result = await engine.applyThrottling(context);
            expect(result.action).toBe('block');
            expect(result.reason).toContain('open');
        });
        test('should transition to half-open after recovery timeout', async () => {
            // Trigger circuit breaker
            for (let i = 0; i < 3; i++) {
                engine.recordFailure(circuitBreakerRule.id);
            }
            const context = {
                requestId: 'test-1',
                endpoint: '/auth/login',
                method: 'POST',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 4
            };
            // Should be blocked initially
            let result = await engine.applyThrottling(context);
            expect(result.action).toBe('block');
            // Wait for recovery timeout (simulate by manually updating state)
            const stats = engine.getStatistics();
            const circuitState = stats.circuitBreakers[circuitBreakerRule.id];
            circuitState.nextAttemptTime = new Date(Date.now() - 1000);
            // Should now allow limited requests
            result = await engine.applyThrottling(context);
            expect(result.action).toBe('allow');
            expect(result.reason).toContain('half-open');
        });
        test('should record success and failure for circuit breaker state', () => {
            let eventEmitted = false;
            engine.on('circuitBreakerOpened', () => {
                eventEmitted = true;
            });
            // Record enough failures to open circuit
            for (let i = 0; i < 3; i++) {
                engine.recordFailure(circuitBreakerRule.id);
            }
            expect(eventEmitted).toBe(true);
            // Test success recording
            engine.recordSuccess(circuitBreakerRule.id);
            const stats = engine.getStatistics();
            const state = stats.circuitBreakers[circuitBreakerRule.id];
            expect(state.successCount).toBeGreaterThanOrEqual(0);
        });
    });
    describe('Load Shedding', () => {
        test('should apply load shedding when system load exceeds threshold', async () => {
            const rule = {
                id: 'load-shedding-test',
                name: 'Load Shedding Test',
                description: 'Test load shedding',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.LOAD_SHEDDING,
                triggerConditions: [
                    {
                        type: 'system_load',
                        operator: 'greater_than',
                        threshold: 80
                    }
                ],
                baseDelay: 0,
                maxDelay: 0,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 80,
                shedPercentage: 50,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 90,
                logViolations: true
            };
            engine.addRule(rule);
            engine.updateSystemMetrics({ cpuUsage: 90, memoryUsage: 85 });
            const context = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 87.5,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            // Run multiple requests to test load shedding percentage
            const results = await Promise.all(Array(20).fill(null).map(() => engine.applyThrottling(context)));
            const shedResults = results.filter(r => r.action === 'shed');
            const allowResults = results.filter(r => r.action === 'allow');
            // Should have some requests shed and some allowed
            expect(shedResults.length).toBeGreaterThan(0);
            expect(allowResults.length).toBeGreaterThan(0);
        });
    });
    describe('Bandwidth Shaping', () => {
        test('should consume tokens from bucket and throttle when empty', async () => {
            const rule = {
                id: 'bandwidth-test',
                name: 'Bandwidth Test',
                description: 'Test bandwidth shaping',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.BANDWIDTH_SHAPING,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/api'
                    }
                ],
                baseDelay: 0,
                maxDelay: 2000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 1, // 1 token per second
                burstSize: 3, // 3 token burst
                monitoringEnabled: true,
                alertThreshold: 80,
                logViolations: false
            };
            engine.addRule(rule);
            const context = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            // First 3 requests should be allowed (burst)
            for (let i = 0; i < 3; i++) {
                const result = await engine.applyThrottling(context);
                expect(result.action).toBe('allow');
            }
            // 4th request should be throttled
            const throttledResult = await engine.applyThrottling(context);
            expect(throttledResult.action).toBe('throttle');
            expect(throttledResult.delay).toBeGreaterThan(0);
        });
        test('should track remaining tokens', async () => {
            const rule = {
                id: 'token-tracking-test',
                name: 'Token Tracking Test',
                description: 'Test token tracking',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.BANDWIDTH_SHAPING,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/api'
                    }
                ],
                baseDelay: 0,
                maxDelay: 1000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 1,
                burstSize: 5,
                monitoringEnabled: true,
                alertThreshold: 80,
                logViolations: false
            };
            engine.addRule(rule);
            const context = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            // Consume 2 tokens
            await engine.applyThrottling(context);
            const result = await engine.applyThrottling(context);
            const stats = engine.getStatistics();
            const bucket = stats.tokenBuckets[rule.id];
            expect(bucket.tokens).toBe(3); // Started with 5, consumed 2
            expect(bucket.capacity).toBe(5);
        });
    });
    describe('Rule Conditions', () => {
        test('should match endpoint conditions', async () => {
            const rule = {
                id: 'endpoint-match-test',
                name: 'Endpoint Match Test',
                description: 'Test endpoint matching',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/special'
                    }
                ],
                baseDelay: 100,
                maxDelay: 1000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: false
            };
            engine.addRule(rule);
            const matchingContext = {
                requestId: 'test-1',
                endpoint: '/api/special/action',
                method: 'POST',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            const nonMatchingContext = {
                ...matchingContext,
                endpoint: '/api/regular/action'
            };
            const matchingResult = await engine.applyThrottling(matchingContext);
            const nonMatchingResult = await engine.applyThrottling(nonMatchingContext);
            expect(matchingResult.ruleId).toBe('endpoint-match-test');
            expect(nonMatchingResult.ruleId).toBe('none');
        });
        test('should match threat level conditions', async () => {
            const rule = {
                id: 'threat-level-test',
                name: 'Threat Level Test',
                description: 'Test threat level matching',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [
                    {
                        type: 'threat_level',
                        operator: 'greater_than',
                        threshold: 2 // MEDIUM level and above
                    }
                ],
                baseDelay: 500,
                maxDelay: 2000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            const highThreatContext = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.HIGH,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            const lowThreatContext = {
                ...highThreatContext,
                threatLevel: ThreatLevel.LOW
            };
            const highThreatResult = await engine.applyThrottling(highThreatContext);
            const lowThreatResult = await engine.applyThrottling(lowThreatContext);
            expect(highThreatResult.ruleId).toBe('threat-level-test');
            expect(lowThreatResult.ruleId).toBe('none');
        });
    });
    describe('Statistics and Monitoring', () => {
        test('should provide comprehensive statistics', () => {
            const rule = {
                id: 'stats-test',
                name: 'Statistics Test',
                description: 'Test statistics',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.BANDWIDTH_SHAPING,
                triggerConditions: [],
                baseDelay: 100,
                maxDelay: 1000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 5,
                burstSize: 20,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            const stats = engine.getStatistics();
            expect(stats.rulesCount).toBeGreaterThanOrEqual(1);
            expect(stats.activeRules).toBeGreaterThanOrEqual(1);
            expect(stats.systemCondition).toBeDefined();
            expect(stats.systemMetrics).toBeDefined();
            expect(stats.tokenBuckets[rule.id]).toBeDefined();
        });
        test('should emit events for monitoring', (done) => {
            let eventCount = 0;
            engine.on('ruleAdded', () => {
                eventCount++;
                if (eventCount === 1)
                    done();
            });
            const rule = {
                id: 'event-test',
                name: 'Event Test',
                description: 'Test event emission',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [],
                baseDelay: 100,
                maxDelay: 1000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
        });
    });
    describe('Engine Control', () => {
        test('should allow enabling/disabling throttling engine', async () => {
            const rule = {
                id: 'control-test',
                name: 'Control Test',
                description: 'Test engine control',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.ADAPTIVE,
                triggerConditions: [
                    {
                        type: 'endpoint',
                        operator: 'contains',
                        value: '/test'
                    }
                ],
                baseDelay: 1000,
                maxDelay: 5000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            const context = {
                requestId: 'test-1',
                endpoint: '/test/endpoint',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 0,
                consecutiveFailures: 0
            };
            // Engine enabled - should apply throttling
            const enabledResult = await engine.applyThrottling(context);
            expect(enabledResult.delay).toBeGreaterThan(0);
            // Disable engine
            engine.setEnabled(false);
            // Engine disabled - should allow all requests
            const disabledResult = await engine.applyThrottling(context);
            expect(disabledResult.action).toBe('allow');
            expect(disabledResult.reason).toContain('disabled');
        });
    });
    describe('Progressive Throttling', () => {
        test('should apply progressive throttling based on escalation steps', async () => {
            const rule = {
                id: 'progressive-test',
                name: 'Progressive Test',
                description: 'Test progressive throttling',
                enabled: true,
                priority: 100,
                mode: ThrottlingMode.PROGRESSIVE,
                triggerConditions: [
                    {
                        type: 'user_pattern',
                        operator: 'greater_than',
                        field: 'consecutive_failures',
                        threshold: 1
                    }
                ],
                baseDelay: 100,
                maxDelay: 5000,
                adaptiveMultiplier: 1.0,
                escalationSteps: [
                    {
                        level: 2,
                        delay: 500,
                        blockPercentage: 10,
                        duration: 30000,
                        condition: {
                            type: 'user_pattern',
                            operator: 'greater_than',
                            field: 'consecutive_failures',
                            threshold: 2
                        }
                    },
                    {
                        level: 5,
                        delay: 2000,
                        blockPercentage: 50,
                        duration: 60000,
                        condition: {
                            type: 'user_pattern',
                            operator: 'greater_than',
                            field: 'consecutive_failures',
                            threshold: 5
                        }
                    }
                ],
                failureThreshold: 0,
                recoveryTimeout: 0,
                halfOpenRequests: 0,
                loadThreshold: 0,
                shedPercentage: 0,
                tokensPerSecond: 0,
                burstSize: 0,
                monitoringEnabled: true,
                alertThreshold: 75,
                logViolations: true
            };
            engine.addRule(rule);
            // Test with moderate consecutive failures
            const moderateFailureContext = {
                requestId: 'test-1',
                endpoint: '/api/test',
                method: 'GET',
                ip: '192.168.1.1',
                userAgent: 'test-agent',
                timestamp: Date.now(),
                systemLoad: 50,
                threatLevel: ThreatLevel.LOW,
                recentFailures: 3,
                consecutiveFailures: 3
            };
            const moderateResult = await engine.applyThrottling(moderateFailureContext);
            expect(moderateResult.delay).toBe(500);
            expect(moderateResult.metadata.escalationLevel).toBe(2);
            // Test with high consecutive failures
            const highFailureContext = {
                ...moderateFailureContext,
                consecutiveFailures: 6
            };
            const highResult = await engine.applyThrottling(highFailureContext);
            expect(highResult.delay).toBe(2000);
            expect(highResult.metadata.escalationLevel).toBe(5);
        });
    });
});
