/**
 * Conversion Tracking System - E17-1753114397422-300202
 *
 * Comprehensive conversion tracking for Wild Construct platform
 * focusing on user engagement, creative workflow completion, and business metrics.
 *
 * Features:
 * - Multi-funnel conversion tracking
 * - Real-time event streaming
 * - A/B testing integration
 * - Revenue attribution
 * - User journey analytics
 */

}
export interface ConversionEvent {
    id: string;
    userId: string;
    sessionId: string;
    timestamp: number;
    type: ConversionEventType;
    category: ConversionCategory;
    value?: number;
    properties: Record<string, unknown>;
    metadata: {
        userAgent: string;
        referrer: string;
        campaignSource?: string;
        experimentGroup?: string;
}
    };

export type ConversionEventType = 'user_signup' | 'email_verified' | 'profile_completed' | 'first_project_created' | 'tutorial_completed' | 'node_created' | 'first_connection_made' | 'first_preview_generated' | 'advanced_feature_used' | 'project_saved' | 'project_shared' | 'daily_active_user' | 'weekly_active_user' | 'session_started' | 'feature_discovered' | 'help_content_viewed' | 'feedback_provided' | 'trial_started' | 'subscription_upgraded' | 'payment_completed' | 'subscription_renewed' | 'subscription_cancelled' | 'template_used' | 'template_shared' | 'export_generated' | 'collaboration_invited' | 'marketplace_visited' | 'category_browsed' | 'template_viewed' | 'template_previewed' | 'template_purchased';
export type ConversionCategory = 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral';

}
export interface ConversionFunnel {
    id: string;
    name: string;
    description: string;
    steps: ConversionStep[];
    timeWindow: number;
    category: ConversionCategory;

}
export interface ConversionStep {
    id: string;
    name: string;
    eventType: ConversionEventType;
    required: boolean;
    conditions?: Record<string, any>;
    timeout?: number;

}
export interface ConversionMetrics {
    funnel: string;
    period: {
        start: number;
        end: number;
}
    };
    metrics: {
        totalUsers: number;
        conversions: number;
        conversionRate: number;
        averageTimeToConvert: number;
        dropoffPoints: {
            step: string;
            dropoffRate: number;
            users: number;
        }[];
    };
    segmentBreakdown: {
        [segment: string]: {
            users: number;
            conversions: number;
            rate: number;
        };
    };

export declare class ConversionTracker {
    private events;
    private funnels;
    private userSessions;
    private eventListeners;
    private analyticsEndpoint;
    private batchSize;
    private flushInterval;
    private pendingEvents;
    constructor();
    private initializeDefaultFunnels;
    /**
     * Track a conversion event
     */
    trackEvent(type: ConversionEventType, properties?: Record<string, any>, value?: number): void;
    /**
     * Track director-specific creative workflow events
     */
    trackDirectorWorkflow(action: string, context?: Record<string, any>): void;
    /**
     * Track user engagement events
     */
    trackEngagement();
      engagementType: 'feature_usage' | 'help_interaction' | 'collaboration' | 'content_creation',
      details?: Record<string,
      any>
    ): void;
    /**
     * Track business conversion events
     */
    trackBusinessEvent();
      eventType: 'trial_started' | 'subscription_upgraded' | 'payment_completed' | 'subscription_cancelled',
      value: number,
      metadata?: Record<string,
      any>
    ): void;
    /**
     * Get conversion metrics for a specific funnel
     */
    getFunnelMetrics(funnelId: string, startTime: number, endTime: number): ConversionMetrics | null;
    /**
     * Get real-time conversion dashboard data
     */
    getDashboardData(): {
        realTimeMetrics: {
            activeUsers: number;
            conversionsLast24h: number;
            topConvertingFunnel: string;
            averageSessionDuration: number;
        };
        funnelPerformance: {
            [funnelId: string]: {
                conversionRate: number;
                trend: 'up' | 'down' | 'stable';
                completions24h: number;
            };
        };
        recentEvents: ConversionEvent[];
    };
    /**
     * A/B testing integration
     */
    trackExperimentConversion();
      experimentId: string,
      variantId: string,
      eventType: ConversionEventType,
      properties?: Record<string,
      any>
    ): void;
    /**
     * Add event listener for real-time tracking
     */
    addEventListener(eventType: ConversionEventType, callback: (event: ConversionEvent) => void): void;
    /**
     * Remove event listener
     */
    removeEventListener(eventType: ConversionEventType, callback: (event: ConversionEvent) => void): void;
    private generateEventId;
    private getCurrentUserId;
    private getCurrentSessionId;
    private getCategoryForEventType;
    private getCampaignSource;
    private getExperimentGroup;
    private getSessionDuration;
    private triggerEventListeners;
    private checkFunnelProgress;
    private analyzeFunnelProgression;
    private calculateSegmentBreakdown;
    private calculateSessionDurations;
    private flushEvents;
    private startEventFlushing;

export declare const conversionTracker: ConversionTracker;
export default conversionTracker;
//# sourceMappingURL=ConversionTracker.d.ts.map