/**
 * Epic 16 Suspicious Activity Detection Service
 *
 * Comprehensive security service for detecting, analyzing, and preventing
 * suspicious activities in the Epic 16 Marketplace & Community platform.
 * Includes real-time monitoring, ML-based detection, and automated response.
 */
import { EventEmitter } from 'events';
export interface SuspiciousActivity {
    id: string;
    type: ActivityType;
    severity: SeverityLevel;
    confidence: number;
    userId?: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    description: string;
    evidence: ActivityEvidence[];
    patterns: DetectionPattern[];
    metadata: Record<string, any>;
    detectionMethod: DetectionMethod;
    detectedBy: string;
    riskScore: number;
    status: ActivityStatus;
    investigated: boolean;
    investigatedBy?: string;
    investigatedAt?: Date;
    resolution?: ActivityResolution;
    relatedActivities: string[];
    clusterId?: string;
    actionsTriggered: ResponseAction[];
    geolocation?: GeoLocation;
    deviceFingerprint?: DeviceFingerprint;
}
export declare enum ActivityType {
    BRUTE_FORCE_LOGIN = "brute_force_login",
    CREDENTIAL_STUFFING = "credential_stuffing",
    UNUSUAL_LOGIN_LOCATION = "unusual_login_location",
    IMPOSSIBLE_TRAVEL = "impossible_travel",
    MULTIPLE_ACCOUNT_ACCESS = "multiple_account_access",
    RAPID_ACCOUNT_CREATION = "rapid_account_creation",
    FAKE_ACCOUNT_CREATION = "fake_account_creation",
    ACCOUNT_TAKEOVER = "account_takeover",
    PROFILE_MANIPULATION = "profile_manipulation",
    FAKE_TEMPLATE_UPLOAD = "fake_template_upload",
    COPYRIGHT_VIOLATION = "copyright_violation",
    PRICE_MANIPULATION = "price_manipulation",
    FAKE_REVIEWS = "fake_reviews",
    RATING_MANIPULATION = "rating_manipulation",
    CHARGEBACK_FRAUD = "chargeback_fraud",
    SPAM_POSTING = "spam_posting",
    MASS_MESSAGING = "mass_messaging",
    HARASSMENT = "harassment",
    HATE_SPEECH = "hate_speech",
    DOXXING = "doxxing",
    IMPERSONATION = "impersonation",
    DDoS_ATTEMPT = "ddos_attempt",
    SCRAPING_ATTEMPT = "scraping_attempt",
    API_ABUSE = "api_abuse",
    INJECTION_ATTEMPT = "injection_attempt",
    XSS_ATTEMPT = "xss_attempt",
    PAYMENT_FRAUD = "payment_fraud",
    MONEY_LAUNDERING = "money_laundering",
    REFUND_ABUSE = "refund_abuse",
    CURRENCY_MANIPULATION = "currency_manipulation",
    DATA_SCRAPING = "data_scraping",
    PRIVACY_VIOLATION = "privacy_violation",
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DATA_EXFILTRATION = "data_exfiltration",
    VOTE_MANIPULATION = "vote_manipulation",
    ALGORITHM_GAMING = "algorithm_gaming",
    FAKE_ENGAGEMENT = "fake_engagement",
    COORDINATED_INAUTHENTIC_BEHAVIOR = "coordinated_inauthentic_behavior"
}
export declare enum SeverityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ActivityStatus {
    DETECTED = "detected",
    INVESTIGATING = "investigating",
    CONFIRMED = "confirmed",
    FALSE_POSITIVE = "false_positive",
    RESOLVED = "resolved",
    ESCALATED = "escalated"
}
export declare enum DetectionMethod {
    RULE_BASED = "rule_based",
    MACHINE_LEARNING = "machine_learning",
    BEHAVIORAL_ANALYSIS = "behavioral_analysis",
    STATISTICAL_ANOMALY = "statistical_anomaly",
    MANUAL_REPORT = "manual_report",
    THREAT_INTELLIGENCE = "threat_intelligence",
    PATTERN_MATCHING = "pattern_matching",
    HONEYPOT = "honeypot"
}
export interface ActivityEvidence {
    type: EvidenceType;
    description: string;
    data: any;
    timestamp: Date;
    source: string;
    confidence: number;
}
export declare enum EvidenceType {
    LOG_ENTRY = "log_entry",
    NETWORK_TRAFFIC = "network_traffic",
    USER_BEHAVIOR = "user_behavior",
    DATABASE_ACTIVITY = "database_activity",
    FILE_ACTIVITY = "file_activity",
    API_CALL = "api_call",
    SCREEN_RECORDING = "screen_recording",
    METADATA = "metadata"
}
export interface DetectionPattern {
    id: string;
    name: string;
    description: string;
    confidence: number;
    matchedValues: Record<string, any>;
    threshold: number;
    observedValue: number;
}
export interface ActivityResolution {
    action: ResolutionAction;
    reason: string;
    timestamp: Date;
    resolvedBy: string;
    notes?: string;
    preventiveMeasures?: string[];
}
export declare enum ResolutionAction {
    NO_ACTION = "no_action",
    WARNING_ISSUED = "warning_issued",
    ACCOUNT_SUSPENDED = "account_suspended",
    ACCOUNT_BANNED = "account_banned",
    IP_BLOCKED = "ip_blocked",
    CONTENT_REMOVED = "content_removed",
    PAYMENT_BLOCKED = "payment_blocked",
    ESCALATED_TO_AUTHORITIES = "escalated_to_authorities"
}
export interface ResponseAction {
    type: ResponseType;
    status: ActionStatus;
    triggeredAt: Date;
    parameters: Record<string, any>;
    result?: string;
    error?: string;
}
export declare enum ResponseType {
    RATE_LIMIT = "rate_limit",
    CAPTCHA_CHALLENGE = "captcha_challenge",
    ACCOUNT_LOCK = "account_lock",
    IP_BLOCK = "ip_block",
    CONTENT_FLAG = "content_flag",
    ADMIN_ALERT = "admin_alert",
    EMAIL_NOTIFICATION = "email_notification",
    LOG_ENHANCED = "log_enhanced",
    SESSION_TERMINATE = "session_terminate",
    REQUIRE_VERIFICATION = "require_verification"
}
export declare enum ActionStatus {
    PENDING = "pending",
    EXECUTED = "executed",
    FAILED = "failed",
    REVERSED = "reversed"
}
export interface GeoLocation {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp?: string;
    organization?: string;
}
export interface DeviceFingerprint {
    userAgent: string;
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    cookiesEnabled: boolean;
    plugins: string[];
    canvas: string;
    webgl: string;
    fonts: string[];
    touchSupport: boolean;
    hardwareConcurrency: number;
    deviceMemory?: number;
}
export interface DetectionRule {
    id: string;
    name: string;
    description: string;
    category: RuleCategory;
    activityType: ActivityType;
    enabled: boolean;
    severity: SeverityLevel;
    confidence: number;
    conditions: RuleCondition[];
    aggregation: AggregationRule;
    timeWindow: TimeWindow;
    threshold: RuleThreshold;
    actions: RuleAction[];
    author: string;
    version: string;
    lastUpdated: Date;
    tags: string[];
    analytics: RuleAnalytics;
}
export declare enum RuleCategory {
    AUTHENTICATION = "authentication",
    ACCOUNT_SECURITY = "account_security",
    CONTENT_ABUSE = "content_abuse",
    FINANCIAL_FRAUD = "financial_fraud",
    TECHNICAL_ATTACK = "technical_attack",
    PRIVACY_VIOLATION = "privacy_violation",
    MARKETPLACE_FRAUD = "marketplace_fraud",
    COMMUNITY_ABUSE = "community_abuse"
}
export interface RuleCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    weight: number;
}
export declare enum ConditionOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    REGEX = "regex",
    IN_LIST = "in_list",
    NOT_IN_LIST = "not_in_list",
    RANGE = "range",
    EXISTS = "exists",
    NOT_EXISTS = "not_exists"
}
export interface AggregationRule {
    type: AggregationType;
    field?: string;
    groupBy: string[];
    minimumEvents: number;
}
export declare enum AggregationType {
    COUNT = "count",
    SUM = "sum",
    AVERAGE = "average",
    UNIQUE_COUNT = "unique_count",
    RATE = "rate",
    STANDARD_DEVIATION = "standard_deviation"
}
export interface TimeWindow {
    duration: number;
    sliding: boolean;
    bucketSize?: number;
}
export interface RuleThreshold {
    value: number;
    operator: ConditionOperator;
    dynamic: boolean;
    baseline?: number;
    adaptation?: AdaptationConfig;
}
export interface AdaptationConfig {
    enabled: boolean;
    learningPeriod: number;
    adaptationRate: number;
    minimumSamples: number;
}
export interface RuleAction {
    type: ResponseType;
    parameters: Record<string, any>;
    delay?: number;
    condition?: string;
}
export interface RuleAnalytics {
    totalTriggers: number;
    truePositives: number;
    falsePositives: number;
    precision: number;
    recall: number;
    f1Score: number;
    averageProcessingTime: number;
    lastTriggered?: Date;
}
export interface UserBehaviorProfile {
    userId: string;
    createdAt: Date;
    lastUpdated: Date;
    loginPatterns: LoginPattern;
    devicePatterns: DevicePattern[];
    locationPatterns: LocationPattern[];
    activityPatterns: ActivityPattern;
    contentPatterns: ContentPattern;
    transactionPatterns: TransactionPattern;
    socialPatterns: SocialPattern;
    riskScore: number;
    riskFactors: RiskFactor[];
    anomalyBaseline: AnomalyBaseline;
    recentAnomalies: BehaviorAnomaly[];
}
export interface LoginPattern {
    averageSessionDuration: number;
    commonLoginTimes: TimeRange[];
    commonDaysOfWeek: number[];
    frequentLocations: LocationFrequency[];
    deviceConsistency: number;
    ipConsistency: number;
}
export interface TimeRange {
    start: number;
    end: number;
    frequency: number;
}
export interface LocationFrequency {
    country: string;
    region: string;
    city: string;
    frequency: number;
    lastSeen: Date;
}
export interface DevicePattern {
    fingerprint: DeviceFingerprint;
    frequency: number;
    lastSeen: Date;
    trusted: boolean;
}
export interface LocationPattern {
    location: GeoLocation;
    frequency: number;
    lastSeen: Date;
    velocity: number;
}
export interface ActivityPattern {
    pageViewsPerSession: number;
    averageTimeOnSite: number;
    commonPages: PageFrequency[];
    clickPatterns: ClickPattern[];
    searchPatterns: SearchPattern[];
    uploadPatterns: UploadPattern;
}
export interface PageFrequency {
    page: string;
    frequency: number;
    averageTime: number;
}
export interface ClickPattern {
    elementType: string;
    frequency: number;
    timing: number;
}
export interface SearchPattern {
    queries: string[];
    frequency: number;
    categories: string[];
}
export interface UploadPattern {
    frequency: number;
    averageFileSize: number;
    commonFileTypes: string[];
    uploadTimes: TimeRange[];
}
export interface ContentPattern {
    postingFrequency: number;
    averageContentLength: number;
    topicCategories: string[];
    sentimentDistribution: SentimentDistribution;
    languagePatterns: LanguagePattern[];
}
export interface SentimentDistribution {
    positive: number;
    neutral: number;
    negative: number;
}
export interface LanguagePattern {
    language: string;
    frequency: number;
    complexity: number;
}
export interface TransactionPattern {
    averageTransactionAmount: number;
    transactionFrequency: number;
    preferredPaymentMethods: string[];
    commonTransactionTimes: TimeRange[];
    refundRate: number;
    chargebackRate: number;
}
export interface SocialPattern {
    connectionGrowthRate: number;
    messagingFrequency: number;
    groupParticipation: number;
    influenceScore: number;
    reciprocityRate: number;
}
export interface RiskFactor {
    factor: string;
    weight: number;
    description: string;
    evidence: string[];
}
export interface AnomalyBaseline {
    loginFrequency: StatisticalBaseline;
    sessionDuration: StatisticalBaseline;
    transactionAmount: StatisticalBaseline;
    contentPosting: StatisticalBaseline;
    apiUsage: StatisticalBaseline;
}
export interface StatisticalBaseline {
    mean: number;
    standardDeviation: number;
    minimum: number;
    maximum: number;
    percentiles: Record<number, number>;
    lastCalculated: Date;
}
export interface BehaviorAnomaly {
    type: string;
    timestamp: Date;
    severity: number;
    description: string;
    deviationScore: number;
    context: Record<string, any>;
}
export interface ThreatIntelligence {
    id: string;
    type: ThreatType;
    source: string;
    confidence: number;
    indicators: ThreatIndicator[];
    description: string;
    tags: string[];
    firstSeen: Date;
    lastSeen: Date;
    validUntil?: Date;
    targetedSectors: string[];
    geographicScope: string[];
    attackVectors: string[];
    threatActor?: string;
    campaignId?: string;
    severity: SeverityLevel;
    impact: ThreatImpact;
    mitigations: Mitigation[];
    reliability: ReliabilityLevel;
    tlpLevel: TLPLevel;
}
export declare enum ThreatType {
    IOC = "ioc",// Indicator of Compromise
    TTPs = "ttps",// Tactics, Techniques, and Procedures
    VULNERABILITY = "vulnerability",
    MALWARE = "malware",
    CAMPAIGN = "campaign",
    THREAT_ACTOR = "threat_actor"
}
export interface ThreatIndicator {
    type: IndicatorType;
    value: string;
    confidence: number;
    context?: string;
}
export declare enum IndicatorType {
    IP_ADDRESS = "ip_address",
    DOMAIN = "domain",
    URL = "url",
    EMAIL = "email",
    FILE_HASH = "file_hash",
    USER_AGENT = "user_agent",
    ASN = "asn",
    REGISTRY_KEY = "registry_key",
    MUTEX = "mutex",
    YARA_RULE = "yara_rule"
}
export interface ThreatImpact {
    confidentiality: ImpactLevel;
    integrity: ImpactLevel;
    availability: ImpactLevel;
    financial: ImpactLevel;
    reputational: ImpactLevel;
}
export declare enum ImpactLevel {
    NONE = "none",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface Mitigation {
    type: MitigationType;
    description: string;
    effectiveness: number;
    implementationCost: CostLevel;
    timeToImplement: number;
}
export declare enum MitigationType {
    PREVENTIVE = "preventive",
    DETECTIVE = "detective",
    CORRECTIVE = "corrective",
    RECOVERY = "recovery"
}
export declare enum CostLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare enum ReliabilityLevel {
    A = "a",// Completely reliable
    B = "b",// Usually reliable
    C = "c",// Fairly reliable
    D = "d",// Not usually reliable
    E = "e",// Unreliable
    F = "f"
}
export declare enum TLPLevel {
    RED = "red",
    AMBER = "amber",
    GREEN = "green",
    WHITE = "white"
}
export declare class Epic16SuspiciousActivityService extends EventEmitter {
    private activities;
    private rules;
    private userProfiles;
    private threatIntelligence;
    private eventQueue;
    private processingQueue;
    constructor();
    detectActivity(event: SuspiciousActivityEvent): Promise<SuspiciousActivity[]>;
    getActivity(activityId: string): Promise<SuspiciousActivity | null>;
    getActivitiesByUser(userId: string, limit?: number): Promise<SuspiciousActivity[]>;
    getActivitiesByType(type: ActivityType, limit?: number): Promise<SuspiciousActivity[]>;
    getRecentActivities(hours?: number, minSeverity?: SeverityLevel): Promise<SuspiciousActivity[]>;
    investigateActivity(activityId: string, investigatorId: string): Promise<void>;
    resolveActivity(activityId: string, resolution: ActivityResolution): Promise<void>;
    markFalsePositive(activityId: string, reason: string): Promise<void>;
    createRule(ruleData: Omit<DetectionRule, 'id' | 'analytics'>): Promise<DetectionRule>;
    updateRule(ruleId: string, updates: Partial<DetectionRule>): Promise<DetectionRule | null>;
    deleteRule(ruleId: string): Promise<boolean>;
    getUserProfile(userId: string): Promise<UserBehaviorProfile | null>;
    detectBehavioralAnomalies(userId: string, event: SuspiciousActivityEvent): Promise<SuspiciousActivity[]>;
    addThreatIntelligence(threat: Omit<ThreatIntelligence, 'id'>): Promise<ThreatIntelligence>;
    checkThreatIntelligence(event: SuspiciousActivityEvent): Promise<ThreatIntelligence[]>;
    getSecurityMetrics(timeRange: {)
        start: Date;
        end: Date;
    }): Promise<SecurityMetrics>;
    private evaluateRule;
    private evaluateCondition;
    private evaluateThreshold;
    private executeResponseActions;
    private executeAction;
    private initializeDefaultRules;
    private startEventProcessor;
    private processEventQueue;
    private getFieldValue;
    private compareSeverity;
    private getRelatedEvents;
    private evaluateAggregation;
    private generateActivityDescription;
    private collectEvidence;
    private identifyPatterns;
    private calculateRiskScore;
    private calculateDynamicThreshold;
    private updateUserProfile;
    private checkLocationAnomaly;
    private checkTimingAnomaly;
    private checkDeviceAnomaly;
    private checkVolumeAnomaly;
    private matchesThreatIndicators;
    private updateRuleMetrics;
    private executeResolutionActions;
    private calculateSeverityDistribution;
    private calculateTypeDistribution;
    private calculateStatusDistribution;
    private getTopAttackers;
    private getTopTargets;
    private calculateDetectionEffectiveness;
    private calculateAverageResponseTime;
    private calculateFalsePositiveRate;
    private calculateTrends;
}
export interface SuspiciousActivityEvent {
    eventType: string;
    userId?: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    geolocation?: GeoLocation;
    deviceFingerprint?: DeviceFingerprint;
    metadata: Record<string, any>;
}
export interface SecurityMetrics {
    totalActivities: number;
    severityDistribution: Record<SeverityLevel, number>;
    typeDistribution: Record<ActivityType, number>;
    statusDistribution: Record<ActivityStatus, number>;
    topAttackers: Array<{,
        ip: string;
        count: number;
    }>;
    topTargets: Array<{,
        userId: string;
        count: number;
    }>;
    detectionEffectiveness: number;
    responseTime: number;
    falsePositiveRate: number;
    trendsOverTime: any;
}
export default Epic16SuspiciousActivityService;
//# sourceMappingURL=Epic16SuspiciousActivityService.d.ts.map