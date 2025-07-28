/**
 * Direct Link Sharing System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive direct link sharing system for
 * secure, trackable content sharing with attribution tracking, access
 * controls, and analytics integration. Provides shortened URLs, custom
 * domains, expiration controls, and detailed sharing analytics.
 *
 * Features:
 * - Secure link generation and validation
 * - Custom domain and branding support
 * - Access controls and permissions
 * - Link expiration and usage limits
 * - Detailed sharing analytics
 * - Attribution tracking integration
 * - Social media optimization
 * - QR code generation
 */
import { EventEmitter } from 'events';
export interface ShareConfig {
    domainConfig: DomainConfig;
    security: SecurityConfig;
    analytics: AnalyticsConfig;
    branding: BrandingConfig;
    limits: LimitsConfig;
    features: FeatureConfig;
    integrations: IntegrationConfig;
}
export interface DomainConfig {
    primaryDomain: string;
    customDomains: CustomDomain[];
    defaultScheme: 'http' | 'https';
    subdomainStrategy: 'random' | 'hash' | 'sequential' | 'custom';
    pathPrefix?: string;
    enableShortening: boolean;
    shorteningStrategy: 'base62' | 'base36' | 'uuid' | 'custom';
}
export interface CustomDomain {
    domain: string;
    verified: boolean;
    sslEnabled: boolean;
    brandingEnabled: boolean;
    createdAt: Date;
    expiresAt?: Date;
    owner: string;
    usage: DomainUsage;
}
export interface DomainUsage {
    totalLinks: number;
    totalClicks: number;
    monthlyLimit: number;
    currentMonthUsage: number;
    lastReset: Date;
}
export interface SecurityConfig {
    tokenGeneration: TokenConfig;
    accessControl: AccessControlConfig;
    validation: ValidationConfig;
    rateLimit: RateLimitConfig;
    fraud: FraudDetectionConfig;
    privacy: PrivacyConfig;
}
export interface TokenConfig {
    algorithm: 'random' | 'hash' | 'jwt' | 'signed';
    length: number;
    charset: string;
    collisionHandling: 'retry' | 'increment' | 'error';
    caseSensitive: boolean;
    excludeAmbiguous: boolean;
}
export interface AccessControlConfig {
    requireAuthentication: boolean;
    allowedRoles: string[];
    ipWhitelist: string[];
    geoRestrictions: GeoRestriction[];
    deviceRestrictions: DeviceRestriction[];
    timeRestrictions: TimeRestriction[];
}
export interface GeoRestriction {
    type: 'allow' | 'deny';
    countries: string[];
    regions: string[];
    cities: string[];
}
export interface DeviceRestriction {
    type: 'allow' | 'deny';
    deviceTypes: ('desktop' | 'mobile' | 'tablet')[];
    browsers: string[];
    operatingSystems: string[];
}
export interface TimeRestriction {
    type: 'allow' | 'deny';
    schedule: TimeSchedule;
    timezone: string;
}
export interface TimeSchedule {
    days: string[];
    hours: {,
        start: string;
        end: string;
    };
    dateRange?: {
        start: Date;
        end: Date;
    };
}
export interface ValidationConfig {
    enableLinkValidation: boolean;
    contentValidation: ContentValidation;
    urlValidation: URLValidation;
    malwareScanning: boolean;
    phishingDetection: boolean;
}
export interface ContentValidation {
    enabled: boolean;
    allowedContentTypes: string[];
    maxContentSize: number;
    scanForMalware: boolean;
    requireApproval: boolean;
}
export interface URLValidation {
    enabled: boolean;
    allowedDomains: string[];
    blockedDomains: string[];
    requireHTTPS: boolean;
    validateDNS: boolean;
}
export interface RateLimitConfig {
    enabled: boolean;
    requests: number;
    windowMs: number;
    skipAuthenticated: boolean;
    storage: 'memory' | 'redis' | 'database';
}
export interface FraudDetectionConfig {
    enabled: boolean;
    botDetection: boolean;
    clickFraud: boolean;
    velocityChecks: boolean;
    fingerprintTracking: boolean;
    anomalyDetection: boolean;
}
export interface PrivacyConfig {
    anonymizeIPs: boolean;
    respectDoNotTrack: boolean;
    gdprCompliance: boolean;
    dataRetentionDays: number;
    allowOptOut: boolean;
    consentRequired: boolean;
}
export interface AnalyticsConfig {
    enabled: boolean;
    trackClicks: boolean;
    trackReferrers: boolean;
    trackUserAgents: boolean;
    trackGeolocation: boolean;
    realTimeUpdates: boolean;
    attributionTracking: boolean;
    customEvents: string[];
}
export interface BrandingConfig {
    enabled: boolean;
    logoUrl?: string;
    brandName?: string;
    brandColors: BrandColors;
    customPages: CustomPageConfig;
    socialMediaCards: SocialMediaConfig;
}
export interface BrandColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}
export interface CustomPageConfig {
    landingPage?: PageTemplate;
    errorPage?: PageTemplate;
    expiredPage?: PageTemplate;
    restrictedPage?: PageTemplate;
}
export interface PageTemplate {
    template: string;
    variables: Record<string, string>;
    css?: string;
    javascript?: string;
}
export interface SocialMediaConfig {
    enabled: boolean;
    openGraph: OpenGraphConfig;
    twitterCard: TwitterCardConfig;
    linkedIn: LinkedInConfig;
}
export interface OpenGraphConfig {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    siteName?: string;
}
export interface TwitterCardConfig {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    image?: string;
    creator?: string;
}
export interface LinkedInConfig {
    title?: string;
    description?: string;
    image?: string;
}
export interface LimitsConfig {
    maxLinksPerUser: number;
    maxLinksPerDay: number;
    maxClicksPerLink: number;
    linkExpirationDays: number;
    customLimits: CustomLimit[];
}
export interface CustomLimit {
    name: string;
    type: 'user' | 'domain' | 'ip' | 'global';
    value: number;
    period: 'hour' | 'day' | 'week' | 'month' | 'year';
    action: 'block' | 'throttle' | 'notify';
}
export interface FeatureConfig {
    qrCodes: QRCodeConfig;
    preview: PreviewConfig;
    scheduling: SchedulingConfig;
    collaboration: CollaborationConfig;
    automation: AutomationConfig;
}
export interface QRCodeConfig {
    enabled: boolean;
    defaultSize: number;
    formats: ('png' | 'svg' | 'pdf')[];
    errorCorrection: 'low' | 'medium' | 'quartile' | 'high';
    customization: QRCustomization;
}
export interface QRCustomization {
    colors: {,
        foreground: string;
        background: string;
    };
    logo?: {
        url: string;
        size: number;
    };
    style: 'square' | 'rounded' | 'circular';
    margin: number;
}
export interface PreviewConfig {
    enabled: boolean;
    generatePreviews: boolean;
    cacheLifetime: number;
    supportedTypes: string[];
    maxPreviewSize: number;
}
export interface SchedulingConfig {
    enabled: boolean;
    maxScheduleDays: number;
    timezoneSupport: boolean;
    recurringShares: boolean;
}
export interface CollaborationConfig {
    enabled: boolean;
    allowTeamSharing: boolean;
    permissions: CollaborationPermission[];
    notifications: NotificationConfig;
}
export interface CollaborationPermission {
    role: string;
    actions: ('create' | 'edit' | 'delete' | 'view' | 'share')[];
    limits?: Record<string, number>;
}
export interface NotificationConfig {
    email: boolean;
    webhook: boolean;
    inApp: boolean;
    events: string[];
}
export interface AutomationConfig {
    enabled: boolean;
    autoExpiration: boolean;
    autoArchiving: boolean;
    smartRedirects: boolean;
    bulkOperations: boolean;
}
export interface IntegrationConfig {
    attribution: AttributionIntegration;
    analytics: AnalyticsIntegration;
    social: SocialIntegration;
    webhooks: WebhookIntegration;
}
export interface AttributionIntegration {
    enabled: boolean;
    trackingParameters: string[];
    defaultSource: string;
    defaultMedium: string;
    campaignTracking: boolean;
}
export interface AnalyticsIntegration {
    providers: AnalyticsProvider[];
    realTimeSync: boolean;
    customDimensions: string[];
    eventTracking: boolean;
}
export interface AnalyticsProvider {
    name: string;
    type: 'google_analytics' | 'adobe_analytics' | 'mixpanel' | 'segment' | 'custom';
    apiKey: string;
    config: Record<string, any>;
    enabled: boolean;
}
export interface SocialIntegration {
    platforms: SocialPlatform[];
    autoPosting: boolean;
    hashtagSuggestions: boolean;
    optimalTiming: boolean;
}
export interface SocialPlatform {
    name: string;
    apiCredentials: Record<string, string>;
    enabled: boolean;
    defaultSettings: Record<string, any>;
}
export interface WebhookIntegration {
    endpoints: WebhookEndpoint[];
    events: string[];
    retryPolicy: RetryPolicy;
    security: WebhookSecurity;
}
export interface WebhookEndpoint {
    name: string;
    url: string;
    events: string[];
    headers: Record<string, string>;
    enabled: boolean;
}
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    baseDelay: number;
    maxDelay: number;
}
export interface WebhookSecurity {
    signatureVerification: boolean;
    secretKey?: string;
    ipWhitelist: string[];
    requireHTTPS: boolean;
}
export interface ShareLink {
    id: string;
    shortCode: string;
    originalUrl: string;
    shortUrl: string;
    title?: string;
    description?: string;
    metadata: LinkMetadata;
    security: LinkSecurity;
    analytics: LinkAnalytics;
    branding: LinkBranding;
    status: LinkStatus;
    creator: UserInfo;
    team?: TeamInfo;
    created: Date;
    updated: Date;
    expires?: Date;
    lastAccessed?: Date;
}
export interface LinkMetadata {
    contentType?: string;
    fileSize?: number;
    preview?: PreviewData;
    tags: string[];
    category?: string;
    campaign?: string;
    source?: string;
    medium?: string;
    utm: UTMParameters;
    custom: Record<string, any>;
}
export interface PreviewData {
    title: string;
    description: string;
    image?: string;
    favicon?: string;
    siteName?: string;
    type: 'website' | 'article' | 'video' | 'image' | 'document';
}
export interface UTMParameters {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    custom: Record<string, string>;
}
export interface LinkSecurity {
    accessLevel: AccessLevel;
    password?: string;
    allowedUsers: string[];
    allowedRoles: string[];
    restrictions: AccessRestriction[];
    verification: VerificationConfig;
}
export type AccessLevel = 'public' | 'restricted' | 'private' | 'team' | 'custom';
export interface AccessRestriction {
    type: RestrictionType;
    config: Record<string, any>;
    message?: string;
}
export type RestrictionType = 'geo' | 'time' | 'device' | 'ip' | 'referrer' | 'user_agent' | 'click_limit' | 'rate_limit';
export interface VerificationConfig {
    requireEmail: boolean;
    requirePhone: boolean;
    requireCaptcha: boolean;
    require2FA: boolean;
}
export interface LinkAnalytics {
    totalClicks: number;
    uniqueClicks: number;
    clicksByCountry: Record<string, number>;
    clicksByDevice: Record<string, number>;
    clicksByReferrer: Record<string, number>;
    clicksByHour: Record<string, number>;
    lastClickAt?: Date;
    conversionRate?: number;
    revenue?: number;
    goals: GoalTracking[];
}
export interface GoalTracking {
    goalId: string;
    goalName: string;
    conversions: number;
    conversionRate: number;
    value: number;
    lastConversion?: Date;
}
export interface LinkBranding {
    domain: string;
    customSlug?: string;
    favicon?: string;
    logo?: string;
    colors: BrandColors;
    landingPage?: string;
}
export type LinkStatus = 'active' | 'paused' | 'expired' | 'disabled' | 'archived' | 'pending' | 'error';
export interface UserInfo {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
}
export interface TeamInfo {
    id: string;
    name: string;
    members: TeamMember[];
    permissions: TeamPermission[];
}
export interface TeamMember {
    userId: string;
    role: string;
    joinedAt: Date;
    permissions: string[];
}
export interface TeamPermission {
    action: string;
    resource: string;
    conditions?: Record<string, any>;
}
export interface ClickEvent {
    id: string;
    linkId: string;
    shortCode: string;
    timestamp: Date;
    visitor: VisitorInfo;
    request: RequestInfo;
    response: ResponseInfo;
    attribution: ClickAttribution;
    conversion?: ConversionInfo;
}
export interface VisitorInfo {
    id: string;
    isUnique: boolean;
    sessionId: string;
    fingerprint?: string;
    ipAddress: string;
    userAgent: string;
    geo: GeoLocation;
    device: DeviceInfo;
    referrer?: ReferrerInfo;
}
export interface GeoLocation {
    country: string;
    countryCode: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
}
export interface DeviceInfo {
    type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'bot';
    os: string;
    osVersion?: string;
    browser: string;
    browserVersion?: string;
    screenResolution?: string;
    language?: string;
}
export interface ReferrerInfo {
    url?: string;
    domain?: string;
    type: 'direct' | 'search' | 'social' | 'email' | 'paid' | 'referral' | 'other';
    searchTerm?: string;
    socialPlatform?: string;
}
export interface RequestInfo {
    method: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    body?: any;
    timestamp: Date;
}
export interface ResponseInfo {
    statusCode: number;
    redirectUrl: string;
    responseTime: number;
    cacheHit: boolean;
    errors?: string[];
}
export interface ClickAttribution {
    touchPointId?: string;
    campaignId?: string;
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    term?: string;
    custom: Record<string, string>;
}
export interface ConversionInfo {
    type: string;
    value: number;
    currency?: string;
    goalId?: string;
    timestamp: Date;
    attribution: string;
}
export interface BulkOperation {
    id: string;
    type: BulkOperationType;
    status: OperationStatus;
    request: BulkRequest;
    progress: OperationProgress;
    results: BulkResults;
    created: Date;
    started?: Date;
    completed?: Date;
    error?: string;
}
export type BulkOperationType = 'create' | 'update' | 'delete' | 'archive' | 'export' | 'import';
export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface BulkRequest {
    items: any[];
    options: Record<string, any>;
    metadata: Record<string, any>;
}
export interface OperationProgress {
    total: number;
    completed: number;
    failed: number;
    percentage: number;
    estimatedCompletion?: Date;
    currentItem?: string;
}
export interface BulkResults {
    successful: BulkResultItem[];
    failed: BulkResultItem[];
    summary: ResultSummary;
}
export interface BulkResultItem {
    index: number;
    input: any;
    output?: any;
    error?: string;
    duration: number;
}
export interface ResultSummary {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    averageProcessingTime: number;
    warnings: string[];
}
export declare class DirectLinkSharing extends EventEmitter {
    private config;
    private links;
    private shortCodeIndex;
    private clicks;
    private bulkOperations;
    private attributionTracker?;
    private analytics?;
    constructor(config: Partial<ShareConfig>);
    createLink(request: CreateLinkRequest): Promise<ShareLink>;
    updateLink(linkId: string, updates: UpdateLinkRequest): Promise<ShareLink>;
    deleteLink(linkId: string): Promise<boolean>;
    getLink(linkId: string): Promise<ShareLink | null>;
    getLinkByShortCode(shortCode: string): Promise<ShareLink | null>;
    accessLink(shortCode: string, accessContext: AccessContext): Promise<AccessResult>;
    getLinkAnalytics(linkId: string, timeRange?: {)
        start: Date;
        end: Date;
    }): Promise<LinkAnalyticsReport>;
    getBulkAnalytics(linkIds: string[], timeRange?: {)
        start: Date;
        end: Date;
    }): Promise<BulkAnalyticsReport>;
    getUserAnalytics(userId: string, timeRange?: {)
        start: Date;
        end: Date;
    }): Promise<UserAnalyticsReport>;
    createBulkLinks(requests: CreateLinkRequest[]): Promise<BulkOperation>;
    getBulkOperation(operationId: string): Promise<BulkOperation | null>;
    generateQRCode(linkId: string, options?: QRCodeOptions): Promise<QRCodeResult>;
    generatePreview(url: string): Promise<PreviewData>;
    scheduleShare(request: CreateLinkRequest, schedule: ShareSchedule): Promise<ScheduledShare>;
    shareWithTeam(linkId: string, teamId: string, permissions: string[]): Promise<void>;
    updateConfig(updates: Partial<ShareConfig>): void;
    getConfig(): ShareConfig;
    getSystemStats(): Promise<SystemStats>;
    private mergeDefaultConfig;
    private buildShareLink;
    private generateShortCode;
    private generateRandomCode;
    private generateHashCode;
    private incrementCode;
    private validateCreateRequest;
    private validateUpdateRequest;
    private isValidUrl;
    private checkRateLimits;
    private applyLinkUpdates;
    private validateAccess;
    private validateRestriction;
    private validateGeoRestriction;
    private validateTimeRestriction;
    private validateDeviceRestriction;
    private validateIPRestriction;
    private validateClickLimit;
    private trackClick;
    private updateLinkAnalytics;
    private trackAttribution;
    private createAccessResult;
    private isUniqueVisitor;
    private generateVisitorId;
    private generateLinkId;
    private generateClickId;
    private generateSessionId;
    private generateOperationId;
    private generateScheduleId;
    private processBulkOperation;
    private createQRCode;
    private fetchUrlPreview;
    private processScheduledShare;
    private generateAnalyticsReport;
    private aggregateAnalyticsReports;
    private aggregateUserAnalytics;
    private getTopDomains;
    private getRecentActivity;
    private getPerformanceMetrics;
}
export interface CreateLinkRequest {
    originalUrl: string;
    title?: string;
    description?: string;
    customSlug?: string;
    domain?: string;
    expires?: Date;
    security?: Partial<LinkSecurity>;
    metadata?: Partial<LinkMetadata>;
    creator: UserInfo;
    team?: TeamInfo;
}
export interface UpdateLinkRequest {
    originalUrl?: string;
    title?: string;
    description?: string;
    expires?: Date;
    status?: LinkStatus;
    security?: Partial<LinkSecurity>;
    metadata?: Partial<LinkMetadata>;
}
export interface AccessContext {
    ipAddress?: string;
    userAgent?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    sessionId?: string;
    fingerprint?: string;
    password?: string;
    user?: UserInfo;
    geo?: GeoLocation;
    device?: DeviceInfo;
    referrer?: ReferrerInfo;
    attribution?: ClickAttribution;
}
export interface AccessValidation {
    allowed: boolean;
    reason?: string;
}
export type AccessResultStatus = 'allowed' | 'not_found' | 'inactive' | 'expired' | 'restricted';
export interface AccessResult {
    status: AccessResultStatus;
    link?: ShareLink;
    message?: string;
    clickEvent?: ClickEvent;
    timestamp: Date;
}
export interface QRCodeOptions {
    size?: number;
    format?: 'png' | 'svg' | 'pdf';
    errorCorrection?: 'low' | 'medium' | 'quartile' | 'high';
    colors?: {
        foreground: string;
        background: string;
    };
    logo?: {
        url: string;
        size: number;
    };
}
export interface QRCodeResult {
    url: string;
    dataUrl: string;
    svg: string;
    size: number;
    format: string;
}
export interface ShareSchedule {
    publishAt: Date;
    timezone: string;
    recurring?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: Date;
    };
}
export interface ScheduledShare {
    id: string;
    request: CreateLinkRequest;
    schedule: ShareSchedule;
    status: 'pending' | 'published' | 'failed' | 'cancelled';
    created: Date;
    publishedAt?: Date;
    error?: string;
}
export interface LinkAnalyticsReport {
    linkId: string;
    timeRange: {,
        start: Date;
        end: Date;
    };
    summary: {,
        totalClicks: number;
        uniqueClicks: number;
        conversionRate: number;
        averageClicksPerDay: number;
    };
    breakdown: {,
        byCountry: Record<string, number>;
        byDevice: Record<string, number>;
        byReferrer: Record<string, number>;
        byHour: Record<string, number>;
    };
    trends: Array<{,
        date: Date;
        clicks: number;
    }>;
    generatedAt: Date;
}
export interface BulkAnalyticsReport {
    totalLinks: number;
    summary: {,
        totalClicks: number;
        uniqueClicks: number;
        conversionRate: number;
        averageClicksPerDay: number;
    };
    topPerformers: Array<{,
        linkId: string;
        clicks: number;
    }>;
    trends: Array<{,
        date: Date;
        clicks: number;
    }>;
    generatedAt: Date;
}
export interface UserAnalyticsReport {
    userId: string;
    totalLinks: number;
    activeLinks: number;
    summary: {,
        totalClicks: number;
        uniqueClicks: number;
        conversionRate: number;
        averageClicksPerDay: number;
    };
    topLinks: Array<{,
        linkId: string;
        clicks: number;
    }>;
    generatedAt: Date;
}
export interface SystemStats {
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    uniqueVisitors: number;
    averageClicksPerLink: number;
    topDomains: Array<{,
        domain: string;
        count: number;
    }>;
    recentActivity: Array<{,
        type: string;
        timestamp: Date;
        data: any;
    }>;
    performanceMetrics: any;
}
declare const _default: {
    DirectLinkSharing: typeof DirectLinkSharing;
};
export default _default;
//# sourceMappingURL=DirectLinkSharing.d.ts.map