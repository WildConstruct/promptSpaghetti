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
import { RateLimitingService } from './RateLimitingService';
import { DataOperation } from './DataClassificationAccessControl';
import { DataClassificationLevel } from '../types/DataClassification';
export declare enum DataEndpointCategory {
    DATA_READ = "data_read",
    DATA_EXPORT = "data_export",
    DATA_SEARCH = "data_search",
    DATA_BULK_ACCESS = "data_bulk_access",
    DATA_STREAM = "data_stream",
    DATA_ANALYTICS = "data_analytics",
    DATA_BACKUP = "data_backup",
    DATA_SYNC = "data_sync",
    export,
    interface,
    DataRetrievalLimits
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
    topDataUsers: UserDataUsage;
    classificationBreakdown: Record<DataClassificationLevel, number>;
    operationBreakdown: Record<DataOperation, number>;
    peakUsageTimes: TimeUsagePattern;
    suspiciousActivity: SuspiciousActivity;
}
export interface UserDataUsage {
    userId: string;
    requestCount: number;
    bytesAccessed: number;
    recordsAccessed: number;
    classificationsAccessed: DataClassificationLevel;
    lastAccess: Date;
    riskScore: number;
    anomalyScore: number;
}
export interface TimeUsagePattern {
    hour: number;
    dayOfWeek: number;
    requestCount: number;
    averageRiskScore: number;
    topOperations: DataOperation;
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
    exemptions: DataAccessExemption;
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
    conditions: ExemptionCondition;
    approvedBy: string;
    approvedAt: Date;
    auditRequired: boolean;
}
export interface ExemptionCondition {
    type: 'TIME_RANGE' | 'OPERATION' | 'CLASSIFICATION' | 'EMERGENCY' | 'BUSINESS_CRITICAL';
    specification: Record<string, any>;
    required: boolean;
}
export declare class DataRetrievalRateLimit extends EventEmitter {
    private rateLimitingService;
    private config;
    private accessHistory;
    private userQuotas;
    private metrics;
    private exemptions;
    constructor();
    rateLimitingService: RateLimitingService;
    config: DataRetrievalConfig;
    super(): any;
}
//# sourceMappingURL=DataRetrievalRateLimit.d.ts.map