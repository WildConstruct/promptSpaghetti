/**
 * Adaptive Rate Limiting Integration System
 * Task: E31-1753313263540-48653C - Integrate rate limiting with Epic 17 adaptive throttling
 * Epic 17: Advanced Rate Limiting & Threat Protection
 * Epic 31: Security Intelligence Platform
 *
 * This module provides seamless integration between the RateLimitingService and
 * AdaptiveThrottlingRulesEngine, creating a unified security protection system
 * that combines traditional rate limiting with intelligent adaptive throttling.
 */
import { EventEmitter } from 'events';
import { RateLimitingService, RateLimitStatus, ThreatLevel, BackoffStrategy } from './RateLimitingService';
import { 
  AdaptiveThrottlingRulesEngine,
  ThrottlingContext,
  ThrottlingResult,
  ThrottlingMode,
  SystemCondition
} from './AdaptiveThrottlingRules';

}
export interface IntegrationConfig {
    enableUnifiedProtection: boolean;
    rateLimitingPriority: number;
    throttlingPriority: number;
    integrationMode: IntegrationMode;
    coordinationStrategy: CoordinationStrategy;
    fallbackBehavior: FallbackBehavior;
    analyticsIntegration: boolean;
    crossSystemLearning: boolean;

export declare enum IntegrationMode {
    SEQUENTIAL = "sequential",// Apply rate limiting first, then throttling
    PARALLEL = "parallel",// Apply both simultaneously and combine results
    CONDITIONAL = "conditional",// Choose system based on conditions
    HIERARCHICAL = "hierarchical"

export declare enum CoordinationStrategy {
    MOST_RESTRICTIVE = "most_restrictive",// Use the most restrictive decision
    LEAST_RESTRICTIVE = "least_restrictive",// Use the least restrictive decision
    WEIGHTED_AVERAGE = "weighted_average",// Combine decisions with weights
    DYNAMIC_SELECTION = "dynamic_selection",// Select best system for situation
    CONSENSUS_BASED = "consensus_based"

export declare enum FallbackBehavior {
    ALLOW = "allow",// Allow request if systems disagree
    BLOCK = "block",// Block request if systems disagree
    USE_RATE_LIMITING = "use_rate_limiting",// Fall back to rate limiting
    USE_THROTTLING = "use_throttling",// Fall back to throttling
    ESCALATE = "escalate"

}
export interface UnifiedProtectionContext extends ThrottlingContext {
    rateLimitingHistory: {
        recentAttempts: number;
        backoffLevel: number;
        threatAssessment: ThreatLevel;
        adaptiveMultiplier: number;
}
    };
    throttlingHistory: {
        recentThrottling: number;
        systemCondition: SystemCondition;
        activeRules: string[];
        effectivenessScore: number;
    };
    integrationMetadata: {
        requestId: string;
        correlationId: string;
        protectionLayers: string[];
        decisionTrail: ProtectionDecision[];
    };

}
export interface ProtectionDecision {
    system: 'rate_limiting' | 'throttling' | 'integration';
    timestamp: Date;
    decision: 'allow' | 'block' | 'throttle' | 'delay';
    confidence: number;
    reasoning: string;
    parameters: Record<string, unknown>;

}
export interface UnifiedProtectionResult {
    action: 'allow' | 'block' | 'throttle' | 'delay';
    delay: number;
    rateLimitingResult: RateLimitStatus;
    throttlingResult: ThrottlingResult;
    finalDecision: {
        system: string;
        strategy: CoordinationStrategy;
        confidence: number;
        reasoning: string;
}
    };
    recommendations: {
        adjustRateLimits: boolean;
        adjustThrottling: boolean;
        escalateToAdmin: boolean;
        updateRules: boolean;
    };
    metadata: {
        protectionLayers: string[];
        decisionTime: number;
        systemHealth: {
            rateLimitingHealth: number;
            throttlingHealth: number;
            integrationHealth: number;
        };
    };

}
export interface CrossSystemLearning {
    rateLimitingInsights: {
        effectiveBackoffStrategies: BackoffStrategy[];
        optimalThreatThresholds: Record<ThreatLevel, number>;
        endpointVulnerabilities: Record<string, number>;
        patternRecognition: string[];
}
    };
    throttlingInsights: {
        effectiveRuleCombinations: string[];
        systemLoadCorrelations: Record<SystemCondition, number>;
        adaptationSuccessRates: Record<ThrottlingMode, number>;
        falsePositivePatterns: string[];
    };
    integratedInsights: {
        complementaryProtections: Array<{
            rateLimiting: string;
            throttling: string;
            effectiveness: number;
        }>;
        conflictResolution: Array<{
            scenario: string;
            resolution: CoordinationStrategy;
            success: boolean;
        }>;
        performanceImpact: {
            latency: number;
            throughput: number;
            accuracy: number;
        };
        recommendedConfigurations: IntegrationConfig[];
    };

export declare class AdaptiveRateLimitingIntegration extends EventEmitter {
    private rateLimitingService;
    private throttlingEngine;
    private config;
    private decisionHistory;
    private learningData;
    private performanceMetrics;
    constructor();
      rateLimitingService: RateLimitingService,
      throttlingEngine: AdaptiveThrottlingRulesEngine,
      config?: Partial<IntegrationConfig>
    );
    /**
     * Apply unified protection with both rate limiting and adaptive throttling
     */
    applyUnifiedProtection(context: UnifiedProtectionContext): Promise<UnifiedProtectionResult>;
    /**
     * Apply sequential protection (rate limiting first, then throttling)
     */
    private applySequentialProtection;
    /**
     * Apply parallel protection (both systems simultaneously)
     */
    private applyParallelProtection;
    /**
     * Apply conditional protection (choose system based on conditions)
     */
    private applyConditionalProtection;
    /**
     * Apply hierarchical protection (layered with priorities)
     */
    private applyHierarchicalProtection;
    /**
     * Coordinate results from both protection systems
     */
    private coordinateResults;
    /**
     * Apply most restrictive coordination strategy
     */
    private applyMostRestrictive;
    /**
     * Apply least restrictive coordination strategy
     */
    private applyLeastRestrictive;
    /**
     * Apply weighted average coordination strategy
     */
    private applyWeightedAverage;
    /**
     * Apply dynamic selection coordination strategy
     */
    private applyDynamicSelection;
    /**
     * Apply consensus-based coordination strategy
     */
    private applyConsensusBased;
    /**
     * Apply fallback behavior when systems disagree
     */
    private applyFallbackBehavior;
    /**
     * Create unified result object
     */
    private createUnifiedResult;
    /**
     * Create fallback result for error cases
     */
    private createFallbackResult;
    /**
     * Enhance context with integration-specific data
     */
    private enhanceContext;
    /**
     * Determine if rate limiting should be used for conditional mode
     */
    private shouldUseRateLimiting;
    /**
     * Determine if rules should be updated based on results
     */
    private shouldUpdateRules;
    /**
     * Calculate system health score
     */
    private calculateSystemHealth;
    /**
     * Initialize learning data structures
     */
    private initializeLearningData;
    /**
     * Initialize performance metrics
     */
    private initializePerformanceMetrics;
    /**
     * Setup integration between systems
     */
    private setupSystemIntegration;
    /**
     * Start cross-system learning processes
     */
    private startCrossSystemLearning;
    /**
     * Update cross-system learning data
     */
    private updateCrossSystemLearning;
    /**
     * Calculate agreement rate between systems
     */
    private calculateAgreementRate;
    /**
     * Update recommended configurations based on learning
     */
    private updateRecommendedConfigurations;
    /**
     * Record decision for learning and analytics
     */
    private recordDecision;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Get integration statistics and performance metrics
     */
    getIntegrationStatistics(): {
        config: IntegrationConfig;
        performance: typeof this.performanceMetrics;
        learning: CrossSystemLearning;
        systemHealth: {
            rateLimitingHealth: number;
            throttlingHealth: number;
            integrationHealth: number;
            overallHealth: number;
        };
    };
    /**
     * Update integration configuration
     */
    updateConfiguration(newConfig: Partial<IntegrationConfig>): void;
    /**
     * Clean up resources
     */
    cleanup(): void;

export default AdaptiveRateLimitingIntegration;
//# sourceMappingURL=AdaptiveRateLimitingIntegration.d.ts.map