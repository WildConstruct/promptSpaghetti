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
export declare enum ChallengeType {
    CAPTCHA_IMAGE = "captcha_image",
    CAPTCHA_AUDIO = "captcha_audio",
    CAPTCHA_MATH = "captcha_math",
    CAPTCHA_TEXT = "captcha_text",
    TWO_FACTOR_SMS = "two_factor_sms",
    TWO_FACTOR_EMAIL = "two_factor_email",
    TWO_FACTOR_TOTP = "two_factor_totp",
    BIOMETRIC_FINGERPRINT = "biometric_fingerprint",
    BIOMETRIC_FACE = "biometric_face",
    BEHAVIORAL_ANALYSIS = "behavioral_analysis",
    DEVICE_VERIFICATION = "device_verification",
    LOCATION_VERIFICATION = "location_verification"
}
export declare enum ChallengeOutcome {
    SUCCESS = "success",
    FAILURE = "failure",
    TIMEOUT = "timeout",
    ABANDONED = "abandoned",
    ERROR = "error",
    SKIPPED = "skipped"
}
export declare enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
    ADAPTIVE = "adaptive"
}
export declare enum UserAgentType {
    HUMAN = "human",
    BOT_SUSPECTED = "bot_suspected",
    BOT_CONFIRMED = "bot_confirmed",
    UNKNOWN = "unknown"
}
export interface ChallengeEvent {
    id: string;
    sessionId: string;
    userId?: string;
    challengeType: ChallengeType;
    challengeId: string;
    timestamp: Date;
    outcome: ChallengeOutcome;
    difficultyLevel: DifficultyLevel;
    attemptNumber: number;
    timeToComplete: number;
    context: {
        ipAddress: string;
        userAgent: string;
        userAgentType: UserAgentType;
        deviceFingerprint?: string;
        geolocation?: {
            country: string;
            region: string;
            city: string;
            coordinates?: {
                lat: number;
                lon: number;
            };
        };
        browserInfo: {
            name: string;
            version: string;
            platform: string;
            mobile: boolean;
            touchSupport: boolean;
            screenResolution: string;
        };
        networkInfo?: {
            connectionType: string;
            downloadSpeed?: number;
            latency?: number;
        };
    };
    challengeData: {
        variant?: string;
        parameters: Record<string, any>;
        metadata: Record<string, any>;
    };
    userBehavior: {
        mouseMovements?: number;
        keystrokes?: number;
        clickPatterns?: Array<{
            x: number;
            y: number;
            timestamp: number;
        }>;
        focusEvents?: number;
        scrollEvents?: number;
        totalInteractionTime: number;
        hesitationTime: number;
        typingSpeed?: number;
        mouseVelocity?: number;
    };
    fraudIndicators: {
        riskScore: number;
        indicators: string[];
        automationDetected: boolean;
        anomalousPattern: boolean;
        vpnDetected?: boolean;
        proxyDetected?: boolean;
    };
    accessibility: {
        screenReaderDetected: boolean;
        highContrastMode: boolean;
        assistiveTechUsed: string[];
        accommodationsApplied: string[];
    };
}
export interface ChallengeStatistics {
    challengeType: ChallengeType;
    period: {
        start: Date;
        end: Date;
    };
    metrics: {
        totalAttempts: number;
        successRate: number;
        averageCompletionTime: number;
        abandonmentRate: number;
        timeoutRate: number;
        errorRate: number;
    };
    byDifficulty: Record<DifficultyLevel, {
        attempts: number;
        successRate: number;
        averageTime: number;
    }>;
    byUserType: Record<UserAgentType, {
        attempts: number;
        successRate: number;
        fraudScore: number;
    }>;
    fraudDetection: {
        botAttempts: number;
        suspiciousActivities: number;
        preventedAttacks: number;
        falsePositives: number;
    };
    accessibility: {
        assistedCompletions: number;
        accommodationUsage: Record<string, number>;
        accessibilitySuccessRate: number;
    };
    optimization: {
        recommendedDifficulty: DifficultyLevel;
        performanceScore: number;
        userExperienceScore: number;
        securityScore: number;
    };
}
export interface TelemetryQuery {
    startTime: Date;
    endTime: Date;
    challengeTypes?: ChallengeType[];
    outcomes?: ChallengeOutcome[];
    userAgentTypes?: UserAgentType[];
    minRiskScore?: number;
    maxRiskScore?: number;
    ipAddresses?: string[];
    userIds?: string[];
    sessionIds?: string[];
    countries?: string[];
    includeAccessibility?: boolean;
    includeFraudData?: boolean;
    aggregateBy?: 'hour' | 'day' | 'week' | 'month';
    limit?: number;
    offset?: number;
}
export interface ABTestConfig {
    id: string;
    name: string;
    challengeType: ChallengeType;
    variants: Array<{
        id: string;
        name: string;
        parameters: Record<string, any>;
        trafficPercentage: number;
    }>;
    startDate: Date;
    endDate: Date;
    targetMetric: 'success_rate' | 'completion_time' | 'user_satisfaction' | 'security_score';
    isActive: boolean;
}
export interface FraudPattern {
    id: string;
    name: string;
    description: string;
    conditions: Array<{
        field: string;
        operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
        value: any;
    }>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actions: Array<{
        type: 'block' | 'challenge' | 'monitor' | 'flag';
        parameters: Record<string, any>;
    }>;
    confidence: number;
    lastUpdated: Date;
    isActive: boolean;
}
/**
 * Comprehensive challenge telemetry service
 */
export declare class ChallengeTelemetryService extends EventEmitter {
    private events;
    private statistics;
    private abTests;
    private fraudPatterns;
    private sessionData;
    constructor();
    /**
     * Record a challenge event
     */
    recordChallengeEvent(event: Omit<ChallengeEvent, 'id' | 'timestamp'>): string;
    /**
     * Start tracking a challenge session
     */
    startChallengeSession(
      sessionId: string,
      challengeType: ChallengeType,
      context: Partial<ChallengeEvent['context']>
    ): void;
    /**
     * Record challenge completion
     */
    recordChallengeCompletion(
      sessionId: string,
      challengeId: string,
      outcome: ChallengeOutcome,
      timeToComplete: number,
      userBehavior: ChallengeEvent['userBehavior'],
      fraudIndicators?: Partial<ChallengeEvent['fraudIndicators']>
    ): void;
    /**
     * Get challenge statistics
     */
    getChallengeStatistics(challengeType: ChallengeType, startTime: Date, endTime: Date): ChallengeStatistics;
    /**
     * Query challenge events
     */
    queryEvents(query: TelemetryQuery): ChallengeEvent[];
    /**
     * Detect fraud patterns in real-time
     */
    analyzeFraudPattern(event: ChallengeEvent): {
        isfraudulent: boolean;
        patterns: string[];
        riskScore: number;
        recommendations: string[];
    };
    /**
     * Create A/B test for challenge optimization
     */
    createABTest(config: Omit<ABTestConfig, 'id'>): string;
    /**
     * Get A/B test variant for a session
     */
    getABTestVariant(challengeType: ChallengeType, sessionId: string): {
        testId: string;
        variantId: string;
        parameters: Record<string, any>;
    } | null;
    /**
     * Get A/B test results
     */
    getABTestResults(testId: string): {
        test: ABTestConfig;
        results: Array<{
            variantId: string;
            variantName: string;
            sampleSize: number;
            successRate: number;
            averageTime: number;
            conversionRate: number;
            confidenceLevel: number;
            isStatisticallySignificant: boolean;
        }>;
        recommendation: string;
    };
    /**
     * Get real-time dashboard data
     */
    getDashboardData(): {
        overview: {
            totalChallenges: number;
            successRate: number;
            averageCompletionTime: number;
            fraudAttempts: number;
            activeABTests: number;
        };
        recentActivity: ChallengeEvent[];
        topChallengeTypes: Array<{
            type: ChallengeType;
            count: number;
            successRate: number;
        }>;
        fraudAlerts: Array<{
            level: string;
            description: string;
            timestamp: Date;
        }>;
        performanceMetrics: Array<{
            metric: string;
            value: number;
            trend: 'up' | 'down' | 'stable';
        }>;
        geographicDistribution: Array<{
            country: string;
            attempts: number;
            successRate: number;
        }>;
    };
    private calculateStatistics;
    private getEventFieldValue;
    private evaluateCondition;
    private calculateConfidenceLevel;
    private updateSessionData;
    private updateRealTimeStatistics;
    private initializeFraudPatterns;
    private startMetricsAggregation;
    private startFraudDetection;
    private aggregateMetrics;
    private runFraudDetection;
}
export declare const challengeTelemetryService: ChallengeTelemetryService;
export default ChallengeTelemetryService;
//# sourceMappingURL=ChallengeTelemetryService.d.ts.map