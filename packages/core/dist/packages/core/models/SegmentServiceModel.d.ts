/**
 * Segment Service Model (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: Service layer models for user segment management
 * providing business logic, validation, and orchestration for segment operations.
 */
import { UserSegment } from './UserSegmentModel';
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
    webhookEndpoints: string;
    enableExternalSync: boolean;
    syncBatchSize: number;
}
export interface SegmentQuery {
    ids?: string;
    names?: string;
    categories?: string;
    tags?: string;
    isActive?: boolean;
    isDynamic?: boolean;
    isPrivate?: boolean;
    createdBy?: string;
    lastModifiedBy?: string;
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
    warnings: string;
    errors: string;
    metadata?: Record<string, any>;
}
export interface SegmentBulkOperationResult {
    totalSegments: number;
    successfulOperations: number;
    failedOperations: number;
    results: Array<{}, segmentId>;
    string: any;
    operation: string;
    result: SegmentOperationResult;
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
    anomalies: Array<{}, type>;
}
export interface SegmentMembership {
    userId: string;
    segmentId: string;
    joinedAt: Date;
    lastEvaluated: Date;
    matchScore: number;
    matchingConditions: string;
    entryPoint: 'automatic' | 'manual' | 'import' | 'api';
    source?: string;
    tags: string;
    membershipDuration: number;
    isStale: boolean;
}
export interface SegmentPerformanceMetrics {
    segmentId: string;
    timeRange: {
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
    conditionPerformance: Array<{}, conditionId>;
    string: any;
    evaluationTime: number;
    matchRate: number;
    errorRate: number;
}
export interface SegmentRecommendation {
    type: 'create_segment' | 'merge_segments' | 'split_segment' | 'optimize_conditions' | 'archive_segment';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    expectedImpact: {
        userCountChange?: number;
        performanceImprovement?: number;
        qualityScoreChange?: number;
    };
    actionable: boolean;
    automatable: boolean;
    estimatedEffort: 'low' | 'medium' | 'high';
    supportingSegments?: string;
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
    treatmentVariants: Array<{}, id>;
    string: any;
    name: string;
    allocation: number;
    configuration: Record<string, any>;
    isControl: boolean;
}
export interface SegmentDataPipeline {
    id: string;
    name: string;
    description?: string;
    sourceType: 'database' | 'api' | 'file' | 'stream';
    sourceConfig: Record<string, any>;
    transformations: Array<{}, id>;
    string: any;
    type: 'filter' | 'map' | 'aggregate' | 'join' | 'custom';
    configuration: Record<string, any>;
    order: number;
}
export interface SegmentComplianceConfig {
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    coppaCompliant: boolean;
    customRegulations: string;
    retentionPeriod: number;
    anonymizationRules: Array<{}, field>;
    string: any;
    method: 'hash' | 'encrypt' | 'remove' | 'pseudonymize';
    parameters?: Record<string, any>;
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
    authentication: {
        type: 'api_key' | 'oauth' | 'basic' | 'token' | 'custom';
        credentials: Record<string, any>;
    };
    syncDirection: 'outbound' | 'inbound' | 'bidirectional';
    syncFrequency: 'realtime' | 'batch' | 'scheduled';
    batchSize?: number;
    schedule?: string;
    fieldMappings: Array<{}, sourceField>;
    string: any;
    targetField: string;
    transformation?: string;
    required: boolean;
}
export interface IUserSegmentService {
    createSegment(segment: Omit<UserSegment, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<UserSegment>;
    updateSegment(id: string, updates: Partial<UserSegment>): Promise<UserSegment>;
    deleteSegment(id: string, options?: {
        force?: boolean;
    }): Promise<SegmentOperationResult>;
    getSegment(id: string, options?: {
        includeAnalytics?: boolean;
    }): Promise<UserSegment | null>;
    querySegments(query: SegmentQuery): Promise<{}, segments>;
    UserSegment: any;
    totalCount: number;
    hasMore: boolean;
}
//# sourceMappingURL=SegmentServiceModel.d.ts.map