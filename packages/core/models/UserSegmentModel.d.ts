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
    permissions: string[];
    tags: string[];
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
    featureUsage: Record<string, {
        count: number;
        lastUsed: Date;
        frequency: 'never' | 'rare' | 'occasional' | 'frequent' | 'daily';
    }>;
    clickThroughRates: Record<string, number>;
    conversionRates: Record<string, number>;
    engagementScore: number;
    churnRisk: 'low' | 'medium' | 'high' | 'critical';
    customerLifetimeValue: number;
    monthlyRecurringRevenue: number;
    totalSpent: number;
    paymentMethod?: string;
    billingCycle?: 'monthly' | 'yearly' | 'custom';
    experimentGroups: Record<string, string>;
    abTestParticipation: string[];
    betaFeatures: string[];
    riskOfChurn: number;
    upsellProbability: number;
    supportTicketCount: number;
    lastSupportInteraction?: Date;
    npsScore?: number;
    healthScore: number;
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
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'regex' | 'exists' | 'not_exists' | 'between' | 'not_between' | 'within_days' | 'not_within_days' | 'relative_to_now' | 'percentile' | 'moving_average' | 'trend_up' | 'trend_down' | 'custom_function';
    value: any;
    logicalOperator?: 'AND' | 'OR' | 'NOT';
    weight: number;
    isEnabled: boolean;
    timeWindow?: {
        value: number;
        unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    };
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct' | 'percentile';
    threshold?: number;
    comparison?: 'absolute' | 'relative' | 'percentile';
    description?: string;
    lastEvaluated?: Date;
    evaluationCount: number;
    matchRate: number;
}
export interface UserSegment {
    id: string;
    name: string;
    description?: string;
    conditions: SegmentCondition[];
    joinLogic: 'all' | 'any' | 'complex';
    complexLogicExpression?: string;
    isActive: boolean;
    isDynamic: boolean;
    isPrivate: boolean;
    color: string;
    icon?: string;
    tags: string[];
    category: 'behavioral' | 'demographic' | 'geographic' | 'engagement' | 'revenue' | 'lifecycle' | 'experimental' | 'custom';
    userCount: number;
    estimatedUserCount?: number;
    userCountHistory: Array<{
        date: Date;
        count: number;
    }>;
    conversionRate?: number;
    averageLifetimeValue?: number;
    churnRate?: number;
    engagementScore?: number;
    evaluationFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
    lastEvaluated?: Date;
    nextEvaluation?: Date;
    createdBy: string;
    createdAt: Date;
    lastModifiedBy: string;
    lastModifiedAt: Date;
    accessLevel: 'public' | 'team' | 'organization' | 'private';
    allowedUsers: string[];
    allowedRoles: string[];
    syncToExternalSystems: boolean;
    externalSystemMappings: Record<string, {
        systemId: string;
        segmentId: string;
        lastSync?: Date;
        syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
    }>;
    validationRules: Array<{
        rule: string;
        description: string;
        isRequired: boolean;
    }>;
    qualityScore: number;
    parentSegmentId?: string;
    childSegmentIds: string[];
    dependencies: string[];
    treatmentVariants?: Record<string, {
        name: string;
        allocation: number;
        isControl: boolean;
    }>;
    schedule?: {
        startDate?: Date;
        endDate?: Date;
        activeDays: number[];
        activeHours: {
            start: string;
            end: string;
            timezone: string;
        };
    };
    insights: Array<{
        type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
        title: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
        actionable: boolean;
        generatedAt: Date;
    }>;
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
    cohortData: Array<{
        cohortPeriod: string;
        userCount: number;
        periodData: Array<{
            period: number;
            value: number;
            userCount: number;
        }>;
    }>;
    createdAt: Date;
    lastCalculated: Date;
    calculationStatus: 'pending' | 'calculating' | 'completed' | 'failed';
    isActive: boolean;
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
    triggerEvents: string[];
    conditions: SegmentCondition[];
    actions: SegmentAction[];
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
    type: 'add_to_segment' | 'remove_from_segment' | 'send_notification' | 'trigger_webhook' | 'update_attribute' | 'log_event' | 'custom';
    parameters: Record<string, any>;
    conditions?: SegmentCondition[];
    onError: 'ignore' | 'retry' | 'fail_rule';
    executionCount: number;
    successCount: number;
    lastExecuted?: Date;
}
export interface SegmentExport {
    id: string;
    segmentId: string;
    format: 'csv' | 'json' | 'parquet' | 'sql';
    includeFields: string[];
    filters?: SegmentCondition[];
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
export declare const UserAttributesSchema: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    parentOrganizationId: z.ZodOptional<z.ZodString>;
    accountType: z.ZodEnum<["free", "trial", "paid", "enterprise", "beta"]>;
    subscriptionTier: z.ZodEnum<["basic", "pro", "premium", "enterprise"]>;
    subscriptionStatus: z.ZodEnum<["active", "inactive", "cancelled", "expired", "pending"]>;
    accountAge: z.ZodNumber;
    userRole: z.ZodEnum<["admin", "user", "viewer", "editor", "owner"]>;
    permissions: z.ZodArray<z.ZodString, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
    customAttributes: z.ZodRecord<z.ZodString, z.ZodAny>;
    country: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
    platform: z.ZodEnum<["web", "mobile", "desktop", "api"]>;
    deviceType: z.ZodEnum<["desktop", "mobile", "tablet"]>;
    operatingSystem: z.ZodOptional<z.ZodString>;
    browser: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    registrationDate: z.ZodDate;
    lastLoginDate: z.ZodOptional<z.ZodDate>;
    lastActiveDate: z.ZodOptional<z.ZodDate>;
    totalLogins: z.ZodNumber;
    sessionCount: z.ZodNumber;
    averageSessionDuration: z.ZodNumber;
    featureUsage: z.ZodRecord<z.ZodString, z.ZodObject<{
        count: z.ZodNumber;
        lastUsed: z.ZodDate;
        frequency: z.ZodEnum<["never", "rare", "occasional", "frequent", "daily"]>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
        lastUsed: Date;
    }, {
        count: number;
        frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
        lastUsed: Date;
    }>>;
    clickThroughRates: z.ZodRecord<z.ZodString, z.ZodNumber>;
    conversionRates: z.ZodRecord<z.ZodString, z.ZodNumber>;
    engagementScore: z.ZodNumber;
    churnRisk: z.ZodEnum<["low", "medium", "high", "critical"]>;
    customerLifetimeValue: z.ZodNumber;
    monthlyRecurringRevenue: z.ZodNumber;
    totalSpent: z.ZodNumber;
    paymentMethod: z.ZodOptional<z.ZodString>;
    billingCycle: z.ZodOptional<z.ZodEnum<["monthly", "yearly", "custom"]>>;
    experimentGroups: z.ZodRecord<z.ZodString, z.ZodString>;
    abTestParticipation: z.ZodArray<z.ZodString, "many">;
    betaFeatures: z.ZodArray<z.ZodString, "many">;
    riskOfChurn: z.ZodNumber;
    upsellProbability: z.ZodNumber;
    supportTicketCount: z.ZodNumber;
    lastSupportInteraction: z.ZodOptional<z.ZodDate>;
    npsScore: z.ZodOptional<z.ZodNumber>;
    healthScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    userId: string;
    permissions: string[];
    userRole: "admin" | "user" | "editor" | "owner" | "viewer";
    platform: "mobile" | "web" | "desktop" | "api";
    deviceType: "mobile" | "desktop" | "tablet";
    conversionRates: Record<string, number>;
    churnRisk: "low" | "medium" | "high" | "critical";
    registrationDate: Date;
    averageSessionDuration: number;
    engagementScore: number;
    accountType: "free" | "enterprise" | "paid" | "trial" | "beta";
    subscriptionTier: "basic" | "premium" | "enterprise" | "pro";
    subscriptionStatus: "active" | "inactive" | "expired" | "pending" | "cancelled";
    accountAge: number;
    customAttributes: Record<string, any>;
    totalLogins: number;
    sessionCount: number;
    featureUsage: Record<string, {
        count: number;
        frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
        lastUsed: Date;
    }>;
    clickThroughRates: Record<string, number>;
    customerLifetimeValue: number;
    monthlyRecurringRevenue: number;
    totalSpent: number;
    experimentGroups: Record<string, string>;
    abTestParticipation: string[];
    betaFeatures: string[];
    riskOfChurn: number;
    upsellProbability: number;
    supportTicketCount: number;
    healthScore: number;
    email?: string | undefined;
    region?: string | undefined;
    country?: string | undefined;
    browser?: string | undefined;
    language?: string | undefined;
    userAgent?: string | undefined;
    organizationId?: string | undefined;
    paymentMethod?: string | undefined;
    city?: string | undefined;
    timezone?: string | undefined;
    parentOrganizationId?: string | undefined;
    locale?: string | undefined;
    operatingSystem?: string | undefined;
    lastLoginDate?: Date | undefined;
    lastActiveDate?: Date | undefined;
    billingCycle?: "custom" | "monthly" | "yearly" | undefined;
    lastSupportInteraction?: Date | undefined;
    npsScore?: number | undefined;
}, {
    tags: string[];
    userId: string;
    permissions: string[];
    userRole: "admin" | "user" | "editor" | "owner" | "viewer";
    platform: "mobile" | "web" | "desktop" | "api";
    deviceType: "mobile" | "desktop" | "tablet";
    conversionRates: Record<string, number>;
    churnRisk: "low" | "medium" | "high" | "critical";
    registrationDate: Date;
    averageSessionDuration: number;
    engagementScore: number;
    accountType: "free" | "enterprise" | "paid" | "trial" | "beta";
    subscriptionTier: "basic" | "premium" | "enterprise" | "pro";
    subscriptionStatus: "active" | "inactive" | "expired" | "pending" | "cancelled";
    accountAge: number;
    customAttributes: Record<string, any>;
    totalLogins: number;
    sessionCount: number;
    featureUsage: Record<string, {
        count: number;
        frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
        lastUsed: Date;
    }>;
    clickThroughRates: Record<string, number>;
    customerLifetimeValue: number;
    monthlyRecurringRevenue: number;
    totalSpent: number;
    experimentGroups: Record<string, string>;
    abTestParticipation: string[];
    betaFeatures: string[];
    riskOfChurn: number;
    upsellProbability: number;
    supportTicketCount: number;
    healthScore: number;
    email?: string | undefined;
    region?: string | undefined;
    country?: string | undefined;
    browser?: string | undefined;
    language?: string | undefined;
    userAgent?: string | undefined;
    organizationId?: string | undefined;
    paymentMethod?: string | undefined;
    city?: string | undefined;
    timezone?: string | undefined;
    parentOrganizationId?: string | undefined;
    locale?: string | undefined;
    operatingSystem?: string | undefined;
    lastLoginDate?: Date | undefined;
    lastActiveDate?: Date | undefined;
    billingCycle?: "custom" | "monthly" | "yearly" | undefined;
    lastSupportInteraction?: Date | undefined;
    npsScore?: number | undefined;
}>;
export declare const SegmentConditionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["attribute", "behavior", "demographic", "geographic", "temporal", "cohort", "custom"]>;
    field: z.ZodString;
    operator: z.ZodEnum<["equals", "not_equals", "in", "not_in", "greater_than", "less_than", "greater_equal", "less_equal", "contains", "not_contains", "starts_with", "ends_with", "regex", "exists", "not_exists", "between", "not_between", "within_days", "not_within_days", "relative_to_now", "percentile", "moving_average", "trend_up", "trend_down", "custom_function"]>;
    value: z.ZodAny;
    logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR", "NOT"]>>;
    weight: z.ZodDefault<z.ZodNumber>;
    isEnabled: z.ZodDefault<z.ZodBoolean>;
    timeWindow: z.ZodOptional<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodEnum<["minutes", "hours", "days", "weeks", "months"]>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: "days" | "minutes" | "hours" | "weeks" | "months";
    }, {
        value: number;
        unit: "days" | "minutes" | "hours" | "weeks" | "months";
    }>>;
    aggregation: z.ZodOptional<z.ZodEnum<["sum", "avg", "count", "min", "max", "distinct", "percentile"]>>;
    threshold: z.ZodOptional<z.ZodNumber>;
    comparison: z.ZodOptional<z.ZodEnum<["absolute", "relative", "percentile"]>>;
    description: z.ZodOptional<z.ZodString>;
    lastEvaluated: z.ZodOptional<z.ZodDate>;
    evaluationCount: z.ZodDefault<z.ZodNumber>;
    matchRate: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    isEnabled: boolean;
    type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
    weight: number;
    operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
    field: string;
    evaluationCount: number;
    matchRate: number;
    description?: string | undefined;
    value?: any;
    comparison?: "relative" | "absolute" | "percentile" | undefined;
    threshold?: number | undefined;
    aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
    timeWindow?: {
        value: number;
        unit: "days" | "minutes" | "hours" | "weeks" | "months";
    } | undefined;
    logicalOperator?: "AND" | "OR" | "NOT" | undefined;
    lastEvaluated?: Date | undefined;
}, {
    id: string;
    type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
    operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
    field: string;
    description?: string | undefined;
    isEnabled?: boolean | undefined;
    value?: any;
    weight?: number | undefined;
    comparison?: "relative" | "absolute" | "percentile" | undefined;
    threshold?: number | undefined;
    aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
    timeWindow?: {
        value: number;
        unit: "days" | "minutes" | "hours" | "weeks" | "months";
    } | undefined;
    logicalOperator?: "AND" | "OR" | "NOT" | undefined;
    lastEvaluated?: Date | undefined;
    evaluationCount?: number | undefined;
    matchRate?: number | undefined;
}>;
export declare const UserSegmentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    conditions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["attribute", "behavior", "demographic", "geographic", "temporal", "cohort", "custom"]>;
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "in", "not_in", "greater_than", "less_than", "greater_equal", "less_equal", "contains", "not_contains", "starts_with", "ends_with", "regex", "exists", "not_exists", "between", "not_between", "within_days", "not_within_days", "relative_to_now", "percentile", "moving_average", "trend_up", "trend_down", "custom_function"]>;
        value: z.ZodAny;
        logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR", "NOT"]>>;
        weight: z.ZodDefault<z.ZodNumber>;
        isEnabled: z.ZodDefault<z.ZodBoolean>;
        timeWindow: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodEnum<["minutes", "hours", "days", "weeks", "months"]>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        }, {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        }>>;
        aggregation: z.ZodOptional<z.ZodEnum<["sum", "avg", "count", "min", "max", "distinct", "percentile"]>>;
        threshold: z.ZodOptional<z.ZodNumber>;
        comparison: z.ZodOptional<z.ZodEnum<["absolute", "relative", "percentile"]>>;
        description: z.ZodOptional<z.ZodString>;
        lastEvaluated: z.ZodOptional<z.ZodDate>;
        evaluationCount: z.ZodDefault<z.ZodNumber>;
        matchRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        isEnabled: boolean;
        type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
        weight: number;
        operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
        field: string;
        evaluationCount: number;
        matchRate: number;
        description?: string | undefined;
        value?: any;
        comparison?: "relative" | "absolute" | "percentile" | undefined;
        threshold?: number | undefined;
        aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
        timeWindow?: {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        } | undefined;
        logicalOperator?: "AND" | "OR" | "NOT" | undefined;
        lastEvaluated?: Date | undefined;
    }, {
        id: string;
        type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
        operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
        field: string;
        description?: string | undefined;
        isEnabled?: boolean | undefined;
        value?: any;
        weight?: number | undefined;
        comparison?: "relative" | "absolute" | "percentile" | undefined;
        threshold?: number | undefined;
        aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
        timeWindow?: {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        } | undefined;
        logicalOperator?: "AND" | "OR" | "NOT" | undefined;
        lastEvaluated?: Date | undefined;
        evaluationCount?: number | undefined;
        matchRate?: number | undefined;
    }>, "many">;
    joinLogic: z.ZodDefault<z.ZodEnum<["all", "any", "complex"]>>;
    complexLogicExpression: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isDynamic: z.ZodDefault<z.ZodBoolean>;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    color: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    tags: z.ZodArray<z.ZodString, "many">;
    category: z.ZodEnum<["behavioral", "demographic", "geographic", "engagement", "revenue", "lifecycle", "experimental", "custom"]>;
    userCount: z.ZodNumber;
    estimatedUserCount: z.ZodOptional<z.ZodNumber>;
    userCountHistory: z.ZodArray<z.ZodObject<{
        date: z.ZodDate;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: Date;
        count: number;
    }, {
        date: Date;
        count: number;
    }>, "many">;
    conversionRate: z.ZodOptional<z.ZodNumber>;
    averageLifetimeValue: z.ZodOptional<z.ZodNumber>;
    churnRate: z.ZodOptional<z.ZodNumber>;
    engagementScore: z.ZodOptional<z.ZodNumber>;
    evaluationFrequency: z.ZodDefault<z.ZodEnum<["realtime", "hourly", "daily", "weekly", "manual"]>>;
    lastEvaluated: z.ZodOptional<z.ZodDate>;
    nextEvaluation: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    lastModifiedBy: z.ZodString;
    lastModifiedAt: z.ZodDate;
    accessLevel: z.ZodDefault<z.ZodEnum<["public", "team", "organization", "private"]>>;
    allowedUsers: z.ZodArray<z.ZodString, "many">;
    allowedRoles: z.ZodArray<z.ZodString, "many">;
    syncToExternalSystems: z.ZodDefault<z.ZodBoolean>;
    externalSystemMappings: z.ZodRecord<z.ZodString, z.ZodObject<{
        systemId: z.ZodString;
        segmentId: z.ZodString;
        lastSync: z.ZodOptional<z.ZodDate>;
        syncStatus: z.ZodDefault<z.ZodEnum<["pending", "syncing", "synced", "failed"]>>;
    }, "strip", z.ZodTypeAny, {
        systemId: string;
        segmentId: string;
        syncStatus: "pending" | "failed" | "synced" | "syncing";
        lastSync?: Date | undefined;
    }, {
        systemId: string;
        segmentId: string;
        lastSync?: Date | undefined;
        syncStatus?: "pending" | "failed" | "synced" | "syncing" | undefined;
    }>>;
    validationRules: z.ZodArray<z.ZodObject<{
        rule: z.ZodString;
        description: z.ZodString;
        isRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        rule: string;
        isRequired: boolean;
    }, {
        description: string;
        rule: string;
        isRequired?: boolean | undefined;
    }>, "many">;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    parentSegmentId: z.ZodOptional<z.ZodString>;
    childSegmentIds: z.ZodArray<z.ZodString, "many">;
    dependencies: z.ZodArray<z.ZodString, "many">;
    treatmentVariants: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        name: z.ZodString;
        allocation: z.ZodNumber;
        isControl: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        allocation: number;
        isControl: boolean;
    }, {
        name: string;
        allocation: number;
        isControl?: boolean | undefined;
    }>>>;
    schedule: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodOptional<z.ZodDate>;
        endDate: z.ZodOptional<z.ZodDate>;
        activeDays: z.ZodArray<z.ZodNumber, "many">;
        activeHours: z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
            timezone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
            timezone: string;
        }, {
            start: string;
            end: string;
            timezone: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        activeDays: number[];
        activeHours: {
            start: string;
            end: string;
            timezone: string;
        };
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    }, {
        activeDays: number[];
        activeHours: {
            start: string;
            end: string;
            timezone: string;
        };
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    }>>;
    insights: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["trend", "anomaly", "opportunity", "risk"]>;
        title: z.ZodString;
        description: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high"]>;
        actionable: z.ZodBoolean;
        generatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "anomaly" | "trend" | "opportunity" | "risk";
        title: string;
        severity: "low" | "medium" | "high";
        generatedAt: Date;
        actionable: boolean;
    }, {
        description: string;
        type: "anomaly" | "trend" | "opportunity" | "risk";
        title: string;
        severity: "low" | "medium" | "high";
        generatedAt: Date;
        actionable: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    name: string;
    isActive: boolean;
    category: "custom" | "experimental" | "lifecycle" | "revenue" | "engagement" | "behavioral" | "demographic" | "geographic";
    tags: string[];
    color: string;
    conditions: {
        id: string;
        isEnabled: boolean;
        type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
        weight: number;
        operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
        field: string;
        evaluationCount: number;
        matchRate: number;
        description?: string | undefined;
        value?: any;
        comparison?: "relative" | "absolute" | "percentile" | undefined;
        threshold?: number | undefined;
        aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
        timeWindow?: {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        } | undefined;
        logicalOperator?: "AND" | "OR" | "NOT" | undefined;
        lastEvaluated?: Date | undefined;
    }[];
    dependencies: string[];
    insights: {
        description: string;
        type: "anomaly" | "trend" | "opportunity" | "risk";
        title: string;
        severity: "low" | "medium" | "high";
        generatedAt: Date;
        actionable: boolean;
    }[];
    createdBy: string;
    qualityScore: number;
    userCount: number;
    joinLogic: "complex" | "all" | "any";
    isDynamic: boolean;
    isPrivate: boolean;
    userCountHistory: {
        date: Date;
        count: number;
    }[];
    evaluationFrequency: "manual" | "daily" | "weekly" | "hourly" | "realtime";
    lastModifiedBy: string;
    lastModifiedAt: Date;
    accessLevel: "private" | "public" | "organization" | "team";
    allowedUsers: string[];
    allowedRoles: string[];
    syncToExternalSystems: boolean;
    externalSystemMappings: Record<string, {
        systemId: string;
        segmentId: string;
        syncStatus: "pending" | "failed" | "synced" | "syncing";
        lastSync?: Date | undefined;
    }>;
    validationRules: {
        description: string;
        rule: string;
        isRequired: boolean;
    }[];
    childSegmentIds: string[];
    description?: string | undefined;
    icon?: string | undefined;
    churnRate?: number | undefined;
    averageLifetimeValue?: number | undefined;
    conversionRate?: number | undefined;
    schedule?: {
        activeDays: number[];
        activeHours: {
            start: string;
            end: string;
            timezone: string;
        };
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    } | undefined;
    engagementScore?: number | undefined;
    lastEvaluated?: Date | undefined;
    complexLogicExpression?: string | undefined;
    estimatedUserCount?: number | undefined;
    nextEvaluation?: Date | undefined;
    parentSegmentId?: string | undefined;
    treatmentVariants?: Record<string, {
        name: string;
        allocation: number;
        isControl: boolean;
    }> | undefined;
}, {
    id: string;
    createdAt: Date;
    name: string;
    category: "custom" | "experimental" | "lifecycle" | "revenue" | "engagement" | "behavioral" | "demographic" | "geographic";
    tags: string[];
    color: string;
    conditions: {
        id: string;
        type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
        operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
        field: string;
        description?: string | undefined;
        isEnabled?: boolean | undefined;
        value?: any;
        weight?: number | undefined;
        comparison?: "relative" | "absolute" | "percentile" | undefined;
        threshold?: number | undefined;
        aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
        timeWindow?: {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        } | undefined;
        logicalOperator?: "AND" | "OR" | "NOT" | undefined;
        lastEvaluated?: Date | undefined;
        evaluationCount?: number | undefined;
        matchRate?: number | undefined;
    }[];
    dependencies: string[];
    insights: {
        description: string;
        type: "anomaly" | "trend" | "opportunity" | "risk";
        title: string;
        severity: "low" | "medium" | "high";
        generatedAt: Date;
        actionable: boolean;
    }[];
    createdBy: string;
    userCount: number;
    userCountHistory: {
        date: Date;
        count: number;
    }[];
    lastModifiedBy: string;
    lastModifiedAt: Date;
    allowedUsers: string[];
    allowedRoles: string[];
    externalSystemMappings: Record<string, {
        systemId: string;
        segmentId: string;
        lastSync?: Date | undefined;
        syncStatus?: "pending" | "failed" | "synced" | "syncing" | undefined;
    }>;
    validationRules: {
        description: string;
        rule: string;
        isRequired?: boolean | undefined;
    }[];
    childSegmentIds: string[];
    description?: string | undefined;
    isActive?: boolean | undefined;
    icon?: string | undefined;
    churnRate?: number | undefined;
    averageLifetimeValue?: number | undefined;
    conversionRate?: number | undefined;
    schedule?: {
        activeDays: number[];
        activeHours: {
            start: string;
            end: string;
            timezone: string;
        };
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    } | undefined;
    qualityScore?: number | undefined;
    engagementScore?: number | undefined;
    lastEvaluated?: Date | undefined;
    joinLogic?: "complex" | "all" | "any" | undefined;
    complexLogicExpression?: string | undefined;
    isDynamic?: boolean | undefined;
    isPrivate?: boolean | undefined;
    estimatedUserCount?: number | undefined;
    evaluationFrequency?: "manual" | "daily" | "weekly" | "hourly" | "realtime" | undefined;
    nextEvaluation?: Date | undefined;
    accessLevel?: "private" | "public" | "organization" | "team" | undefined;
    syncToExternalSystems?: boolean | undefined;
    parentSegmentId?: string | undefined;
    treatmentVariants?: Record<string, {
        name: string;
        allocation: number;
        isControl?: boolean | undefined;
    }> | undefined;
}>;
export declare class SegmentUtils {
    /**
     * Evaluate if a user matches segment conditions
     */
    static evaluateUserForSegment(
      userAttributes: UserAttributes,
      segment: UserSegment,
      behaviorHistory?: BehaviorEvent[]
    ): {
        matches: boolean;
        matchingConditions: string[];
        score: number;
    };
    /**
     * Evaluate a single condition against user attributes
     */
    private static evaluateCondition;
    /**
     * Get field value from user attributes or behavior history
     */
    private static getFieldValue;
    /**
     * Evaluate complex boolean logic expressions
     */
    private static evaluateComplexLogic;
    /**
     * Generate segment insights
     */
    static generateSegmentInsights(segment: UserSegment, analytics: SegmentAnalytics): UserSegment['insights'];
}
declare const _default: {
    UserAttributesSchema: z.ZodObject<{
        userId: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        organizationId: z.ZodOptional<z.ZodString>;
        parentOrganizationId: z.ZodOptional<z.ZodString>;
        accountType: z.ZodEnum<["free", "trial", "paid", "enterprise", "beta"]>;
        subscriptionTier: z.ZodEnum<["basic", "pro", "premium", "enterprise"]>;
        subscriptionStatus: z.ZodEnum<["active", "inactive", "cancelled", "expired", "pending"]>;
        accountAge: z.ZodNumber;
        userRole: z.ZodEnum<["admin", "user", "viewer", "editor", "owner"]>;
        permissions: z.ZodArray<z.ZodString, "many">;
        tags: z.ZodArray<z.ZodString, "many">;
        customAttributes: z.ZodRecord<z.ZodString, z.ZodAny>;
        country: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        locale: z.ZodOptional<z.ZodString>;
        platform: z.ZodEnum<["web", "mobile", "desktop", "api"]>;
        deviceType: z.ZodEnum<["desktop", "mobile", "tablet"]>;
        operatingSystem: z.ZodOptional<z.ZodString>;
        browser: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        registrationDate: z.ZodDate;
        lastLoginDate: z.ZodOptional<z.ZodDate>;
        lastActiveDate: z.ZodOptional<z.ZodDate>;
        totalLogins: z.ZodNumber;
        sessionCount: z.ZodNumber;
        averageSessionDuration: z.ZodNumber;
        featureUsage: z.ZodRecord<z.ZodString, z.ZodObject<{
            count: z.ZodNumber;
            lastUsed: z.ZodDate;
            frequency: z.ZodEnum<["never", "rare", "occasional", "frequent", "daily"]>;
        }, "strip", z.ZodTypeAny, {
            count: number;
            frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
            lastUsed: Date;
        }, {
            count: number;
            frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
            lastUsed: Date;
        }>>;
        clickThroughRates: z.ZodRecord<z.ZodString, z.ZodNumber>;
        conversionRates: z.ZodRecord<z.ZodString, z.ZodNumber>;
        engagementScore: z.ZodNumber;
        churnRisk: z.ZodEnum<["low", "medium", "high", "critical"]>;
        customerLifetimeValue: z.ZodNumber;
        monthlyRecurringRevenue: z.ZodNumber;
        totalSpent: z.ZodNumber;
        paymentMethod: z.ZodOptional<z.ZodString>;
        billingCycle: z.ZodOptional<z.ZodEnum<["monthly", "yearly", "custom"]>>;
        experimentGroups: z.ZodRecord<z.ZodString, z.ZodString>;
        abTestParticipation: z.ZodArray<z.ZodString, "many">;
        betaFeatures: z.ZodArray<z.ZodString, "many">;
        riskOfChurn: z.ZodNumber;
        upsellProbability: z.ZodNumber;
        supportTicketCount: z.ZodNumber;
        lastSupportInteraction: z.ZodOptional<z.ZodDate>;
        npsScore: z.ZodOptional<z.ZodNumber>;
        healthScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        userId: string;
        permissions: string[];
        userRole: "admin" | "user" | "editor" | "owner" | "viewer";
        platform: "mobile" | "web" | "desktop" | "api";
        deviceType: "mobile" | "desktop" | "tablet";
        conversionRates: Record<string, number>;
        churnRisk: "low" | "medium" | "high" | "critical";
        registrationDate: Date;
        averageSessionDuration: number;
        engagementScore: number;
        accountType: "free" | "enterprise" | "paid" | "trial" | "beta";
        subscriptionTier: "basic" | "premium" | "enterprise" | "pro";
        subscriptionStatus: "active" | "inactive" | "expired" | "pending" | "cancelled";
        accountAge: number;
        customAttributes: Record<string, any>;
        totalLogins: number;
        sessionCount: number;
        featureUsage: Record<string, {
            count: number;
            frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
            lastUsed: Date;
        }>;
        clickThroughRates: Record<string, number>;
        customerLifetimeValue: number;
        monthlyRecurringRevenue: number;
        totalSpent: number;
        experimentGroups: Record<string, string>;
        abTestParticipation: string[];
        betaFeatures: string[];
        riskOfChurn: number;
        upsellProbability: number;
        supportTicketCount: number;
        healthScore: number;
        email?: string | undefined;
        region?: string | undefined;
        country?: string | undefined;
        browser?: string | undefined;
        language?: string | undefined;
        userAgent?: string | undefined;
        organizationId?: string | undefined;
        paymentMethod?: string | undefined;
        city?: string | undefined;
        timezone?: string | undefined;
        parentOrganizationId?: string | undefined;
        locale?: string | undefined;
        operatingSystem?: string | undefined;
        lastLoginDate?: Date | undefined;
        lastActiveDate?: Date | undefined;
        billingCycle?: "custom" | "monthly" | "yearly" | undefined;
        lastSupportInteraction?: Date | undefined;
        npsScore?: number | undefined;
    }, {
        tags: string[];
        userId: string;
        permissions: string[];
        userRole: "admin" | "user" | "editor" | "owner" | "viewer";
        platform: "mobile" | "web" | "desktop" | "api";
        deviceType: "mobile" | "desktop" | "tablet";
        conversionRates: Record<string, number>;
        churnRisk: "low" | "medium" | "high" | "critical";
        registrationDate: Date;
        averageSessionDuration: number;
        engagementScore: number;
        accountType: "free" | "enterprise" | "paid" | "trial" | "beta";
        subscriptionTier: "basic" | "premium" | "enterprise" | "pro";
        subscriptionStatus: "active" | "inactive" | "expired" | "pending" | "cancelled";
        accountAge: number;
        customAttributes: Record<string, any>;
        totalLogins: number;
        sessionCount: number;
        featureUsage: Record<string, {
            count: number;
            frequency: "never" | "rare" | "daily" | "occasional" | "frequent";
            lastUsed: Date;
        }>;
        clickThroughRates: Record<string, number>;
        customerLifetimeValue: number;
        monthlyRecurringRevenue: number;
        totalSpent: number;
        experimentGroups: Record<string, string>;
        abTestParticipation: string[];
        betaFeatures: string[];
        riskOfChurn: number;
        upsellProbability: number;
        supportTicketCount: number;
        healthScore: number;
        email?: string | undefined;
        region?: string | undefined;
        country?: string | undefined;
        browser?: string | undefined;
        language?: string | undefined;
        userAgent?: string | undefined;
        organizationId?: string | undefined;
        paymentMethod?: string | undefined;
        city?: string | undefined;
        timezone?: string | undefined;
        parentOrganizationId?: string | undefined;
        locale?: string | undefined;
        operatingSystem?: string | undefined;
        lastLoginDate?: Date | undefined;
        lastActiveDate?: Date | undefined;
        billingCycle?: "custom" | "monthly" | "yearly" | undefined;
        lastSupportInteraction?: Date | undefined;
        npsScore?: number | undefined;
    }>;
    SegmentConditionSchema: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["attribute", "behavior", "demographic", "geographic", "temporal", "cohort", "custom"]>;
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "in", "not_in", "greater_than", "less_than", "greater_equal", "less_equal", "contains", "not_contains", "starts_with", "ends_with", "regex", "exists", "not_exists", "between", "not_between", "within_days", "not_within_days", "relative_to_now", "percentile", "moving_average", "trend_up", "trend_down", "custom_function"]>;
        value: z.ZodAny;
        logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR", "NOT"]>>;
        weight: z.ZodDefault<z.ZodNumber>;
        isEnabled: z.ZodDefault<z.ZodBoolean>;
        timeWindow: z.ZodOptional<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodEnum<["minutes", "hours", "days", "weeks", "months"]>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        }, {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        }>>;
        aggregation: z.ZodOptional<z.ZodEnum<["sum", "avg", "count", "min", "max", "distinct", "percentile"]>>;
        threshold: z.ZodOptional<z.ZodNumber>;
        comparison: z.ZodOptional<z.ZodEnum<["absolute", "relative", "percentile"]>>;
        description: z.ZodOptional<z.ZodString>;
        lastEvaluated: z.ZodOptional<z.ZodDate>;
        evaluationCount: z.ZodDefault<z.ZodNumber>;
        matchRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        isEnabled: boolean;
        type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
        weight: number;
        operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
        field: string;
        evaluationCount: number;
        matchRate: number;
        description?: string | undefined;
        value?: any;
        comparison?: "relative" | "absolute" | "percentile" | undefined;
        threshold?: number | undefined;
        aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
        timeWindow?: {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        } | undefined;
        logicalOperator?: "AND" | "OR" | "NOT" | undefined;
        lastEvaluated?: Date | undefined;
    }, {
        id: string;
        type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
        operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
        field: string;
        description?: string | undefined;
        isEnabled?: boolean | undefined;
        value?: any;
        weight?: number | undefined;
        comparison?: "relative" | "absolute" | "percentile" | undefined;
        threshold?: number | undefined;
        aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
        timeWindow?: {
            value: number;
            unit: "days" | "minutes" | "hours" | "weeks" | "months";
        } | undefined;
        logicalOperator?: "AND" | "OR" | "NOT" | undefined;
        lastEvaluated?: Date | undefined;
        evaluationCount?: number | undefined;
        matchRate?: number | undefined;
    }>;
    UserSegmentSchema: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        conditions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["attribute", "behavior", "demographic", "geographic", "temporal", "cohort", "custom"]>;
            field: z.ZodString;
            operator: z.ZodEnum<["equals", "not_equals", "in", "not_in", "greater_than", "less_than", "greater_equal", "less_equal", "contains", "not_contains", "starts_with", "ends_with", "regex", "exists", "not_exists", "between", "not_between", "within_days", "not_within_days", "relative_to_now", "percentile", "moving_average", "trend_up", "trend_down", "custom_function"]>;
            value: z.ZodAny;
            logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR", "NOT"]>>;
            weight: z.ZodDefault<z.ZodNumber>;
            isEnabled: z.ZodDefault<z.ZodBoolean>;
            timeWindow: z.ZodOptional<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodEnum<["minutes", "hours", "days", "weeks", "months"]>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: "days" | "minutes" | "hours" | "weeks" | "months";
            }, {
                value: number;
                unit: "days" | "minutes" | "hours" | "weeks" | "months";
            }>>;
            aggregation: z.ZodOptional<z.ZodEnum<["sum", "avg", "count", "min", "max", "distinct", "percentile"]>>;
            threshold: z.ZodOptional<z.ZodNumber>;
            comparison: z.ZodOptional<z.ZodEnum<["absolute", "relative", "percentile"]>>;
            description: z.ZodOptional<z.ZodString>;
            lastEvaluated: z.ZodOptional<z.ZodDate>;
            evaluationCount: z.ZodDefault<z.ZodNumber>;
            matchRate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            isEnabled: boolean;
            type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
            weight: number;
            operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
            field: string;
            evaluationCount: number;
            matchRate: number;
            description?: string | undefined;
            value?: any;
            comparison?: "relative" | "absolute" | "percentile" | undefined;
            threshold?: number | undefined;
            aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
            timeWindow?: {
                value: number;
                unit: "days" | "minutes" | "hours" | "weeks" | "months";
            } | undefined;
            logicalOperator?: "AND" | "OR" | "NOT" | undefined;
            lastEvaluated?: Date | undefined;
        }, {
            id: string;
            type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
            operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
            field: string;
            description?: string | undefined;
            isEnabled?: boolean | undefined;
            value?: any;
            weight?: number | undefined;
            comparison?: "relative" | "absolute" | "percentile" | undefined;
            threshold?: number | undefined;
            aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
            timeWindow?: {
                value: number;
                unit: "days" | "minutes" | "hours" | "weeks" | "months";
            } | undefined;
            logicalOperator?: "AND" | "OR" | "NOT" | undefined;
            lastEvaluated?: Date | undefined;
            evaluationCount?: number | undefined;
            matchRate?: number | undefined;
        }>, "many">;
        joinLogic: z.ZodDefault<z.ZodEnum<["all", "any", "complex"]>>;
        complexLogicExpression: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        isDynamic: z.ZodDefault<z.ZodBoolean>;
        isPrivate: z.ZodDefault<z.ZodBoolean>;
        color: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        tags: z.ZodArray<z.ZodString, "many">;
        category: z.ZodEnum<["behavioral", "demographic", "geographic", "engagement", "revenue", "lifecycle", "experimental", "custom"]>;
        userCount: z.ZodNumber;
        estimatedUserCount: z.ZodOptional<z.ZodNumber>;
        userCountHistory: z.ZodArray<z.ZodObject<{
            date: z.ZodDate;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            date: Date;
            count: number;
        }, {
            date: Date;
            count: number;
        }>, "many">;
        conversionRate: z.ZodOptional<z.ZodNumber>;
        averageLifetimeValue: z.ZodOptional<z.ZodNumber>;
        churnRate: z.ZodOptional<z.ZodNumber>;
        engagementScore: z.ZodOptional<z.ZodNumber>;
        evaluationFrequency: z.ZodDefault<z.ZodEnum<["realtime", "hourly", "daily", "weekly", "manual"]>>;
        lastEvaluated: z.ZodOptional<z.ZodDate>;
        nextEvaluation: z.ZodOptional<z.ZodDate>;
        createdBy: z.ZodString;
        createdAt: z.ZodDate;
        lastModifiedBy: z.ZodString;
        lastModifiedAt: z.ZodDate;
        accessLevel: z.ZodDefault<z.ZodEnum<["public", "team", "organization", "private"]>>;
        allowedUsers: z.ZodArray<z.ZodString, "many">;
        allowedRoles: z.ZodArray<z.ZodString, "many">;
        syncToExternalSystems: z.ZodDefault<z.ZodBoolean>;
        externalSystemMappings: z.ZodRecord<z.ZodString, z.ZodObject<{
            systemId: z.ZodString;
            segmentId: z.ZodString;
            lastSync: z.ZodOptional<z.ZodDate>;
            syncStatus: z.ZodDefault<z.ZodEnum<["pending", "syncing", "synced", "failed"]>>;
        }, "strip", z.ZodTypeAny, {
            systemId: string;
            segmentId: string;
            syncStatus: "pending" | "failed" | "synced" | "syncing";
            lastSync?: Date | undefined;
        }, {
            systemId: string;
            segmentId: string;
            lastSync?: Date | undefined;
            syncStatus?: "pending" | "failed" | "synced" | "syncing" | undefined;
        }>>;
        validationRules: z.ZodArray<z.ZodObject<{
            rule: z.ZodString;
            description: z.ZodString;
            isRequired: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            rule: string;
            isRequired: boolean;
        }, {
            description: string;
            rule: string;
            isRequired?: boolean | undefined;
        }>, "many">;
        qualityScore: z.ZodDefault<z.ZodNumber>;
        parentSegmentId: z.ZodOptional<z.ZodString>;
        childSegmentIds: z.ZodArray<z.ZodString, "many">;
        dependencies: z.ZodArray<z.ZodString, "many">;
        treatmentVariants: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            name: z.ZodString;
            allocation: z.ZodNumber;
            isControl: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            allocation: number;
            isControl: boolean;
        }, {
            name: string;
            allocation: number;
            isControl?: boolean | undefined;
        }>>>;
        schedule: z.ZodOptional<z.ZodObject<{
            startDate: z.ZodOptional<z.ZodDate>;
            endDate: z.ZodOptional<z.ZodDate>;
            activeDays: z.ZodArray<z.ZodNumber, "many">;
            activeHours: z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
                timezone: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
                timezone: string;
            }, {
                start: string;
                end: string;
                timezone: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            activeDays: number[];
            activeHours: {
                start: string;
                end: string;
                timezone: string;
            };
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        }, {
            activeDays: number[];
            activeHours: {
                start: string;
                end: string;
                timezone: string;
            };
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        }>>;
        insights: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["trend", "anomaly", "opportunity", "risk"]>;
            title: z.ZodString;
            description: z.ZodString;
            severity: z.ZodEnum<["low", "medium", "high"]>;
            actionable: z.ZodBoolean;
            generatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            description: string;
            type: "anomaly" | "trend" | "opportunity" | "risk";
            title: string;
            severity: "low" | "medium" | "high";
            generatedAt: Date;
            actionable: boolean;
        }, {
            description: string;
            type: "anomaly" | "trend" | "opportunity" | "risk";
            title: string;
            severity: "low" | "medium" | "high";
            generatedAt: Date;
            actionable: boolean;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        category: "custom" | "experimental" | "lifecycle" | "revenue" | "engagement" | "behavioral" | "demographic" | "geographic";
        tags: string[];
        color: string;
        conditions: {
            id: string;
            isEnabled: boolean;
            type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
            weight: number;
            operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
            field: string;
            evaluationCount: number;
            matchRate: number;
            description?: string | undefined;
            value?: any;
            comparison?: "relative" | "absolute" | "percentile" | undefined;
            threshold?: number | undefined;
            aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
            timeWindow?: {
                value: number;
                unit: "days" | "minutes" | "hours" | "weeks" | "months";
            } | undefined;
            logicalOperator?: "AND" | "OR" | "NOT" | undefined;
            lastEvaluated?: Date | undefined;
        }[];
        dependencies: string[];
        insights: {
            description: string;
            type: "anomaly" | "trend" | "opportunity" | "risk";
            title: string;
            severity: "low" | "medium" | "high";
            generatedAt: Date;
            actionable: boolean;
        }[];
        createdBy: string;
        qualityScore: number;
        userCount: number;
        joinLogic: "complex" | "all" | "any";
        isDynamic: boolean;
        isPrivate: boolean;
        userCountHistory: {
            date: Date;
            count: number;
        }[];
        evaluationFrequency: "manual" | "daily" | "weekly" | "hourly" | "realtime";
        lastModifiedBy: string;
        lastModifiedAt: Date;
        accessLevel: "private" | "public" | "organization" | "team";
        allowedUsers: string[];
        allowedRoles: string[];
        syncToExternalSystems: boolean;
        externalSystemMappings: Record<string, {
            systemId: string;
            segmentId: string;
            syncStatus: "pending" | "failed" | "synced" | "syncing";
            lastSync?: Date | undefined;
        }>;
        validationRules: {
            description: string;
            rule: string;
            isRequired: boolean;
        }[];
        childSegmentIds: string[];
        description?: string | undefined;
        icon?: string | undefined;
        churnRate?: number | undefined;
        averageLifetimeValue?: number | undefined;
        conversionRate?: number | undefined;
        schedule?: {
            activeDays: number[];
            activeHours: {
                start: string;
                end: string;
                timezone: string;
            };
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        } | undefined;
        engagementScore?: number | undefined;
        lastEvaluated?: Date | undefined;
        complexLogicExpression?: string | undefined;
        estimatedUserCount?: number | undefined;
        nextEvaluation?: Date | undefined;
        parentSegmentId?: string | undefined;
        treatmentVariants?: Record<string, {
            name: string;
            allocation: number;
            isControl: boolean;
        }> | undefined;
    }, {
        id: string;
        createdAt: Date;
        name: string;
        category: "custom" | "experimental" | "lifecycle" | "revenue" | "engagement" | "behavioral" | "demographic" | "geographic";
        tags: string[];
        color: string;
        conditions: {
            id: string;
            type: "custom" | "temporal" | "behavior" | "attribute" | "cohort" | "demographic" | "geographic";
            operator: "between" | "regex" | "in" | "equals" | "contains" | "exists" | "percentile" | "not_equals" | "greater_than" | "less_than" | "not_contains" | "not_in" | "not_exists" | "greater_equal" | "less_equal" | "starts_with" | "ends_with" | "not_between" | "within_days" | "not_within_days" | "relative_to_now" | "moving_average" | "trend_up" | "trend_down" | "custom_function";
            field: string;
            description?: string | undefined;
            isEnabled?: boolean | undefined;
            value?: any;
            weight?: number | undefined;
            comparison?: "relative" | "absolute" | "percentile" | undefined;
            threshold?: number | undefined;
            aggregation?: "count" | "min" | "max" | "sum" | "percentile" | "avg" | "distinct" | undefined;
            timeWindow?: {
                value: number;
                unit: "days" | "minutes" | "hours" | "weeks" | "months";
            } | undefined;
            logicalOperator?: "AND" | "OR" | "NOT" | undefined;
            lastEvaluated?: Date | undefined;
            evaluationCount?: number | undefined;
            matchRate?: number | undefined;
        }[];
        dependencies: string[];
        insights: {
            description: string;
            type: "anomaly" | "trend" | "opportunity" | "risk";
            title: string;
            severity: "low" | "medium" | "high";
            generatedAt: Date;
            actionable: boolean;
        }[];
        createdBy: string;
        userCount: number;
        userCountHistory: {
            date: Date;
            count: number;
        }[];
        lastModifiedBy: string;
        lastModifiedAt: Date;
        allowedUsers: string[];
        allowedRoles: string[];
        externalSystemMappings: Record<string, {
            systemId: string;
            segmentId: string;
            lastSync?: Date | undefined;
            syncStatus?: "pending" | "failed" | "synced" | "syncing" | undefined;
        }>;
        validationRules: {
            description: string;
            rule: string;
            isRequired?: boolean | undefined;
        }[];
        childSegmentIds: string[];
        description?: string | undefined;
        isActive?: boolean | undefined;
        icon?: string | undefined;
        churnRate?: number | undefined;
        averageLifetimeValue?: number | undefined;
        conversionRate?: number | undefined;
        schedule?: {
            activeDays: number[];
            activeHours: {
                start: string;
                end: string;
                timezone: string;
            };
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        } | undefined;
        qualityScore?: number | undefined;
        engagementScore?: number | undefined;
        lastEvaluated?: Date | undefined;
        joinLogic?: "complex" | "all" | "any" | undefined;
        complexLogicExpression?: string | undefined;
        isDynamic?: boolean | undefined;
        isPrivate?: boolean | undefined;
        estimatedUserCount?: number | undefined;
        evaluationFrequency?: "manual" | "daily" | "weekly" | "hourly" | "realtime" | undefined;
        nextEvaluation?: Date | undefined;
        accessLevel?: "private" | "public" | "organization" | "team" | undefined;
        syncToExternalSystems?: boolean | undefined;
        parentSegmentId?: string | undefined;
        treatmentVariants?: Record<string, {
            name: string;
            allocation: number;
            isControl?: boolean | undefined;
        }> | undefined;
    }>;
    SegmentUtils: typeof SegmentUtils;
};
export default _default;
//# sourceMappingURL=UserSegmentModel.d.ts.map