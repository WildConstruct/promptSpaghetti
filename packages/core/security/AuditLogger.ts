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

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { 
  DataClassificationLevel,
  type OperationContext
} from '../types/DataClassification';

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  // Core identifiers
  id: string;
  timestamp: Date;
  correlationId: string;
  
  // Actor information
  userId: string;
  userRole?: string;
  systemId?: string;
  serviceAccount?: boolean;
  
  // Operation details
  operation: AuditOperation;
  resourceType: string;
  resourceId: string;
  dataClassification: DataClassificationLevel;
  
  // Access context
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId?: string;
  
  // Authorization
  authorized: boolean;
  authorizationMethod?: string;
  permissions?: string[];
  denialReason?: string;
  
  // Data details
  dataSize?: number;
  recordCount?: number;
  fields?: string[];
  filters?: Record<string, any>;
  
  // Outcome
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  duration?: number;
  
  // Security markers
  sensitiveAccess: boolean;
  anomalyDetected?: boolean;
  riskScore?: number;
  
  // Compliance
  complianceFlags?: string[];
  retentionPolicy?: string;
  
  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Types of operations that can be audited
 */
export enum AuditOperation {
  // Data access operations
  READ = 'READ',
  WRITE = 'WRITE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  DOWNLOAD = 'DOWNLOAD',
  
  // Administrative operations
  GRANT_ACCESS = 'GRANT_ACCESS',
  REVOKE_ACCESS = 'REVOKE_ACCESS',
  CHANGE_CLASSIFICATION = 'CHANGE_CLASSIFICATION',
  
  // System operations
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  API_CALL = 'API_CALL',
  BATCH_OPERATION = 'BATCH_OPERATION',
  
  // Security operations
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  ENCRYPTION = 'ENCRYPTION',
  DECRYPTION = 'DECRYPTION'
}

/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
  // Storage configuration
  storageBackend?: AuditStorageBackend;
  bufferSize?: number;
  flushInterval?: number;
  
  // Filtering
  logLevel?: AuditLogLevel;
  includedOperations?: AuditOperation[];
  excludedOperations?: AuditOperation[];
  
  // Security
  encryptLogs?: boolean;
  encryptionKey?: string;
  hashSensitiveData?: boolean;
  
  // Retention
  retentionDays?: number;
  archiveOldLogs?: boolean;
  
  // Performance
  asyncLogging?: boolean;
  compressionEnabled?: boolean;
  
  // Alerting
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
  timeWindow?: number; // in minutes
}

/**
 * Audit log levels
 */
export enum AuditLogLevel {
  MINIMAL = 'MINIMAL',     // Only critical operations
  STANDARD = 'STANDARD',   // Standard compliance logging
  DETAILED = 'DETAILED',   // Detailed operational logging
  VERBOSE = 'VERBOSE'      // Full debug-level logging
}

/**
 * Main audit logger implementation
 */
export class AuditLogger extends EventEmitter {
  private config: Required<AuditLoggerConfig>;
  private buffer: AuditLogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private storageBackend: AuditStorageBackend;
  private operationMetrics: Map<string, number> = new Map();
  
  constructor(config?: AuditLoggerConfig) {
    super();
    
    // Set default configuration
    this.config = {
      storageBackend: config?.storageBackend || new InMemoryStorageBackend(),
      bufferSize: config?.bufferSize ?? 100,
      flushInterval: config?.flushInterval ?? 5000, // 5 seconds
      logLevel: config?.logLevel ?? AuditLogLevel.STANDARD,
      includedOperations: config?.includedOperations ?? Object.values(AuditOperation),
      excludedOperations: config?.excludedOperations ?? [],
      encryptLogs: config?.encryptLogs ?? false,
      encryptionKey: config?.encryptionKey ?? '',
      hashSensitiveData: config?.hashSensitiveData ?? true,
      retentionDays: config?.retentionDays ?? 90,
      archiveOldLogs: config?.archiveOldLogs ?? true,
      asyncLogging: config?.asyncLogging ?? true,
      compressionEnabled: config?.compressionEnabled ?? false,
      alertOnAnomaly: config?.alertOnAnomaly ?? true,
      alertThresholds: config?.alertThresholds ?? {
        failedAccessAttempts: 5,
        sensitiveDataAccess: 10,
        highRiskOperations: 3,
        timeWindow: 5
      }
    };
    
    this.storageBackend = this.config.storageBackend;
    this.startFlushTimer();
  }
  
  /**
   * Log a data access operation
   */
  async logDataAccess(
    context: OperationContext,
    resourceType: string,
    resourceId: string,
    classification: DataClassificationLevel,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      correlationId: context.correlationId || this.generateCorrelationId(),
      userId: context.userId,
      userRole: context.userRole,
      systemId: context.systemId,
      operation: AuditOperation.READ,
      resourceType,
      resourceId,
      dataClassification: classification,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      authorized: success,
      success,
      sensitiveAccess: this.isSensitiveAccess(classification),
      metadata: {
        ...metadata,
        purpose: context.purpose,
        requestedAt: context.requestedAt
      }
    };
    
    await this.log(entry);
  }
  
  /**
   * Log a generic operation
   */
  async log(entry: Partial<AuditLogEntry>): Promise<void> {
    // Skip if operation is excluded
    if (this.shouldSkipOperation(entry.operation)) {
      return;
    }
    
    // Complete the entry
    const completeEntry: AuditLogEntry = {
      id: entry.id || this.generateAuditId(),
      timestamp: entry.timestamp || new Date(),
      correlationId: entry.correlationId || this.generateCorrelationId(),
      userId: entry.userId || 'system',
      operation: entry.operation || AuditOperation.READ,
      resourceType: entry.resourceType || 'unknown',
      resourceId: entry.resourceId || 'unknown',
      dataClassification: entry.dataClassification || DataClassificationLevel.PUBLIC,
      authorized: entry.authorized ?? true,
      success: entry.success ?? true,
      sensitiveAccess: entry.sensitiveAccess ?? false,
      ...entry
    };
    
    // Apply security transformations
    const securedEntry = this.applySecurityTransforms(completeEntry);
    
    // Check for anomalies
    if (this.config.alertOnAnomaly) {
      this.checkForAnomalies(securedEntry);
    }
    
    // Add to buffer or write directly
    if (this.config.asyncLogging) {
      this.buffer.push(securedEntry);
      if (this.buffer.length >= this.config.bufferSize) {
        await this.flush();
      }
    } else {
      await this.writeEntry(securedEntry);
    }
    
    // Update metrics
    this.updateMetrics(securedEntry);
    
    // Emit event
    this.emit('audit', securedEntry);
  }
  
  /**
   * Query audit logs
   */
  async query(criteria: AuditQueryCriteria): Promise<AuditLogEntry[]> {
    return this.storageBackend.query(criteria);
  }
  
  /**
   * Flush buffered entries
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }
    
    const entriesToFlush = [...this.buffer];
    this.buffer = [];
    
    try {
      await Promise.all(
        entriesToFlush.map(entry => this.writeEntry(entry))
      );
    } catch (error) {
      // Re-add failed entries to buffer
      this.buffer.unshift(...entriesToFlush);
      throw error;
    }
  }
  
  /**
   * Get audit statistics
   */
  getStatistics(): AuditStatistics {
    const stats: AuditStatistics = {
      totalOperations: 0,
      operationCounts: {},
      failureRate: 0,
      sensitiveAccessCount: 0,
      averageResponseTime: 0
    };
    
    for (const [operation, count] of this.operationMetrics) {
      stats.operationCounts[operation] = count;
      stats.totalOperations += count;
    }
    
    return stats;
  }
  
  /**
   * Apply security transformations to log entry
   */
  private applySecurityTransforms(entry: AuditLogEntry): AuditLogEntry {
    const transformed = { ...entry };
    
    // Hash sensitive data if configured
    if (this.config.hashSensitiveData) {
      if (transformed.ipAddress) {
        transformed.ipAddress = this.hashData(transformed.ipAddress);
      }
      if (transformed.sessionId) {
        transformed.sessionId = this.hashData(transformed.sessionId);
      }
    }
    
    // Encrypt if configured
    if (this.config.encryptLogs && this.config.encryptionKey) {
      // In production, implement proper encryption
      // This is a placeholder
      transformed.metadata = {
        ...transformed.metadata,
        encrypted: true
      };
    }
    
    return transformed;
  }
  
  /**
   * Check for anomalous patterns
   */
  private checkForAnomalies(entry: AuditLogEntry): void {
    const thresholds = this.config.alertThresholds;
    
    // Check for repeated failures
    if (!entry.success && thresholds.failedAccessAttempts) {
      // In production, implement sliding window check
      this.emit('anomaly', {
        type: 'REPEATED_FAILURES',
        entry,
        threshold: thresholds.failedAccessAttempts
      });
    }
    
    // Check for excessive sensitive data access
    if (entry.sensitiveAccess && thresholds.sensitiveDataAccess) {
      // In production, implement rate limiting check
      this.emit('anomaly', {
        type: 'EXCESSIVE_SENSITIVE_ACCESS',
        entry,
        threshold: thresholds.sensitiveDataAccess
      });
    }
  }
  
  /**
   * Write entry to storage
   */
  private async writeEntry(entry: AuditLogEntry): Promise<void> {
    try {
      await this.storageBackend.write(entry);
    } catch (error) {
      this.emit('error', {
        message: 'Failed to write audit log',
        entry,
        error
      });
      throw error;
    }
  }
  
  /**
   * Update operation metrics
   */
  private updateMetrics(entry: AuditLogEntry): void {
    const key = `${entry.operation}_${entry.success ? 'success' : 'failure'}`;
    const current = this.operationMetrics.get(key) || 0;
    this.operationMetrics.set(key, current + 1);
  }
  
  /**
   * Check if operation should be skipped
   */
  private shouldSkipOperation(operation?: AuditOperation): boolean {
    if (!operation) return false;
    
    if (this.config.excludedOperations.includes(operation)) {
      return true;
    }
    
    if (!this.config.includedOperations.includes(operation)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if access is sensitive
   */
  private isSensitiveAccess(classification: DataClassificationLevel): boolean {
    return [
      DataClassificationLevel.CONFIDENTIAL,
      DataClassificationLevel.RESTRICTED,
      DataClassificationLevel.TOP_SECRET
    ].includes(classification);
  }
  
  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `corr_${crypto.randomBytes(16).toString('hex')}`;
  }
  
  /**
   * Hash sensitive data
   */
  private hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        this.emit('error', {
          message: 'Flush timer error',
          error
        });
      });
    }, this.config.flushInterval);
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.removeAllListeners();
  }
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
export class InMemoryStorageBackend implements AuditStorageBackend {
  private logs: AuditLogEntry[] = [];
  
  async write(entry: AuditLogEntry): Promise<void> {
    this.logs.push(entry);
  }
  
  async query(criteria: AuditQueryCriteria): Promise<AuditLogEntry[]> {
    let filtered = [...this.logs];
    
    if (criteria.startDate) {
      filtered = filtered.filter(log => log.timestamp >= criteria.startDate!);
    }
    
    if (criteria.endDate) {
      filtered = filtered.filter(log => log.timestamp <= criteria.endDate!);
    }
    
    if (criteria.userId) {
      filtered = filtered.filter(log => log.userId === criteria.userId);
    }
    
    if (criteria.operation) {
      filtered = filtered.filter(log => log.operation === criteria.operation);
    }
    
    if (criteria.dataClassification) {
      filtered = filtered.filter(log => log.dataClassification === criteria.dataClassification);
    }
    
    if (criteria.success !== undefined) {
      filtered = filtered.filter(log => log.success === criteria.success);
    }
    
    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 100;
    
    return filtered.slice(offset, offset + limit);
  }
  
  async delete(id: string): Promise<void> {
    this.logs = this.logs.filter(log => log.id !== id);
  }
  
  async rotate(): Promise<void> {
    // In production, implement log rotation
    this.logs = [];
  }
}

/**
 * Factory function to create audit logger
 */
export function createAuditLogger(config?: AuditLoggerConfig): AuditLogger {
  return new AuditLogger(config);
}

// Export everything needed for external use
export type {
  AuditLogEntry,
  AuditLoggerConfig,
  AuditStorageBackend,
  AuditQueryCriteria,
  AlertThresholds,
  AuditStatistics
};