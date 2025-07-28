/**
 * Embed Analytics System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive analytics system for tracking
 * embedded content performance, user interactions, and engagement metrics.
 * Provides real-time monitoring, detailed reporting, and privacy-compliant
 * data collection for embedded widgets, components, and applications.
 *
 * Features:
 * - Real-time interaction tracking
 * - Performance metrics collection
 * - User behavior analytics
 * - A/B testing and experimentation
 * - Cross-domain embed monitoring
 * - Privacy-compliant data collection
 * - Custom event tracking
 * - Advanced reporting and visualization
 */
import { EventEmitter } from 'events';

export interface EmbedConfig {
    embedId: string;
    trackingEnabled: boolean;
    domain: string;
    allowedDomains: string[];
    privacyLevel: 'minimal' | 'standard' | 'detailed';
    sessionTracking: boolean;
    userConsent: boolean;
    anonymizeData: boolean;
    retentionDays: number;
    samplingRate: number;
    batchSize: number;
    flushInterval: number;

export interface AnalyticsEvent {
    id: string;
    embedId: string;
    type: EventType;
    category: string;
    action: string;
    label?: string;
    value?: number;
    data: EventData;
    context: EventContext;
    timestamp: Date;
    sessionId: string;
    userId?: string;
    anonymousId: string;

export type EventType = 'page_view' | 'interaction' | 'performance' | 'error' | 'conversion' | 'engagement' | 'experiment' | 'privacy' | 'custom';

export interface EventData {
    properties: Record<string, any>;
    metrics: Record<string, number>;
    dimensions: Record<string, string>;
    custom: Record<string, any>;

export interface EventContext {
    page: PageContext;
    user: UserContext;
    device: DeviceContext;
    session: SessionContext;
    embed: EmbedContext;
    referrer: ReferrerContext;
    experiment: ExperimentContext;

export interface PageContext {
    url: string;
    title: string;
    path: string;
    domain: string;
    language: string;
    viewport: {,
        width: number;
        height: number;
    };
    scrollDepth: number;
    timeOnPage: number;

export interface UserContext {
    id?: string;
    anonymousId: string;
    isReturning: boolean;
    segment?: string;
    attributes: Record<string, any>;
    preferences: UserPreferences;
    consent: ConsentData;

export interface UserPreferences {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    accessibility: AccessibilityPreferences;
    notifications: NotificationPreferences;

export interface AccessibilityPreferences {
    screenReader: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    keyboardNavigation: boolean;

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;

export interface ConsentData {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    functional: boolean;
    timestamp: Date;
    version: string;

export interface DeviceContext {
    type: 'desktop' | 'tablet' | 'mobile' | 'tv' | 'bot';
    os: string;
    osVersion: string;
    browser: string;
    browserVersion: string;
    resolution: {,
        width: number;
        height: number;
    };
    pixelDensity: number;
    touchSupport: boolean;
    connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet';
    darkMode: boolean;

export interface SessionContext {
    id: string;
    startTime: Date;
    duration: number;
    pageViews: number;
    interactions: number;
    isFirst: boolean;
    source: string;
    medium: string;
    campaign?: string;

export interface EmbedContext {
    id: string;
    version: string;
    type: string;
    size: {,
        width: number;
        height: number;
    };
    position: {,
        x: number;
        y: number;
    };
    visible: boolean;
    loadTime: number;
    renderTime: number;
    interactionCount: number;

export interface ReferrerContext {
    url?: string;
    domain?: string;
    source: 'direct' | 'search' | 'social' | 'email' | 'referral' | 'paid' | 'unknown';
    medium: string;
    campaign?: string;
    term?: string;
    content?: string;

export interface ExperimentContext {
    activeExperiments: ActiveExperiment[];
    cohort?: string;
    segment?: string;

export interface ActiveExperiment {
    id: string;
    name: string;
    variant: string;
    startDate: Date;
    allocation: number;

export interface PerformanceMetrics {
    embedId: string;
    timestamp: Date;
    loadTime: number;
    renderTime: number;
    interactionLatency: number;
    memoryUsage: number;
    networkLatency: number;
    errorCount: number;
    frameRate: number;
    bundleSize: number;
    cacheHitRate: number;
    apiResponseTimes: Record<string, number>;

export interface EngagementMetrics {
    embedId: string;
    timestamp: Date;
    sessionDuration: number;
    interactionCount: number;
    clickThroughRate: number;
    bounceRate: number;
    conversionRate: number;
    scrollDepth: number;
    timeToInteraction: number;
    returnVisitRate: number;
    shareCount: number;
    favoriteCount: number;

export interface ConversionMetrics {
    embedId: string;
    timestamp: Date;
    goalCompletions: GoalCompletion[];
    funnelSteps: FunnelStep[];
    revenueImpact: number;
    leadGeneration: number;
    signupRate: number;
    purchaseRate: number;

export interface GoalCompletion {
    goalId: string;
    goalName: string;
    value: number;
    completedAt: Date;
    funnelPosition: number;
    attribution: AttributionData;

export interface FunnelStep {
    stepId: string;
    stepName: string;
    completionRate: number;
    dropoffRate: number;
    averageTime: number;
    userCount: number;

export interface AttributionData {
    firstTouch: TouchPoint;
    lastTouch: TouchPoint;
    touchPoints: TouchPoint[];
    modelType: 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based';

export interface TouchPoint {
    source: string;
    medium: string;
    campaign?: string;
    timestamp: Date;
    value: number;

export interface AnalyticsReport {
    id: string;
    name: string;
    type: ReportType;
    timeRange: TimeRange;
    filters: ReportFilter[];
    metrics: ReportMetric[];
    dimensions: string[];
    data: ReportData;
    generatedAt: Date;
    generatedBy: string;

export type ReportType = 'overview' | 'performance' | 'engagement' | 'conversion' | 'funnel' | 'cohort' | 'retention' | 'experiment' | 'custom';

export interface TimeRange {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface ReportFilter {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
    value: any;
    logicalOperator?: 'AND' | 'OR';

export interface ReportMetric {
    name: string;
    aggregation: 'sum' | 'count' | 'average' | 'median' | 'min' | 'max' | 'unique';
    format: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
    precision?: number;

export interface ReportData {
    summary: SummaryData;
    timeSeries: TimeSeriesData[];
    breakdown: BreakdownData[];
    comparisons: ComparisonData[];
    insights: InsightData[];

export interface SummaryData {
    totalEvents: number;
    uniqueUsers: number;
    sessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    topMetrics: TopMetric[];

export interface TopMetric {
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';

export interface TimeSeriesData {
    timestamp: Date;
    values: Record<string, number>;

export interface BreakdownData {
    dimension: string;
    values: Array<{,
        name: string;
        value: number;
        percentage: number;
    }>;

export interface ComparisonData {
    metric: string;
    current: number;
    previous: number;
    change: number;
    significance: 'significant' | 'not_significant';

export interface InsightData {
    type: 'anomaly' | 'trend' | 'opportunity' | 'warning';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    recommendation?: string;

export interface ExperimentConfig {
    id: string;
    name: string;
    description: string;
    hypothesis: string;
    status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
    variants: ExperimentVariant[];
    allocation: AllocationStrategy;
    targeting: TargetingCriteria;
    goals: ExperimentGoal[];
    duration: ExperimentDuration;
    significance: SignificanceConfig;

export interface ExperimentVariant {
    id: string;
    name: string;
    description: string;
    allocation: number;
    configuration: Record<string, any>;
    isControl: boolean;

export interface AllocationStrategy {
    type: 'random' | 'sticky' | 'targeted';
    seed?: string;
    method: 'hash' | 'random' | 'deterministic';

export interface TargetingCriteria {
    includeCriteria: TargetingRule[];
    excludeCriteria: TargetingRule[];
    sampleSize?: number;
    samplePercentage?: number;

export interface TargetingRule {
    field: string;
    operator: string;
    value: any;
    logicalOperator?: 'AND' | 'OR';

export interface ExperimentGoal {
    id: string;
    name: string;
    type: 'primary' | 'secondary';
    metric: string;
    aggregation: string;
    target?: number;
    direction: 'increase' | 'decrease';

export interface ExperimentDuration {
    startDate: Date;
    endDate?: Date;
    minDuration: number;
    maxDuration: number;
    earlyStoppingEnabled: boolean;

export interface SignificanceConfig {
    confidenceLevel: number;
    minimumSampleSize: number;
    minimumDetectableEffect: number;
    statisticalPower: number;

export interface ExperimentResult {
    experimentId: string;
    variant: string;
    metrics: ExperimentMetric[];
    significance: StatisticalSignificance;
    sampleSize: number;
    conversionRate: number;
    confidence: ConfidenceInterval;
    pValue: number;
    effect: EffectSize;

export interface ExperimentMetric {
    goalId: string;
    value: number;
    standardError: number;
    confidenceInterval: ConfidenceInterval;
    improvement: number;
    significant: boolean;

export interface StatisticalSignificance {
    isSignificant: boolean;
    pValue: number;
    confidenceLevel: number;
    testStatistic: number;
    degreesOfFreedom: number;

export interface ConfidenceInterval {
    lower: number;
    upper: number;
    level: number;

export interface EffectSize {
    absolute: number;
    relative: number;
    practical: 'small' | 'medium' | 'large';

export declare class EmbedAnalytics extends EventEmitter {
    private config;
    private eventQueue;
    private sessionStore;
    private experiments;
    private isTracking;
    private flushTimer?;
    private performanceObserver?;
    constructor(config: Partial<EmbedConfig>);
    initialize(): Promise<void>;
    track(eventType: EventType, action: string, properties?: Record<string, any>): void;
    trackPageView(page?: Partial<PageContext>): void;
    trackInteraction(element: string, action: string, properties?: Record<string, any>): void;
    trackConversion(goalId: string, value?: number, properties?: Record<string, any>): void;
    trackError(error: Error, context?: Record<string, any>): void;
    trackPerformance(metrics: Partial<PerformanceMetrics>): void;
    trackCustomEvent(action: string, category: string, properties?: Record<string, any>): void;
    startSession(): string;
    updateSessionActivity(): void;
    endSession(): void;
    getExperimentVariant(experimentId: string): string | null;
    trackExperimentGoal(experimentId: string, goalId: string, value?: number): void;
    generateReport();
      type: ReportType,
      timeRange: TimeRange,
      filters?: ReportFilter[],
      metrics?: ReportMetric[]
    ): Promise<AnalyticsReport>;
    getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics[]>;
    getEngagementMetrics(timeRange: TimeRange): Promise<EngagementMetrics[]>;
    getConversionMetrics(timeRange: TimeRange): Promise<ConversionMetrics[]>;
    setUserConsent(consent: ConsentData): void;
    anonymizeUser(): void;
    purgeUserData(userId: string): Promise<void>;
    updateConfig(updates: Partial<EmbedConfig>): void;
    getConfig(): EmbedConfig;
    flush(): Promise<void>;
    stop(): void;
    getStatus(): {
        tracking: boolean;
        queueSize: number;
        sessionCount: number;
        errors: number;
    };
    private initializeTracking;
    private initializeSession;
    private createEvent;
    private buildEventContext;
    private getPageContext;
    private getUserContext;
    private getDeviceContext;
    private getSessionContext;
    private getEmbedContext;
    private getReferrerContext;
    private getExperimentContext;
    private enqueueEvent;
    private processEventQueue;
    private sendEvents;
    private shouldSample;
    private setupPerformanceMonitoring;
    private trackPerformanceEntry;
    private setupEventListeners;
    private startBatchProcessing;
    private stopBatchProcessing;
    private startTracking;
    private stopTracking;
    private cleanup;
    private generateEventId;
    private generateSessionId;
    private generateReportId;
    private getCurrentSessionId;
    private getUserId;
    private getAnonymousId;
    private getSessionCookie;
    private setSessionCookie;
    private clearSessionCookie;
    private hasExistingSessions;
    private getTrafficSource;
    private getTrafficMedium;
    private calculateScrollDepth;
    private getTimeOnPage;
    private sanitizeProperties;
    private extractMetrics;
    private extractDimensions;
    private getDeviceType;
    private getOS;
    private getOSVersion;
    private getBrowser;
    private getBrowserVersion;
    private getConnectionType;
    private isDarkMode;
    private isReturningUser;
    private getUserSegment;
    private getUserAttributes;
    private getUserPreferences;
    private getConsentData;
    private getEmbedVersion;
    private getEmbedType;
    private getEmbedSize;
    private getEmbedPosition;
    private isEmbedVisible;
    private getEmbedLoadTime;
    private getEmbedRenderTime;
    private getEmbedInteractionCount;
    private getCampaign;
    private getTerm;
    private getContent;
    private getUserCohort;
    private getAllocatedVariant;
    private allocateVariant;
    private clearUserCookies;
    private deleteUserData;
    private getErrorCount;
    private setupBrowserTracking;
    private getReportDimensions;
    private queryAnalyticsData;
    private generateInsights;
    private queryPerformanceData;
    private queryEngagementData;
    private queryConversionData;
declare const _default: {
    EmbedAnalytics: typeof EmbedAnalytics;
};
export default _default;
//# sourceMappingURL=EmbedAnalytics.d.ts.map