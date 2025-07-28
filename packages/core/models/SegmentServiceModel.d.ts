/**
 * Segment Service Model (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: Service layer models for user segment management
 * providing business logic, validation, and orchestration for segment operations.
 */
import { UserSegment, SegmentAnalytics, SegmentExport } from './UserSegmentModel';
export interface SegmentServiceConfig {
    maxSegmentSize: number;
    evaluationBatchSize: number;
    maxConcurrentEvaluations: number;
    cacheTTL: number;
    enableRealTimeUpdates: boolean;
    realTimeBufferSize: number;
    realTimeFlushInterval: number;
    minQualityScore: number;
    autoArchiveInactiveSegments: boolean;
    inactivityThreshold: number;
    webhookEndpoints: string[];
    enableExternalSync: boolean;
    syncBatchSize: number;
}
export interface SegmentQuery {
    ids?: string[];
    names?: string[];
    categories?: string[];
    tags?: string[];
    isActive?: boolean;
    isDynamic?: boolean;
    isPrivate?: boolean;
    createdBy?: string[];
    lastModifiedBy?: string[];
    hasAccess?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    modifiedAfter?: Date;
    modifiedBefore?: Date;
    minUserCount?: number;
    maxUserCount?: number;
    minQualityScore?: number;
    hasInsights?: boolean;
    searchTerm?: string;
    sortBy?: 'name' | 'userCount' | 'createdAt' | 'lastModifiedAt' | 'qualityScore';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    includeAnalytics?: boolean;
    includeInsights?: boolean;
    includeUserSample?: boolean;
}
export interface SegmentOperationResult {
    success: boolean;
    segmentId?: string;
    affectedUserCount?: number;
    executionTime: number;
    warnings: string[];
    errors: string[];
    metadata?: Record<string, any>;
}
export interface SegmentBulkOperationResult {
    totalSegments: number;
    successfulOperations: number;
    failedOperations: number;
    results: Array<{,
        segmentId: string;
        operation: string;
        result: SegmentOperationResult;
    }>;
    executionTime: number;
}
export interface SegmentEvaluationResult {
    segmentId: string;
    evaluationId: string;
    startTime: Date;
    endTime: Date;
    totalUsersEvaluated: number;
    matchingUsers: number;
    newMatches: number;
    removedMatches: number;
    evaluationTime: number;
    averageUserEvaluationTime: number;
    cacheHitRate: number;
    conditionMatchRates: Record<string, number>;
    segmentHealthScore: number;
    anomalies: Array<{,
        type: 'size_change' | 'performance_degradation' | 'condition_mismatch';
        severity: 'low' | 'medium' | 'high';
        description: string;
        recommendation?: string;
    }>;
}
export interface SegmentMembership {
    userId: string;
    segmentId: string;
    joinedAt: Date;
    lastEvaluated: Date;
    matchScore: number;
    matchingConditions: string[];
    entryPoint: 'automatic' | 'manual' | 'import' | 'api';
    source?: string;
    tags: string[];
    membershipDuration: number;
    isStale: boolean;
}
export interface SegmentPerformanceMetrics {
    segmentId: string;
    timeRange: {,
        start: Date;
        end: Date;
    };
    totalEvaluations: number;
    averageEvaluationTime: number;
    evaluationSuccessRate: number;
    peakUserCount: number;
    averageUserCount: number;
    userChurnRate: number;
    userGrowthRate: number;
    conditionPerformance: Array<{,
        conditionId: string;
        evaluationTime: number;
        matchRate: number;
        errorRate: number;
    }>;
    memoryUsage: number;
    cpuUsage: number;
    cacheUsage: number;
    conversionImpact: number;
    revenueImpact: number;
    engagementImpact: number;
}
export interface SegmentRecommendation {
    type: 'create_segment' | 'merge_segments' | 'split_segment' | 'optimize_conditions' | 'archive_segment';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    expectedImpact: {,
        userCountChange?: number;
        performanceImprovement?: number;
        qualityScoreChange?: number;
    };
    actionable: boolean;
    automatable: boolean;
    estimatedEffort: 'low' | 'medium' | 'high';
    supportingSegments?: string[];
    supportingMetrics?: Record<string, number>;
    confidence: number;
    generatedAt: Date;
    generatedBy: 'system' | 'ml_model' | 'user_request';
    modelVersion?: string;
}
export interface SegmentExperiment {
    id: string;
    name: string;
    description?: string;
    segmentId: string;
    treatmentVariants: Array<{,
        id: string;
        name: string;
        allocation: number;
        configuration: Record<string, any>;
        isControl: boolean;
    }>;
    status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    duration?: number;
    primaryMetric: string;
    secondaryMetrics: string[];
    successCriteria: Array<{,
        metric: string;
        operator: 'greater_than' | 'less_than' | 'between';
        value: number | [number, number];
        significance: number;
    }>;
    results?: {
        variants: Array<{,
            variantId: string;
            userCount: number;
            metrics: Record<string, number>;
            conversionRate: number;
            confidence: number;
        }>;
        winner?: string;
        significance: number;
        liftPercentage: number;
    };
    createdBy: string;
    createdAt: Date;
    lastUpdated: Date;
}
export interface SegmentDataPipeline {
    id: string;
    name: string;
    description?: string;
    sourceType: 'database' | 'api' | 'file' | 'stream';
    sourceConfig: Record<string, any>;
    transformations: Array<{,
        id: string;
        type: 'filter' | 'map' | 'aggregate' | 'join' | 'custom';
        configuration: Record<string, any>;
        order: number;
    }>;
    targetSegments: string[];
    schedule: string;
    isActive: boolean;
    lastRun?: Date;
    nextRun?: Date;
    status: 'idle' | 'running' | 'failed' | 'disabled';
    executionHistory: Array<{,
        startTime: Date;
        endTime: Date;
        recordsProcessed: number;
        recordsSuccessful: number;
        recordsFailed: number;
        status: 'success' | 'partial' | 'failed';
        errorMessage?: string;
    }>;
}
export interface SegmentComplianceConfig {
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    coppaCompliant: boolean;
    customRegulations: string[];
    retentionPeriod: number;
    anonymizationRules: Array<{,
        field: string;
        method: 'hash' | 'encrypt' | 'remove' | 'pseudonymize';
        parameters?: Record<string, any>;
    }>;
    requiresConsent: boolean;
    consentTypes: string[];
    consentValidation: Array<{,
        condition: string;
        errorMessage: string;
    }>;
    auditTrail: boolean;
    auditRetention: number;
    complianceReporting: boolean;
}
export interface SegmentValidationRule {
    id: string;
    name: string;
    description: string;
    ruleType: 'data_quality' | 'business_logic' | 'performance' | 'compliance' | 'custom';
    severity: 'warning' | 'error' | 'critical';
    validator: string;
    parameters: Record<string, any>;
    runOnCreate: boolean;
    runOnUpdate: boolean;
    runOnSchedule: boolean;
    schedule?: string;
    isActive: boolean;
    createdAt: Date;
    lastExecuted?: Date;
    executionCount: number;
    violationCount: number;
}
export interface SegmentIntegration {
    id: string;
    name: string;
    type: 'webhook' | 'api' | 'database' | 'message_queue' | 'custom';
    endpoint: string;
    authentication: {,
        type: 'api_key' | 'oauth' | 'basic' | 'token' | 'custom';
        credentials: Record<string, any>;
    };
    syncDirection: 'outbound' | 'inbound' | 'bidirectional';
    syncFrequency: 'realtime' | 'batch' | 'scheduled';
    batchSize?: number;
    schedule?: string;
    fieldMappings: Array<{,
        sourceField: string;
        targetField: string;
        transformation?: string;
        required: boolean;
    }>;
    isActive: boolean;
    lastSync?: Date;
    syncStatus: 'healthy' | 'degraded' | 'failed';
    errorCount: number;
    syncHistory: Array<{,
        startTime: Date;
        endTime: Date;
        recordsSynced: number;
        recordsSuccessful: number;
        recordsFailed: number;
        status: 'success' | 'partial' | 'failed';
        errorMessage?: string;
    }>;
}
export interface IUserSegmentService {
    createSegment(segment: Omit<UserSegment, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<UserSegment>;
    updateSegment(id: string, updates: Partial<UserSegment>): Promise<UserSegment>;
    deleteSegment(id: string, options?: {)
        force?: boolean;
    }): Promise<SegmentOperationResult>;
    getSegment(id: string, options?: {)
        includeAnalytics?: boolean;
    }): Promise<UserSegment | null>;
    querySegments(query: SegmentQuery): Promise<{
        segments: UserSegment[];
        totalCount: number;
        hasMore: boolean;
    }>;
    evaluateSegment(segmentId: string, options?: {)
        userId?: string;
    }): Promise<SegmentEvaluationResult>;
    evaluateUserForSegments(userId: string, segmentIds?: string[]): Promise<Record<string, boolean>>;
    addUserToSegment(userId: string, segmentId: string, options?: {)
        source?: string;
    }): Promise<SegmentMembership>;
    removeUserFromSegment(userId: string, segmentId: string): Promise<boolean>;
    getUserSegments(userId: string): Promise<SegmentMembership[]>;
    getSegmentUsers(segmentId: string, options?: {)
        limit?: number;
        offset?: number;
    }): Promise<{
        users: SegmentMembership[];
        totalCount: number;
    }>;
    getSegmentAnalytics(segmentId: string, timeRange?: {)
        start: Date;
        end: Date;
    }): Promise<SegmentAnalytics>;
    getSegmentPerformanceMetrics(segmentId: string): Promise<SegmentPerformanceMetrics>;
    generateSegmentRecommendations(segmentId?: string): Promise<SegmentRecommendation[]>;
    bulkEvaluateSegments(segmentIds: string[]): Promise<SegmentBulkOperationResult>;
    bulkUpdateSegments(updates: Array<{)
        id: string;
        changes: Partial<UserSegment>;
    }>): Promise<SegmentBulkOperationResult>;
    exportSegment(segmentId: string, format: 'csv' | 'json', options?: {)
        includeFields?: string[];
        maxRecords?: number;
    }): Promise<SegmentExport>;
    importSegmentUsers(segmentId: string, data: any[], options?: {)
        format: 'csv' | 'json';
        mergeStrategy: 'replace' | 'append' | 'merge';
    }): Promise<SegmentOperationResult>;
    createExperiment(experiment: Omit<SegmentExperiment, 'id' | 'createdAt'>): Promise<SegmentExperiment>;
    getExperimentResults(experimentId: string): Promise<SegmentExperiment['results']>;
    optimizeSegment(segmentId: string): Promise<SegmentOperationResult>;
    validateSegment(segmentId: string): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    getSystemHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: Record<string, number>;
        issues: string[];
    }>;
}
//# sourceMappingURL=SegmentServiceModel.d.ts.map