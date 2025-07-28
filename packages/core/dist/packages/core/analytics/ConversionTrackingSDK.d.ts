/**
 * Conversion Tracking SDK - Story 30.2 Task 2
 *
 * Client-side tracking SDK that extends Epic 1's AnalyticsClient
 * for comprehensive conversion event tracking and real-time streaming.
 *
 * Features:
 * - Real-time conversion event tracking
 * - Automatic session correlation
 * - Privacy-compliant data collection
 * - Offline event buffering
 * - Cross-device user identification
 * - Event validation and deduplication
 */
import { AnalyticsClient, AnalyticsClientConfig } from './AnalyticsClient';
import { ConversionArchitectureManager, EnhancedConversionEvent, TouchPoint } from './ConversionFunnelArchitecture';
import { SessionTrackingManager } from './SessionTrackingIntegration';
export interface ConversionTrackingConfig extends AnalyticsClientConfig {
    enableRealTimeStreaming: boolean;
    streamingEndpoint: string;
    batchSize: number;
    flushInterval: number;
    respectDoNotTrack: boolean;
    requireExplicitConsent: boolean;
    enableCrossDeviceTracking: boolean;
    enableOfflineBuffering: boolean;
    maxOfflineEvents: number;
    eventValidationRules: EventValidationRule;
    deduplicationWindow: number;
    enableDebugLogging: boolean;
    errorReportingEndpoint?: string;
}
export interface EventValidationRule {
    field: string;
    type: 'required' | 'pattern' | 'range' | 'custom';
    value?: unknown;
    validator?: (value: unknown) => boolean;
    errorMessage: string;
}
export interface QueuedEvent {
    event: EnhancedConversionEvent;
    timestamp: number;
    retryCount: number;
    queuedOffline: boolean;
}
export interface TrackingMetrics {
    eventsTracked: number;
    eventsQueued: number;
    eventsDropped: number;
    streamingLatency: number;
    validationErrors: number;
    duplicatesFiltered: number;
    offlineEvents: number;
    privacyBlockedEvents: number;
}
export interface ConversionContext {
    sessionId: string;
    userId: string;
    deviceId: string;
    timestamp: number;
    touchpoints: TouchPoint;
    privacyConsent: {
        tracking: boolean;
        analytics: boolean;
        personalization: boolean;
        crossDevice: boolean;
    };
    attribution: {
        source: string;
        medium: string;
        campaign?: string;
        content?: string;
        term?: string;
    };
}
export declare class ConversionTrackingSDK extends AnalyticsClient {
    private conversionConfig;
    private conversionArchitecture;
    private sessionManager;
    private eventQueue;
    private offlineBuffer;
    private streamingConnection;
    private flushTimer;
    private isOnline;
    private recentEventHashes;
    private trackingMetrics;
    constructor();
    config: ConversionTrackingConfig;
    conversionArchitecture: ConversionArchitectureManager;
    sessionManager: SessionTrackingManager;
    super(config: any): any;
}
//# sourceMappingURL=ConversionTrackingSDK.d.ts.map