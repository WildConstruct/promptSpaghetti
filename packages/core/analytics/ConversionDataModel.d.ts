/**
 * Conversion Data Model - Story 30.2 Task 3
 *
 * Comprehensive data model for conversion funnel tracking with flexible
 * schema definitions, cohort management, and entity relationships.
 *
 * Features:
 * - Flexible funnel step definitions with conditions
 * - Dynamic conversion event schema with property validation
 * - Cohort and segment tracking with time-based analysis
 * - Rich entity relationships with user and template data
 * - Temporal data structures for trend analysis
 */
import { EnhancedConversionEvent } from './ConversionFunnelArchitecture';
export interface ConversionFunnelDefinition {
    id: string;
    name: string;
    description: string;
    category: FunnelCategory;
    version: string;
    configuration: {,
        timeWindow: number;
        allowBacktracking: boolean;
        requireSequentialSteps: boolean;
        enableParallelPaths: boolean;
        dropOffGracePeriod: number;
    };
    steps: ConversionStep[];
    conditionalPaths: ConditionalPath[];
    successCriteria: SuccessCriteria;
    analytics: {,
        enableRealTimeTracking: boolean;
        retentionPeriod: number;
        cohortTrackingEnabled: boolean;
        segmentationRules: SegmentationRule[];
    };
    metadata: {,
        createdAt: number;
        updatedAt: number;
        createdBy: string;
        tags: string[];
        businessContext: string;
        expectedConversionRate: number;
        benchmarkData?: BenchmarkData;
    };
}
export interface ConversionStep {
    id: string;
    name: string;
    description: string;
    order: number;
    type: StepType;
    isRequired: boolean;
    isTerminal: boolean;
    eventCriteria: EventCriteria;
    conditions: StepCondition[];
    timeConstraints: {,
        minTimeFromPrevious?: number;
        maxTimeFromPrevious?: number;
        maxTimeFromStart?: number;
        allowedTimeWindows?: TimeWindow[];
    };
    successMetrics: {,
        expectedCompletionRate: number;
        averageTimeToComplete: number;
        criticalSuccessFactors: string[];
    };
    branches: StepBranch[];
    metadata: {,
        businessValue: number;
        complexity: 'low' | 'medium' | 'high';
        dependencies: string[];
        optimizationOpportunities: string[];
    };
}
export type StepType = 'entry_point' | 'engagement' | 'decision_point' | 'action' | 'validation' | 'conversion' | 'exit_point';
export type FunnelCategory = 'acquisition' | 'activation' | 'engagement' | 'monetization' | 'retention' | 'referral';
export interface EventCriteria {
    eventType: string;
    eventPattern?: string;
    propertyMatchers: PropertyMatcher[];
    valueConstraints?: ValueConstraint[];
    contextRequirements?: ContextRequirement[];
}
export interface PropertyMatcher {
    propertyPath: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'exists' | 'in' | 'between';
    value: any;
    caseSensitive?: boolean;
    required?: boolean;
}
export interface ValueConstraint {
    field: 'value' | 'timestamp' | 'duration';
    min?: number;
    max?: number;
    exactValues?: number[];
    excludeValues?: number[];
}
export interface ContextRequirement {
    type: 'device' | 'location' | 'session' | 'user_attribute' | 'time_of_day' | 'referrer';
    condition: string;
    value: any;
}
export interface StepCondition {
    id: string;
    type: 'property' | 'time' | 'sequence' | 'count' | 'custom';
    description: string;
    logic: ConditionLogic;
    weight: number;
}
export interface ConditionLogic {
    operator: 'AND' | 'OR' | 'NOT';
    conditions: SimpleCondition[];
    customValidator?: string;
}
export interface SimpleCondition {
    field: string;
    operator: string;
    value: any;
    metadata?: Record<string, any>;
}
export interface TimeWindow {
    start: string;
    end: string;
    daysOfWeek: number[];
    timezone?: string;
}
export interface StepBranch {
    id: string;
    name: string;
    condition: ConditionLogic;
    nextStepId: string;
    weight: number;
    metadata: {,
        description: string;
        expectedFlow: number;
    };
}
export interface ConditionalPath {
    id: string;
    name: string;
    description: string;
    entryConditions: ConditionLogic;
    steps: string[];
    priority: number;
    isDefault: boolean;
}
export interface SuccessCriteria {
    primary: {,
        stepId: string;
        requirements: ConditionLogic;
        weight: number;
    };
    secondary: Array<{,
        stepId: string;
        requirements: ConditionLogic;
        weight: number;
        isOptional: boolean;
    }>;
    scoreCalculation: {,
        method: 'weighted' | 'binary' | 'progressive' | 'custom';
        customFormula?: string;
    };
}
export interface SegmentationRule {
    id: string;
    name: string;
    description: string;
    conditions: ConditionLogic;
    priority: number;
    isExclusive: boolean;
    metadata: {,
        expectedSize: number;
        businessValue: string;
        trackingPeriod: number;
    };
}
export interface BenchmarkData {
    industryAverageConversionRate: number;
    competitorData?: CompetitorBenchmark[];
    historicalData?: HistoricalBenchmark[];
    goalConversionRate: number;
    lastUpdated: number;
}
export interface CompetitorBenchmark {
    name: string;
    conversionRate: number;
    averageTimeToConvert: number;
    dropOffPoints: string[];
    strengths: string[];
}
export interface HistoricalBenchmark {
    period: string;
    conversionRate: number;
    volume: number;
    averageValue: number;
    topDropOffPoints: string[];
}
/**
 * Enhanced Conversion Event Schema
 * Extends the base conversion event with flexible property validation
 */
export interface FlexibleConversionEvent extends EnhancedConversionEvent {
    flexibleProperties: {,
        [key: string]: FlexibleProperty;
    };
    schemaVersion: string;
    validation: {,
        isValid: boolean;
        score: number;
        errors: ValidationError[];
        warnings: ValidationWarning[];
        appliedRules: string[];
    };
    funnelContext: {,
        funnelId: string;
        stepId: string;
        stepOrder: number;
        pathId?: string;
        timeInFunnel: number;
        previousSteps: string[];
        isBacktracking: boolean;
    };
    userContext: {,
        segmentIds: string[];
        cohortIds: string[];
        lifetimeValue: number;
        riskScore: number;
        engagementScore: number;
        profileCompleteness: number;
        lastActivity: number;
    };
    templateContext?: {
        templateId: string;
        templateType: string;
        creatorId: string;
        category: string;
        price: number;
        rating: number;
        popularity: number;
        tags: string[];
    };
    sessionContext: {,
        isNewSession: boolean;
        sessionDuration: number;
        pageViewCount: number;
        previousConversions: number;
        referrerCategory: string;
        deviceFingerprint: string;
        locationData?: LocationData;
    };
}
export interface FlexibleProperty {
    value: any;
    type: PropertyType;
    schema?: PropertySchema;
    metadata: {,
        source: string;
        confidence: number;
        lastUpdated: number;
        validationStatus: 'valid' | 'invalid' | 'pending';
    };
}
export type PropertyType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'enum' | 'json' | 'custom';
export interface PropertySchema {
    type: PropertyType;
    required: boolean;
    constraints: PropertyConstraint[];
    defaultValue?: any;
    transformations?: PropertyTransformation[];
    relationships?: PropertyRelationship[];
}
export interface PropertyConstraint {
    type: 'format' | 'range' | 'length' | 'pattern' | 'custom';
    value: any;
    errorMessage: string;
    severity: 'error' | 'warning' | 'info';
}
export interface PropertyTransformation {
    type: 'normalize' | 'encode' | 'hash' | 'encrypt' | 'custom';
    config: Record<string, any>;
    conditions?: ConditionLogic;
}
export interface PropertyRelationship {
    type: 'depends_on' | 'conflicts_with' | 'derives_from' | 'validates_against';
    targetProperty: string;
    relationship: string;
}
export interface ValidationError {
    propertyPath: string;
    constraint: string;
    message: string;
    severity: 'critical' | 'major' | 'minor';
    suggestedFix?: string;
}
export interface ValidationWarning {
    propertyPath: string;
    issue: string;
    message: string;
    impact: string;
    recommendation?: string;
}
export interface LocationData {
    country: string;
    region?: string;
    city?: string;
    timezone: string;
    coordinates?: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    ipHash: string;
}
/**
 * Cohort Tracking Structures
 */
export interface ConversionCohort {
    id: string;
    name: string;
    description: string;
    definition: {,
        criteriaEvent: string;
        criteriaConditions: ConditionLogic;
        timeWindow: number;
        maxSize?: number;
        minSize?: number;
    };
    analysis: {,
        retentionPeriods: number[];
        analysisWindow: number;
        metricCalculations: MetricCalculation[];
        comparisonCohorts?: string[];
    };
    state: {,
        currentSize: number;
        creationDate: number;
        lastAnalysisDate: number;
        status: 'active' | 'completed' | 'archived';
        completionRate: number;
    };
    performance: {,
        conversionRates: TimeSeriesData[];
        retentionRates: TimeSeriesData[];
        averageTimeToConvert: number;
        topDropOffPoints: DropOffPoint[];
        valueMetrics: ValueMetrics;
    };
    metadata: {,
        businessContext: string;
        hypothesis: string;
        expectedOutcome: string;
        tags: string[];
        owner: string;
    };
}
export interface UserSegment {
    id: string;
    name: string;
    description: string;
    definition: {,
        rules: SegmentationRule[];
        operator: 'AND' | 'OR';
        updateFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
        isStatic: boolean;
    };
    state: {,
        currentSize: number;
        lastUpdated: number;
        growthRate: number;
        churnRate: number;
        status: 'active' | 'paused' | 'archived';
    };
    performance: {,
        averageConversionRate: number;
        averageTimeToConvert: number;
        averageLifetimeValue: number;
        engagementScore: number;
        retentionRate: number;
        behaviorPatterns: BehaviorPattern[];
    };
    funnelMetrics: Map<string, FunnelSegmentMetrics>;
    metadata: {,
        businessValue: 'high' | 'medium' | 'low';
        targetingPriority: number;
        marketingPersona?: string;
        customAttributes: Record<string, any>;
    };
}
export interface MetricCalculation {
    id: string;
    name: string;
    type: 'count' | 'rate' | 'average' | 'sum' | 'median' | 'percentile' | 'custom';
    field: string;
    aggregationPeriod: 'hour' | 'day' | 'week' | 'month';
    customFormula?: string;
}
export interface TimeSeriesData {
    timestamp: number;
    value: number;
    metadata?: Record<string, any>;
}
export interface DropOffPoint {
    stepId: string;
    stepName: string;
    dropOffRate: number;
    volume: number;
    averageTimeSpent: number;
    commonExitActions: string[];
    recoveryOpportunities: string[];
}
export interface ValueMetrics {
    totalRevenue: number;
    averageOrderValue: number;
    lifetimeValue: number;
    revenuePerUser: number;
    costPerAcquisition: number;
    returnOnInvestment: number;
}
export interface BehaviorPattern {
    id: string;
    name: string;
    pattern: string[];
    frequency: number;
    conversionImpact: number;
    timePattern?: {
        preferredDays: number[];
        preferredHours: number[];
        seasonality?: string;
    };
}
export interface FunnelSegmentMetrics {
    funnelId: string;
    conversionRate: number;
    averageTimeToConvert: number;
    dropOffPoints: DropOffPoint[];
    completionRate: number;
    backtrackingRate: number;
    pathPreferences: PathPreference[];
}
export interface PathPreference {
    pathId: string;
    pathName: string;
    usageRate: number;
    conversionRate: number;
    averageTime: number;
}
/**
 * Entity Relationship Structures
 */
export interface UserEntity {
    id: string;
    profile: {,
        email?: string;
        name?: string;
        registrationDate: number;
        verificationStatus: 'verified' | 'pending' | 'suspended';
        accountType: 'free' | 'premium' | 'enterprise';
    };
    conversionHistory: {,
        totalConversions: number;
        firstConversionDate?: number;
        lastConversionDate?: number;
        conversionsByFunnel: Map<string, ConversionSummary>;
        averageTimeToConvert: number;
    };
    behavior: {,
        sessionCount: number;
        totalTimeSpent: number;
        averageSessionDuration: number;
        devicePreferences: DevicePreference[];
        locationHistory: LocationData[];
        activityPatterns: ActivityPattern[];
    };
    value: {,
        lifetimeValue: number;
        averageOrderValue: number;
        totalRevenue: number;
        acquisitionCost: number;
        churnRisk: number;
    };
    segmentation: {,
        currentSegments: string[];
        segmentHistory: SegmentChange[];
        cohorts: CohortMembership[];
        riskScore: number;
        engagementScore: number;
    };
    preferences: {,
        privacySettings: PrivacySettings;
        communicationPreferences: CommunicationPreference[];
        contentPreferences: ContentPreference[];
        notificationSettings: NotificationSettings;
    };
}
export interface TemplateEntity {
    id: string;
    metadata: {,
        name: string;
        description: string;
        creatorId: string;
        category: string;
        subcategory?: string;
        tags: string[];
        createdDate: number;
        lastUpdated: number;
    };
    conversionMetrics: {,
        totalViews: number;
        totalPreviews: number;
        totalPurchases: number;
        totalDownloads: number;
        conversionRate: number;
        viewToPreviewRate: number;
        previewToPurchaseRate: number;
    };
    funnelPerformance: Map<string, TemplateFunnelMetrics>;
    engagement: {,
        averageViewTime: number;
        bounceRate: number;
        shareCount: number;
        favoriteCount: number;
        reviewCount: number;
        averageRating: number;
    };
    revenue: {,
        totalRevenue: number;
        price: number;
        priceHistory: PriceChange[];
        averageRevenuePerUser: number;
        monthlyRecurringRevenue?: number;
    };
    trends: {,
        viewTrend: TrendData;
        conversionTrend: TrendData;
        revenueTrend: TrendData;
        ratingTrend: TrendData;
        seasonality?: SeasonalityData;
    };
    quality: {,
        completionRate: number;
        errorRate: number;
        supportTickets: number;
        refundRate: number;
        qualityScore: number;
    };
}
export interface ConversionSummary {
    funnelId: string;
    totalConversions: number;
    averageTimeToConvert: number;
    averageValue: number;
    lastConversionDate: number;
    preferredPath?: string;
}
export interface DevicePreference {
    deviceType: string;
    usagePercentage: number;
    conversionRate: number;
    lastUsed: number;
}
export interface ActivityPattern {
    type: 'temporal' | 'behavioral' | 'contextual';
    pattern: string;
    frequency: number;
    strength: number;
    impact: 'positive' | 'negative' | 'neutral';
}
export interface SegmentChange {
    date: number;
    fromSegment: string;
    toSegment: string;
    reason: string;
    triggerEvent?: string;
}
export interface CohortMembership {
    cohortId: string;
    joinDate: number;
    status: 'active' | 'graduated' | 'churned';
    daysActive: number;
    conversionAchieved: boolean;
}
export interface PrivacySettings {
    trackingConsent: boolean;
    analyticsConsent: boolean;
    personalizationConsent: boolean;
    crossDeviceConsent: boolean;
    dataRetentionPeriod: number;
    rightToErasure: boolean;
}
export interface CommunicationPreference {
    channel: 'email' | 'sms' | 'push' | 'in_app';
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
    topics: string[];
}
export interface ContentPreference {
    category: string;
    interest: number;
    lastInteraction: number;
    conversionHistory: number;
}
export interface NotificationSettings {
    marketing: boolean;
    product: boolean;
    security: boolean;
    social: boolean;
    quietHours?: {
        start: string;
        end: string;
        timezone: string;
    };
}
export interface TemplateFunnelMetrics {
    funnelId: string;
    views: number;
    conversions: number;
    conversionRate: number;
    averageTimeToConvert: number;
    dropOffPoints: DropOffPoint[];
    topSegments: string[];
}
export interface PriceChange {
    date: number;
    oldPrice: number;
    newPrice: number;
    reason: string;
    impactOnConversions: number;
}
export interface TrendData {
    direction: 'up' | 'down' | 'stable';
    magnitude: number;
    confidence: number;
    timeframe: string;
    dataPoints: TimeSeriesData[];
}
export interface SeasonalityData {
    pattern: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    peaks: Array<{,
        period: string;
        multiplier: number;
    }>;
    confidence: number;
}
/**
 * Data Relationship Manager
 * Manages complex relationships between users, templates, and conversion data
 */
export declare class ConversionDataRelationshipManager {
    private userCache;
    private templateCache;
    private cohortCache;
    private segmentCache;
    /**
     * Build enriched conversion event with full entity relationships
     */
    enrichConversionEvent(baseEvent: EnhancedConversionEvent, includeRelatedData?: boolean): Promise<FlexibleConversionEvent>;
    /**
     * Get or create user entity
     */
    private getUserEntity;
    /**
     * Get or create template entity
     */
    private getTemplateEntity;
    /**
     * Build flexible properties with schema validation
     */
    private buildFlexibleProperties;
    private buildUserContext;
    private buildTemplateContext;
    private buildSessionContext;
    private validateFlexibleEvent;
    private createDefaultUserEntity;
    private createDefaultTemplateEntity;
    private inferPropertyType;
    private calculateProfileCompleteness;
    private calculateTimeInFunnel;
    private getPreviousSteps;
    private isBacktracking;
    private isNewSession;
    private calculateSessionDuration;
    private getSessionPageViews;
    private categorizeReferrer;
}
/**
 * Factory function to create ConversionDataRelationshipManager
 */
export declare const createConversionDataRelationshipManager: () => ConversionDataRelationshipManager;
export default ConversionDataRelationshipManager;
//# sourceMappingURL=ConversionDataModel.d.ts.map