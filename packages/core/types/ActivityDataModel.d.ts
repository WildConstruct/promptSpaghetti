/**
 * Activity Data Model
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Comprehensive activity tracking data model for monitoring user actions,
 * system events, and administrative activities across the platform.
 */
export type ActivityType = 'user_action' | 'system_event' | 'admin_action' | 'security_event' | 'api_call' | 'data_change' | 'error_event' | 'performance_event' | 'authentication' | 'authorization' | 'file_operation' | 'workflow_event';
export type ActivitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface BaseActivity {
    id: string;
    timestamp: string;
    type: ActivityType;
    severity: ActivitySeverity;
    status: ActivityStatus;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    sessionId?: string;
    source: string;
    sourceVersion?: string;
    environment: 'development' | 'staging' | 'production';
    action: string;
    description: string;
    category: string;
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    requestId?: string;
    correlationId?: string;
    parentActivityId?: string;
    ipAddress?: string;
    userAgent?: string;
    geolocation?: {
        country?: string;
        region?: string;
        city?: string;
        coordinates?: [number, number];
    };
    duration?: number;
    startTime?: string;
    endTime?: string;
    metadata: Record<string, any>;
    tags: string[];
    changes?: ActivityChange[];
    error?: {
        code?: string;
        message?: string;
        stack?: string;
        details?: Record<string, any>;
    };
    createdAt: string;
    updatedAt?: string;
    version: number;

export interface ActivityChange {
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'create' | 'update' | 'delete' | 'restore';

export interface UserActivity extends BaseActivity {
    type: 'user_action';
    page?: string;
    component?: string;
    elementId?: string;
    previousAction?: string;
    userJourneyId?: string;
    renderTime?: number;
    interactionDelay?: number;

export interface SystemActivity extends BaseActivity {
    type: 'system_event';
    systemMetrics?: {
        cpuUsage?: number;
        memoryUsage?: number;
        diskUsage?: number;
        networkLatency?: number;
    };
    healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
    componentStatus?: Record<string, string>;

export interface AdminActivity extends BaseActivity {
    type: 'admin_action';
    adminLevel: 'super_admin' | 'admin' | 'moderator' | 'support';
    targetUserId?: string;
    targetUserEmail?: string;
    policyId?: string;
    policyVersion?: string;
    requiresApproval?: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    approverId?: string;
    approvalReason?: string;

export interface SecurityActivity extends BaseActivity {
    type: 'security_event';
    threatType?: string;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    threatSource?: string;
    detectionMethod?: string;
    detectionTime?: string;
    detectionConfidence?: number;
    responseAction?: string;
    responseTime?: string;
    blocked?: boolean;
    forensicData?: {
        requestHeaders?: Record<string, string>;
        requestBody?: any;
        responseStatus?: number;
        fingerprint?: string;
    };

export interface ApiActivity extends BaseActivity {
    type: 'api_call';
    method: string;
    endpoint: string;
    statusCode: number;
    requestSize?: number;
    responseSize?: number;
    apiVersion?: string;
    rateLimitRemaining?: number;
    processingTime?: number;
    databaseTime?: number;
    externalApiTime?: number;

export interface DataActivity extends BaseActivity {
    type: 'data_change';
    database?: string;
    table?: string;
    primaryKey?: string | number;
    operationType: 'insert' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete';
    affectedRows?: number;
    validationErrors?: string[];
    businessRules?: string[];

export interface PerformanceActivity extends BaseActivity {
    type: 'performance_event';
    metrics: {,
        responseTime?: number;
        throughput?: number;
        errorRate?: number;
        cpuUsage?: number;
        memoryUsage?: number;
        diskIo?: number;
        networkIo?: number;
    };
    thresholds?: Record<string, number>;
    thresholdViolations?: string[];
    loadLevel?: 'low' | 'medium' | 'high' | 'peak';
    concurrentUsers?: number;

export interface AuthenticationActivity extends BaseActivity {
    type: 'authentication';
    authMethod: 'password' | 'oauth' | 'saml' | 'mfa' | 'api_key' | 'jwt';
    mfaUsed?: boolean;
    mfaMethod?: string;
    deviceId?: string;
    deviceType?: string;
    deviceFingerprint?: string;
    loginAttempts?: number;
    lastSuccessfulLogin?: string;
    riskScore?: number;
    riskFactors?: string[];

export interface FileActivity extends BaseActivity {
    type: 'file_operation';
    fileName: string;
    filePath: string;
    fileSize?: number;
    fileType?: string;
    mimeType?: string;
    operation: 'create' | 'read' | 'update' | 'delete' | 'copy' | 'move' | 'rename';
    filePermissions?: string;
    accessLevel?: string;
    version?: string;
    previousVersion?: string;

export interface WorkflowActivity extends BaseActivity {
    type: 'workflow_event';
    workflowId: string;
    workflowName: string;
    workflowVersion: string;
    stepId?: string;
    stepName?: string;
    stepType?: string;
    executionId: string;
    executionStatus: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
    stepDuration?: number;
    totalDuration?: number;

export type Activity = UserActivity | SystemActivity | AdminActivity | SecurityActivity | ApiActivity | DataActivity | PerformanceActivity | AuthenticationActivity | FileActivity | WorkflowActivity;

export interface ActivityQuery {
    startTime?: string;
    endTime?: string;
    types?: ActivityType[];
    severities?: ActivitySeverity[];
    statuses?: ActivityStatus[];
    sources?: string[];
    userIds?: string[];
    userEmails?: string[];
    userRoles?: string[];
    resourceTypes?: string[];
    resourceIds?: string[];
    searchTerm?: string;
    searchFields?: string[];
    metadataFilters?: Record<string, any>;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    aggregateBy?: string[];
    include?: string[];

export interface ActivityAggregation {
    field: string;
    value: any;
    count: number;
    percentage: number;

export interface ActivityQueryResult {
    activities: Activity[];
    totalCount: number;
    aggregations?: Record<string, ActivityAggregation[]>;
    facets?: Record<string, Array<{
        value: string;
        count: number;
    }>>;
    executionTime: number;

export interface ActivityIndex {
    id: string;
    timestamp: string;
    type: ActivityType;
    userId?: string;
    source: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    severity: ActivitySeverity;
    status: ActivityStatus;
    tags: string[];

export interface ActivityStream {
    subscriptionId: string;
    filters: ActivityQuery;
    isActive: boolean;
    createdAt: string;
    lastActivity?: string;

export interface ActivityStreamEvent {
    streamId: string;
    activity: Activity;
    timestamp: string;

export interface ActivityMetrics {
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    activitiesBySeverity: Record<ActivitySeverity, number>;
    activitiesByStatus: Record<ActivityStatus, number>;
    activitiesOverTime: Array<{,
        timestamp: string;
        count: number;
        types: Record<ActivityType, number>;
    }>;
    topSources: Array<{,
        source: string;
        count: number;
        percentage: number;
    }>;
    topActions: Array<{,
        action: string;
        count: number;
        percentage: number;
    }>;
    topUsers: Array<{,
        userId: string;
        userEmail?: string;
        count: number;
        percentage: number;
    }>;
    errorRate: number;
    averageDuration: number;
    performanceMetrics: {,
        p50: number;
        p95: number;
        p99: number;
    };

export interface ActivityRetentionPolicy {
    id: string;
    name: string;
    description: string;
    retentionPeriod: number;
    activityTypes: ActivityType[];
    severities: ActivitySeverity[];
    archiveEnabled: boolean;
    archiveLocation?: string;
    compressionEnabled?: boolean;
    cleanupEnabled: boolean;
    cleanupSchedule?: string;
    complianceRequirement?: string;
    legalHoldEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;

export type { Activity as MonitoringActivity, ActivityQuery as MonitoringActivityQuery, ActivityQueryResult as MonitoringActivityQueryResult, ActivityMetrics as MonitoringActivityMetrics };
export declare const DEFAULT_ACTIVITY_RETENTION_DAYS = 90;
export declare const DEFAULT_ACTIVITY_PAGE_SIZE = 50;
export declare const MAX_ACTIVITY_PAGE_SIZE = 1000;
export declare const ACTIVITY_TYPE_LABELS: Record<ActivityType, string>;
export declare const ACTIVITY_SEVERITY_COLORS: Record<ActivitySeverity, string>;
//# sourceMappingURL=ActivityDataModel.d.ts.map