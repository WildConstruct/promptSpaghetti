/**
 * Adaptive Throttling Rules System
 * Task: E17-1753114397229-D69134 - Implement throttling rules
 * Epic 17: Advanced Rate Limiting & Threat Protection
 *
 * This module implements intelligent throttling rules that adapt to system
 * conditions, threat levels, and usage patterns to provide dynamic protection
 * while maintaining optimal user experience.
 */
import { EventEmitter } from 'events';
import { ThreatLevel } from './RateLimitingService';
// ========================================
// Throttling Rule Types
// ========================================
export var ThrottlingMode;
(function (ThrottlingMode) {
    ThrottlingMode["ADAPTIVE"] = "adaptive";
    ThrottlingMode["PROGRESSIVE"] = "progressive";
    ThrottlingMode["CIRCUIT_BREAKER"] = "circuit_breaker";
    ThrottlingMode["LOAD_SHEDDING"] = "load_shedding";
    ThrottlingMode["BANDWIDTH_SHAPING"] = "bandwidth_shaping"; // Controls request throughput
})(ThrottlingMode || (ThrottlingMode = {}));
export var SystemCondition;
(function (SystemCondition) {
    SystemCondition["NORMAL"] = "normal";
    SystemCondition["ELEVATED"] = "elevated";
    SystemCondition["HIGH_LOAD"] = "high_load";
    SystemCondition["OVERLOAD"] = "overload";
    SystemCondition["UNDER_ATTACK"] = "under_attack"; // Active attack detected
})(SystemCondition || (SystemCondition = {}));
// ========================================
// Adaptive Throttling Rules Engine
// ========================================
export class AdaptiveThrottlingRulesEngine extends EventEmitter {
    rateLimitingService;
    rules = new Map();
    circuitBreakerStates = new Map();
    tokenBuckets = new Map();
    systemMetrics;
    enabled = true;
    constructor(rateLimitingService, initializeDefaults = true) {
        super();
        this.rateLimitingService = rateLimitingService;
        this.systemMetrics = this.getDefaultSystemMetrics();
        if (initializeDefaults) {
            this.initializeDefaultRules();
            this.startMetricsCollection();
        }
    }
    /**
     * Add a new throttling rule
     */
    addRule(rule) {
        this.validateRule(rule);
        this.rules.set(rule.id, rule);
        // Initialize circuit breaker state if needed
        if (rule.mode === ThrottlingMode.CIRCUIT_BREAKER) {
            this.circuitBreakerStates.set(rule.id, {
                state: 'closed',
                failureCount: 0,
                lastFailureTime: new Date(),
                nextAttemptTime: new Date(),
                successCount: 0
            });
        }
        // Initialize token bucket if needed
        if (rule.mode === ThrottlingMode.BANDWIDTH_SHAPING) {
            this.tokenBuckets.set(rule.id, {
                tokens: rule.burstSize,
                lastRefill: new Date(),
                capacity: rule.burstSize,
                refillRate: rule.tokensPerSecond
            });
        }
        this.emit('ruleAdded', { ruleId: rule.id, rule });
    }
    /**
     * Apply throttling rules to a request context
     */
    async applyThrottling(context) {
        if (!this.enabled) {
            return {
                action: 'allow',
                delay: 0,
                reason: 'Throttling disabled',
                ruleId: 'none',
                metadata: {
                    systemCondition: this.getSystemCondition()
                }
            };
        }
        // Update system metrics
        await this.refreshSystemMetrics();
        // Find matching rules (sorted by priority)
        const matchingRules = this.findMatchingRules(context);
        if (matchingRules.length === 0) {
            return {
                action: 'allow',
                delay: 0,
                reason: 'No matching throttling rules',
                ruleId: 'none',
                metadata: {
                    systemCondition: this.getSystemCondition()
                }
            };
        }
        // Apply the highest priority rule
        const rule = matchingRules[0];
        const result = await this.applyRule(rule, context);
        // Log and emit events if necessary
        if (rule.logViolations && result.action !== 'allow') {
            this.emit('throttlingApplied', {
                context,
                rule: rule.id,
                result,
                timestamp: new Date()
            });
        }
        return result;
    }
    /**
     * Update system metrics
     */
    updateSystemMetrics(metrics) {
        this.systemMetrics = {
            ...this.systemMetrics,
            ...metrics
        };
        this.emit('metricsUpdated', this.systemMetrics);
    }
    /**
     * Get current system condition
     */
    getSystemCondition() {
        const avgLoad = (this.systemMetrics.cpuUsage + this.systemMetrics.memoryUsage) / 2;
        // Check for attack conditions first (high error rate is primary indicator)
        if (this.systemMetrics.errorRate > 50 || avgLoad > 95) {
            return SystemCondition.UNDER_ATTACK;
        }
        // Check for overload (high load OR high error rate)
        if (avgLoad > 85 || this.systemMetrics.errorRate > 25) {
            return SystemCondition.OVERLOAD;
        }
        // Check for high load (moderate-high load OR moderate error rate)
        if (avgLoad > 70 || this.systemMetrics.errorRate > 15) {
            return SystemCondition.HIGH_LOAD;
        }
        // Check for elevated (moderate load OR low-moderate error rate)
        if (avgLoad > 50 || this.systemMetrics.errorRate > 5) {
            return SystemCondition.ELEVATED;
        }
        return SystemCondition.NORMAL;
    }
    /**
     * Get throttling statistics
     */
    getStatistics() {
        const circuitBreakers = {};
        for (const [id, state] of this.circuitBreakerStates) {
            circuitBreakers[id] = state;
        }
        const tokenBuckets = {};
        for (const [id, bucket] of this.tokenBuckets) {
            tokenBuckets[id] = {
                tokens: Math.floor(bucket.tokens),
                capacity: bucket.capacity
            };
        }
        return {
            rulesCount: this.rules.size,
            activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
            circuitBreakers,
            tokenBuckets,
            systemCondition: this.getSystemCondition(),
            systemMetrics: this.systemMetrics
        };
    }
    // ========================================
    // Private Implementation Methods
    // ========================================
    validateRule(rule) {
        if (!rule.id || !rule.name) {
            throw new Error('Rule must have id and name');
        }
        if (rule.baseDelay < 0 || rule.maxDelay < rule.baseDelay) {
            throw new Error('Invalid delay configuration');
        }
        if (rule.mode === ThrottlingMode.CIRCUIT_BREAKER) {
            if (rule.failureThreshold <= 0 || rule.recoveryTimeout <= 0) {
                throw new Error('Invalid circuit breaker configuration');
            }
        }
        if (rule.mode === ThrottlingMode.BANDWIDTH_SHAPING) {
            if (rule.tokensPerSecond <= 0 || rule.burstSize <= 0) {
                throw new Error('Invalid bandwidth shaping configuration');
            }
        }
    }
    findMatchingRules(context) {
        const matchingRules = [];
        for (const rule of this.rules.values()) {
            if (!rule.enabled)
                continue;
            const conditionsMatch = rule.triggerConditions.every(condition => this.evaluateCondition(condition, context));
            if (conditionsMatch) {
                matchingRules.push(rule);
            }
        }
        // Sort by priority (highest first)
        return matchingRules.sort((a, b) => b.priority - a.priority);
    }
    evaluateCondition(condition, context) {
        switch (condition.type) {
            case 'endpoint':
                return this.evaluateStringCondition(condition, context.endpoint);
            case 'method':
                return this.evaluateStringCondition(condition, context.method);
            case 'system_load':
                return this.evaluateNumericCondition(condition, this.systemMetrics.cpuUsage);
            case 'threat_level':
                const threatValues = {
                    [ThreatLevel.LOW]: 1,
                    [ThreatLevel.MEDIUM]: 2,
                    [ThreatLevel.HIGH]: 3,
                    [ThreatLevel.CRITICAL]: 4
                };
                return this.evaluateNumericCondition(condition, threatValues[context.threatLevel]);
            case 'time_based':
                const currentHour = new Date().getHours();
                return this.evaluateNumericCondition(condition, currentHour);
            case 'user_pattern':
                return this.evaluateUserPattern(condition, context);
            default:
                return false;
        }
    }
    evaluateStringCondition(condition, value) {
        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'contains':
                return value.includes(condition.value);
            case 'pattern_match':
                return new RegExp(condition.value).test(value);
            default:
                return false;
        }
    }
    evaluateNumericCondition(condition, value) {
        switch (condition.operator) {
            case 'greater_than':
                return value > (condition.threshold || condition.value);
            case 'less_than':
                return value < (condition.threshold || condition.value);
            case 'in_range':
                const [min, max] = condition.value;
                return value >= min && value <= max;
            default:
                return false;
        }
    }
    evaluateUserPattern(condition, context) {
        switch (condition.field) {
            case 'consecutive_failures':
                return this.evaluateNumericCondition(condition, context.consecutiveFailures);
            case 'recent_failures':
                return this.evaluateNumericCondition(condition, context.recentFailures);
            default:
                return false;
        }
    }
    async applyRule(rule, context) {
        switch (rule.mode) {
            case ThrottlingMode.ADAPTIVE:
                return this.applyAdaptiveThrottling(rule, context);
            case ThrottlingMode.PROGRESSIVE:
                return this.applyProgressiveThrottling(rule, context);
            case ThrottlingMode.CIRCUIT_BREAKER:
                return this.applyCircuitBreaker(rule, context);
            case ThrottlingMode.LOAD_SHEDDING:
                return this.applyLoadShedding(rule, context);
            case ThrottlingMode.BANDWIDTH_SHAPING:
                return this.applyBandwidthShaping(rule, context);
            default:
                return {
                    action: 'allow',
                    delay: 0,
                    reason: 'Unknown throttling mode',
                    ruleId: rule.id,
                    metadata: {
                        systemCondition: this.getSystemCondition()
                    }
                };
        }
    }
    applyAdaptiveThrottling(rule, context) {
        const systemCondition = this.getSystemCondition();
        const conditionMultipliers = {
            [SystemCondition.NORMAL]: 1.0,
            [SystemCondition.ELEVATED]: 1.5,
            [SystemCondition.HIGH_LOAD]: 2.5,
            [SystemCondition.OVERLOAD]: 4.0,
            [SystemCondition.UNDER_ATTACK]: 8.0
        };
        const baseMultiplier = conditionMultipliers[systemCondition];
        const threatMultiplier = this.getThreatMultiplier(context.threatLevel);
        const finalMultiplier = baseMultiplier * threatMultiplier * rule.adaptiveMultiplier;
        const calculatedDelay = Math.min(rule.baseDelay * finalMultiplier, rule.maxDelay);
        return {
            action: calculatedDelay > 0 ? 'throttle' : 'allow',
            delay: calculatedDelay,
            reason: `Adaptive throttling based on ${systemCondition} system condition and ${context.threatLevel} threat level`,
            ruleId: rule.id,
            metadata: {
                originalDelay: rule.baseDelay,
                appliedMultiplier: finalMultiplier,
                systemCondition
            }
        };
    }
    applyProgressiveThrottling(rule, context) {
        // Find the appropriate escalation step based on recent failures
        let currentStep = rule.escalationSteps.find(step => context.consecutiveFailures >= step.level);
        if (!currentStep && rule.escalationSteps.length > 0) {
            currentStep = rule.escalationSteps[0];
        }
        if (!currentStep) {
            return {
                action: 'allow',
                delay: 0,
                reason: 'No escalation step found',
                ruleId: rule.id,
                metadata: {
                    systemCondition: this.getSystemCondition(),
                    escalationLevel: 0
                }
            };
        }
        // Determine action based on block percentage
        const shouldBlock = Math.random() * 100 < currentStep.blockPercentage;
        return {
            action: shouldBlock ? 'block' : 'throttle',
            delay: currentStep.delay,
            reason: `Progressive throttling at level ${currentStep.level}`,
            ruleId: rule.id,
            metadata: {
                systemCondition: this.getSystemCondition(),
                escalationLevel: currentStep.level
            }
        };
    }
    applyCircuitBreaker(rule, context) {
        const state = this.circuitBreakerStates.get(rule.id);
        const now = new Date();
        switch (state.state) {
            case 'closed':
                // Normal operation, allow request
                return {
                    action: 'allow',
                    delay: 0,
                    reason: 'Circuit breaker closed - normal operation',
                    ruleId: rule.id,
                    metadata: {
                        systemCondition: this.getSystemCondition()
                    }
                };
            case 'open':
                // Circuit is open, check if recovery timeout has passed
                if (now >= state.nextAttemptTime) {
                    state.state = 'half_open';
                    state.successCount = 0;
                    return {
                        action: 'allow',
                        delay: 0,
                        reason: 'Circuit breaker half-open - testing recovery',
                        ruleId: rule.id,
                        metadata: {
                            systemCondition: this.getSystemCondition()
                        }
                    };
                }
                return {
                    action: 'block',
                    delay: 0,
                    reason: 'Circuit breaker open - blocking all requests',
                    ruleId: rule.id,
                    metadata: {
                        systemCondition: this.getSystemCondition()
                    }
                };
            case 'half_open':
                // Allow limited requests to test recovery
                if (state.successCount < rule.halfOpenRequests) {
                    return {
                        action: 'allow',
                        delay: 0,
                        reason: 'Circuit breaker half-open - limited testing',
                        ruleId: rule.id,
                        metadata: {
                            systemCondition: this.getSystemCondition()
                        }
                    };
                }
                return {
                    action: 'block',
                    delay: 0,
                    reason: 'Circuit breaker half-open - test quota exceeded',
                    ruleId: rule.id,
                    metadata: {
                        systemCondition: this.getSystemCondition()
                    }
                };
        }
    }
    applyLoadShedding(rule, context) {
        const currentLoad = (this.systemMetrics.cpuUsage + this.systemMetrics.memoryUsage) / 2;
        if (currentLoad < rule.loadThreshold) {
            return {
                action: 'allow',
                delay: 0,
                reason: 'System load below threshold',
                ruleId: rule.id,
                metadata: {
                    systemCondition: this.getSystemCondition()
                }
            };
        }
        // Apply load shedding
        const shouldShed = Math.random() * 100 < rule.shedPercentage;
        return {
            action: shouldShed ? 'shed' : 'allow',
            delay: 0,
            reason: shouldShed ? 'Load shedding applied' : 'Request survived load shedding',
            ruleId: rule.id,
            metadata: {
                systemCondition: this.getSystemCondition()
            }
        };
    }
    applyBandwidthShaping(rule, context) {
        const bucket = this.tokenBuckets.get(rule.id);
        const now = new Date();
        // Refill tokens based on elapsed time
        const elapsedMs = now.getTime() - bucket.lastRefill.getTime();
        const elapsedSeconds = elapsedMs / 1000;
        const tokensToAdd = elapsedSeconds * rule.tokensPerSecond;
        bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
        // Check if tokens are available
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return {
                action: 'allow',
                delay: 0,
                reason: 'Token consumed from bucket',
                ruleId: rule.id,
                metadata: {
                    systemCondition: this.getSystemCondition(),
                    tokensRemaining: Math.floor(bucket.tokens)
                }
            };
        }
        // Calculate delay until next token is available
        const delay = Math.ceil((1 - bucket.tokens) / rule.tokensPerSecond * 1000);
        return {
            action: 'throttle',
            delay: Math.min(delay, rule.maxDelay),
            reason: 'No tokens available in bucket',
            ruleId: rule.id,
            metadata: {
                systemCondition: this.getSystemCondition(),
                tokensRemaining: 0
            }
        };
    }
    getThreatMultiplier(threatLevel) {
        const multipliers = {
            [ThreatLevel.LOW]: 1.0,
            [ThreatLevel.MEDIUM]: 2.0,
            [ThreatLevel.HIGH]: 4.0,
            [ThreatLevel.CRITICAL]: 8.0
        };
        return multipliers[threatLevel];
    }
    getDefaultSystemMetrics() {
        return {
            cpuUsage: 10, // Start with low but realistic values
            memoryUsage: 20,
            activeConnections: 0,
            requestsPerSecond: 0,
            averageResponseTime: 100,
            errorRate: 0,
            queueDepth: 0
        };
    }
    async refreshSystemMetrics() {
        // In a real implementation, this would collect actual system metrics
        // For now, we'll simulate some basic metrics
        // This is a placeholder - in production, integrate with system monitoring
        this.systemMetrics = {
            cpuUsage: Math.min(100, this.systemMetrics.cpuUsage + (Math.random() - 0.5) * 5),
            memoryUsage: Math.min(100, this.systemMetrics.memoryUsage + (Math.random() - 0.5) * 3),
            activeConnections: Math.max(0, this.systemMetrics.activeConnections + Math.floor((Math.random() - 0.5) * 10)),
            requestsPerSecond: Math.max(0, this.systemMetrics.requestsPerSecond + (Math.random() - 0.5) * 50),
            averageResponseTime: Math.max(0, this.systemMetrics.averageResponseTime + (Math.random() - 0.5) * 100),
            errorRate: Math.min(100, Math.max(0, this.systemMetrics.errorRate + (Math.random() - 0.5) * 2)),
            queueDepth: Math.max(0, this.systemMetrics.queueDepth + Math.floor((Math.random() - 0.5) * 5))
        };
    }
    initializeDefaultRules() {
        // High-traffic endpoint protection
        this.addRule({
            id: 'api-adaptive',
            name: 'API Adaptive Throttling',
            description: 'Adaptive throttling for API endpoints based on system load',
            enabled: true,
            priority: 900,
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
            adaptiveMultiplier: 1.5,
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
        });
        // Authentication endpoint circuit breaker
        this.addRule({
            id: 'auth-circuit-breaker',
            name: 'Authentication Circuit Breaker',
            description: 'Circuit breaker protection for authentication endpoints',
            enabled: true,
            priority: 1000,
            mode: ThrottlingMode.CIRCUIT_BREAKER,
            triggerConditions: [
                {
                    type: 'endpoint',
                    operator: 'pattern_match',
                    value: '/(login|register|auth)'
                },
                {
                    type: 'user_pattern',
                    operator: 'greater_than',
                    field: 'consecutive_failures',
                    threshold: 3
                }
            ],
            baseDelay: 0,
            maxDelay: 0,
            adaptiveMultiplier: 1.0,
            escalationSteps: [],
            failureThreshold: 5,
            recoveryTimeout: 300000, // 5 minutes
            halfOpenRequests: 3,
            loadThreshold: 0,
            shedPercentage: 0,
            tokensPerSecond: 0,
            burstSize: 0,
            monitoringEnabled: true,
            alertThreshold: 90,
            logViolations: true
        });
        // Load shedding for high system load
        this.addRule({
            id: 'load-shedding',
            name: 'System Load Shedding',
            description: 'Drop requests when system load is critically high',
            enabled: true,
            priority: 800,
            mode: ThrottlingMode.LOAD_SHEDDING,
            triggerConditions: [
                {
                    type: 'system_load',
                    operator: 'greater_than',
                    threshold: 85
                }
            ],
            baseDelay: 0,
            maxDelay: 0,
            adaptiveMultiplier: 1.0,
            escalationSteps: [],
            failureThreshold: 0,
            recoveryTimeout: 0,
            halfOpenRequests: 0,
            loadThreshold: 85,
            shedPercentage: 50,
            tokensPerSecond: 0,
            burstSize: 0,
            monitoringEnabled: true,
            alertThreshold: 95,
            logViolations: true
        });
        // Bandwidth shaping for preview endpoints
        this.addRule({
            id: 'preview-bandwidth',
            name: 'Preview Bandwidth Shaping',
            description: 'Token bucket rate limiting for preview generation endpoints',
            enabled: true,
            priority: 700,
            mode: ThrottlingMode.BANDWIDTH_SHAPING,
            triggerConditions: [
                {
                    type: 'endpoint',
                    operator: 'contains',
                    value: '/preview'
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
            tokensPerSecond: 2, // 2 requests per second
            burstSize: 10, // Allow bursts up to 10 requests
            monitoringEnabled: true,
            alertThreshold: 80,
            logViolations: false
        });
    }
    startMetricsCollection() {
        // Update metrics every 30 seconds
        setInterval(async () => {
            await this.refreshSystemMetrics();
        }, 30000);
    }
    /**
     * Record successful request (for circuit breaker recovery)
     */
    recordSuccess(ruleId) {
        const state = this.circuitBreakerStates.get(ruleId);
        if (!state)
            return;
        if (state.state === 'half_open') {
            state.successCount++;
            const rule = this.rules.get(ruleId);
            if (rule && state.successCount >= rule.halfOpenRequests) {
                state.state = 'closed';
                state.failureCount = 0;
                state.successCount = 0;
                this.emit('circuitBreakerClosed', { ruleId });
            }
        }
        else if (state.state === 'closed') {
            state.failureCount = Math.max(0, state.failureCount - 1);
        }
    }
    /**
     * Record failed request (for circuit breaker triggering)
     */
    recordFailure(ruleId) {
        const state = this.circuitBreakerStates.get(ruleId);
        if (!state)
            return;
        const rule = this.rules.get(ruleId);
        if (!rule)
            return;
        state.failureCount++;
        state.lastFailureTime = new Date();
        if (state.state === 'closed' && state.failureCount >= rule.failureThreshold) {
            state.state = 'open';
            state.nextAttemptTime = new Date(Date.now() + rule.recoveryTimeout);
            this.emit('circuitBreakerOpened', { ruleId, failureCount: state.failureCount });
        }
        else if (state.state === 'half_open') {
            state.state = 'open';
            state.nextAttemptTime = new Date(Date.now() + rule.recoveryTimeout);
            state.successCount = 0;
            this.emit('circuitBreakerReopened', { ruleId });
        }
    }
    /**
     * Enable or disable the throttling engine
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.emit('enabledChanged', { enabled });
    }
    /**
     * Get a specific rule
     */
    getRule(id) {
        return this.rules.get(id);
    }
    /**
     * Remove a rule
     */
    removeRule(id) {
        const removed = this.rules.delete(id);
        if (removed) {
            this.circuitBreakerStates.delete(id);
            this.tokenBuckets.delete(id);
            this.emit('ruleRemoved', { ruleId: id });
        }
        return removed;
    }
    /**
     * Clean up resources
     */
    cleanup() {
        this.rules.clear();
        this.circuitBreakerStates.clear();
        this.tokenBuckets.clear();
        this.removeAllListeners();
    }
}
export default AdaptiveThrottlingRulesEngine;
