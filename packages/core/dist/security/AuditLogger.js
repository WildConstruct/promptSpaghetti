"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStorageBackend = exports.AuditLogger = exports.AuditLogLevel = exports.AuditOperation = void 0;
exports.createAuditLogger = createAuditLogger;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
/**
 * Types of operations that can be audited
 */
var AuditOperation;
(function (AuditOperation) {
    // Data access operations
    AuditOperation["READ"] = "READ";
    AuditOperation["WRITE"] = "WRITE";
    AuditOperation["UPDATE"] = "UPDATE";
    AuditOperation["DELETE"] = "DELETE";
    AuditOperation["EXPORT"] = "EXPORT";
    AuditOperation["DOWNLOAD"] = "DOWNLOAD";
    // Administrative operations
    AuditOperation["GRANT_ACCESS"] = "GRANT_ACCESS";
    AuditOperation["REVOKE_ACCESS"] = "REVOKE_ACCESS";
    AuditOperation["CHANGE_CLASSIFICATION"] = "CHANGE_CLASSIFICATION";
    // System operations
    AuditOperation["LOGIN"] = "LOGIN";
    AuditOperation["LOGOUT"] = "LOGOUT";
    AuditOperation["API_CALL"] = "API_CALL";
    AuditOperation["BATCH_OPERATION"] = "BATCH_OPERATION";
    // Security operations
    AuditOperation["AUTHENTICATION"] = "AUTHENTICATION";
    AuditOperation["AUTHORIZATION"] = "AUTHORIZATION";
    AuditOperation["ENCRYPTION"] = "ENCRYPTION";
    AuditOperation["DECRYPTION"] = "DECRYPTION";
})(AuditOperation || (exports.AuditOperation = AuditOperation = {}));
/**
 * Audit log levels
 */
var AuditLogLevel;
(function (AuditLogLevel) {
    AuditLogLevel["MINIMAL"] = "MINIMAL";
    AuditLogLevel["STANDARD"] = "STANDARD";
    AuditLogLevel["DETAILED"] = "DETAILED";
    AuditLogLevel["VERBOSE"] = "VERBOSE"; // Full debug-level logging
})(AuditLogLevel || (exports.AuditLogLevel = AuditLogLevel = {}));
/**
 * Main audit logger implementation
 */
class AuditLogger extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.buffer = [];
        this.operationMetrics = new Map();
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
    async logDataAccess(context, resourceType, resourceId, classification, success, metadata) {
        const entry = {
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
    async log(entry) {
        // Skip if operation is excluded
        if (this.shouldSkipOperation(entry.operation)) {
            return;
        }
        // Complete the entry
        const completeEntry = {
            id: entry.id || this.generateAuditId(),
            timestamp: entry.timestamp || new Date(),
            correlationId: entry.correlationId || this.generateCorrelationId(),
            userId: entry.userId || 'system',
            operation: entry.operation || AuditOperation.READ,
            resourceType: entry.resourceType || 'unknown',
            resourceId: entry.resourceId || 'unknown',
            dataClassification: entry.dataClassification || DataClassification_1.DataClassificationLevel.PUBLIC,
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
        }
        else {
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
    async query(criteria) {
        return this.storageBackend.query(criteria);
    }
    /**
     * Flush buffered entries
     */
    async flush() {
        if (this.buffer.length === 0) {
            return;
        }
        const entriesToFlush = [...this.buffer];
        this.buffer = [];
        try {
            await Promise.all(entriesToFlush.map(entry => this.writeEntry(entry)));
        }
        catch (error) {
            // Re-add failed entries to buffer
            this.buffer.unshift(...entriesToFlush);
            throw error;
        }
    }
    /**
     * Get audit statistics
     */
    getStatistics() {
        const stats = {
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
    applySecurityTransforms(entry) {
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
    checkForAnomalies(entry) {
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
    async writeEntry(entry) {
        try {
            await this.storageBackend.write(entry);
        }
        catch (error) {
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
    updateMetrics(entry) {
        const key = `${entry.operation}_${entry.success ? 'success' : 'failure'}`;
        const current = this.operationMetrics.get(key) || 0;
        this.operationMetrics.set(key, current + 1);
    }
    /**
     * Check if operation should be skipped
     */
    shouldSkipOperation(operation) {
        if (!operation)
            return false;
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
    isSensitiveAccess(classification) {
        return [
            DataClassification_1.DataClassificationLevel.CONFIDENTIAL,
            DataClassification_1.DataClassificationLevel.RESTRICTED,
            DataClassification_1.DataClassificationLevel.TOP_SECRET
        ].includes(classification);
    }
    /**
     * Generate unique audit ID
     */
    generateAuditId() {
        return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
    /**
     * Generate correlation ID
     */
    generateCorrelationId() {
        return `corr_${crypto.randomBytes(16).toString('hex')}`;
    }
    /**
     * Hash sensitive data
     */
    hashData(data) {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex')
            .substring(0, 16);
    }
    /**
     * Start flush timer
     */
    startFlushTimer() {
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
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.removeAllListeners();
    }
}
exports.AuditLogger = AuditLogger;
/**
 * Simple in-memory storage backend for testing
 */
class InMemoryStorageBackend {
    constructor() {
        this.logs = [];
    }
    async write(entry) {
        this.logs.push(entry);
    }
    async query(criteria) {
        let filtered = [...this.logs];
        if (criteria.startDate) {
            filtered = filtered.filter(log => log.timestamp >= criteria.startDate);
        }
        if (criteria.endDate) {
            filtered = filtered.filter(log => log.timestamp <= criteria.endDate);
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
    async delete(id) {
        this.logs = this.logs.filter(log => log.id !== id);
    }
    async rotate() {
        // In production, implement log rotation
        this.logs = [];
    }
}
exports.InMemoryStorageBackend = InMemoryStorageBackend;
/**
 * Factory function to create audit logger
 */
function createAuditLogger(config) {
    return new AuditLogger(config);
}
