/**
 * Challenge Telemetry Service
 *
 * Comprehensive telemetry system for tracking the effectiveness of security
 * challenges, CAPTCHAs, and authentication methods. Provides real-time
 * analytics, fraud detection, and optimization recommendations.
 *
 * Features:
 * - Challenge success/failure rate tracking
 * - User behavior analytics
 * - Fraud pattern detection
 * - Performance metrics collection
 * - A/B testing support
 * - Real-time dashboards
 * - Automated optimization suggestions
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';
// Challenge Types
export var ChallengeType;
(function (ChallengeType) {
    ChallengeType["CAPTCHA_IMAGE"] = "captcha_image";
    ChallengeType["CAPTCHA_AUDIO"] = "captcha_audio";
    ChallengeType["CAPTCHA_MATH"] = "captcha_math";
    ChallengeType["CAPTCHA_TEXT"] = "captcha_text";
    ChallengeType["TWO_FACTOR_SMS"] = "two_factor_sms";
    ChallengeType["TWO_FACTOR_EMAIL"] = "two_factor_email";
    ChallengeType["TWO_FACTOR_TOTP"] = "two_factor_totp";
    ChallengeType["BIOMETRIC_FINGERPRINT"] = "biometric_fingerprint";
    ChallengeType["BIOMETRIC_FACE"] = "biometric_face";
    ChallengeType["BEHAVIORAL_ANALYSIS"] = "behavioral_analysis";
    ChallengeType["DEVICE_VERIFICATION"] = "device_verification";
    ChallengeType["LOCATION_VERIFICATION"] = "location_verification";
})(ChallengeType || (ChallengeType = {}));
// Challenge Outcomes
export var ChallengeOutcome;
(function (ChallengeOutcome) {
    ChallengeOutcome["SUCCESS"] = "success";
    ChallengeOutcome["FAILURE"] = "failure";
    ChallengeOutcome["TIMEOUT"] = "timeout";
    ChallengeOutcome["ABANDONED"] = "abandoned";
    ChallengeOutcome["ERROR"] = "error";
    ChallengeOutcome["SKIPPED"] = "skipped";
})(ChallengeOutcome || (ChallengeOutcome = {}));
// Difficulty Levels
export var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["EASY"] = "easy";
    DifficultyLevel["MEDIUM"] = "medium";
    DifficultyLevel["HARD"] = "hard";
    DifficultyLevel["ADAPTIVE"] = "adaptive";
})(DifficultyLevel || (DifficultyLevel = {}));
// User Agent Types
export var UserAgentType;
(function (UserAgentType) {
    UserAgentType["HUMAN"] = "human";
    UserAgentType["BOT_SUSPECTED"] = "bot_suspected";
    UserAgentType["BOT_CONFIRMED"] = "bot_confirmed";
    UserAgentType["UNKNOWN"] = "unknown";
})(UserAgentType || (UserAgentType = {}));
/**
 * Comprehensive challenge telemetry service
 */
export class ChallengeTelemetryService extends EventEmitter {
    events = new Map();
    statistics = new Map();
    abTests = new Map();
    fraudPatterns = new Map();
    sessionData = new Map();
    constructor() {
        super();
        this.initializeFraudPatterns();
        this.startMetricsAggregation();
        this.startFraudDetection();
    }
    /**
     * Record a challenge event
     */
    recordChallengeEvent(event) {
        const fullEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...event
        };
        // Store the event
        this.events.set(fullEvent.id, fullEvent);
        // Update session data
        this.updateSessionData(fullEvent);
        // Analyze for fraud patterns
        this.analyzeFraudPattern(fullEvent);
        // Update real-time statistics
        this.updateRealTimeStatistics(fullEvent);
        // Emit event for real-time processing
        this.emit('challengeEventRecorded', fullEvent);
        return fullEvent.id;
    }
    /**
     * Start tracking a challenge session
     */
    startChallengeSession(sessionId, challengeType, context) {
        const sessionData = {
            sessionId,
            challengeType,
            startTime: new Date(),
            context,
            attemptCount: 0,
            events: []
        };
        this.sessionData.set(sessionId, sessionData);
        this.emit('challengeSessionStarted', sessionData);
    }
    /**
     * Record challenge completion
     */
    recordChallengeCompletion(sessionId, challengeId, outcome, timeToComplete, userBehavior, fraudIndicators) {
        const session = this.sessionData.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        session.attemptCount++;
        const event = {
            sessionId,
            challengeType: session.challengeType,
            challengeId,
            outcome,
            difficultyLevel: session.difficulty || DifficultyLevel.MEDIUM,
            attemptNumber: session.attemptCount,
            timeToComplete,
            context: {
                ipAddress: 'unknown',
                userAgent: 'unknown',
                userAgentType: UserAgentType.UNKNOWN,
                browserInfo: {
                    name: 'unknown',
                    version: 'unknown',
                    platform: 'unknown',
                    mobile: false,
                    touchSupport: false,
                    screenResolution: 'unknown'
                },
                ...session.context
            },
            challengeData: {
                parameters: session.parameters || {},
                metadata: session.metadata || {}
            },
            userBehavior,
            fraudIndicators: {
                riskScore: 0,
                indicators: [],
                automationDetected: false,
                anomalousPattern: false,
                ...fraudIndicators
            },
            accessibility: {
                screenReaderDetected: false,
                highContrastMode: false,
                assistiveTechUsed: [],
                accommodationsApplied: []
            }
        };
        this.recordChallengeEvent(event);
    }
    /**
     * Get challenge statistics
     */
    getChallengeStatistics(challengeType, startTime, endTime) {
        const cacheKey = `${challengeType}_${startTime.getTime()}_${endTime.getTime()}`;
        if (this.statistics.has(cacheKey)) {
            return this.statistics.get(cacheKey);
        }
        const events = this.queryEvents({
            startTime,
            endTime,
            challengeTypes: [challengeType]
        });
        const stats = this.calculateStatistics(challengeType, events, startTime, endTime);
        this.statistics.set(cacheKey, stats);
        return stats;
    }
    /**
     * Query challenge events
     */
    queryEvents(query) {
        let events = Array.from(this.events.values());
        // Apply filters
        events = events.filter(event => event.timestamp >= query.startTime && event.timestamp <= query.endTime);
        if (query.challengeTypes?.length) {
            events = events.filter(event => query.challengeTypes.includes(event.challengeType));
        }
        if (query.outcomes?.length) {
            events = events.filter(event => query.outcomes.includes(event.outcome));
        }
        if (query.userAgentTypes?.length) {
            events = events.filter(event => query.userAgentTypes.includes(event.context.userAgentType));
        }
        if (query.minRiskScore !== undefined) {
            events = events.filter(event => event.fraudIndicators.riskScore >= query.minRiskScore);
        }
        if (query.maxRiskScore !== undefined) {
            events = events.filter(event => event.fraudIndicators.riskScore <= query.maxRiskScore);
        }
        if (query.ipAddresses?.length) {
            events = events.filter(event => query.ipAddresses.includes(event.context.ipAddress));
        }
        if (query.userIds?.length) {
            events = events.filter(event => event.userId && query.userIds.includes(event.userId));
        }
        if (query.countries?.length) {
            events = events.filter(event => event.context.geolocation &&
                query.countries.includes(event.context.geolocation.country));
        }
        // Sort by timestamp (newest first)
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || 1000;
        return events.slice(offset, offset + limit);
    }
    /**
     * Detect fraud patterns in real-time
     */
    analyzeFraudPattern(event) {
        const patterns = [];
        let riskScore = event.fraudIndicators.riskScore;
        const recommendations = [];
        // Check against defined fraud patterns
        for (const [patternId, pattern] of this.fraudPatterns) {
            if (!pattern.isActive)
                continue;
            const matches = pattern.conditions.every(condition => {
                const value = this.getEventFieldValue(event, condition.field);
                return this.evaluateCondition(value, condition.operator, condition.value);
            });
            if (matches) {
                patterns.push(pattern.name);
                riskScore += (pattern.severity === 'critical' ? 30 :
                    pattern.severity === 'high' ? 20 :
                        pattern.severity === 'medium' ? 10 : 5);
                // Add recommendations based on pattern
                pattern.actions.forEach(action => {
                    if (action.type === 'challenge') {
                        recommendations.push('Increase challenge difficulty');
                    }
                    else if (action.type === 'block') {
                        recommendations.push('Consider blocking this user/IP');
                    }
                    else if (action.type === 'monitor') {
                        recommendations.push('Enable enhanced monitoring');
                    }
                });
            }
        }
        // Additional heuristic analysis
        if (event.timeToComplete < 500) { // Very fast completion
            patterns.push('suspiciously_fast_completion');
            riskScore += 15;
            recommendations.push('Implement timing validation');
        }
        if (event.userBehavior.mouseMovements === 0 && event.challengeType === ChallengeType.CAPTCHA_IMAGE) {
            patterns.push('no_mouse_movement');
            riskScore += 25;
            recommendations.push('Require mouse interaction');
        }
        if (event.userBehavior.hesitationTime === 0) {
            patterns.push('no_hesitation');
            riskScore += 10;
            recommendations.push('Monitor for automation');
        }
        riskScore = Math.min(100, riskScore);
        const isfraudulent = riskScore > 70;
        if (isfraudulent) {
            this.emit('fraudDetected', { event, patterns, riskScore, recommendations });
        }
        return {
            isfraudulent,
            patterns,
            riskScore,
            recommendations
        };
    }
    /**
     * Create A/B test for challenge optimization
     */
    createABTest(config) {
        const testId = crypto.randomUUID();
        const fullConfig = {
            id: testId,
            ...config
        };
        // Validate traffic percentages sum to 100
        const totalTraffic = fullConfig.variants.reduce((sum, variant) => sum + variant.trafficPercentage, 0);
        if (Math.abs(totalTraffic - 100) > 0.1) {
            throw new Error('Variant traffic percentages must sum to 100%');
        }
        this.abTests.set(testId, fullConfig);
        this.emit('abTestCreated', fullConfig);
        return testId;
    }
    /**
     * Get A/B test variant for a session
     */
    getABTestVariant(challengeType, sessionId) {
        // Find active A/B test for this challenge type
        const activeTest = Array.from(this.abTests.values()).find(test => test.challengeType === challengeType &&
            test.isActive &&
            new Date() >= test.startDate &&
            new Date() <= test.endDate);
        if (!activeTest) {
            return null;
        }
        // Deterministic variant selection based on session ID
        const hash = crypto.createHash('md5').update(sessionId + activeTest.id).digest('hex');
        const hashValue = parseInt(hash.substring(0, 8), 16);
        const percentage = (hashValue % 10000) / 100; // 0-99.99
        let cumulativePercentage = 0;
        for (const variant of activeTest.variants) {
            cumulativePercentage += variant.trafficPercentage;
            if (percentage < cumulativePercentage) {
                return {
                    testId: activeTest.id,
                    variantId: variant.id,
                    parameters: variant.parameters
                };
            }
        }
        // Fallback to first variant
        return {
            testId: activeTest.id,
            variantId: activeTest.variants[0].id,
            parameters: activeTest.variants[0].parameters
        };
    }
    /**
     * Get A/B test results
     */
    getABTestResults(testId) {
        const test = this.abTests.get(testId);
        if (!test) {
            throw new Error(`A/B test not found: ${testId}`);
        }
        const results = test.variants.map(variant => {
            const variantEvents = Array.from(this.events.values()).filter(event => event.challengeType === test.challengeType &&
                event.challengeData.variant === variant.id &&
                event.timestamp >= test.startDate &&
                event.timestamp <= test.endDate);
            const sampleSize = variantEvents.length;
            const successfulEvents = variantEvents.filter(e => e.outcome === ChallengeOutcome.SUCCESS);
            const successRate = sampleSize > 0 ? (successfulEvents.length / sampleSize) * 100 : 0;
            const averageTime = sampleSize > 0 ?
                variantEvents.reduce((sum, e) => sum + e.timeToComplete, 0) / sampleSize : 0;
            // Simplified statistical significance calculation
            const confidenceLevel = this.calculateConfidenceLevel(sampleSize, successRate);
            const isStatisticallySignificant = sampleSize >= 100 && confidenceLevel >= 95;
            return {
                variantId: variant.id,
                variantName: variant.name,
                sampleSize,
                successRate,
                averageTime,
                conversionRate: successRate, // Simplified
                confidenceLevel,
                isStatisticallySignificant
            };
        });
        // Generate recommendation
        const bestVariant = results.reduce((best, current) => current.successRate > best.successRate ? current : best);
        const recommendation = bestVariant.isStatisticallySignificant
            ? `Recommend deploying variant "${bestVariant.variantName}" (${bestVariant.successRate.toFixed(1)}% success rate)`
            : 'Need more data for statistical significance';
        return { test, results, recommendation };
    }
    /**
     * Get real-time dashboard data
     */
    getDashboardData() {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentEvents = Array.from(this.events.values())
            .filter(event => event.timestamp >= last24Hours)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const totalChallenges = recentEvents.length;
        const successfulChallenges = recentEvents.filter(e => e.outcome === ChallengeOutcome.SUCCESS).length;
        const successRate = totalChallenges > 0 ? (successfulChallenges / totalChallenges) * 100 : 0;
        const averageCompletionTime = totalChallenges > 0 ?
            recentEvents.reduce((sum, e) => sum + e.timeToComplete, 0) / totalChallenges : 0;
        const fraudAttempts = recentEvents.filter(e => e.fraudIndicators.riskScore > 70).length;
        const activeABTests = Array.from(this.abTests.values()).filter(test => test.isActive).length;
        // Top challenge types
        const challengeTypeCounts = {};
        recentEvents.forEach(event => {
            if (!challengeTypeCounts[event.challengeType]) {
                challengeTypeCounts[event.challengeType] = { count: 0, successful: 0 };
            }
            challengeTypeCounts[event.challengeType].count++;
            if (event.outcome === ChallengeOutcome.SUCCESS) {
                challengeTypeCounts[event.challengeType].successful++;
            }
        });
        const topChallengeTypes = Object.entries(challengeTypeCounts)
            .map(([type, data]) => ({
            type: type,
            count: data.count,
            successRate: data.count > 0 ? (data.successful / data.count) * 100 : 0
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // Geographic distribution
        const geoCounts = {};
        recentEvents.forEach(event => {
            const country = event.context.geolocation?.country || 'Unknown';
            if (!geoCounts[country]) {
                geoCounts[country] = { attempts: 0, successful: 0 };
            }
            geoCounts[country].attempts++;
            if (event.outcome === ChallengeOutcome.SUCCESS) {
                geoCounts[country].successful++;
            }
        });
        const geographicDistribution = Object.entries(geoCounts)
            .map(([country, data]) => ({
            country,
            attempts: data.attempts,
            successRate: data.attempts > 0 ? (data.successful / data.attempts) * 100 : 0
        }))
            .sort((a, b) => b.attempts - a.attempts)
            .slice(0, 10);
        return {
            overview: {
                totalChallenges,
                successRate,
                averageCompletionTime,
                fraudAttempts,
                activeABTests
            },
            recentActivity: recentEvents.slice(0, 50),
            topChallengeTypes,
            fraudAlerts: [], // Would be populated from fraud detection system
            performanceMetrics: [
                { metric: 'Success Rate', value: successRate, trend: 'stable' },
                { metric: 'Avg Completion Time', value: averageCompletionTime, trend: 'down' },
                { metric: 'Fraud Score', value: fraudAttempts, trend: 'up' }
            ],
            geographicDistribution
        };
    }
    // Private helper methods
    calculateStatistics(challengeType, events, startTime, endTime) {
        const totalAttempts = events.length;
        const successfulAttempts = events.filter(e => e.outcome === ChallengeOutcome.SUCCESS).length;
        const abandonedAttempts = events.filter(e => e.outcome === ChallengeOutcome.ABANDONED).length;
        const timeoutAttempts = events.filter(e => e.outcome === ChallengeOutcome.TIMEOUT).length;
        const errorAttempts = events.filter(e => e.outcome === ChallengeOutcome.ERROR).length;
        const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
        const abandonmentRate = totalAttempts > 0 ? (abandonedAttempts / totalAttempts) * 100 : 0;
        const timeoutRate = totalAttempts > 0 ? (timeoutAttempts / totalAttempts) * 100 : 0;
        const errorRate = totalAttempts > 0 ? (errorAttempts / totalAttempts) * 100 : 0;
        const averageCompletionTime = totalAttempts > 0 ?
            events.reduce((sum, e) => sum + e.timeToComplete, 0) / totalAttempts : 0;
        // Group by difficulty
        const byDifficulty = {};
        Object.values(DifficultyLevel).forEach(level => {
            const levelEvents = events.filter(e => e.difficultyLevel === level);
            const levelSuccessful = levelEvents.filter(e => e.outcome === ChallengeOutcome.SUCCESS).length;
            byDifficulty[level] = {
                attempts: levelEvents.length,
                successRate: levelEvents.length > 0 ? (levelSuccessful / levelEvents.length) * 100 : 0,
                averageTime: levelEvents.length > 0 ?
                    levelEvents.reduce((sum, e) => sum + e.timeToComplete, 0) / levelEvents.length : 0
            };
        });
        // Group by user type
        const byUserType = {};
        Object.values(UserAgentType).forEach(type => {
            const typeEvents = events.filter(e => e.context.userAgentType === type);
            const typeSuccessful = typeEvents.filter(e => e.outcome === ChallengeOutcome.SUCCESS).length;
            const avgFraudScore = typeEvents.length > 0 ?
                typeEvents.reduce((sum, e) => sum + e.fraudIndicators.riskScore, 0) / typeEvents.length : 0;
            byUserType[type] = {
                attempts: typeEvents.length,
                successRate: typeEvents.length > 0 ? (typeSuccessful / typeEvents.length) * 100 : 0,
                fraudScore: avgFraudScore
            };
        });
        // Calculate optimization recommendations
        const performanceScore = Math.min(100, successRate + (100 - abandonmentRate));
        const userExperienceScore = Math.max(0, 100 - (averageCompletionTime / 1000)); // Penalty for long times
        const securityScore = Math.min(100, 100 - (byUserType[UserAgentType.BOT_CONFIRMED]?.attempts || 0));
        let recommendedDifficulty = DifficultyLevel.MEDIUM;
        if (successRate > 90) {
            recommendedDifficulty = DifficultyLevel.HARD;
        }
        else if (successRate < 60) {
            recommendedDifficulty = DifficultyLevel.EASY;
        }
        return {
            challengeType,
            period: { start: startTime, end: endTime },
            metrics: {
                totalAttempts,
                successRate,
                averageCompletionTime,
                abandonmentRate,
                timeoutRate,
                errorRate
            },
            byDifficulty,
            byUserType,
            fraudDetection: {
                botAttempts: byUserType[UserAgentType.BOT_CONFIRMED]?.attempts || 0,
                suspiciousActivities: events.filter(e => e.fraudIndicators.riskScore > 50).length,
                preventedAttacks: events.filter(e => e.fraudIndicators.riskScore > 80).length,
                falsePositives: 0 // Would need manual verification
            },
            accessibility: {
                assistedCompletions: events.filter(e => e.accessibility.assistiveTechUsed.length > 0).length,
                accommodationUsage: {},
                accessibilitySuccessRate: 0 // Would calculate from accessibility events
            },
            optimization: {
                recommendedDifficulty,
                performanceScore,
                userExperienceScore,
                securityScore
            }
        };
    }
    getEventFieldValue(event, field) {
        const fieldParts = field.split('.');
        let value = event;
        for (const part of fieldParts) {
            value = value?.[part];
        }
        return value;
    }
    evaluateCondition(value, operator, target) {
        switch (operator) {
            case 'equals':
                return value === target;
            case 'greater_than':
                return value > target;
            case 'less_than':
                return value < target;
            case 'contains':
                return String(value).includes(String(target));
            case 'in_range':
                return Array.isArray(target) && value >= target[0] && value <= target[1];
            default:
                return false;
        }
    }
    calculateConfidenceLevel(sampleSize, successRate) {
        // Simplified confidence calculation
        if (sampleSize < 30)
            return 0;
        if (sampleSize < 100)
            return 80;
        if (sampleSize < 500)
            return 90;
        return 95;
    }
    updateSessionData(event) {
        const session = this.sessionData.get(event.sessionId);
        if (session) {
            session.events.push(event.id);
            session.lastEventTime = event.timestamp;
        }
    }
    updateRealTimeStatistics(event) {
        // Update real-time counters and metrics
        this.emit('realTimeUpdate', {
            challengeType: event.challengeType,
            outcome: event.outcome,
            riskScore: event.fraudIndicators.riskScore,
            timestamp: event.timestamp
        });
    }
    initializeFraudPatterns() {
        // Bot-like behavior pattern
        this.fraudPatterns.set('bot_behavior', {
            id: 'bot_behavior',
            name: 'Bot-like Behavior',
            description: 'Detects automated behavior patterns',
            conditions: [
                { field: 'timeToComplete', operator: 'less_than', value: 1000 },
                { field: 'userBehavior.mouseMovements', operator: 'equals', value: 0 },
                { field: 'userBehavior.hesitationTime', operator: 'equals', value: 0 }
            ],
            severity: 'high',
            actions: [
                { type: 'challenge', parameters: { increaseDifficulty: true } },
                { type: 'monitor', parameters: { duration: 3600 } }
            ],
            confidence: 0.85,
            lastUpdated: new Date(),
            isActive: true
        });
        // Suspicious IP pattern
        this.fraudPatterns.set('suspicious_ip', {
            id: 'suspicious_ip',
            name: 'Suspicious IP Activity',
            description: 'Detects high-volume requests from single IP',
            conditions: [
                { field: 'fraudIndicators.riskScore', operator: 'greater_than', value: 60 }
            ],
            severity: 'medium',
            actions: [
                { type: 'monitor', parameters: { enhanced: true } }
            ],
            confidence: 0.70,
            lastUpdated: new Date(),
            isActive: true
        });
    }
    startMetricsAggregation() {
        // Aggregate metrics every 5 minutes
        setInterval(() => {
            this.aggregateMetrics();
        }, 5 * 60 * 1000);
    }
    startFraudDetection() {
        // Run fraud detection every minute
        setInterval(() => {
            this.runFraudDetection();
        }, 60 * 1000);
    }
    aggregateMetrics() {
        // Aggregate recent metrics for dashboard
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentEvents = Array.from(this.events.values())
            .filter(event => event.timestamp >= oneHourAgo);
        if (recentEvents.length > 0) {
            this.emit('metricsAggregated', {
                period: { start: oneHourAgo, end: now },
                totalEvents: recentEvents.length,
                successRate: (recentEvents.filter(e => e.outcome === ChallengeOutcome.SUCCESS).length / recentEvents.length) * 100
            });
        }
    }
    runFraudDetection() {
        // Analyze recent events for new fraud patterns
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const recentEvents = Array.from(this.events.values())
            .filter(event => event.timestamp >= fiveMinutesAgo);
        let highRiskEvents = 0;
        recentEvents.forEach(event => {
            const analysis = this.analyzeFraudPattern(event);
            if (analysis.riskScore > 80) {
                highRiskEvents++;
            }
        });
        if (highRiskEvents > 5) {
            this.emit('fraudAlert', {
                level: 'high',
                message: `${highRiskEvents} high-risk events detected in last 5 minutes`,
                timestamp: now
            });
        }
    }
}
// Export default instance
export const challengeTelemetryService = new ChallengeTelemetryService();
export default ChallengeTelemetryService;
