/**
 * AuditLogger - Comprehensive audit logging for data access
 *
 * Provides detailed logging of all data access operations including:
 * - Who accessed the data (user/system identity)
 * - What data was accessed (classification level, identifiers)
 * - When the access occurred (timestamps)
 * - Where the access originated (IP, location, system)
 * - Why the access was made (purpose, authorization)
 * - How the data was accessed (operation type, method)
 *
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
declare class BrowserEventEmitter {
    private events;
    on(event: string, listener: Function): void;
    emit(event: string, ...args: unknown[]): void;
    removeAllListeners(): void;
}
import { DataClassificationLevel, type OperationContext } from '../types/DataClassification';
/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    correlationId: string;
    userId: string;
    userRole?: string;
    systemId?: string;
    serviceAccount?: boolean;
    operation: AuditOperation;
    resourceType: string;
    resourceId: string;
    dataClassification: DataClassificationLevel;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    sessionId?: string;
    authorized: boolean;
    authorizationMethod?: string;
    permissions?: string[];
    denialReason?: string;
    dataSize?: number;
    recordCount?: number;
    fields?: string[];
    filters?: Record<string, unknown>;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    duration?: number;
    sensitiveAccess: boolean;
    anomalyDetected?: boolean;
    riskScore?: number;
    complianceFlags?: string[];
    retentionPolicy?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Types of operations that can be audited
 */
export declare enum AuditOperation {
    READ = "READ",
    WRITE = "WRITE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    EXPORT = "EXPORT",
    DOWNLOAD = "DOWNLOAD",
    GRANT_ACCESS = "GRANT_ACCESS",
    REVOKE_ACCESS = "REVOKE_ACCESS",
    CHANGE_CLASSIFICATION = "CHANGE_CLASSIFICATION",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    API_CALL = "API_CALL",
    BATCH_OPERATION = "BATCH_OPERATION",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",
    ENCRYPTION = "ENCRYPTION",
    DECRYPTION = "DECRYPTION"
}
/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
    storageBackend?: AuditStorageBackend;
    bufferSize?: number;
    flushInterval?: number;
    logLevel?: AuditLogLevel;
    includedOperations?: AuditOperation[];
    excludedOperations?: AuditOperation[];
    encryptLogs?: boolean;
    encryptionKey?: string;
    hashSensitiveData?: boolean;
    retentionDays?: number;
    archiveOldLogs?: boolean;
    asyncLogging?: boolean;
    compressionEnabled?: boolean;
    alertOnAnomaly?: boolean;
    alertThresholds?: AlertThresholds;
}
/**
 * Storage backend interface
 */
export interface AuditStorageBackend {
    write(entry: AuditLogEntry): Promise<void>;
    query(criteria: AuditQueryCriteria): Promise<AuditLogEntry[]>;
    delete(id: string): Promise<void>;
    rotate(): Promise<void>;
}
/**
 * Query criteria for retrieving audit logs
 */
export interface AuditQueryCriteria {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    operation?: AuditOperation;
    resourceType?: string;
    resourceId?: string;
    dataClassification?: DataClassificationLevel;
    success?: boolean;
    limit?: number;
    offset?: number;
}
/**
 * Alert threshold configuration
 */
export interface AlertThresholds {
    failedAccessAttempts?: number;
    sensitiveDataAccess?: number;
    highRiskOperations?: number;
    timeWindow?: number;
}
/**
 * Audit log levels
 */
export declare enum AuditLogLevel {
    MINIMAL = "MINIMAL",// Only critical operations
    STANDARD = "STANDARD",// Standard compliance logging
    DETAILED = "DETAILED",// Detailed operational logging
    VERBOSE = "VERBOSE"
}
/**
 * Main audit logger implementation
 */
export declare class AuditLogger extends BrowserEventEmitter {
    private config;
    private buffer;
    private flushTimer?;
    private storageBackend;
    private operationMetrics;
    constructor(config?: AuditLoggerConfig);
    /**
     * Log a data access operation
     */
    logDataAccess(context: OperationContext, resourceType: string, resourceId: string, classification: DataClassificationLevel, success: boolean, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log a generic operation
     */
    log(entry: Partial<AuditLogEntry>): Promise<void>;
    /**
     * Query audit logs
     */
    query(criteria: AuditQueryCriteria): Promise<AuditLogEntry[]>;
    /**
     * Flush buffered entries
     */
    flush(): Promise<void>;
    /**
     * Get audit statistics
     */
    getStatistics(): AuditStatistics;
    /**
     * Apply security transformations to log entry
     */
    private applySecurityTransforms;
    /**
     * Check for anomalous patterns
     */
    private checkForAnomalies;
    /**
     * Write entry to storage
     */
    private writeEntry;
    /**
     * Update operation metrics
     */
    private updateMetrics;
    /**
     * Check if operation should be skipped
     */
    private shouldSkipOperation;
    /**
     * Check if access is sensitive
     */
    private isSensitiveAccess;
    /**
     * Generate unique audit ID
     */
    private generateAuditId;
    /**
     * Generate correlation ID
     */
    private generateCorrelationId;
    /**
     * Hash sensitive data
     */
    private hashData;
    /**
     * Start flush timer
     */
    private startFlushTimer;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
/**
 * Audit statistics structure
 */
export interface AuditStatistics {
    totalOperations: number;
    operationCounts: Record<string, number>;
    failureRate: number;
    sensitiveAccessCount: number;
    averageResponseTime: number;
}
/**
 * Simple in-memory storage backend for testing
 */
export declare class InMemoryStorageBackend implements AuditStorageBackend {
    private logs;
    write(entry: AuditLogEntry): Promise<void>;
    query(criteria: AuditQueryCriteria): Promise<AuditLogEntry[]>;
    delete(id: string): Promise<void>;
    rotate(): Promise<void>;
}
/**
 * Factory function to create audit logger
 */
export declare function createAuditLogger(config?: AuditLoggerConfig): AuditLogger;
export {};
//# sourceMappingURL=AuditLogger.d.ts.map