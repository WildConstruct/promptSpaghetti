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
import { ThreatLevel } from './RateLimitingService';
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
    recommendation: {
        action: 'increase_throttling' | 'decrease_throttling' | 'maintain_current' | 'enable_protection' | 'disable_protection';
        adjustmentFactor: number;
        reason: string;
        expectedImpact: string;
        validityPeriod: number;
    };
    metadata: {
        patternType?: string;
        usageMetrics?: Record<string, number>;
        scalingFactors?: Record<string, number>;
        anomalyScore?: number;
        anomalyType?: string;
        supportingData?: Record<string, unknown>;
    };
}
export interface PatternDetectionData {
    pattern: string;
    confidence: number;
    recommendation: string;
}
export interface EndpointUsageData {
    endpoint: string;
    usageMetrics: Record<string, number>;
}
export interface ScalingRecommendationData {
    confidence: number;
    action: string;
    multiplier: number;
    reason: string;
    scaleUp?: boolean;
    expectedImpact?: string;
    scalingFactors?: Record<string, number>;
    [key: string]: unknown;
}
export interface QuotaRecommendationData {
    endpoint: string;
    currentQuota: number;
    recommendedQuota: number;
    reason: string;
    confidence?: number;
    action?: string;
    multiplier?: number;
    expectedImpact?: string;
    [key: string]: unknown;
}
export interface LoadPredictionData {
    predictedLoad: number;
    currentLoad: number;
    confidence: number;
    timeFrame: number;
}
export interface PerformanceAnomalyData {
    anomalyType: string;
    severity: number;
    affectedEndpoints: string;
    recommendation: string;
    confidence?: number;
    anomalyScore?: number;
    [key: string]: unknown;
}
export interface ThrottlingDecisionContext extends ThrottlingContext {
    analyticsInsights: ThrottlingAnalyticsInsight;
    historicalPerformance: {
        requestVolume: number;
        successRate: number;
        averageLatency: number;
        errorRates: number;
    };
    patternAnalysis: {
        currentPattern: string;
        patternConfidence: number;
        predictedNextPattern: string;
        patternTransitionProbability: number;
    };
    scalingContext: {
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
    triggerConditions: ThrottlingCondition;
    baseDelay: number;
    maxDelay: number;
    adaptiveMultiplier: number;
    escalationSteps: ThrottlingStep;
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
    activeInsights?: ThrottlingAnalyticsInsight;
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
    metadata: {
        originalDelay?: number;
        appliedMultiplier?: number;
        systemCondition: SystemCondition;
        escalationLevel?: number;
        tokensRemaining?: number;
        analyticsAdjustments?: {
            appliedInsights: number;
            originalAction: string;
            originalDelay: number;
            adjustmentReason: string;
            confidenceScore: number;
            adjustmentFactors?: Record<string, number>;
        };
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
    constructor();
    private rateLimitingService;
    initializeDefaults: boolean;
    analyticsConfig?: {
        usagePatternAnalytics?: ApiUsagePatternQuotaRecommendations;
        scalingAnalytics?: ApiScalingAnalyticsIntegration;
        enableAnalytics?: boolean;
        super(): any;
    };
}
//# sourceMappingURL=AdaptiveThrottlingRules.d.ts.map