/**
 * Escalation Types - Epic 17 Implementation
 * Task: E17-1753114397261-63A60C - Implement escalation procedures
 *
 * Comprehensive type definitions for the escalation system including
 * enums, interfaces, and validation schemas for all escalation-related
 * data structures and API contracts.
 */
import { z } from 'zod';
export declare enum EscalationTriggerType {
    TIME_BASED = "time_based",
    THRESHOLD_BASED = "threshold_based",
    MANUAL = "manual",
    AUTOMATED = "automated",
    CONDITIONAL = "conditional",
    PRIORITY_BASED = "priority_based",
    export,
    enum,
    EscalationStatus
}
export declare const EscalationLevelSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const EscalationRuleSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export interface EscalationCondition {
    conditionId: string;
    type: 'value' | 'time' | 'count' | 'percentage' | 'custom';
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
    value: string | number | boolean;
    logicalOperator?: 'AND' | 'OR';
}
export interface NotificationMethod {
    type: NotificationType;
    address: string;
    priority: EscalationPriority;
    immediateDelivery: boolean;
    retryCount?: number;
    retryInterval?: number;
}
export interface EscalationAction {
    actionId: string;
    type: EscalationActionType;
    configuration: Record<string, any>;
    executeImmediately: boolean;
    rollbackable: boolean;
}
export interface EscalationLevel {
    levelId: string;
    level: number;
    name: string;
    description: string;
    assignmentType: AssignmentType;
    assignmentTarget: string;
    notificationMethods: NotificationMethod;
    notificationTemplate?: string;
    responseTimeLimit: number;
    resolutionTimeLimit: number;
    automaticActions?: EscalationAction;
    requiredActions?: string;
    escalationCriteria?: EscalationCondition;
}
export interface EscalationRule {
    ruleId: string;
    name: string;
    description: string;
    category: EscalationCategory;
    enabled: boolean;
    triggerType: EscalationTriggerType;
    conditions: EscalationCondition;
    escalationPath: EscalationLevel;
    initialDelay?: number;
    escalationInterval?: number;
    maxEscalationTime?: number;
    businessHoursOnly?: boolean;
    allowWeekends?: boolean;
    timeZone?: string;
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    version: number;
}
export interface EscalationPathStep {
    stepId: string;
    level: number;
    levelName: string;
    assignedTo: string;
    assignedAt: Date;
    acknowledgedAt?: Date;
    respondedAt?: Date;
    completedAt?: Date;
    escalatedAt?: Date;
    escalationReason?: string;
    notes?: string;
    timeSpent?: number;
}
export interface EscalationNotification {
    notificationId: string;
    method: string;
    recipient: string;
    sentAt: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failureReason?: string;
    retryCount: number;
    priority: EscalationPriority;
}
export interface EscalationActionLog {
    actionId: string;
    actionType: string;
    executedAt: Date;
    executedBy: string;
    success: boolean;
    result?: Record<string, any>;
    error?: string;
    rollbackable: boolean;
    rolledBackAt?: Date;
}
export interface EscalationResolution {
    resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged' | 'expired';
    resolutionLevel: number;
    resolvedBy: string;
    resolutionTime: number;
    satisfactionRating?: number;
    lessonsLearned?: string;
    improvementSuggestions?: string;
}
export interface EscalationCase {
    caseId: string;
    ruleId: string;
    category: EscalationCategory;
    priority: EscalationPriority;
    status: EscalationStatus;
    sourceType: string;
    sourceId: string;
    sourceData: Record<string, any>;
    currentLevel: number;
    currentAssignee?: string;
    currentAssigneeType?: 'user' | 'group' | 'role';
    createdAt: Date;
    updatedAt: Date;
    escalatedAt?: Date;
    responseDeadline?: Date;
    resolutionDeadline?: Date;
    resolvedAt?: Date;
    escalationPath: EscalationPathStep;
    notifications: EscalationNotification;
    actions: EscalationActionLog;
    resolution?: EscalationResolution;
    resolutionNotes?: string;
    followUpRequired?: boolean;
    tags: string;
    metadata: Record<string, any>;
}
export interface EscalationCategoryMetrics {
    category: EscalationCategory;
    totalCases: number;
    averageResolutionTime: number;
    escalationRate: number;
    satisfactionScore: number;
    topIssues: string;
}
export interface EscalationLevelMetrics {
    level: number;
    totalCases: number;
    resolutionRate: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    escalationRate: number;
    workloadDistribution: Map<string, number>;
}
export interface EscalationTrend {
    period: string;
    timestamp: Date;
    totalCases: number;
    escalationRate: number;
    resolutionTime: number;
    satisfactionScore: number;
}
export interface EscalationMetrics {
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    escalatedCases: number;
    expiredCases: number;
    averageResolutionTime: number;
    averageEscalationLevels: number;
    firstLevelResolutionRate: number;
    slaComplianceRate: number;
    categoryMetrics: Map<EscalationCategory, EscalationCategoryMetrics>;
    levelMetrics: Map<number, EscalationLevelMetrics>;
    trends: EscalationTrend;
    satisfactionScore: number;
    ruleEffectivenessScore: number;
}
export interface EscalationAlert {
    alertId: string;
    type: 'sla_breach' | 'high_volume' | 'system_issue' | 'quality_concern' | 'capacity_limit';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    affectedCases: string;
    recommendedActions: string;
    createdAt: Date;
}
export interface EscalationRecommendation {
    recommendationId: string;
    type: 'process_improvement' | 'resource_allocation' | 'rule_optimization' | 'training_need';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
    priority: EscalationPriority;
    category?: EscalationCategory;
}
export interface WorkloadAssignment {
    assignee: string;
    activeCases: number;
    overdueItems: number;
    utilizationRate: number;
}
export interface CategoryBreakdown {
    category: EscalationCategory;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
}
export interface EscalationDashboard {
    overview: {
        activeCases: number;
        criticalCases: number;
        overdueResponses: number;
        overdueResolutions: number;
        averageWaitTime: number;
    };
    recentEscalations: EscalationCase;
    urgentCases: EscalationCase;
    performance: {
        slaCompliance: number;
        firstCallResolution: number;
        customerSatisfaction: number;
        averageHandleTime: number;
    };
    workloadDistribution: WorkloadAssignment;
    categoryBreakdown: CategoryBreakdown;
    alerts: EscalationAlert;
    recommendations: EscalationRecommendation;
}
export interface CreateEscalationRuleRequest {
    name: string;
    description?: string;
    category: EscalationCategory;
    enabled?: boolean;
    triggerType: EscalationTriggerType;
    conditions: EscalationCondition;
    escalationPath: Omit<EscalationLevel, 'levelId'>[];
    initialDelay?: number;
    escalationInterval?: number;
    maxEscalationTime?: number;
    businessHoursOnly?: boolean;
    allowWeekends?: boolean;
    timeZone?: string;
}
export interface UpdateEscalationRuleRequest {
    name?: string;
    description?: string;
    category?: EscalationCategory;
    enabled?: boolean;
    conditions?: EscalationCondition;
    escalationPath?: EscalationLevel;
    initialDelay?: number;
    escalationInterval?: number;
    maxEscalationTime?: number;
    businessHoursOnly?: boolean;
    allowWeekends?: boolean;
    timeZone?: string;
}
export interface CreateEscalationCaseRequest {
    sourceType: string;
    sourceId: string;
    sourceData: Record<string, any>;
    ruleId?: string;
    priority?: EscalationPriority;
}
export interface EscalateCaseRequest {
    reason?: string;
}
export interface ResolveCaseRequest {
    resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged';
    resolutionNotes?: string;
    satisfactionRating?: number;
    lessonsLearned?: string;
    improvementSuggestions?: string;
}
export interface GetEscalationCasesQuery {
    status?: EscalationStatus;
    priority?: EscalationPriority;
    category?: EscalationCategory;
    assignee?: string;
    sourceType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetEscalationRulesQuery {
    category?: EscalationCategory;
    enabled?: boolean;
    triggerType?: EscalationTriggerType;
    page?: number;
    limit?: number;
}
export interface GetEscalationMetricsQuery {
    period?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
    category?: EscalationCategory;
}
export interface GetEscalationAnalyticsQuery {
    period?: 'week' | 'month' | 'quarter' | 'year';
    groupBy?: 'category' | 'priority' | 'assignee' | 'level';
}
export interface EscalationAPIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface EscalationRuleTestResult {
    ruleId: string;
    testData: Record<string, any>;
    wouldTrigger: boolean;
    matchedConditions: string;
    suggestedLevel: number;
    estimatedEscalationPath: {
        level: number;
        assignee: string;
        estimatedTime: number;
    }[];
    warnings: string;
}
export interface AssigneePerformance {
    assignee: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    casesHandled: number;
    averageResolutionTime: number;
    firstCallResolutionRate: number;
    escalationRate: number;
    satisfactionScore: number;
    workloadUtilization: number;
    specializations: EscalationCategory;
}
export interface EscalationIntegration {
    integrationId: string;
    name: string;
    type: 'webhook' | 'api' | 'email' | 'slack' | 'teams' | 'custom';
    configuration: Record<string, any>;
    enabled: boolean;
    events: EscalationEventType;
    credentials?: Record<string, string>;
    rateLimits?: {
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
    };
}
export declare enum EscalationEventType {
    CASE_CREATED = "case_created",
    CASE_ESCALATED = "case_escalated",
    CASE_RESOLVED = "case_resolved",
    LEVEL_TIMEOUT = "level_timeout",
    SLA_BREACH = "sla_breach",
    ASSIGNMENT_CHANGED = "assignment_changed",
    NOTIFICATION_SENT = "notification_sent",
    ACTION_EXECUTED = "action_executed",
    export,
    interface,
    EscalationEvent
}
export interface EscalationServiceConfig {
    defaultTimezone: string;
    businessHours: {
        startTime: string;
        endTime: string;
        daysOfWeek: number;
    };
    notifications: {
        retryAttempts: number;
        retryInterval: number;
        enableBatching: boolean;
        batchSize: number;
        batchInterval: number;
    };
    performance: {
        metricsRetentionDays: number;
        autoCleanupExpiredCases: boolean;
        maxConcurrentEscalations: number;
    };
    integrations: {
        enableWebhooks: boolean;
        webhookTimeout: number;
        enableSlackNotifications: boolean;
        enableTeamsNotifications: boolean;
    };
}
declare const _default: {
    EscalationTriggerType: typeof EscalationTriggerType;
    EscalationStatus: any;
    EscalationPriority: any;
    EscalationCategory: any;
    NotificationType: any;
    EscalationActionType: any;
    AssignmentType: any;
    EscalationEventType: typeof EscalationEventType;
    EscalationConditionSchema: any;
    NotificationMethodSchema: any;
    EscalationActionSchema: any;
    EscalationLevelSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    EscalationRuleSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
};
export default _default;
//# sourceMappingURL=EscalationTypes.d.ts.map