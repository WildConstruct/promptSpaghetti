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
    };
}
export type ConversionEventType = 'user_signup' | 'email_verified' | 'profile_completed' | 'first_project_created' | 'tutorial_completed' | 'node_created' | 'first_connection_made' | 'first_preview_generated' | 'advanced_feature_used' | 'project_saved' | 'project_shared' | 'daily_active_user' | 'weekly_active_user' | 'session_started' | 'feature_discovered' | 'help_content_viewed' | 'feedback_provided' | 'trial_started' | 'subscription_upgraded' | 'payment_completed' | 'subscription_renewed' | 'subscription_cancelled' | 'template_used' | 'template_shared' | 'export_generated' | 'collaboration_invited' | 'marketplace_visited' | 'category_browsed' | 'template_viewed' | 'template_previewed' | 'template_purchased';
export type ConversionCategory = 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral';
export interface ConversionFunnel {
    id: string;
    name: string;
    description: string;
    steps: ConversionStep;
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
}
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
    trackEvent(type: ConversionEventType): any;
    properties: Record<string, any>;
    value?: number;
}
//# sourceMappingURL=ConversionTracker.d.ts.map