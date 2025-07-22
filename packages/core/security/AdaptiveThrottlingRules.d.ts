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
import { RateLimitingService, ThreatLevel } from './RateLimitingService';
export declare enum ThrottlingMode {
    ADAPTIVE = "adaptive",// Adjusts based on system conditions
    PROGRESSIVE = "progressive",// Gradually increases restrictions
    CIRCUIT_BREAKER = "circuit_breaker",// All-or-nothing protection
    LOAD_SHEDDING = "load_shedding",// Drops requests under high load
    BANDWIDTH_SHAPING = "bandwidth_shaping"
}
export declare enum SystemCondition {
    NORMAL = "normal",
    ELEVATED = "elevated",// Moderate system stress
    HIGH_LOAD = "high_load",// High system utilization
    OVERLOAD = "overload",// Critical system stress
    UNDER_ATTACK = "under_attack"
}
export interface ThrottlingRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number;
    mode: ThrottlingMode;
    triggerConditions: ThrottlingCondition[];
    baseDelay: number;
    maxDelay: number;
    adaptiveMultiplier: number;
    escalationSteps: ThrottlingStep[];
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenRequests: number;
    loadThreshold: number;
    shedPercentage: number;
    tokensPerSecond: number;
    burstSize: number;
    monitoringEnabled: boolean;
    alertThreshold: number;
    logViolations: boolean;
}
export interface ThrottlingCondition {
    type: 'endpoint' | 'method' | 'user_pattern' | 'system_load' | 'threat_level' | 'time_based' | 'custom';
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'pattern_match';
    field?: string;
    value?: any;
    threshold?: number;
}
export interface ThrottlingStep {
    level: number;
    delay: number;
    blockPercentage: number;
    duration: number;
    condition: ThrottlingCondition;
}
export interface ThrottlingContext {
    requestId: string;
    endpoint: string;
    method: string;
    userId?: string;
    ip: string;
    userAgent: string;
    timestamp: number;
    systemLoad: number;
    threatLevel: ThreatLevel;
    recentFailures: number;
    consecutiveFailures: number;
}
export interface ThrottlingResult {
    action: 'allow' | 'throttle' | 'block' | 'shed';
    delay: number;
    reason: string;
    ruleId: string;
    metadata: {
        originalDelay?: number;
        appliedMultiplier?: number;
        systemCondition: SystemCondition;
        escalationLevel?: number;
        tokensRemaining?: number;
    };
}
export interface CircuitBreakerState {
    state: 'closed' | 'open' | 'half_open';
    failureCount: number;
    lastFailureTime: Date;
    nextAttemptTime: Date;
    successCount: number;
}
export interface TokenBucketState {
    tokens: number;
    lastRefill: Date;
    capacity: number;
    refillRate: number;
}
export interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    queueDepth: number;
}
export declare class AdaptiveThrottlingRulesEngine extends EventEmitter {
    private rateLimitingService;
    private rules;
    private circuitBreakerStates;
    private tokenBuckets;
    private systemMetrics;
    private enabled;
    constructor(rateLimitingService: RateLimitingService, initializeDefaults?: boolean);
    /**
     * Add a new throttling rule
     */
    addRule(rule: ThrottlingRule): void;
    /**
     * Apply throttling rules to a request context
     */
    applyThrottling(context: ThrottlingContext): Promise<ThrottlingResult>;
    /**
     * Update system metrics
     */
    updateSystemMetrics(metrics: Partial<SystemMetrics>): void;
    /**
     * Get current system condition
     */
    getSystemCondition(): SystemCondition;
    /**
     * Get throttling statistics
     */
    getStatistics(): {
        rulesCount: number;
        activeRules: number;
        circuitBreakers: Record<string, CircuitBreakerState>;
        tokenBuckets: Record<string, {
            tokens: number;
            capacity: number;
        }>;
        systemCondition: SystemCondition;
        systemMetrics: SystemMetrics;
    };
    private validateRule;
    private findMatchingRules;
    private evaluateCondition;
    private evaluateStringCondition;
    private evaluateNumericCondition;
    private evaluateUserPattern;
    private applyRule;
    private applyAdaptiveThrottling;
    private applyProgressiveThrottling;
    private applyCircuitBreaker;
    private applyLoadShedding;
    private applyBandwidthShaping;
    private getThreatMultiplier;
    private getDefaultSystemMetrics;
    private refreshSystemMetrics;
    private initializeDefaultRules;
    private startMetricsCollection;
    /**
     * Record successful request (for circuit breaker recovery)
     */
    recordSuccess(ruleId: string): void;
    /**
     * Record failed request (for circuit breaker triggering)
     */
    recordFailure(ruleId: string): void;
    /**
     * Enable or disable the throttling engine
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get a specific rule
     */
    getRule(id: string): ThrottlingRule | undefined;
    /**
     * Remove a rule
     */
    removeRule(id: string): boolean;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
export default AdaptiveThrottlingRulesEngine;
//# sourceMappingURL=AdaptiveThrottlingRules.d.ts.map