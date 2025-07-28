/**
 * Enhanced Conversion Funnel Architecture - Story 30.2
 *
 * Extends Epic 1's analytics foundation with comprehensive conversion funnel tracking,
 * cross-device user identification, and advanced attribution models.
 *
 * Features:
 * - Multi-touch attribution models
 * - Cross-device user tracking with privacy compliance
 * - Real-time funnel event streaming
 * - Advanced funnel step definitions with conditions
 */
import { ConversionEvent, ConversionFunnel } from './ConversionTracker';
export interface EnhancedConversionEvent extends ConversionEvent {
    deviceFingerprint?: string;
    crossDeviceUserId?: string;
    attributionData: {,
        touchpoints: TouchPoint[];
        primaryAttribution: AttributionModel;
        assistedAttribution: AttributionModel[];
    };
    privacyConsent: {,
        tracking: boolean;
        analytics: boolean;
        personalization: boolean;
        crossDevice: boolean;
    };
    realTimeProcessing: {,
        streamId: string;
        batchId: string;
        processed: boolean;
        latency: number;
    };
}
export interface TouchPoint {
    id: string;
    timestamp: number;
    channel: MarketingChannel;
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    term?: string;
    value?: number;
    position: number;
    influence: number;
}
export type MarketingChannel = 'organic_search' | 'paid_search' | 'social_organic' | 'social_paid' | 'email' | 'direct' | 'referral' | 'display' | 'affiliate' | 'video' | 'content_marketing' | 'marketplace_internal';
export interface AttributionModel {
    name: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven';
    weight: number;
    touchpoint: TouchPoint;
    attribution_value: number;
}
export interface EnhancedConversionFunnel extends ConversionFunnel {
    crossDeviceTracking: boolean;
    attributionWindow: number;
    conversionDefinition: {,
        primaryGoal: ConversionGoal;
        microConversions: ConversionGoal[];
        macroConversions: ConversionGoal[];
    };
    segmentation: {,
        userSegments: UserSegment[];
        cohortDefinitions: CohortDefinition[];
    };
    anomalyDetection: {,
        enabled: boolean;
        thresholds: AnomalyThreshold[];
        alerting: AlertingConfig;
    };
}
export interface ConversionGoal {
    id: string;
    name: string;
    type: 'micro' | 'macro';
    value: number;
    eventPattern: string;
    conditions: Record<string, any>;
    weight: number;
}
export interface UserSegment {
    id: string;
    name: string;
    definition: {,
        rules: SegmentRule[];
        operator: 'AND' | 'OR';
    };
    size: number;
    conversionRate: number;
}
export interface SegmentRule {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
}
export interface CohortDefinition {
    id: string;
    name: string;
    criteriaEvent: string;
    criteriaWindow: number;
    analysisWindow: number;
    retentionPeriods: number[];
}
export interface AnomalyThreshold {
    metric: 'conversion_rate' | 'drop_off_rate' | 'time_to_convert' | 'volume';
    threshold: number;
    direction: 'above' | 'below' | 'change';
    sensitivity: 'low' | 'medium' | 'high';
}
export interface AlertingConfig {
    channels: ('email' | 'slack' | 'webhook' | 'dashboard')[];
    recipients: string[];
    frequency: 'immediate' | 'hourly' | 'daily';
    cooldown: number;
}
export interface CrossDeviceIdentity {
    primaryUserId: string;
    linkedDevices: DeviceIdentity[];
    confidence: number;
    linkingMethod: 'deterministic' | 'probabilistic' | 'hybrid';
    privacyCompliant: boolean;
    dataRetention: {,
        createdAt: number;
        expiresAt: number;
        purpose: string;
    };
}
export interface DeviceIdentity {
    deviceId: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    fingerprint: string;
    firstSeen: number;
    lastSeen: number;
    userAgent: string;
    ipAddress?: string;
    linkedAt: number;
    linkingSignals: LinkingSignal[];
}
export interface LinkingSignal {
    type: 'login' | 'email' | 'phone' | 'behavioral' | 'temporal';
    strength: number;
    timestamp: number;
    metadata: Record<string, any>;
}
export interface FunnelStreamConfig {
    streamName: string;
    batchSize: number;
    flushInterval: number;
    retryPolicy: {,
        maxRetries: number;
        backoffMultiplier: number;
        maxBackoffTime: number;
    };
    deadLetterQueue: {,
        enabled: boolean;
        maxAge: number;
    };
    partitioning: {,
        strategy: 'user_id' | 'session_id' | 'time_based' | 'random';
        partitionCount: number;
    };
}
export interface ConversionPatternInsight {
    pattern: {,
        id: string;
        name: string;
        description: string;
        frequency: number;
        averageValue: number;
    };
    segments: {,
        high_value: UserJourneyPattern;
        high_converting: UserJourneyPattern;
        at_risk: UserJourneyPattern;
    };
    recommendations: {,
        optimization: string[];
        targeting: string[];
        personalization: string[];
    };
}
export interface UserJourneyPattern {
    pattern: string[];
    frequency: number;
    conversionRate: number;
    averageTimeToConvert: number;
    averageValue: number;
    dropOffPoints: string[];
    characteristics: Record<string, any>;
}
/**
 * Enhanced Conversion Architecture Manager
 * Orchestrates all conversion tracking components with privacy compliance
 */
export declare class ConversionArchitectureManager {
    private funnels;
    private crossDeviceIdentities;
    private streamConfigs;
    private privacySettings;
    constructor();
    private initializeDefaultArchitecture;
    private setupPrivacyCompliance;
    /**
     * Create enhanced conversion event with attribution and privacy compliance
     */
    createEnhancedEvent(baseEvent: ConversionEvent, touchpoints: TouchPoint[], privacyConsent: EnhancedConversionEvent['privacyConsent']): EnhancedConversionEvent;
    /**
     * Calculate multi-touch attribution
     */
    private calculateAttribution;
    private calculateFirstTouchAttribution;
    private calculateLastTouchAttribution;
    private calculateLinearAttribution;
    private calculateTimeDecayAttribution;
    private calculatePositionBasedAttribution;
    private selectPrimaryAttribution;
    private generateDeviceFingerprint;
    private getCrossDeviceUserId;
    private generateStreamId;
    private generateBatchId;
    /**
     * Get enhanced funnel configuration
     */
    getEnhancedFunnel(funnelId: string): EnhancedConversionFunnel | null;
    /**
     * Get cross-device identity for user
     */
    getCrossDeviceIdentity(userId: string): CrossDeviceIdentity | null;
    /**
     * Create cross-device identity link
     */
    linkDeviceIdentity(userId: string, deviceIdentity: DeviceIdentity, linkingSignals: LinkingSignal[]): boolean;
    private calculateLinkingConfidence;
    private getSignalWeight;
    /**
     * Analyze conversion patterns and generate insights
     */
    analyzeConversionPatterns(funnelId: string): ConversionPatternInsight | null;
}
export declare const conversionArchitecture: ConversionArchitectureManager;
export default conversionArchitecture;
//# sourceMappingURL=ConversionFunnelArchitecture.d.ts.map