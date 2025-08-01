/**
 * Session Tracking Integration - Story 30.2 Task 1
 *
 * Integrates with Epic 1 analytics infrastructure to provide comprehensive
 * session tracking for conversion funnel analysis with privacy compliance.
 *
 * Features:
 * - Cross-device session correlation
 * - Session lifecycle management
 * - Privacy-compliant session storage
 * - Integration with existing AnalyticsClient
 */
import { AnalyticsClient } from './AnalyticsClient';
import { ConversionArchitectureManager } from './ConversionFunnelArchitecture';

}
}
export interface EnhancedSession { sessionId: string;
    userId: string;
    deviceId: string;
    startTime: number;
    lastActivity: number;
    endTime?: number;
    duration?: number;
    crossDeviceSessionId?: string;
    linkedSessions: string[];
    referrer: string;
    initialPage: string;
    userAgent: string;
    ipHash: string;
    location?: {
        country?: string;
        region?: string;
        city?: string }
}
    };
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    pageViews: number;
    events: number;
    conversionEvents: number;
    bounced: boolean;
    engaged: boolean;
    trackingConsent: boolean;
    analyticsConsent: boolean;
    personalizationConsent: boolean;
    crossDeviceConsent: boolean;
    viewport: { width: number;
        height: number };
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;

}
}
export interface SessionEvent { sessionId: string;
    timestamp: number;
    type: SessionEventType;
    page?: string;
    properties: Record<string, any>;

export type SessionEventType = 'session_start' | 'session_end' | 'page_view' | 'engagement' | 'conversion' | 'cross_device_link' | 'consent_update' }
}
}
export interface SessionAnalytics { totalSessions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    averagePagesPerSession: number;
    bounceRate: number;
    conversionRate: number;
    crossDeviceUsers: number;
    sessionsWithConsent: number;
    deviceBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    conversionsBySource: Record<string, number>;
    hourlyDistribution: number[];
    dailyDistribution: number[];
    commonPaths: Array<{
        path: string[];
        frequency: number;
        conversionRate: number }
}
    }>;
    dropoffPoints: Array<{ page: string;
        dropoffRate: number;
        recoverableUsers: number }>;
/**
 * Enhanced Session Tracking Manager
 * Integrates with Epic 1 AnalyticsClient for comprehensive session management
 */
export declare class SessionTrackingManager { private analyticsClient;
    private conversionArchitecture;
    private currentSession;
    private sessionStorage;
    private sessionEvents;
    private sessionTimeout;
    private heartbeatInterval;
    private heartbeatTimer?;
    private privacyConfig;
    constructor(analyticsClient: AnalyticsClient, conversionArchitecture: ConversionArchitectureManager);
    private initializeSessionTracking;
    private startNewSession;
    private getConsentPreferences;
    private getDeviceInfo;
    private getAttributionData;
    private getLocationData;
    private attemptCrossDeviceLinking;
    private checkForRecentLogin;
    private checkBehavioralSignals;
    private generateBehavioralFingerprint;
    private generateBehavioralFingerprintFromSession;
    private calculateBehavioralSimilarity;
    private calculateLinkingConfidence;
    /**
     * Track page view
     */
    trackPageView(page: string, properties?: Record<string, any>): void;
    /**
     * Track conversion event
     */
    trackConversionEvent(eventType: string, value?: number, properties?: Record<string, any>): void;
    /**
     * Update consent preferences
     */
    updateConsentPreferences(consent: {)
        trackingConsent?: boolean;
        analyticsConsent?: boolean;
        personalizationConsent?: boolean;
        crossDeviceConsent?: boolean }): void;
    /**
     * End current session
     */
    endSession(): void;
    /**
     * Get current session analytics
     */
    getCurrentSessionAnalytics(): Partial<SessionAnalytics>;
    private setupHeartbeat;
    private bindVisibilityEvents;
    private trackSessionEvent;
    private updateLastActivity;
    private saveSessionToStorage;
    private getStoredSession;
    private isSessionValid;
    private getRecentSessionsFromStorage;
    private sendSessionAnalytics;
    private generateSessionId;
    private getCurrentUserId;
    private getDeviceId;
    private getCrossDeviceSessionId;
    private getHashedIP;
    private generateDeviceFingerprint;

export declare const createSessionTrackingManager: (analyticsClient: AnalyticsClient, conversionArchitecture: ConversionArchitectureManager) => SessionTrackingManager;
export default SessionTrackingManager;
//# sourceMappingURL=SessionTrackingIntegration.d.ts.map