/**
 * Data Retrieval Rate Limiting System
 *
 * Enhanced rate limiting specifically designed for data access and retrieval operations.
 * Builds upon the existing RateLimitingService infrastructure to provide:
 * - Classification-aware rate limiting
 * - Data volume-based throttling
 * - User behavior analysis
 * - Adaptive limits based on data sensitivity
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-95 - Add rate limiting for data retrieval
 */
import { EventEmitter } from 'events';
import { RateLimitingService, BackoffStrategy } from './RateLimitingService';
import { DataOperation, SubjectAttributes, ObjectAttributes } from './DataClassificationAccessControl';
import { DataClassificationLevel } from '../types/DataClassification';
export declare enum DataEndpointCategory {
    DATA_READ = "data_read",
    DATA_EXPORT = "data_export",
    DATA_SEARCH = "data_search",
    DATA_BULK_ACCESS = "data_bulk_access",
    DATA_STREAM = "data_stream",
    DATA_ANALYTICS = "data_analytics",
    DATA_BACKUP = "data_backup",
    DATA_SYNC = "data_sync"
}
export interface DataRetrievalLimits {
    classification: DataClassificationLevel;
    operation: DataOperation;
    limits: {
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
        bytesPerMinute: number;
        bytesPerHour: number;
        recordsPerMinute: number;
        recordsPerHour: number;
        concurrentRequests: number;
    };
    backoff: {
        strategy: BackoffStrategy;
        baseDelay: number;
        maxDelay: number;
        multiplier: number;
    };
    adaptiveFactors: {
        userRiskMultiplier: number;
        timeOfDayMultiplier: number;
        locationMultiplier: number;
        deviceTrustMultiplier: number;
    };
}
export interface DataAccessAttempt {
    userId: string;
    resourceId: string;
    operation: DataOperation;
    classification: DataClassificationLevel;
    timestamp: Date;
    bytesRequested: number;
    recordsRequested: number;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    rateLimited: boolean;
    riskScore: number;
}
export interface RetrievalMetrics {
    totalRequests: number;
    totalBytesTransferred: number;
    totalRecordsAccessed: number;
    rateLimitedRequests: number;
    averageRequestSize: number;
    topDataUsers: UserDataUsage[];
    classificationBreakdown: Record<DataClassificationLevel, number>;
    operationBreakdown: Record<DataOperation, number>;
    peakUsageTimes: TimeUsagePattern[];
    suspiciousActivity: SuspiciousActivity[];
}
export interface UserDataUsage {
    userId: string;
    requestCount: number;
    bytesAccessed: number;
    recordsAccessed: number;
    classificationsAccessed: DataClassificationLevel[];
    lastAccess: Date;
    riskScore: number;
    anomalyScore: number;
}
export interface TimeUsagePattern {
    hour: number;
    dayOfWeek: number;
    requestCount: number;
    averageRiskScore: number;
    topOperations: DataOperation[];
}
export interface SuspiciousActivity {
    userId: string;
    activityType: 'UNUSUAL_VOLUME' | 'OFF_HOURS_ACCESS' | 'PRIVILEGE_ESCALATION' | 'BULK_DOWNLOAD' | 'RAPID_REQUESTS';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    timestamp: Date;
    evidence: Record<string, any>;
    riskScore: number;
}
export interface DataRetrievalConfig {
    enableVolumeTracking: boolean;
    enableBehaviorAnalysis: boolean;
    enableAdaptiveLimits: boolean;
    enableAnomalyDetection: boolean;
    quotaEnforcement: boolean;
    globalLimits: GlobalDataLimits;
    classificationLimits: Record<DataClassificationLevel, DataRetrievalLimits>;
    alertThresholds: AlertThresholds;
    exemptions: DataAccessExemption[];
}
export interface GlobalDataLimits {
    maxConcurrentUsers: number;
    maxDailyBytes: number;
    maxDailyRecords: number;
    maxRequestRate: number;
    emergencyThrottle: {
        enabled: boolean;
        thresholdCpuPercent: number;
        thresholdMemoryPercent: number;
        throttlePercent: number;
    };
}
export interface AlertThresholds {
    volumeSpike: {
        percentIncrease: number;
        timeWindow: number;
    };
    userQuotaUsage: {
        warningPercent: number;
        criticalPercent: number;
    };
    classificationAccess: {
        restrictedAccessCount: number;
        timeWindow: number;
    };
    anomalyScore: {
        warningThreshold: number;
        criticalThreshold: number;
    };
}
export interface DataAccessExemption {
    id: string;
    userId?: string;
    role?: string;
    ipAddress?: string;
    reason: string;
    exemptionType: 'RATE_LIMIT' | 'QUOTA' | 'CLASSIFICATION' | 'TIME_RESTRICTION';
    expiresAt?: Date;
    conditions: ExemptionCondition[];
    approvedBy: string;
    approvedAt: Date;
    auditRequired: boolean;
}
export interface ExemptionCondition {
    type: 'TIME_RANGE' | 'OPERATION' | 'CLASSIFICATION' | 'EMERGENCY' | 'BUSINESS_CRITICAL';
    specification: Record<string, any>;
    required: boolean;
}
/**
 * Enhanced Data Retrieval Rate Limiting Service
 */
export declare class DataRetrievalRateLimit extends EventEmitter {
    private rateLimitingService;
    private config;
    private accessHistory;
    private userQuotas;
    private metrics;
    private exemptions;
    constructor(rateLimitingService: RateLimitingService, config: DataRetrievalConfig);
    /**
     * Check if data retrieval request is allowed
     */
    checkDataRetrievalLimit(
      subject: SubjectAttributes,
      object: ObjectAttributes,
      operation: DataOperation,
      requestDetails: DataRequestDetails
    ): Promise<DataRetrievalDecision>;
    /**
     * Get current usage metrics
     */
    getMetrics(): RetrievalMetrics;
    /**
     * Get user-specific usage data
     */
    getUserUsage(userId: string): UserDataUsage | null;
    /**
     * Add or update exemption
     */
    addExemption(exemption: DataAccessExemption): void;
    /**
     * Remove exemption
     */
    removeExemption(exemptionId: string): boolean;
    /**
     * Reset user quota
     */
    resetUserQuota(userId: string): void;
    private checkRateLimits;
    private checkVolumeLimits;
    private checkQuotaLimits;
    private checkForAnomalies;
    private checkForWarnings;
    private getApplicableLimits;
    private applyAdaptiveFactors;
    private getDefaultLimits;
    private initializeMetrics;
    private loadExemptions;
    private startPeriodicTasks;
    private recordAccess;
    private createDecision;
    private checkExemptions;
    private updateUserQuota;
    private getEndpointFromOperation;
    private getTypicalRequestSize;
    private isClassificationEscalation;
    private calculateAnomalyScore;
    private initializeUserQuota;
    private getSecondsUntilMidnight;
}
export interface DataRequestDetails {
    operation: DataOperation;
    estimatedBytes: number;
    estimatedRecords: number;
    requestType: 'SINGLE' | 'BATCH' | 'STREAM';
    context: Record<string, any>;
}
export interface DataRetrievalDecision {
    decision: 'ALLOW' | 'DENY';
    reason: string;
    exemptionId?: string;
    retryAfter?: number;
    warnings?: string[];
    quotaRemaining?: {
        bytes: number;
        records: number;
        requests: number;
    };
    metadata: {
        timestamp: Date;
        evaluationTime: number;
        appliedLimits: string[];
    };
}
export interface UserQuota {
    userId: string;
    dailyByteLimit: number;
    dailyRecordLimit: number;
    dailyRequestLimit: number;
    bytesUsed: number;
    recordsUsed: number;
    requestsUsed: number;
    resetAt: Date;
    lastUpdated: Date;
}
export interface AnomalyCheck {
    isAnomalous: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    evidence: Record<string, any>;
}
export default DataRetrievalRateLimit;
//# sourceMappingURL=DataRetrievalRateLimit.d.ts.map