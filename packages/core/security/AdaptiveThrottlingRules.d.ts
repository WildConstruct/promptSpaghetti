/**
 * Adaptive Throttling Rules System
 * Task: E17-1753114397229-D69134 - Implement throttling rules
 * Task: E31-1753313263542-01C17D - Enhance Epic 17 AdaptiveThrottlingRules with analytics insights
 * Epic 17: Advanced Rate Limiting & Threat Protection
 * Epic 31: Security Intelligence Platform
 *
 * This module implements intelligent throttling rules that adapt to system
 * conditions, threat levels, and usage patterns to provide dynamic protection
 * while maintaining optimal user experience. Enhanced with Epic 31 security
 * analytics insights for intelligent decision-making.
 */
import { EventEmitter } from 'events';
import { RateLimitingService, ThreatLevel } from './RateLimitingService';
import { ApiUsagePatternQuotaRecommendations } from './ApiUsagePatternQuotaRecommendations';
import { ApiScalingAnalyticsIntegration } from './ApiScalingAnalyticsIntegration';
export interface ThrottlingAnalyticsConfig {
    enableAnalyticsIntegration: boolean;
    analyticsUpdateInterval: number;
    enablePatternBasedAdjustments: boolean;
    enableScalingInsights: boolean;
    enablePredictiveThrottling: boolean;
    enableAnomalyDetection: boolean;
    confidenceThreshold: number;
}
export interface ThrottlingAnalyticsInsight {
    insightId: string;
    timestamp: Date;
    insightType: 'pattern_detected' | 'scaling_recommendation' | 'anomaly_detected' | 'predictive_adjustment';
    confidence: number;
    ruleId: string;
    recommendation: {,
        action: 'increase_throttling' | 'decrease_throttling' | 'maintain_current' | 'enable_protection' | 'disable_protection';
        adjustmentFactor: number;
        reason: string;
        expectedImpact: string;
        validityPeriod: number;
    };
    metadata: {,
        patternType?: string;
        usageMetrics?: Record<string, number>;
        scalingFactors?: Record<string, number>;
        anomalyScore?: number;
        supportingData?: Record<string, unknown>;
    };
}
export interface ThrottlingDecisionContext extends ThrottlingContext {
    analyticsInsights: ThrottlingAnalyticsInsight[];
    historicalPerformance: {,
        requestVolume: number[];
        successRate: number[];
        averageLatency: number[];
        errorRates: number[];
    };
    patternAnalysis: {,
        currentPattern: string;
        patternConfidence: number;
        predictedNextPattern: string;
        patternTransitionProbability: number;
    };
    scalingContext: {,
        currentLoad: number;
        predictedLoad: number;
        scalingRecommendation: string;
        capacityUtilization: number;
    };
}
export type ThrottlingMode = 'adaptive' | 'progressive' | 'circuit_breaker' | 'load_shedding' | 'bandwidth_shaping';
export declare const ThrottlingMode: {
    readonly ADAPTIVE: "adaptive";
    readonly PROGRESSIVE: "progressive";
    readonly CIRCUIT_BREAKER: "circuit_breaker";
    readonly LOAD_SHEDDING: "load_shedding";
    readonly BANDWIDTH_SHAPING: "bandwidth_shaping";
};
export type SystemCondition = 'normal' | 'elevated' | 'high_load' | 'overload' | 'under_attack';
export declare const SystemCondition: {
    readonly NORMAL: "normal";
    readonly ELEVATED: "elevated";
    readonly HIGH_LOAD: "high_load";
    readonly OVERLOAD: "overload";
    readonly UNDER_ATTACK: "under_attack";
};
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
    analyticsConfig?: ThrottlingAnalyticsConfig;
    lastAnalyticsUpdate?: Date;
    activeInsights?: ThrottlingAnalyticsInsight[];
    performanceHistory?: {
        throttlingEffectiveness: number;
        falsePositiveRate: number;
        adaptationSuccessRate: number;
        lastOptimizationDate: Date;
    };
}
export interface ThrottlingCondition {
    type: 'endpoint' | 'method' | 'user_pattern' | 'system_load' | 'threat_level' | 'time_based' | 'custom';
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'pattern_match';
    field?: string;
    value?: unknown;
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
    metadata: {,
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
    private usagePatternAnalytics?;
    private scalingAnalytics?;
    private analyticsInsights;
    private analyticsEnabled;
    private lastAnalyticsUpdate;
    constructor(rateLimitingService: RateLimitingService, initializeDefaults?: boolean, analyticsConfig?: {)
        usagePatternAnalytics?: ApiUsagePatternQuotaRecommendations;
        scalingAnalytics?: ApiScalingAnalyticsIntegration;
        enableAnalytics?: boolean;
    });
    /**
     * Add a new throttling rule
     */
    addRule(rule: ThrottlingRule): void;
    /**
     * Apply throttling rules to a request context with Epic 31 analytics insights
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
    /**
     * Initialize analytics integration event listeners
     */
    private initializeAnalyticsIntegration;
    /**
     * Update analytics insights from Epic 31 services
     */
    private updateAnalyticsInsights;
    /**
     * Enhance context with analytics data
     */
    private enhanceContextWithAnalytics;
    /**
     * Apply rule with analytics-enhanced decision making
     */
    private applyRuleWithAnalytics;
    /**
     * Apply analytics-based adjustments to throttling decision
     */
    private applyAnalyticsAdjustments;
    /**
     * Apply individual insight adjustment
     */
    private applyInsightAdjustment;
    /**
     * Record throttling decision for analytics learning
     */
    private recordThrottlingDecision;
    /**
     * Get pattern-based insights
     */
    private getPatternBasedInsights;
    /**
     * Get scaling-based insights
     */
    private getScalingBasedInsights;
    /**
     * Update insights for rules
     */
    private updateInsightsForRules;
    /**
     * Get historical performance data
     */
    private getHistoricalPerformance;
    /**
     * Get pattern analysis
     */
    private getPatternAnalysis;
    /**
     * Get scaling context
     */
    private getScalingContext;
    /**
     * Start analytics update cycle
     */
    private startAnalyticsUpdateCycle;
    /**
     * Handle pattern detected event
     */
    private handlePatternDetected;
    /**
     * Handle abuse detected event
     */
    private handleAbuseDetected;
    /**
     * Handle quota recommendation event
     */
    private handleQuotaRecommendation;
    /**
     * Handle scaling recommendation event
     */
    private handleScalingRecommendation;
    /**
     * Handle load prediction event
     */
    private handleLoadPrediction;
    /**
     * Handle performance anomaly event
     */
    private handlePerformanceAnomaly;
    /**
     * Update rule performance history
     */
    private updateRulePerformanceHistory;
    /**
     * Get analytics-enhanced statistics
     */
    getAnalyticsStatistics(): {
        analyticsEnabled: boolean;
        lastUpdate: Date;
        totalInsights: number;
        insightsByType: Record<string, number>;
        insightsByRule: Record<string, number>;
        averageConfidence: number;
        performanceMetrics: {,
            averageEffectiveness: number;
            averageFalsePositiveRate: number;
            averageAdaptationSuccessRate: number;
        };
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
     * Get recent throttling attempts for integration with rate limiting
     */
    getRecentThrottlingAttempts(identifier: string, endpoint: string): Array<{
        timestamp: Date;
        action: string;
        delay: number;
        ruleId: string;
        success: boolean;
    }>;
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