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
import { ThreatLevel, BackoffStrategy } from './RateLimitingService';
import { ThrottlingMode, SystemCondition } from './AdaptiveThrottlingRules';
export var IntegrationMode;
(function (IntegrationMode) {
    IntegrationMode["SEQUENTIAL"] = "sequential";
    IntegrationMode["PARALLEL"] = "parallel";
    IntegrationMode["CONDITIONAL"] = "conditional";
    IntegrationMode["HIERARCHICAL"] = "hierarchical"; // Layer protections with priorities
})(IntegrationMode || (IntegrationMode = {}));
export var CoordinationStrategy;
(function (CoordinationStrategy) {
    CoordinationStrategy["MOST_RESTRICTIVE"] = "most_restrictive";
    CoordinationStrategy["LEAST_RESTRICTIVE"] = "least_restrictive";
    CoordinationStrategy["WEIGHTED_AVERAGE"] = "weighted_average";
    CoordinationStrategy["DYNAMIC_SELECTION"] = "dynamic_selection";
    CoordinationStrategy["CONSENSUS_BASED"] = "consensus_based"; // Require agreement between systems
})(CoordinationStrategy || (CoordinationStrategy = {}));
export var FallbackBehavior;
(function (FallbackBehavior) {
    FallbackBehavior["ALLOW"] = "allow";
    FallbackBehavior["BLOCK"] = "block";
    FallbackBehavior["USE_RATE_LIMITING"] = "use_rate_limiting";
    FallbackBehavior["USE_THROTTLING"] = "use_throttling";
    FallbackBehavior["ESCALATE"] = "escalate"; // Escalate to manual review
})(FallbackBehavior || (FallbackBehavior = {}));
// ========================================
// Adaptive Rate Limiting Integration Engine
// ========================================
export class AdaptiveRateLimitingIntegration extends EventEmitter {
    rateLimitingService;
    throttlingEngine;
    config;
    decisionHistory = new Map();
    learningData;
    performanceMetrics;
    constructor(rateLimitingService, throttlingEngine, config = {}) {
        super();
        this.rateLimitingService = rateLimitingService;
        this.throttlingEngine = throttlingEngine;
        this.config = {
            enableUnifiedProtection: true,
            rateLimitingPriority: 70,
            throttlingPriority: 80,
            integrationMode: IntegrationMode.HIERARCHICAL,
            coordinationStrategy: CoordinationStrategy.MOST_RESTRICTIVE,
            fallbackBehavior: FallbackBehavior.USE_THROTTLING,
            analyticsIntegration: true,
            crossSystemLearning: true,
            ...config
        };
        this.initializeLearningData();
        this.initializePerformanceMetrics();
        this.setupSystemIntegration();
    }
    /**
     * Apply unified protection with both rate limiting and adaptive throttling
     */
    async applyUnifiedProtection(context) {
        const startTime = Date.now();
        try {
            // Enhance context with integration metadata
            const enhancedContext = await this.enhanceContext(context);
            // Apply protection based on integration mode
            let result;
            switch (this.config.integrationMode) {
                case IntegrationMode.SEQUENTIAL:
                    result = await this.applySequentialProtection(enhancedContext);
                    break;
                case IntegrationMode.PARALLEL:
                    result = await this.applyParallelProtection(enhancedContext);
                    break;
                case IntegrationMode.CONDITIONAL:
                    result = await this.applyConditionalProtection(enhancedContext);
                    break;
                case IntegrationMode.HIERARCHICAL:
                    result = await this.applyHierarchicalProtection(enhancedContext);
                    break;
                default:
                    result = await this.applyParallelProtection(enhancedContext);
            }
            // Record decision and update learning data
            await this.recordDecision(enhancedContext, result);
            // Update performance metrics
            this.updatePerformanceMetrics(result, Date.now() - startTime);
            // Emit events for monitoring
            this.emit('protectionApplied', {
                context: enhancedContext,
                result,
                decisionTime: Date.now() - startTime
            });
            return result;
        }
        catch (error) {
            this.emit('protectionError', {
                context,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            });
            // Fallback to rate limiting only
            const rateLimitResult = await this.rateLimitingService.checkRateLimit(context.ip, context.endpoint, { threatLevel: context.threatLevel });
            return this.createFallbackResult(rateLimitResult, error);
        }
    }
    /**
     * Apply sequential protection (rate limiting first, then throttling)
     */
    async applySequentialProtection(context) {
        // Step 1: Apply rate limiting
        const rateLimitResult = await this.rateLimitingService.checkRateLimit(context.ip, context.endpoint, {
            threatLevel: context.threatLevel,
            userId: context.userId,
            userAgent: context.userAgent
        });
        // If rate limiting blocks, return immediately
        if (rateLimitResult.result === 'blocked') {
            return this.createUnifiedResult(rateLimitResult, { action: 'allow', delay: 0, reason: 'Not applied', ruleId: 'none', metadata: { systemCondition: 'normal' } }, 'block', 0, 'rate_limiting', 'Rate limiting blocked request', 95);
        }
        // Step 2: Apply adaptive throttling
        const throttlingResult = await this.throttlingEngine.applyThrottling(context);
        // Coordinate the results
        return this.coordinateResults(rateLimitResult, throttlingResult, 'sequential');
    }
    /**
     * Apply parallel protection (both systems simultaneously)
     */
    async applyParallelProtection(context) {
        // Apply both systems in parallel
        const [rateLimitResult, throttlingResult] = await Promise.all([
            this.rateLimitingService.checkRateLimit(context.ip, context.endpoint, {
                threatLevel: context.threatLevel,
                userId: context.userId,
                userAgent: context.userAgent
            }),
            this.throttlingEngine.applyThrottling(context)
        ]);
        // Coordinate the results
        return this.coordinateResults(rateLimitResult, throttlingResult, 'parallel');
    }
    /**
     * Apply conditional protection (choose system based on conditions)
     */
    async applyConditionalProtection(context) {
        // Decision logic for which system to use
        const useRateLimiting = this.shouldUseRateLimiting(context);
        if (useRateLimiting) {
            const rateLimitResult = await this.rateLimitingService.checkRateLimit(context.ip, context.endpoint, {
                threatLevel: context.threatLevel,
                userId: context.userId,
                userAgent: context.userAgent
            });
            return this.createUnifiedResult(rateLimitResult, { action: 'allow', delay: 0, reason: 'Not applied', ruleId: 'none', metadata: { systemCondition: 'normal' } }, rateLimitResult.result === 'blocked' ? 'block' : 'allow', rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0, 'rate_limiting', 'Conditional selection: rate limiting', 90);
        }
        else {
            const throttlingResult = await this.throttlingEngine.applyThrottling(context);
            return this.createUnifiedResult({ identifier: context.ip, endpoint: context.endpoint, result: 'allowed', remainingRequests: 100, resetTime: new Date(), backoffLevel: 0, threatLevel: context.threatLevel, adaptiveMultiplier: 1.0 }, throttlingResult, throttlingResult.action, throttlingResult.delay, 'throttling', 'Conditional selection: adaptive throttling', 90);
        }
    }
    /**
     * Apply hierarchical protection (layered with priorities)
     */
    async applyHierarchicalProtection(context) {
        const results = [];
        // Apply rate limiting
        const rateLimitResult = await this.rateLimitingService.checkRateLimit(context.ip, context.endpoint, {
            threatLevel: context.threatLevel,
            userId: context.userId,
            userAgent: context.userAgent
        });
        results.push({ system: 'rate_limiting', result: rateLimitResult, priority: this.config.rateLimitingPriority });
        // Apply throttling
        const throttlingResult = await this.throttlingEngine.applyThrottling(context);
        results.push({ system: 'throttling', result: throttlingResult, priority: this.config.throttlingPriority });
        // Sort by priority (highest first)
        results.sort((a, b) => b.priority - a.priority);
        // Use highest priority system's decision
        const primaryResult = results[0];
        if (primaryResult.system === 'rate_limiting') {
            return this.coordinateResults(rateLimitResult, throttlingResult, 'hierarchical_rate_limiting');
        }
        else {
            return this.coordinateResults(rateLimitResult, throttlingResult, 'hierarchical_throttling');
        }
    }
    /**
     * Coordinate results from both protection systems
     */
    coordinateResults(rateLimitResult, throttlingResult, mode) {
        let finalAction;
        let finalDelay;
        let decisionSystem;
        let reasoning;
        let confidence;
        switch (this.config.coordinationStrategy) {
            case CoordinationStrategy.MOST_RESTRICTIVE:
                ({ finalAction, finalDelay, decisionSystem, reasoning, confidence } =
                    this.applyMostRestrictive(rateLimitResult, throttlingResult));
                break;
            case CoordinationStrategy.LEAST_RESTRICTIVE:
                ({ finalAction, finalDelay, decisionSystem, reasoning, confidence } =
                    this.applyLeastRestrictive(rateLimitResult, throttlingResult));
                break;
            case CoordinationStrategy.WEIGHTED_AVERAGE:
                ({ finalAction, finalDelay, decisionSystem, reasoning, confidence } =
                    this.applyWeightedAverage(rateLimitResult, throttlingResult));
                break;
            case CoordinationStrategy.DYNAMIC_SELECTION:
                ({ finalAction, finalDelay, decisionSystem, reasoning, confidence } =
                    this.applyDynamicSelection(rateLimitResult, throttlingResult));
                break;
            case CoordinationStrategy.CONSENSUS_BASED:
                ({ finalAction, finalDelay, decisionSystem, reasoning, confidence } =
                    this.applyConsensusBased(rateLimitResult, throttlingResult));
                break;
            default:
                ({ finalAction, finalDelay, decisionSystem, reasoning, confidence } =
                    this.applyMostRestrictive(rateLimitResult, throttlingResult));
        }
        return this.createUnifiedResult(rateLimitResult, throttlingResult, finalAction, finalDelay, decisionSystem, reasoning, confidence);
    }
    /**
     * Apply most restrictive coordination strategy
     */
    applyMostRestrictive(rateLimitResult, throttlingResult) {
        // Rate limiting blocks
        if (rateLimitResult.result === 'blocked') {
            return {
                finalAction: 'block',
                finalDelay: rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0,
                decisionSystem: 'rate_limiting',
                reasoning: 'Rate limiting blocked request',
                confidence: 95
            };
        }
        // Throttling blocks or throttles
        if (throttlingResult.action === 'block') {
            return {
                finalAction: 'block',
                finalDelay: 0,
                decisionSystem: 'throttling',
                reasoning: 'Adaptive throttling blocked request',
                confidence: 90
            };
        }
        if (throttlingResult.action === 'throttle') {
            return {
                finalAction: 'throttle',
                finalDelay: throttlingResult.delay,
                decisionSystem: 'throttling',
                reasoning: 'Adaptive throttling applied delay',
                confidence: 85
            };
        }
        // Both allow - use higher delay if any
        const maxDelay = Math.max(rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0, throttlingResult.delay);
        return {
            finalAction: maxDelay > 0 ? 'delay' : 'allow',
            finalDelay: maxDelay,
            decisionSystem: 'integration',
            reasoning: 'Both systems allow, using maximum delay',
            confidence: 80
        };
    }
    /**
     * Apply least restrictive coordination strategy
     */
    applyLeastRestrictive(rateLimitResult, throttlingResult) {
        // If either allows, allow (with minimum delay)
        if (rateLimitResult.result === 'allowed' || throttlingResult.action === 'allow') {
            const minDelay = Math.min(rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0, throttlingResult.delay);
            return {
                finalAction: minDelay > 0 ? 'delay' : 'allow',
                finalDelay: minDelay,
                decisionSystem: 'integration',
                reasoning: 'At least one system allows, using minimum delay',
                confidence: 70
            };
        }
        // Both block - still block
        return {
            finalAction: 'block',
            finalDelay: 0,
            decisionSystem: 'integration',
            reasoning: 'Both systems block request',
            confidence: 95
        };
    }
    /**
     * Apply weighted average coordination strategy
     */
    applyWeightedAverage(rateLimitResult, throttlingResult) {
        const rateLimitWeight = this.config.rateLimitingPriority / 100;
        const throttlingWeight = this.config.throttlingPriority / 100;
        // Convert results to numerical scores (0 = allow, 100 = block)
        const rateLimitScore = rateLimitResult.result === 'blocked' ? 100 :
            rateLimitResult.result === 'warning' ? 50 : 0;
        const throttlingScore = throttlingResult.action === 'block' ? 100 :
            throttlingResult.action === 'throttle' ? 75 :
                throttlingResult.action === 'shed' ? 60 : 0;
        // Calculate weighted average
        const weightedScore = (rateLimitScore * rateLimitWeight + throttlingScore * throttlingWeight) /
            (rateLimitWeight + throttlingWeight);
        // Calculate weighted delay
        const rateLimitDelay = rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0;
        const weightedDelay = (rateLimitDelay * rateLimitWeight + throttlingResult.delay * throttlingWeight) /
            (rateLimitWeight + throttlingWeight);
        // Determine final action based on weighted score
        let finalAction;
        if (weightedScore >= 90)
            finalAction = 'block';
        else if (weightedScore >= 60)
            finalAction = 'throttle';
        else if (weightedScore >= 30)
            finalAction = 'delay';
        else
            finalAction = 'allow';
        return {
            finalAction,
            finalDelay: Math.round(weightedDelay),
            decisionSystem: 'integration',
            reasoning: `Weighted average decision (score: ${weightedScore.toFixed(1)})`,
            confidence: Math.min(95, 70 + Math.abs(50 - weightedScore) * 0.5)
        };
    }
    /**
     * Apply dynamic selection coordination strategy
     */
    applyDynamicSelection(rateLimitResult, throttlingResult) {
        // Use rate limiting for high threat levels
        if (rateLimitResult.threatLevel === ThreatLevel.HIGH || rateLimitResult.threatLevel === ThreatLevel.CRITICAL) {
            return {
                finalAction: rateLimitResult.result === 'blocked' ? 'block' : 'allow',
                finalDelay: rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0,
                decisionSystem: 'rate_limiting',
                reasoning: 'High threat level - using rate limiting',
                confidence: 90
            };
        }
        // Use throttling for system load issues
        if (throttlingResult.metadata?.systemCondition === 'high_load' ||
            throttlingResult.metadata?.systemCondition === 'overload') {
            return {
                finalAction: throttlingResult.action,
                finalDelay: throttlingResult.delay,
                decisionSystem: 'throttling',
                reasoning: 'High system load - using adaptive throttling',
                confidence: 85
            };
        }
        // Default to most restrictive
        return this.applyMostRestrictive(rateLimitResult, throttlingResult);
    }
    /**
     * Apply consensus-based coordination strategy
     */
    applyConsensusBased(rateLimitResult, throttlingResult) {
        const rateLimitBlocks = rateLimitResult.result === 'blocked';
        const throttlingBlocks = throttlingResult.action === 'block';
        // Both agree on blocking
        if (rateLimitBlocks && throttlingBlocks) {
            return {
                finalAction: 'block',
                finalDelay: 0,
                decisionSystem: 'consensus',
                reasoning: 'Both systems agree to block',
                confidence: 98
            };
        }
        // Both agree on allowing
        if (!rateLimitBlocks && !throttlingBlocks) {
            const maxDelay = Math.max(rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0, throttlingResult.delay);
            return {
                finalAction: maxDelay > 0 ? 'delay' : 'allow',
                finalDelay: maxDelay,
                decisionSystem: 'consensus',
                reasoning: 'Both systems agree to allow',
                confidence: 95
            };
        }
        // Systems disagree - apply fallback behavior
        return this.applyFallbackBehavior(rateLimitResult, throttlingResult);
    }
    /**
     * Apply fallback behavior when systems disagree
     */
    applyFallbackBehavior(rateLimitResult, throttlingResult) {
        switch (this.config.fallbackBehavior) {
            case FallbackBehavior.ALLOW:
                return {
                    finalAction: 'allow',
                    finalDelay: 0,
                    decisionSystem: 'fallback',
                    reasoning: 'Fallback: allow on disagreement',
                    confidence: 60
                };
            case FallbackBehavior.BLOCK:
                return {
                    finalAction: 'block',
                    finalDelay: 0,
                    decisionSystem: 'fallback',
                    reasoning: 'Fallback: block on disagreement',
                    confidence: 75
                };
            case FallbackBehavior.USE_RATE_LIMITING:
                return {
                    finalAction: rateLimitResult.result === 'blocked' ? 'block' : 'allow',
                    finalDelay: rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0,
                    decisionSystem: 'rate_limiting',
                    reasoning: 'Fallback: using rate limiting decision',
                    confidence: 80
                };
            case FallbackBehavior.USE_THROTTLING:
                return {
                    finalAction: throttlingResult.action,
                    finalDelay: throttlingResult.delay,
                    decisionSystem: 'throttling',
                    reasoning: 'Fallback: using throttling decision',
                    confidence: 80
                };
            case FallbackBehavior.ESCALATE:
                return {
                    finalAction: 'block',
                    finalDelay: 30000, // 30 second delay for manual review
                    decisionSystem: 'escalation',
                    reasoning: 'Fallback: escalated for manual review',
                    confidence: 50
                };
            default:
                return this.applyMostRestrictive(rateLimitResult, throttlingResult);
        }
    }
    /**
     * Create unified result object
     */
    createUnifiedResult(rateLimitResult, throttlingResult, action, delay, decisionSystem, reasoning, confidence) {
        return {
            action,
            delay,
            rateLimitingResult: rateLimitResult,
            throttlingResult: throttlingResult,
            finalDecision: {
                system: decisionSystem,
                strategy: this.config.coordinationStrategy,
                confidence,
                reasoning
            },
            recommendations: {
                adjustRateLimits: confidence < 80 && rateLimitResult.result !== 'blocked',
                adjustThrottling: confidence < 80 && throttlingResult.action !== 'block',
                escalateToAdmin: confidence < 70,
                updateRules: this.shouldUpdateRules(rateLimitResult, throttlingResult)
            },
            metadata: {
                protectionLayers: [
                    rateLimitResult.result !== 'allowed' ? 'rate_limiting' : '',
                    throttlingResult.action !== 'allow' ? 'throttling' : '',
                    'integration'
                ].filter(Boolean),
                decisionTime: 0, // Will be set by caller
                systemHealth: {
                    rateLimitingHealth: this.calculateSystemHealth('rate_limiting'),
                    throttlingHealth: this.calculateSystemHealth('throttling'),
                    integrationHealth: this.calculateSystemHealth('integration')
                }
            }
        };
    }
    /**
     * Create fallback result for error cases
     */
    createFallbackResult(rateLimitResult, error) {
        return {
            action: rateLimitResult.result === 'blocked' ? 'block' : 'allow',
            delay: rateLimitResult.retryAfter ? rateLimitResult.retryAfter * 1000 : 0,
            rateLimitingResult: rateLimitResult,
            throttlingResult: {
                action: 'allow',
                delay: 0,
                reason: 'Error in throttling system',
                ruleId: 'error',
                metadata: { systemCondition: 'normal' }
            },
            finalDecision: {
                system: 'rate_limiting',
                strategy: CoordinationStrategy.MOST_RESTRICTIVE,
                confidence: 60,
                reasoning: `Fallback to rate limiting due to error: ${error instanceof Error ? error.message : 'Unknown error'}`
            },
            recommendations: {
                adjustRateLimits: false,
                adjustThrottling: true,
                escalateToAdmin: true,
                updateRules: false
            },
            metadata: {
                protectionLayers: ['rate_limiting', 'fallback'],
                decisionTime: 0,
                systemHealth: {
                    rateLimitingHealth: 80,
                    throttlingHealth: 30,
                    integrationHealth: 50
                }
            }
        };
    }
    /**
     * Enhance context with integration-specific data
     */
    async enhanceContext(context) {
        // Add rate limiting history
        const rateLimitingHistory = {
            recentAttempts: this.rateLimitingService.getRecentAttemptsForIntegration?.(context.ip, context.endpoint)?.length || 0,
            backoffLevel: this.rateLimitingService.getBackoffDelay(context.ip, context.endpoint),
            threatAssessment: context.threatLevel,
            adaptiveMultiplier: 1.0
        };
        // Add throttling history  
        const throttlingStats = this.throttlingEngine.getStatistics();
        const throttlingHistory = {
            recentThrottling: 0, // Would track recent throttling events
            systemCondition: this.throttlingEngine.getSystemCondition(),
            activeRules: Array.from({ length: throttlingStats.activeRules }, (_, i) => `rule-${i}`),
            effectivenessScore: 85 // Would calculate from historical data
        };
        // Add integration metadata
        const integrationMetadata = {
            requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            correlationId: `corr-${Date.now()}`,
            protectionLayers: ['rate_limiting', 'throttling', 'integration'],
            decisionTrail: []
        };
        return {
            ...context,
            rateLimitingHistory,
            throttlingHistory,
            integrationMetadata
        };
    }
    /**
     * Determine if rate limiting should be used for conditional mode
     */
    shouldUseRateLimiting(context) {
        // Use rate limiting for high threat levels
        if (context.threatLevel === ThreatLevel.HIGH || context.threatLevel === ThreatLevel.CRITICAL) {
            return true;
        }
        // Use rate limiting for authentication endpoints
        if (context.endpoint.includes('/auth/') || context.endpoint.includes('/login')) {
            return true;
        }
        // Use throttling for API endpoints under load
        if (context.endpoint.includes('/api/') && context.systemLoad > 70) {
            return false;
        }
        // Default to throttling for better adaptability
        return false;
    }
    /**
     * Determine if rules should be updated based on results
     */
    shouldUpdateRules(rateLimitResult, throttlingResult) {
        // Update if systems consistently disagree
        const disagreement = (rateLimitResult.result === 'blocked') !== (throttlingResult.action === 'block');
        // Update if confidence is low
        const lowConfidence = rateLimitResult.adaptiveMultiplier < 0.5;
        // Update if system is under stress
        const systemStress = throttlingResult.metadata?.systemCondition === 'overload';
        return disagreement || lowConfidence || systemStress;
    }
    /**
     * Calculate system health score
     */
    calculateSystemHealth(system) {
        switch (system) {
            case 'rate_limiting':
                const rlStats = this.rateLimitingService.getStatistics();
                const blockRate = rlStats.totalAttempts > 0 ? (rlStats.blockedAttempts / rlStats.totalAttempts) * 100 : 0;
                return Math.max(0, 100 - blockRate * 2); // Lower block rate = better health
            case 'throttling':
                const thStats = this.throttlingEngine.getStatistics();
                const ruleEfficiency = thStats.activeRules > 0 ? (thStats.activeRules / thStats.rulesCount) * 100 : 100;
                return Math.min(100, ruleEfficiency);
            case 'integration':
                return Math.min(100, this.performanceMetrics.systemAgreementRate);
            default:
                return 75;
        }
    }
    /**
     * Initialize learning data structures
     */
    initializeLearningData() {
        this.learningData = {
            rateLimitingInsights: {
                effectiveBackoffStrategies: [BackoffStrategy.EXPONENTIAL, BackoffStrategy.FIBONACCI],
                optimalThreatThresholds: {
                    [ThreatLevel.LOW]: 10,
                    [ThreatLevel.MEDIUM]: 30,
                    [ThreatLevel.HIGH]: 60,
                    [ThreatLevel.CRITICAL]: 90
                },
                endpointVulnerabilities: {},
                patternRecognition: []
            },
            throttlingInsights: {
                effectiveRuleCombinations: [],
                systemLoadCorrelations: {
                    [SystemCondition.NORMAL]: 0.1,
                    [SystemCondition.ELEVATED]: 0.3,
                    [SystemCondition.HIGH_LOAD]: 0.6,
                    [SystemCondition.OVERLOAD]: 0.9,
                    [SystemCondition.UNDER_ATTACK]: 1.0
                },
                adaptationSuccessRates: {
                    [ThrottlingMode.ADAPTIVE]: 85,
                    [ThrottlingMode.PROGRESSIVE]: 80,
                    [ThrottlingMode.CIRCUIT_BREAKER]: 95,
                    [ThrottlingMode.LOAD_SHEDDING]: 75,
                    [ThrottlingMode.BANDWIDTH_SHAPING]: 70
                },
                falsePositivePatterns: []
            },
            integratedInsights: {
                complementaryProtections: [],
                conflictResolution: [],
                performanceImpact: { latency: 0, throughput: 0, accuracy: 0 },
                recommendedConfigurations: []
            }
        };
    }
    /**
     * Initialize performance metrics
     */
    initializePerformanceMetrics() {
        this.performanceMetrics = {
            totalRequests: 0,
            blockedRequests: 0,
            throttledRequests: 0,
            averageDecisionTime: 0,
            systemAgreementRate: 85,
            falsePositiveRate: 5
        };
    }
    /**
     * Setup integration between systems
     */
    setupSystemIntegration() {
        // Listen to rate limiting events
        this.rateLimitingService.on('rateLimitExceeded', (data) => {
            this.emit('rateLimitingEvent', { type: 'exceeded', data, timestamp: new Date() });
        });
        this.rateLimitingService.on('attemptRecorded', (data) => {
            this.emit('rateLimitingEvent', { type: 'attempt', data, timestamp: new Date() });
        });
        // Listen to throttling events
        this.throttlingEngine.on('throttlingApplied', (data) => {
            this.emit('throttlingEvent', { type: 'applied', data, timestamp: new Date() });
        });
        this.throttlingEngine.on('ruleAdded', (data) => {
            this.emit('throttlingEvent', { type: 'rule_added', data, timestamp: new Date() });
        });
        // Cross-system learning
        if (this.config.crossSystemLearning) {
            this.startCrossSystemLearning();
        }
    }
    /**
     * Start cross-system learning processes
     */
    startCrossSystemLearning() {
        // Periodic learning update every 10 minutes
        setInterval(() => {
            this.updateCrossSystemLearning();
        }, 10 * 60 * 1000);
    }
    /**
     * Update cross-system learning data
     */
    updateCrossSystemLearning() {
        // Update learning insights based on recent decisions
        const recentDecisions = Array.from(this.decisionHistory.values()).flat()
            .filter(d => d.timestamp > new Date(Date.now() - 60 * 60 * 1000)); // Last hour
        // Analyze decision patterns
        const agreementRate = this.calculateAgreementRate(recentDecisions);
        this.performanceMetrics.systemAgreementRate = agreementRate;
        // Update recommendations
        this.updateRecommendedConfigurations();
        this.emit('learningUpdated', {
            timestamp: new Date(),
            agreementRate,
            insights: this.learningData
        });
    }
    /**
     * Calculate agreement rate between systems
     */
    calculateAgreementRate(decisions) {
        if (decisions.length < 2)
            return 100;
        const agreements = decisions.filter(d => d.confidence > 80).length;
        return (agreements / decisions.length) * 100;
    }
    /**
     * Update recommended configurations based on learning
     */
    updateRecommendedConfigurations() {
        const currentPerformance = this.performanceMetrics;
        // Generate recommendations based on performance
        const recommendations = [];
        if (currentPerformance.systemAgreementRate < 70) {
            recommendations.push({
                ...this.config,
                coordinationStrategy: CoordinationStrategy.DYNAMIC_SELECTION,
                fallbackBehavior: FallbackBehavior.USE_THROTTLING
            });
        }
        if (currentPerformance.falsePositiveRate > 10) {
            recommendations.push({
                ...this.config,
                coordinationStrategy: CoordinationStrategy.LEAST_RESTRICTIVE,
                throttlingPriority: Math.max(50, this.config.throttlingPriority - 10)
            });
        }
        this.learningData.integratedInsights.recommendedConfigurations = recommendations;
    }
    /**
     * Record decision for learning and analytics
     */
    async recordDecision(context, result) {
        const decision = {
            system: result.finalDecision.system,
            timestamp: new Date(),
            decision: result.action,
            confidence: result.finalDecision.confidence,
            reasoning: result.finalDecision.reasoning,
            parameters: {
                endpoint: context.endpoint,
                threatLevel: context.threatLevel,
                systemLoad: context.systemLoad,
                coordinationStrategy: this.config.coordinationStrategy
            }
        };
        const key = `${context.ip}:${context.endpoint}`;
        const decisions = this.decisionHistory.get(key) || [];
        decisions.push(decision);
        // Keep only recent decisions (last 24 hours)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentDecisions = decisions.filter(d => d.timestamp > cutoff);
        this.decisionHistory.set(key, recentDecisions);
    }
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(result, decisionTime) {
        this.performanceMetrics.totalRequests++;
        if (result.action === 'block') {
            this.performanceMetrics.blockedRequests++;
        }
        else if (result.action === 'throttle') {
            this.performanceMetrics.throttledRequests++;
        }
        // Update average decision time
        this.performanceMetrics.averageDecisionTime =
            (this.performanceMetrics.averageDecisionTime * (this.performanceMetrics.totalRequests - 1) + decisionTime) /
                this.performanceMetrics.totalRequests;
        // Add decision time to result metadata
        result.metadata.decisionTime = decisionTime;
    }
    /**
     * Get integration statistics and performance metrics
     */
    getIntegrationStatistics() {
        const systemHealth = {
            rateLimitingHealth: this.calculateSystemHealth('rate_limiting'),
            throttlingHealth: this.calculateSystemHealth('throttling'),
            integrationHealth: this.calculateSystemHealth('integration'),
            overallHealth: 0
        };
        systemHealth.overallHealth = (systemHealth.rateLimitingHealth +
            systemHealth.throttlingHealth +
            systemHealth.integrationHealth) / 3;
        return {
            config: this.config,
            performance: this.performanceMetrics,
            learning: this.learningData,
            systemHealth
        };
    }
    /**
     * Update integration configuration
     */
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configurationUpdated', {
            timestamp: new Date(),
            config: this.config
        });
    }
    /**
     * Clean up resources
     */
    cleanup() {
        this.decisionHistory.clear();
        this.removeAllListeners();
    }
}
export default AdaptiveRateLimitingIntegration;
