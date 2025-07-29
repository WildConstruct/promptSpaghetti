/**
 * Attribution Tracking System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive attribution tracking system for
 * monitoring customer journey, conversion attribution, and multi-touch
 * attribution modeling. Provides accurate tracking of marketing effectiveness,
 * user engagement paths, and conversion attribution across channels.
 *
 * Features:
 * - Multi-touch attribution modeling
 * - Cross-device journey tracking
 * - Channel attribution analysis
 * - Conversion path reconstruction
 * - Real-time attribution updates
 * - Privacy-compliant tracking
 * - Custom attribution models
 * - Advanced reporting and insights
 */
import { EventEmitter } from 'events';

export interface AttributionConfig {
    trackingId: string;
    attribution: AttributionSettings;
    models: AttributionModel[];
    channels: ChannelConfig[];
    privacy: PrivacySettings;
    storage: StorageSettings;
    reporting: ReportingSettings;
    integration: IntegrationSettings;

export interface AttributionSettings {
    lookbackWindow: LookbackWindow;
    crossDevice: CrossDeviceConfig;
    deduplication: DeduplicationConfig;
    defaultModel: string;
    realTimeUpdates: boolean;
    batchProcessing: boolean;
    dataRetention: number;
    samplingRate: number;

export interface LookbackWindow {
    impression: number;
    click: number;
    view: number;
    engagement: number;
    custom: Record<string, number>;

export interface CrossDeviceConfig {
    enabled: boolean;
    identityResolution: IdentityResolutionConfig;
    deviceGraphProvider?: string;
    probabilisticMatching: boolean;
    deterministicMatching: boolean;
    confidenceThreshold: number;

export interface IdentityResolutionConfig {
    email: boolean;
    phone: boolean;
    userId: boolean;
    cookieSync: boolean;
    fingerprinting: boolean;
    ipAddress: boolean;
    userAgent: boolean;

export interface DeduplicationConfig {
    enabled: boolean;
    strategy: 'first' | 'last' | 'unique' | 'position';
    window: number;
    fields: string[];

export interface AttributionModel {
    id: string;
    name: string;
    type: AttributionModelType;
    description: string;
    configuration: ModelConfiguration;
    weights: AttributionWeights;
    rules: AttributionRule[];
    isDefault: boolean;
    isActive: boolean;
    version: string;
    created: Date;
    updated: Date;

export type AttributionModelType = 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven' | 'custom';

export interface ModelConfiguration {
    decayRate?: number;
    halfLife?: number;
    firstTouchWeight?: number;
    lastTouchWeight?: number;
    middleTouchWeight?: number;
    customWeights?: Record<string, number>;
    parameters: Record<string, any>;

export interface AttributionWeights {
    byPosition: PositionWeight[];
    byChannel: ChannelWeight[];
    byTouchType: TouchTypeWeight[];
    byTimeDecay: TimeDecayWeight[];
    byCustom: CustomWeight[];

export interface PositionWeight {
    position: 'first' | 'middle' | 'last' | number;
    weight: number;
    conditions?: WeightCondition[];

export interface ChannelWeight {
    channel: string;
    weight: number;
    conditions?: WeightCondition[];

export interface TouchTypeWeight {
    touchType: string;
    weight: number;
    conditions?: WeightCondition[];

export interface TimeDecayWeight {
    daysFromConversion: number;
    weight: number;
    decayFunction: 'linear' | 'exponential' | 'custom';

export interface CustomWeight {
    dimension: string;
    value: string;
    weight: number;
    conditions?: WeightCondition[];

export interface WeightCondition {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'in';
    value: any;

export interface AttributionRule {
    id: string;
    name: string;
    condition: RuleCondition;
    action: RuleAction;
    priority: number;
    isActive: boolean;

export interface RuleCondition {
    field: string;
    operator: string;
    value: any;
    logicalOperator?: 'AND' | 'OR' | 'NOT';
    nested?: RuleCondition[];

export interface RuleAction {
    type: 'include' | 'exclude' | 'modify' | 'redirect';
    parameters: Record<string, any>;
    weight?: number;

export interface ChannelConfig {
    id: string;
    name: string;
    type: ChannelType;
    category: ChannelCategory;
    attribution: ChannelAttributionConfig;
    tracking: ChannelTrackingConfig;
    metadata: ChannelMetadata;

export type ChannelType = 'organic_search' | 'paid_search' | 'social_organic' | 'social_paid' | 'email' | 'direct' | 'referral' | 'display' | 'video' | 'affiliate' | 'content' | 'mobile_app' | 'offline' | 'custom';
export type ChannelCategory = 'acquisition' | 'engagement' | 'retention' | 'conversion' | 'support';

export interface ChannelAttributionConfig {
    defaultWeight: number;
    lookbackWindow: number;
    touchPointCapture: TouchPointCapture;
    conversionWindow: number;
    assistWeight: number;
    lastTouchWeight: number;

export interface TouchPointCapture {
    impression: boolean;
    click: boolean;
    view: boolean;
    engagement: boolean;
    conversion: boolean;
    custom: Record<string, boolean>;

export interface ChannelTrackingConfig {
    utmTracking: UTMTracking;
    customParameters: CustomParameter[];
    crossDomainTracking: boolean;
    cookieDomain: string;
    sessionTimeout: number;

export interface UTMTracking {
    source: boolean;
    medium: boolean;
    campaign: boolean;
    term: boolean;
    content: boolean;
    customDimensions: string[];

export interface CustomParameter {
    name: string;
    source: 'url' | 'cookie' | 'header' | 'custom';
    pattern?: string;
    defaultValue?: string;
    required: boolean;

export interface ChannelMetadata {
    description: string;
    cost: CostConfig;
    performance: PerformanceMetrics;
    tags: string[];
    created: Date;
    updated: Date;

export interface CostConfig {
    enabled: boolean;
    currency: string;
    costModel: 'cpc' | 'cpm' | 'cpa' | 'fixed' | 'custom';
    defaultCost: number;
    costSource?: string;

export interface PerformanceMetrics {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    ctr: number;
    conversionRate: number;
    roas: number;
    cpa: number;

export interface CustomerJourney {
    id: string;
    userId?: string;
    anonymousId: string;
    deviceId?: string;
    sessionIds: string[];
    touchPoints: TouchPoint[];
    conversions: Conversion[];
    attribution: JourneyAttribution;
    timeline: JourneyTimeline;
    metadata: JourneyMetadata;
    created: Date;
    updated: Date;

export interface TouchPoint {
    id: string;
    journeyId: string;
    sessionId: string;
    type: TouchPointType;
    channel: string;
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    term?: string;
    timestamp: Date;
    data: TouchPointData;
    context: TouchPointContext;
    attribution: TouchPointAttribution;

export type TouchPointType = 'impression' | 'click' | 'view' | 'engagement' | 'conversion' | 'assist' | 'custom';

export interface TouchPointData {
    url: string;
    referrer?: string;
    page: PageData;
    user: UserData;
    device: DeviceData;
    location: LocationData;
    custom: Record<string, any>;

export interface PageData {
    title: string;
    path: string;
    category?: string;
    tags: string[];
    contentId?: string;
    author?: string;
    publishDate?: Date;
    engagementScore?: number;

export interface UserData {
    segment?: string;
    lifecycle?: string;
    value?: number;
    cohort?: string;
    preferences: Record<string, any>;
    behavior: BehaviorData;

export interface BehaviorData {
    sessionCount: number;
    pageViews: number;
    timeOnSite: number;
    bounceRate: number;
    previousVisits: Date[];
    interactionHistory: InteractionEvent[];

export interface InteractionEvent {
    type: string;
    element: string;
    timestamp: Date;
    data: Record<string, any>;

export interface DeviceData {
    type: 'desktop' | 'mobile' | 'tablet' | 'tv';
    os: string;
    browser: string;
    resolution: string;
    userAgent: string;
    fingerprint?: string;

export interface LocationData {
    country?: string;
    region?: string;
    city?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;

export interface TouchPointContext {
    experiment?: ExperimentContext;
    audience?: AudienceContext;
    weather?: WeatherContext;
    timeContext?: TimeContext;
    businessContext?: BusinessContext;

export interface ExperimentContext {
    experimentId: string;
    variant: string;
    allocation: number;

export interface AudienceContext {
    segments: string[];
    lookalike?: string;
    predictedValue?: number;
    churnRisk?: number;

export interface WeatherContext {
    condition: string;
    temperature: number;
    humidity: number;
    season: string;

export interface TimeContext {
    dayOfWeek: string;
    hourOfDay: number;
    isWeekend: boolean;
    isHoliday: boolean;
    season: string;
    timeZone: string;

export interface BusinessContext {
    campaignObjective?: string;
    budget?: number;
    targetAudience?: string;
    competitorActivity?: string;

export interface TouchPointAttribution {
    credit: number;
    weight: number;
    models: Record<string, number>;
    rank: number;
    influence: number;
    decay: number;

export interface Conversion {
    id: string;
    journeyId: string;
    type: ConversionType;
    value: ConversionValue;
    attribution: ConversionAttribution;
    funnel: FunnelData;
    timestamp: Date;
    data: ConversionData;

export type ConversionType = 'purchase' | 'lead' | 'signup' | 'subscription' | 'download' | 'engagement' | 'custom';

export interface ConversionValue {
    revenue?: number;
    quantity?: number;
    currency?: string;
    lifetime_value?: number;
    margin?: number;
    cost?: number;
    custom: Record<string, number>;

export interface ConversionAttribution {
    touchPoints: TouchPointAttribution[];
    models: Record<string, ModelAttribution>;
    primary: ModelAttribution;
    assisted: ModelAttribution;
    incrementality: IncrementalityData;

export interface ModelAttribution {
    model: string;
    credit: TouchPointCredit[];
    confidence: number;
    methodology: string;

export interface TouchPointCredit {
    touchPointId: string;
    credit: number;
    percentage: number;
    channel: string;
    position: number;

export interface IncrementalityData {
    baseline: number;
    incremental: number;
    lift: number;
    confidence: number;
    methodology: string;

export interface FunnelData {
    stage: string;
    position: number;
    completion: boolean;
    dropoff?: boolean;
    micro_conversions: MicroConversion[];

export interface MicroConversion {
    type: string;
    value: number;
    timestamp: Date;
    attribution: number;

export interface ConversionData {
    product?: ProductData;
    transaction?: TransactionData;
    form?: FormData;
    engagement?: EngagementData;
    custom: Record<string, any>;

export interface ProductData {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    sku: string;
    brand?: string;
    variant?: string;

export interface TransactionData {
    id: string;
    total: number;
    currency: string;
    tax: number;
    shipping: number;
    discount: number;
    paymentMethod: string;
    products: ProductData[];

export interface FormData {
    formId: string;
    fields: FormField[];
    completion: number;
    timeToComplete: number;
    abandonmentPoint?: string;

export interface FormField {
    name: string;
    value: any;
    type: string;
    required: boolean;
    filled: boolean;

export interface EngagementData {
    type: string;
    duration: number;
    interactions: number;
    depth: number;
    quality: number;

export interface JourneyAttribution {
    models: Record<string, JourneyModelAttribution>;
    primary: string;
    touchPointCount: number;
    conversionPath: string[];
    timeToConversion: number;
    assist_interactions: number;
    direct_interactions: number;

export interface JourneyModelAttribution {
    model: string;
    distribution: ChannelDistribution[];
    totalCredit: number;
    confidence: number;

export interface ChannelDistribution {
    channel: string;
    credit: number;
    percentage: number;
    touchPoints: number;

export interface JourneyTimeline {
    firstTouch: Date;
    lastTouch: Date;
    firstConversion?: Date;
    duration: number;
    touchPointsByDay: Record<string, number>;
    conversionsByDay: Record<string, number>;
    engagementPeaks: Date[];

export interface JourneyMetadata {
    source: string;
    quality: QualityScore;
    completeness: CompletenessScore;
    anomalies: AnomalyData[];
    tags: string[];

export interface QualityScore {
    overall: number;
    dataCompleteness: number;
    attribution_confidence: number;
    cross_device_matching: number;
    deduplication: number;

export interface CompletenessScore {
    touchPoints: number;
    conversions: number;
    user_data: number;
    context_data: number;
    overall: number;

export interface AnomalyData {
    type: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    timestamp: Date;

export interface PrivacySettings {
    gdprCompliance: boolean;
    ccpaCompliance: boolean;
    cookieConsent: boolean;
    dataMinimization: boolean;
    anonymization: AnonymizationConfig;
    retention: RetentionConfig;
    userRights: UserRightsConfig;

export interface AnonymizationConfig {
    enabled: boolean;
    ipAnonymization: boolean;
    userIdHashing: boolean;
    piiRemoval: boolean;
    aggregationThreshold: number;
    kAnonymity: number;

export interface RetentionConfig {
    touchPoints: number;
    conversions: number;
    journeys: number;
    analytics: number;
    logs: number;
    autoDelete: boolean;

export interface UserRightsConfig {
    accessRequests: boolean;
    deleteRequests: boolean;
    portabilityRequests: boolean;
    optOutRequests: boolean;
    correctionRequests: boolean;

export interface StorageSettings {
    backend: StorageBackend;
    partitioning: PartitioningConfig;
    compression: CompressionConfig;
    encryption: EncryptionConfig;
    backup: BackupConfig;

export interface StorageBackend {
    type: 'local' | 'cloud' | 'hybrid';
    provider?: string;
    region?: string;
    endpoint?: string;
    credentials?: Record<string, string>;

export interface PartitioningConfig {
    strategy: 'time' | 'user' | 'channel' | 'custom';
    granularity: 'day' | 'week' | 'month';
    retention: number;

export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'gzip' | 'lz4' | 'snappy';
    level: number;

export interface EncryptionConfig {
    enabled: boolean;
    algorithm: 'AES-256' | 'ChaCha20';
    keyRotation: boolean;
    rotationInterval: number;

export interface BackupConfig {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    retention: number;
    offsite: boolean;

export interface ReportingSettings {
    realTime: boolean;
    batchInterval: number;
    aggregationLevels: AggregationLevel[];
    dimensions: ReportDimension[];
    metrics: ReportMetric[];
    exports: ExportConfig[];

export interface AggregationLevel {
    name: string;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
    dimensions: string[];
    metrics: string[];

export interface ReportDimension {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    cardinality: 'low' | 'medium' | 'high';
    nullable: boolean;

export interface ReportMetric {
    name: string;
    type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
    aggregation: string;
    precision: number;

export interface ExportConfig {
    name: string;
    format: 'csv' | 'json' | 'parquet' | 'avro';
    destination: ExportDestination;
    schedule: ExportSchedule;
    filters: ExportFilter[];

export interface ExportDestination {
    type: 'file' | 'database' | 'api' | 'warehouse';
    connection: Record<string, string>;
    path?: string;
    table?: string;

export interface ExportSchedule {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    timezone?: string;
    enabled: boolean;

export interface ExportFilter {
    field: string;
    operator: string;
    value: any;

export interface IntegrationSettings {
    dataImport: DataImportConfig[];
    webhooks: WebhookConfig[];
    apis: APIConfig[];
    connectors: ConnectorConfig[];

export interface DataImportConfig {
    name: string;
    source: ImportSource;
    mapping: FieldMapping[];
    schedule: ImportSchedule;
    validation: ValidationConfig;

export interface ImportSource {
    type: 'file' | 'database' | 'api' | 'stream';
    connection: Record<string, string>;
    format?: 'csv' | 'json' | 'xml' | 'avro';

export interface FieldMapping {
    source: string;
    target: string;
    transform?: string;
    required: boolean;

export interface ImportSchedule {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    enabled: boolean;

export interface ValidationConfig {
    enabled: boolean;
    rules: ValidationRule[];
    errorHandling: 'skip' | 'fail' | 'log';

export interface ValidationRule {
    field: string;
    type: 'required' | 'format' | 'range' | 'custom';
    parameters: Record<string, any>;
    message: string;

export interface WebhookConfig {
    name: string;
    url: string;
    events: string[];
    authentication?: AuthConfig;
    retryPolicy: RetryPolicy;
    enabled: boolean;

export interface AuthConfig {
    type: 'none' | 'basic' | 'bearer' | 'oauth' | 'custom';
    credentials: Record<string, string>;

export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    baseDelay: number;
    maxDelay: number;

export interface APIConfig {
    name: string;
    baseUrl: string;
    authentication: AuthConfig;
    rateLimiting: RateLimitConfig;
    endpoints: EndpointConfig[];

export interface RateLimitConfig {
    requestsPerSecond: number;
    burstLimit: number;
    retryAfter: number;

export interface EndpointConfig {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    purpose: string;
    parameters: ParameterConfig[];

export interface ParameterConfig {
    name: string;
    type: 'query' | 'path' | 'body' | 'header';
    required: boolean;
    default?: any;

export interface ConnectorConfig {
    name: string;
    type: 'google_analytics' | 'facebook_ads' | 'google_ads' | 'salesforce' | 'custom';
    credentials: Record<string, string>;
    syncSettings: SyncSettings;
    fieldMapping: FieldMapping[];

export interface SyncSettings {
    frequency: 'realtime' | 'hourly' | 'daily';
    enabled: boolean;
    lastSync?: Date;
    syncWindow: number;

export declare class AttributionTracker extends EventEmitter {
    private config;
    private journeys;
    private models;
    private channels;
    private touchPointQueue;
    private conversionQueue;
    private isProcessing;
    private processingTimer?;
    constructor(config: Partial<AttributionConfig>);
    trackTouchPoint(data: Partial<TouchPoint>): Promise<string>;
    trackConversion(data: Partial<Conversion>): Promise<string>;
    getJourney(journeyId: string): Promise<CustomerJourney | null>;
    getUserJourneys(userId: string): Promise<CustomerJourney[]>;
    mergeJourneys(sourceJourneyId: string, targetJourneyId: string): Promise<CustomerJourney>;
    calculateAttribution(conversionId: string, modelId?: string): Promise<ConversionAttribution>;
    getAttributionReport(timeRange: {)
        start: Date;
        end: Date;
    }, options?: {
        models?: string[];
        channels?: string[];
        dimensions?: string[];
        metrics?: string[];
    }): Promise<AttributionReport>;
    addAttributionModel(model: Omit<AttributionModel, 'id' | 'created' | 'updated'>): Promise<string>;
    updateAttributionModel(modelId: string, updates: Partial<AttributionModel>): Promise<void>;
    removeAttributionModel(modelId: string): Promise<void>;
    addChannel(channel: Omit<ChannelConfig, 'id'>): Promise<string>;
    updateChannel(channelId: string, updates: Partial<ChannelConfig>): Promise<void>;
    linkDevices(deviceIds: string[], userId?: string): Promise<void>;
    deleteUserData(userId: string): Promise<void>;
    anonymizeUserData(userId: string): Promise<void>;
    exportUserData(userId: string): Promise<any>;
    updateConfig(updates: Partial<AttributionConfig>): void;
    getConfig(): AttributionConfig;
    flush(): Promise<void>;
    stop(): Promise<void>;
    getChannelPerformance(timeRange: {)
        start: Date;
        end: Date;
    }): Promise<ChannelPerformanceReport>;
    getConversionPaths(timeRange: {)
        start: Date;
        end: Date;
    }, options?: {
        limit?: number;
        minTouchPoints?: number;
        channels?: string[];
    }): Promise<ConversionPath[]>;
    getAttributionInsights(timeRange: {)
        start: Date;
        end: Date;
    }): Promise<AttributionInsights>;
    private mergeDefaultConfig;
    private initializeModels;
    private initializeChannels;
    private startProcessing;
    private stopProcessing;
    private processQueues;
    private createTouchPoint;
    private createConversion;
    private processTouchPoint;
    private processConversion;
    private computeAttribution;
    private computeFirstTouchAttribution;
    private computeLastTouchAttribution;
    private computeLinearAttribution;
    private computeTimeDecayAttribution;
    private computePositionBasedAttribution;
    private computeCustomAttribution;
    private findOrCreateJourney;
    private createJourney;
    private updateJourneyTimeline;
    private getRelevantTouchPoints;
    private getJourneysInRange;
    private getConversionsInRange;
    private findConversion;
    private performJourneyMerge;
    private mergeDeviceJourneys;
    private generateJourneyId;
    private generateTouchPointId;
    private generateConversionId;
    private generateModelId;
    private generateChannelId;
    private generateSessionId;
    private generateAnonymousId;
    private getSeason;
    private cleanup;
    private generateAttributionReport;
    private calculateChannelPerformance;
    private analyzeConversionPaths;
    private generateInsights;

export interface AttributionReport {
    id: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    summary: {
        totalJourneys: number;
        totalConversions: number;
        totalTouchPoints: number;
        averageJourneyLength: number;
        conversionRate: number;
    };
    models: any[];
    channels: any[];
    paths: any[];
    insights: any[];
    generatedAt: Date;

export interface ChannelPerformanceReport {
    channels: any[];
    summary: {
        totalChannels: number;
        totalTouchPoints: number;
        totalConversions: number;
        averageCPA: number;
        averageROAS: number;
    };
    timeRange: {
        start: Date;
        end: Date;
    };
    generatedAt: Date;

export interface ConversionPath {
    id: string;
    path: string[];
    touchPoints: number;
    conversions: number;
    conversionRate: number;
    averageValue: number;
    frequency: number;

export interface AttributionInsights {
    trends: any[];
    anomalies: any[];
    opportunities: any[];
    recommendations: any[];
    confidence: number;
    generatedAt: Date;
declare const _default: {
    AttributionTracker: typeof AttributionTracker;
};
export default _default;
//# sourceMappingURL=AttributionTracking.d.ts.map