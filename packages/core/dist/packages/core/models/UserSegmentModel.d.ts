/**
 * User Segment Data Model (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive data model for user segmentation
 * providing sophisticated user categorization, behavioral targeting, and
 * dynamic segment management capabilities.
 *
 * Features:
 * - Multi-dimensional user attributes
 * - Behavioral pattern analysis
 * - Dynamic segment rules engine
 * - A/B testing integration
 * - Geographic targeting
 * - Temporal targeting
 * - Cohort analysis
 * - Real-time segment updates
 */
import { z } from 'zod';
export interface UserAttributes {
    userId: string;
    email?: string;
    organizationId?: string;
    parentOrganizationId?: string;
    accountType: 'free' | 'trial' | 'paid' | 'enterprise' | 'beta';
    subscriptionTier: 'basic' | 'pro' | 'premium' | 'enterprise';
    subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending';
    accountAge: number;
    userRole: 'admin' | 'user' | 'viewer' | 'editor' | 'owner';
    permissions: string;
    tags: string;
    customAttributes: Record<string, any>;
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    language?: string;
    locale?: string;
    platform: 'web' | 'mobile' | 'desktop' | 'api';
    deviceType: 'desktop' | 'mobile' | 'tablet';
    operatingSystem?: string;
    browser?: string;
    userAgent?: string;
    registrationDate: Date;
    lastLoginDate?: Date;
    lastActiveDate?: Date;
    totalLogins: number;
    sessionCount: number;
    averageSessionDuration: number;
    featureUsage: Record<string, {}, count>;
    number: any;
    lastUsed: Date;
    frequency: 'never' | 'rare' | 'occasional' | 'frequent' | 'daily';
}
export interface BehaviorEvent {
    eventType: string;
    eventData: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
    userId: string;
    properties: Record<string, any>;
    context: {
        page?: string;
        feature?: string;
        source?: string;
        campaign?: string;
        referrer?: string;
    };
}
export interface SegmentCondition {
    id: string;
    type: 'attribute' | 'behavior' | 'demographic' | 'geographic' | 'temporal' | 'cohort' | 'custom';
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | ;
}
export interface UserSegment {
    id: string;
    name: string;
    description?: string;
    conditions: SegmentCondition;
    joinLogic: 'all' | 'any' | 'complex';
    complexLogicExpression?: string;
    isActive: boolean;
    isDynamic: boolean;
    isPrivate: boolean;
    color: string;
    icon?: string;
    tags: string;
    category: 'behavioral' | 'demographic' | 'geographic' | 'engagement' | ;
}
export interface UserCohort {
    id: string;
    name: string;
    description?: string;
    cohortType: 'acquisition' | 'behavioral' | 'revenue' | 'feature_adoption' | 'custom';
    timeGranularity: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    definitionEvent: BehaviorEvent;
    definitionTimeframe: {
        start: Date;
        end: Date;
    };
    analysisMetric: 'retention' | 'revenue' | 'engagement' | 'conversion' | 'churn';
    analysisWindow: {
        value: number;
        unit: 'days' | 'weeks' | 'months';
    };
    cohortData: Array<{}, cohortPeriod>;
    string: any;
    userCount: number;
    periodData: Array<{}, period>;
    number: any;
    value: number;
    userCount: number;
}
export interface SegmentAnalytics {
    segmentId: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    totalUsers: number;
    newUsers: number;
    churnedUsers: number;
    netGrowth: number;
    growthRate: number;
    averageSessionsPerUser: number;
    averageSessionDuration: number;
    bounceRate: number;
    pageViewsPerSession: number;
    conversionEvents: Record<string, {
        eventCount: number;
        uniqueUsers: number;
        conversionRate: number;
    }>;
    totalRevenue: number;
    averageRevenuePerUser: number;
    customerLifetimeValue: number;
    geographicBreakdown: Record<string, {
        userCount: number;
        percentage: number;
    }>;
    platformBreakdown: Record<string, {
        userCount: number;
        percentage: number;
    }>;
    activityHeatmap: Record<string, number>;
    weeklyPattern: Record<string, number>;
    benchmarkComparison: {
        metric: string;
        segmentValue: number;
        benchmarkValue: number;
        percentageDifference: number;
        significance: 'higher' | 'lower' | 'similar';
    }[];
}
export interface SegmentRule {
    id: string;
    name: string;
    description?: string;
    triggerEvents: string;
    conditions: SegmentCondition;
    actions: SegmentAction;
    executionMode: 'immediate' | 'batch' | 'scheduled';
    batchSize?: number;
    schedule?: string;
    maxExecutionsPerHour: number;
    timeoutMs: number;
    retryPolicy: {
        maxRetries: number;
        backoffStrategy: 'linear' | 'exponential';
        baseDelayMs: number;
    };
    isActive: boolean;
    priority: number;
    createdAt: Date;
    lastExecuted?: Date;
    executionCount: number;
    successRate: number;
    averageExecutionTime: number;
}
export interface SegmentAction {
    id: string;
    type: 'add_to_segment' | 'remove_from_segment' | 'send_notification' | ;
}
export interface SegmentExport {
    id: string;
    segmentId: string;
    format: 'csv' | 'json' | 'parquet' | 'sql';
    includeFields: string;
    filters?: SegmentCondition;
    maxRecords?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    recordCount?: number;
    fileSize?: number;
    expiresAt?: Date;
    requestedBy: string;
    requestedAt: Date;
    completedAt?: Date;
    errorMessage?: string;
}
export declare const UserAttributesSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SegmentConditionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UserSegmentSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare class SegmentUtils {
    /**
    * Evaluate if a user matches segment conditions
    */
    static evaluateUserForSegment(userAttributes: UserAttributes): any;
    segment: UserSegment;
    behaviorHistory?: BehaviorEvent;
}
//# sourceMappingURL=UserSegmentModel.d.ts.map